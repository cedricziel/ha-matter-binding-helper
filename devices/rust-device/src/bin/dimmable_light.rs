//! Dimmable Light - A Matter device with On/Off, Level Control, and Binding clusters.
//!
//! This device can be commissioned into a Matter fabric and supports:
//! - On/Off control
//! - Dimming (Level Control)
//! - Binding to other devices

use core::cell::Cell;
use core::pin::pin;

use std::net::UdpSocket;
use std::path::PathBuf;

use embassy_futures::select::{select3, select4};
use embassy_sync::blocking_mutex::raw::NoopRawMutex;

use async_signal::{Signal, Signals};
use futures_lite::StreamExt;
use log::info;

use rs_matter::dm::clusters::decl::level_control::{
    AttributeId as LevelAttributeId, CommandId as LevelCommandId, OptionsBitmap,
    FULL_CLUSTER as LEVEL_CONTROL_FULL_CLUSTER,
};
use rs_matter::dm::clusters::decl::on_off as on_off_cluster;
use rs_matter::dm::clusters::desc::{self, ClusterHandler as _};
use rs_matter::dm::clusters::level_control::{self, LevelControlHooks};
use rs_matter::dm::clusters::net_comm::NetworkType;
use rs_matter::dm::clusters::on_off::{self, OnOffHooks, StartUpOnOffEnum};
use rs_matter::dm::devices::test::{TEST_DEV_ATT, TEST_DEV_COMM, TEST_DEV_DET};
use rs_matter::dm::devices::DEV_TYPE_DIMMABLE_LIGHT;
use rs_matter::dm::endpoints;
use matter_virtual_device::FilteredNetifs;
use rs_matter::dm::subscriptions::DefaultSubscriptions;
use rs_matter::dm::IMBuffer;
use rs_matter::dm::{
    Async, AsyncHandler, AsyncMetadata, Cluster, DataModel, Dataver, EmptyHandler, Endpoint,
    EpClMatcher, Node,
};
use rs_matter::error::Error;
use rs_matter::pairing::qr::QrTextType;
use rs_matter::pairing::DiscoveryCapabilities;
use rs_matter::persist::{Psm, NO_NETWORKS};
use rs_matter::respond::DefaultResponder;
use rs_matter::sc::pake::MAX_COMM_WINDOW_TIMEOUT_SECS;
use rs_matter::tlv::Nullable;
use rs_matter::transport::MATTER_SOCKET_BIND_ADDR;
use rs_matter::utils::init::InitMaybeUninit;
use rs_matter::utils::select::Coalesce;
use rs_matter::utils::storage::pooled::PooledBuffers;
use rs_matter::{clusters, devices, with, Matter, MATTER_PORT};

use static_cell::StaticCell;

use matter_virtual_device::clusters::BindingHandler;
use matter_virtual_device::config::DeviceConfig;
use matter_virtual_device::mdns;

// Statically allocate larger objects in BSS
static MATTER: StaticCell<Matter> = StaticCell::new();
static BUFFERS: StaticCell<PooledBuffers<10, NoopRawMutex, IMBuffer>> = StaticCell::new();
static SUBSCRIPTIONS: StaticCell<DefaultSubscriptions> = StaticCell::new();
static PSM: StaticCell<Psm<4096>> = StaticCell::new();

fn main() -> Result<(), Error> {
    // rs-matter requires a larger stack
    let thread = std::thread::Builder::new()
        .stack_size(550 * 1024)
        .spawn(run)
        .unwrap();

    thread.join().unwrap()
}

fn run() -> Result<(), Error> {
    // Initialize logging
    env_logger::init_from_env(
        env_logger::Env::default().filter_or(env_logger::DEFAULT_FILTER_ENV, "info"),
    );

    // Parse configuration from CLI/env
    let config = DeviceConfig::parse_config();

    info!("╔═══════════════════════════════════════════════════════════╗");
    info!("║          Matter Dimmable Light Device                     ║");
    info!("╠═══════════════════════════════════════════════════════════╣");
    info!("║ Device Name:    {:<40} ║", config.name);
    info!("║ Discriminator:  {:<40} ║", config.discriminator);
    info!("║ Passcode:       {:<40} ║", config.passcode);
    info!("║ Port:           {:<40} ║", config.port);
    info!("║ Persist Path:   {:<40} ║", config.persist_path);
    info!("╚═══════════════════════════════════════════════════════════╝");

    info!(
        "Matter memory: Matter={}B, IM Buffers={}B, Subscriptions={}B",
        core::mem::size_of::<Matter>(),
        core::mem::size_of::<PooledBuffers<10, NoopRawMutex, IMBuffer>>(),
        core::mem::size_of::<DefaultSubscriptions>()
    );

    // Initialize Matter instance with test device credentials
    // TODO: Use config for custom vendor/product IDs
    let matter = MATTER.uninit().init_with(Matter::init(
        &TEST_DEV_DET,
        TEST_DEV_COMM,
        &TEST_DEV_ATT,
        rs_matter::utils::epoch::sys_epoch,
        rs_matter::utils::rand::sys_rand,
        MATTER_PORT,
    ));

    matter.initialize_transport_buffers()?;

    // Create transport buffers and subscriptions
    let buffers = BUFFERS.uninit().init_with(PooledBuffers::init(0));
    let subscriptions = SUBSCRIPTIONS
        .uninit()
        .init_with(DefaultSubscriptions::init());

    // Create cluster handlers for endpoint 1
    let on_off_handler =
        on_off::OnOffHandler::new(Dataver::new_rand(matter.rand()), 1, OnOffDeviceLogic::new());

    let level_control_handler = level_control::LevelControlHandler::new(
        Dataver::new_rand(matter.rand()),
        1,
        LevelControlDeviceLogic::new(),
        level_control::AttributeDefaults {
            on_level: Nullable::some(42),
            options: OptionsBitmap::from_bits(OptionsBitmap::EXECUTE_IF_OFF.bits()).unwrap(),
            ..Default::default()
        },
    );

    let binding_handler = BindingHandler::new(Dataver::new_rand(matter.rand()), 1);

    // Wire up coupled cluster handlers
    on_off_handler.init(Some(&level_control_handler));
    level_control_handler.init(Some(&on_off_handler));

    // Create the Data Model
    let dm = DataModel::new(
        matter,
        buffers,
        subscriptions,
        dm_handler(
            matter,
            &on_off_handler,
            &level_control_handler,
            &binding_handler,
        ),
    );

    // Create responder for handling Matter exchanges
    let responder = DefaultResponder::new(&dm);

    let mut respond = pin!(responder.run::<4, 4>());
    let mut dm_job = pin!(dm.run());

    // Bind UDP socket for Matter transport
    let socket = async_io::Async::<UdpSocket>::bind(MATTER_SOCKET_BIND_ADDR)?;

    // Run Matter transport and mDNS
    let mut mdns = pin!(mdns::run_mdns(matter));
    let mut transport = pin!(matter.run(&socket, &socket));

    // Setup persistence
    let psm = PSM.uninit().init_with(Psm::init());
    let path = PathBuf::from(&config.persist_path);

    info!("Persist path: {}", path.display());

    psm.load(&path, matter, NO_NETWORKS)?;

    // Print commissioning info
    info!("");
    info!("┌─────────────────────────────────────────┐");
    info!("│           COMMISSIONING INFO            │");
    info!("├─────────────────────────────────────────┤");

    matter.print_standard_qr_text(DiscoveryCapabilities::IP)?;

    if !matter.is_commissioned() {
        matter.print_standard_qr_code(QrTextType::Unicode, DiscoveryCapabilities::IP)?;
        matter.open_basic_comm_window(MAX_COMM_WINDOW_TIMEOUT_SECS)?;
        info!("│ Device is NOT commissioned              │");
        info!("│ Commissioning window is OPEN            │");
    } else {
        info!("│ Device is already commissioned          │");
    }
    info!("└─────────────────────────────────────────┘");
    info!("");

    let mut persist = pin!(psm.run(&path, matter, NO_NETWORKS));

    // Handle SIGTERM for graceful shutdown
    let mut term_signal = Signals::new([Signal::Term])?;
    let mut term = pin!(async {
        term_signal.next().await;
        info!("Received SIGTERM, shutting down...");
        Ok(())
    });

    // Run all async tasks
    let all = select4(
        &mut transport,
        &mut mdns,
        &mut persist,
        select3(&mut respond, &mut dm_job, &mut term).coalesce(),
    );

    futures_lite::future::block_on(all.coalesce())
}

/// Node metadata describing our Matter device endpoints and clusters.
const NODE: Node<'static> = Node {
    id: 0,
    endpoints: &[
        endpoints::root_endpoint(NetworkType::Ethernet),
        Endpoint {
            id: 1,
            device_types: devices!(DEV_TYPE_DIMMABLE_LIGHT),
            clusters: clusters!(
                desc::DescHandler::CLUSTER,
                OnOffDeviceLogic::CLUSTER,
                LevelControlDeviceLogic::CLUSTER,
                BindingHandler::CLUSTER,
            ),
        },
    ],
};

/// Data Model handler composition for all endpoints and clusters.
fn dm_handler<'a, LH: LevelControlHooks, OH: OnOffHooks>(
    matter: &'a Matter<'a>,
    on_off: &'a on_off::OnOffHandler<'a, OH, LH>,
    level_control: &'a level_control::LevelControlHandler<'a, LH, OH>,
    binding: &'a BindingHandler,
) -> impl AsyncMetadata + AsyncHandler + 'a {
    static FILTERED_NETIFS: FilteredNetifs = FilteredNetifs::new();

    (
        NODE,
        endpoints::with_eth(
            &(),
            &FILTERED_NETIFS,
            matter.rand(),
            endpoints::with_sys(
                &false,
                matter.rand(),
                EmptyHandler
                    .chain(
                        EpClMatcher::new(Some(1), Some(desc::DescHandler::CLUSTER.id)),
                        Async(desc::DescHandler::new(Dataver::new_rand(matter.rand())).adapt()),
                    )
                    .chain(
                        EpClMatcher::new(Some(1), Some(OnOffDeviceLogic::CLUSTER.id)),
                        on_off::HandlerAsyncAdaptor(on_off),
                    )
                    .chain(
                        EpClMatcher::new(Some(1), Some(LevelControlDeviceLogic::CLUSTER.id)),
                        level_control::HandlerAsyncAdaptor(level_control),
                    )
                    .chain(
                        EpClMatcher::new(Some(1), Some(BindingHandler::CLUSTER.id)),
                        Async(binding.adapt()),
                    ),
            ),
        ),
    )
}

// ============================================================================
// Level Control Device Logic
// ============================================================================

pub struct LevelControlDeviceLogic {
    current_level: Cell<Option<u8>>,
    start_up_current_level: Cell<Option<u8>>,
}

impl Default for LevelControlDeviceLogic {
    fn default() -> Self {
        Self::new()
    }
}

impl LevelControlDeviceLogic {
    pub const fn new() -> Self {
        Self {
            current_level: Cell::new(Some(100)),
            start_up_current_level: Cell::new(None),
        }
    }
}

impl LevelControlHooks for LevelControlDeviceLogic {
    const MIN_LEVEL: u8 = 1;
    const MAX_LEVEL: u8 = 254;
    const FASTEST_RATE: u8 = 50;
    const CLUSTER: Cluster<'static> = LEVEL_CONTROL_FULL_CLUSTER
        .with_features(level_control::Feature::LIGHTING.bits() | level_control::Feature::ON_OFF.bits())
        .with_attrs(with!(
            required;
            LevelAttributeId::CurrentLevel
            | LevelAttributeId::RemainingTime
            | LevelAttributeId::MinLevel
            | LevelAttributeId::MaxLevel
            | LevelAttributeId::OnOffTransitionTime
            | LevelAttributeId::OnLevel
            | LevelAttributeId::OnTransitionTime
            | LevelAttributeId::OffTransitionTime
            | LevelAttributeId::DefaultMoveRate
            | LevelAttributeId::Options
            | LevelAttributeId::StartUpCurrentLevel
        ))
        .with_cmds(with!(
            LevelCommandId::MoveToLevel
                | LevelCommandId::Move
                | LevelCommandId::Step
                | LevelCommandId::Stop
                | LevelCommandId::MoveToLevelWithOnOff
                | LevelCommandId::MoveWithOnOff
                | LevelCommandId::StepWithOnOff
                | LevelCommandId::StopWithOnOff
        ));

    fn set_device_level(&self, level: u8) -> Result<Option<u8>, ()> {
        info!("Setting device brightness to {}%", (level as f32 / 254.0 * 100.0) as u8);
        Ok(Some(level))
    }

    fn current_level(&self) -> Option<u8> {
        self.current_level.get()
    }

    fn set_current_level(&self, level: Option<u8>) {
        info!("Level changed to {:?}", level);
        self.current_level.set(level);
    }

    fn start_up_current_level(&self) -> Result<Option<u8>, Error> {
        Ok(self.start_up_current_level.get())
    }

    fn set_start_up_current_level(&self, value: Option<u8>) -> Result<(), Error> {
        self.start_up_current_level.set(value);
        Ok(())
    }
}

// ============================================================================
// On/Off Device Logic
// ============================================================================

#[derive(Default)]
pub struct OnOffDeviceLogic {
    on_off: Cell<bool>,
    start_up_on_off: Cell<Option<StartUpOnOffEnum>>,
}

impl OnOffDeviceLogic {
    pub fn new() -> Self {
        Self {
            on_off: Cell::new(false),
            start_up_on_off: Cell::new(None),
        }
    }
}

impl OnOffHooks for OnOffDeviceLogic {
    const CLUSTER: Cluster<'static> = on_off_cluster::FULL_CLUSTER
        .with_revision(6)
        .with_features(on_off_cluster::Feature::LIGHTING.bits())
        .with_attrs(with!(
            required;
            on_off_cluster::AttributeId::OnOff
            | on_off_cluster::AttributeId::GlobalSceneControl
            | on_off_cluster::AttributeId::OnTime
            | on_off_cluster::AttributeId::OffWaitTime
            | on_off_cluster::AttributeId::StartUpOnOff
        ))
        .with_cmds(with!(
            on_off_cluster::CommandId::Off
                | on_off_cluster::CommandId::On
                | on_off_cluster::CommandId::Toggle
                | on_off_cluster::CommandId::OffWithEffect
                | on_off_cluster::CommandId::OnWithRecallGlobalScene
                | on_off_cluster::CommandId::OnWithTimedOff
        ));

    fn on_off(&self) -> bool {
        self.on_off.get()
    }

    fn set_on_off(&self, on: bool) {
        self.on_off.set(on);
        info!("Light is now {}", if on { "ON" } else { "OFF" });
    }

    fn start_up_on_off(&self) -> Nullable<StartUpOnOffEnum> {
        match self.start_up_on_off.get() {
            Some(value) => Nullable::some(value),
            None => Nullable::none(),
        }
    }

    fn set_start_up_on_off(&self, value: Nullable<StartUpOnOffEnum>) -> Result<(), Error> {
        self.start_up_on_off.set(value.into_option());
        Ok(())
    }

    async fn handle_off_with_effect(&self, _effect: on_off::EffectVariantEnum) {
        // No effect implementation
    }
}

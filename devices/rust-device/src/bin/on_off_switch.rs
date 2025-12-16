//! On/Off Light Switch - A Matter controller device with Binding cluster.
//!
//! This device can be commissioned into a Matter fabric and supports:
//! - Binding to other devices (lights) to control them
//!
//! Device type 0x0103 (On/Off Light Switch) is a controller that sends
//! On/Off commands to devices listed in its Binding cluster.

use core::pin::pin;

use std::net::{Ipv6Addr, SocketAddr, SocketAddrV6, UdpSocket};
use std::path::PathBuf;

use embassy_futures::select::{select3, select4};
use embassy_sync::blocking_mutex::raw::NoopRawMutex;

use async_signal::{Signal, Signals};
use futures_lite::StreamExt;
use log::info;

use rs_matter::dm::clusters::desc::{self, ClusterHandler as _};
use rs_matter::dm::clusters::net_comm::NetworkType;
use rs_matter::dm::devices::test::{TEST_DEV_ATT, TEST_DEV_COMM, TEST_DEV_DET};
use rs_matter::dm::endpoints;
use rs_matter::dm::subscriptions::DefaultSubscriptions;
use rs_matter::dm::DeviceType;
use rs_matter::dm::IMBuffer;
use rs_matter::dm::{Async, AsyncHandler, AsyncMetadata, Dataver, EmptyHandler, Endpoint, EpClMatcher, Node};
use rs_matter::error::Error;
use rs_matter::pairing::qr::QrTextType;
use rs_matter::pairing::DiscoveryCapabilities;
use rs_matter::persist::{Psm, NO_NETWORKS};
use rs_matter::respond::DefaultResponder;
use rs_matter::sc::pake::MAX_COMM_WINDOW_TIMEOUT_SECS;
use rs_matter::utils::init::InitMaybeUninit;
use rs_matter::utils::select::Coalesce;
use rs_matter::utils::storage::pooled::PooledBuffers;
use rs_matter::{clusters, devices, Matter};

use static_cell::StaticCell;

use matter_virtual_device::clusters::BindingHandler;
use matter_virtual_device::config::DeviceConfig;
use matter_virtual_device::mdns;
use matter_virtual_device::FilteredNetifs;

// On/Off Light Switch device type (0x0103 = 259)
const DEV_TYPE_ON_OFF_LIGHT_SWITCH: DeviceType = DeviceType {
    dtype: 0x0103,
    drev: 2,
};

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
    info!("║          Matter On/Off Light Switch                       ║");
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
    let matter = MATTER.uninit().init_with(Matter::init(
        &TEST_DEV_DET,
        TEST_DEV_COMM,
        &TEST_DEV_ATT,
        rs_matter::utils::epoch::sys_epoch,
        rs_matter::utils::rand::sys_rand,
        config.port,
    ));

    matter.initialize_transport_buffers()?;

    // Create transport buffers and subscriptions
    let buffers = BUFFERS.uninit().init_with(PooledBuffers::init(0));
    let subscriptions = SUBSCRIPTIONS
        .uninit()
        .init_with(DefaultSubscriptions::init());

    // Create Binding handler for endpoint 1 (switch controls other devices via bindings)
    let binding_handler = BindingHandler::new(Dataver::new_rand(matter.rand()), 1);

    // Create the Data Model
    let dm = DataModel::new(
        matter,
        buffers,
        subscriptions,
        dm_handler(matter, &binding_handler),
    );

    // Create responder for handling Matter exchanges
    let responder = DefaultResponder::new(&dm);

    let mut respond = pin!(responder.run::<4, 4>());
    let mut dm_job = pin!(dm.run());

    // Bind UDP socket for Matter transport
    // Use configured port for socket binding
    let socket_addr: SocketAddr =
        SocketAddr::V6(SocketAddrV6::new(Ipv6Addr::UNSPECIFIED, config.port, 0, 0));
    let socket = async_io::Async::<UdpSocket>::bind(socket_addr)?;

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
            device_types: devices!(DEV_TYPE_ON_OFF_LIGHT_SWITCH),
            clusters: clusters!(
                desc::DescHandler::CLUSTER,
                BindingHandler::CLUSTER,
            ),
        },
    ],
};

/// Data Model handler composition for all endpoints and clusters.
fn dm_handler<'a>(
    matter: &'a Matter<'a>,
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
                        EpClMatcher::new(Some(1), Some(BindingHandler::CLUSTER.id)),
                        Async(binding.adapt()),
                    ),
            ),
        ),
    )
}

use rs_matter::dm::DataModel;

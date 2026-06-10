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

use embassy_futures::select::select3;

use async_signal::{Signal, Signals};
use futures_lite::StreamExt;
use log::info;

use rand::RngCore;

use rs_matter::crypto::{default_crypto, Crypto};
use rs_matter::dm::clusters::desc::{self, ClusterHandler as _};
use rs_matter::dm::clusters::net_comm::SharedNetworks;
use rs_matter::dm::devices::test::{DAC_PRIVKEY, TEST_DEV_ATT, TEST_DEV_COMM, TEST_DEV_DET};
use rs_matter::dm::endpoints::EthSysHandlerBuilder;
use rs_matter::dm::events::Events;
use rs_matter::dm::networks::eth::EthNetwork;
use rs_matter::dm::subscriptions::Subscriptions;
use rs_matter::dm::DeviceType;
use rs_matter::dm::IMBuffer;
use rs_matter::dm::{Async, DataModel, DataModelHandler, Dataver, Endpoint, EpClMatcher, Node};
use rs_matter::error::Error;
use rs_matter::pairing::qr::QrTextType;
use rs_matter::pairing::DiscoveryCapabilities;
use rs_matter::persist::{FileKvBlobStore, SharedKvBlobStore};
use rs_matter::respond::DefaultResponder;
use rs_matter::sc::pase::MAX_COMM_WINDOW_TIMEOUT_SECS;
use rs_matter::utils::init::InitMaybeUninit;
use rs_matter::utils::select::Coalesce;
use rs_matter::utils::storage::pooled::PooledBuffers;
use rs_matter::{clusters, devices, root_endpoint, Matter};

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
static BUFFERS: StaticCell<PooledBuffers<10, IMBuffer>> = StaticCell::new();
static SUBSCRIPTIONS: StaticCell<Subscriptions> = StaticCell::new();
static EVENTS: StaticCell<Events> = StaticCell::new();
static KV_BUF: StaticCell<[u8; 4096]> = StaticCell::new();

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
        core::mem::size_of::<PooledBuffers<10, IMBuffer>>(),
        core::mem::size_of::<Subscriptions>()
    );

    // Initialize Matter instance with test device credentials
    let matter = MATTER.uninit().init_with(Matter::init(
        &TEST_DEV_DET,
        TEST_DEV_COMM,
        &TEST_DEV_ATT,
        config.port,
    ));

    // Create the event queue
    let events = EVENTS.uninit().init_with(Events::init());

    // Persistence: a single-file key-value blob store at the configured path
    let path = PathBuf::from(&config.persist_path);
    info!("Persist path: {}", path.display());
    let kv_buf = KV_BUF.uninit().init_zeroed().as_mut_slice();
    let mut kv = FileKvBlobStore::new(path);
    futures_lite::future::block_on(matter.load_persist(&mut kv, kv_buf))?;
    futures_lite::future::block_on(events.load_persist(&mut kv, kv_buf))?;

    // Create transport buffers and subscriptions
    let buffers = BUFFERS.uninit().init_with(PooledBuffers::init(0));
    let subscriptions = SUBSCRIPTIONS.uninit().init_with(Subscriptions::init());

    // Create the crypto backend (seeds the rs-matter RustCrypto implementation)
    let crypto = default_crypto(rand::thread_rng(), DAC_PRIVKEY);
    let mut rand = crypto.rand()?;

    // Create Binding handler for endpoint 1 (switch controls other devices via bindings)
    let binding_handler = BindingHandler::new(Dataver::new_rand(&mut rand), 1);

    // Create the Data Model
    let dm = DataModel::new(
        matter,
        &crypto,
        buffers,
        subscriptions,
        events,
        dm_handler(rand, &binding_handler),
        SharedKvBlobStore::new(kv, kv_buf),
        SharedNetworks::new(EthNetwork::new_default()),
    );

    // Create responder for handling Matter exchanges
    let responder = DefaultResponder::new(&dm);

    let mut respond = pin!(responder.run::<4, 4>());
    let mut dm_job = pin!(dm.run());

    // Bind UDP socket for Matter transport on the configured port
    let socket_addr: SocketAddr =
        SocketAddr::V6(SocketAddrV6::new(Ipv6Addr::UNSPECIFIED, config.port, 0, 0));
    let socket = async_io::Async::<UdpSocket>::bind(socket_addr)?;

    // Run Matter transport and mDNS
    let mut mdns = pin!(mdns::run_mdns(matter, &crypto));
    let mut transport = pin!(matter.run(&crypto, &socket, &socket, &socket));

    // Print commissioning info
    info!("");
    info!("┌─────────────────────────────────────────┐");
    info!("│           COMMISSIONING INFO            │");
    info!("├─────────────────────────────────────────┤");

    matter.print_standard_qr_text(DiscoveryCapabilities::IP)?;

    if !matter.is_commissioned() {
        matter.print_standard_qr_code(QrTextType::Unicode, DiscoveryCapabilities::IP)?;
        matter.open_basic_comm_window(MAX_COMM_WINDOW_TIMEOUT_SECS, &crypto, &())?;
        info!("│ Device is NOT commissioned              │");
        info!("│ Commissioning window is OPEN            │");
    } else {
        info!("│ Device is already commissioned          │");
    }
    info!("└─────────────────────────────────────────┘");
    info!("");

    // Handle SIGTERM for graceful shutdown
    let mut term_signal = Signals::new([Signal::Term])?;
    let mut term = pin!(async {
        term_signal.next().await;
        info!("Received SIGTERM, shutting down...");
        Ok(())
    });

    // Run all async tasks
    let all = select3(
        &mut transport,
        &mut mdns,
        select3(&mut respond, &mut dm_job, &mut term).coalesce(),
    );

    futures_lite::future::block_on(all.coalesce())
}

/// Node metadata describing our Matter device endpoints and clusters.
const NODE: Node<'static> = Node {
    endpoints: &[
        root_endpoint!(eth),
        Endpoint::new(
            1,
            devices!(DEV_TYPE_ON_OFF_LIGHT_SWITCH),
            clusters!(desc::DescHandler::CLUSTER, BindingHandler::CLUSTER,),
        ),
    ],
};

/// Data Model handler composition for all endpoints and clusters.
fn dm_handler<'a>(
    mut rand: impl RngCore + Copy,
    binding: &'a BindingHandler,
) -> impl DataModelHandler + 'a {
    static FILTERED_NETIFS: FilteredNetifs = FilteredNetifs::new();

    (
        NODE,
        EthSysHandlerBuilder::new()
            .netif_diag(&FILTERED_NETIFS)
            .build(rand)
            .chain(
                EpClMatcher::new(Some(1), Some(desc::DescHandler::CLUSTER.id)),
                Async(desc::DescHandler::new(Dataver::new_rand(&mut rand)).adapt()),
            )
            .chain(
                EpClMatcher::new(Some(1), Some(BindingHandler::CLUSTER.id)),
                Async(binding.adapt()),
            ),
    )
}

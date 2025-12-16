//! mDNS responder for Matter device discovery.
//!
//! Based on rs-matter examples. Uses builtin mDNS by default,
//! with optional avahi/zbus support via feature flags.

use std::net::UdpSocket;

use log::info;
use socket2::{Domain, Protocol, Socket, Type};

use rs_matter::error::Error;
use rs_matter::transport::network::mdns::builtin::{BuiltinMdnsResponder, Host};
use rs_matter::transport::network::mdns::{
    MDNS_IPV4_BROADCAST_ADDR, MDNS_IPV6_BROADCAST_ADDR, MDNS_SOCKET_DEFAULT_BIND_ADDR,
};
use rs_matter::transport::network::{Ipv4Addr, Ipv6Addr};
use rs_matter::Matter;

/// Run the mDNS responder for device discovery.
pub async fn run_mdns(matter: &Matter<'_>) -> Result<(), Error> {
    // Use builtin mDNS responder (works without external dependencies)
    run_builtin_mdns(matter).await
}

/// Initialize network and get local IP addresses.
fn initialize_network() -> Result<(Ipv4Addr, Ipv6Addr, u32), Error> {
    use log::error;
    use nix::{net::if_::InterfaceFlags, sys::socket::SockaddrIn6};
    use rs_matter::error::ErrorCode;

    let interfaces = || {
        nix::ifaddrs::getifaddrs().unwrap().filter(|ia| {
            ia.flags
                .contains(InterfaceFlags::IFF_UP | InterfaceFlags::IFF_BROADCAST)
                && !ia
                    .flags
                    .intersects(InterfaceFlags::IFF_LOOPBACK | InterfaceFlags::IFF_POINTOPOINT)
        })
    };

    // Find a network interface with both IPv4 and link-local IPv6
    let (iname, ip, ipv6) = interfaces()
        .filter_map(|ia| {
            ia.address
                .and_then(|addr| addr.as_sockaddr_in6().map(SockaddrIn6::ip))
                .map(|ipv6| (ia.interface_name, ipv6))
        })
        .filter_map(|(iname, ipv6)| {
            interfaces()
                .filter(|ia2| ia2.interface_name == iname)
                .find_map(|ia2| {
                    ia2.address
                        .and_then(|addr| addr.as_sockaddr_in().map(|addr| addr.ip().into()))
                        .map(|ip: std::net::Ipv4Addr| (iname.clone(), ip, ipv6))
                })
        })
        .next()
        .ok_or_else(|| {
            error!("Cannot find network interface suitable for mDNS broadcasting");
            ErrorCode::StdIoError
        })?;

    info!("Using network interface {} with {}/{} for mDNS", iname, ip, ipv6);

    Ok((ip.octets().into(), ipv6.octets().into(), 0))
}

/// Run the builtin mDNS responder.
async fn run_builtin_mdns(matter: &Matter<'_>) -> Result<(), Error> {
    let (ipv4_addr, ipv6_addr, interface) = initialize_network()?;

    // Create and configure the mDNS socket
    let socket = Socket::new(Domain::IPV6, Type::DGRAM, Some(Protocol::UDP))?;
    socket.set_reuse_address(true)?;
    socket.set_only_v6(false)?;
    socket.bind(&MDNS_SOCKET_DEFAULT_BIND_ADDR.into())?;
    let socket = async_io::Async::<UdpSocket>::new_nonblocking(socket.into())?;

    // Join multicast groups for mDNS
    socket
        .get_ref()
        .join_multicast_v6(&MDNS_IPV6_BROADCAST_ADDR, interface)?;
    socket
        .get_ref()
        .join_multicast_v4(&MDNS_IPV4_BROADCAST_ADDR, &ipv4_addr)?;

    // Generate a unique hostname from device info
    let hostname = "matter-test-device";

    BuiltinMdnsResponder::new(matter)
        .run(
            &socket,
            &socket,
            &Host {
                id: 0,
                hostname,
                ip: ipv4_addr,
                ipv6: ipv6_addr,
            },
            Some(ipv4_addr),
            Some(interface),
        )
        .await
}

//! Minimal network interface diagnostics.
//!
//! Provides a minimal implementation of `NetifDiag` that reports a single
//! hardcoded network interface to avoid issues with host networking on Docker
//! where many virtual interfaces cause Matter interview failures.

use core::net::Ipv4Addr;

use rs_matter::dm::clusters::gen_diag::{InterfaceTypeEnum, NetifDiag, NetifInfo};
use rs_matter::error::Error;

/// Minimal network interface diagnostics that reports a single hardcoded interface.
///
/// This avoids issues when running with Docker host networking where
/// the full list of interfaces is too large and causes Matter interview failures.
#[derive(Copy, Clone, Debug, Default)]
pub struct FilteredNetifs;

impl FilteredNetifs {
    /// Create a new FilteredNetifs.
    pub const fn new() -> Self {
        Self
    }
}

impl NetifDiag for FilteredNetifs {
    fn netifs(&self, f: &mut dyn FnMut(&NetifInfo) -> Result<(), Error>) -> Result<(), Error> {
        // Report a single minimal network interface
        // This avoids the issue with too many Docker/host interfaces
        f(&NetifInfo {
            name: "eth0",
            operational: true,
            offprem_svc_reachable_ipv4: None,
            offprem_svc_reachable_ipv6: None,
            hw_addr: &[0x02, 0x42, 0xac, 0x11, 0x00, 0x01, 0x00, 0x00], // 8-byte MAC
            ipv4_addrs: &[Ipv4Addr::new(192, 168, 65, 3)],
            ipv6_addrs: &[],
            netif_type: InterfaceTypeEnum::Ethernet,
            netif_index: 1,
        })
    }
}

//! Matter virtual devices library.
//!
//! Provides shared functionality for building Matter test devices using rs-matter SDK.

pub mod clusters;
pub mod config;
pub mod mdns;
pub mod netif;

pub use config::DeviceConfig;
pub use netif::FilteredNetifs;

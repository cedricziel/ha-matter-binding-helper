//! Matter virtual devices library.
//!
//! Provides shared functionality for building Matter test devices using rs-matter SDK.

pub mod clusters;
pub mod config;
pub mod mdns;

pub use config::DeviceConfig;

//! Configuration for Matter virtual devices via CLI and environment variables.

use clap::Parser;

/// Configuration for a Matter virtual device.
#[derive(Parser, Debug, Clone)]
#[command(author, version, about = "Matter virtual device for testing")]
pub struct DeviceConfig {
    /// Device discriminator (0-4095) for commissioning
    #[arg(short, long, env = "MATTER_DISCRIMINATOR", default_value_t = 3840)]
    pub discriminator: u16,

    /// Setup passcode for commissioning
    #[arg(short, long, env = "MATTER_PASSCODE", default_value_t = 20202021)]
    pub passcode: u32,

    /// Matter UDP port
    #[arg(long, env = "MATTER_PORT", default_value_t = 5540)]
    pub port: u16,

    /// Path for persisting device state and credentials (file path)
    #[arg(long, env = "MATTER_PERSIST_PATH", default_value = "/data/matter.bin")]
    pub persist_path: String,

    /// Device name shown in Basic Information cluster
    #[arg(short, long, env = "MATTER_DEVICE_NAME", default_value = "Test Device")]
    pub name: String,

    /// Vendor ID
    #[arg(long, env = "MATTER_VENDOR_ID", default_value_t = 0xFFF1)]
    pub vendor_id: u16,

    /// Product ID
    #[arg(long, env = "MATTER_PRODUCT_ID", default_value_t = 0x8000)]
    pub product_id: u16,
}

impl DeviceConfig {
    /// Parse configuration from command line arguments and environment
    pub fn parse_config() -> Self {
        Self::parse()
    }

    /// Generate a manual pairing code from discriminator and passcode
    pub fn manual_pairing_code(&self) -> String {
        // Simplified manual code format
        // Real implementation should follow Matter spec for manual pairing code
        format!(
            "{:04}-{:03}-{:04}",
            self.discriminator % 10000,
            (self.passcode / 10000) % 1000,
            self.passcode % 10000
        )
    }
}

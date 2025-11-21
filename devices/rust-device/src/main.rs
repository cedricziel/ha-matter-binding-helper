//! Mock Matter device for development and testing
//!
//! Simulates Matter device behavior with a JSON control API.
//! This is for testing the HA integration, not full Matter commissioning.
//!
//! Usage:
//!   cargo run -- --discriminator 3840 --passcode 20202021

use std::sync::Arc;

use clap::Parser;
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::RwLock;

/// Virtual Matter device for testing bindings
#[derive(Parser, Debug)]
#[command(author, version, about)]
struct Args {
    /// Device discriminator (0-4095)
    #[arg(short, long, default_value_t = 3840)]
    discriminator: u16,

    /// Setup passcode
    #[arg(short, long, default_value_t = 20202021)]
    passcode: u32,

    /// TCP port for control API
    #[arg(long, default_value_t = 5540)]
    port: u16,

    /// Device name
    #[arg(short, long, default_value = "Virtual Light")]
    name: String,

    /// Device type (light, switch, sensor)
    #[arg(short = 't', long, default_value = "light")]
    device_type: String,
}

/// Device state
#[derive(Debug, Clone, Serialize, Deserialize)]
struct DeviceState {
    on: bool,
    level: u8,
    bindings: Vec<Binding>,
    groups: Vec<u16>,
}

/// Binding entry
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Binding {
    node_id: u64,
    endpoint_id: u16,
    cluster_id: u32,
}

/// Control message
#[derive(Debug, Deserialize)]
#[serde(tag = "cmd")]
enum ControlMessage {
    #[serde(rename = "get_state")]
    GetState,
    #[serde(rename = "set_on")]
    SetOn { value: bool },
    #[serde(rename = "set_level")]
    SetLevel { value: u8 },
    #[serde(rename = "toggle")]
    Toggle,
    #[serde(rename = "add_binding")]
    AddBinding { node_id: u64, endpoint_id: u16, cluster_id: u32 },
    #[serde(rename = "remove_binding")]
    RemoveBinding { node_id: u64, endpoint_id: u16 },
    #[serde(rename = "get_bindings")]
    GetBindings,
    #[serde(rename = "add_group")]
    AddGroup { group_id: u16 },
    #[serde(rename = "remove_group")]
    RemoveGroup { group_id: u16 },
}

/// Response message
#[derive(Debug, Serialize)]
struct Response {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

impl Response {
    fn ok(data: impl Serialize) -> Self {
        Self {
            success: true,
            data: Some(serde_json::to_value(data).unwrap()),
            error: None,
        }
    }

    fn error(msg: &str) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(msg.to_string()),
        }
    }
}

/// Generate manual pairing code
fn generate_manual_code(discriminator: u16, passcode: u32) -> String {
    format!("{:04}-{:03}-{:04}",
        discriminator % 10000,
        (passcode / 10000) % 1000,
        passcode % 10000
    )
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info")
    ).init();

    let args = Args::parse();

    info!("╔═══════════════════════════════════════════════════════════╗");
    info!("║     Mock Matter Device (Development Testing)             ║");
    info!("╠═══════════════════════════════════════════════════════════╣");
    info!("║ Device:        {:<42} ║", args.name);
    info!("║ Type:          {:<42} ║", args.device_type);
    info!("║ Discriminator: {:<42} ║", args.discriminator);
    info!("║ Passcode:      {:<42} ║", args.passcode);
    info!("║ Control Port:  {:<42} ║", args.port);
    info!("╚═══════════════════════════════════════════════════════════╝");

    // Initialize device state
    let state = Arc::new(RwLock::new(DeviceState {
        on: false,
        level: 100,
        bindings: Vec::new(),
        groups: Vec::new(),
    }));

    // Print pairing info
    info!("");
    info!("┌─────────────────────────────────────────┐");
    info!("│           COMMISSIONING INFO            │");
    info!("├─────────────────────────────────────────┤");
    info!("│ Manual Code: {}          │", generate_manual_code(args.discriminator, args.passcode));
    info!("│ Discriminator: {:>4}                     │", args.discriminator);
    info!("│ Passcode: {:>8}                    │", args.passcode);
    info!("└─────────────────────────────────────────┘");
    info!("");

    // Log cluster info
    info!("Device clusters:");
    info!("  Endpoint 0 (Root):");
    info!("    - Basic Information (0x0028)");
    info!("    - Network Commissioning (0x0031)");
    info!("    - General Commissioning (0x0030)");
    info!("  Endpoint 1 ({}):", args.device_type);
    info!("    - On/Off (0x0006)");
    info!("    - Level Control (0x0008)");
    info!("    - Binding (0x001E)");
    info!("    - Descriptor (0x001D)");
    info!("");

    // Start TCP control server
    let listener = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;
    info!("Control API listening on port {}", args.port);
    info!("");
    info!("Send JSON commands via TCP. Example:");
    info!("  echo '{{\"cmd\":\"get_state\"}}' | nc localhost {}", args.port);
    info!("");

    // Handle connections
    loop {
        match listener.accept().await {
            Ok((mut socket, addr)) => {
                debug!("Connection from {}", addr);
                let state = Arc::clone(&state);

                tokio::spawn(async move {
                    let mut buf = vec![0u8; 4096];

                    match socket.read(&mut buf).await {
                        Ok(n) if n > 0 => {
                            let request = String::from_utf8_lossy(&buf[..n]);
                            debug!("Received: {}", request.trim());

                            let response = handle_command(&request, &state).await;
                            let json = serde_json::to_string(&response).unwrap();

                            if let Err(e) = socket.write_all(json.as_bytes()).await {
                                error!("Failed to send response: {}", e);
                            }
                        }
                        Ok(_) => debug!("Empty request from {}", addr),
                        Err(e) => error!("Read error: {}", e),
                    }
                });
            }
            Err(e) => {
                error!("Accept error: {}", e);
            }
        }
    }
}

async fn handle_command(request: &str, state: &Arc<RwLock<DeviceState>>) -> Response {
    let msg: ControlMessage = match serde_json::from_str(request.trim()) {
        Ok(m) => m,
        Err(e) => return Response::error(&format!("Invalid JSON: {}", e)),
    };

    match msg {
        ControlMessage::GetState => {
            let s = state.read().await;
            Response::ok(s.clone())
        }
        ControlMessage::SetOn { value } => {
            let mut s = state.write().await;
            s.on = value;
            info!("Light: {}", if value { "ON" } else { "OFF" });
            Response::ok(serde_json::json!({"on": value}))
        }
        ControlMessage::SetLevel { value } => {
            let mut s = state.write().await;
            s.level = value;
            info!("Level: {}%", value);
            Response::ok(serde_json::json!({"level": value}))
        }
        ControlMessage::Toggle => {
            let mut s = state.write().await;
            s.on = !s.on;
            info!("Toggle: {}", if s.on { "ON" } else { "OFF" });
            Response::ok(serde_json::json!({"on": s.on}))
        }
        ControlMessage::AddBinding { node_id, endpoint_id, cluster_id } => {
            let mut s = state.write().await;
            let binding = Binding { node_id, endpoint_id, cluster_id };
            s.bindings.push(binding.clone());
            info!("Binding added: node={}, endpoint={}, cluster={:#06x}",
                  node_id, endpoint_id, cluster_id);
            Response::ok(binding)
        }
        ControlMessage::RemoveBinding { node_id, endpoint_id } => {
            let mut s = state.write().await;
            let len_before = s.bindings.len();
            s.bindings.retain(|b| b.node_id != node_id || b.endpoint_id != endpoint_id);
            let removed = len_before - s.bindings.len();
            info!("Removed {} binding(s)", removed);
            Response::ok(serde_json::json!({"removed": removed}))
        }
        ControlMessage::GetBindings => {
            let s = state.read().await;
            Response::ok(&s.bindings)
        }
        ControlMessage::AddGroup { group_id } => {
            let mut s = state.write().await;
            if !s.groups.contains(&group_id) {
                s.groups.push(group_id);
                info!("Added to group {}", group_id);
            }
            Response::ok(serde_json::json!({"groups": s.groups}))
        }
        ControlMessage::RemoveGroup { group_id } => {
            let mut s = state.write().await;
            s.groups.retain(|&g| g != group_id);
            info!("Removed from group {}", group_id);
            Response::ok(serde_json::json!({"groups": s.groups}))
        }
    }
}

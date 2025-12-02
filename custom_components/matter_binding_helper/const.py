"""Constants for Matter Binding Helper integration."""

DOMAIN = "matter_binding_helper"

# Config options
CONF_DEMO_MODE = "demo_mode"
DEFAULT_DEMO_MODE = False
CONF_TELEMETRY_ENABLED = "telemetry_enabled"
DEFAULT_TELEMETRY_ENABLED = True  # Opt-out model: enabled by default

# Telemetry settings
TELEMETRY_URL = "https://matter-survey.org/api/submit"
TELEMETRY_INTERVAL_HOURS = 168  # Weekly (7 days * 24 hours)
TELEMETRY_INITIAL_DELAY_MINUTES = 5  # Wait before first submission

# Panel
PANEL_URL = "/matter-binding-helper"
PANEL_TITLE = "Matter Bindings"
PANEL_ICON = "mdi:link-variant"
PANEL_NAME = "matter-binding-helper-panel"

# WebSocket commands
WS_TYPE_LIST_NODES = f"{DOMAIN}/list_nodes"
WS_TYPE_LIST_BINDINGS = f"{DOMAIN}/list_bindings"
WS_TYPE_CREATE_BINDING = f"{DOMAIN}/create_binding"
WS_TYPE_DELETE_BINDING = f"{DOMAIN}/delete_binding"
WS_TYPE_LIST_GROUPS = f"{DOMAIN}/list_groups"
WS_TYPE_CREATE_GROUP = f"{DOMAIN}/create_group"
WS_TYPE_DELETE_GROUP = f"{DOMAIN}/delete_group"
WS_TYPE_ADD_TO_GROUP = f"{DOMAIN}/add_to_group"
WS_TYPE_REMOVE_FROM_GROUP = f"{DOMAIN}/remove_from_group"

# Matter cluster IDs for bindings
CLUSTER_BINDING = 0x001E  # Binding cluster
CLUSTER_ON_OFF = 0x0006
CLUSTER_LEVEL_CONTROL = 0x0008
CLUSTER_COLOR_CONTROL = 0x0300
CLUSTER_SCENES = 0x0005
CLUSTER_DESCRIPTOR = 0x001D  # Descriptor cluster

# Descriptor cluster attribute IDs
ATTR_DEVICE_TYPE_LIST = 0  # DeviceTypeList
ATTR_SERVER_LIST = 1  # ServerList - cluster IDs this endpoint implements as server
ATTR_CLIENT_LIST = 2  # ClientList - cluster IDs this endpoint implements as client
ATTR_PARTS_LIST = 3  # PartsList - child endpoints

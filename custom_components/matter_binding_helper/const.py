"""Constants for Matter Binding Helper integration."""

DOMAIN = "matter_binding_helper"

# Config options
CONF_DEMO_MODE = "demo_mode"
DEFAULT_DEMO_MODE = False

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

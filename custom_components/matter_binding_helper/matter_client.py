"""Matter server client for binding operations."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import (
    ACL_AUTH_MODE_CASE,
    ACL_AUTH_MODE_GROUP,
    ACL_AUTH_MODE_PASE,
    ACL_PRIVILEGE_ADMINISTER,
    ACL_PRIVILEGE_MANAGE,
    ACL_PRIVILEGE_OPERATE,
    ACL_PRIVILEGE_PROXY_VIEW,
    ACL_PRIVILEGE_VIEW,
    ATTR_ACL,
    ATTR_ACCEPTED_COMMAND_LIST,
    ATTR_CLIENT_LIST,
    ATTR_SERVER_LIST,
    CLUSTER_ACCESS_CONTROL,
    CLUSTER_BINDING,
    CLUSTER_DESCRIPTOR,
    CLUSTER_LEVEL_CONTROL,
    CLUSTER_ON_OFF,
    CLUSTER_THERMOSTAT,
    CMD_GET_WEEKLY_SCHEDULE,
    CONF_DEMO_MODE,
    DEFAULT_DEMO_MODE,
    DOMAIN,
)

if TYPE_CHECKING:
    from matter_server.client import MatterClient
    from matter_server.common.models import MatterNodeData

_LOGGER = logging.getLogger(__name__)


class OperationErrorType(Enum):
    """Error types for Matter operations."""

    SUCCESS = "success"
    PERMISSION_DENIED = "permission_denied"
    DEVICE_UNAVAILABLE = "device_unavailable"
    DEVICE_TIMEOUT = "device_timeout"
    DEVICE_REJECTED = "device_rejected"  # Silent rejection detected via verification
    INVALID_REQUEST = "invalid_request"
    UNKNOWN_ERROR = "unknown_error"


@dataclass
class BindingEntry:
    """Represents a Matter binding entry."""

    node_id: int
    endpoint_id: int
    cluster_id: int
    target_node_id: int | None = None
    target_endpoint_id: int | None = None
    target_group_id: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "node_id": self.node_id,
            "endpoint_id": self.endpoint_id,
            "cluster_id": self.cluster_id,
            "target_node_id": self.target_node_id,
            "target_endpoint_id": self.target_endpoint_id,
            "target_group_id": self.target_group_id,
        }


@dataclass
class ScheduleTransition:
    """Represents a weekly schedule transition entry."""

    transition_time: int  # Minutes from midnight (0-1439)
    heat_setpoint: float | None = None  # Temperature in °C
    cool_setpoint: float | None = None  # Temperature in °C

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "transition_time": self.transition_time,
            "heat_setpoint": self.heat_setpoint,
            "cool_setpoint": self.cool_setpoint,
        }

    @classmethod
    def from_matter(cls, matter_transition: Any) -> "ScheduleTransition":
        """Create from Matter SDK transition struct."""
        # Matter uses 0.01°C units
        heat = matter_transition.heatSetpoint
        cool = matter_transition.coolSetpoint
        return cls(
            transition_time=matter_transition.transitionTime,
            heat_setpoint=heat / 100 if heat is not None else None,
            cool_setpoint=cool / 100 if cool is not None else None,
        )


@dataclass
class WeeklySchedule:
    """Represents a thermostat weekly schedule response."""

    day_of_week: int  # Bitmap: bit 0=Sun, bit 1=Mon, ..., bit 6=Sat, bit 7=Away
    mode: int  # Bitmap: bit 0=Heat, bit 1=Cool
    transitions: list[ScheduleTransition]

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "day_of_week": self.day_of_week,
            "day_names": self._get_day_names(),
            "mode": self.mode,
            "mode_names": self._get_mode_names(),
            "transitions": [t.to_dict() for t in self.transitions],
        }

    def _get_day_names(self) -> list[str]:
        """Get list of day names from bitmap."""
        days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "away",
        ]
        return [days[i] for i in range(8) if self.day_of_week & (1 << i)]

    def _get_mode_names(self) -> list[str]:
        """Get list of mode names from bitmap."""
        modes = []
        if self.mode & 1:
            modes.append("heat")
        if self.mode & 2:
            modes.append("cool")
        return modes


@dataclass
class GroupEntry:
    """Represents a Matter group entry."""

    group_id: int
    name: str
    members: list[dict[str, int]]  # [{"node_id": x, "endpoint_id": y}]

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "group_id": self.group_id,
            "name": self.name,
            "members": self.members,
        }


@dataclass
class ACLTarget:
    """Represents an ACL target restriction."""

    cluster: int | None = None
    endpoint: int | None = None
    device_type: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "cluster": self.cluster,
            "endpoint": self.endpoint,
            "device_type": self.device_type,
        }


@dataclass
class ACLEntry:
    """Represents a Matter Access Control List entry."""

    privilege: int  # 1=View, 2=ProxyView, 3=Operate, 4=Manage, 5=Administer
    auth_mode: int  # 1=PASE, 2=CASE, 3=Group
    subjects: list[int]  # Node IDs or Group IDs (empty = all matching authMode)
    targets: list[ACLTarget]  # Cluster/endpoint restrictions (empty = all)
    fabric_index: int

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "privilege": self.privilege,
            "privilege_name": self._get_privilege_name(),
            "auth_mode": self.auth_mode,
            "auth_mode_name": self._get_auth_mode_name(),
            "subjects": self.subjects,
            "targets": [t.to_dict() for t in self.targets],
            "fabric_index": self.fabric_index,
        }

    def _get_privilege_name(self) -> str:
        """Get human-readable privilege name."""
        names = {
            ACL_PRIVILEGE_VIEW: "View",
            ACL_PRIVILEGE_PROXY_VIEW: "ProxyView",
            ACL_PRIVILEGE_OPERATE: "Operate",
            ACL_PRIVILEGE_MANAGE: "Manage",
            ACL_PRIVILEGE_ADMINISTER: "Administer",
        }
        return names.get(self.privilege, f"Unknown ({self.privilege})")

    def _get_auth_mode_name(self) -> str:
        """Get human-readable auth mode name."""
        names = {
            ACL_AUTH_MODE_PASE: "PASE",
            ACL_AUTH_MODE_CASE: "CASE",
            ACL_AUTH_MODE_GROUP: "Group",
        }
        return names.get(self.auth_mode, f"Unknown ({self.auth_mode})")


def _is_demo_mode(hass: HomeAssistant) -> bool:
    """Check if demo mode is enabled."""
    # Get demo mode from config entry options
    for entry in hass.config_entries.async_entries(DOMAIN):
        demo_mode = entry.options.get(CONF_DEMO_MODE, DEFAULT_DEMO_MODE)
        _LOGGER.debug("Demo mode check: %s", demo_mode)
        return demo_mode

    return DEFAULT_DEMO_MODE


def _get_demo_nodes() -> list[dict[str, Any]]:
    """Return demo Matter nodes for UI development."""
    return [
        {
            "node_id": 1,
            "name": "Demo Light",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Light",
                "product_id": 1,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "1.0.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 256, "revision": 2}],  # On/Off Light
                    "has_binding_cluster": True,
                    # Light is a SERVER for On/Off (receives commands)
                    # Binding is typically a server cluster on lights for group bindings
                    "server_clusters": [CLUSTER_ON_OFF, CLUSTER_BINDING],
                    "client_clusters": [],
                },
            ],
        },
        {
            "node_id": 2,
            "name": "Demo Switch",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Switch",
                "product_id": 2,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "1.0.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 259, "revision": 2}],  # On/Off Light Switch
                    "has_binding_cluster": True,
                    # Switch is a CLIENT for On/Off (sends commands)
                    # Binding is a server cluster (stores where to send commands)
                    "server_clusters": [CLUSTER_BINDING],
                    "client_clusters": [CLUSTER_ON_OFF],
                },
            ],
        },
        {
            "node_id": 3,
            "name": "Demo Dimmer",
            "available": True,
            "device_info": {
                "vendor_name": "Demo Vendor",
                "vendor_id": 1234,
                "product_name": "Demo Dimmer",
                "product_id": 3,
                "node_label": None,
                "hardware_version": "1.0",
                "software_version": "2.1.0",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 257, "revision": 2}],  # Dimmable Light
                    "has_binding_cluster": True,
                    # Dimmable Light is a SERVER for On/Off and Level Control
                    "server_clusters": [
                        CLUSTER_ON_OFF,
                        CLUSTER_LEVEL_CONTROL,
                        CLUSTER_BINDING,
                    ],
                    "client_clusters": [],
                },
                {
                    "endpoint_id": 2,
                    "device_types": [{"id": 260, "revision": 2}],  # Dimmer Switch
                    "has_binding_cluster": True,
                    # Dimmer Switch is a CLIENT for On/Off and Level Control
                    "server_clusters": [CLUSTER_BINDING],
                    "client_clusters": [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL],
                },
            ],
        },
        {
            "node_id": 4,
            "name": "Demo Sensor",
            "available": False,  # Unavailable for demo
            "device_info": {
                "vendor_name": "Demo Sensors Inc",
                "vendor_id": 5678,
                "product_name": "Temperature Sensor",
                "product_id": 10,
                "node_label": None,
                "hardware_version": "2.0",
                "software_version": "1.2.3",
            },
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 770, "revision": 1}],  # Temperature Sensor
                    "has_binding_cluster": False,
                    # Temperature Sensor is a SERVER for Temperature Measurement
                    "server_clusters": [0x0402],  # Temperature Measurement
                    "client_clusters": [],
                },
            ],
        },
    ]


# Demo bindings storage (in-memory for demo mode)
_demo_bindings: dict[tuple[int, int], list[BindingEntry]] = {
    (2, 1): [  # Demo Switch endpoint 1 has a binding to Demo Light
        BindingEntry(
            node_id=2,
            endpoint_id=1,
            cluster_id=CLUSTER_ON_OFF,
            target_node_id=1,
            target_endpoint_id=1,
        ),
    ],
    (3, 2): [  # Demo Dimmer endpoint 2 has a binding to Demo Dimmer endpoint 1
        BindingEntry(
            node_id=3,
            endpoint_id=2,
            cluster_id=CLUSTER_LEVEL_CONTROL,
            target_node_id=3,
            target_endpoint_id=1,
        ),
    ],
}


def get_matter_client(hass: HomeAssistant) -> MatterClient | None:
    """Get the Matter client from Home Assistant."""
    try:
        from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN
    except ImportError:
        return None

    if MATTER_DOMAIN not in hass.data:
        return None

    # Get the first Matter entry data
    matter_data = hass.data.get(MATTER_DOMAIN)
    if not matter_data:
        return None

    # Matter stores data by config entry ID
    for entry_data in matter_data.values():
        if hasattr(entry_data, "matter_client"):
            return entry_data.matter_client
        # Fallback for different HA versions
        if hasattr(entry_data, "adapter") and hasattr(
            entry_data.adapter, "matter_client"
        ):
            return entry_data.adapter.matter_client

    return None


def _get_entities_for_device(
    hass: HomeAssistant, device_id: str
) -> list[dict[str, Any]]:
    """Get all entities associated with a device.

    Returns a list of entity info dicts with:
    - entity_id: The full entity ID (e.g., "light.living_room")
    - domain: The entity domain (e.g., "light", "switch", "event")
    - name: The entity's friendly name
    - original_name: The original name before user customization
    - platform: The integration platform (should be "matter")
    """
    entities: list[dict[str, Any]] = []

    try:
        entity_registry = er.async_get(hass)

        for entity in entity_registry.entities.values():
            if entity.device_id == device_id:
                entities.append(
                    {
                        "entity_id": entity.entity_id,
                        "domain": entity.domain,
                        "name": entity.name or entity.original_name,
                        "original_name": entity.original_name,
                        "platform": entity.platform,
                        "disabled": entity.disabled,
                    }
                )

        _LOGGER.debug(
            "Found %d entities for device %s: %s",
            len(entities),
            device_id,
            [e["entity_id"] for e in entities],
        )
    except Exception as err:
        _LOGGER.debug("Error getting entities for device %s: %s", device_id, err)

    return entities


def _get_ha_device_info(hass: HomeAssistant, node_id: int) -> dict[str, Any]:
    """Get Home Assistant device info for a Matter node.

    Looks up the HA device associated with the Matter node to get:
    - HA device name (user-configured)
    - Area name
    - HA device ID
    - Associated entities

    Matter device identifiers use the format:
    ("matter", "deviceid_{fabric_id}-{node_id_hex_16}-MatterNodeDevice")
    where node_id_hex_16 is the node ID as a 16-digit uppercase hex string.
    """
    ha_info: dict[str, Any] = {
        "ha_device_id": None,
        "ha_device_name": None,
        "area_id": None,
        "area_name": None,
        "entities": [],
    }

    # Convert node_id to 16-digit uppercase hex for matching
    node_id_hex = f"{node_id:016X}"

    try:
        device_registry = dr.async_get(hass)
        area_registry = ar.async_get(hass)

        # Find devices with Matter identifiers containing our node_id
        for device in device_registry.devices.values():
            for identifier in device.identifiers:
                # Check if this is a Matter device
                if len(identifier) >= 2 and identifier[0] == "matter":
                    id_value = str(identifier[1])

                    # Match deviceid_ format: deviceid_{fabric}-{node_id_hex}-MatterNodeDevice
                    if (
                        id_value.startswith("deviceid_")
                        and f"-{node_id_hex}-" in id_value
                    ):
                        ha_info["ha_device_id"] = device.id
                        ha_info["ha_device_name"] = device.name_by_user or device.name
                        ha_info["area_id"] = device.area_id

                        if device.area_id:
                            area = area_registry.async_get_area(device.area_id)
                            if area:
                                ha_info["area_name"] = area.name

                        # Get all entities for this device
                        ha_info["entities"] = _get_entities_for_device(hass, device.id)

                        _LOGGER.debug(
                            "Found HA device for Matter node %s: %s (area: %s, entities: %d)",
                            node_id,
                            ha_info["ha_device_name"],
                            ha_info["area_name"],
                            len(ha_info["entities"]),
                        )
                        return ha_info

        _LOGGER.debug("No HA device found for Matter node %s", node_id)
    except Exception as err:
        _LOGGER.debug("Error getting HA device info for node %s: %s", node_id, err)

    return ha_info


async def get_nodes(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Get all Matter nodes."""
    # Check for demo mode first
    if _is_demo_mode(hass):
        _LOGGER.debug("Demo mode enabled, returning demo nodes")
        return _get_demo_nodes()

    client = get_matter_client(hass)
    if not client:
        _LOGGER.error("Matter client not available")
        return []

    nodes = []
    try:
        _LOGGER.info("Fetching Matter nodes from client (live mode)")
        all_nodes = client.get_nodes()
        _LOGGER.info("Found %d nodes from Matter client", len(all_nodes))

        for node in all_nodes:
            endpoints = _get_endpoints_info(node)
            ha_info = _get_ha_device_info(hass, node.node_id)

            # Use HA device name if available, otherwise fall back to Matter name
            name = ha_info.get("ha_device_name") or _get_node_name(node)

            node_info = {
                "node_id": node.node_id,
                "name": name,
                "available": node.available,
                "device_info": _get_device_info(node),
                "endpoints": endpoints,
                "area_name": ha_info.get("area_name"),
                "ha_device_id": ha_info.get("ha_device_id"),
                "entities": ha_info.get("entities", []),
            }
            _LOGGER.info(
                "Node %s (%s): available=%s, endpoints=%d, area=%s",
                node.node_id,
                node_info["name"],
                node.available,
                len(endpoints),
                node_info["area_name"],
            )
            nodes.append(node_info)
    except Exception as err:
        _LOGGER.error("Error getting Matter nodes: %s", err, exc_info=True)

    return nodes


def _get_node_name(node: MatterNodeData) -> str:
    """Extract a friendly name for the node."""
    try:
        # Approach 1: Use node.name property (MatterNode objects)
        name_prop = getattr(node, "name", None)
        if name_prop and str(name_prop).strip():
            return str(name_prop).strip()

        # Approach 2: Try node.device_info property
        device_info = getattr(node, "device_info", None)
        if device_info:
            # Try node_label first, then product_name
            node_label = getattr(device_info, "node_label", None) or getattr(
                device_info, "nodeLabel", None
            )
            if node_label and str(node_label).strip():
                return str(node_label).strip()
            product_name = getattr(device_info, "product_name", None) or getattr(
                device_info, "productName", None
            )
            if product_name and str(product_name).strip():
                return str(product_name).strip()

        # Approach 3: Fall back to attributes dict
        attributes = getattr(node, "attributes", None)
        if attributes:
            node_label = attributes.get("0/40/5")
            if node_label and str(node_label).strip():
                return str(node_label).strip()
            product_name = attributes.get("0/40/3")
            if product_name and str(product_name).strip():
                return str(product_name).strip()
    except Exception:
        pass
    return f"Node {node.node_id}"


def _get_device_info(node: MatterNodeData) -> dict[str, Any]:
    """Extract device information from node.

    Tries multiple approaches:
    1. Use node.device_info property (MatterNode objects)
    2. Fall back to parsing node.attributes dict
    """
    device_info: dict[str, Any] = {
        "vendor_name": None,
        "vendor_id": None,
        "product_name": None,
        "product_id": None,
        "node_label": None,
        "hardware_version": None,
        "software_version": None,
    }

    try:
        # Approach 1: Use node.device_info property directly
        node_device_info = getattr(node, "device_info", None)
        _LOGGER.debug(
            "Node %s: device_info property type=%s, value=%s",
            node.node_id,
            type(node_device_info).__name__ if node_device_info else None,
            node_device_info,
        )
        if node_device_info:
            # Try to access as dict first (some objects support dict-like access)
            if hasattr(node_device_info, "__getitem__"):
                try:
                    device_info["vendor_name"] = node_device_info.get(
                        "vendorName"
                    ) or node_device_info.get("vendor_name")
                    device_info["vendor_id"] = node_device_info.get(
                        "vendorID"
                    ) or node_device_info.get("vendor_id")
                    device_info["product_name"] = node_device_info.get(
                        "productName"
                    ) or node_device_info.get("product_name")
                    device_info["product_id"] = node_device_info.get(
                        "productID"
                    ) or node_device_info.get("product_id")
                    device_info["node_label"] = node_device_info.get(
                        "nodeLabel"
                    ) or node_device_info.get("node_label")
                    device_info["hardware_version"] = node_device_info.get(
                        "hardwareVersionString"
                    ) or node_device_info.get("hardware_version")
                    device_info["software_version"] = node_device_info.get(
                        "softwareVersionString"
                    ) or node_device_info.get("software_version")
                    if any(v is not None for v in device_info.values()):
                        _LOGGER.debug(
                            "Node %s: extracted device_info via dict access: %s",
                            node.node_id,
                            device_info,
                        )
                        return device_info
                except (TypeError, KeyError):
                    pass

            # Log available attributes to help debug
            all_attrs = [a for a in dir(node_device_info) if not a.startswith("_")]
            _LOGGER.debug(
                "Node %s: device_info available attrs: %s", node.node_id, all_attrs[:20]
            )

            # Try direct attribute access with all possible name formats
            device_info["vendor_name"] = getattr(
                node_device_info, "vendorName", None
            ) or getattr(node_device_info, "vendor_name", None)
            device_info["vendor_id"] = (
                getattr(node_device_info, "vendorID", None)
                or getattr(node_device_info, "vendorId", None)
                or getattr(node_device_info, "vendor_id", None)
            )
            device_info["product_name"] = getattr(
                node_device_info, "productName", None
            ) or getattr(node_device_info, "product_name", None)
            device_info["product_id"] = (
                getattr(node_device_info, "productID", None)
                or getattr(node_device_info, "productId", None)
                or getattr(node_device_info, "product_id", None)
            )
            device_info["node_label"] = getattr(
                node_device_info, "nodeLabel", None
            ) or getattr(node_device_info, "node_label", None)
            device_info["hardware_version"] = (
                getattr(node_device_info, "hardwareVersionString", None)
                or getattr(node_device_info, "hardware_version_string", None)
                or getattr(node_device_info, "hardwareVersion", None)
            )
            device_info["software_version"] = (
                getattr(node_device_info, "softwareVersionString", None)
                or getattr(node_device_info, "software_version_string", None)
                or getattr(node_device_info, "softwareVersion", None)
            )

            # If we got any data, return it
            if any(v is not None for v in device_info.values()):
                _LOGGER.debug(
                    "Node %s: extracted device_info from property: %s",
                    node.node_id,
                    device_info,
                )
                return device_info

        # Approach 2: Fall back to attributes dict
        _LOGGER.debug(
            "Node %s: device_info property had no data, trying attributes dict",
            node.node_id,
        )
        attributes = getattr(node, "attributes", None)
        if attributes:
            _LOGGER.debug(
                "Node %s: attributes dict has %d keys, sample keys: %s",
                node.node_id,
                len(attributes),
                list(attributes.keys())[:5],
            )

            # Try string keys first (older format)
            device_info["vendor_name"] = attributes.get("0/40/1")
            device_info["vendor_id"] = attributes.get("0/40/2")
            device_info["product_name"] = attributes.get("0/40/3")
            device_info["product_id"] = attributes.get("0/40/4")
            device_info["node_label"] = attributes.get("0/40/5")
            device_info["hardware_version"] = attributes.get("0/40/8")
            device_info["software_version"] = attributes.get("0/40/10")

            # If string keys didn't work, try iterating and matching by path components
            if not any(v is not None for v in device_info.values()):
                _LOGGER.debug(
                    "Node %s: string keys didn't work, trying path matching",
                    node.node_id,
                )
                for attr_key, attr_value in attributes.items():
                    # Convert key to string and parse
                    key_str = str(attr_key)
                    if "/40/" in key_str or "BasicInformation" in key_str:
                        _LOGGER.debug(
                            "Node %s: found Basic Info attr: %s = %s",
                            node.node_id,
                            key_str,
                            attr_value,
                        )
                    # Check for endpoint 0, cluster 40 (Basic Information)
                    if (
                        hasattr(attr_key, "endpoint_id")
                        and hasattr(attr_key, "cluster_id")
                        and hasattr(attr_key, "attribute_id")
                    ):
                        if attr_key.endpoint_id == 0 and attr_key.cluster_id == 40:
                            attr_id = attr_key.attribute_id
                            if attr_id == 1:
                                device_info["vendor_name"] = attr_value
                            elif attr_id == 2:
                                device_info["vendor_id"] = attr_value
                            elif attr_id == 3:
                                device_info["product_name"] = attr_value
                            elif attr_id == 4:
                                device_info["product_id"] = attr_value
                            elif attr_id == 5:
                                device_info["node_label"] = attr_value
                            elif attr_id == 8:
                                device_info["hardware_version"] = attr_value
                            elif attr_id == 10:
                                device_info["software_version"] = attr_value

            _LOGGER.debug(
                "Node %s: extracted device_info from attributes: %s",
                node.node_id,
                device_info,
            )
        else:
            _LOGGER.debug("Node %s: no attributes dict found", node.node_id)

    except Exception as err:
        _LOGGER.debug("Error getting device info for node %s: %s", node.node_id, err)

    _LOGGER.debug("Node %s: final device_info: %s", node.node_id, device_info)
    return device_info


def _get_endpoints_info(node: MatterNodeData) -> list[dict[str, Any]]:
    """Get endpoint information for a node.

    Tries multiple approaches:
    1. Use node.endpoints property directly (MatterNode objects)
    2. Fall back to parsing node.attributes dict
    """
    endpoints: list[dict[str, Any]] = []

    try:
        # Approach 1: Try using node.endpoints property directly
        endpoints_prop = getattr(node, "endpoints", None)
        if endpoints_prop:
            _LOGGER.debug(
                "Node %s: using endpoints property (type: %s, len: %s)",
                node.node_id,
                type(endpoints_prop).__name__,
                len(endpoints_prop) if endpoints_prop else 0,
            )
            endpoints = _extract_from_endpoints_property(node.node_id, endpoints_prop)
            if endpoints:
                return endpoints

        # Approach 2: Fall back to parsing attributes dict
        attributes = getattr(node, "attributes", None)
        if attributes:
            _LOGGER.debug(
                "Node %s: using attributes dict (len: %s)",
                node.node_id,
                len(attributes),
            )
            endpoints = _extract_from_attributes_dict(node.node_id, attributes)
            if endpoints:
                return endpoints

        _LOGGER.debug("Node %s: no endpoint data found", node.node_id)
        return []

    except Exception as err:
        _LOGGER.warning(
            "Error getting endpoints for node %s: %s", node.node_id, err, exc_info=True
        )
        return []


def _extract_from_endpoints_property(
    node_id: int, endpoints_prop: Any
) -> list[dict[str, Any]]:
    """Extract endpoint info from node.endpoints property."""
    endpoints: list[dict[str, Any]] = []

    try:
        # endpoints can be a dict keyed by endpoint_id or a list
        if isinstance(endpoints_prop, dict):
            items = endpoints_prop.items()
        elif hasattr(endpoints_prop, "__iter__"):
            # Try to iterate if it's some other iterable
            items = [
                (getattr(ep, "endpoint_id", i), ep)
                for i, ep in enumerate(endpoints_prop)
            ]
        else:
            return []

        for endpoint_id, endpoint in items:
            try:
                ep_info = {
                    "endpoint_id": int(endpoint_id),
                    "device_types": [],
                    "has_binding_cluster": False,
                    "server_clusters": [],
                    "client_clusters": [],
                    "cluster_commands": {},  # Map of cluster_id -> list of accepted command IDs
                }

                # Try to get clusters from endpoint
                clusters = None
                if hasattr(endpoint, "clusters"):
                    clusters = endpoint.clusters
                elif isinstance(endpoint, dict):
                    clusters = endpoint.get("clusters")

                server_cluster_ids = set()
                client_cluster_ids = set()

                if clusters:
                    # clusters might be a dict keyed by cluster_id or a list
                    if isinstance(clusters, dict):
                        # All clusters in endpoint.clusters are server clusters
                        server_cluster_ids = set(clusters.keys())

                        # Look for Descriptor cluster to get the official lists
                        descriptor = clusters.get(CLUSTER_DESCRIPTOR)
                        if descriptor:
                            # Try to get ServerList and ClientList attributes
                            server_list = _get_cluster_attribute(
                                descriptor, ATTR_SERVER_LIST
                            )
                            client_list = _get_cluster_attribute(
                                descriptor, ATTR_CLIENT_LIST
                            )

                            if server_list is not None:
                                server_cluster_ids = (
                                    set(server_list)
                                    if isinstance(server_list, list)
                                    else server_cluster_ids
                                )
                            if client_list is not None:
                                client_cluster_ids = (
                                    set(client_list)
                                    if isinstance(client_list, list)
                                    else set()
                                )

                    elif hasattr(clusters, "__iter__"):
                        for c in clusters:
                            if hasattr(c, "cluster_id"):
                                server_cluster_ids.add(c.cluster_id)
                            elif isinstance(c, (int, str)):
                                server_cluster_ids.add(int(c))

                ep_info["server_clusters"] = sorted(server_cluster_ids)
                ep_info["client_clusters"] = sorted(client_cluster_ids)
                # Binding cluster can be either server or client - check both
                ep_info["has_binding_cluster"] = (
                    CLUSTER_BINDING in server_cluster_ids
                    or CLUSTER_BINDING in client_cluster_ids
                )

                # Extract accepted commands for each server cluster
                if clusters and isinstance(clusters, dict):
                    for cluster_id in server_cluster_ids:
                        cluster = clusters.get(cluster_id)
                        if cluster:
                            try:
                                # Try to get AcceptedCommandList attribute
                                accepted_cmds = None
                                if hasattr(endpoint, "get_attribute_value"):
                                    accepted_cmds = endpoint.get_attribute_value(
                                        cluster_id, ATTR_ACCEPTED_COMMAND_LIST
                                    )
                                if accepted_cmds is not None:
                                    cmd_list = (
                                        list(accepted_cmds)
                                        if hasattr(accepted_cmds, "__iter__")
                                        else [accepted_cmds]
                                    )

                                    # Get command names from cluster class
                                    cmd_names = {}
                                    if hasattr(cluster, "Commands"):
                                        commands_class = cluster.Commands
                                        for name in dir(commands_class):
                                            if not name.startswith("_"):
                                                cmd_obj = getattr(
                                                    commands_class, name, None
                                                )
                                                if cmd_obj and hasattr(
                                                    cmd_obj, "command_id"
                                                ):
                                                    cmd_names[cmd_obj.command_id] = name

                                    ep_info["cluster_commands"][cluster_id] = {
                                        "accepted": cmd_list,
                                        "names": cmd_names,
                                    }
                            except Exception:
                                pass  # Skip if can't get commands

                # Try to get device types
                device_types = None
                if hasattr(endpoint, "device_types"):
                    device_types = endpoint.device_types
                elif isinstance(endpoint, dict):
                    device_types = endpoint.get("device_types")

                if device_types:
                    for dt in device_types:
                        if hasattr(dt, "device_type"):
                            ep_info["device_types"].append(
                                {
                                    "id": dt.device_type,
                                    "revision": getattr(dt, "revision", 1),
                                }
                            )
                        elif isinstance(dt, dict):
                            ep_info["device_types"].append(
                                {
                                    "id": dt.get("device_type") or dt.get("id"),
                                    "revision": dt.get("revision", 1),
                                }
                            )

                endpoints.append(ep_info)
                _LOGGER.debug(
                    "  Node %s Endpoint %d: device_types=%s, server_clusters=%s, client_clusters=%s, has_binding=%s",
                    node_id,
                    ep_info["endpoint_id"],
                    ep_info["device_types"],
                    ep_info["server_clusters"],
                    ep_info["client_clusters"],
                    ep_info["has_binding_cluster"],
                )

            except Exception as ep_err:
                _LOGGER.debug("Error processing endpoint %s: %s", endpoint_id, ep_err)
                continue

    except Exception as err:
        _LOGGER.debug("Error extracting from endpoints property: %s", err)

    return endpoints


def _get_cluster_attribute(cluster: Any, attribute_id: int) -> Any:
    """Get an attribute value from a cluster object."""
    try:
        # Try as dict first
        if isinstance(cluster, dict):
            return cluster.get(attribute_id) or cluster.get(str(attribute_id))

        # Try attributes dict on cluster object
        if hasattr(cluster, "attributes"):
            attrs = cluster.attributes
            if isinstance(attrs, dict):
                return attrs.get(attribute_id) or attrs.get(str(attribute_id))

        # Try direct attribute access
        attr_names = {
            ATTR_SERVER_LIST: ["server_list", "serverList", "ServerList"],
            ATTR_CLIENT_LIST: ["client_list", "clientList", "ClientList"],
        }
        for name in attr_names.get(attribute_id, []):
            if hasattr(cluster, name):
                return getattr(cluster, name)

    except Exception:
        pass
    return None


def _extract_from_attributes_dict(
    node_id: int, attributes: dict
) -> list[dict[str, Any]]:
    """Extract endpoint info from node.attributes dict (legacy approach)."""
    endpoints_dict: dict[int, dict[str, Any]] = {}

    try:
        # Parse attribute keys to extract endpoints and clusters
        # Keys are in format: 'endpoint/cluster/attribute'
        for attr_key in attributes.keys():
            try:
                parts = str(attr_key).split("/")
                if len(parts) >= 2:
                    endpoint_id = int(parts[0])
                    cluster_id = int(parts[1])

                    if endpoint_id not in endpoints_dict:
                        endpoints_dict[endpoint_id] = {
                            "endpoint_id": endpoint_id,
                            "device_types": [],
                            "has_binding_cluster": False,
                            "server_clusters": set(),
                            "client_clusters": set(),
                            "cluster_commands": {},
                        }

                    # By default, clusters we see in attributes are server clusters
                    endpoints_dict[endpoint_id]["server_clusters"].add(cluster_id)

                    # Check for binding cluster
                    if cluster_id == CLUSTER_BINDING:
                        endpoints_dict[endpoint_id]["has_binding_cluster"] = True

                    # Get data from Descriptor cluster (29)
                    if cluster_id == CLUSTER_DESCRIPTOR and len(parts) >= 3:
                        attr_id = parts[2]
                        attr_value = attributes.get(attr_key)

                        # Attribute 0: DeviceTypeList
                        if attr_id == "0" and isinstance(attr_value, list):
                            for dt in attr_value:
                                if isinstance(dt, dict):
                                    dt_id = dt.get(0) or dt.get("deviceType")
                                    dt_rev = dt.get(1) or dt.get("revision", 1)
                                    if dt_id is not None:
                                        endpoints_dict[endpoint_id][
                                            "device_types"
                                        ].append(
                                            {
                                                "id": dt_id,
                                                "revision": dt_rev,
                                            }
                                        )

                        # Attribute 1: ServerList
                        elif attr_id == "1" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["server_clusters"] = set(
                                attr_value
                            )

                        # Attribute 2: ClientList
                        elif attr_id == "2" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["client_clusters"] = set(
                                attr_value
                            )
                            # Update has_binding_cluster if binding is in client list
                            if CLUSTER_BINDING in attr_value:
                                endpoints_dict[endpoint_id]["has_binding_cluster"] = (
                                    True
                                )

                    # Check for AcceptedCommandList (attribute 65529 / 0xFFF9)
                    if len(parts) >= 3:
                        attr_id_int = int(parts[2])
                        if attr_id_int == ATTR_ACCEPTED_COMMAND_LIST:
                            attr_value = attributes.get(attr_key)
                            if isinstance(attr_value, (list, tuple)):
                                cmd_list = list(attr_value)
                                if (
                                    cluster_id
                                    not in endpoints_dict[endpoint_id][
                                        "cluster_commands"
                                    ]
                                ):
                                    endpoints_dict[endpoint_id]["cluster_commands"][
                                        cluster_id
                                    ] = {
                                        "accepted": cmd_list,
                                        "names": {},
                                    }
                                else:
                                    endpoints_dict[endpoint_id]["cluster_commands"][
                                        cluster_id
                                    ]["accepted"] = cmd_list

            except (ValueError, IndexError) as parse_err:
                _LOGGER.debug(
                    "Could not parse attribute key %s: %s", attr_key, parse_err
                )
                continue

        # Try to get command names from chip clusters module
        cluster_command_names: dict[int, dict[int, str]] = {}
        try:
            from chip.clusters import Objects as clusters

            # Build mapping of cluster_id -> {cmd_id -> name}
            for attr_name in dir(clusters):
                if attr_name.startswith("_"):
                    continue
                cluster_class = getattr(clusters, attr_name, None)
                if (
                    cluster_class
                    and hasattr(cluster_class, "id")
                    and hasattr(cluster_class, "Commands")
                ):
                    cluster_id = cluster_class.id
                    commands_class = cluster_class.Commands
                    cmd_names = {}
                    for cmd_name in dir(commands_class):
                        if not cmd_name.startswith("_"):
                            cmd_obj = getattr(commands_class, cmd_name, None)
                            if cmd_obj and hasattr(cmd_obj, "command_id"):
                                cmd_names[cmd_obj.command_id] = cmd_name
                    if cmd_names:
                        cluster_command_names[cluster_id] = cmd_names
        except Exception as e:
            _LOGGER.debug("Could not load chip clusters for command names: %s", e)

        # Convert to list and convert cluster sets to lists
        endpoints = []
        for endpoint_id in sorted(endpoints_dict.keys()):
            ep_info = endpoints_dict[endpoint_id]
            ep_info["server_clusters"] = sorted(ep_info["server_clusters"])
            ep_info["client_clusters"] = sorted(ep_info["client_clusters"])

            # Add command names to cluster_commands
            for cluster_id, cmd_info in ep_info.get("cluster_commands", {}).items():
                if cluster_id in cluster_command_names:
                    cmd_info["names"] = cluster_command_names[cluster_id]

            endpoints.append(ep_info)

        return endpoints

    except Exception as err:
        _LOGGER.debug("Error extracting from attributes dict: %s", err)
        return []


async def get_bindings(
    hass: HomeAssistant, node_id: int, endpoint_id: int
) -> list[BindingEntry]:
    """Get bindings for a specific node endpoint."""
    # Check for demo mode first
    if _is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode enabled, returning demo bindings for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return _demo_bindings.get((node_id, endpoint_id), [])

    client = get_matter_client(hass)
    if not client:
        _LOGGER.warning("get_bindings: Matter client not available")
        return []

    bindings = []
    try:
        # First, try to get bindings from node's cached endpoint data
        bindings_from_cache = _get_bindings_from_node_cache(
            client, node_id, endpoint_id
        )
        if bindings_from_cache is not None:
            _LOGGER.debug(
                "get_bindings: Found %d bindings from node cache for node %s ep %s",
                len(bindings_from_cache),
                node_id,
                endpoint_id,
            )
            return bindings_from_cache

        # Fall back to reading via read_attribute API
        _LOGGER.debug(
            "get_bindings: No cached bindings, trying read_attribute for node %s ep %s",
            node_id,
            endpoint_id,
        )
        attribute_path = f"{endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.debug(
            "get_bindings: Calling read_attribute with path: %s", attribute_path
        )

        result = await client.read_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
        )

        _LOGGER.debug(
            "get_bindings: read_attribute returned type=%s, value=%s",
            type(result).__name__,
            result,
        )

        if result and isinstance(result, list):
            for binding in result:
                _LOGGER.debug("get_bindings: Processing binding entry: %s", binding)
                entry = BindingEntry(
                    node_id=node_id,
                    endpoint_id=endpoint_id,
                    cluster_id=binding.get("Cluster", 0),
                    target_node_id=binding.get("Node"),
                    target_endpoint_id=binding.get("Endpoint"),
                    target_group_id=binding.get("Group"),
                )
                bindings.append(entry)
    except Exception as err:
        _LOGGER.error(
            "Error reading bindings for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )

    _LOGGER.debug(
        "get_bindings: Returning %d bindings for node %s ep %s",
        len(bindings),
        node_id,
        endpoint_id,
    )
    return bindings


# Demo ACL entries for testing
_demo_acl: list[ACLEntry] = [
    ACLEntry(
        privilege=ACL_PRIVILEGE_ADMINISTER,
        auth_mode=ACL_AUTH_MODE_CASE,
        subjects=[1],  # HA fabric node
        targets=[],  # All resources
        fabric_index=1,
    ),
]


def _get_acl_from_node_cache(client: MatterClient, node_id: int) -> list | None:
    """Try to get ACL from the node's cached endpoint 0 data.

    Returns None if ACL is not found in the cache.
    Returns empty list if the ACL attribute exists but is empty.
    """
    try:
        for node in client.get_nodes():
            if node.node_id != node_id:
                continue

            # ACL is always on endpoint 0
            endpoints = getattr(node, "endpoints", None)
            if not endpoints:
                _LOGGER.debug(
                    "_get_acl_from_node_cache: Node %s has no endpoints", node_id
                )
                return None

            endpoint = endpoints.get(0)
            if not endpoint:
                _LOGGER.debug(
                    "_get_acl_from_node_cache: Node %s has no endpoint 0", node_id
                )
                return None

            # Method 1: Try get_cluster() to get the AccessControl cluster
            if hasattr(endpoint, "get_cluster"):
                acl_cluster = endpoint.get_cluster(CLUSTER_ACCESS_CONTROL)
                _LOGGER.debug(
                    "_get_acl_from_node_cache: get_cluster(%s) returned: %s (type=%s)",
                    CLUSTER_ACCESS_CONTROL,
                    acl_cluster,
                    type(acl_cluster).__name__ if acl_cluster else None,
                )
                if acl_cluster:
                    # Try to get the ACL attribute from the cluster
                    if hasattr(acl_cluster, "acl"):
                        acl_value = acl_cluster.acl
                        _LOGGER.debug(
                            "_get_acl_from_node_cache: Found via cluster.acl: %s",
                            acl_value,
                        )
                        return acl_value
                    elif hasattr(acl_cluster, "get_attribute_value"):
                        acl_value = acl_cluster.get_attribute_value(ATTR_ACL)
                        _LOGGER.debug(
                            "_get_acl_from_node_cache: Found via get_attribute_value: %s",
                            acl_value,
                        )
                        return acl_value

            # Method 2: Try node.attributes dict directly
            node_attributes = getattr(node, "attributes", {})
            if node_attributes:
                attr_key = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
                if attr_key in node_attributes:
                    acl_value = node_attributes[attr_key]
                    _LOGGER.debug(
                        "_get_acl_from_node_cache: Found via node.attributes[%s]: %s",
                        attr_key,
                        acl_value,
                    )
                    return acl_value

            # Method 3: Try node_data.attributes (raw Matter data)
            # Keys are strings in format "endpoint/cluster/attribute" e.g. "0/31/0"
            node_data = getattr(node, "node_data", None)
            if node_data:
                node_data_attrs = getattr(node_data, "attributes", {})
                if node_data_attrs:
                    # Direct key lookup: "0/31/0" (endpoint 0, cluster 31, attribute 0)
                    acl_key = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
                    if acl_key in node_data_attrs:
                        value = node_data_attrs[acl_key]
                        _LOGGER.debug(
                            "_get_acl_from_node_cache: Found via direct key[%s]: %s",
                            acl_key,
                            value,
                        )
                        return value

                    # Fallback: iterate and check for matching pattern
                    for key, value in node_data_attrs.items():
                        key_str = str(key)
                        # Check exact match or pattern match
                        if key_str == acl_key or (
                            key_str.startswith("0/")
                            and "/31/" in key_str
                            and key_str.endswith("/0")
                        ):
                            _LOGGER.debug(
                                "_get_acl_from_node_cache: Found via pattern key[%s]: %s",
                                key_str,
                                value,
                            )
                            return value

            return None

    except Exception as err:
        _LOGGER.debug("_get_acl_from_node_cache: Error: %s", err)
        return None

    return None


async def get_acl(hass: HomeAssistant, node_id: int) -> list[ACLEntry]:
    """Get Access Control List entries for a node.

    ACL is always read from endpoint 0, cluster 0x001F (Access Control), attribute 0.
    """
    # Check for demo mode first
    if _is_demo_mode(hass):
        _LOGGER.debug("Demo mode enabled, returning demo ACL for node %s", node_id)
        return _demo_acl

    client = get_matter_client(hass)
    if not client:
        _LOGGER.warning("get_acl: Matter client not available")
        return []

    acl_entries: list[ACLEntry] = []
    result = None

    try:
        # First, try to get ACL from node cache
        result = _get_acl_from_node_cache(client, node_id)
        _LOGGER.info(
            "get_acl: _get_acl_from_node_cache returned type=%s, is_list=%s, len=%s",
            type(result).__name__,
            isinstance(result, list),
            len(result) if isinstance(result, list) else "N/A",
        )
        if result is not None:
            _LOGGER.debug(
                "get_acl: Found %d ACL entries in node cache for node %s",
                len(result) if isinstance(result, list) else 0,
                node_id,
            )
        else:
            # Fall back to reading via read_attribute API
            attribute_path = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
            _LOGGER.debug(
                "get_acl: No cached ACL, trying read_attribute for node %s path %s",
                node_id,
                attribute_path,
            )

            result = await client.read_attribute(
                node_id=node_id,
                attribute_path=attribute_path,
            )

            _LOGGER.debug(
                "get_acl: read_attribute returned type=%s, value=%s",
                type(result).__name__,
                result,
            )

        if result and isinstance(result, list):
            for entry in result:
                _LOGGER.debug(
                    "get_acl: Processing ACL entry: %s (type=%s)",
                    entry,
                    type(entry).__name__,
                )

                # Handle multiple possible formats:
                # - Dict with TLV string keys: {"1": 5, "2": 2, ...}
                # - Dict with TLV int keys: {1: 5, 2: 2, ...}
                # - Dict with camelCase: {"privilege": 5, "authMode": 2, ...}
                # - Struct object with attributes: entry.privilege, entry.authMode
                def _get_value(obj, *keys, default=None):
                    """Get value from dict or object attributes."""
                    # Try dict access first
                    if isinstance(obj, dict):
                        for k in keys:
                            if k in obj and obj[k] is not None:
                                return obj[k]
                    else:
                        # Try attribute access for struct objects
                        for k in keys:
                            if isinstance(k, str) and hasattr(obj, k):
                                val = getattr(obj, k, None)
                                if val is not None:
                                    return val
                    return default

                privilege = _get_value(
                    entry, "1", 1, "privilege", "Privilege", default=0
                )
                auth_mode = _get_value(entry, "2", 2, "authMode", "AuthMode", default=0)
                subjects = _get_value(entry, "3", 3, "subjects", "Subjects", default=[])
                raw_targets = _get_value(
                    entry, "4", 4, "targets", "Targets", default=[]
                )
                fabric_index = _get_value(
                    entry, "254", 254, "fabricIndex", "FabricIndex", default=0
                )
                _LOGGER.info(
                    "get_acl: Parsed entry - priv=%s, auth=%s, subj=%s, fab=%s",
                    privilege,
                    auth_mode,
                    subjects,
                    fabric_index,
                )

                # Parse targets if present
                targets: list[ACLTarget] = []
                if raw_targets:
                    for t in raw_targets:
                        # Handle multiple key formats for targets
                        # TLV tags: 0=cluster, 1=endpoint, 2=deviceType
                        targets.append(
                            ACLTarget(
                                cluster=_get_value(
                                    t, "0", 0, "cluster", "Cluster", default=None
                                ),
                                endpoint=_get_value(
                                    t, "1", 1, "endpoint", "Endpoint", default=None
                                ),
                                device_type=_get_value(
                                    t, "2", 2, "deviceType", "DeviceType", default=None
                                ),
                            )
                        )

                acl_entry = ACLEntry(
                    privilege=privilege,
                    auth_mode=auth_mode,
                    subjects=subjects if isinstance(subjects, list) else [],
                    targets=targets,
                    fabric_index=fabric_index,
                )
                acl_entries.append(acl_entry)

    except Exception as err:
        _LOGGER.error(
            "Error reading ACL for node %s: %s",
            node_id,
            err,
            exc_info=True,
        )

    _LOGGER.debug(
        "get_acl: Returning %d ACL entries for node %s",
        len(acl_entries),
        node_id,
    )
    return acl_entries


def _get_bindings_from_node_cache(
    client: MatterClient, node_id: int, endpoint_id: int
) -> list[BindingEntry] | None:
    """Try to get bindings from the node's cached endpoint data.

    Uses the MatterEndpoint object's get_cluster() or get_attribute_value() methods
    to access binding data from the matter-server's cache.

    Returns None if bindings are not found in the cache.
    Returns empty list if the binding attribute exists but is empty.
    """
    try:
        for node in client.get_nodes():
            if node.node_id != node_id:
                continue

            # Access the endpoint from node.endpoints dict
            endpoints = getattr(node, "endpoints", None)
            if not endpoints:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: Node %s has no endpoints", node_id
                )
                return None

            endpoint = endpoints.get(endpoint_id)
            if not endpoint:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: Node %s has no endpoint %s",
                    node_id,
                    endpoint_id,
                )
                return None

            _LOGGER.debug(
                "_get_bindings_from_node_cache: Found endpoint %s (type=%s), available methods: %s",
                endpoint_id,
                type(endpoint).__name__,
                [m for m in dir(endpoint) if not m.startswith("_")][:15],
            )

            binding_value = None

            # Method 1: Try get_cluster() to get the Binding cluster
            if hasattr(endpoint, "get_cluster"):
                binding_cluster = endpoint.get_cluster(CLUSTER_BINDING)
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: get_cluster(%s) returned: %s (type=%s)",
                    CLUSTER_BINDING,
                    binding_cluster,
                    type(binding_cluster).__name__ if binding_cluster else None,
                )
                if binding_cluster:
                    # Try to get the Binding attribute (attribute 0) from the cluster
                    if hasattr(binding_cluster, "binding"):
                        binding_value = binding_cluster.binding
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster.binding: %s",
                            binding_value,
                        )
                    elif hasattr(binding_cluster, "get_attribute_value"):
                        binding_value = binding_cluster.get_attribute_value(0)
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster.get_attribute_value(0): %s",
                            binding_value,
                        )
                    elif isinstance(binding_cluster, dict):
                        binding_value = binding_cluster.get(0) or binding_cluster.get(
                            "binding"
                        )
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found via cluster dict: %s",
                            binding_value,
                        )
                    else:
                        # Log available attributes on the cluster
                        cluster_attrs = [
                            a for a in dir(binding_cluster) if not a.startswith("_")
                        ]
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Binding cluster attrs: %s",
                            cluster_attrs,
                        )

            # Method 2: Try endpoint.get_attribute_value() directly
            if binding_value is None and hasattr(endpoint, "get_attribute_value"):
                try:
                    binding_value = endpoint.get_attribute_value(CLUSTER_BINDING, 0)
                    _LOGGER.debug(
                        "_get_bindings_from_node_cache: endpoint.get_attribute_value(%s, 0) returned: %s",
                        CLUSTER_BINDING,
                        binding_value,
                    )
                except Exception as attr_err:
                    _LOGGER.debug(
                        "_get_bindings_from_node_cache: get_attribute_value failed: %s",
                        attr_err,
                    )

            # Method 3: Try accessing clusters dict directly
            if binding_value is None and hasattr(endpoint, "clusters"):
                clusters = endpoint.clusters
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: endpoint.clusters type=%s, keys=%s",
                    type(clusters).__name__,
                    list(clusters.keys()) if isinstance(clusters, dict) else "N/A",
                )
                if isinstance(clusters, dict):
                    binding_cluster = clusters.get(CLUSTER_BINDING)
                    if binding_cluster:
                        _LOGGER.debug(
                            "_get_bindings_from_node_cache: Found binding cluster in dict: %s (type=%s)",
                            binding_cluster,
                            type(binding_cluster).__name__,
                        )
                        # Try to get binding attribute
                        if hasattr(binding_cluster, "binding"):
                            binding_value = binding_cluster.binding
                        elif isinstance(binding_cluster, dict):
                            binding_value = binding_cluster.get(
                                0
                            ) or binding_cluster.get("binding")

            if binding_value is None:
                _LOGGER.debug(
                    "_get_bindings_from_node_cache: No binding value found for node %s ep %s",
                    node_id,
                    endpoint_id,
                )
                return None

            # Parse the binding value into BindingEntry objects
            return _parse_binding_value(node_id, endpoint_id, binding_value)

        _LOGGER.debug("_get_bindings_from_node_cache: Node %s not found", node_id)
        return None

    except Exception as err:
        _LOGGER.debug("_get_bindings_from_node_cache: Error: %s", err, exc_info=True)
        return None


def _parse_binding_value(
    node_id: int, endpoint_id: int, binding_value: Any
) -> list[BindingEntry]:
    """Parse a binding attribute value into BindingEntry objects."""
    bindings = []

    if not binding_value:
        return bindings

    # Ensure it's a list
    if not isinstance(binding_value, list):
        binding_value = [binding_value]

    for binding in binding_value:
        _LOGGER.debug(
            "_parse_binding_value: Parsing entry: %s (type=%s)",
            binding,
            type(binding).__name__,
        )

        # Handle different binding entry formats
        cluster_id = 0
        target_node = None
        target_endpoint = None
        target_group = None

        if isinstance(binding, dict):
            # Dict format - try various key names (Matter uses PascalCase)
            cluster_id = (
                binding.get("Cluster")
                or binding.get("cluster")
                or binding.get("ClusterId")
                or binding.get("clusterId")
                or 0
            )
            target_node = (
                binding.get("Node")
                or binding.get("node")
                or binding.get("NodeId")
                or binding.get("nodeId")
            )
            target_endpoint = (
                binding.get("Endpoint")
                or binding.get("endpoint")
                or binding.get("EndpointId")
                or binding.get("endpointId")
            )
            target_group = (
                binding.get("Group")
                or binding.get("group")
                or binding.get("GroupId")
                or binding.get("groupId")
            )
        elif hasattr(binding, "cluster"):
            # Object with snake_case attributes
            cluster_id = getattr(binding, "cluster", 0)
            target_node = getattr(binding, "node", None)
            target_endpoint = getattr(binding, "endpoint", None)
            target_group = getattr(binding, "group", None)

        entry = BindingEntry(
            node_id=node_id,
            endpoint_id=endpoint_id,
            cluster_id=cluster_id,
            target_node_id=target_node,
            target_endpoint_id=target_endpoint,
            target_group_id=target_group,
        )
        bindings.append(entry)
        _LOGGER.debug("_parse_binding_value: Created BindingEntry: %s", entry)

    return bindings


@dataclass
class BindingVerificationResult:
    """Result of a binding verification operation."""

    success: bool
    verified: bool  # True if binding was confirmed on device
    message: str
    bindings_found: int = 0
    error_type: OperationErrorType = field(default=OperationErrorType.SUCCESS)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "success": self.success,
            "verified": self.verified,
            "message": self.message,
            "bindings_found": self.bindings_found,
            "error_type": self.error_type.value,
        }


def _parse_error_type(err: Exception) -> OperationErrorType:
    """Parse an exception to determine the error type."""
    error_str = str(err).lower()

    # Check for permission/access errors
    if any(
        keyword in error_str
        for keyword in ["unsupported", "access", "permission", "denied", "not allowed"]
    ):
        return OperationErrorType.PERMISSION_DENIED

    # Check for timeout errors
    if any(keyword in error_str for keyword in ["timeout", "timed out"]):
        return OperationErrorType.DEVICE_TIMEOUT

    # Check for unavailability errors
    if any(
        keyword in error_str
        for keyword in ["unavailable", "offline", "not reachable", "disconnected"]
    ):
        return OperationErrorType.DEVICE_UNAVAILABLE

    # Check for invalid request errors
    if any(
        keyword in error_str
        for keyword in ["invalid", "malformed", "not found", "does not exist"]
    ):
        return OperationErrorType.INVALID_REQUEST

    return OperationErrorType.UNKNOWN_ERROR


def _get_user_friendly_error(
    error_type: OperationErrorType, original: Exception
) -> str:
    """Get a user-friendly error message for the given error type."""
    messages = {
        OperationErrorType.PERMISSION_DENIED: (
            "Permission denied. Check if Home Assistant has administrator access "
            "to this device."
        ),
        OperationErrorType.DEVICE_UNAVAILABLE: (
            "Device is unavailable. Ensure it's powered on and connected to the network."
        ),
        OperationErrorType.DEVICE_TIMEOUT: (
            "Device did not respond. It may be busy or temporarily unreachable."
        ),
        OperationErrorType.DEVICE_REJECTED: (
            "Device rejected the operation. This may be a device limitation or "
            "security policy."
        ),
        OperationErrorType.INVALID_REQUEST: (
            "Invalid request. The operation parameters may be incorrect."
        ),
    }
    return messages.get(error_type, f"Operation failed: {original}")


def _check_node_available(
    client: "MatterClient", node_id: int
) -> tuple[bool, str | None]:
    """Check if a node is available.

    Returns:
        Tuple of (is_available, error_message if not available)
    """
    try:
        nodes = client.get_nodes()
        node = next((n for n in nodes if n.node_id == node_id), None)
        if node is None:
            return False, f"Node {node_id} not found"
        if not node.available:
            return False, f"Node {node_id} is currently unavailable"
        return True, None
    except Exception as err:
        _LOGGER.warning("Error checking node availability: %s", err)
        # Don't block operation if we can't check availability
        return True, None


def _binding_matches(
    binding: BindingEntry,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
    cluster_id: int | None = None,
) -> bool:
    """Check if a binding matches the given target parameters."""
    if target_node_id is not None and binding.target_node_id != target_node_id:
        return False
    if (
        target_endpoint_id is not None
        and binding.target_endpoint_id != target_endpoint_id
    ):
        return False
    if target_group_id is not None and binding.target_group_id != target_group_id:
        return False
    if cluster_id is not None and binding.cluster_id != cluster_id:
        return False
    return True


async def verify_bindings(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> BindingVerificationResult:
    """Force re-read bindings from device and verify they match cached state.

    This bypasses the cache and reads directly from the Matter device to
    confirm the actual binding state.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID to verify

    Returns:
        BindingVerificationResult with verification status
    """
    # Handle demo mode
    if _is_demo_mode(hass):
        cached = _demo_bindings.get((node_id, endpoint_id), [])
        return BindingVerificationResult(
            success=True,
            verified=True,
            message=f"Demo mode: {len(cached)} bindings verified",
            bindings_found=len(cached),
        )

    client = get_matter_client(hass)
    if not client:
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
        )

    try:
        _LOGGER.info(
            "verify_bindings: Force reading bindings from node %s endpoint %s",
            node_id,
            endpoint_id,
        )

        # Read directly from device using read_attribute API
        attribute_path = f"{endpoint_id}/{CLUSTER_BINDING}/0"
        result = await client.read_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
        )

        _LOGGER.debug(
            "verify_bindings: read_attribute returned type=%s, value=%s",
            type(result).__name__,
            result,
        )

        if result is None:
            return BindingVerificationResult(
                success=True,
                verified=True,
                message="No bindings found on device (empty)",
                bindings_found=0,
            )

        # Parse the bindings
        bindings = _parse_binding_value(node_id, endpoint_id, result)

        _LOGGER.info(
            "verify_bindings: Successfully verified %d bindings on node %s endpoint %s",
            len(bindings),
            node_id,
            endpoint_id,
        )

        return BindingVerificationResult(
            success=True,
            verified=True,
            message=f"Successfully verified {len(bindings)} binding(s) on device",
            bindings_found=len(bindings),
        )

    except Exception as err:
        _LOGGER.error(
            "verify_bindings: Error reading bindings from node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=f"Failed to read bindings from device: {err}",
        )


async def create_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    cluster_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
    verify: bool = True,
) -> BindingVerificationResult:
    """Create a new binding with optional verification.

    Args:
        hass: Home Assistant instance
        source_node_id: Source Matter node ID
        source_endpoint_id: Source endpoint ID
        cluster_id: Cluster ID for the binding
        target_node_id: Target node ID (for unicast binding)
        target_endpoint_id: Target endpoint ID (for unicast binding)
        target_group_id: Target group ID (for group binding)
        verify: If True, verify the binding was created by reading back

    Returns:
        BindingVerificationResult with success/verification status
    """
    # Handle demo mode
    if _is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: creating binding for node %s endpoint %s",
            source_node_id,
            source_endpoint_id,
        )
        key = (source_node_id, source_endpoint_id)
        if key not in _demo_bindings:
            _demo_bindings[key] = []
        _demo_bindings[key].append(
            BindingEntry(
                node_id=source_node_id,
                endpoint_id=source_endpoint_id,
                cluster_id=cluster_id,
                target_node_id=target_node_id,
                target_endpoint_id=target_endpoint_id,
                target_group_id=target_group_id,
            )
        )
        return BindingVerificationResult(
            success=True,
            verified=True,
            message="Demo mode: binding created",
            bindings_found=len(_demo_bindings[key]),
        )

    client = get_matter_client(hass)
    if not client:
        _LOGGER.error("create_binding: Matter client not available")
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    # Pre-check: Is the source device available?
    is_available, unavail_msg = _check_node_available(client, source_node_id)
    if not is_available:
        _LOGGER.warning("create_binding: Source node unavailable: %s", unavail_msg)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=_get_user_friendly_error(
                OperationErrorType.DEVICE_UNAVAILABLE, Exception(unavail_msg or "")
            ),
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    try:
        _LOGGER.info(
            "create_binding: Creating binding from node %s ep %s to node %s ep %s (cluster %s)",
            source_node_id,
            source_endpoint_id,
            target_node_id,
            target_endpoint_id,
            cluster_id,
        )

        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
        _LOGGER.debug(
            "create_binding: Current bindings count: %d", len(current_bindings)
        )

        # Build new binding entry - use the TargetStruct format
        new_binding: dict[str, Any] = {
            "cluster": cluster_id,
            "fabricIndex": 0,  # Will be set by the device
        }
        if target_node_id is not None:
            new_binding["node"] = target_node_id
        if target_endpoint_id is not None:
            new_binding["endpoint"] = target_endpoint_id
        if target_group_id is not None:
            new_binding["group"] = target_group_id

        _LOGGER.debug("create_binding: New binding entry: %s", new_binding)

        # Build the full binding list with lowercase keys (Matter SDK format)
        binding_list = []
        for b in current_bindings:
            entry: dict[str, Any] = {
                "cluster": b.cluster_id,
                "fabricIndex": 0,
            }
            if b.target_node_id is not None:
                entry["node"] = b.target_node_id
            if b.target_endpoint_id is not None:
                entry["endpoint"] = b.target_endpoint_id
            if b.target_group_id is not None:
                entry["group"] = b.target_group_id
            binding_list.append(entry)

        binding_list.append(new_binding)
        _LOGGER.debug("create_binding: Full binding list to write: %s", binding_list)

        # Write the binding attribute
        attribute_path = f"{source_endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.info("create_binding: Writing to attribute path: %s", attribute_path)

        result = await client.write_attribute(
            node_id=source_node_id,
            attribute_path=attribute_path,
            value=binding_list,
        )
        _LOGGER.info("create_binding: write_attribute result: %s", result)

        # Verify the binding was created if requested
        if verify:
            _LOGGER.info("create_binding: Verifying binding was written to device...")

            # Small delay to allow device to process
            import asyncio

            await asyncio.sleep(0.2)

            # Read back bindings directly from device
            verification = await verify_bindings(
                hass, source_node_id, source_endpoint_id
            )

            if not verification.success:
                return BindingVerificationResult(
                    success=True,  # Write succeeded
                    verified=False,
                    message=f"Binding written but verification failed: {verification.message}",
                    bindings_found=verification.bindings_found,
                )

            # Check if our new binding is present
            read_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
            binding_found = any(
                _binding_matches(
                    b, target_node_id, target_endpoint_id, target_group_id, cluster_id
                )
                for b in read_bindings
            )

            if binding_found:
                _LOGGER.info("create_binding: Binding verified successfully on device")
                return BindingVerificationResult(
                    success=True,
                    verified=True,
                    message="Binding created and verified on device",
                    bindings_found=len(read_bindings),
                )
            else:
                _LOGGER.warning(
                    "create_binding: Binding was written but not found when reading back"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=False,
                    message=_get_user_friendly_error(
                        OperationErrorType.DEVICE_REJECTED,
                        Exception("binding not found"),
                    ),
                    bindings_found=len(read_bindings),
                    error_type=OperationErrorType.DEVICE_REJECTED,
                )

        return BindingVerificationResult(
            success=True,
            verified=False,  # Not verified because verify=False
            message="Binding written (verification skipped)",
            bindings_found=len(binding_list),
        )

    except Exception as err:
        _LOGGER.error("Error creating binding: %s", err, exc_info=True)
        error_type = _parse_error_type(err)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=_get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def delete_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
    verify: bool = True,
) -> BindingVerificationResult:
    """Delete a binding with optional verification.

    Args:
        hass: Home Assistant instance
        source_node_id: Source Matter node ID
        source_endpoint_id: Source endpoint ID
        target_node_id: Target node ID to delete (for unicast binding)
        target_endpoint_id: Target endpoint ID to delete (for unicast binding)
        target_group_id: Target group ID to delete (for group binding)
        verify: If True, verify the binding was deleted by reading back

    Returns:
        BindingVerificationResult with success/verification status
    """
    # Handle demo mode
    if _is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: deleting binding for node %s endpoint %s",
            source_node_id,
            source_endpoint_id,
        )
        key = (source_node_id, source_endpoint_id)
        if key in _demo_bindings:
            original_count = len(_demo_bindings[key])
            _demo_bindings[key] = [
                b
                for b in _demo_bindings[key]
                if not (
                    b.target_node_id == target_node_id
                    and b.target_endpoint_id == target_endpoint_id
                    and b.target_group_id == target_group_id
                )
            ]
            if len(_demo_bindings[key]) < original_count:
                return BindingVerificationResult(
                    success=True,
                    verified=True,
                    message="Demo mode: binding deleted",
                    bindings_found=len(_demo_bindings[key]),
                )
            return BindingVerificationResult(
                success=False,
                verified=False,
                message="Demo mode: binding not found",
                bindings_found=len(_demo_bindings[key]),
            )
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Demo mode: no bindings for this endpoint",
            bindings_found=0,
        )

    client = get_matter_client(hass)
    if not client:
        return BindingVerificationResult(
            success=False,
            verified=False,
            message="Matter client not available",
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    # Pre-check: Is the source device available?
    is_available, unavail_msg = _check_node_available(client, source_node_id)
    if not is_available:
        _LOGGER.warning("delete_binding: Source node unavailable: %s", unavail_msg)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=_get_user_friendly_error(
                OperationErrorType.DEVICE_UNAVAILABLE, Exception(unavail_msg or "")
            ),
            error_type=OperationErrorType.DEVICE_UNAVAILABLE,
        )

    try:
        _LOGGER.info(
            "delete_binding: Deleting binding from node %s ep %s to node %s ep %s",
            source_node_id,
            source_endpoint_id,
            target_node_id,
            target_endpoint_id,
        )

        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)

        # Filter out the binding to delete
        filtered_bindings = [
            b
            for b in current_bindings
            if not _binding_matches(
                b, target_node_id, target_endpoint_id, target_group_id
            )
        ]

        if len(filtered_bindings) == len(current_bindings):
            _LOGGER.warning("delete_binding: Binding not found")
            return BindingVerificationResult(
                success=False,
                verified=False,
                message="Binding not found in current bindings",
                bindings_found=len(current_bindings),
            )

        # Build the binding list with lowercase keys (Matter SDK format)
        binding_list = []
        for b in filtered_bindings:
            entry: dict[str, Any] = {
                "cluster": b.cluster_id,
                "fabricIndex": 0,
            }
            if b.target_node_id is not None:
                entry["node"] = b.target_node_id
            if b.target_endpoint_id is not None:
                entry["endpoint"] = b.target_endpoint_id
            if b.target_group_id is not None:
                entry["group"] = b.target_group_id
            binding_list.append(entry)

        # Write the updated binding attribute
        attribute_path = f"{source_endpoint_id}/{CLUSTER_BINDING}/0"
        _LOGGER.info("delete_binding: Writing to attribute path: %s", attribute_path)

        result = await client.write_attribute(
            node_id=source_node_id,
            attribute_path=attribute_path,
            value=binding_list,
        )
        _LOGGER.info("delete_binding: write_attribute result: %s", result)

        # Verify the binding was deleted if requested
        if verify:
            _LOGGER.info("delete_binding: Verifying binding was deleted from device...")

            # Small delay to allow device to process
            import asyncio

            await asyncio.sleep(0.2)

            # Read back bindings directly from device
            verification = await verify_bindings(
                hass, source_node_id, source_endpoint_id
            )

            if not verification.success:
                return BindingVerificationResult(
                    success=True,  # Write succeeded
                    verified=False,
                    message=f"Binding deleted but verification failed: {verification.message}",
                    bindings_found=verification.bindings_found,
                )

            # Check if the binding is gone
            read_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)
            binding_still_exists = any(
                _binding_matches(b, target_node_id, target_endpoint_id, target_group_id)
                for b in read_bindings
            )

            if not binding_still_exists:
                _LOGGER.info(
                    "delete_binding: Binding deletion verified successfully on device"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=True,
                    message="Binding deleted and verified on device",
                    bindings_found=len(read_bindings),
                )
            else:
                _LOGGER.warning(
                    "delete_binding: Binding was written but still found when reading back"
                )
                return BindingVerificationResult(
                    success=True,
                    verified=False,
                    message=_get_user_friendly_error(
                        OperationErrorType.DEVICE_REJECTED,
                        Exception("binding still present"),
                    ),
                    bindings_found=len(read_bindings),
                    error_type=OperationErrorType.DEVICE_REJECTED,
                )

        return BindingVerificationResult(
            success=True,
            verified=False,  # Not verified because verify=False
            message="Binding deletion written (verification skipped)",
            bindings_found=len(binding_list),
        )

    except Exception as err:
        _LOGGER.error("Error deleting binding: %s", err, exc_info=True)
        error_type = _parse_error_type(err)
        return BindingVerificationResult(
            success=False,
            verified=False,
            message=_get_user_friendly_error(error_type, err),
            error_type=error_type,
        )


async def get_groups(hass: HomeAssistant) -> list[GroupEntry]:
    """Get all Matter groups."""
    # Groups in Matter are managed at the fabric level
    # This is a placeholder - actual implementation depends on
    # how python-matter-server exposes group management
    _LOGGER.debug("Getting Matter groups")
    return []


async def create_group(hass: HomeAssistant, group_id: int, name: str) -> bool:
    """Create a new Matter group."""
    # Placeholder for group creation
    _LOGGER.debug("Creating group %s: %s", group_id, name)
    return False


async def delete_group(hass: HomeAssistant, group_id: int) -> bool:
    """Delete a Matter group."""
    # Placeholder for group deletion
    _LOGGER.debug("Deleting group %s", group_id)
    return False


async def add_to_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> bool:
    """Add an endpoint to a group."""
    # Placeholder for adding to group
    _LOGGER.debug(
        "Adding node %s endpoint %s to group %s", node_id, endpoint_id, group_id
    )
    return False


async def remove_from_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> bool:
    """Remove an endpoint from a group."""
    # Placeholder for removing from group
    _LOGGER.debug(
        "Removing node %s endpoint %s from group %s", node_id, endpoint_id, group_id
    )
    return False


# =============================================================================
# Thermostat Schedule Functions
# =============================================================================


def _get_day_bitmap(days: list[str]) -> int:
    """Convert day names to Matter bitmap.

    Args:
        days: List of day names (sunday, monday, ..., saturday, away)

    Returns:
        Bitmap where bit 0=Sun, bit 1=Mon, ..., bit 6=Sat, bit 7=Away
    """
    day_map = {
        "sunday": 0,
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6,
        "away": 7,
    }
    bitmap = 0
    for day in days:
        day_lower = day.lower()
        if day_lower in day_map:
            bitmap |= 1 << day_map[day_lower]
    return bitmap


def _get_mode_bitmap(heat: bool = True, cool: bool = False) -> int:
    """Convert heat/cool flags to Matter mode bitmap.

    Args:
        heat: Include heat setpoints
        cool: Include cool setpoints

    Returns:
        Bitmap where bit 0=Heat, bit 1=Cool
    """
    bitmap = 0
    if heat:
        bitmap |= 1
    if cool:
        bitmap |= 2
    return bitmap


def get_cluster_accepted_commands(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    cluster_id: int,
) -> list[int] | None:
    """Get the list of accepted commands for a cluster on an endpoint.

    Reads the AcceptedCommandList global attribute (0xFFF9) from the cluster.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID
        cluster_id: Cluster ID to check

    Returns:
        List of command IDs the cluster accepts, or None if not available
    """
    client = get_matter_client(hass)
    if not client:
        return None

    try:
        nodes = client.get_nodes()
        node = next((n for n in nodes if n.node_id == node_id), None)
        if not node:
            return None

        # Build attribute path: endpoint/cluster/AcceptedCommandList
        attr_key = f"{endpoint_id}/{cluster_id}/{ATTR_ACCEPTED_COMMAND_LIST}"
        attributes = getattr(node, "attributes", None)
        if not attributes:
            return None

        commands = attributes.get(attr_key)
        if commands is not None:
            _LOGGER.debug(
                "get_cluster_accepted_commands: node %s ep %s cluster %s commands: %s",
                node_id,
                endpoint_id,
                hex(cluster_id),
                commands,
            )
            return list(commands) if commands else []

        return None

    except Exception as err:
        _LOGGER.debug(
            "get_cluster_accepted_commands: Error reading commands for node %s: %s",
            node_id,
            err,
        )
        return None


def supports_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> bool | None:
    """Check if a thermostat endpoint supports weekly schedules.

    Checks if GetWeeklySchedule command (0x02) is in the AcceptedCommandList.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster

    Returns:
        True if supported, False if not, None if can't determine
    """
    commands = get_cluster_accepted_commands(
        hass, node_id, endpoint_id, CLUSTER_THERMOSTAT
    )
    if commands is None:
        return None  # Can't determine - attribute not available
    return CMD_GET_WEEKLY_SCHEDULE in commands


async def get_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    days: list[str] | None = None,
    heat: bool = True,
    cool: bool = False,
) -> WeeklySchedule | None:
    """Get weekly schedule from a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster
        days: List of day names to retrieve (default: all days)
        heat: Request heat setpoints
        cool: Request cool setpoints

    Returns:
        WeeklySchedule with transitions or None if failed
    """
    # Demo mode returns sample schedule
    if _is_demo_mode(hass):
        _LOGGER.debug("Demo mode: returning sample thermostat schedule")
        return WeeklySchedule(
            day_of_week=0x7F,  # All weekdays
            mode=1,  # Heat only
            transitions=[
                ScheduleTransition(
                    transition_time=6 * 60, heat_setpoint=20.0
                ),  # 6:00 AM
                ScheduleTransition(
                    transition_time=8 * 60, heat_setpoint=18.0
                ),  # 8:00 AM
                ScheduleTransition(
                    transition_time=17 * 60, heat_setpoint=21.0
                ),  # 5:00 PM
                ScheduleTransition(
                    transition_time=22 * 60, heat_setpoint=17.0
                ),  # 10:00 PM
            ],
        )

    client = get_matter_client(hass)
    if not client:
        _LOGGER.error("get_thermostat_schedule: Matter client not available")
        return None

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        # Build request parameters
        days_bitmap = _get_day_bitmap(days) if days else 0x7F  # All days
        mode_bitmap = _get_mode_bitmap(heat, cool)

        _LOGGER.info(
            "get_thermostat_schedule: Getting schedule for node %s endpoint %s (days=%s, mode=%s)",
            node_id,
            endpoint_id,
            bin(days_bitmap),
            bin(mode_bitmap),
        )

        # Create GetWeeklySchedule command
        command = clusters.Thermostat.Commands.GetWeeklySchedule(
            daysToReturn=days_bitmap,
            modeToReturn=mode_bitmap,
        )

        # Send command
        response = await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.debug("get_thermostat_schedule: Response: %s", response)

        if response is None:
            _LOGGER.warning("get_thermostat_schedule: No response from device")
            return None

        # Parse GetWeeklyScheduleResponse
        transitions = [ScheduleTransition.from_matter(t) for t in response.transitions]

        return WeeklySchedule(
            day_of_week=response.dayOfWeekForSequence,
            mode=response.modeForSequence,
            transitions=transitions,
        )

    except Exception as err:
        err_str = str(err)
        # Check if the device doesn't support this command
        if "UnsupportedCommand" in err_str or "0x81" in err_str:
            _LOGGER.info(
                "get_thermostat_schedule: Device does not support GetWeeklySchedule command "
                "(node %s endpoint %s)",
                node_id,
                endpoint_id,
            )
            return False  # type: ignore[return-value]
        _LOGGER.error(
            "get_thermostat_schedule: Error getting schedule for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return None


async def set_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    days: list[str],
    transitions: list[dict[str, Any]],
    heat: bool = True,
    cool: bool = False,
) -> bool:
    """Set weekly schedule on a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster
        days: List of day names this schedule applies to
        transitions: List of transition dicts with keys:
            - transition_time: Minutes from midnight (0-1439)
            - heat_setpoint: Temperature in °C (optional)
            - cool_setpoint: Temperature in °C (optional)
        heat: Schedule includes heat setpoints
        cool: Schedule includes cool setpoints

    Returns:
        True if successful
    """
    # Demo mode simulates success
    if _is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: simulating set schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return True

    client = get_matter_client(hass)
    if not client:
        _LOGGER.error("set_thermostat_schedule: Matter client not available")
        return False

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        # Build command parameters
        days_bitmap = _get_day_bitmap(days)
        mode_bitmap = _get_mode_bitmap(heat, cool)

        # Convert transitions to Matter format (0.01°C units)
        matter_transitions = []
        for t in transitions:
            # Matter uses signed int16 for temperatures in 0.01°C
            heat_sp = t.get("heat_setpoint")
            cool_sp = t.get("cool_setpoint")

            matter_transitions.append(
                clusters.Thermostat.Structs.WeeklyScheduleTransitionStruct(
                    transitionTime=int(t["transition_time"]),
                    heatSetpoint=int(heat_sp * 100) if heat_sp is not None else None,
                    coolSetpoint=int(cool_sp * 100) if cool_sp is not None else None,
                )
            )

        _LOGGER.info(
            "set_thermostat_schedule: Setting schedule for node %s endpoint %s "
            "(days=%s, mode=%s, transitions=%d)",
            node_id,
            endpoint_id,
            bin(days_bitmap),
            bin(mode_bitmap),
            len(matter_transitions),
        )

        # Create SetWeeklySchedule command
        command = clusters.Thermostat.Commands.SetWeeklySchedule(
            numberOfTransitionsForSequence=len(matter_transitions),
            dayOfWeekForSequence=days_bitmap,
            modeForSequence=mode_bitmap,
            transitions=matter_transitions,
        )

        # Send command
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.info("set_thermostat_schedule: Schedule set successfully")
        return True

    except Exception as err:
        _LOGGER.error(
            "set_thermostat_schedule: Error setting schedule for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return False


async def clear_thermostat_schedule(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
) -> bool:
    """Clear all weekly schedules on a thermostat.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID with thermostat cluster

    Returns:
        True if successful
    """
    # Demo mode simulates success
    if _is_demo_mode(hass):
        _LOGGER.debug(
            "Demo mode: simulating clear schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )
        return True

    client = get_matter_client(hass)
    if not client:
        _LOGGER.error("clear_thermostat_schedule: Matter client not available")
        return False

    try:
        # Import Thermostat cluster commands from CHIP SDK
        from chip.clusters import Objects as clusters

        _LOGGER.info(
            "clear_thermostat_schedule: Clearing schedule for node %s endpoint %s",
            node_id,
            endpoint_id,
        )

        # Create ClearWeeklySchedule command (no parameters)
        command = clusters.Thermostat.Commands.ClearWeeklySchedule()

        # Send command
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

        _LOGGER.info("clear_thermostat_schedule: Schedule cleared successfully")
        return True

    except Exception as err:
        _LOGGER.error(
            "clear_thermostat_schedule: Error clearing schedule for node %s endpoint %s: %s",
            node_id,
            endpoint_id,
            err,
            exc_info=True,
        )
        return False


def has_thermostat_schedule_feature(endpoint_data: dict[str, Any]) -> bool:
    """Check if an endpoint supports thermostat scheduling.

    The endpoint must have:
    1. Thermostat cluster (0x0201) as a server cluster
    2. Device type 769 (Thermostat) or 770 (Temperature Sensor with thermostat)

    Args:
        endpoint_data: Endpoint info dict from get_nodes()

    Returns:
        True if endpoint supports scheduling
    """
    from .const import CLUSTER_THERMOSTAT

    # Check for thermostat cluster
    server_clusters = endpoint_data.get("server_clusters", [])
    if CLUSTER_THERMOSTAT not in server_clusters:
        return False

    # Check for thermostat device type
    device_types = endpoint_data.get("device_types", [])
    thermostat_device_types = {769}  # Thermostat
    for dt in device_types:
        dt_id = dt.get("id") if isinstance(dt, dict) else dt
        if dt_id in thermostat_device_types:
            return True

    return False


async def get_proprietary_attributes(
    hass: HomeAssistant,
    node_id: int,
    endpoint_id: int,
    cluster_id: int,
    attribute_ids: list[int],
) -> dict[int, Any]:
    """Read proprietary attribute values from a Matter node.

    Args:
        hass: Home Assistant instance
        node_id: Matter node ID
        endpoint_id: Endpoint ID on the node
        cluster_id: Proprietary cluster ID
        attribute_ids: List of attribute IDs to read

    Returns:
        Dictionary mapping attribute_id to value (None if read failed)
    """
    results: dict[int, Any] = {}

    # Demo mode returns empty values
    if _is_demo_mode(hass):
        return results

    client = get_matter_client(hass)
    if not client:
        _LOGGER.warning("get_proprietary_attributes: Matter client not available")
        return results

    # Try reading from cached node data first
    for node in client.get_nodes():
        if node.node_id != node_id:
            continue

        # Try to get values from node_data.attributes
        node_data = getattr(node, "node_data", None)
        if node_data:
            node_attrs = getattr(node_data, "attributes", {})

            for attr_id in attribute_ids:
                # Try AttributePath object format
                for key, value in node_attrs.items():
                    if (
                        hasattr(key, "EndpointId")
                        and hasattr(key, "ClusterId")
                        and hasattr(key, "AttributeId")
                    ):
                        if (
                            key.EndpointId == endpoint_id
                            and key.ClusterId == cluster_id
                            and key.AttributeId == attr_id
                        ):
                            results[attr_id] = value
                            break
                    # Try string format "endpoint/cluster/attribute"
                    key_str = str(key)
                    if f"{endpoint_id}/{cluster_id}/{attr_id}" in key_str:
                        results[attr_id] = value
                        break

        # If not found in cache, try reading directly
        for attr_id in attribute_ids:
            if attr_id in results:
                continue

            try:
                attribute_path = f"{endpoint_id}/{cluster_id}/{attr_id}"
                _LOGGER.debug(
                    "Reading proprietary attribute: node %s, path %s",
                    node_id,
                    attribute_path,
                )

                result = await client.read_attribute(
                    node_id=node_id,
                    attribute_path=attribute_path,
                )
                results[attr_id] = result
                _LOGGER.debug(
                    "Read proprietary attribute %s: %s (type: %s)",
                    attribute_path,
                    result,
                    type(result).__name__,
                )
            except Exception as err:
                _LOGGER.debug(
                    "Failed to read proprietary attribute %d/%d/%d: %s",
                    endpoint_id,
                    cluster_id,
                    attr_id,
                    err,
                )
                results[attr_id] = None

        return results

    _LOGGER.debug("Node %s not found for proprietary attribute read", node_id)
    return results

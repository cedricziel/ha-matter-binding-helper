"""Matter server client for binding operations."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr

from .const import (
    ATTR_CLIENT_LIST,
    ATTR_SERVER_LIST,
    CLUSTER_BINDING,
    CLUSTER_DESCRIPTOR,
    CLUSTER_LEVEL_CONTROL,
    CLUSTER_ON_OFF,
    CONF_DEMO_MODE,
    DEFAULT_DEMO_MODE,
    DOMAIN,
)

if TYPE_CHECKING:
    from matter_server.client import MatterClient
    from matter_server.common.models import MatterNodeData

_LOGGER = logging.getLogger(__name__)


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
                    "server_clusters": [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_BINDING],
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
        if hasattr(entry_data, "adapter") and hasattr(entry_data.adapter, "matter_client"):
            return entry_data.adapter.matter_client

    return None


def _get_ha_device_info(hass: HomeAssistant, node_id: int) -> dict[str, Any]:
    """Get Home Assistant device info for a Matter node.

    Looks up the HA device associated with the Matter node to get:
    - HA device name (user-configured)
    - Area name
    - HA device ID

    Matter device identifiers use the format:
    ("matter", "deviceid_{fabric_id}-{node_id_hex_16}-MatterNodeDevice")
    where node_id_hex_16 is the node ID as a 16-digit uppercase hex string.
    """
    ha_info: dict[str, Any] = {
        "ha_device_id": None,
        "ha_device_name": None,
        "area_id": None,
        "area_name": None,
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
                    if id_value.startswith("deviceid_") and f"-{node_id_hex}-" in id_value:
                        ha_info["ha_device_id"] = device.id
                        ha_info["ha_device_name"] = device.name_by_user or device.name
                        ha_info["area_id"] = device.area_id

                        if device.area_id:
                            area = area_registry.async_get_area(device.area_id)
                            if area:
                                ha_info["area_name"] = area.name

                        _LOGGER.debug(
                            "Found HA device for Matter node %s: %s (area: %s)",
                            node_id,
                            ha_info["ha_device_name"],
                            ha_info["area_name"],
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
            node_label = getattr(device_info, "node_label", None) or getattr(device_info, "nodeLabel", None)
            if node_label and str(node_label).strip():
                return str(node_label).strip()
            product_name = getattr(device_info, "product_name", None) or getattr(device_info, "productName", None)
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
                    device_info["vendor_name"] = node_device_info.get("vendorName") or node_device_info.get("vendor_name")
                    device_info["vendor_id"] = node_device_info.get("vendorID") or node_device_info.get("vendor_id")
                    device_info["product_name"] = node_device_info.get("productName") or node_device_info.get("product_name")
                    device_info["product_id"] = node_device_info.get("productID") or node_device_info.get("product_id")
                    device_info["node_label"] = node_device_info.get("nodeLabel") or node_device_info.get("node_label")
                    device_info["hardware_version"] = node_device_info.get("hardwareVersionString") or node_device_info.get("hardware_version")
                    device_info["software_version"] = node_device_info.get("softwareVersionString") or node_device_info.get("software_version")
                    if any(v is not None for v in device_info.values()):
                        _LOGGER.debug("Node %s: extracted device_info via dict access: %s", node.node_id, device_info)
                        return device_info
                except (TypeError, KeyError):
                    pass

            # Log available attributes to help debug
            all_attrs = [a for a in dir(node_device_info) if not a.startswith('_')]
            _LOGGER.debug("Node %s: device_info available attrs: %s", node.node_id, all_attrs[:20])

            # Try direct attribute access with all possible name formats
            device_info["vendor_name"] = (
                getattr(node_device_info, "vendorName", None)
                or getattr(node_device_info, "vendor_name", None)
            )
            device_info["vendor_id"] = (
                getattr(node_device_info, "vendorID", None)
                or getattr(node_device_info, "vendorId", None)
                or getattr(node_device_info, "vendor_id", None)
            )
            device_info["product_name"] = (
                getattr(node_device_info, "productName", None)
                or getattr(node_device_info, "product_name", None)
            )
            device_info["product_id"] = (
                getattr(node_device_info, "productID", None)
                or getattr(node_device_info, "productId", None)
                or getattr(node_device_info, "product_id", None)
            )
            device_info["node_label"] = (
                getattr(node_device_info, "nodeLabel", None)
                or getattr(node_device_info, "node_label", None)
            )
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
                _LOGGER.debug("Node %s: extracted device_info from property: %s", node.node_id, device_info)
                return device_info

        # Approach 2: Fall back to attributes dict
        _LOGGER.debug("Node %s: device_info property had no data, trying attributes dict", node.node_id)
        attributes = getattr(node, "attributes", None)
        if attributes:
            _LOGGER.debug("Node %s: attributes dict has %d keys, sample keys: %s", node.node_id, len(attributes), list(attributes.keys())[:5])

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
                _LOGGER.debug("Node %s: string keys didn't work, trying path matching", node.node_id)
                for attr_key, attr_value in attributes.items():
                    # Convert key to string and parse
                    key_str = str(attr_key)
                    if "/40/" in key_str or "BasicInformation" in key_str:
                        _LOGGER.debug("Node %s: found Basic Info attr: %s = %s", node.node_id, key_str, attr_value)
                    # Check for endpoint 0, cluster 40 (Basic Information)
                    if hasattr(attr_key, 'endpoint_id') and hasattr(attr_key, 'cluster_id') and hasattr(attr_key, 'attribute_id'):
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

            _LOGGER.debug("Node %s: extracted device_info from attributes: %s", node.node_id, device_info)
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
        _LOGGER.warning("Error getting endpoints for node %s: %s", node.node_id, err, exc_info=True)
        return []


def _extract_from_endpoints_property(node_id: int, endpoints_prop: Any) -> list[dict[str, Any]]:
    """Extract endpoint info from node.endpoints property."""
    endpoints: list[dict[str, Any]] = []

    try:
        # endpoints can be a dict keyed by endpoint_id or a list
        if isinstance(endpoints_prop, dict):
            items = endpoints_prop.items()
        elif hasattr(endpoints_prop, "__iter__"):
            # Try to iterate if it's some other iterable
            items = [(getattr(ep, "endpoint_id", i), ep) for i, ep in enumerate(endpoints_prop)]
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
                            server_list = _get_cluster_attribute(descriptor, ATTR_SERVER_LIST)
                            client_list = _get_cluster_attribute(descriptor, ATTR_CLIENT_LIST)

                            if server_list is not None:
                                server_cluster_ids = set(server_list) if isinstance(server_list, list) else server_cluster_ids
                            if client_list is not None:
                                client_cluster_ids = set(client_list) if isinstance(client_list, list) else set()

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
                    CLUSTER_BINDING in server_cluster_ids or CLUSTER_BINDING in client_cluster_ids
                )

                # Try to get device types
                device_types = None
                if hasattr(endpoint, "device_types"):
                    device_types = endpoint.device_types
                elif isinstance(endpoint, dict):
                    device_types = endpoint.get("device_types")

                if device_types:
                    for dt in device_types:
                        if hasattr(dt, "device_type"):
                            ep_info["device_types"].append({
                                "id": dt.device_type,
                                "revision": getattr(dt, "revision", 1),
                            })
                        elif isinstance(dt, dict):
                            ep_info["device_types"].append({
                                "id": dt.get("device_type") or dt.get("id"),
                                "revision": dt.get("revision", 1),
                            })

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


def _extract_from_attributes_dict(node_id: int, attributes: dict) -> list[dict[str, Any]]:
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
                                        endpoints_dict[endpoint_id]["device_types"].append({
                                            "id": dt_id,
                                            "revision": dt_rev,
                                        })

                        # Attribute 1: ServerList
                        elif attr_id == "1" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["server_clusters"] = set(attr_value)

                        # Attribute 2: ClientList
                        elif attr_id == "2" and isinstance(attr_value, list):
                            endpoints_dict[endpoint_id]["client_clusters"] = set(attr_value)
                            # Update has_binding_cluster if binding is in client list
                            if CLUSTER_BINDING in attr_value:
                                endpoints_dict[endpoint_id]["has_binding_cluster"] = True

            except (ValueError, IndexError) as parse_err:
                _LOGGER.debug("Could not parse attribute key %s: %s", attr_key, parse_err)
                continue

        # Convert to list and convert cluster sets to lists
        endpoints = []
        for endpoint_id in sorted(endpoints_dict.keys()):
            ep_info = endpoints_dict[endpoint_id]
            ep_info["server_clusters"] = sorted(ep_info["server_clusters"])
            ep_info["client_clusters"] = sorted(ep_info["client_clusters"])
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
        _LOGGER.debug("Demo mode enabled, returning demo bindings for node %s endpoint %s", node_id, endpoint_id)
        return _demo_bindings.get((node_id, endpoint_id), [])

    client = get_matter_client(hass)
    if not client:
        return []

    bindings = []
    try:
        # Read the binding cluster attribute
        result = await client.read_attribute(
            node_id=node_id,
            attribute_path=f"{endpoint_id}/{CLUSTER_BINDING}/0",  # Binding attribute
        )
        if result and isinstance(result, list):
            for binding in result:
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
        _LOGGER.error("Error reading bindings for node %s endpoint %s: %s", node_id, endpoint_id, err)

    return bindings


async def create_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    cluster_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
) -> bool:
    """Create a new binding."""
    # Handle demo mode
    if _is_demo_mode(hass):
        _LOGGER.debug("Demo mode: creating binding for node %s endpoint %s", source_node_id, source_endpoint_id)
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
        return True

    client = get_matter_client(hass)
    if not client:
        return False

    try:
        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)

        # Build new binding entry
        new_binding: dict[str, Any] = {"Cluster": cluster_id}
        if target_node_id is not None:
            new_binding["Node"] = target_node_id
        if target_endpoint_id is not None:
            new_binding["Endpoint"] = target_endpoint_id
        if target_group_id is not None:
            new_binding["Group"] = target_group_id

        # Build the full binding list
        binding_list = [
            {
                "Cluster": b.cluster_id,
                **({"Node": b.target_node_id} if b.target_node_id else {}),
                **({"Endpoint": b.target_endpoint_id} if b.target_endpoint_id else {}),
                **({"Group": b.target_group_id} if b.target_group_id else {}),
            }
            for b in current_bindings
        ]
        binding_list.append(new_binding)

        # Write the binding attribute
        await client.write_attribute(
            node_id=source_node_id,
            attribute_path=f"{source_endpoint_id}/{CLUSTER_BINDING}/0",
            value=binding_list,
        )
        return True
    except Exception as err:
        _LOGGER.error("Error creating binding: %s", err)
        return False


async def delete_binding(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    target_node_id: int | None = None,
    target_endpoint_id: int | None = None,
    target_group_id: int | None = None,
) -> bool:
    """Delete a binding."""
    # Handle demo mode
    if _is_demo_mode(hass):
        _LOGGER.debug("Demo mode: deleting binding for node %s endpoint %s", source_node_id, source_endpoint_id)
        key = (source_node_id, source_endpoint_id)
        if key in _demo_bindings:
            _demo_bindings[key] = [
                b for b in _demo_bindings[key]
                if not (
                    b.target_node_id == target_node_id
                    and b.target_endpoint_id == target_endpoint_id
                    and b.target_group_id == target_group_id
                )
            ]
        return True

    client = get_matter_client(hass)
    if not client:
        return False

    try:
        # Get current bindings
        current_bindings = await get_bindings(hass, source_node_id, source_endpoint_id)

        # Filter out the binding to delete
        filtered_bindings = [
            b for b in current_bindings
            if not (
                b.target_node_id == target_node_id
                and b.target_endpoint_id == target_endpoint_id
                and b.target_group_id == target_group_id
            )
        ]

        if len(filtered_bindings) == len(current_bindings):
            _LOGGER.warning("Binding not found")
            return False

        # Build the binding list
        binding_list = [
            {
                "Cluster": b.cluster_id,
                **({"Node": b.target_node_id} if b.target_node_id else {}),
                **({"Endpoint": b.target_endpoint_id} if b.target_endpoint_id else {}),
                **({"Group": b.target_group_id} if b.target_group_id else {}),
            }
            for b in filtered_bindings
        ]

        # Write the updated binding attribute
        await client.write_attribute(
            node_id=source_node_id,
            attribute_path=f"{source_endpoint_id}/{CLUSTER_BINDING}/0",
            value=binding_list,
        )
        return True
    except Exception as err:
        _LOGGER.error("Error deleting binding: %s", err)
        return False


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
    _LOGGER.debug("Adding node %s endpoint %s to group %s", node_id, endpoint_id, group_id)
    return False


async def remove_from_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> bool:
    """Remove an endpoint from a group."""
    # Placeholder for removing from group
    _LOGGER.debug("Removing node %s endpoint %s from group %s", node_id, endpoint_id, group_id)
    return False

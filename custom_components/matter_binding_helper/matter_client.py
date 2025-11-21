"""Matter server client for binding operations."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from .const import (
    CLUSTER_BINDING,
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
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 256, "revision": 2}],  # On/Off Light
                    "has_binding_cluster": True,
                    "clusters": [CLUSTER_ON_OFF, CLUSTER_BINDING],
                },
            ],
        },
        {
            "node_id": 2,
            "name": "Demo Switch",
            "available": True,
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 259, "revision": 2}],  # On/Off Light Switch
                    "has_binding_cluster": True,
                    "clusters": [CLUSTER_ON_OFF, CLUSTER_BINDING],
                },
            ],
        },
        {
            "node_id": 3,
            "name": "Demo Dimmer",
            "available": True,
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 257, "revision": 2}],  # Dimmable Light
                    "has_binding_cluster": True,
                    "clusters": [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_BINDING],
                },
                {
                    "endpoint_id": 2,
                    "device_types": [{"id": 260, "revision": 2}],  # Dimmer Switch
                    "has_binding_cluster": True,
                    "clusters": [CLUSTER_LEVEL_CONTROL, CLUSTER_BINDING],
                },
            ],
        },
        {
            "node_id": 4,
            "name": "Demo Sensor",
            "available": False,  # Unavailable for demo
            "endpoints": [
                {
                    "endpoint_id": 1,
                    "device_types": [{"id": 770, "revision": 1}],  # Temperature Sensor
                    "has_binding_cluster": False,
                    "clusters": [0x0402],  # Temperature Measurement
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
        for node in client.get_nodes():
            node_info = {
                "node_id": node.node_id,
                "name": _get_node_name(node),
                "available": node.available,
                "endpoints": _get_endpoints_info(node),
            }
            nodes.append(node_info)
    except Exception as err:
        _LOGGER.error("Error getting Matter nodes: %s", err)

    return nodes


def _get_node_name(node: MatterNodeData) -> str:
    """Extract a friendly name for the node."""
    # Try to get name from basic information cluster
    try:
        if hasattr(node, "node_data") and node.node_data:
            basic_info = node.node_data.get("0/40")  # Basic Information cluster
            if basic_info:
                return basic_info.get("nodeLabel") or basic_info.get("productName") or f"Node {node.node_id}"
    except Exception:
        pass
    return f"Node {node.node_id}"


def _get_endpoints_info(node: MatterNodeData) -> list[dict[str, Any]]:
    """Get endpoint information for a node."""
    endpoints = []
    try:
        if hasattr(node, "endpoints") and node.endpoints:
            for endpoint_id, endpoint in node.endpoints.items():
                endpoint_info = {
                    "endpoint_id": endpoint_id,
                    "device_types": [],
                    "has_binding_cluster": False,
                    "clusters": [],
                }
                if hasattr(endpoint, "device_types"):
                    endpoint_info["device_types"] = [
                        {"id": dt.device_type, "revision": dt.revision}
                        for dt in endpoint.device_types
                    ]
                if hasattr(endpoint, "clusters"):
                    endpoint_info["clusters"] = list(endpoint.clusters.keys())
                    endpoint_info["has_binding_cluster"] = CLUSTER_BINDING in endpoint.clusters
                endpoints.append(endpoint_info)
    except Exception as err:
        _LOGGER.debug("Error getting endpoints: %s", err)
    return endpoints


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

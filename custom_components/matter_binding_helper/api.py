"""WebSocket API for Matter Binding Helper."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr

from .const import (
    DOMAIN,
    WS_TYPE_LIST_NODES,
    WS_TYPE_LIST_BINDINGS,
    WS_TYPE_CREATE_BINDING,
    WS_TYPE_DELETE_BINDING,
    WS_TYPE_LIST_GROUPS,
    WS_TYPE_CREATE_GROUP,
    WS_TYPE_DELETE_GROUP,
    WS_TYPE_ADD_TO_GROUP,
    WS_TYPE_REMOVE_FROM_GROUP,
)
from . import matter_client

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant) -> None:
    """Set up the WebSocket API."""
    websocket_api.async_register_command(hass, ws_list_nodes)
    websocket_api.async_register_command(hass, ws_debug_node)
    websocket_api.async_register_command(hass, ws_debug_devices)
    websocket_api.async_register_command(hass, ws_debug_match)
    websocket_api.async_register_command(hass, ws_list_bindings)
    websocket_api.async_register_command(hass, ws_create_binding)
    websocket_api.async_register_command(hass, ws_delete_binding)
    websocket_api.async_register_command(hass, ws_list_groups)
    websocket_api.async_register_command(hass, ws_create_group)
    websocket_api.async_register_command(hass, ws_delete_group)
    websocket_api.async_register_command(hass, ws_add_to_group)
    websocket_api.async_register_command(hass, ws_remove_from_group)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_NODES,
    }
)
@websocket_api.async_response
async def ws_list_nodes(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all Matter nodes."""
    nodes = await matter_client.get_nodes(hass)
    connection.send_result(msg["id"], {"nodes": nodes})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_node",
        vol.Required("node_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_node(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Get raw node structure info."""
    client = matter_client.get_matter_client(hass)
    if not client:
        connection.send_error(msg["id"], "no_client", "Matter client not available")
        return

    target_node_id = msg["node_id"]
    for node in client.get_nodes():
        if node.node_id == target_node_id:
            # Get all public attributes of the node object
            node_attrs = [attr for attr in dir(node) if not attr.startswith("_")]

            # Get attributes dict info
            attributes = getattr(node, "attributes", None)
            attr_info = {
                "has_attributes": attributes is not None,
                "attributes_type": type(attributes).__name__ if attributes else None,
                "attributes_len": len(attributes) if attributes else 0,
                "sample_keys": list(attributes.keys())[:20] if attributes else [],
            }

            # Get endpoints property info
            endpoints_prop = getattr(node, "endpoints", None)
            endpoints_info = {
                "has_endpoints": endpoints_prop is not None,
                "endpoints_type": type(endpoints_prop).__name__ if endpoints_prop else None,
                "endpoints_len": len(endpoints_prop) if endpoints_prop else 0,
            }

            # Inspect first endpoint if available
            first_endpoint_info = None
            if endpoints_prop:
                try:
                    if isinstance(endpoints_prop, dict):
                        # endpoints is a dict keyed by endpoint_id
                        first_ep_id = next(iter(endpoints_prop.keys()), None)
                        if first_ep_id is not None:
                            first_ep = endpoints_prop[first_ep_id]
                            first_endpoint_info = {
                                "endpoint_id": first_ep_id,
                                "type": type(first_ep).__name__,
                                "attrs": [a for a in dir(first_ep) if not a.startswith("_")],
                            }
                    elif isinstance(endpoints_prop, list) and len(endpoints_prop) > 0:
                        first_ep = endpoints_prop[0]
                        first_endpoint_info = {
                            "type": type(first_ep).__name__,
                            "attrs": [a for a in dir(first_ep) if not a.startswith("_")],
                        }
                except Exception as ep_err:
                    first_endpoint_info = {"error": str(ep_err)}

            # Get node_data info
            node_data = getattr(node, "node_data", None)
            node_data_info = {
                "has_node_data": node_data is not None,
                "node_data_type": type(node_data).__name__ if node_data else None,
            }

            connection.send_result(msg["id"], {
                "node_id": node.node_id,
                "node_type": type(node).__name__,
                "available_attrs": node_attrs,
                "attributes_info": attr_info,
                "endpoints_info": endpoints_info,
                "first_endpoint": first_endpoint_info,
                "node_data_info": node_data_info,
            })
            return

    connection.send_error(msg["id"], "not_found", f"Node {target_node_id} not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_devices",
    }
)
@websocket_api.async_response
async def ws_debug_devices(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: List all devices with Matter identifiers."""
    device_registry = dr.async_get(hass)
    area_registry = ar.async_get(hass)

    matter_devices = []
    for device in device_registry.devices.values():
        # Check if any identifier starts with "matter"
        matter_identifiers = [
            list(ident) for ident in device.identifiers
            if len(ident) >= 2 and ident[0] == "matter"
        ]

        if matter_identifiers:
            area_name = None
            if device.area_id:
                area = area_registry.async_get_area(device.area_id)
                if area:
                    area_name = area.name

            matter_devices.append({
                "device_id": device.id,
                "name": device.name,
                "name_by_user": device.name_by_user,
                "identifiers": matter_identifiers,
                "area_id": device.area_id,
                "area_name": area_name,
                "model": device.model,
                "manufacturer": device.manufacturer,
            })

    connection.send_result(msg["id"], {"devices": matter_devices})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "matter_binding_helper/debug_match",
        vol.Required("node_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_debug_match(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Debug: Test device matching for a specific node ID."""
    device_registry = dr.async_get(hass)
    area_registry = ar.async_get(hass)
    node_id = msg["node_id"]

    # Convert node_id to 16-digit uppercase hex
    node_id_hex = f"{node_id:016X}"
    search_pattern = f"-{node_id_hex}-"

    matches = []
    checked = []

    for device in device_registry.devices.values():
        for identifier in device.identifiers:
            if len(identifier) >= 2 and identifier[0] == "matter":
                id_value = str(identifier[1])
                is_deviceid = id_value.startswith("deviceid_")
                has_pattern = search_pattern in id_value

                checked.append({
                    "device_name": device.name,
                    "identifier": id_value,
                    "is_deviceid": is_deviceid,
                    "has_pattern": has_pattern,
                })

                if is_deviceid and has_pattern:
                    area_name = None
                    if device.area_id:
                        area = area_registry.async_get_area(device.area_id)
                        if area:
                            area_name = area.name

                    matches.append({
                        "device_id": device.id,
                        "name": device.name,
                        "name_by_user": device.name_by_user,
                        "area_name": area_name,
                        "matched_identifier": id_value,
                    })

    connection.send_result(msg["id"], {
        "node_id": node_id,
        "node_id_hex": node_id_hex,
        "search_pattern": search_pattern,
        "matches": matches,
        "checked_count": len(checked),
        "checked_sample": checked[:10],
    })


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_BINDINGS,
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_list_bindings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List bindings for a node endpoint."""
    bindings = await matter_client.get_bindings(
        hass, msg["node_id"], msg["endpoint_id"]
    )
    connection.send_result(
        msg["id"],
        {"bindings": [b.to_dict() for b in bindings]},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_BINDING,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("cluster_id"): vol.Coerce(int),
        vol.Optional("target_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_create_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new binding."""
    success = await matter_client.create_binding(
        hass,
        source_node_id=msg["source_node_id"],
        source_endpoint_id=msg["source_endpoint_id"],
        cluster_id=msg["cluster_id"],
        target_node_id=msg.get("target_node_id"),
        target_endpoint_id=msg.get("target_endpoint_id"),
        target_group_id=msg.get("target_group_id"),
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "create_failed", "Failed to create binding")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_BINDING,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_delete_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a binding."""
    success = await matter_client.delete_binding(
        hass,
        source_node_id=msg["source_node_id"],
        source_endpoint_id=msg["source_endpoint_id"],
        target_node_id=msg.get("target_node_id"),
        target_endpoint_id=msg.get("target_endpoint_id"),
        target_group_id=msg.get("target_group_id"),
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "delete_failed", "Failed to delete binding")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_LIST_GROUPS,
    }
)
@websocket_api.async_response
async def ws_list_groups(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all Matter groups."""
    groups = await matter_client.get_groups(hass)
    connection.send_result(
        msg["id"],
        {"groups": [g.to_dict() for g in groups]},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_CREATE_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("name"): str,
    }
)
@websocket_api.async_response
async def ws_create_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new Matter group."""
    success = await matter_client.create_group(hass, msg["group_id"], msg["name"])
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "create_failed", "Failed to create group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_DELETE_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_delete_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a Matter group."""
    success = await matter_client.delete_group(hass, msg["group_id"])
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "delete_failed", "Failed to delete group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_ADD_TO_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_add_to_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add an endpoint to a group."""
    success = await matter_client.add_to_group(
        hass, msg["group_id"], msg["node_id"], msg["endpoint_id"]
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "add_failed", "Failed to add to group")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_REMOVE_FROM_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
        vol.Required("node_id"): vol.Coerce(int),
        vol.Required("endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_remove_from_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an endpoint from a group."""
    success = await matter_client.remove_from_group(
        hass, msg["group_id"], msg["node_id"], msg["endpoint_id"]
    )
    if success:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "remove_failed", "Failed to remove from group")

"""WebSocket API for Matter Binding Helper."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

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

            connection.send_result(msg["id"], {
                "node_id": node.node_id,
                "node_type": type(node).__name__,
                "available_attrs": node_attrs,
                "attributes_info": attr_info,
            })
            return

    connection.send_error(msg["id"], "not_found", f"Node {target_node_id} not found")


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

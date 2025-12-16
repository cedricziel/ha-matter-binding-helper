"""Node discovery tests for Matter Binding Helper.

These tests verify that the virtual Matter devices are discoverable
through the Matter Binding Helper WebSocket API.

In demo mode, nodes 1-4 are provided:
- Node 1: Demo Light (On/Off Light)
- Node 2: Demo Switch (On/Off Light Switch)
- Node 3: Demo Dimmer (Dimmable Light + Dimmer Switch)
- Node 4: Demo Sensor (unavailable)
"""

import pytest

from .conftest import (
    CLUSTER_BINDING,
    CLUSTER_LEVEL_CONTROL,
    CLUSTER_ON_OFF,
)

# Demo mode node IDs
DEMO_LIGHT_NODE_ID = 1
DEMO_SWITCH_NODE_ID = 2
DEMO_DIMMER_NODE_ID = 3


@pytest.mark.asyncio
async def test_list_nodes_returns_devices(ws_client):
    """Demo devices should appear in node list."""
    result = await ws_client.call("matter_binding_helper/list_nodes")

    assert "nodes" in result, "Response should contain 'nodes' key"
    nodes = result["nodes"]

    node_ids = [n["node_id"] for n in nodes]
    assert DEMO_LIGHT_NODE_ID in node_ids, f"Demo Light not found in {node_ids}"
    assert DEMO_SWITCH_NODE_ID in node_ids, f"Demo Switch not found in {node_ids}"
    assert DEMO_DIMMER_NODE_ID in node_ids, f"Demo Dimmer not found in {node_ids}"


@pytest.mark.asyncio
async def test_list_nodes_contains_endpoint_info(ws_client):
    """Nodes should include endpoint information."""
    result = await ws_client.call("matter_binding_helper/list_nodes")

    for node in result["nodes"]:
        if node["node_id"] in (DEMO_LIGHT_NODE_ID, DEMO_SWITCH_NODE_ID, DEMO_DIMMER_NODE_ID):
            assert "endpoints" in node, f"Node {node['node_id']} missing endpoints"
            # Demo endpoints have endpoint_id key
            endpoint_ids = [ep.get("endpoint_id") or ep.get("id") for ep in node["endpoints"]]
            assert 1 in endpoint_ids, f"Node {node['node_id']} missing endpoint 1 (device)"


@pytest.mark.asyncio
async def test_dimmable_light_has_correct_clusters(ws_client):
    """Dimmable light (node 3) should have On/Off, Level Control, and Binding clusters."""
    result = await ws_client.call("matter_binding_helper/list_nodes")

    # Find the dimmer node
    dimmer_node = None
    for node in result["nodes"]:
        if node["node_id"] == DEMO_DIMMER_NODE_ID:
            dimmer_node = node
            break

    assert dimmer_node is not None, "Demo Dimmer node not found"
    assert "endpoints" in dimmer_node, "Dimmer node missing endpoints"

    # Find endpoint 1
    endpoint = None
    for ep in dimmer_node["endpoints"]:
        ep_id = ep.get("endpoint_id") or ep.get("id")
        if ep_id == 1:
            endpoint = ep
            break

    assert endpoint is not None, "Endpoint 1 not found on dimmer"

    # Check server clusters (demo mode uses server_clusters)
    server_clusters = endpoint.get("server_clusters", [])
    assert CLUSTER_ON_OFF in server_clusters, f"On/Off cluster missing. Found: {server_clusters}"
    assert CLUSTER_LEVEL_CONTROL in server_clusters, f"Level Control missing. Found: {server_clusters}"
    assert CLUSTER_BINDING in server_clusters, f"Binding cluster missing. Found: {server_clusters}"


@pytest.mark.asyncio
async def test_switch_has_binding_cluster(ws_client):
    """On/Off switch (node 2) should have Binding cluster for controlling other devices."""
    result = await ws_client.call("matter_binding_helper/list_nodes")

    # Find the switch node
    switch_node = None
    for node in result["nodes"]:
        if node["node_id"] == DEMO_SWITCH_NODE_ID:
            switch_node = node
            break

    assert switch_node is not None, "Demo Switch node not found"
    assert "endpoints" in switch_node, "Switch node missing endpoints"

    # Find endpoint 1
    endpoint = None
    for ep in switch_node["endpoints"]:
        ep_id = ep.get("endpoint_id") or ep.get("id")
        if ep_id == 1:
            endpoint = ep
            break

    assert endpoint is not None, "Endpoint 1 not found on switch"

    # Check server clusters for Binding (switches have Binding as server)
    server_clusters = endpoint.get("server_clusters", [])
    assert CLUSTER_BINDING in server_clusters, f"Binding cluster missing. Found: {server_clusters}"


@pytest.mark.asyncio
async def test_debug_node_returns_structure(ws_client):
    """Debug node endpoint should return node structure information."""
    # Skip this test in demo mode - debug_node requires real Matter nodes
    pytest.skip("debug_node API requires real Matter nodes, not available in demo mode")

"""Binding CRUD tests for Matter Binding Helper.

These tests verify binding creation, reading, and deletion operations
against the virtual Matter devices.

Prerequisites:
    - Docker containers running (docker compose --profile devices up -d)
    - Devices commissioned (dimmable light as node 1, switch as node 4)
    - HA_TOKEN environment variable set
"""

import pytest

from .conftest import (
    CLUSTER_ON_OFF,
    DIMMABLE_LIGHT_NODE_ID,
    ON_OFF_SWITCH_NODE_ID,
)


@pytest.mark.asyncio
async def test_list_bindings_returns_list(ws_client):
    """List bindings should return a list (possibly empty)."""
    result = await ws_client.call(
        "matter_binding_helper/list_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    assert "bindings" in result, "Response should contain 'bindings' key"
    assert isinstance(result["bindings"], list), "Bindings should be a list"


@pytest.mark.asyncio
async def test_verify_bindings_works(ws_client):
    """Verify bindings should succeed and return current binding count."""
    result = await ws_client.call(
        "matter_binding_helper/verify_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    assert result.get("success"), f"Verify bindings failed: {result.get('message')}"
    assert "bindings_found" in result, "Response should include bindings_found count"


@pytest.mark.asyncio
async def test_create_binding_switch_to_light(ws_client):
    """Create binding from switch to light's On/Off cluster.

    This tests the primary use case: configuring a switch to control a light.
    """
    result = await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=True,
    )

    assert result.get("success"), f"Create binding failed: {result.get('message')}"
    # When verify=True, should confirm the binding exists on device
    if result.get("verified") is not None:
        assert result["verified"], "Binding was not verified on device"


@pytest.mark.asyncio
async def test_binding_appears_in_list(ws_client):
    """After creating a binding, it should appear in list_bindings."""
    # First ensure binding exists (may have been created by previous test)
    await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=False,
    )

    # Now list bindings
    result = await ws_client.call(
        "matter_binding_helper/list_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    bindings = result.get("bindings", [])
    assert len(bindings) > 0, "Should have at least one binding"

    # Find our binding
    found = False
    for binding in bindings:
        if (
            binding.get("target_node_id") == DIMMABLE_LIGHT_NODE_ID
            and binding.get("target_endpoint_id") == 1
            and binding.get("cluster_id") == CLUSTER_ON_OFF
        ):
            found = True
            break

    assert found, f"Binding to light not found in {bindings}"


@pytest.mark.asyncio
async def test_delete_binding(ws_client):
    """Delete binding should remove it from the device.

    Note: This test depends on having a binding to delete.
    """
    # First ensure a binding exists
    await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=False,
    )

    # Now delete it
    result = await ws_client.call(
        "matter_binding_helper/delete_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=True,
    )

    assert result.get("success"), f"Delete binding failed: {result.get('message')}"


@pytest.mark.asyncio
async def test_binding_removed_after_delete(ws_client):
    """After deleting a binding, it should not appear in list_bindings."""
    # Create and then delete a binding
    await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=False,
    )

    await ws_client.call(
        "matter_binding_helper/delete_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        target_node_id=DIMMABLE_LIGHT_NODE_ID,
        target_endpoint_id=1,
        verify=False,
    )

    # List bindings should not include the deleted binding
    result = await ws_client.call(
        "matter_binding_helper/list_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    bindings = result.get("bindings", [])

    # Check binding is gone
    for binding in bindings:
        if (
            binding.get("target_node_id") == DIMMABLE_LIGHT_NODE_ID
            and binding.get("target_endpoint_id") == 1
            and binding.get("cluster_id") == CLUSTER_ON_OFF
        ):
            pytest.fail(f"Binding still exists after deletion: {binding}")


@pytest.mark.asyncio
async def test_debug_bindings_returns_raw_data(ws_client):
    """Debug bindings endpoint should return detailed cluster information."""
    result = await ws_client.call(
        "matter_binding_helper/debug_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    assert result["node_id"] == ON_OFF_SWITCH_NODE_ID
    assert result["endpoint_id"] == 1
    assert "clusters_on_endpoint" in result

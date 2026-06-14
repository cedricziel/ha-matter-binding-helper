"""Group management integration tests for Matter Binding Helper.

These exercise the WebSocket API end-to-end (api.py -> matter_client -> groups.py)
against the testcontainers HA instance.

IMPORTANT — coverage scope:
    The Docker harness runs in DEMO mode because real Matter commissioning does
    not work inside the Docker network (mDNS limitation; see conftest ha_config).
    So these tests validate the WS command surface and the demo backend, NOT real
    on-device provisioning (KeySetWrite / AddGroup / group-auth ACL / actuation).

    Real device provisioning is exercised by:
      - unit tests (orchestration with mocked device I/O), and
      - manual validation against a real fabric via matter.sh.
    The rs-matter mock devices now expose the Groups cluster (cluster 0x0004), so
    a future mDNS-capable harness could assert real groupcast actuation.
"""

import pytest

from .conftest import (
    CLUSTER_ON_OFF,
    ON_OFF_SWITCH_NODE_ID,
)


@pytest.mark.asyncio
async def test_list_groups_returns_list(ws_client):
    """list_groups returns a groups list (demo mode ships a seed group)."""
    result = await ws_client.call("matter_binding_helper/list_groups")
    assert "groups" in result
    assert isinstance(result["groups"], list)


@pytest.mark.asyncio
async def test_create_and_list_group(ws_client):
    """A created group appears in the list."""
    await ws_client.call(
        "matter_binding_helper/create_group", group_id=200, name="Test Group"
    )
    result = await ws_client.call("matter_binding_helper/list_groups")
    ids = {g["group_id"] for g in result["groups"]}
    assert 200 in ids


@pytest.mark.asyncio
async def test_create_duplicate_group_errors(ws_client):
    """Creating the same group twice surfaces a structured error."""
    await ws_client.call("matter_binding_helper/create_group", group_id=201, name="Dup")
    with pytest.raises(Exception):
        await ws_client.call(
            "matter_binding_helper/create_group", group_id=201, name="Dup"
        )


@pytest.mark.asyncio
async def test_add_and_remove_member(ws_client):
    """Members can be added to and removed from a group."""
    await ws_client.call(
        "matter_binding_helper/create_group", group_id=202, name="Members"
    )
    await ws_client.call(
        "matter_binding_helper/add_to_group",
        group_id=202,
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )

    result = await ws_client.call("matter_binding_helper/list_groups")
    group = next(g for g in result["groups"] if g["group_id"] == 202)
    assert {"node_id": ON_OFF_SWITCH_NODE_ID, "endpoint_id": 1} in group["members"]

    await ws_client.call(
        "matter_binding_helper/remove_from_group",
        group_id=202,
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )
    result = await ws_client.call("matter_binding_helper/list_groups")
    group = next(g for g in result["groups"] if g["group_id"] == 202)
    assert {"node_id": ON_OFF_SWITCH_NODE_ID, "endpoint_id": 1} not in group["members"]


@pytest.mark.asyncio
async def test_delete_group(ws_client):
    """A deleted group disappears from the list."""
    await ws_client.call(
        "matter_binding_helper/create_group", group_id=203, name="Doomed"
    )
    await ws_client.call("matter_binding_helper/delete_group", group_id=203)
    result = await ws_client.call("matter_binding_helper/list_groups")
    ids = {g["group_id"] for g in result["groups"]}
    assert 203 not in ids


@pytest.mark.asyncio
async def test_create_groupcast_binding(ws_client):
    """A groupcast binding (source -> group) can be created via the WS API."""
    await ws_client.call(
        "matter_binding_helper/create_group", group_id=204, name="Bind Target"
    )
    result = await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_group_id=204,
    )
    assert result.get("success"), f"Group binding create failed: {result}"

    # The binding shows a group target in the list.
    listing = await ws_client.call(
        "matter_binding_helper/list_bindings",
        node_id=ON_OFF_SWITCH_NODE_ID,
        endpoint_id=1,
    )
    assert any(b.get("target_group_id") == 204 for b in listing.get("bindings", [])), (
        f"Group binding not found in list: {listing}"
    )

    # And it can be deleted again.
    await ws_client.call(
        "matter_binding_helper/delete_binding",
        source_node_id=ON_OFF_SWITCH_NODE_ID,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_group_id=204,
    )

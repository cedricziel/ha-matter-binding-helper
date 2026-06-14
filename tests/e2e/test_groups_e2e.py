"""End-to-end groupcast provisioning against real commissioned rs-matter devices.

This is the test the demo-mode harness can't do: it commissions real devices and
asserts that everything the integration writes for a groupcast binding actually
lands on the hardware — group key (GroupKeyMap), group-auth ACL, and the binding.

Scope note: it verifies *provisioning*, not physical actuation. A virtual switch
doesn't autonomously emit a groupcast command (no button), so "the light turned
on" can't be driven here; but provisioning is exactly what the integration is
responsible for.
"""

import json

import pytest

CLUSTER_ON_OFF = 6
CLUSTER_GROUP_KEY_MANAGEMENT = 63  # 0x003F
AUTH_MODE_GROUP = 3


async def _create_group(ws_client, name: str) -> int:
    result = await ws_client.call("matter_binding_helper/create_group", name=name)
    assert result.get("success"), f"create_group failed: {result}"
    group_id = result.get("group_id")
    assert isinstance(group_id, int), f"no group_id returned: {result}"
    return group_id


@pytest.mark.asyncio
async def test_groupcast_binding_provisions_real_devices(ws_client, device_nodes):
    light = device_nodes["light"]
    switch = device_nodes["switch"]

    # 1. Create a group and add the light (endpoint 1) as a member.
    group_id = await _create_group(ws_client, "E2E Lights")
    add = await ws_client.call(
        "matter_binding_helper/add_to_group",
        group_id=group_id,
        node_id=light,
        endpoint_id=1,
    )
    assert add.get("success"), f"add_to_group failed: {add}"

    # 2. Create a groupcast binding: switch -> group, On/Off.
    binding = await ws_client.call(
        "matter_binding_helper/create_binding",
        source_node_id=switch,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_group_id=group_id,
    )
    assert binding.get("success"), f"groupcast binding failed: {binding}"

    # 3a. The binding is on the switch with a group target.
    bindings = await ws_client.call(
        "matter_binding_helper/list_bindings",
        node_id=switch,
        endpoint_id=1,
    )
    assert any(
        b.get("target_group_id") == group_id for b in bindings.get("bindings", [])
    ), f"group binding not on switch: {bindings}"

    # 3b. The group key (GroupKeyMap) was written to source and member: the
    # group id appears in the Group Key Management cluster dump on both nodes.
    for node in (light, switch):
        dump = await ws_client.call(
            "matter_binding_helper/debug_cluster_attributes",
            node_id=node,
            endpoint_id=0,
            cluster_id=CLUSTER_GROUP_KEY_MANAGEMENT,
        )
        assert str(group_id) in json.dumps(dump), (
            f"group {group_id} not in GroupKeyManagement on node {node}: {dump}"
        )

    # 3c. The member has a group-auth ACL entry for the group.
    acl = await ws_client.call("matter_binding_helper/list_acl", node_id=light)
    entries = acl.get("entries", [])
    assert any(
        e.get("auth_mode") == AUTH_MODE_GROUP and group_id in (e.get("subjects") or [])
        for e in entries
    ), f"no group-auth ACL for group {group_id} on light: {entries}"

    # 4. Teardown: deleting the binding removes the group-auth ACL.
    await ws_client.call(
        "matter_binding_helper/delete_binding",
        source_node_id=switch,
        source_endpoint_id=1,
        cluster_id=CLUSTER_ON_OFF,
        target_group_id=group_id,
    )
    acl_after = await ws_client.call("matter_binding_helper/list_acl", node_id=light)
    assert not any(
        e.get("auth_mode") == AUTH_MODE_GROUP and group_id in (e.get("subjects") or [])
        for e in acl_after.get("entries", [])
    ), "group-auth ACL should be removed after binding deletion"

"""Unit tests for matter/groups.py.

Covers:
- Demo mode: full in-memory CRUD.
- Real fabric: registry-backed create/delete/list and the guard branches of
  add/remove (group-missing, client-unavailable). The on-device AddGroup/
  RemoveGroup path is chip-dependent and covered by the PR8 integration test.
"""

import itertools
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.matter_binding_helper.const import CONF_DEMO_MODE, DOMAIN
from custom_components.matter_binding_helper.matter import demo, groups
from custom_components.matter_binding_helper.matter.groups import (
    GROUP_ALREADY_EXISTS_CODE,
    GROUP_NOT_FOUND_CODE,
    add_to_group,
    create_group,
    delete_group,
    device_group_name,
    get_groups,
    provision_group_for_binding,
    remove_from_group,
)
from custom_components.matter_binding_helper.matter.models import GroupOperationResult
from custom_components.matter_binding_helper.matter.group_store import (
    _GROUP_STORE_KEY,
    GroupStore,
)


def test_device_group_name_clamps_to_16_chars():
    # Matter rejects AddGroup with names > 16 chars (CONSTRAINT_ERROR).
    assert device_group_name("Ambientebeleuchtung") == "Ambientebeleucht"
    assert len(device_group_name("Ambientebeleuchtung")) == 16
    # Short names pass through unchanged.
    assert device_group_name("Kitchen") == "Kitchen"
    assert device_group_name("") == ""


class FakeStore:
    """In-memory stand-in for homeassistant.helpers.storage.Store."""

    def __init__(self):
        self.saved = None

    async def async_load(self):
        return self.saved

    async def async_save(self, data):
        import json

        self.saved = json.loads(json.dumps(data))


def _keys():
    counter = itertools.count(1)
    return lambda: f"key{next(counter):04d}"


def _make_hass(demo_mode: bool) -> MagicMock:
    hass = MagicMock()
    hass.data = {}
    if demo_mode:
        entry = MagicMock()
        entry.options = {CONF_DEMO_MODE: True}
        hass.config_entries.async_entries.return_value = [entry]
    else:
        hass.config_entries.async_entries.return_value = []
        # Seed a GroupStore backed by an in-memory fake store.
        store = GroupStore(MagicMock(), store=FakeStore(), key_factory=_keys())
        hass.data[DOMAIN] = {_GROUP_STORE_KEY: store}
    return hass


# --- Real fabric (registry-backed) ----------------------------------------


@pytest.fixture
def hass():
    return _make_hass(demo_mode=False)


@pytest.mark.asyncio
async def test_real_create_and_list(hass):
    result = await create_group(hass, 10, "Hallway")
    assert result.success is True

    listed = await get_groups(hass)
    assert [g.group_id for g in listed] == [10]
    assert listed[0].name == "Hallway"


@pytest.mark.asyncio
async def test_real_create_auto_allocates_id(hass):
    """Creating a group without an id auto-allocates and returns it."""
    result = await create_group(hass, None, "Ambient")
    assert result.success is True
    assert result.group_id == 1

    second = await create_group(hass, None, "Kitchen")
    assert second.group_id == 2


@pytest.mark.asyncio
async def test_real_create_duplicate(hass):
    await create_group(hass, 10, "Hallway")
    dup = await create_group(hass, 10, "Hallway")
    assert dup.success is False
    assert dup.error_code == GROUP_ALREADY_EXISTS_CODE


@pytest.mark.asyncio
async def test_real_delete_missing_group(hass):
    result = await delete_group(hass, 999)
    assert result.success is False
    assert result.error_code == GROUP_NOT_FOUND_CODE


@pytest.mark.asyncio
async def test_real_delete_empty_group(hass):
    await create_group(hass, 10, "Hallway")
    with patch.object(groups, "get_raw_matter_client", return_value=None):
        result = await delete_group(hass, 10)
    assert result.success is True
    assert await get_groups(hass) == []


@pytest.mark.asyncio
async def test_real_add_to_missing_group(hass):
    result = await add_to_group(hass, 999, 5, 1)
    assert result.success is False
    assert result.error_code == GROUP_NOT_FOUND_CODE


@pytest.mark.asyncio
async def test_real_add_client_unavailable(hass):
    await create_group(hass, 10, "Hallway")
    with patch.object(groups, "get_raw_matter_client", return_value=None):
        result = await add_to_group(hass, 10, 5, 1)
    assert result.success is False
    assert result.error_code == "client_unavailable"


@pytest.mark.asyncio
async def test_real_remove_client_unavailable(hass):
    await create_group(hass, 10, "Hallway")
    with patch.object(groups, "get_raw_matter_client", return_value=None):
        result = await remove_from_group(hass, 10, 5, 1)
    assert result.success is False
    assert result.error_code == "client_unavailable"


# --- Groupcast binding orchestration (provision_group_for_binding) ---------


@pytest.mark.asyncio
async def test_provision_for_binding_missing_group(hass):
    result = await provision_group_for_binding(
        hass, source_node_id=4, group_id=99, cluster_id=6
    )
    assert result.success is False
    assert result.error_code == GROUP_NOT_FOUND_CODE


@pytest.mark.asyncio
async def test_provision_for_binding_keys_source_and_acls_members(hass):
    # Group 10 with two members.
    await create_group(hass, 10, "Lights")
    store = hass.data[DOMAIN]["_group_store"]
    await store.async_add_member(10, 1, 1)
    await store.async_add_member(10, 2, 1)

    key_mock = AsyncMock(return_value=GroupOperationResult(True, "ok"))
    acl_mock = AsyncMock(return_value=GroupOperationResult(True, "ok"))
    with (
        patch.object(groups, "provision_group_key", key_mock),
        patch.object(groups, "provision_group_acl", acl_mock),
    ):
        result = await provision_group_for_binding(
            hass, source_node_id=4, group_id=10, cluster_id=6
        )

    assert result.success is True
    # Source (4) + both members (1, 2) get the key.
    keyed_nodes = {call.args[1] for call in key_mock.await_args_list}
    assert keyed_nodes == {4, 1, 2}
    # Both members get a group ACL for the cluster.
    acl_nodes = {call.args[1] for call in acl_mock.await_args_list}
    assert acl_nodes == {1, 2}


@pytest.mark.asyncio
async def test_provision_for_binding_member_acl_failure_is_reported(hass):
    await create_group(hass, 10, "Lights")
    store = hass.data[DOMAIN]["_group_store"]
    await store.async_add_member(10, 1, 1)

    key_mock = AsyncMock(return_value=GroupOperationResult(True, "ok"))
    acl_mock = AsyncMock(
        return_value=GroupOperationResult(False, "denied", "device_error")
    )
    with (
        patch.object(groups, "provision_group_key", key_mock),
        patch.object(groups, "provision_group_acl", acl_mock),
    ):
        result = await provision_group_for_binding(
            hass, source_node_id=4, group_id=10, cluster_id=6
        )

    assert result.success is False
    assert "denied" in result.message


@pytest.mark.asyncio
async def test_provision_for_binding_demo_short_circuits(demo_hass):
    result = await provision_group_for_binding(
        demo_hass, source_node_id=4, group_id=1, cluster_id=6
    )
    assert result.success is True


# --- Demo mode -------------------------------------------------------------


def _reset_demo_groups() -> None:
    demo._demo_groups.clear()
    demo._demo_groups.update(demo._default_demo_groups())


@pytest.fixture
def demo_hass():
    _reset_demo_groups()
    yield _make_hass(demo_mode=True)
    _reset_demo_groups()


@pytest.mark.asyncio
async def test_demo_lists_seed_group(demo_hass):
    groups_list = await get_groups(demo_hass)
    assert [g.group_id for g in groups_list] == [1]
    assert groups_list[0].name == "Living Room Lights"


@pytest.mark.asyncio
async def test_demo_create_and_list(demo_hass):
    result = await create_group(demo_hass, 2, "Kitchen")
    assert result.success is True
    assert {g.group_id for g in await get_groups(demo_hass)} == {1, 2}


@pytest.mark.asyncio
async def test_demo_create_auto_allocates_id(demo_hass):
    """Demo create without an id allocates the next free id (seed group is 1)."""
    result = await create_group(demo_hass, None, "Hallway")
    assert result.success is True
    assert result.group_id == 2  # seed group occupies id 1


@pytest.mark.asyncio
async def test_demo_create_duplicate_reports_exists(demo_hass):
    result = await create_group(demo_hass, 1, "Dup")
    assert result.success is False
    assert result.error_code == GROUP_ALREADY_EXISTS_CODE


@pytest.mark.asyncio
async def test_demo_add_and_remove_member(demo_hass):
    add = await add_to_group(demo_hass, 1, node_id=7, endpoint_id=1)
    assert add.success is True
    assert {"node_id": 7, "endpoint_id": 1} in (await get_groups(demo_hass))[0].members

    remove = await remove_from_group(demo_hass, 1, node_id=7, endpoint_id=1)
    assert remove.success is True
    members = (await get_groups(demo_hass))[0].members
    assert {"node_id": 7, "endpoint_id": 1} not in members


@pytest.mark.asyncio
async def test_demo_member_ops_on_missing_group(demo_hass):
    add = await add_to_group(demo_hass, 999, 5, 1)
    assert add.success is False
    assert add.error_code == GROUP_NOT_FOUND_CODE


@pytest.mark.asyncio
async def test_demo_delete_group(demo_hass):
    result = await delete_group(demo_hass, 1)
    assert result.success is True
    assert await get_groups(demo_hass) == []


@pytest.mark.asyncio
async def test_result_to_dict_is_serializable(demo_hass):
    result = await create_group(demo_hass, 5, "Bedroom")
    assert result.to_dict() == {
        "success": True,
        "message": result.message,
        "error_code": None,
        "group_id": 5,
    }

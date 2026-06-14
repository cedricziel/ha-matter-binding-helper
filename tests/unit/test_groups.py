"""Unit tests for matter/groups.py.

Covers:
- Demo mode: full in-memory CRUD.
- Real fabric: registry-backed create/delete/list and the guard branches of
  add/remove (group-missing, client-unavailable). The on-device AddGroup/
  RemoveGroup path is chip-dependent and covered by the PR8 integration test.
"""

import itertools
from unittest.mock import MagicMock, patch

import pytest

from custom_components.matter_binding_helper.const import CONF_DEMO_MODE, DOMAIN
from custom_components.matter_binding_helper.matter import demo, groups
from custom_components.matter_binding_helper.matter.groups import (
    GROUP_ALREADY_EXISTS_CODE,
    GROUP_NOT_FOUND_CODE,
    add_to_group,
    create_group,
    delete_group,
    get_groups,
    remove_from_group,
)
from custom_components.matter_binding_helper.matter.group_store import (
    _GROUP_STORE_KEY,
    GroupStore,
)


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
    }

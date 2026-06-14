"""Unit tests for matter/groups.py.

Covers two paths:
- Honesty gate (real fabric): mutating ops report an explicit unsupported result
  rather than silently no-op'ing; listing returns an empty list.
- Demo mode: group management is fully functional against the in-memory demo
  store so the UI can be developed without hardware.
"""

import pytest
from unittest.mock import MagicMock

from custom_components.matter_binding_helper.const import CONF_DEMO_MODE
from custom_components.matter_binding_helper.matter import demo
from custom_components.matter_binding_helper.matter.groups import (
    GROUP_ALREADY_EXISTS_CODE,
    GROUP_NOT_FOUND_CODE,
    GROUP_NOT_SUPPORTED_CODE,
    add_to_group,
    create_group,
    delete_group,
    get_groups,
    remove_from_group,
)
from custom_components.matter_binding_helper.matter.models import GroupOperationResult


def _make_hass(demo_mode: bool) -> MagicMock:
    """Build a mock hass whose config entry toggles demo mode."""
    hass = MagicMock()
    if demo_mode:
        entry = MagicMock()
        entry.options = {CONF_DEMO_MODE: True}
        hass.config_entries.async_entries.return_value = [entry]
    else:
        hass.config_entries.async_entries.return_value = []
    return hass


@pytest.fixture
def hass():
    """Real-fabric (non-demo) hass."""
    return _make_hass(demo_mode=False)


def _reset_demo_groups() -> None:
    """Reset only the demo group state, in place (no global rebind).

    Mutating in place keeps object identity, so this never disturbs the other
    demo stores (bindings/ACL) that sibling test modules hold references to.
    """
    demo._demo_groups.clear()
    demo._demo_groups.update(demo._default_demo_groups())


@pytest.fixture
def demo_hass():
    """Demo-mode hass with demo group data reset around the test."""
    _reset_demo_groups()
    yield _make_hass(demo_mode=True)
    _reset_demo_groups()


# --- Honesty gate (real fabric) -------------------------------------------


@pytest.mark.asyncio
async def test_get_groups_returns_empty_list(hass):
    """Listing groups returns an empty list on a real fabric (none managed yet)."""
    assert await get_groups(hass) == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "operation",
    [
        lambda h: create_group(h, 1, "Living Room"),
        lambda h: delete_group(h, 1),
        lambda h: add_to_group(h, 1, 5, 1),
        lambda h: remove_from_group(h, 1, 5, 1),
    ],
)
async def test_mutations_report_not_supported(hass, operation):
    """Every mutating group op returns an explicit not-supported result."""
    result = await operation(hass)

    assert isinstance(result, GroupOperationResult)
    assert result.success is False
    assert result.error_code == GROUP_NOT_SUPPORTED_CODE
    assert result.message  # non-empty, user-facing


@pytest.mark.asyncio
async def test_result_to_dict_is_serializable(hass):
    """The result serializes for the WebSocket layer."""
    result = await create_group(hass, 42, "Bedroom")
    assert result.to_dict() == {
        "success": False,
        "message": result.message,
        "error_code": GROUP_NOT_SUPPORTED_CODE,
    }


# --- Demo mode -------------------------------------------------------------


@pytest.mark.asyncio
async def test_demo_lists_seed_group(demo_hass):
    """Demo mode ships a seed group so the UI has content."""
    groups = await get_groups(demo_hass)
    assert [g.group_id for g in groups] == [1]
    assert groups[0].name == "Living Room Lights"


@pytest.mark.asyncio
async def test_demo_create_and_list(demo_hass):
    result = await create_group(demo_hass, 2, "Kitchen")
    assert result.success is True

    groups = await get_groups(demo_hass)
    assert {g.group_id for g in groups} == {1, 2}


@pytest.mark.asyncio
async def test_demo_create_duplicate_reports_exists(demo_hass):
    result = await create_group(demo_hass, 1, "Dup")
    assert result.success is False
    assert result.error_code == GROUP_ALREADY_EXISTS_CODE


@pytest.mark.asyncio
async def test_demo_add_and_remove_member(demo_hass):
    add = await add_to_group(demo_hass, 1, node_id=7, endpoint_id=1)
    assert add.success is True
    members = (await get_groups(demo_hass))[0].members
    assert {"node_id": 7, "endpoint_id": 1} in members

    remove = await remove_from_group(demo_hass, 1, node_id=7, endpoint_id=1)
    assert remove.success is True
    members = (await get_groups(demo_hass))[0].members
    assert {"node_id": 7, "endpoint_id": 1} not in members


@pytest.mark.asyncio
async def test_demo_member_ops_on_missing_group_report_not_found(demo_hass):
    add = await add_to_group(demo_hass, 999, 5, 1)
    assert add.success is False
    assert add.error_code == GROUP_NOT_FOUND_CODE


@pytest.mark.asyncio
async def test_demo_delete_group(demo_hass):
    result = await delete_group(demo_hass, 1)
    assert result.success is True
    assert await get_groups(demo_hass) == []

    missing = await delete_group(demo_hass, 1)
    assert missing.success is False
    assert missing.error_code == GROUP_NOT_FOUND_CODE

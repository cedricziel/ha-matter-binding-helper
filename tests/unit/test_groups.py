"""Unit tests for matter/groups.py.

Covers the "honesty gate": until groupcast is implemented, mutating group
operations must report an explicit unsupported result rather than silently
no-op'ing, while listing returns an empty list.
"""

import pytest
from unittest.mock import MagicMock

from custom_components.matter_binding_helper.matter.groups import (
    GROUP_NOT_SUPPORTED_CODE,
    add_to_group,
    create_group,
    delete_group,
    get_groups,
    remove_from_group,
)
from custom_components.matter_binding_helper.matter.models import GroupOperationResult


@pytest.fixture
def hass():
    """Provide a mock Home Assistant instance."""
    return MagicMock()


@pytest.mark.asyncio
async def test_get_groups_returns_empty_list(hass):
    """Listing groups returns an empty list (no managed groups yet)."""
    result = await get_groups(hass)
    assert result == []


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
    payload = result.to_dict()

    assert payload == {
        "success": False,
        "message": result.message,
        "error_code": GROUP_NOT_SUPPORTED_CODE,
    }

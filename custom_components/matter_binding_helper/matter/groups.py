"""Group operations for Matter devices.

Groupcast is implemented incrementally (see the group provisioning plan). In demo
mode, group management is fully functional against an in-memory store so the UI
can be developed without hardware. On a real fabric, the mutating operations
still return an explicit "not supported" result until the Groups cluster +
Group Key Management path lands — so the UI tells the user the truth rather than
appearing to succeed/no-op.
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

from .demo import (
    add_demo_group_member,
    create_demo_group,
    delete_demo_group,
    get_demo_groups,
    is_demo_mode,
    remove_demo_group_member,
)
from .models import GroupEntry, GroupOperationResult

_LOGGER = logging.getLogger(__name__)

# Stable error codes surfaced to the frontend.
GROUP_NOT_SUPPORTED_CODE = "not_supported"
GROUP_ALREADY_EXISTS_CODE = "already_exists"
GROUP_NOT_FOUND_CODE = "not_found"
GROUP_NOT_SUPPORTED_MESSAGE = (
    "Matter group management is not implemented yet. Group creation, membership "
    "and groupcast bindings are coming in a future release."
)


def _not_supported() -> GroupOperationResult:
    """Return the standard 'not yet supported' result for group mutations."""
    return GroupOperationResult(
        success=False,
        message=GROUP_NOT_SUPPORTED_MESSAGE,
        error_code=GROUP_NOT_SUPPORTED_CODE,
    )


async def get_groups(hass: HomeAssistant) -> list[GroupEntry]:
    """Get all Matter groups.

    In demo mode, returns the in-memory demo groups. On a real fabric, returns an
    empty list until group support is implemented (honest: no managed groups yet;
    only the mutating operations report the unsupported state).
    """
    if is_demo_mode(hass):
        return get_demo_groups()
    _LOGGER.debug("get_groups: group support not implemented yet, returning []")
    return []


async def create_group(
    hass: HomeAssistant, group_id: int, name: str
) -> GroupOperationResult:
    """Create a new Matter group."""
    if is_demo_mode(hass):
        if not create_demo_group(group_id, name):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} already exists",
                error_code=GROUP_ALREADY_EXISTS_CODE,
            )
        return GroupOperationResult(success=True, message=f"Created group {group_id}")
    _LOGGER.debug("create_group: not supported yet (group %s: %s)", group_id, name)
    return _not_supported()


async def delete_group(hass: HomeAssistant, group_id: int) -> GroupOperationResult:
    """Delete a Matter group."""
    if is_demo_mode(hass):
        if not delete_demo_group(group_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(success=True, message=f"Deleted group {group_id}")
    _LOGGER.debug("delete_group: not supported yet (group %s)", group_id)
    return _not_supported()


async def add_to_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> GroupOperationResult:
    """Add an endpoint to a group."""
    if is_demo_mode(hass):
        if not add_demo_group_member(group_id, node_id, endpoint_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(
            success=True,
            message=f"Added node {node_id} endpoint {endpoint_id} to group {group_id}",
        )
    _LOGGER.debug(
        "add_to_group: not supported yet (node %s endpoint %s -> group %s)",
        node_id,
        endpoint_id,
        group_id,
    )
    return _not_supported()


async def remove_from_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> GroupOperationResult:
    """Remove an endpoint from a group."""
    if is_demo_mode(hass):
        if not remove_demo_group_member(group_id, node_id, endpoint_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(
            success=True,
            message=(
                f"Removed node {node_id} endpoint {endpoint_id} from group {group_id}"
            ),
        )
    _LOGGER.debug(
        "remove_from_group: not supported yet (node %s endpoint %s -> group %s)",
        node_id,
        endpoint_id,
        group_id,
    )
    return _not_supported()

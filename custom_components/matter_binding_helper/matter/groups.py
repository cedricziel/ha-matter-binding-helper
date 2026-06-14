"""Group operations for Matter devices.

Groupcast is implemented incrementally (see the group provisioning plan). Until
the real Groups cluster + Group Key Management path lands, the mutating
operations return an explicit "not supported" result instead of silently failing,
so the UI can tell the user the truth rather than appearing to succeed/no-op.
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

from .models import GroupEntry, GroupOperationResult

_LOGGER = logging.getLogger(__name__)

# Stable error code surfaced to the frontend while groupcast is unimplemented.
GROUP_NOT_SUPPORTED_CODE = "not_supported"
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

    Returns an empty list until group support is implemented. Listing nothing is
    honest (there are no managed groups yet); only the mutating operations report
    the unsupported state.
    """
    _LOGGER.debug("get_groups: group support not implemented yet, returning []")
    return []


async def create_group(
    hass: HomeAssistant, group_id: int, name: str
) -> GroupOperationResult:
    """Create a new Matter group."""
    _LOGGER.debug("create_group: not supported yet (group %s: %s)", group_id, name)
    return _not_supported()


async def delete_group(hass: HomeAssistant, group_id: int) -> GroupOperationResult:
    """Delete a Matter group."""
    _LOGGER.debug("delete_group: not supported yet (group %s)", group_id)
    return _not_supported()


async def add_to_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> GroupOperationResult:
    """Add an endpoint to a group."""
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
    _LOGGER.debug(
        "remove_from_group: not supported yet (node %s endpoint %s -> group %s)",
        node_id,
        endpoint_id,
        group_id,
    )
    return _not_supported()

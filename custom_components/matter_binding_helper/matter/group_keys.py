"""Group Key Management provisioning for Matter groupcast.

Writes the shared group epoch key (``KeySetWrite``) and the
``GroupId -> GroupKeySetID`` mapping (``GroupKeyMap`` attribute) to a node so it
can encrypt/decrypt groupcast traffic. These are prerequisites for
``Groups.AddGroup`` and for a source device to send groupcast: rs-matter (and the
Matter spec) reject ``AddGroup`` unless the fabric already holds group key
material for the group.

Both operations go through the generic matter-server primitives:
- ``KeySetWrite`` is a command → ``send_device_command`` with a chip struct.
- ``GroupKeyMap`` is a list-of-struct attribute → ``write_attribute`` with plain
  dicts (the same approach bindings.py uses for the Binding attribute).
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from ..const import (
    ATTR_CURRENT_FABRIC_INDEX,
    ATTR_GROUP_KEY_MAP,
    CLUSTER_GROUP_KEY_MANAGEMENT,
    CLUSTER_OPERATIONAL_CREDENTIALS,
    GROUP_EPOCH_START_TIME,
    GROUP_KEY_SECURITY_POLICY_TRUST_FIRST,
)
from .client import get_raw_matter_client
from .demo import is_demo_mode
from .models import GroupOperationResult

_LOGGER = logging.getLogger(__name__)

GROUP_KEY_MAP_PATH = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
CURRENT_FABRIC_INDEX_PATH = (
    f"0/{CLUSTER_OPERATIONAL_CREDENTIALS}/{ATTR_CURRENT_FABRIC_INDEX}"
)


async def _accessing_fabric_index(client: Any, node_id: int) -> int:
    """Read the device's CurrentFabricIndex (the accessing fabric).

    Fabric-scoped writes must carry the real fabric index. python-matter-server
    coerces a 0 to the accessing fabric, but matter.js writes it literally, so a
    hardcoded 0 lands the GroupKeyMap on fabric 0 and the device rejects AddGroup
    with UNSUPPORTED_ACCESS. Fabric indices are 1-based; fall back to 1.
    """
    try:
        value = await client.read_attribute(
            node_id=node_id, attribute_path=CURRENT_FABRIC_INDEX_PATH
        )
        index = int(value)
        # Log the raw value: a 0 here means the controller is reaching the device
        # without a promoted operational fabric, which makes every fabric-scoped
        # write/command (KeySetWrite, GroupKeyMap, AddGroup) fail UNSUPPORTED_ACCESS.
        _LOGGER.info(
            "provision_group_key: node %s reports CurrentFabricIndex=%s",
            node_id,
            index,
        )
        if index >= 1:
            return index
    except (ValueError, TypeError, AttributeError) as err:
        _LOGGER.warning(
            "Could not read CurrentFabricIndex for node %s (%s); assuming 1",
            node_id,
            err,
        )
    return 1


def _entry_field(entry: Any, *keys: Any) -> Any:
    """Read a field from a GroupKeyMap entry (dict or chip struct)."""
    if isinstance(entry, dict):
        for k in keys:
            if k in entry and entry[k] is not None:
                return entry[k]
    else:
        for k in keys:
            if isinstance(k, str) and hasattr(entry, k):
                val = getattr(entry, k)
                if val is not None:
                    return val
    return None


def _unwrap_attr_list(value: Any, path: str) -> list[Any]:
    """Normalize a read_attribute result to a bare list.

    read_attribute may return the value directly or wrapped as
    ``{"<endpoint>/<cluster>/<attr>": value}``. Unwrap so callers always see the
    list of entries.
    """
    if isinstance(value, dict) and path in value:
        value = value[path]
    return value if isinstance(value, list) else []


def _group_key_map_has(
    existing: list[Any] | None, group_id: int, key_set_id: int
) -> bool:
    """True if the GroupKeyMap contains the group_id -> key_set_id mapping."""
    for entry in existing or []:
        gid = _entry_field(entry, "groupId", "1", 1)
        ksid = _entry_field(entry, "groupKeySetID", "2", 2)
        if gid is None or ksid is None:
            continue
        if int(gid) == group_id and int(ksid) == key_set_id:
            return True
    return False


def merge_group_key_map(
    existing: list[Any] | None,
    group_id: int,
    key_set_id: int,
    fabric_index: int = 1,
) -> list[dict[str, int]]:
    """Return the GroupKeyMap list with (group_id -> key_set_id) ensured present.

    Pure read-modify-write helper. Preserves existing mappings, is idempotent
    (no duplicate for the same group_id), and normalizes every entry to a plain
    dict suitable for ``write_attribute``. ``fabric_index`` must be the accessing
    fabric (see ``_accessing_fabric_index``): matter.js honours it literally, so a
    wrong index leaves the device without a group key for the accessing fabric.
    """
    result: list[dict[str, int]] = []
    found = False
    for entry in existing or []:
        gid = _entry_field(entry, "groupId", "1", 1)
        ksid = _entry_field(entry, "groupKeySetID", "2", 2)
        if gid is None or ksid is None:
            continue
        gid, ksid = int(gid), int(ksid)
        if gid == group_id:
            found = True
            ksid = key_set_id  # update to the desired key set
        result.append(
            {"groupId": gid, "groupKeySetID": ksid, "fabricIndex": fabric_index}
        )

    if not found:
        result.append(
            {
                "groupId": group_id,
                "groupKeySetID": key_set_id,
                "fabricIndex": fabric_index,
            }
        )
    return result


def _build_key_set_write_command(key_set_id: int, epoch_key: bytes) -> Any:
    """Build the chip KeySetWrite command (chip imported lazily; real env only)."""
    from chip.clusters import Objects as clusters
    from chip.clusters.Types import NullValue

    key_set = clusters.GroupKeyManagement.Structs.GroupKeySetStruct(
        groupKeySetID=key_set_id,
        groupKeySecurityPolicy=GROUP_KEY_SECURITY_POLICY_TRUST_FIRST,
        epochKey0=epoch_key,
        epochStartTime0=GROUP_EPOCH_START_TIME,
        epochKey1=NullValue,
        epochStartTime1=NullValue,
        epochKey2=NullValue,
        epochStartTime2=NullValue,
    )
    return clusters.GroupKeyManagement.Commands.KeySetWrite(groupKeySet=key_set)


async def provision_group_key(
    hass: HomeAssistant,
    node_id: int,
    group_id: int,
    key_set_id: int,
    epoch_key_hex: str,
) -> GroupOperationResult:
    """Provision a node with the group's key set and GroupId->KeySet mapping.

    Steps (both on the root endpoint, cluster 0x003F):
      1. ``KeySetWrite`` the epoch key under ``key_set_id``.
      2. read-modify-write ``GroupKeyMap`` to map ``group_id -> key_set_id``.
    """
    if is_demo_mode(hass):
        _LOGGER.debug(
            "provision_group_key: demo mode, skipping device writes (node %s group %s)",
            node_id,
            group_id,
        )
        return GroupOperationResult(success=True, message="Demo mode: group key set")

    client = get_raw_matter_client(hass)
    if not client:
        return GroupOperationResult(
            success=False,
            message="Matter client not available",
            error_code="client_unavailable",
        )

    try:
        epoch_key = bytes.fromhex(epoch_key_hex)
    except ValueError:
        return GroupOperationResult(
            success=False,
            message="Stored epoch key is not valid hex",
            error_code="invalid_key",
        )

    try:
        # 1. Write the group key set.
        _LOGGER.info(
            "provision_group_key: KeySetWrite node %s key_set_id %s",
            node_id,
            key_set_id,
        )
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=0,
            command=_build_key_set_write_command(key_set_id, epoch_key),
        )

        # 2. Map the group id to the key set in GroupKeyMap (read-modify-write).
        #    The mapping must be scoped to the accessing fabric or matter.js
        #    leaves the device without a key and rejects AddGroup.
        fabric_index = await _accessing_fabric_index(client, node_id)
        existing = _unwrap_attr_list(
            await client.read_attribute(
                node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
            ),
            GROUP_KEY_MAP_PATH,
        )
        updated = merge_group_key_map(existing, group_id, key_set_id, fabric_index)
        await client.write_attribute(
            node_id=node_id,
            attribute_path=GROUP_KEY_MAP_PATH,
            value=updated,
        )

        # 3. Verify the mapping actually landed. KeySetWrite and the write above
        #    are fabric-scoped and return no usable status, so a silent
        #    UNSUPPORTED_ACCESS (e.g. the controller is on fabric 0) would
        #    otherwise only surface later as a confusing AddGroup rejection.
        readback = _unwrap_attr_list(
            await client.read_attribute(
                node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
            ),
            GROUP_KEY_MAP_PATH,
        )
        if not _group_key_map_has(readback, group_id, key_set_id):
            _LOGGER.error(
                "provision_group_key: GroupKeyMap readback on node %s missing "
                "group %s -> keyset %s (fabric %s); got %s",
                node_id,
                group_id,
                key_set_id,
                fabric_index,
                readback,
            )
            return GroupOperationResult(
                success=False,
                message=(
                    "Group key provisioning was not accepted by the device "
                    f"(device reports accessing fabric {fabric_index}; no "
                    f"GroupKeyMap entry for group {group_id} after write; "
                    f"readback={readback!r}). The Matter controller may be "
                    "sending fabric-scoped writes without a promoted "
                    "operational fabric."
                ),
                error_code="device_error",
            )

        return GroupOperationResult(
            success=True,
            message=f"Provisioned group key for group {group_id} on node {node_id}",
        )
    except Exception as err:  # noqa: BLE001 - surfaced to the user
        _LOGGER.error(
            "provision_group_key: failed for node %s group %s: %s",
            node_id,
            group_id,
            err,
            exc_info=True,
        )
        return GroupOperationResult(
            success=False,
            message=f"Group key provisioning failed: {err}",
            error_code="device_error",
        )

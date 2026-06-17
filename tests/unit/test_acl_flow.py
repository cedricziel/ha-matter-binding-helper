"""Device-less tests for the ACL write flow against both simulated backends.

These lock in the dual-key set_acl_entry fix (matter.js reads snake_case
auth_mode / device_type) as millisecond regression tests rather than a 9-minute
real-device e2e run.
"""

from types import SimpleNamespace

from unittest.mock import MagicMock

import pytest

from custom_components.matter_binding_helper.const import DOMAIN
from custom_components.matter_binding_helper.matter.acl import (
    build_group_acl_entry,
    write_acl,
)

from .fake_matter import FakeMatterClient

CLUSTER_ON_OFF = 6
ADMIN_ENTRY = {
    "privilege": 5,  # Administer
    "authMode": 2,
    "auth_mode": 2,
    "subjects": [112233],
    "targets": None,
    "fabricIndex": 0,
}


def _hass(fake: FakeMatterClient):
    hass = MagicMock()
    hass.data = {DOMAIN: {"e1": {"connection": SimpleNamespace(client=fake)}}}
    # No config entries -> is_demo_mode() returns falsy (live mode).
    hass.config_entries.async_entries = lambda domain: []
    return hass


@pytest.mark.asyncio
@pytest.mark.parametrize("backend", ["python", "matterjs"])
async def test_write_group_acl_succeeds_on_both_backends(backend):
    fake = FakeMatterClient(backend=backend)
    group_entry = build_group_acl_entry(
        group_id=1, cluster_id=CLUSTER_ON_OFF, target_endpoint_id=1
    )
    result = await write_acl(
        _hass(fake), node_id=1, acl_entries=[ADMIN_ENTRY, group_entry]
    )

    assert result.success, result.message
    assert len(fake.acl[1]) == 2  # admin + group-auth entry persisted


@pytest.mark.asyncio
async def test_camelcase_only_group_acl_is_rejected_by_matterjs():
    """A pre-dual-key entry (camelCase only) reproduces the CONSTRAINT_ERROR."""
    fake = FakeMatterClient(backend="matterjs")
    legacy_entry = {
        "privilege": 3,
        "authMode": 3,  # Group — but no snake_case auth_mode
        "subjects": [1],
        "targets": [{"cluster": CLUSTER_ON_OFF, "endpoint": 1, "deviceType": None}],
        "fabricIndex": 0,
    }
    result = await write_acl(
        _hass(fake), node_id=1, acl_entries=[ADMIN_ENTRY, legacy_entry]
    )

    assert not result.success
    assert "rejected" in result.message.lower()


@pytest.mark.asyncio
async def test_write_acl_safety_blocks_without_admin():
    fake = FakeMatterClient(backend="python")
    group_entry = build_group_acl_entry(group_id=1, cluster_id=CLUSTER_ON_OFF)
    result = await write_acl(_hass(fake), node_id=1, acl_entries=[group_entry])

    assert not result.success
    assert "admin" in result.message.lower()
    assert 1 not in fake.acl  # nothing written

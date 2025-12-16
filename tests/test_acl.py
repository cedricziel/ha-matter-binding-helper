"""ACL (Access Control List) tests for Matter Binding Helper.

These tests verify that ACL entries are readable and properly configured
on the virtual Matter devices.

Prerequisites:
    - Docker containers running (docker compose --profile devices up -d)
    - Devices commissioned (dimmable light as node 1, switch as node 4)
    - HA_TOKEN environment variable set

Matter ACL Privileges:
    1 = View (read-only access)
    3 = Operate (can invoke commands)
    4 = Manage (can modify device-specific settings)
    5 = Administer (full control, including fabric operations)

Matter Auth Modes:
    1 = PASE (Passcode-authenticated session establishment)
    2 = CASE (Certificate-authenticated session establishment)
    3 = Group (Group messaging)
"""

import pytest

from .conftest import (
    DIMMABLE_LIGHT_NODE_ID,
    ON_OFF_SWITCH_NODE_ID,
)

# Matter ACL privilege levels
PRIVILEGE_VIEW = 1
PRIVILEGE_OPERATE = 3
PRIVILEGE_MANAGE = 4
PRIVILEGE_ADMINISTER = 5

# Matter authentication modes
AUTH_MODE_PASE = 1
AUTH_MODE_CASE = 2
AUTH_MODE_GROUP = 3


@pytest.mark.asyncio
async def test_list_acl_returns_entries(ws_client):
    """ACL list should return entries for commissioned device."""
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=ON_OFF_SWITCH_NODE_ID,
    )

    assert result.get("success"), f"List ACL failed: {result}"
    assert "entries" in result, "Response should contain 'entries' key"
    assert isinstance(result["entries"], list), "Entries should be a list"
    assert len(result["entries"]) > 0, "Commissioned device should have ACL entries"


@pytest.mark.asyncio
async def test_acl_has_admin_entry(ws_client):
    """Device ACL should include an entry with Administer privilege.

    When a device is commissioned, the commissioning controller
    (matter-server) should have Administer privilege.
    """
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=ON_OFF_SWITCH_NODE_ID,
    )

    entries = result.get("entries", [])

    # Look for Administer privilege entry
    admin_entries = [e for e in entries if e.get("privilege") == PRIVILEGE_ADMINISTER]
    assert len(admin_entries) > 0, (
        f"No Administer ACL entry found. Entries: {entries}"
    )


@pytest.mark.asyncio
async def test_acl_entry_structure(ws_client):
    """ACL entries should have required fields."""
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=ON_OFF_SWITCH_NODE_ID,
    )

    entries = result.get("entries", [])
    assert len(entries) > 0, "Need at least one entry to test structure"

    for entry in entries:
        assert "privilege" in entry, f"Entry missing 'privilege': {entry}"
        assert "auth_mode" in entry, f"Entry missing 'auth_mode': {entry}"
        # subjects and targets may be None/null for "any" matching


@pytest.mark.asyncio
async def test_dimmable_light_has_acl(ws_client):
    """Dimmable light should also have ACL entries."""
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=DIMMABLE_LIGHT_NODE_ID,
    )

    assert result.get("success"), f"List ACL failed: {result}"
    entries = result.get("entries", [])
    assert len(entries) > 0, "Dimmable light should have ACL entries"


@pytest.mark.asyncio
async def test_acl_uses_case_auth(ws_client):
    """After commissioning, ACL should use CASE authentication.

    CASE (Certificate-Authenticated Session Establishment) is used
    for normal device communication after initial PASE commissioning.
    """
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=ON_OFF_SWITCH_NODE_ID,
    )

    entries = result.get("entries", [])

    # Look for CASE auth entries (should be present after commissioning)
    case_entries = [e for e in entries if e.get("auth_mode") == AUTH_MODE_CASE]
    assert len(case_entries) > 0, (
        f"No CASE-authenticated ACL entry found. "
        f"Auth modes: {[e.get('auth_mode') for e in entries]}"
    )


@pytest.mark.asyncio
async def test_acl_privilege_values_valid(ws_client):
    """All ACL privilege values should be in valid range."""
    result = await ws_client.call(
        "matter_binding_helper/list_acl",
        node_id=ON_OFF_SWITCH_NODE_ID,
    )

    entries = result.get("entries", [])
    valid_privileges = {PRIVILEGE_VIEW, PRIVILEGE_OPERATE, PRIVILEGE_MANAGE, PRIVILEGE_ADMINISTER}

    for entry in entries:
        privilege = entry.get("privilege")
        assert privilege in valid_privileges, (
            f"Invalid privilege {privilege}, expected one of {valid_privileges}"
        )

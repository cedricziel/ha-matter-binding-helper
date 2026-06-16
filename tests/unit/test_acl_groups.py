"""Unit tests for the group-auth ACL helpers in matter/acl.py.

Covers the pure builder/matcher (build_group_acl_entry, group_acl_entry_exists).
The async provision/remove paths hit get_acl/write_acl (HA + client) and are
covered by the PR8 integration test.
"""

from custom_components.matter_binding_helper.const import (
    ACL_AUTH_MODE_CASE,
    ACL_AUTH_MODE_GROUP,
    ACL_PRIVILEGE_OPERATE,
    CLUSTER_ON_OFF,
)
from custom_components.matter_binding_helper.matter.acl import (
    build_group_acl_entry,
    group_acl_entry_exists,
)
from custom_components.matter_binding_helper.matter.models import ACLEntry, ACLTarget


def test_build_group_acl_entry_uses_group_auth_mode():
    entry = build_group_acl_entry(
        group_id=5, cluster_id=CLUSTER_ON_OFF, target_endpoint_id=1
    )
    # Both key spellings are emitted: chip/python reads authMode/deviceType,
    # matter.js reads auth_mode/device_type.
    assert entry["authMode"] == ACL_AUTH_MODE_GROUP
    assert entry["auth_mode"] == ACL_AUTH_MODE_GROUP
    assert entry["subjects"] == [5]
    assert entry["privilege"] == ACL_PRIVILEGE_OPERATE
    assert entry["targets"] == [
        {
            "cluster": CLUSTER_ON_OFF,
            "endpoint": 1,
            "deviceType": None,
            "device_type": None,
        }
    ]


def _group_entry(group_id, cluster, endpoint=None):
    return ACLEntry(
        privilege=ACL_PRIVILEGE_OPERATE,
        auth_mode=ACL_AUTH_MODE_GROUP,
        subjects=[group_id],
        targets=[ACLTarget(cluster=cluster, endpoint=endpoint)],
        fabric_index=1,
    )


def test_exists_true_for_matching_group_entry():
    entries = [_group_entry(5, CLUSTER_ON_OFF, 1)]
    assert group_acl_entry_exists(entries, 5, CLUSTER_ON_OFF, 1) is True


def test_exists_false_for_different_group():
    entries = [_group_entry(5, CLUSTER_ON_OFF, 1)]
    assert group_acl_entry_exists(entries, 6, CLUSTER_ON_OFF, 1) is False


def test_exists_ignores_case_entries():
    """A CASE (unicast) entry must not satisfy a group ACL check."""
    case_entry = ACLEntry(
        privilege=ACL_PRIVILEGE_OPERATE,
        auth_mode=ACL_AUTH_MODE_CASE,
        subjects=[5],
        targets=[ACLTarget(cluster=CLUSTER_ON_OFF, endpoint=1)],
        fabric_index=1,
    )
    assert group_acl_entry_exists([case_entry], 5, CLUSTER_ON_OFF, 1) is False


def test_exists_true_for_wildcard_targets():
    entry = ACLEntry(
        privilege=ACL_PRIVILEGE_OPERATE,
        auth_mode=ACL_AUTH_MODE_GROUP,
        subjects=[5],
        targets=[],  # all clusters/endpoints
        fabric_index=1,
    )
    assert group_acl_entry_exists([entry], 5, CLUSTER_ON_OFF, 1) is True


def test_exists_false_for_cluster_mismatch():
    entries = [_group_entry(5, CLUSTER_ON_OFF, 1)]
    assert group_acl_entry_exists(entries, 5, 0x0008, 1) is False

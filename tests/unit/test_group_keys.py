"""Unit tests for matter/group_keys.py.

Covers the pure read-modify-write GroupKeyMap merge logic. The device I/O
(KeySetWrite via chip.clusters, attribute writes) is covered by the integration
tests, since chip.clusters is only available in the real runtime.
"""

from custom_components.matter_binding_helper.matter.group_keys import (
    _group_key_map_has,
    _unwrap_attr_list,
    merge_group_key_map,
)


def test_unwrap_attr_list_handles_path_wrapped_and_bare():
    path = "0/63/0"
    # read_attribute may wrap the value as {path: value} ...
    assert _unwrap_attr_list({path: [{"1": 1}]}, path) == [{"1": 1}]
    # ... or return the bare list ...
    assert _unwrap_attr_list([{"1": 1}], path) == [{"1": 1}]
    # ... or nothing usable.
    assert _unwrap_attr_list(None, path) == []
    assert _unwrap_attr_list({path: []}, path) == []


def test_group_key_map_has_with_tag_keyed_entries():
    """Device readback uses numeric TLV tag keys, not camelCase."""
    readback = [{"1": 1, "2": 256, "254": 1}]  # groupId=1, keySetID=256, fabric=1
    assert _group_key_map_has(readback, 1, 256) is True
    assert _group_key_map_has(readback, 1, 999) is False


def test_group_key_map_has_detects_mapping():
    entries = [{"groupId": 5, "groupKeySetID": 0x100, "fabricIndex": 1}]
    assert _group_key_map_has(entries, 5, 0x100) is True
    assert _group_key_map_has(entries, 5, 0x200) is False  # wrong keyset
    assert _group_key_map_has(entries, 9, 0x100) is False  # wrong group
    assert _group_key_map_has(None, 5, 0x100) is False
    assert _group_key_map_has([{"foo": "bar"}], 5, 0x100) is False


def test_merge_into_empty_map():
    result = merge_group_key_map(None, group_id=5, key_set_id=0x100)
    # Default fabric index is the accessing fabric (1-based), not 0.
    assert result == [{"groupId": 5, "groupKeySetID": 0x100, "fabricIndex": 1}]


def test_merge_appends_new_group():
    existing = [{"groupId": 1, "groupKeySetID": 0x100, "fabricIndex": 1}]
    result = merge_group_key_map(existing, group_id=2, key_set_id=0x101)
    assert {"groupId": 2, "groupKeySetID": 0x101, "fabricIndex": 1} in result
    assert any(e["groupId"] == 1 for e in result)
    assert len(result) == 2


def test_merge_is_idempotent_for_same_group():
    existing = [{"groupId": 5, "groupKeySetID": 0x100, "fabricIndex": 1}]
    result = merge_group_key_map(existing, group_id=5, key_set_id=0x100)
    assert result == [{"groupId": 5, "groupKeySetID": 0x100, "fabricIndex": 1}]


def test_merge_updates_key_set_for_existing_group():
    existing = [{"groupId": 5, "groupKeySetID": 0x100, "fabricIndex": 1}]
    result = merge_group_key_map(existing, group_id=5, key_set_id=0x200)
    assert result == [{"groupId": 5, "groupKeySetID": 0x200, "fabricIndex": 1}]


def test_merge_uses_supplied_fabric_index():
    """The accessing fabric index is honoured on every written entry."""
    existing = [{"groupId": 1, "groupKeySetID": 0x100, "fabricIndex": 2}]
    result = merge_group_key_map(
        existing, group_id=2, key_set_id=0x101, fabric_index=2
    )
    assert all(e["fabricIndex"] == 2 for e in result)


def test_merge_reads_chip_style_struct_entries():
    """Existing entries may be chip structs with attribute access."""

    class FakeEntry:
        def __init__(self, group_id, key_set_id):
            self.groupId = group_id
            self.groupKeySetID = key_set_id

    existing = [FakeEntry(1, 0x100)]
    result = merge_group_key_map(existing, group_id=2, key_set_id=0x101)
    assert {"groupId": 1, "groupKeySetID": 0x100, "fabricIndex": 1} in result
    assert {"groupId": 2, "groupKeySetID": 0x101, "fabricIndex": 1} in result


def test_merge_skips_malformed_entries():
    existing = [{"groupId": None, "groupKeySetID": 5}, {"foo": "bar"}]
    result = merge_group_key_map(existing, group_id=9, key_set_id=0x100)
    assert result == [{"groupId": 9, "groupKeySetID": 0x100, "fabricIndex": 1}]

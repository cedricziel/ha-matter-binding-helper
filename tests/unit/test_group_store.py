"""Unit tests for matter/group_store.py.

Uses an in-memory fake Store and a deterministic key factory so the registry
logic (CRUD, key-set-id allocation, epoch-key persistence) is testable without
Home Assistant or hardware.
"""

import itertools

import pytest
from unittest.mock import MagicMock

from custom_components.matter_binding_helper.const import GROUP_KEY_SET_BASE
from custom_components.matter_binding_helper.matter.group_store import (
    GroupRecord,
    GroupStore,
)


class FakeStore:
    """In-memory stand-in for homeassistant.helpers.storage.Store."""

    def __init__(self, initial=None):
        self.saved = initial
        self.save_count = 0

    async def async_load(self):
        return self.saved

    async def async_save(self, data):
        # Emulate JSON round-trip so tests catch non-serializable state.
        import json

        self.saved = json.loads(json.dumps(data))
        self.save_count += 1


def _counter_keys():
    """Deterministic epoch-key factory: 'key0001', 'key0002', ..."""
    counter = itertools.count(1)
    return lambda: f"key{next(counter):04d}"


def make_store(initial=None):
    return GroupStore(
        MagicMock(), store=FakeStore(initial), key_factory=_counter_keys()
    )


@pytest.mark.asyncio
async def test_load_empty_initializes_defaults():
    store = make_store()
    await store.async_load()
    assert store.list_groups() == []


@pytest.mark.asyncio
async def test_create_group_allocates_key_set_and_epoch_key():
    store = make_store()
    await store.async_load()

    rec = await store.async_create_group(10, "Living Room")

    assert isinstance(rec, GroupRecord)
    assert rec.group_id == 10
    assert rec.name == "Living Room"
    assert rec.key_set_id == GROUP_KEY_SET_BASE
    assert rec.epoch_key == "key0001"
    assert rec.members == []


@pytest.mark.asyncio
async def test_key_set_ids_are_sequential_and_unique():
    store = make_store()
    await store.async_load()

    a = await store.async_create_group(1, "A")
    b = await store.async_create_group(2, "B")

    assert a.key_set_id == GROUP_KEY_SET_BASE
    assert b.key_set_id == GROUP_KEY_SET_BASE + 1
    assert a.epoch_key != b.epoch_key


@pytest.mark.asyncio
async def test_auto_allocates_group_id_when_none():
    store = make_store()
    await store.async_load()

    a = await store.async_create_group(None, "A")
    b = await store.async_create_group(None, "B")

    assert a.group_id == 1
    assert b.group_id == 2


@pytest.mark.asyncio
async def test_auto_allocation_skips_existing_ids():
    store = make_store()
    await store.async_load()
    await store.async_create_group(1, "Explicit")  # takes id 1

    auto = await store.async_create_group(None, "Auto")
    assert auto.group_id == 2  # skipped the taken id 1


@pytest.mark.asyncio
async def test_next_group_id_survives_reload():
    backing = FakeStore()
    s1 = GroupStore(MagicMock(), store=backing, key_factory=_counter_keys())
    await s1.async_load()
    await s1.async_create_group(None, "A")  # id 1

    s2 = GroupStore(
        MagicMock(), store=FakeStore(backing.saved), key_factory=_counter_keys()
    )
    await s2.async_load()
    rec = await s2.async_create_group(None, "B")
    assert rec.group_id == 2


@pytest.mark.asyncio
async def test_create_duplicate_group_raises():
    store = make_store()
    await store.async_load()
    await store.async_create_group(1, "A")

    with pytest.raises(ValueError):
        await store.async_create_group(1, "A again")


@pytest.mark.asyncio
async def test_add_member_is_idempotent():
    store = make_store()
    await store.async_load()
    await store.async_create_group(1, "A")

    await store.async_add_member(1, node_id=5, endpoint_id=1)
    rec = await store.async_add_member(1, node_id=5, endpoint_id=1)

    assert rec.members == [{"node_id": 5, "endpoint_id": 1}]


@pytest.mark.asyncio
async def test_remove_member():
    store = make_store()
    await store.async_load()
    await store.async_create_group(1, "A")
    await store.async_add_member(1, 5, 1)
    await store.async_add_member(1, 6, 1)

    rec = await store.async_remove_member(1, 5, 1)

    assert rec.members == [{"node_id": 6, "endpoint_id": 1}]


@pytest.mark.asyncio
async def test_member_ops_on_missing_group_raise():
    store = make_store()
    await store.async_load()

    with pytest.raises(ValueError):
        await store.async_add_member(99, 5, 1)
    with pytest.raises(ValueError):
        await store.async_remove_member(99, 5, 1)


@pytest.mark.asyncio
async def test_delete_group():
    store = make_store()
    await store.async_load()
    await store.async_create_group(1, "A")

    assert await store.async_delete_group(1) is True
    assert await store.async_delete_group(1) is False
    assert store.get_group(1) is None


@pytest.mark.asyncio
async def test_persistence_round_trip_preserves_epoch_key():
    """A second GroupStore over the same backing data sees the same key.

    This is the critical property: the epoch key can't be read off devices, so
    the store must reproduce it exactly for later member additions.
    """
    backing = FakeStore()
    store1 = GroupStore(MagicMock(), store=backing, key_factory=_counter_keys())
    await store1.async_load()
    created = await store1.async_create_group(7, "Kitchen")
    await store1.async_add_member(7, 5, 1)

    # New store instance, same persisted bytes, fresh (unused) key factory.
    store2 = GroupStore(
        MagicMock(), store=FakeStore(backing.saved), key_factory=_counter_keys()
    )
    await store2.async_load()
    reloaded = store2.get_group(7)

    assert reloaded is not None
    assert reloaded.epoch_key == created.epoch_key
    assert reloaded.key_set_id == created.key_set_id
    assert reloaded.members == [{"node_id": 5, "endpoint_id": 1}]


@pytest.mark.asyncio
async def test_clusters_default_empty_and_round_trip():
    """The cluster set (group's type) persists and reloads exactly.

    Matter groups are untyped on the wire, so the store is the only type
    authority — it must round-trip the cluster list verbatim.
    """
    backing = FakeStore()
    store1 = GroupStore(MagicMock(), store=backing, key_factory=_counter_keys())
    await store1.async_load()

    untyped = await store1.async_create_group(1, "Legacy")
    assert untyped.clusters == []

    typed = await store1.async_create_group(2, "Lights", clusters=[0x0006, 0x0008])
    assert typed.clusters == [0x0006, 0x0008]

    store2 = GroupStore(
        MagicMock(), store=FakeStore(backing.saved), key_factory=_counter_keys()
    )
    await store2.async_load()
    assert store2.get_group(1).clusters == []
    assert store2.get_group(2).clusters == [0x0006, 0x0008]


@pytest.mark.asyncio
async def test_clusters_coerced_to_ints():
    """Cluster ids arriving as strings (JSON) are normalized to ints."""
    store = make_store()
    await store.async_load()
    rec = await store.async_create_group(1, "X", clusters=["6", "8"])
    assert rec.clusters == [6, 8]


@pytest.mark.asyncio
async def test_next_key_set_id_survives_reload():
    """Key-set-id allocation must not collide after a reload."""
    backing = FakeStore()
    store1 = GroupStore(MagicMock(), store=backing, key_factory=_counter_keys())
    await store1.async_load()
    await store1.async_create_group(1, "A")  # uses BASE

    store2 = GroupStore(
        MagicMock(), store=FakeStore(backing.saved), key_factory=_counter_keys()
    )
    await store2.async_load()
    rec = await store2.async_create_group(2, "B")

    assert rec.key_set_id == GROUP_KEY_SET_BASE + 1

"""Unit tests for matter/wire.py — the fabric-scoped write mechanism.

A small fake stands in for the two real backends so the camelCase/tag-key +
fabricIndex + cache-lag logic is exercised in milliseconds instead of a 9-minute
real-device e2e run.
"""

import pytest

from custom_components.matter_binding_helper.matter.wire import (
    CURRENT_FABRIC_INDEX_PATH,
    encode_struct,
    struct_field,
    unwrap_attr_list,
    write_fabric_scoped_list,
)

# GroupKeyMap field tags for the tests.
TAG_MAP = {"groupId": 1, "groupKeySetID": 2}


class FakeServer:
    """Simulates a Matter server's fabric-scoped list write semantics.

    backend="python": accepts any key format, coerces fabricIndex to the
      accessing fabric (like chip).
    backend="matterjs": persists only numeric tag-key entries whose fabricIndex
      equals the accessing fabric; silently drops anything else.
    ``lag`` reads after a write return the prior value (cache lag).
    """

    def __init__(self, backend, accessing_fabric=1, lag=0):
        self.backend = backend
        self.fabric = accessing_fabric
        self.lag = lag
        self.store: list = []
        self._stale = []
        self._lag_left = 0

    async def read_attribute(self, node_id, attribute_path):
        if attribute_path == CURRENT_FABRIC_INDEX_PATH:
            return {attribute_path: self.fabric}
        if self._lag_left > 0:
            self._lag_left -= 1
            return {attribute_path: list(self._stale)}
        return {attribute_path: list(self.store)}

    async def write_attribute(self, node_id, attribute_path, value):
        self._stale = list(self.store)
        accepted = [e for e in (self._accept(e) for e in value) if e is not None]
        self.store = accepted
        self._lag_left = self.lag

    def _accept(self, entry):
        is_tag = all(k.isdigit() for k in entry)
        fabric = entry.get("254") if is_tag else entry.get("fabricIndex")
        if self.backend == "matterjs":
            if not is_tag or fabric != self.fabric:
                return None  # dropped, no error (matches observed behavior)
            return entry
        # python: accept, coerce fabric index
        out = dict(entry)
        out["254" if is_tag else "fabricIndex"] = self.fabric
        return out


def _has_group(group_id, key_set_id):
    def verify(readback):
        return any(
            struct_field(e, "groupId", 1) == group_id
            and struct_field(e, "groupKeySetID", 2) == key_set_id
            for e in readback
        )

    return verify


def test_encode_struct_name_vs_tag():
    fields = {"groupId": 5, "groupKeySetID": 0x100}
    assert encode_struct(fields, TAG_MAP, 1, tag_keys=False) == {
        "groupId": 5,
        "groupKeySetID": 0x100,
        "fabricIndex": 1,
    }
    assert encode_struct(fields, TAG_MAP, 1, tag_keys=True) == {
        "1": 5,
        "2": 0x100,
        "254": 1,
    }


def test_encode_struct_drops_none():
    out = encode_struct({"groupId": 5, "groupKeySetID": None}, TAG_MAP, 2, False)
    assert out == {"groupId": 5, "fabricIndex": 2}


def test_unwrap_attr_list():
    assert unwrap_attr_list({"0/63/0": [{"1": 1}]}, "0/63/0") == [{"1": 1}]
    assert unwrap_attr_list([{"1": 1}], "0/63/0") == [{"1": 1}]
    assert unwrap_attr_list(None, "0/63/0") == []


@pytest.mark.asyncio
async def test_write_succeeds_on_python_with_name_keys():
    server = FakeServer("python")
    ok, _ = await write_fabric_scoped_list(
        server,
        1,
        "0/63/0",
        [{"groupId": 1, "groupKeySetID": 0x100}],
        TAG_MAP,
        _has_group(1, 0x100),
    )
    assert ok
    # python stored the entry (camelCase accepted on the first attempt)
    assert server.store and struct_field(server.store[0], "groupId", 1) == 1


@pytest.mark.asyncio
async def test_write_retries_tag_keys_on_matterjs():
    server = FakeServer("matterjs")
    ok, _ = await write_fabric_scoped_list(
        server,
        1,
        "0/63/0",
        [{"groupId": 1, "groupKeySetID": 0x100}],
        TAG_MAP,
        _has_group(1, 0x100),
        delay=0,
    )
    assert ok
    # matter.js only kept the tag-keyed retry, with the real fabric index
    assert server.store == [{"1": 1, "2": 0x100, "254": 1}]


@pytest.mark.asyncio
async def test_matterjs_accepts_real_fabric_index():
    # If the code wrote fabricIndex 0 instead of the accessing fabric, matter.js
    # would drop every entry and the write would never verify.
    server = FakeServer("matterjs", accessing_fabric=1)
    ok, _ = await write_fabric_scoped_list(
        server,
        1,
        "0/63/0",
        [{"groupId": 1, "groupKeySetID": 0x100}],
        TAG_MAP,
        _has_group(1, 0x100),
        delay=0,
    )
    assert ok  # passes because we resolve and write the real fabric index (1)


@pytest.mark.asyncio
async def test_write_polls_through_cache_lag():
    server = FakeServer("python", lag=3)
    ok, _ = await write_fabric_scoped_list(
        server,
        1,
        "0/63/0",
        [{"groupId": 1, "groupKeySetID": 0x100}],
        TAG_MAP,
        _has_group(1, 0x100),
        delay=0,  # no real sleeping in the test
    )
    assert ok


@pytest.mark.asyncio
async def test_write_fails_when_never_persisted():
    # A server that drops everything: the write can never verify (both formats
    # tried, all attempts polled) and returns failure rather than hanging.
    class DropAll(FakeServer):
        def _accept(self, entry):
            return None

    drop = DropAll("matterjs")
    ok, last = await write_fabric_scoped_list(
        drop,
        1,
        "0/63/0",
        [{"groupId": 1, "groupKeySetID": 0x100}],
        TAG_MAP,
        _has_group(1, 0x100),
        delay=0,
    )
    assert not ok
    assert last == []

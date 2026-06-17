"""Unit tests for the optional direct Matter server connection (#61)."""

import asyncio
import sys
import types
from unittest.mock import MagicMock

import pytest

from custom_components.matter_binding_helper.const import DOMAIN
from custom_components.matter_binding_helper.matter.client import (
    _get_direct_client,
    get_raw_matter_client,
)


def _hass(data):
    hass = MagicMock()
    hass.data = data
    return hass


def test_direct_client_returned_when_connected():
    conn = MagicMock()
    conn.client = "SENTINEL"
    assert _get_direct_client(_hass({DOMAIN: {"e1": {"connection": conn}}})) == "SENTINEL"


def test_direct_client_none_when_not_ready():
    conn = MagicMock()
    conn.client = None
    assert _get_direct_client(_hass({DOMAIN: {"e1": {"connection": conn}}})) is None


def test_direct_client_none_when_absent():
    assert _get_direct_client(_hass({DOMAIN: {"e1": {}}})) is None
    assert _get_direct_client(_hass({})) is None


def test_get_raw_matter_client_prefers_direct():
    conn = MagicMock()
    conn.client = "DIRECT"
    # A configured direct client wins without touching HA's Matter integration.
    assert get_raw_matter_client(_hass({DOMAIN: {"e1": {"connection": conn}}})) == "DIRECT"


class _FakeMatterClient:
    def __init__(self, url, session):
        self.url = url
        self.connected = False
        self.listening = False

    async def connect(self):
        self.connected = True

    async def start_listening(self, init_ready):
        self.listening = True
        init_ready.set()
        await asyncio.Event().wait()  # block like the real read loop

    async def disconnect(self):
        self.connected = False


@pytest.fixture
def _fake_matter_server(monkeypatch):
    pkg = types.ModuleType("matter_server")
    client_mod = types.ModuleType("matter_server.client")
    client_mod.MatterClient = _FakeMatterClient
    pkg.client = client_mod
    monkeypatch.setitem(sys.modules, "matter_server", pkg)
    monkeypatch.setitem(sys.modules, "matter_server.client", client_mod)
    import custom_components.matter_binding_helper.matter.connection as connection

    monkeypatch.setattr(connection, "async_get_clientsession", lambda hass: MagicMock())
    return connection


@pytest.mark.asyncio
async def test_connection_connects_and_disconnects(_fake_matter_server):
    connection = _fake_matter_server
    hass = MagicMock()
    hass.async_create_background_task = lambda coro, name: asyncio.ensure_future(coro)

    conn = connection.DirectMatterConnection(hass, "ws://localhost:5580/ws")
    assert conn.client is None  # not ready until connected

    await conn.async_connect()
    assert conn.client is not None
    assert conn.client.connected and conn.client.listening

    await conn.async_disconnect()
    assert conn.client is None


@pytest.mark.asyncio
async def test_connection_times_out_when_never_ready(_fake_matter_server):
    connection = _fake_matter_server
    connection.LISTEN_READY_TIMEOUT = 0.05  # don't wait 30s in the test

    class _NeverReady(_FakeMatterClient):
        async def start_listening(self, init_ready):
            await asyncio.Event().wait()  # never sets init_ready

    sys.modules["matter_server.client"].MatterClient = _NeverReady

    hass = MagicMock()
    hass.async_create_background_task = lambda coro, name: asyncio.ensure_future(coro)
    conn = connection.DirectMatterConnection(hass, "ws://localhost:5580/ws")

    with pytest.raises(TimeoutError):
        await conn.async_connect()
    assert conn.client is None  # cleaned up

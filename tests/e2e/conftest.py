"""Fixtures for real-device e2e tests.

Unlike the demo-mode integration tests, these commission the rs-matter virtual
devices for real. Matter commissioning needs mDNS/IPv6 discovery, which a Docker
bridge network breaks — so every container runs with ``network_mode=host`` (the
same setup docker-compose uses successfully). This works on Linux runners
(GitHub Actions); it does not work on Docker Desktop for Mac, so these tests are
CI-only.

Flow: start matter-server + both devices + HA on the host network → bootstrap HA
→ install the Matter integration (pointing at localhost) + our integration
(real mode, no demo) → parse each device's pairing code from its logs →
commission both → discover their node ids.
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Any, Generator

import pytest
import pytest_asyncio
import requests
from testcontainers.core.container import DockerContainer
from websockets.asyncio.client import connect

from ..conftest import (
    HABootstrapper,
    HAWebSocketClient,
    matter_backend,  # noqa: F401 — re-exported so e2e tests parametrize over backends
    matter_backend_image,
)

MATTER_SERVER_PORT = 5580
HA_PORT = 8123

# Cluster ids used to identify commissioned devices.
CLUSTER_ON_OFF = 6
CLUSTER_LEVEL_CONTROL = 8
CLUSTER_BINDING = 30
CLUSTER_GROUPS = 4


def _host_container(image: str, name: str) -> DockerContainer:
    """A container on the host network (no bridge, no port mapping)."""
    container = DockerContainer(image).with_name(name)
    # testcontainers passes kwargs straight to `docker run`.
    container.with_kwargs(network_mode="host")
    return container


def _build_device_image(project_root: Path, binary: str, tag: str) -> str:
    import docker

    client = docker.from_env()
    dockerfile_path = project_root / "devices" / "rust-device"
    print(f"\n[e2e] Building {binary} image...")
    client.images.build(
        path=str(dockerfile_path),
        tag=tag,
        buildargs={"BINARY": binary},
        rm=True,
    )
    return tag


def _pairing_code_from_logs(container: DockerContainer, timeout: int = 60) -> str:
    """Extract the device's QR pairing payload (``MT:...``) from its logs."""
    deadline = time.time() + timeout
    pattern = re.compile(r"MT:[0-9A-Z.\-/:$%*+ ]{8,}")
    while time.time() < deadline:
        stdout, stderr = container.get_logs()
        text = (stdout or b"").decode("utf-8", "ignore") + (stderr or b"").decode(
            "utf-8", "ignore"
        )
        match = pattern.search(text)
        if match:
            return match.group(0).strip()
        time.sleep(2)
    raise RuntimeError("Could not find MT: pairing code in device logs")


@pytest.fixture(scope="session")
def project_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


@pytest.fixture(scope="session")
def matter_server_container(
    matter_backend,  # noqa: F811 — fixture imported from ..conftest
) -> Generator[DockerContainer, None, None]:
    container = _host_container(
        matter_backend_image(matter_backend),
        "matter-server-e2e",
    ).with_env("TZ", "UTC")
    if matter_backend == "matterjs":
        # matter.js rejects test/development certificates by default (an
        # intentional difference from python-matter-server). Our rs-matter
        # virtual devices use test certs, so opt in to test-net DCL.
        container.with_env("ENABLE_TEST_NET_DCL", "true")
    print(f"\n[e2e] Starting Matter Server ({matter_backend}, host network)...")
    container.start()

    deadline = time.time() + 90
    import socket

    while time.time() < deadline:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        ok = sock.connect_ex(("127.0.0.1", MATTER_SERVER_PORT)) == 0
        sock.close()
        if ok:
            break
        time.sleep(2)
    else:
        pytest.fail("Matter Server did not become ready")

    yield container
    container.stop()


@pytest.fixture(scope="session")
def dimmable_light_container(
    project_root: Path,
) -> Generator[DockerContainer, None, None]:
    tag = _build_device_image(project_root, "dimmable_light", "matter-dimmable-e2e")
    container = (
        _host_container(tag, "matter-dimmable-light-e2e")
        .with_env("MATTER_DISCRIMINATOR", "3840")
        .with_env("MATTER_PASSCODE", "20202021")
        .with_env("MATTER_PORT", "5540")
        .with_env("RUST_LOG", "info")
    )
    print("\n[e2e] Starting dimmable light (host network)...")
    container.start()
    time.sleep(5)
    yield container
    container.stop()


@pytest.fixture(scope="session")
def on_off_switch_container(
    project_root: Path,
) -> Generator[DockerContainer, None, None]:
    tag = _build_device_image(project_root, "on_off_switch", "matter-switch-e2e")
    container = (
        _host_container(tag, "matter-on-off-switch-e2e")
        .with_env("MATTER_DISCRIMINATOR", "3841")
        .with_env("MATTER_PASSCODE", "20202022")
        .with_env("MATTER_PORT", "5541")
        .with_env("RUST_LOG", "info")
    )
    print("\n[e2e] Starting on/off switch (host network)...")
    container.start()
    time.sleep(5)
    yield container
    container.stop()


@pytest.fixture(scope="session")
def ha_container(project_root: Path) -> Generator[DockerContainer, None, None]:
    component = project_root / "custom_components" / "matter_binding_helper"
    container = _host_container(
        "ghcr.io/home-assistant/home-assistant:stable", "ha-e2e"
    ).with_env("TZ", "UTC")
    container.with_volume_mapping(
        str(component),
        "/config/custom_components/matter_binding_helper",
        "ro",
    )
    print("\n[e2e] Starting Home Assistant (host network)...")
    container.start()

    url = f"http://127.0.0.1:{HA_PORT}/api/"
    deadline = time.time() + 120
    while time.time() < deadline:
        try:
            if requests.get(url, timeout=5).status_code in (200, 401):
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
    else:
        pytest.fail("Home Assistant did not become ready")

    yield container

    # Write the integration's own log lines to a file so CI failures are
    # diagnosable without a live device. A file (not stdout) survives pytest's
    # output capture; the workflow prints it on failure.
    try:
        stdout, stderr = container.get_logs()
        text = (stdout or b"").decode("utf-8", "ignore") + (stderr or b"").decode(
            "utf-8", "ignore"
        )
        lines = [
            ln
            for ln in text.splitlines()
            if "matter_binding_helper" in ln
            and any(
                k in ln
                for k in ("provision", "GroupKeyMap", "ACL", "acl", "binding", "AddGroup")
            )
        ]
        out = project_root / "e2e-ha.log"
        out.write_text("\n".join(lines[-300:]), encoding="utf-8")
        print(f"\n[e2e] wrote {len(lines)} integration log lines to {out}")
    except Exception as err:  # noqa: BLE001 - diagnostics only
        print(f"[e2e] could not capture HA logs: {err}")

    container.stop()


@pytest.fixture(scope="session")
def commissioned(
    matter_server_container,
    dimmable_light_container,
    on_off_switch_container,
    ha_container,
) -> dict[str, Any]:
    """Bootstrap HA, install integrations (real mode), commission both devices."""
    base_url = f"http://127.0.0.1:{HA_PORT}"
    boot = HABootstrapper(base_url)
    if not boot.wait_for_ha(timeout=120):
        pytest.fail("HA not ready")

    if not boot.needs_onboarding():
        pytest.fail("HA should need onboarding in a fresh container")
    access_token = boot.complete_onboarding()
    assert access_token, "onboarding failed"

    token = boot.create_long_lived_token(access_token)
    assert token, "token creation failed"

    matter_entry = boot.install_matter_integration(
        access_token, f"ws://127.0.0.1:{MATTER_SERVER_PORT}/ws"
    )
    assert matter_entry, "matter integration install failed"
    time.sleep(3)

    entry_id = boot.install_integration(access_token)
    assert entry_id, "matter_binding_helper install failed"
    # NOTE: real mode — demo mode is deliberately NOT enabled.
    time.sleep(2)

    light_code = _pairing_code_from_logs(dimmable_light_container)
    switch_code = _pairing_code_from_logs(on_off_switch_container)
    print(f"[e2e] light code={light_code}  switch code={switch_code}")

    assert boot.commission_device(access_token, light_code), (
        "light commissioning failed"
    )
    assert boot.commission_device(access_token, switch_code), (
        "switch commissioning failed"
    )
    time.sleep(5)

    return {"host": base_url, "token": token}


@pytest_asyncio.fixture
async def ws_client(commissioned: dict[str, Any]):
    ws_url = commissioned["host"].replace("http://", "ws://") + "/api/websocket"
    async with connect(ws_url) as ws:
        msg = json.loads(await ws.recv())
        assert msg["type"] == "auth_required"
        await ws.send(
            json.dumps({"type": "auth", "access_token": commissioned["token"]})
        )
        msg = json.loads(await ws.recv())
        assert msg["type"] == "auth_ok", f"auth failed: {msg}"
        yield HAWebSocketClient(ws)


async def _list_nodes(ws_client: HAWebSocketClient) -> list[dict[str, Any]]:
    result = await ws_client.call("matter_binding_helper/list_nodes")
    return result.get("nodes", [])


def _endpoint1_clusters(node: dict[str, Any]) -> set[int]:
    for ep in node.get("endpoints", []):
        if ep.get("endpoint_id") == 1:
            return set(ep.get("server_clusters", []))
    return set()


@pytest_asyncio.fixture
async def device_nodes(ws_client: HAWebSocketClient) -> dict[str, int]:
    """Discover the commissioned device node ids by their cluster signatures."""
    nodes = await _list_nodes(ws_client)
    light = switch = None
    for node in nodes:
        clusters = _endpoint1_clusters(node)
        if {CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_GROUPS} <= clusters:
            light = node["node_id"]
        elif {CLUSTER_BINDING, CLUSTER_GROUPS} <= clusters:
            switch = node["node_id"]
    assert light is not None, f"dimmable light node not found in {nodes}"
    assert switch is not None, f"on/off switch node not found in {nodes}"
    return {"light": light, "switch": switch}

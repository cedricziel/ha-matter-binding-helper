"""Shared test fixtures for Matter Binding Helper integration tests.

Uses testcontainers for fully isolated, reproducible test environments.
All containers are managed individually by testcontainers.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from pathlib import Path
from typing import Any, Generator

import pytest
import pytest_asyncio
import requests
from testcontainers.core.container import DockerContainer
from testcontainers.core.waiting_utils import wait_for_logs
from websockets.asyncio.client import connect


class HAWebSocketClient:
    """Helper for calling Home Assistant WebSocket commands."""

    def __init__(self, ws):
        self.ws = ws
        self.msg_id = 1

    async def call(self, command_type: str, **kwargs) -> dict[str, Any]:
        """Call a WebSocket command and return result."""
        msg = {"id": self.msg_id, "type": command_type, **kwargs}
        self.msg_id += 1

        await self.ws.send(json.dumps(msg))

        while True:
            response = json.loads(await self.ws.recv())
            if response.get("id") == msg["id"]:
                if not response.get("success", True):
                    error = response.get("error", {})
                    raise Exception(error.get("message", "Unknown error"))
                return response.get("result", response)


class HABootstrapper:
    """Bootstrap Home Assistant for testing."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()

    def wait_for_ha(self, timeout: int = 120) -> bool:
        """Wait for HA to be ready."""
        start = time.time()
        while time.time() - start < timeout:
            try:
                resp = self.session.get(f"{self.base_url}/api/", timeout=5)
                if resp.status_code in (200, 401):
                    return True
            except requests.exceptions.RequestException:
                pass
            time.sleep(2)
        return False

    def needs_onboarding(self) -> bool:
        """Check if HA needs onboarding."""
        try:
            resp = self.session.get(f"{self.base_url}/api/onboarding", timeout=10)
            if resp.status_code == 200:
                steps = resp.json()
                return "user" not in steps
        except Exception:
            pass
        return True

    def complete_onboarding(
        self,
        name: str = "Test User",
        username: str = "test",
        password: str = "testpassword123",
        language: str = "en",
    ) -> str | None:
        """Complete HA onboarding and return access token."""
        resp = self.session.post(
            f"{self.base_url}/api/onboarding/users",
            json={
                "client_id": self.base_url,
                "name": name,
                "username": username,
                "password": password,
                "language": language,
            },
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Onboarding failed: {resp.status_code} - {resp.text}")
            return None

        data = resp.json()
        auth_code = data.get("auth_code")

        # Exchange auth_code for access token
        resp = self.session.post(
            f"{self.base_url}/auth/token",
            data={
                "grant_type": "authorization_code",
                "code": auth_code,
                "client_id": self.base_url,
            },
            timeout=10,
        )
        if resp.status_code != 200:
            print(f"Token exchange failed: {resp.status_code} - {resp.text}")
            return None

        token_data = resp.json()
        access_token = token_data.get("access_token")

        # Complete remaining onboarding steps
        for step in ["core_config", "analytics", "integration"]:
            self.session.post(
                f"{self.base_url}/api/onboarding/{step}",
                headers={"Authorization": f"Bearer {access_token}"},
                json={},
                timeout=10,
            )

        return access_token

    def create_long_lived_token(self, access_token: str, name: str = "Test Token") -> str | None:
        """Create a long-lived access token via WebSocket."""

        async def _create_token():
            ws_url = self.base_url.replace("http://", "ws://").replace("https://", "wss://")
            ws_url = ws_url + "/api/websocket"

            async with connect(ws_url) as ws:
                msg = json.loads(await ws.recv())
                assert msg["type"] == "auth_required"

                await ws.send(json.dumps({"type": "auth", "access_token": access_token}))

                msg = json.loads(await ws.recv())
                if msg["type"] != "auth_ok":
                    return None

                await ws.send(
                    json.dumps({
                        "id": 1,
                        "type": "auth/long_lived_access_token",
                        "client_name": name,
                        "lifespan": 365,
                    })
                )

                msg = json.loads(await ws.recv())
                if msg.get("success"):
                    return msg.get("result")
                return None

        return asyncio.run(_create_token())

    def set_component_debug_logging(self, access_token: str) -> None:
        """Raise the integration's log level so e2e failures show each device write."""
        try:
            self.session.post(
                f"{self.base_url}/api/services/logger/set_level",
                headers={"Authorization": f"Bearer {access_token}"},
                json={"custom_components.matter_binding_helper": "debug"},
                timeout=10,
            )
        except Exception:  # noqa: BLE001 - diagnostics only
            pass

    def install_matter_integration(self, access_token: str, matter_server_url: str) -> str | None:
        """Install Matter integration via REST API config flow."""
        headers = {"Authorization": f"Bearer {access_token}"}

        # Start config flow for Matter
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/flow",
            headers=headers,
            json={"handler": "matter"},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Start Matter flow failed: {resp.status_code} - {resp.text}")
            return None

        flow = resp.json()
        flow_id = flow.get("flow_id")
        print(f"[testcontainers] Matter config flow started: {flow_id}")

        # Submit the URL step with matter server URL
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/flow/{flow_id}",
            headers=headers,
            json={"url": matter_server_url},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Matter URL step failed: {resp.status_code} - {resp.text}")
            return None

        result = resp.json()
        if result.get("type") == "create_entry":
            entry_id = result.get("result", {}).get("entry_id")
            print(f"[testcontainers] Matter integration installed: {entry_id}")
            return entry_id

        print(f"Unexpected Matter flow result: {result}")
        return None

    def install_integration(self, access_token: str) -> str | None:
        """Install matter_binding_helper integration via REST API config flow."""
        headers = {"Authorization": f"Bearer {access_token}"}

        # Start config flow for matter_binding_helper
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/flow",
            headers=headers,
            json={"handler": "matter_binding_helper"},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Start flow failed: {resp.status_code} - {resp.text}")
            return None

        flow = resp.json()
        flow_id = flow.get("flow_id")
        print(f"[testcontainers] Config flow started: {flow_id}")

        # Submit user step (empty form, proceeds even if Matter warning shown)
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/flow/{flow_id}",
            headers=headers,
            json={},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"User step failed: {resp.status_code} - {resp.text}")
            return None

        result = resp.json()

        # Check if entry created (possible if skipped telemetry step)
        if result.get("type") == "create_entry":
            entry_id = result.get("result", {}).get("entry_id")
            print(f"[testcontainers] Entry created: {entry_id}")
            return entry_id

        # Continue with telemetry step if needed
        flow_id = result.get("flow_id", flow_id)
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/flow/{flow_id}",
            headers=headers,
            json={"telemetry_enabled": False},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Telemetry step failed: {resp.status_code} - {resp.text}")
            return None

        result = resp.json()
        if result.get("type") == "create_entry":
            entry_id = result.get("result", {}).get("entry_id")
            print(f"[testcontainers] Integration installed: {entry_id}")
            return entry_id

        print(f"Unexpected flow result: {result}")
        return None

    def commission_device(self, access_token: str, pairing_code: str) -> bool:
        """Commission a Matter device via WebSocket API."""

        async def _commission():
            ws_url = self.base_url.replace("http://", "ws://").replace("https://", "wss://")
            ws_url = ws_url + "/api/websocket"

            async with connect(ws_url) as ws:
                msg = json.loads(await ws.recv())
                assert msg["type"] == "auth_required"

                await ws.send(json.dumps({"type": "auth", "access_token": access_token}))

                msg = json.loads(await ws.recv())
                if msg["type"] != "auth_ok":
                    print(f"Auth failed: {msg}")
                    return False

                # Commission device using Matter integration
                await ws.send(json.dumps({
                    "id": 1,
                    "type": "matter/commission",
                    "code": pairing_code,
                }))

                # Wait for commissioning result (can take a while)
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=120))
                if msg.get("success"):
                    print(f"[testcontainers] Device commissioned successfully!")
                    return True
                else:
                    print(f"Commissioning failed: {msg}")
                    return False

        return asyncio.run(_commission())

    def enable_demo_mode(self, access_token: str, entry_id: str) -> bool:
        """Enable demo mode for the integration via REST API options flow."""
        headers = {"Authorization": f"Bearer {access_token}"}

        # Start options flow
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/options/flow",
            headers=headers,
            json={"handler": entry_id},
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Start options flow failed: {resp.status_code} - {resp.text}")
            return False

        flow = resp.json()
        flow_id = flow.get("flow_id")

        # Submit options with demo mode enabled
        resp = self.session.post(
            f"{self.base_url}/api/config/config_entries/options/flow/{flow_id}",
            headers=headers,
            json={
                "telemetry_enabled": False,
                "demo_mode": True,
            },
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"Options submit failed: {resp.status_code} - {resp.text}")
            return False

        print("[testcontainers] Demo mode enabled!")
        return True


@pytest.fixture(scope="session")
def project_root() -> Path:
    """Get project root directory."""
    return Path(__file__).parent.parent


@pytest.fixture(scope="session")
def docker_network():
    """Create a Docker network for test containers to communicate."""
    import docker
    client = docker.from_env()

    network_name = "matter-test-network"

    # Remove existing network if present
    try:
        existing = client.networks.get(network_name)
        existing.remove()
    except docker.errors.NotFound:
        pass

    network = client.networks.create(network_name, driver="bridge")
    print(f"\n[testcontainers] Created Docker network: {network_name}")

    yield network

    print(f"\n[testcontainers] Removing Docker network: {network_name}")
    try:
        network.remove()
    except Exception:
        pass


# Matter server backends under test. HA is migrating from the Python server to
# the matter.js server (HA 2026.2+); the latter is a drop-in replacement on the
# same WebSocket API, port 5580 and /ws path — so only the image differs.
#
# The image *tags* are not duplicated here: they live in docker-compose.yml
# (single source of truth, bumped by Dependabot's docker ecosystem) and we read
# them out of it by service name. Both backends run by default; restrict locally
# with e.g. MATTER_BACKENDS=python.
MATTER_BACKEND_SERVICES = {
    "python": "matter-server",
    "matterjs": "matter-server-js",
}

_COMPOSE_FILE = Path(__file__).resolve().parent.parent / "docker-compose.yml"


def matter_backend_image(backend: str) -> str:
    """Resolve a backend key to its pinned image via docker-compose.yml."""
    import yaml

    service = MATTER_BACKEND_SERVICES[backend]
    compose = yaml.safe_load(_COMPOSE_FILE.read_text())
    try:
        return compose["services"][service]["image"]
    except KeyError as exc:
        raise RuntimeError(
            f"docker-compose.yml has no image for service {service!r}"
        ) from exc


def _selected_matter_backends() -> list[str]:
    sel = os.environ.get("MATTER_BACKENDS")
    if not sel:
        return list(MATTER_BACKEND_SERVICES)
    chosen = [b.strip() for b in sel.split(",") if b.strip()]
    unknown = [b for b in chosen if b not in MATTER_BACKEND_SERVICES]
    if unknown:
        raise ValueError(
            f"Unknown MATTER_BACKENDS {unknown}; valid: {list(MATTER_BACKEND_SERVICES)}"
        )
    return chosen


@pytest.fixture(scope="session", params=_selected_matter_backends())
def matter_backend(request) -> str:
    """The Matter server backend key under test (parametrizes the whole stack)."""
    return request.param


@pytest.fixture(scope="session")
def matter_server_container(
    matter_backend, docker_network
) -> Generator[DockerContainer, None, None]:
    """Start the selected Matter server container (python or matter.js)."""
    container = (
        DockerContainer(matter_backend_image(matter_backend))
        .with_name("matter-server-test")
        .with_exposed_ports(5580)
        .with_env("TZ", "UTC")
    )

    print(f"\n[testcontainers] Starting Matter Server container ({matter_backend})...")
    container.start()

    # Connect to our network
    docker_network.connect(container.get_wrapped_container())
    print("[testcontainers] Connected Matter Server to test network")

    # Wait for matter-server to be ready
    host = container.get_container_host_ip()
    port = container.get_exposed_port(5580)

    print(f"[testcontainers] Waiting for Matter Server at ws://{host}:{port}/ws...")
    start = time.time()
    while time.time() - start < 90:
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex((host, int(port)))
            sock.close()
            if result == 0:
                print("[testcontainers] Matter Server is ready!")
                break
        except Exception:
            pass
        time.sleep(2)
    else:
        pytest.fail("Matter Server did not become ready in time")

    yield container

    print("\n[testcontainers] Stopping Matter Server container...")
    container.stop()


@pytest.fixture(scope="session")
def dimmable_light_container(project_root: Path, docker_network) -> Generator[DockerContainer, None, None]:
    """Start dimmable light Matter device container."""
    import docker
    client = docker.from_env()

    # Build the image
    image_tag = "matter-dimmable-light-test:latest"
    dockerfile_path = project_root / "devices" / "rust-device"

    print(f"\n[testcontainers] Building dimmable light image from {dockerfile_path}...")
    try:
        image, logs = client.images.build(
            path=str(dockerfile_path),
            tag=image_tag,
            buildargs={"BINARY": "dimmable_light"},
            rm=True,
        )
        for log in logs:
            if "stream" in log:
                print(log["stream"].strip())
    except Exception as e:
        pytest.fail(f"Failed to build dimmable light image: {e}")

    container = (
        DockerContainer(image_tag)
        .with_name("matter-dimmable-light-test")
        .with_env("MATTER_DISCRIMINATOR", "3840")
        .with_env("MATTER_PASSCODE", "20202021")
        .with_env("MATTER_PORT", "5540")
        .with_env("MATTER_DEVICE_NAME", "Test Dimmable Light")
        .with_env("RUST_LOG", "info")
    )

    print("[testcontainers] Starting dimmable light container...")
    container.start()

    # Connect to our network
    docker_network.connect(container.get_wrapped_container())
    print("[testcontainers] Connected dimmable light to test network")

    # Give the device time to start
    time.sleep(5)
    print("[testcontainers] Dimmable light is ready!")

    yield container

    print("\n[testcontainers] Stopping dimmable light container...")
    container.stop()


@pytest.fixture(scope="session")
def on_off_switch_container(project_root: Path, docker_network) -> Generator[DockerContainer, None, None]:
    """Start on/off switch Matter device container."""
    import docker
    client = docker.from_env()

    # Build the image
    image_tag = "matter-on-off-switch-test:latest"
    dockerfile_path = project_root / "devices" / "rust-device"

    print(f"\n[testcontainers] Building on/off switch image from {dockerfile_path}...")
    try:
        image, logs = client.images.build(
            path=str(dockerfile_path),
            tag=image_tag,
            buildargs={"BINARY": "on_off_switch"},
            rm=True,
        )
        for log in logs:
            if "stream" in log:
                print(log["stream"].strip())
    except Exception as e:
        pytest.fail(f"Failed to build on/off switch image: {e}")

    container = (
        DockerContainer(image_tag)
        .with_name("matter-on-off-switch-test")
        .with_env("MATTER_DISCRIMINATOR", "3841")
        .with_env("MATTER_PASSCODE", "20202022")
        .with_env("MATTER_PORT", "5541")
        .with_env("MATTER_DEVICE_NAME", "Test On/Off Switch")
        .with_env("RUST_LOG", "info")
    )

    print("[testcontainers] Starting on/off switch container...")
    container.start()

    # Connect to our network
    docker_network.connect(container.get_wrapped_container())
    print("[testcontainers] Connected on/off switch to test network")

    # Give the device time to start
    time.sleep(5)
    print("[testcontainers] On/off switch is ready!")

    yield container

    print("\n[testcontainers] Stopping on/off switch container...")
    container.stop()


@pytest.fixture(scope="session")
def matter_server_url() -> str:
    """Get Matter Server WebSocket URL for HA to connect."""
    # Use container name on the shared network
    return "ws://matter-server-test:5580/ws"


@pytest.fixture(scope="session")
def ha_container(
    project_root: Path,
    docker_network,
    matter_server_container,
    dimmable_light_container,
    on_off_switch_container,
) -> Generator[DockerContainer, None, None]:
    """Start Home Assistant container with custom component mounted."""
    custom_component_path = project_root / "custom_components" / "matter_binding_helper"

    container = (
        DockerContainer("ghcr.io/home-assistant/home-assistant:stable")
        .with_name("ha-test")
        .with_exposed_ports(8123)
        .with_volume_mapping(
            str(custom_component_path),
            "/config/custom_components/matter_binding_helper",
            "ro",
        )
        .with_env("TZ", "UTC")
    )

    print("\n[testcontainers] Starting Home Assistant container...")
    container.start()

    # Connect to our network
    docker_network.connect(container.get_wrapped_container())
    print("[testcontainers] Connected Home Assistant to test network")

    # Wait for HA to be ready via HTTP
    host = container.get_container_host_ip()
    port = container.get_exposed_port(8123)
    url = f"http://{host}:{port}/api/"

    print(f"[testcontainers] Waiting for HA at {url}...")
    start = time.time()
    while time.time() - start < 120:
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code in (200, 401):
                print("[testcontainers] HA is ready!")
                break
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
    else:
        pytest.fail("Home Assistant did not become ready in time")

    yield container

    print("\n[testcontainers] Stopping Home Assistant container...")
    container.stop()


@pytest.fixture(scope="session")
def ha_url(ha_container: DockerContainer) -> str:
    """Get Home Assistant URL."""
    host = ha_container.get_container_host_ip()
    port = ha_container.get_exposed_port(8123)
    return f"http://{host}:{port}"


@pytest.fixture(scope="session")
def ha_config(ha_url: str, matter_server_url: str) -> dict[str, str]:
    """Bootstrap HA and return config with access token."""
    bootstrapper = HABootstrapper(ha_url)

    print(f"[testcontainers] Waiting for HA at {ha_url}...")
    if not bootstrapper.wait_for_ha(timeout=120):
        pytest.fail("Home Assistant did not start in time")

    access_token = None
    if bootstrapper.needs_onboarding():
        print("[testcontainers] Completing HA onboarding...")
        access_token = bootstrapper.complete_onboarding()
        if not access_token:
            pytest.fail("Failed to complete HA onboarding")
    else:
        pytest.fail("HA should need onboarding in fresh container")

    print("[testcontainers] Creating long-lived token...")
    long_lived_token = bootstrapper.create_long_lived_token(access_token)
    if not long_lived_token:
        pytest.fail("Failed to create long-lived access token")

    # Install Matter integration first (required for our integration)
    print(f"[testcontainers] Installing Matter integration with server at {matter_server_url}...")
    matter_entry_id = bootstrapper.install_matter_integration(access_token, matter_server_url)
    if not matter_entry_id:
        pytest.fail("Failed to install Matter integration")

    # Wait for Matter integration to initialize
    time.sleep(3)

    # Install the matter_binding_helper integration
    print("[testcontainers] Installing Matter Binding Helper integration...")
    entry_id = bootstrapper.install_integration(access_token)
    if not entry_id:
        pytest.fail("Failed to install Matter Binding Helper integration")

    # Enable demo mode (commissioning doesn't work in Docker due to mDNS)
    print("[testcontainers] Enabling demo mode...")
    if not bootstrapper.enable_demo_mode(access_token, entry_id):
        pytest.fail("Failed to enable demo mode")

    # Wait a moment for HA to reload the integration
    time.sleep(2)

    print("[testcontainers] HA bootstrap complete!")
    return {
        "host": ha_url,
        "token": long_lived_token,
    }


@pytest_asyncio.fixture
async def ws_client(ha_config: dict[str, str]) -> HAWebSocketClient:
    """Create an authenticated WebSocket client."""
    ws_url = ha_config["host"].replace("http://", "ws://").replace("https://", "wss://")
    ws_url = ws_url.rstrip("/") + "/api/websocket"

    async with connect(ws_url) as ws:
        msg = json.loads(await ws.recv())
        assert msg["type"] == "auth_required", f"Expected auth_required, got {msg['type']}"

        await ws.send(json.dumps({"type": "auth", "access_token": ha_config["token"]}))

        msg = json.loads(await ws.recv())
        if msg["type"] == "auth_invalid":
            pytest.fail(f"Authentication failed: {msg.get('message', 'Invalid token')}")
        assert msg["type"] == "auth_ok", f"Expected auth_ok, got {msg['type']}"

        yield HAWebSocketClient(ws)


# =============================================================================
# Test constants
# =============================================================================

# Virtual device node IDs (assigned during commissioning)
DIMMABLE_LIGHT_NODE_ID = 1
ON_OFF_SWITCH_NODE_ID = 4

# Matter cluster IDs
CLUSTER_DESCRIPTOR = 29  # 0x001D
CLUSTER_BINDING = 30  # 0x001E
CLUSTER_ON_OFF = 6  # 0x0006
CLUSTER_LEVEL_CONTROL = 8  # 0x0008
CLUSTER_ACL = 31  # 0x001F

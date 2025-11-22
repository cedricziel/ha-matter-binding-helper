"""Telemetry module for Matter Survey data collection."""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CONF_TELEMETRY_ENABLED,
    DEFAULT_TELEMETRY_ENABLED,
    DOMAIN,
    TELEMETRY_INITIAL_DELAY_MINUTES,
    TELEMETRY_URL,
)
from .matter_client import get_nodes

_LOGGER = logging.getLogger(__name__)

# Storage key for installation UUID
STORAGE_KEY = f"{DOMAIN}_telemetry"
STORAGE_VERSION = 1


def _anonymize_node(node: dict[str, Any]) -> dict[str, Any] | None:
    """Anonymize a single node, removing all personally identifiable information.

    Returns None if the node doesn't have useful capability data.

    What we collect (public device info):
    - vendor_id, vendor_name (manufacturer identification)
    - product_id, product_name (product identification)
    - hardware_version, software_version (version info)
    - endpoint structure with device_types, clusters, binding capability

    What we explicitly DO NOT collect:
    - node_id (fabric-specific identifier)
    - name (user-assigned device name)
    - node_label (user-assigned label)
    - area_name (user room/area configuration)
    - ha_device_id (Home Assistant installation identifier)
    - available status (runtime state)
    """
    device_info = node.get("device_info", {})

    # Skip if no useful product identification
    if not device_info.get("vendor_id") and not device_info.get("product_id"):
        return None

    # Anonymize endpoints - only keep capability data
    anonymized_endpoints = []
    for endpoint in node.get("endpoints", []):
        anonymized_endpoints.append({
            "endpoint_id": endpoint.get("endpoint_id"),
            "device_types": endpoint.get("device_types", []),
            "clusters": endpoint.get("clusters", []),
            "has_binding_cluster": endpoint.get("has_binding_cluster", False),
        })

    # Skip devices with no endpoints
    if not anonymized_endpoints:
        return None

    return {
        "vendor_id": device_info.get("vendor_id"),
        "vendor_name": device_info.get("vendor_name"),
        "product_id": device_info.get("product_id"),
        "product_name": device_info.get("product_name"),
        "hardware_version": device_info.get("hardware_version"),
        "software_version": device_info.get("software_version"),
        "endpoints": anonymized_endpoints,
    }


async def _get_or_create_installation_id(hass: HomeAssistant) -> str:
    """Get or create a random installation UUID for deduplication.

    This UUID is used only for deduplication on the server side to avoid
    counting the same installation multiple times. It is not linked to
    any personally identifiable information and cannot be used to track users.
    """
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)

    try:
        data = await store.async_load()
        if data and "installation_id" in data:
            return data["installation_id"]
    except Exception:
        pass

    # Generate new random UUID
    installation_id = str(uuid.uuid4())
    await store.async_save({"installation_id": installation_id})
    return installation_id


async def collect_survey_data(hass: HomeAssistant) -> dict[str, Any]:
    """Collect anonymized device data for the Matter Survey.

    Returns a dictionary containing:
    - installation_id: Random UUID for deduplication only
    - devices: List of anonymized device capability data
    """
    installation_id = await _get_or_create_installation_id(hass)
    nodes = await get_nodes(hass)

    anonymized_devices = []
    for node in nodes:
        anonymized = _anonymize_node(node)
        if anonymized:
            anonymized_devices.append(anonymized)

    return {
        "installation_id": installation_id,
        "schema_version": 1,
        "devices": anonymized_devices,
    }


async def send_telemetry(hass: HomeAssistant) -> bool:
    """Send anonymized telemetry data to the Matter Survey service.

    Returns True if successful, False otherwise.
    """
    try:
        data = await collect_survey_data(hass)

        if not data["devices"]:
            _LOGGER.debug("No devices to report, skipping telemetry")
            return True

        _LOGGER.info(
            "Sending anonymized telemetry for %d devices to Matter Survey",
            len(data["devices"]),
        )

        async with aiohttp.ClientSession() as session:
            async with session.post(
                TELEMETRY_URL,
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    _LOGGER.info("Telemetry sent successfully")
                    return True
                else:
                    _LOGGER.warning(
                        "Telemetry submission failed with status %d: %s",
                        response.status,
                        await response.text(),
                    )
                    return False

    except asyncio.TimeoutError:
        _LOGGER.warning("Telemetry submission timed out")
        return False
    except aiohttp.ClientError as err:
        _LOGGER.warning("Telemetry submission failed: %s", err)
        return False
    except Exception as err:
        _LOGGER.error("Unexpected error sending telemetry: %s", err)
        return False


def is_telemetry_enabled(hass: HomeAssistant) -> bool:
    """Check if telemetry is enabled in the config entry options."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        return entry.options.get(CONF_TELEMETRY_ENABLED, DEFAULT_TELEMETRY_ENABLED)
    return DEFAULT_TELEMETRY_ENABLED


async def schedule_initial_telemetry(hass: HomeAssistant) -> None:
    """Schedule initial telemetry submission after a delay.

    Waits for TELEMETRY_INITIAL_DELAY_MINUTES before sending to allow
    Home Assistant to fully initialize and discover all Matter devices.
    """
    if not is_telemetry_enabled(hass):
        _LOGGER.debug("Telemetry disabled, skipping initial submission")
        return

    _LOGGER.info(
        "Scheduling initial telemetry submission in %d minutes",
        TELEMETRY_INITIAL_DELAY_MINUTES,
    )

    await asyncio.sleep(TELEMETRY_INITIAL_DELAY_MINUTES * 60)

    # Check again in case user disabled it during the delay
    if is_telemetry_enabled(hass):
        await send_telemetry(hass)

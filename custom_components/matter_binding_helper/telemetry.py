"""Telemetry module for Matter Survey data collection."""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

import aiohttp
from homeassistant.core import HomeAssistant

from .const import (
    CONF_TELEMETRY_ENABLED,
    DEFAULT_TELEMETRY_ENABLED,
    DOMAIN,
    TELEMETRY_INITIAL_DELAY_MINUTES,
    TELEMETRY_URL,
)
from .matter_client import get_nodes

_LOGGER = logging.getLogger(__name__)

# Config entry option key for installation UUID
CONF_INSTALLATION_ID = "installation_id"


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


def _get_or_create_installation_id(hass: HomeAssistant) -> str:
    """Get or create a random installation UUID for deduplication.

    This UUID is used only for deduplication on the server side to avoid
    counting the same installation multiple times. It is not linked to
    any personally identifiable information and cannot be used to track users.

    Uses config entry options for storage, which is more reliable than
    the Store helper class in various HA contexts.
    """
    entries = hass.config_entries.async_entries(DOMAIN)
    _LOGGER.debug("Looking for installation_id in %d config entries", len(entries))

    for entry in entries:
        # Check if we already have an installation ID
        if CONF_INSTALLATION_ID in entry.options:
            existing_id = entry.options[CONF_INSTALLATION_ID]
            _LOGGER.debug("Found existing installation_id: %s", existing_id)
            return existing_id

        # Generate new random UUID and persist it in config entry options
        installation_id = str(uuid.uuid4())
        new_options = {**entry.options, CONF_INSTALLATION_ID: installation_id}
        hass.config_entries.async_update_entry(entry, options=new_options)
        _LOGGER.info("Generated new installation_id: %s", installation_id)
        return installation_id

    # Fallback if no config entry exists (shouldn't happen in normal operation)
    _LOGGER.warning("No config entry found for %s, generating ephemeral installation_id", DOMAIN)
    ephemeral_id = str(uuid.uuid4())
    _LOGGER.warning("Using ephemeral installation_id: %s (data won't be deduplicated)", ephemeral_id)
    return ephemeral_id


async def collect_survey_data(hass: HomeAssistant) -> dict[str, Any]:
    """Collect anonymized device data for the Matter Survey.

    Returns a dictionary containing:
    - installation_id: Random UUID for deduplication only
    - devices: List of anonymized device capability data
    """
    _LOGGER.debug("Collecting survey data...")

    installation_id = _get_or_create_installation_id(hass)

    _LOGGER.debug("Fetching Matter nodes...")
    nodes = await get_nodes(hass)
    _LOGGER.debug("Retrieved %d nodes from Matter client", len(nodes))

    anonymized_devices = []
    skipped_count = 0
    for node in nodes:
        anonymized = _anonymize_node(node)
        if anonymized:
            anonymized_devices.append(anonymized)
        else:
            skipped_count += 1

    if skipped_count > 0:
        _LOGGER.debug("Skipped %d nodes (no useful product data)", skipped_count)

    _LOGGER.debug(
        "Survey data ready: installation_id=%s, devices=%d",
        installation_id,
        len(anonymized_devices),
    )

    return {
        "installation_id": installation_id,
        "schema_version": 1,
        "devices": anonymized_devices,
    }


async def send_telemetry(hass: HomeAssistant) -> bool:
    """Send anonymized telemetry data to the Matter Survey service.

    Returns True if successful, False otherwise.
    """
    _LOGGER.debug("send_telemetry() called")

    # Check if telemetry is enabled
    if not is_telemetry_enabled(hass):
        _LOGGER.info("Telemetry is disabled in settings, skipping submission")
        return False

    try:
        _LOGGER.debug("Collecting survey data...")
        data = await collect_survey_data(hass)

        _LOGGER.debug(
            "Collected data: installation_id=%s, device_count=%d",
            data.get("installation_id", "MISSING"),
            len(data.get("devices", [])),
        )

        if not data["devices"]:
            _LOGGER.info("No Matter devices found to report, skipping telemetry")
            return True

        _LOGGER.info(
            "Sending anonymized telemetry for %d devices to %s",
            len(data["devices"]),
            TELEMETRY_URL,
        )

        async with aiohttp.ClientSession() as session:
            async with session.post(
                TELEMETRY_URL,
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                response_text = await response.text()
                _LOGGER.debug(
                    "Server response: status=%d, body=%s",
                    response.status,
                    response_text,
                )

                if response.status == 200:
                    _LOGGER.info(
                        "Telemetry sent successfully: %d devices reported",
                        len(data["devices"]),
                    )
                    return True
                else:
                    _LOGGER.warning(
                        "Telemetry submission failed with status %d: %s",
                        response.status,
                        response_text,
                    )
                    return False

    except asyncio.TimeoutError:
        _LOGGER.warning("Telemetry submission timed out after 30 seconds")
        return False
    except aiohttp.ClientError as err:
        _LOGGER.warning("Telemetry submission failed (network error): %s", err)
        return False
    except Exception as err:
        _LOGGER.error("Unexpected error sending telemetry (%s): %s", type(err).__name__, err, exc_info=True)
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
        _LOGGER.info("Telemetry disabled in settings, skipping initial submission")
        return

    _LOGGER.info(
        "Scheduling initial Matter Survey submission in %d minutes",
        TELEMETRY_INITIAL_DELAY_MINUTES,
    )

    await asyncio.sleep(TELEMETRY_INITIAL_DELAY_MINUTES * 60)

    # Check again in case user disabled it during the delay
    if is_telemetry_enabled(hass):
        _LOGGER.info("Starting scheduled initial telemetry submission")
        result = await send_telemetry(hass)
        _LOGGER.info("Initial telemetry submission %s", "succeeded" if result else "failed")
    else:
        _LOGGER.info("Telemetry was disabled during delay period, skipping submission")

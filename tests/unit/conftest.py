"""Unit test configuration and fixtures.

Mocks homeassistant modules to allow testing matter/ subpackage in isolation.
"""

import sys
from unittest.mock import MagicMock

# Create mock module for homeassistant with all submodules
# We need to add these BEFORE any imports happen


def _create_mock_module(name):
    """Create a mock module."""
    mock = MagicMock()
    mock.__name__ = name
    mock.__file__ = f"/mock/{name.replace('.', '/')}.py"
    mock.__loader__ = MagicMock()
    mock.__spec__ = MagicMock()
    return mock


# Build the module hierarchy
homeassistant = _create_mock_module("homeassistant")
homeassistant_core = _create_mock_module("homeassistant.core")
homeassistant_const = _create_mock_module("homeassistant.const")
homeassistant_config_entries = _create_mock_module("homeassistant.config_entries")
homeassistant_helpers = _create_mock_module("homeassistant.helpers")
homeassistant_helpers_event = _create_mock_module("homeassistant.helpers.event")
homeassistant_helpers_device_registry = _create_mock_module(
    "homeassistant.helpers.device_registry"
)
homeassistant_helpers_entity_registry = _create_mock_module(
    "homeassistant.helpers.entity_registry"
)
homeassistant_helpers_area_registry = _create_mock_module(
    "homeassistant.helpers.area_registry"
)
homeassistant_components = _create_mock_module("homeassistant.components")
homeassistant_components_frontend = _create_mock_module(
    "homeassistant.components.frontend"
)
homeassistant_components_panel_custom = _create_mock_module(
    "homeassistant.components.panel_custom"
)
homeassistant_components_matter = _create_mock_module("homeassistant.components.matter")
homeassistant_components_http = _create_mock_module("homeassistant.components.http")

# Create mock classes


class MockHomeAssistant:
    """Mock Home Assistant instance for testing."""

    def __init__(self):
        self.config_entries = MagicMock()
        self.data = {}
        self.config = MagicMock()
        self.http = MagicMock()
        self.services = MagicMock()

    def async_create_task(self, coro):
        pass


class MockConfigEntry:
    """Mock ConfigEntry for testing."""

    def __init__(self, **kwargs):
        self.entry_id = kwargs.get("entry_id", "test_entry")
        self.options = kwargs.get("options", {})
        self.data = kwargs.get("data", {})

    def async_on_unload(self, func):
        pass

    def add_update_listener(self, func):
        return MagicMock()


class MockPlatform:
    """Mock Platform enum."""

    SENSOR = "sensor"


# Set up mock attributes
homeassistant_core.HomeAssistant = MockHomeAssistant
homeassistant_core.ServiceCall = MagicMock
homeassistant_core.ServiceResponse = dict
homeassistant_core.SupportsResponse = MagicMock()
homeassistant_core.SupportsResponse.OPTIONAL = "optional"
homeassistant_config_entries.ConfigEntry = MockConfigEntry
homeassistant_const.Platform = MockPlatform
homeassistant_components_matter.DOMAIN = "matter"
homeassistant_components_http.StaticPathConfig = MagicMock

# Link submodules to parent
homeassistant.core = homeassistant_core
homeassistant.const = homeassistant_const
homeassistant.config_entries = homeassistant_config_entries
homeassistant.helpers = homeassistant_helpers
homeassistant.helpers.event = homeassistant_helpers_event
homeassistant.helpers.device_registry = homeassistant_helpers_device_registry
homeassistant.helpers.entity_registry = homeassistant_helpers_entity_registry
homeassistant.helpers.area_registry = homeassistant_helpers_area_registry
homeassistant.components = homeassistant_components
homeassistant.components.frontend = homeassistant_components_frontend
homeassistant.components.panel_custom = homeassistant_components_panel_custom
homeassistant.components.matter = homeassistant_components_matter
homeassistant.components.http = homeassistant_components_http

# Install all mocks into sys.modules
sys.modules["homeassistant"] = homeassistant
sys.modules["homeassistant.core"] = homeassistant_core
sys.modules["homeassistant.const"] = homeassistant_const
sys.modules["homeassistant.config_entries"] = homeassistant_config_entries
sys.modules["homeassistant.helpers"] = homeassistant_helpers
sys.modules["homeassistant.helpers.event"] = homeassistant_helpers_event
sys.modules["homeassistant.helpers.device_registry"] = (
    homeassistant_helpers_device_registry
)
sys.modules["homeassistant.helpers.entity_registry"] = (
    homeassistant_helpers_entity_registry
)
sys.modules["homeassistant.helpers.area_registry"] = homeassistant_helpers_area_registry
sys.modules["homeassistant.components"] = homeassistant_components
sys.modules["homeassistant.components.frontend"] = homeassistant_components_frontend
sys.modules["homeassistant.components.panel_custom"] = (
    homeassistant_components_panel_custom
)
sys.modules["homeassistant.components.matter"] = homeassistant_components_matter
sys.modules["homeassistant.components.http"] = homeassistant_components_http

# Mock matter_server
matter_server = _create_mock_module("matter_server")
matter_server_client = _create_mock_module("matter_server.client")
matter_server_common = _create_mock_module("matter_server.common")
matter_server_common_models = _create_mock_module("matter_server.common.models")
matter_server.client = matter_server_client
matter_server.common = matter_server_common
matter_server.common.models = matter_server_common_models
matter_server_client.MatterClient = MagicMock

sys.modules["matter_server"] = matter_server
sys.modules["matter_server.client"] = matter_server_client
sys.modules["matter_server.common"] = matter_server_common
sys.modules["matter_server.common.models"] = matter_server_common_models

# Mock additional homeassistant modules needed for automation_generator
homeassistant_components_websocket_api = _create_mock_module(
    "homeassistant.components.websocket_api"
)
homeassistant_components_automation = _create_mock_module(
    "homeassistant.components.automation"
)
homeassistant_components_automation_config = _create_mock_module(
    "homeassistant.components.automation.config"
)
homeassistant_helpers_aiohttp_client = _create_mock_module(
    "homeassistant.helpers.aiohttp_client"
)
homeassistant_loader = _create_mock_module("homeassistant.loader")

# Set up websocket_api decorators
homeassistant_components_websocket_api.websocket_command = lambda x: lambda f: f
homeassistant_components_websocket_api.async_response = lambda f: f
homeassistant_components_websocket_api.async_register_command = MagicMock()

# Set up automation config store
mock_config_store = MagicMock()
homeassistant_components_automation_config.async_get_config_store = MagicMock(
    return_value=mock_config_store
)

homeassistant.components.websocket_api = homeassistant_components_websocket_api
homeassistant.components.automation = homeassistant_components_automation
homeassistant.components.automation.config = homeassistant_components_automation_config
homeassistant.helpers.aiohttp_client = homeassistant_helpers_aiohttp_client
homeassistant.loader = homeassistant_loader

sys.modules["homeassistant.components.websocket_api"] = (
    homeassistant_components_websocket_api
)
sys.modules["homeassistant.components.automation"] = homeassistant_components_automation
sys.modules["homeassistant.components.automation.config"] = (
    homeassistant_components_automation_config
)
sys.modules["homeassistant.helpers.aiohttp_client"] = (
    homeassistant_helpers_aiohttp_client
)
sys.modules["homeassistant.loader"] = homeassistant_loader

# Mock voluptuous (used by api.py)
voluptuous = _create_mock_module("voluptuous")
voluptuous.Required = lambda x: x
voluptuous.Optional = lambda x, default=None: x
voluptuous.Coerce = lambda x: x
sys.modules["voluptuous"] = voluptuous

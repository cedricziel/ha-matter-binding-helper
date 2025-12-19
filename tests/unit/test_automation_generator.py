"""Tests for automation_generator module.

Unit tests for automation config generation and entity resolution.
"""

import pytest
from unittest.mock import MagicMock, patch

# Import from the module under test (conftest.py handles HA mocking)
from custom_components.matter_binding_helper.automation_generator import (
    AutomationErrorType,
    AutomationResult,
    EntityInfo,
    TEMPLATE_CONFIGS,
    DEVICE_TYPE_DOMAIN_MAP,
    resolve_entities_for_device,
    get_preferred_domains_for_template,
    generate_automation_config,
    preview_automation,
)


class TestEntityInfo:
    """Test EntityInfo dataclass."""

    def test_create_entity_info(self):
        """Test creating an EntityInfo object."""
        entity = EntityInfo(
            entity_id="light.living_room",
            name="Living Room Light",
            domain="light",
            disabled=False,
        )
        assert entity.entity_id == "light.living_room"
        assert entity.name == "Living Room Light"
        assert entity.domain == "light"
        assert entity.disabled is False

    def test_entity_info_default_disabled(self):
        """Test EntityInfo has disabled=False by default."""
        entity = EntityInfo(
            entity_id="switch.plug",
            name="Smart Plug",
            domain="switch",
        )
        assert entity.disabled is False


class TestDeviceTypeDomainMap:
    """Test device type to domain mapping."""

    def test_light_device_types_map_to_light(self):
        """Test that light device types map to light domain."""
        light_types = [256, 257, 258, 268, 269]
        for dt in light_types:
            assert "light" in DEVICE_TYPE_DOMAIN_MAP.get(dt, []), (
                f"Device type {dt} should map to light"
            )

    def test_sensor_device_types_map_to_binary_sensor(self):
        """Test that sensor device types map to binary_sensor."""
        sensor_types = [21, 263]  # Contact Sensor, Occupancy Sensor
        for dt in sensor_types:
            assert "binary_sensor" in DEVICE_TYPE_DOMAIN_MAP.get(dt, []), (
                f"Device type {dt} should map to binary_sensor"
            )

    def test_thermostat_maps_to_climate(self):
        """Test that thermostat maps to climate domain."""
        assert "climate" in DEVICE_TYPE_DOMAIN_MAP.get(769, [])

    def test_generic_switch_maps_to_event(self):
        """Test that Generic Switch maps to event domain."""
        assert "event" in DEVICE_TYPE_DOMAIN_MAP.get(15, [])

    def test_plug_maps_to_switch(self):
        """Test that On/Off Plug-in Unit maps to switch domain."""
        assert "switch" in DEVICE_TYPE_DOMAIN_MAP.get(266, [])


class TestTemplateConfigs:
    """Test template configurations."""

    def test_all_templates_have_required_fields(self):
        """Test that all templates have required configuration fields."""
        required_fields = [
            "trigger_domain",
            "action_domain",
            "action_service",
            "description",
        ]
        for template_id, config in TEMPLATE_CONFIGS.items():
            for field in required_fields:
                assert field in config, f"Template {template_id} missing {field}"

    def test_light_occupancy_template_config(self):
        """Test light-occupancy template configuration."""
        config = TEMPLATE_CONFIGS.get("light-occupancy")
        assert config is not None
        assert config["trigger_domain"] == "binary_sensor"
        assert config["action_domain"] == "light"
        assert config["action_service"] == "turn_on"

    def test_thermostat_contact_template_config(self):
        """Test thermostat-contact-window template configuration."""
        config = TEMPLATE_CONFIGS.get("thermostat-contact-window")
        assert config is not None
        assert config["trigger_domain"] == "binary_sensor"
        assert config["action_domain"] == "climate"
        assert config["action_service"] == "set_hvac_mode"

    def test_button_templates_use_event_trigger(self):
        """Test that button templates use event trigger domain."""
        button_templates = [
            "button-light-toggle",
            "button-plug-toggle",
            "button-scene",
            "button-thermostat-adjust",
        ]
        for template_id in button_templates:
            config = TEMPLATE_CONFIGS.get(template_id)
            assert config is not None, f"Template {template_id} not found"
            assert config["trigger_domain"] == "event", (
                f"Template {template_id} should use event trigger"
            )

    def test_nine_templates_exist(self):
        """Test that we have 9 automation templates."""
        assert len(TEMPLATE_CONFIGS) == 9


class TestGetPreferredDomainsForTemplate:
    """Test get_preferred_domains_for_template function."""

    def test_trigger_domain_for_light_occupancy(self):
        """Test trigger domain for light-occupancy template."""
        domains = get_preferred_domains_for_template("light-occupancy", "trigger")
        assert domains == ["binary_sensor"]

    def test_action_domain_for_light_occupancy(self):
        """Test action domain for light-occupancy template includes switch fallback."""
        domains = get_preferred_domains_for_template("light-occupancy", "action")
        assert "light" in domains
        assert "switch" in domains

    def test_trigger_domain_for_button_light(self):
        """Test trigger domain for button-light-toggle template."""
        domains = get_preferred_domains_for_template("button-light-toggle", "trigger")
        assert domains == ["event"]

    def test_unknown_template_returns_none(self):
        """Test that unknown template returns None."""
        domains = get_preferred_domains_for_template("unknown-template", "trigger")
        assert domains is None

    def test_unknown_role_returns_none(self):
        """Test that unknown role returns None."""
        domains = get_preferred_domains_for_template("light-occupancy", "unknown")
        assert domains is None


class TestGenerateAutomationConfig:
    """Test automation config generation."""

    def test_generates_valid_config_structure(self):
        """Test that generated config has valid structure."""
        trigger = EntityInfo("binary_sensor.motion", "Motion Sensor", "binary_sensor")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config = generate_automation_config("light-occupancy", trigger, action)

        assert config is not None
        assert "id" in config
        assert "alias" in config
        assert "triggers" in config
        assert "actions" in config
        assert "mode" in config
        assert config["initial_state"] is False  # Disabled by default

    def test_generates_unique_id(self):
        """Test that each config gets a unique ID."""
        trigger = EntityInfo("binary_sensor.motion", "Motion Sensor", "binary_sensor")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config1 = generate_automation_config("light-occupancy", trigger, action)
        config2 = generate_automation_config("light-occupancy", trigger, action)

        assert config1["id"] != config2["id"]

    def test_custom_alias_used_when_provided(self):
        """Test that custom alias is used when provided."""
        trigger = EntityInfo("binary_sensor.motion", "Motion Sensor", "binary_sensor")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config = generate_automation_config(
            "light-occupancy", trigger, action, alias="My Custom Automation"
        )

        assert config["alias"] == "My Custom Automation"

    def test_unknown_template_returns_none(self):
        """Test that unknown template returns None."""
        trigger = EntityInfo("binary_sensor.motion", "Motion", "binary_sensor")
        action = EntityInfo("light.test", "Test", "light")

        config = generate_automation_config("unknown-template", trigger, action)

        assert config is None

    def test_trigger_entity_in_config(self):
        """Test that trigger entity ID is in the config."""
        trigger = EntityInfo("binary_sensor.motion", "Motion Sensor", "binary_sensor")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config = generate_automation_config("light-occupancy", trigger, action)

        assert config["triggers"][0]["entity_id"] == "binary_sensor.motion"

    def test_action_entity_in_config(self):
        """Test that action entity ID is in the config."""
        trigger = EntityInfo("binary_sensor.motion", "Motion Sensor", "binary_sensor")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config = generate_automation_config("light-occupancy", trigger, action)

        assert config["actions"][0]["target"]["entity_id"] == "light.living_room"

    def test_button_toggle_uses_toggle_service(self):
        """Test that button-light-toggle uses toggle service."""
        trigger = EntityInfo("event.button_press", "Button Press", "event")
        action = EntityInfo("light.living_room", "Living Room", "light")

        config = generate_automation_config("button-light-toggle", trigger, action)

        assert config is not None
        assert config["actions"][0]["action"] == "light.toggle"

    def test_thermostat_adjust_template(self):
        """Test thermostat adjustment automation config."""
        trigger = EntityInfo("event.button_press", "Button Press", "event")
        action = EntityInfo("climate.thermostat", "Thermostat", "climate")

        config = generate_automation_config("button-thermostat-adjust", trigger, action)

        assert config is not None
        assert config["actions"][0]["action"] == "climate.set_temperature"


class TestResolveEntitiesForDevice:
    """Test entity resolution for devices."""

    def test_returns_empty_list_when_no_device_found(self):
        """Test that empty list is returned when device is not found."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            mock_get_info.return_value = {"ha_device_id": None, "entities": []}

            entities = resolve_entities_for_device(mock_hass, node_id=999)

            assert entities == []

    def test_filters_by_preferred_domains(self):
        """Test that entities are filtered by preferred domains."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            mock_get_info.return_value = {
                "ha_device_id": "device123",
                "entities": [
                    {
                        "entity_id": "light.test",
                        "domain": "light",
                        "name": "Test Light",
                        "disabled": False,
                    },
                    {
                        "entity_id": "switch.test",
                        "domain": "switch",
                        "name": "Test Switch",
                        "disabled": False,
                    },
                    {
                        "entity_id": "sensor.battery",
                        "domain": "sensor",
                        "name": "Battery",
                        "disabled": False,
                    },
                ],
            }

            entities = resolve_entities_for_device(
                mock_hass, node_id=1, preferred_domains=["light"]
            )

            assert len(entities) == 1
            assert entities[0].entity_id == "light.test"

    def test_returns_multiple_domains_when_specified(self):
        """Test that multiple preferred domains are returned."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            mock_get_info.return_value = {
                "ha_device_id": "device123",
                "entities": [
                    {
                        "entity_id": "light.test",
                        "domain": "light",
                        "name": "Test Light",
                        "disabled": False,
                    },
                    {
                        "entity_id": "switch.test",
                        "domain": "switch",
                        "name": "Test Switch",
                        "disabled": False,
                    },
                    {
                        "entity_id": "sensor.battery",
                        "domain": "sensor",
                        "name": "Battery",
                        "disabled": False,
                    },
                ],
            }

            entities = resolve_entities_for_device(
                mock_hass, node_id=1, preferred_domains=["light", "switch"]
            )

            assert len(entities) == 2
            entity_ids = [e.entity_id for e in entities]
            assert "light.test" in entity_ids
            assert "switch.test" in entity_ids

    def test_sorts_disabled_entities_last(self):
        """Test that disabled entities are sorted to the end."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            mock_get_info.return_value = {
                "ha_device_id": "device123",
                "entities": [
                    {
                        "entity_id": "light.disabled",
                        "domain": "light",
                        "name": "Disabled",
                        "disabled": True,
                    },
                    {
                        "entity_id": "light.enabled",
                        "domain": "light",
                        "name": "Enabled",
                        "disabled": False,
                    },
                ],
            }

            entities = resolve_entities_for_device(
                mock_hass, node_id=1, preferred_domains=["light"]
            )

            assert len(entities) == 2
            assert entities[0].entity_id == "light.enabled"  # Non-disabled first
            assert entities[1].entity_id == "light.disabled"


class TestAutomationResult:
    """Test AutomationResult dataclass."""

    def test_success_result(self):
        """Test creating a success result."""
        result = AutomationResult(
            success=True,
            automation_id="automation_123",
            message="Created successfully",
        )
        assert result.success is True
        assert result.automation_id == "automation_123"
        assert result.error_code is None

    def test_error_result(self):
        """Test creating an error result."""
        result = AutomationResult(
            success=False,
            message="Entity not found",
            error_code=AutomationErrorType.ENTITY_NOT_FOUND,
        )
        assert result.success is False
        assert result.error_code == AutomationErrorType.ENTITY_NOT_FOUND

    def test_result_with_config(self):
        """Test AutomationResult with automation config."""
        config = {"id": "test", "alias": "Test", "triggers": [], "actions": []}
        result = AutomationResult(
            success=True,
            message="Preview",
            automation_config=config,
        )
        assert result.automation_config == config


@pytest.mark.asyncio
class TestPreviewAutomation:
    """Test preview_automation async function."""

    async def test_returns_error_for_unknown_template(self):
        """Test that unknown template returns error."""
        mock_hass = MagicMock()

        result = await preview_automation(
            mock_hass,
            template_id="unknown-template",
            source_node_id=1,
            source_device_types=[256],
            target_node_id=2,
            target_device_types=[263],
        )

        assert result.success is False
        assert result.error_code == AutomationErrorType.TEMPLATE_NOT_FOUND

    async def test_returns_available_entities(self):
        """Test that preview returns available entities for selection."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            # Source node (light) has light entities
            def get_info_side_effect(hass, node_id):
                if node_id == 1:
                    return {
                        "ha_device_id": "device_source",
                        "entities": [
                            {
                                "entity_id": "light.test",
                                "domain": "light",
                                "name": "Test Light",
                                "disabled": False,
                            },
                        ],
                    }
                else:
                    return {
                        "ha_device_id": "device_target",
                        "entities": [
                            {
                                "entity_id": "binary_sensor.motion",
                                "domain": "binary_sensor",
                                "name": "Motion",
                                "disabled": False,
                            },
                        ],
                    }

            mock_get_info.side_effect = get_info_side_effect

            result = await preview_automation(
                mock_hass,
                template_id="light-occupancy",
                source_node_id=1,
                source_device_types=[256],
                target_node_id=2,
                target_device_types=[263],
            )

            assert result.success is True
            assert result.available_entities is not None
            assert len(result.available_entities["trigger"]) == 1
            assert len(result.available_entities["action"]) == 1

    async def test_returns_error_when_no_trigger_entity(self):
        """Test that error is returned when no trigger entity is found."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:
            mock_get_info.return_value = {"ha_device_id": None, "entities": []}

            result = await preview_automation(
                mock_hass,
                template_id="light-occupancy",
                source_node_id=1,
                source_device_types=[256],
                target_node_id=2,
                target_device_types=[263],
            )

            assert result.success is False
            assert result.error_code == AutomationErrorType.ENTITY_NOT_FOUND

    async def test_generates_config_on_success(self):
        """Test that preview generates automation config on success."""
        mock_hass = MagicMock()

        with patch(
            "custom_components.matter_binding_helper.automation_generator.get_ha_device_info"
        ) as mock_get_info:

            def get_info_side_effect(hass, node_id):
                if node_id == 1:
                    return {
                        "ha_device_id": "device_source",
                        "entities": [
                            {
                                "entity_id": "light.test",
                                "domain": "light",
                                "name": "Test Light",
                                "disabled": False,
                            },
                        ],
                    }
                else:
                    return {
                        "ha_device_id": "device_target",
                        "entities": [
                            {
                                "entity_id": "binary_sensor.motion",
                                "domain": "binary_sensor",
                                "name": "Motion",
                                "disabled": False,
                            },
                        ],
                    }

            mock_get_info.side_effect = get_info_side_effect

            result = await preview_automation(
                mock_hass,
                template_id="light-occupancy",
                source_node_id=1,
                source_device_types=[256],
                target_node_id=2,
                target_device_types=[263],
            )

            assert result.success is True
            assert result.automation_config is not None
            assert "triggers" in result.automation_config
            assert "actions" in result.automation_config

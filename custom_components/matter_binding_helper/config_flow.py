"""Config flow for Matter Binding Helper integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
    OptionsFlowWithConfigEntry,
)
from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN

from .const import CONF_DEMO_MODE, DEFAULT_DEMO_MODE, DOMAIN


class MatterBindingHelperConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Matter Binding Helper."""

    VERSION = 1

    @staticmethod
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Get the options flow for this handler."""
        return MatterBindingHelperOptionsFlow(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        # Check if already configured (single instance only)
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}

        # Check if Matter integration is available
        if MATTER_DOMAIN not in self.hass.data:
            errors["base"] = "matter_not_configured"
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema({}),
                errors=errors,
                description_placeholders={
                    "matter_integration": "Matter"
                },
            )

        if user_input is not None:
            return self.async_create_entry(
                title="Matter Binding Helper",
                data={},
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "matter_integration": "Matter"
            },
        )


class MatterBindingHelperOptionsFlow(OptionsFlowWithConfigEntry):
    """Handle options flow for Matter Binding Helper."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_DEMO_MODE,
                        default=self.options.get(CONF_DEMO_MODE, DEFAULT_DEMO_MODE),
                    ): bool,
                }
            ),
        )

/**
 * Tests for BindingCard component
 *
 * Test-first development: Define expected behavior before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  createBindingWithContext,
  createSwitchToLightScenario,
  createBinding,
  createNode,
  createEndpoint,
  TEST_CLUSTERS,
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
} from "../../test-utils";
import type { BindingWithContext } from "../../types";

// Import component (will be created after tests)
import "./binding-card";
import type { BindingCard } from "./binding-card";

describe("BindingCard", () => {
  let element: BindingCard;

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders binding target info in default variant", async () => {
      const scenario = createSwitchToLightScenario();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${scenario.bindingWithContext}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      // Default variant shows target info (source is implied from context)
      const text = element.shadowRoot?.textContent;

      // Should show target node name
      expect(text).toContain("Ceiling Light");

      // Should show cluster name
      expect(text).toContain("On/Off");
    });

    it("renders source and target in readable variant", async () => {
      const scenario = createSwitchToLightScenario();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${scenario.bindingWithContext}
          variant="readable"
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;

      // Readable variant shows both source and target
      expect(text).toContain("Wall Switch");
      expect(text).toContain("Ceiling Light");
    });

    it("renders binding arrow indicator", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const arrow = queryShadow(element, ".binding-arrow");
      expect(arrow).toBeTruthy();
      expect(arrow?.textContent).toContain("→");
    });

    it("renders endpoint information", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Endpoint");
    });

    it("renders group binding correctly", async () => {
      const binding = createBindingWithContext({
        binding: createBinding({
          targetNodeId: null,
          targetEndpointId: null,
          targetGroupId: 42,
        }),
        targetNode: null,
        targetEndpoint: null,
      });

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Group 42");
    });
  });

  describe("ACL warning", () => {
    it("shows ACL warning when aclMissing is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .aclMissing=${true}
          .aclReason=${"Target device does not grant permission"}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".binding-card");
      expect(card?.classList.contains("binding-missing-acl")).toBe(true);

      const warning = queryShadow(element, ".acl-warning-banner");
      expect(warning).toBeTruthy();
      expect(warning?.textContent).toContain("permission");
    });

    it("does not show ACL warning when aclMissing is false", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .aclMissing=${false}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".binding-card");
      expect(card?.classList.contains("binding-missing-acl")).toBe(false);

      const warning = queryShadow(element, ".acl-warning-banner");
      expect(warning).toBeFalsy();
    });

    it("shows repair button when ACL missing", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .aclMissing=${true}
          .showRepairButton=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const repairButton = queryShadow(element, ".btn-icon.repair");
      expect(repairButton).toBeTruthy();
    });
  });

  describe("action buttons", () => {
    it("renders delete button", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const deleteBtn = queryShadow(element, ".btn-icon.delete");
      expect(deleteBtn).toBeTruthy();
    });

    it("renders verify button when showVerifyButton is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .showVerifyButton=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const verifyBtn = queryShadow(element, ".btn-icon.verify");
      expect(verifyBtn).toBeTruthy();
    });

    it("does not render verify button when showVerifyButton is false", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .showVerifyButton=${false}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const verifyBtn = queryShadow(element, ".btn-icon.verify");
      expect(verifyBtn).toBeFalsy();
    });
  });

  describe("events", () => {
    it("dispatches delete-binding event on delete click", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ binding: BindingWithContext }>(
        element,
        "delete-binding"
      );

      const deleteBtn = queryShadow(element, ".btn-icon.delete") as HTMLButtonElement;
      deleteBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBe(binding);

      cleanup();
    });

    it("dispatches verify-binding event on verify click", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .showVerifyButton=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ binding: BindingWithContext }>(
        element,
        "verify-binding"
      );

      const verifyBtn = queryShadow(element, ".btn-icon.verify") as HTMLButtonElement;
      verifyBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBe(binding);

      cleanup();
    });

    it("dispatches repair-acl event on repair click", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .aclMissing=${true}
          .showRepairButton=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ binding: BindingWithContext }>(
        element,
        "repair-acl"
      );

      const repairBtn = queryShadow(element, ".btn-icon.repair") as HTMLButtonElement;
      repairBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBe(binding);

      cleanup();
    });

    it("dispatches navigate-device event on device name click", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card .binding=${binding}></matter-binding-card>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ deviceId: string }>(
        element,
        "navigate-device"
      );

      const deviceLink = queryShadow(element, ".device-link") as HTMLElement;
      deviceLink?.click();

      // Event should fire if device has ha_device_id
      if (binding.targetNode?.ha_device_id) {
        expect(events).toHaveLength(1);
        expect(events[0].detail.deviceId).toBe(binding.targetNode.ha_device_id);
      }

      cleanup();
    });
  });

  describe("disabled states", () => {
    it("disables delete button when deleteInProgress is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .deleteInProgress=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const deleteBtn = queryShadow(element, ".btn-icon.delete") as HTMLButtonElement;
      expect(deleteBtn?.disabled).toBe(true);
    });

    it("disables repair button when repairInProgress is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .aclMissing=${true}
          .showRepairButton=${true}
          .repairInProgress=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const repairBtn = queryShadow(element, ".btn-icon.repair") as HTMLButtonElement;
      expect(repairBtn?.disabled).toBe(true);
    });

    it("disables verify button when verifyInProgress is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .showVerifyButton=${true}
          .verifyInProgress=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const verifyBtn = queryShadow(element, ".btn-icon.verify") as HTMLButtonElement;
      expect(verifyBtn?.disabled).toBe(true);
    });

    it("disables all buttons when disabled is true", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          .showVerifyButton=${true}
          .aclMissing=${true}
          .showRepairButton=${true}
          .disabled=${true}
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const deleteBtn = queryShadow(element, ".btn-icon.delete") as HTMLButtonElement;
      const verifyBtn = queryShadow(element, ".btn-icon.verify") as HTMLButtonElement;
      const repairBtn = queryShadow(element, ".btn-icon.repair") as HTMLButtonElement;

      expect(deleteBtn?.disabled).toBe(true);
      expect(verifyBtn?.disabled).toBe(true);
      expect(repairBtn?.disabled).toBe(true);
    });
  });

  describe("display variants", () => {
    it("renders compact variant", async () => {
      const binding = createBindingWithContext();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${binding}
          variant="compact"
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".binding-card");
      expect(card?.classList.contains("compact")).toBe(true);
    });

    it("renders readable variant with full sentence", async () => {
      const scenario = createSwitchToLightScenario();

      element = await fixture<BindingCard>(html`
        <matter-binding-card
          .binding=${scenario.bindingWithContext}
          variant="readable"
        ></matter-binding-card>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".binding-card");
      expect(card?.classList.contains("readable")).toBe(true);

      // Readable variant should show action description from cluster binding descriptions
      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/control|communicate/i);
    });
  });
});

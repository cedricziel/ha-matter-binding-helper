/**
 * Tests for DevicePanel component
 *
 * Test-first development: Define expected behavior before implementation.
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
  createNode,
  createEndpoint,
  createBinding,
  createDeviceInfo,
  createEntityInfo,
} from "../../test-utils";

// Import component
import "./device-panel";
import type { DevicePanel } from "./device-panel";
import type { MatterNode, Binding, ACLEntry, BindingWithContext, EveSchedule } from "../../types";

describe("DevicePanel", () => {
  let element: DevicePanel;

  const mockNode = createNode({
    nodeId: 1,
    name: "Test Device",
    areaName: "Living Room",
    haDeviceId: "abc123",
    deviceInfo: createDeviceInfo({
      vendorId: 4937,
      vendorName: "Eve Systems",
      productId: 79,
      productName: "Eve Thermo",
      softwareVersion: "1.2.3",
    }),
    endpoints: [
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 769, revision: 1 }],
        serverClusters: [6, 8, 30],
        hasBindingCluster: true,
      }),
      createEndpoint({
        id: 2,
        deviceTypes: [{ id: 266, revision: 1 }],
        serverClusters: [6],
        hasBindingCluster: false,
      }),
    ],
    entities: [
      createEntityInfo({ entityId: "light.test", name: "Test Light", domain: "light" }),
      createEntityInfo({ entityId: "sensor.temp", name: "Temperature", domain: "sensor" }),
    ],
  });

  const mockBinding: Binding = createBinding({
    nodeId: 1,
    endpointId: 1,
    targetNodeId: 2,
    targetEndpointId: 1,
    clusterId: 6,
  });

  const mockBindingWithContext: BindingWithContext = {
    binding: mockBinding,
    sourceNode: mockNode,
    sourceEndpoint: mockNode.endpoints[0],
    targetNode: createNode({ nodeId: 2, name: "Target Device" }),
    targetEndpoint: createEndpoint({ id: 1 }),
  };

  const mockAclEntry: ACLEntry = {
    privilege: 3,
    privilege_name: "Operate",
    auth_mode: 2,
    auth_mode_name: "CASE",
    subjects: [1],
    targets: [],
    fabric_index: 1,
  };

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders device header with name", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, "h2");
      expect(header?.textContent).toContain("Test Device");
    });

    it("renders Home Assistant link when ha_device_id is present", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const link = queryShadow(element, ".device-ha-link");
      expect(link).toBeTruthy();
      expect(link?.getAttribute("href")).toContain("abc123");
    });

    it("renders device type tag", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const typeTag = queryShadow(element, ".device-type-tag");
      expect(typeTag).toBeTruthy();
    });

    it("renders area tag when area_name is present", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const areaTag = queryShadow(element, ".device-area-tag");
      expect(areaTag?.textContent).toContain("Living Room");
    });

    it("renders endpoint selector component", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const selector = queryShadow(element, "matter-endpoint-selector");
      expect(selector).toBeTruthy();
    });

    it("renders ACL section component", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
          .aclEntries=${[mockAclEntry]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const aclSection = queryShadow(element, "matter-acl-section");
      expect(aclSection).toBeTruthy();
    });

    it("renders entity chips when entities exist", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const entityChips = queryShadow(element, ".entity-chips");
      expect(entityChips).toBeTruthy();
    });

    it("renders bindings section header", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const sectionHeader = element.shadowRoot?.textContent;
      expect(sectionHeader).toContain("Bindings");
    });
  });

  describe("bindings display", () => {
    it("shows empty state when no bindings exist", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const emptyState = queryShadow(element, ".empty-state-small");
      expect(emptyState?.textContent).toContain("No bindings");
    });

    it("renders binding cards when bindings exist", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[mockBinding]}
          .bindingsWithContext=${[mockBindingWithContext]}
          .nodes=${[mockNode, mockBindingWithContext.targetNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const bindingCard = queryShadow(element, "matter-binding-card");
      expect(bindingCard).toBeTruthy();
    });

    it("shows add binding button when endpoint selected", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const addButton = element.shadowRoot?.querySelector("button");
      const buttons = element.shadowRoot?.querySelectorAll("button") || [];
      const addBindingBtn = Array.from(buttons).find(btn =>
        btn.textContent?.includes("Add Binding")
      );
      expect(addBindingBtn).toBeTruthy();
    });
  });

  describe("events", () => {
    it("dispatches endpoint-selected when endpoint selector emits event", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "endpoint-selected");

      const selector = queryShadow(element, "matter-endpoint-selector") as HTMLElement;
      selector?.dispatchEvent(new CustomEvent("endpoint-selected", {
        detail: { endpoint: mockNode.endpoints[0] },
        bubbles: true,
        composed: true,
      }));

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches add-binding when add button clicked", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "add-binding");

      const buttons = element.shadowRoot?.querySelectorAll("button") || [];
      const addBtn = Array.from(buttons).find(btn =>
        btn.textContent?.includes("Add Binding")
      ) as HTMLButtonElement;
      addBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches verify-bindings when verify button clicked", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "verify-bindings");

      const buttons = element.shadowRoot?.querySelectorAll("button") || [];
      const verifyBtn = Array.from(buttons).find(btn =>
        btn.textContent?.includes("Verify")
      ) as HTMLButtonElement;
      verifyBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches load-acl from ACL section", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "load-acl");

      const aclSection = queryShadow(element, "matter-acl-section") as HTMLElement;
      aclSection?.dispatchEvent(new CustomEvent("load-acl", {
        detail: { nodeId: 1 },
        bubbles: true,
        composed: true,
      }));

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches entity-click when entity chip clicked", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .bindings=${[]}
          .nodes=${[mockNode]}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "entity-click");

      const entityChip = queryShadow(element, ".entity-chip") as HTMLButtonElement;
      entityChip?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.entityId).toBeTruthy();
      cleanup();
    });
  });

  describe("verification state", () => {
    it("shows verification result when present", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
          .verificationResult=${{ success: true, verified: true, message: "Bindings verified" }}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const result = queryShadow(element, ".verification-result");
      expect(result).toBeTruthy();
      expect(result?.textContent).toContain("Bindings verified");
    });

    it("dispatches dismiss-verification when dismiss clicked", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
          .verificationResult=${{ success: true, verified: true, message: "Test" }}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "dismiss-verification");

      const dismissBtn = queryShadow(element, ".verification-dismiss") as HTMLButtonElement;
      dismissBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });
  });

  describe("loading states", () => {
    it("disables verify button when verification in progress", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
          .verificationInProgress=${true}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const buttons = element.shadowRoot?.querySelectorAll("button") || [];
      const verifyBtn = Array.from(buttons).find(btn =>
        btn.textContent?.includes("Verify") || btn.classList.contains("btn-verify")
      ) as HTMLButtonElement;
      expect(verifyBtn?.disabled).toBe(true);
    });

    it("shows loading spinner on verify button when in progress", async () => {
      element = await fixture<DevicePanel>(html`
        <matter-device-panel
          .node=${mockNode}
          .selectedEndpoint=${mockNode.endpoints[0]}
          .bindings=${[]}
          .nodes=${[mockNode]}
          .verificationInProgress=${true}
        ></matter-device-panel>
      `);

      await elementUpdated(element);

      const verifyBtn = queryShadow(element, ".btn-verify");
      expect(verifyBtn?.classList.contains("btn-loading")).toBe(true);
    });
  });
});

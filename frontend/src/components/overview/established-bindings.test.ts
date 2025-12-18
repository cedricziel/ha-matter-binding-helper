/**
 * Tests for EstablishedBindings component
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
  createNode,
  createEndpoint,
  createBinding,
  createBindingWithContext,
} from "../../test-utils";

// Import component
import "./established-bindings";
import type { EstablishedBindings } from "./established-bindings";
import type { BindingWithContext } from "../../types";

describe("EstablishedBindings", () => {
  let element: EstablishedBindings;

  const sourceNode = createNode({
    nodeId: 1,
    name: "Light Switch",
    areaName: "Living Room",
    haDeviceId: "device_1",
  });

  const targetNode = createNode({
    nodeId: 2,
    name: "Ceiling Light",
    areaName: "Living Room",
    haDeviceId: "device_2",
  });

  const mockBindings: BindingWithContext[] = [
    createBindingWithContext({
      sourceNode,
      targetNode,
      binding: createBinding({ nodeId: 1, targetNodeId: 2, clusterId: 6 }),
    }),
    createBindingWithContext({
      sourceNode,
      targetNode: createNode({ nodeId: 3, name: "Floor Lamp" }),
      binding: createBinding({ nodeId: 1, targetNodeId: 3, clusterId: 6 }),
    }),
  ];

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders card with header", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".card-header");
      expect(header?.textContent).toContain("Established Bindings");
    });

    it("renders count badge with number of bindings", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const badge = queryShadow(element, ".count-badge");
      expect(badge?.textContent).toContain("2");
    });

    it("renders all binding rows", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const rows = queryShadowAll(element, ".overview-binding-row");
      expect(rows.length).toBe(2);
    });

    it("shows empty state when no bindings", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${[]}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const emptyState = queryShadow(element, ".empty-state");
      expect(emptyState?.textContent).toContain("No bindings");
    });

    it("shows device names in binding rows", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const content = element.shadowRoot?.textContent;
      expect(content).toContain("Light Switch");
      expect(content).toContain("Ceiling Light");
    });
  });

  describe("ACL warnings", () => {
    it("shows repair all button when bindings have missing ACL", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
          .bindingsWithMissingACL=${mockBindings.slice(0, 1)}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const repairBtn = queryShadow(element, ".btn-repair");
      expect(repairBtn).toBeTruthy();
      expect(repairBtn?.textContent).toContain("Repair All");
    });

    it("hides repair all button when no missing ACLs", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
          .bindingsWithMissingACL=${[]}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const repairBtn = queryShadow(element, ".btn-repair");
      expect(repairBtn).toBeFalsy();
    });

    it("shows warning icon for binding with missing ACL", async () => {
      const bindingWithMissingAcl = mockBindings[0];
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${[bindingWithMissingAcl]}
          .bindingsWithMissingACL=${[bindingWithMissingAcl]}
          .aclStatusMap=${new Map([[bindingWithMissingAcl, { hasPermission: false, reason: "Missing ACL" }]])}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const warning = queryShadow(element, ".acl-warning");
      expect(warning).toBeTruthy();
    });
  });

  describe("events", () => {
    it("dispatches repair-all when repair all button clicked", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
          .bindingsWithMissingACL=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "repair-all");

      const repairBtn = queryShadow(element, ".btn-repair") as HTMLButtonElement;
      repairBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches verify-binding when verify button clicked", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "verify-binding");

      const verifyBtn = queryShadow(element, ".btn-icon.verify") as HTMLButtonElement;
      verifyBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBeTruthy();
      cleanup();
    });

    it("dispatches delete-binding when delete button clicked", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "delete-binding");

      const deleteBtn = queryShadow(element, ".btn-icon.delete") as HTMLButtonElement;
      deleteBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBeTruthy();
      cleanup();
    });

    it("dispatches navigate-device when device name clicked", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "navigate-device");

      const deviceLink = queryShadow(element, ".device-link") as HTMLElement;
      deviceLink?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.deviceId).toBeTruthy();
      cleanup();
    });

    it("dispatches repair-acl when repair icon clicked", async () => {
      const bindingWithMissingAcl = mockBindings[0];
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${[bindingWithMissingAcl]}
          .bindingsWithMissingACL=${[bindingWithMissingAcl]}
          .aclStatusMap=${new Map([[bindingWithMissingAcl, { hasPermission: false, reason: "Missing ACL" }]])}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "repair-acl");

      const repairIcon = queryShadow(element, ".repair-icon") as HTMLElement;
      repairIcon?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.binding).toBeTruthy();
      cleanup();
    });
  });

  describe("loading states", () => {
    it("disables repair button when bulk repair in progress", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
          .bindingsWithMissingACL=${mockBindings}
          .bulkRepairInProgress=${true}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const repairBtn = queryShadow(element, ".btn-repair") as HTMLButtonElement;
      expect(repairBtn?.disabled).toBe(true);
    });

    it("disables action buttons when action in progress", async () => {
      element = await fixture<EstablishedBindings>(html`
        <matter-established-bindings
          .bindings=${mockBindings}
          .actionInProgress=${true}
        ></matter-established-bindings>
      `);

      await elementUpdated(element);

      const deleteBtn = queryShadow(element, ".btn-icon.delete") as HTMLButtonElement;
      expect(deleteBtn?.disabled).toBe(true);
    });
  });
});

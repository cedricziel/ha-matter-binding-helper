/**
 * Tests for AclSection component
 *
 * Test-first development: Define expected behavior before implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  createACLEntry,
  createNode,
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
} from "../../test-utils";
import type { ACLEntry, MatterNode } from "../../types";

// Import component (will be created after tests)
import "./acl-section";
import type { AclSection } from "./acl-section";

describe("AclSection", () => {
  let element: AclSection;

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders section header with title", async () => {
      const node = createNode({ nodeId: 1, name: "Test Device" });

      element = await fixture<AclSection>(html`
        <matter-acl-section .node=${node}></matter-acl-section>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".section-header");
      expect(header).toBeTruthy();
      expect(header?.textContent).toContain("Access Control");
    });

    it("renders load button", async () => {
      const node = createNode({ nodeId: 1 });

      element = await fixture<AclSection>(html`
        <matter-acl-section .node=${node}></matter-acl-section>
      `);

      await elementUpdated(element);

      const loadBtn = queryShadow(element, ".btn");
      expect(loadBtn).toBeTruthy();
      expect(loadBtn?.textContent).toContain("Load from Device");
    });

    it("renders list of ACL entries", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ privilege: 5, privilegeName: "Administer", subjects: [] }),
        createACLEntry({ privilege: 3, privilegeName: "Operate", subjects: [1] }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const aclEntries = queryShadowAll(element, ".acl-entry");
      expect(aclEntries).toHaveLength(2);
    });

    it("renders correct privilege badge for each entry", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ privilege: 5, privilegeName: "Administer" }),
        createACLEntry({ privilege: 3, privilegeName: "Operate" }),
        createACLEntry({ privilege: 1, privilegeName: "View" }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Administer");
      expect(text).toContain("Operate");
      expect(text).toContain("View");
    });

    it("resolves subject node IDs to names when nodes provided", async () => {
      const targetNode = createNode({ nodeId: 2, name: "Target Device" });
      const subjectNode = createNode({ nodeId: 1, name: "Switch Controller" });
      const entries: ACLEntry[] = [
        createACLEntry({ subjects: [1] }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${targetNode}
          .entries=${entries}
          .nodes=${[subjectNode, targetNode]}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Switch Controller");
    });

    it("shows node ID when subject node not found", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ subjects: [999] }), // Unknown node
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
          .nodes=${[node]}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Node 999");
    });

    it("displays target cluster names", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({
          targets: [{ cluster: 0x0006, endpoint: null, device_type: null }], // On/Off cluster
        }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("On/Off");
    });

    it("displays target endpoint", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({
          targets: [{ cluster: null, endpoint: 1, device_type: null }],
        }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("EP 1");
    });
  });

  describe("states", () => {
    it("shows loading state", async () => {
      const node = createNode({ nodeId: 1 });

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .loading=${true}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const loadBtn = queryShadow(element, ".btn") as HTMLButtonElement;
      expect(loadBtn?.disabled).toBe(true);
      expect(loadBtn?.textContent).toContain("Loading");
    });

    it("shows empty state when no ACLs and entries is empty array", async () => {
      const node = createNode({ nodeId: 1 });

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${[]}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("No ACL entries");
    });

    it("shows prompt when entries is null (not loaded)", async () => {
      const node = createNode({ nodeId: 1 });

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${null}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Load from Device");
    });
  });

  describe("events", () => {
    it("dispatches load-acl event on load button click", async () => {
      const node = createNode({ nodeId: 5, name: "Test Device" });

      element = await fixture<AclSection>(html`
        <matter-acl-section .node=${node}></matter-acl-section>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ nodeId: number }>(
        element,
        "load-acl"
      );

      const loadBtn = queryShadow(element, ".btn") as HTMLButtonElement;
      loadBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.nodeId).toBe(5);

      cleanup();
    });
  });

  describe("privilege styling", () => {
    it("applies admin class to administer entries", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ privilege: 5, privilegeName: "Administer" }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const entry = queryShadow(element, ".acl-entry");
      expect(entry?.classList.contains("acl-admin")).toBe(true);
    });

    it("applies operate class to operate entries", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ privilege: 3, privilegeName: "Operate" }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const entry = queryShadow(element, ".acl-entry");
      expect(entry?.classList.contains("acl-operate")).toBe(true);
    });
  });

  describe("entry index display", () => {
    it("displays entry index starting from 1", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ privilege: 5 }),
        createACLEntry({ privilege: 3 }),
        createACLEntry({ privilege: 1 }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("#1");
      expect(text).toContain("#2");
      expect(text).toContain("#3");
    });
  });

  describe("auth mode display", () => {
    it("displays auth mode name", async () => {
      const node = createNode({ nodeId: 2 });
      const entries: ACLEntry[] = [
        createACLEntry({ authMode: 2, authModeName: "CASE" }),
      ];

      element = await fixture<AclSection>(html`
        <matter-acl-section
          .node=${node}
          .entries=${entries}
        ></matter-acl-section>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("CASE");
    });
  });
});

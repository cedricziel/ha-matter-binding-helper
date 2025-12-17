/**
 * Tests for NodeList component
 *
 * Test-first development: Define expected behavior before implementation.
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  createNode,
  createEndpoint,
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
  TEST_CLUSTERS,
} from "../../test-utils";
import type { MatterNode } from "../../types";

// Import component (will be created after tests)
import "./node-list";
import type { NodeList } from "./node-list";

describe("NodeList", () => {
  let element: NodeList;

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders all provided nodes", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 1, name: "Switch" }),
        createNode({ nodeId: 2, name: "Light 1" }),
        createNode({ nodeId: 3, name: "Light 2" }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const nodeItems = queryShadowAll(element, ".node-item");
      expect(nodeItems).toHaveLength(3);
    });

    it("renders node names", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 1, name: "Living Room Switch" }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Living Room Switch");
    });

    it("renders node IDs", async () => {
      const nodes: MatterNode[] = [createNode({ nodeId: 42, name: "Test" })];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("#42");
    });

    it("highlights selected node", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 1, name: "Node 1" }),
        createNode({ nodeId: 2, name: "Node 2" }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list
          .nodes=${nodes}
          .selectedNodeId=${2}
        ></matter-node-list>
      `);

      await elementUpdated(element);

      const nodeItems = queryShadowAll(element, ".node-item");
      expect(nodeItems[0].classList.contains("selected")).toBe(false);
      expect(nodeItems[1].classList.contains("selected")).toBe(true);
    });

    it("shows device type", async () => {
      const nodes: MatterNode[] = [
        createNode({
          nodeId: 1,
          name: "Test",
          endpoints: [
            createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
            createEndpoint({
              id: 1,
              deviceTypes: [{ id: 256, revision: 1 }], // On/Off Light
            }),
          ],
        }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("On/Off Light");
    });

    it("shows area name when available", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 1, name: "Test", areaName: "Kitchen" }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Kitchen");
    });

    it("shows availability status indicator", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 1, name: "Available", available: true }),
        createNode({ nodeId: 2, name: "Unavailable", available: false }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const statusIndicators = queryShadowAll(element, ".node-status");
      expect(statusIndicators[0].classList.contains("unavailable")).toBe(false);
      expect(statusIndicators[1].classList.contains("unavailable")).toBe(true);
    });
  });

  describe("events", () => {
    it("dispatches node-selected event on click", async () => {
      const nodes: MatterNode[] = [
        createNode({ nodeId: 5, name: "Clickable Node" }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ node: MatterNode }>(
        element,
        "node-selected"
      );

      const nodeItem = queryShadow(element, ".node-item") as HTMLElement;
      nodeItem?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.node.node_id).toBe(5);

      cleanup();
    });
  });

  describe("states", () => {
    it("shows loading state", async () => {
      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${[]} .loading=${true}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Loading");
    });

    it("shows empty state when no nodes", async () => {
      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${[]} .loading=${false}></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/no.*device|empty/i);
    });

    it("hides loading when nodes are present", async () => {
      const nodes: MatterNode[] = [createNode({ nodeId: 1, name: "Test" })];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes} .loading=${true}></matter-node-list>
      `);

      await elementUpdated(element);

      // When nodes are present, should show nodes even if loading flag is true
      const nodeItems = queryShadowAll(element, ".node-item");
      expect(nodeItems).toHaveLength(1);
    });
  });

  describe("header", () => {
    it("renders header title", async () => {
      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${[]}></matter-node-list>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".card-header");
      expect(header?.textContent).toContain("Matter Devices");
    });

    it("allows custom header title", async () => {
      element = await fixture<NodeList>(html`
        <matter-node-list
          .nodes=${[]}
          title="Select Target"
        ></matter-node-list>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".card-header");
      expect(header?.textContent).toContain("Select Target");
    });
  });

  describe("endpoint count", () => {
    it("shows endpoint count for nodes with multiple endpoints", async () => {
      const nodes: MatterNode[] = [
        createNode({
          nodeId: 1,
          name: "Multi-endpoint",
          endpoints: [
            createEndpoint({ id: 0 }),
            createEndpoint({ id: 1 }),
            createEndpoint({ id: 2 }),
          ],
        }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list
          .nodes=${nodes}
          .showEndpointCount=${true}
        ></matter-node-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      // Should show count of non-root endpoints (2 in this case)
      expect(text).toMatch(/2.*endpoint/i);
    });
  });

  describe("binding indicator", () => {
    it("shows binding indicator when node has binding cluster", async () => {
      const nodes: MatterNode[] = [
        createNode({
          nodeId: 1,
          name: "Switch with binding",
          endpoints: [
            createEndpoint({ id: 0 }),
            createEndpoint({ id: 1, hasBindingCluster: true }),
          ],
        }),
      ];

      element = await fixture<NodeList>(html`
        <matter-node-list .nodes=${nodes}></matter-node-list>
      `);

      await elementUpdated(element);

      // Check for binding indicator
      const hasBindingIndicator = element.shadowRoot?.textContent?.includes("Binding");
      // Or check for specific class/element
      expect(hasBindingIndicator).toBe(true);
    });
  });
});

/**
 * Tests for EndpointSelector component
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
import type { MatterNode, MatterEndpoint } from "../../types";

// Import component (will be created after tests)
import "./endpoint-selector";
import type { EndpointSelector } from "./endpoint-selector";

describe("EndpointSelector", () => {
  let element: EndpointSelector;

  const testNode = createNode({
    nodeId: 1,
    name: "Test Device",
    endpoints: [
      createEndpoint({
        id: 0,
        serverClusters: [TEST_CLUSTERS.DESCRIPTOR],
        deviceTypes: [{ id: 22, revision: 1 }], // Root Node
      }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 256, revision: 1 }], // On/Off Light
        hasBindingCluster: true,
        serverClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
        clientClusters: [],
      }),
      createEndpoint({
        id: 2,
        deviceTypes: [{ id: 259, revision: 1 }], // On/Off Switch
        hasBindingCluster: true,
        serverClusters: [],
        clientClusters: [TEST_CLUSTERS.ON_OFF],
      }),
    ],
  });

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders all endpoints", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const items = queryShadowAll(element, ".endpoint-item");
      expect(items.length).toBe(3);
    });

    it("renders endpoint IDs", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Endpoint 0");
      expect(text).toContain("Endpoint 1");
      expect(text).toContain("Endpoint 2");
    });

    it("renders device types", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("On/Off Light");
    });

    it("highlights selected endpoint", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
          .selectedEndpointId=${1}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const items = queryShadowAll(element, ".endpoint-item");
      expect(items[0].classList.contains("selected")).toBe(false);
      expect(items[1].classList.contains("selected")).toBe(true);
      expect(items[2].classList.contains("selected")).toBe(false);
    });

    it("shows binding badge for endpoints with binding cluster", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const bindingBadges = queryShadowAll(element, ".endpoint-badge.binding");
      expect(bindingBadges.length).toBe(2); // Endpoints 1 and 2 have binding
    });

    it("shows no-binding style for endpoints without binding cluster", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const items = queryShadowAll(element, ".endpoint-item");
      expect(items[0].classList.contains("no-binding")).toBe(true); // EP 0
      expect(items[1].classList.contains("no-binding")).toBe(false); // EP 1
    });

    it("renders server clusters", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("On/Off"); // Server cluster on EP 1
    });

    it("renders client clusters", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      // Check that client clusters section exists
      const clientSections = queryShadowAll(element, ".cluster-list.client");
      expect(clientSections.length).toBeGreaterThan(0);
    });
  });

  describe("events", () => {
    it("dispatches endpoint-selected event on click", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ endpoint: MatterEndpoint }>(
        element,
        "endpoint-selected"
      );

      const items = queryShadowAll(element, ".endpoint-item") as NodeListOf<HTMLElement>;
      items[1]?.click(); // Click endpoint 1

      expect(events).toHaveLength(1);
      expect(events[0].detail.endpoint.endpoint_id).toBe(1);

      cleanup();
    });

    it("dispatches endpoint-selected with correct endpoint data", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ endpoint: MatterEndpoint }>(
        element,
        "endpoint-selected"
      );

      const items = queryShadowAll(element, ".endpoint-item") as NodeListOf<HTMLElement>;
      items[2]?.click(); // Click endpoint 2

      expect(events).toHaveLength(1);
      expect(events[0].detail.endpoint.endpoint_id).toBe(2);
      expect(events[0].detail.endpoint.has_binding_cluster).toBe(true);

      cleanup();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no endpoints provided", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector .endpoints=${[]}></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/no.*endpoint|empty/i);
    });
  });

  describe("section header", () => {
    it("renders section header", async () => {
      element = await fixture<EndpointSelector>(html`
        <matter-endpoint-selector
          .endpoints=${testNode.endpoints}
        ></matter-endpoint-selector>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".section-header");
      expect(header?.textContent).toContain("Endpoints");
    });
  });
});

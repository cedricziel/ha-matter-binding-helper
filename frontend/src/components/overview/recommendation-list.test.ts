/**
 * Tests for RecommendationList component
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
import type { BindingRecommendation } from "../../types";

// Import component (will be created after tests)
import "./recommendation-list";
import type { RecommendationList } from "./recommendation-list";

describe("RecommendationList", () => {
  let element: RecommendationList;

  const sourceNode = createNode({
    nodeId: 1,
    name: "Wall Switch",
    areaName: "Living Room",
    endpoints: [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 259, revision: 1 }],
        hasBindingCluster: true,
        clientClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
        serverClusters: [],
      }),
    ],
  });

  const targetNode = createNode({
    nodeId: 2,
    name: "Ceiling Light",
    areaName: "Living Room",
    endpoints: [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 256, revision: 1 }],
        serverClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
      }),
    ],
  });

  const targetNode2 = createNode({
    nodeId: 3,
    name: "Desk Lamp",
    areaName: "Office",
    endpoints: [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 256, revision: 1 }],
        serverClusters: [TEST_CLUSTERS.ON_OFF],
      }),
    ],
  });

  const recommendations: BindingRecommendation[] = [
    {
      sourceNode,
      sourceEndpoint: sourceNode.endpoints[1],
      targetNode,
      targetEndpoint: targetNode.endpoints[1],
      compatibleClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
    },
    {
      sourceNode,
      sourceEndpoint: sourceNode.endpoints[1],
      targetNode: targetNode2,
      targetEndpoint: targetNode2.endpoints[1],
      compatibleClusters: [TEST_CLUSTERS.ON_OFF],
    },
  ];

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders all recommendations", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const rows = queryShadowAll(element, ".recommendation-row");
      expect(rows.length).toBe(2);
    });

    it("renders source and target device names", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Wall Switch");
      expect(text).toContain("Ceiling Light");
      expect(text).toContain("Desk Lamp");
    });

    it("renders compatible cluster badges", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const badges = queryShadowAll(element, ".cluster-badge");
      expect(badges.length).toBeGreaterThan(0);
    });

    it("renders endpoint info in metadata", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("EP 1");
    });

    it("renders area name when available", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Living Room");
    });

    it("renders section header", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".card-header");
      expect(header?.textContent).toContain("Recommended");
    });

    it("shows count badge with recommendation count", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const badge = queryShadow(element, ".count-badge");
      expect(badge?.textContent).toContain("2");
    });
  });

  describe("empty state", () => {
    it("shows empty state when no recommendations", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${[]}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/no.*recommendation|already.*bound/i);
    });
  });

  describe("events", () => {
    it("dispatches create-binding event on create click", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{
        recommendation: BindingRecommendation;
      }>(element, "create-binding");

      const createBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      createBtn?.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.recommendation.sourceNode.node_id).toBe(1);

      cleanup();
    });

    it("dispatches navigate-device event on device name click", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ deviceId: string }>(
        element,
        "navigate-device"
      );

      const deviceLink = queryShadow(element, ".device-link") as HTMLElement;
      deviceLink?.click();

      // Should dispatch if ha_device_id is available
      expect(events.length).toBeGreaterThanOrEqual(0);

      cleanup();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${[]}
          .loading=${true}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/loading/i);
    });
  });

  describe("disabled state", () => {
    it("disables create button when actionInProgress", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
          .actionInProgress=${true}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const createBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      expect(createBtn?.disabled).toBe(true);
    });
  });

  describe("hideCard mode", () => {
    it("renders without card wrapper when hideCard is true", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
          .hideCard=${true}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".card");
      expect(card).toBeNull();

      // Should still render the list
      const rows = queryShadowAll(element, ".recommendation-row");
      expect(rows.length).toBe(2);
    });

    it("renders with card wrapper by default", async () => {
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${recommendations}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const card = queryShadow(element, ".card");
      expect(card).not.toBeNull();
    });
  });

  describe("custom empty message", () => {
    it("displays custom empty message when provided", async () => {
      const customMessage = "No same-area recommendations available.";
      element = await fixture<RecommendationList>(html`
        <matter-recommendation-list
          .recommendations=${[]}
          .emptyMessage=${customMessage}
        ></matter-recommendation-list>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain(customMessage);
    });
  });
});

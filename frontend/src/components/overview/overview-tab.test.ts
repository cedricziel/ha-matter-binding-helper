/**
 * Tests for OverviewTab component
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  elementUpdated,
  queryShadow,
  createNode,
  createBindingWithContext,
  createBinding,
} from "../../test-utils";

// Import component
import "./overview-tab";
import type { OverviewTab } from "./overview-tab";
import type { BindingWithContext, BindingRecommendation, AutomationRecommendation } from "../../types";

describe("OverviewTab", () => {
  let element: OverviewTab;

  const sourceNode = createNode({
    nodeId: 1,
    name: "Switch",
    areaName: "Living Room",
  });

  const targetNode = createNode({
    nodeId: 2,
    name: "Light",
    areaName: "Living Room",
  });

  const mockBindings: BindingWithContext[] = [
    createBindingWithContext({
      sourceNode,
      targetNode,
      binding: createBinding({ nodeId: 1, targetNodeId: 2, clusterId: 6 }),
    }),
  ];

  const mockRecommendation: BindingRecommendation = {
    sourceNode,
    targetNode,
    sourceEndpoint: sourceNode.endpoints[0],
    targetEndpoint: targetNode.endpoints[0],
    compatibleClusters: [6], // On/Off cluster
  };

  const mockAutomation: AutomationRecommendation = {
    template: {
      id: "test",
      title: "Create automation",
      icon: "💡",
      why: "Direct binding not supported",
      triggerDomain: "binary_sensor",
      targetDomain: "light",
    },
    sourceNode,
    targetNode,
    sourceEndpoint: sourceNode.endpoints[0],
    targetEndpoint: targetNode.endpoints[0],
  };

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders loading state when loading", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${true}
          .bindings=${[]}
          .recommendations=${[]}
          .automationRecommendations=${[]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const loading = queryShadow(element, ".loading");
      expect(loading).toBeTruthy();
    });

    it("renders established bindings section", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${mockBindings}
          .recommendations=${[]}
          .automationRecommendations=${[]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const established = queryShadow(element, "matter-established-bindings");
      expect(established).toBeTruthy();
    });

    it("renders recommended bindings section", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${[]}
          .recommendations=${[mockRecommendation]}
          .automationRecommendations=${[]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const recommendations = queryShadow(element, "matter-recommendation-list");
      expect(recommendations).toBeTruthy();
    });

    it("renders automation recommendations section when present", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${[]}
          .recommendations=${[]}
          .automationRecommendations=${[mockAutomation]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const automations = queryShadow(element, ".automation-card");
      expect(automations).toBeTruthy();
    });

    it("hides automation section when no automations", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${[]}
          .recommendations=${[]}
          .automationRecommendations=${[]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const automations = queryShadow(element, ".automation-card");
      expect(automations).toBeFalsy();
    });
  });

  describe("filter toggle", () => {
    it("renders same area filter toggle", async () => {
      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${[]}
          .recommendations=${[mockRecommendation]}
          .automationRecommendations=${[]}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      const toggle = queryShadow(element, ".toggle-switch input");
      expect(toggle).toBeTruthy();
    });

    it("filters recommendations by same area when toggle checked", async () => {
      const differentAreaNode = createNode({
        nodeId: 3,
        name: "Bedroom Light",
        areaName: "Bedroom",
      });

      const crossAreaRecommendation: BindingRecommendation = {
        sourceNode,
        targetNode: differentAreaNode,
        sourceEndpoint: sourceNode.endpoints[0],
        targetEndpoint: differentAreaNode.endpoints[0],
        compatibleClusters: [6], // On/Off cluster
      };

      element = await fixture<OverviewTab>(html`
        <matter-overview-tab
          .loading=${false}
          .bindings=${[]}
          .recommendations=${[mockRecommendation, crossAreaRecommendation]}
          .automationRecommendations=${[]}
          .filterSameAreaOnly=${true}
        ></matter-overview-tab>
      `);

      await elementUpdated(element);

      // Check if hidden count is displayed
      const filterInfo = queryShadow(element, ".filter-info");
      expect(filterInfo?.textContent).toContain("hidden");
    });
  });
});

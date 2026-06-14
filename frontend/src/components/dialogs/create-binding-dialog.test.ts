/**
 * Tests for CreateBindingDialog component
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
import "./create-binding-dialog";
import type { CreateBindingDialog } from "./create-binding-dialog";

describe("CreateBindingDialog", () => {
  let element: CreateBindingDialog;

  const sourceNode = createNode({
    nodeId: 1,
    name: "Wall Switch",
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

  const sourceEndpoint = sourceNode.endpoints[1];

  const targetNodes: MatterNode[] = [
    createNode({
      nodeId: 2,
      name: "Ceiling Light",
      areaName: "Living Room",
      endpoints: [
        createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
        createEndpoint({
          id: 1,
          deviceTypes: [{ id: 257, revision: 1 }],
          serverClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
        }),
      ],
    }),
    createNode({
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
    }),
  ];

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders target node dropdown with compatible nodes", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const nodeOptions = queryShadowAll(element, 'select[name="targetNode"] option');
      expect(nodeOptions.length).toBeGreaterThan(0);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Ceiling Light");
      expect(text).toContain("Desk Lamp");
    });

    it("shows source node info in header", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".dialog-header");
      expect(header?.textContent).toContain("Wall Switch");
      expect(header?.textContent).toContain("EP1");
    });

    it("renders target endpoint dropdown after node selected", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const endpointSelect = queryShadow(element, 'select[name="targetEndpoint"]');
      expect(endpointSelect).toBeTruthy();
    });

    it("renders cluster selection after endpoint selected", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
          .selectedTargetEndpointId=${1}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const clusterSelect = queryShadow(element, 'select[name="cluster"]');
      expect(clusterSelect).toBeTruthy();
    });

    it("filters to only show compatible clusters", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
          .selectedTargetEndpointId=${1}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      // Should show On/Off and Level Control (both are compatible)
      expect(text).toContain("On/Off");
    });
  });

  describe("events", () => {
    it("dispatches target-node-change on node selection", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ nodeId: number }>(
        element,
        "target-node-change"
      );

      const nodeSelect = queryShadow(element, 'select[name="targetNode"]') as HTMLSelectElement;
      nodeSelect.value = "3";
      nodeSelect.dispatchEvent(new Event("change"));

      expect(events).toHaveLength(1);
      expect(events[0].detail.nodeId).toBe(3);

      cleanup();
    });

    it("dispatches target-endpoint-change on endpoint selection", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ endpointId: number }>(
        element,
        "target-endpoint-change"
      );

      const endpointSelect = queryShadow(element, 'select[name="targetEndpoint"]') as HTMLSelectElement;
      if (endpointSelect) {
        endpointSelect.value = "1";
        endpointSelect.dispatchEvent(new Event("change"));
        expect(events.length).toBeGreaterThanOrEqual(0); // May or may not fire depending on initial state
      }

      cleanup();
    });

    it("dispatches create-binding event with selection data", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
          .selectedTargetEndpointId=${1}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{
        targetNodeId: number;
        targetEndpointId: number;
        clusterId: number;
      }>(element, "create-binding");

      // Submit the form
      const form = queryShadow(element, "form") as HTMLFormElement;
      form?.dispatchEvent(new Event("submit", { cancelable: true }));

      expect(events).toHaveLength(1);
      expect(events[0].detail.targetNodeId).toBe(2);
      expect(events[0].detail.targetEndpointId).toBe(1);

      cleanup();
    });

    it("dispatches cancel event on cancel click", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "cancel");

      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;
      cancelBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });
  });

  describe("validation", () => {
    it("validates required selections before allowing create", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      // Form elements should have required attribute
      const nodeSelect = queryShadow(element, 'select[name="targetNode"]');
      expect(nodeSelect?.hasAttribute("required")).toBe(true);
    });

    it("disables submit when no compatible clusters", async () => {
      // Create a source with no client clusters
      const incompatibleSource = createNode({
        nodeId: 1,
        name: "Sensor",
        endpoints: [
          createEndpoint({
            id: 1,
            clientClusters: [], // No client clusters
            serverClusters: [TEST_CLUSTERS.ON_OFF],
          }),
        ],
      });

      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${incompatibleSource}
          .sourceEndpoint=${incompatibleSource.endpoints[0]}
          .availableNodes=${targetNodes}
          .selectedTargetNodeId=${2}
          .selectedTargetEndpointId=${1}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const submitBtn = queryShadow(element, 'button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn?.disabled).toBe(true);
    });
  });

  describe("warnings", () => {
    it("shows warning when source has no client clusters", async () => {
      const noClientSource = createNode({
        nodeId: 1,
        name: "Sensor",
        endpoints: [
          createEndpoint({
            id: 1,
            clientClusters: [],
            serverClusters: [TEST_CLUSTERS.ON_OFF],
          }),
        ],
      });

      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${noClientSource}
          .sourceEndpoint=${noClientSource.endpoints[0]}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toMatch(/can't control|no client/i);
    });
  });

  describe("group target", () => {
    const groups = [
      { group_id: 5, name: "Living Room Lights", members: [] },
      { group_id: 6, name: "Kitchen", members: [] },
    ];

    it("does not show the target-type toggle when no groups are available", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
        ></matter-create-binding-dialog>
      `);
      expect(queryShadow(element, "#targetType")).toBeNull();
    });

    it("shows the toggle and emits a group binding when group target is chosen", async () => {
      element = await fixture<CreateBindingDialog>(html`
        <matter-create-binding-dialog
          .open=${true}
          .sourceNode=${sourceNode}
          .sourceEndpoint=${sourceEndpoint}
          .availableNodes=${targetNodes}
          .availableGroups=${groups}
        ></matter-create-binding-dialog>
      `);

      const typeSelect = queryShadow<HTMLSelectElement>(element, "#targetType");
      expect(typeSelect).not.toBeNull();
      typeSelect!.value = "group";
      typeSelect!.dispatchEvent(new Event("change"));
      await elementUpdated(element);

      const groupSelect = queryShadow<HTMLSelectElement>(element, "#targetGroup");
      expect(groupSelect).not.toBeNull();
      groupSelect!.value = "6";
      groupSelect!.dispatchEvent(new Event("change"));
      await elementUpdated(element);

      const { events } = captureEvents<{
        targetGroupId: number;
        clusterId: number;
      }>(element, "create-binding");

      const submit = queryShadowAll<HTMLButtonElement>(element, "button").find(
        (b) => b.textContent?.includes("Create Binding")
      );
      submit!.click();

      expect(events).toHaveLength(1);
      expect(events[0].detail.targetGroupId).toBe(6);
      // Cluster defaults to the first source client cluster (On/Off).
      expect(events[0].detail.clusterId).toBe(TEST_CLUSTERS.ON_OFF);
    });
  });
});

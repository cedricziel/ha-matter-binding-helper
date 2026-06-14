/**
 * Tests for ManageGroupDialog component.
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
} from "../../test-utils";
import type { MatterGroup, MatterNode } from "../../types";

import "./manage-group-dialog";
import type { ManageGroupDialog } from "./manage-group-dialog";

describe("ManageGroupDialog", () => {
  let element: ManageGroupDialog;

  const nodes: MatterNode[] = [
    createNode({
      nodeId: 3,
      name: "Ceiling Light",
      endpoints: [
        createEndpoint({ id: 0, serverClusters: [] }),
        createEndpoint({ id: 1, serverClusters: [] }),
      ],
    }),
  ];

  const group: MatterGroup = {
    group_id: 1,
    name: "Ambientebeleuchtung",
    members: [{ node_id: 3, endpoint_id: 1 }],
  };

  afterEach(() => {
    element?.remove();
  });

  it("renders nothing when closed", async () => {
    element = await fixture(
      html`<matter-manage-group-dialog .group=${group}></matter-manage-group-dialog>`
    );
    expect(queryShadow(element, ".dialog-overlay")).toBeNull();
  });

  it("lists current members with the resolved device name", async () => {
    element = await fixture(html`
      <matter-manage-group-dialog
        .open=${true}
        .group=${group}
        .availableNodes=${nodes}
      ></matter-manage-group-dialog>
    `);
    const text = element.shadowRoot?.textContent ?? "";
    expect(text).toContain("Ceiling Light");
    expect(text).toContain("EP 1");
  });

  it("emits remove-member when Remove is clicked", async () => {
    element = await fixture(html`
      <matter-manage-group-dialog
        .open=${true}
        .group=${group}
        .availableNodes=${nodes}
      ></matter-manage-group-dialog>
    `);
    const { events } = captureEvents(element, "remove-member");

    queryShadowAll<HTMLButtonElement>(element, "button")
      .find((b) => b.textContent?.includes("Remove"))!
      .click();

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ nodeId: 3, endpointId: 1 });
  });

  it("emits add-member after selecting a node and endpoint", async () => {
    const emptyGroup: MatterGroup = { group_id: 2, name: "Empty", members: [] };
    element = await fixture(html`
      <matter-manage-group-dialog
        .open=${true}
        .group=${emptyGroup}
        .availableNodes=${nodes}
      ></matter-manage-group-dialog>
    `);
    const { events } = captureEvents(element, "add-member");

    const nodeSelect = queryShadow<HTMLSelectElement>(element, "#add-node");
    nodeSelect!.value = "3";
    nodeSelect!.dispatchEvent(new Event("change"));
    await elementUpdated(element);

    const epSelect = queryShadow<HTMLSelectElement>(element, "#add-endpoint");
    epSelect!.value = "1";
    epSelect!.dispatchEvent(new Event("change"));
    await elementUpdated(element);

    queryShadowAll<HTMLButtonElement>(element, "button")
      .find((b) => b.textContent?.trim() === "Add")!
      .click();

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ nodeId: 3, endpointId: 1 });
  });

  it("disables Add for an endpoint that is already a member", async () => {
    // group already has node 3 / ep 1.
    element = await fixture(html`
      <matter-manage-group-dialog
        .open=${true}
        .group=${group}
        .availableNodes=${nodes}
      ></matter-manage-group-dialog>
    `);
    const nodeSelect = queryShadow<HTMLSelectElement>(element, "#add-node");
    nodeSelect!.value = "3";
    nodeSelect!.dispatchEvent(new Event("change"));
    await elementUpdated(element);

    const epSelect = queryShadow<HTMLSelectElement>(element, "#add-endpoint");
    epSelect!.value = "1";
    epSelect!.dispatchEvent(new Event("change"));
    await elementUpdated(element);

    const addBtn = queryShadowAll<HTMLButtonElement>(element, "button").find(
      (b) => b.textContent?.trim() === "Add"
    );
    expect(addBtn!.disabled).toBe(true);
  });

  it("emits close when Close is clicked", async () => {
    element = await fixture(html`
      <matter-manage-group-dialog
        .open=${true}
        .group=${group}
        .availableNodes=${nodes}
      ></matter-manage-group-dialog>
    `);
    const { events } = captureEvents(element, "close");

    queryShadowAll<HTMLButtonElement>(element, "button")
      .find((b) => b.textContent?.includes("Close"))!
      .click();

    expect(events).toHaveLength(1);
  });
});

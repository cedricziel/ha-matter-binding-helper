/**
 * Tests for CreateGroupDialog component (two-step type-aware wizard).
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
} from "../../test-utils";

import "./create-group-dialog";
import type { CreateGroupDialog } from "./create-group-dialog";

const CLUSTER_ON_OFF = 0x0006;
const CLUSTER_LEVEL_CONTROL = 0x0008;
const CLUSTER_COLOR_CONTROL = 0x0300;
const CLUSTER_WINDOW_COVERING = 0x0102;

async function openDialog(): Promise<CreateGroupDialog> {
  return fixture(
    html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
  );
}

function clickButton(element: CreateGroupDialog, text: string) {
  queryShadowAll<HTMLButtonElement>(element, "button")
    .find((b) => b.textContent?.trim() === text)!
    .click();
}

/** Pick a category card by its visible label. */
function pickCategory(element: CreateGroupDialog, label: string) {
  queryShadowAll<HTMLButtonElement>(element, ".category-card")
    .find((b) => b.textContent?.includes(label))!
    .click();
}

/** Advance from step 1 to step 2 by choosing the "Lights" preset. */
async function gotoNameStep(element: CreateGroupDialog, label = "Lights") {
  pickCategory(element, label);
  await elementUpdated(element);
  clickButton(element, "Next");
  await elementUpdated(element);
}

async function setName(element: CreateGroupDialog, name: string) {
  const nameInput = queryShadow<HTMLInputElement>(element, "#group-name");
  nameInput!.value = name;
  nameInput!.dispatchEvent(new Event("input"));
  await elementUpdated(element);
}

describe("CreateGroupDialog", () => {
  let element: CreateGroupDialog;

  afterEach(() => {
    element?.remove();
  });

  it("renders nothing when closed", async () => {
    element = await fixture(
      html`<matter-create-group-dialog></matter-create-group-dialog>`
    );
    expect(queryShadow(element, ".dialog-overlay")).toBeNull();
  });

  describe("step 1 — choose type", () => {
    it("shows category presets and Custom, not the name field yet", async () => {
      element = await openDialog();
      const cards = queryShadowAll(element, ".category-card");
      const labels = cards.map((c) => c.textContent);
      expect(labels.some((l) => l?.includes("Lights"))).toBe(true);
      expect(labels.some((l) => l?.includes("Custom"))).toBe(true);
      // Name lives on step 2.
      expect(queryShadow(element, "#group-name")).toBeNull();
    });

    it("requires a category before advancing", async () => {
      element = await openDialog();
      clickButton(element, "Next");
      await elementUpdated(element);
      expect(queryShadow(element, ".error")).not.toBeNull();
      expect(queryShadow(element, "#group-name")).toBeNull();
    });

    it("requires a cluster when Custom is chosen", async () => {
      element = await openDialog();
      pickCategory(element, "Custom");
      await elementUpdated(element);
      clickButton(element, "Next");
      await elementUpdated(element);
      expect(queryShadow(element, ".error")).not.toBeNull();
      expect(queryShadow(element, "#group-name")).toBeNull();
    });
  });

  describe("step 2 — name & create", () => {
    it("emits create-group with the preset's clusters and trimmed name", async () => {
      element = await openDialog();
      const { events } = captureEvents(element, "create-group");

      await gotoNameStep(element, "Lights");
      await setName(element, "  Bedroom  ");
      clickButton(element, "Create");

      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({
        name: "Bedroom",
        clusters: [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_COLOR_CONTROL],
      });
    });

    it("emits a single custom cluster when Custom is chosen", async () => {
      element = await openDialog();
      const { events } = captureEvents(element, "create-group");

      pickCategory(element, "Custom");
      await elementUpdated(element);
      const select = queryShadow<HTMLSelectElement>(element, "#custom-cluster");
      select!.value = String(CLUSTER_WINDOW_COVERING);
      select!.dispatchEvent(new Event("change"));
      await elementUpdated(element);
      clickButton(element, "Next");
      await elementUpdated(element);

      await setName(element, "Blinds");
      clickButton(element, "Create");

      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({
        name: "Blinds",
        clusters: [CLUSTER_WINDOW_COVERING],
      });
    });

    it("shows an error and emits nothing for an empty name", async () => {
      element = await openDialog();
      const { events } = captureEvents(element, "create-group");

      await gotoNameStep(element);
      clickButton(element, "Create");
      await elementUpdated(element);

      expect(events).toHaveLength(0);
      expect(queryShadow(element, ".error")).not.toBeNull();
    });

    it("can go Back to change the type", async () => {
      element = await openDialog();
      await gotoNameStep(element);
      expect(queryShadow(element, "#group-name")).not.toBeNull();

      clickButton(element, "Back");
      await elementUpdated(element);
      expect(queryShadow(element, ".category-list")).not.toBeNull();
      expect(queryShadow(element, "#group-name")).toBeNull();
    });

    it("hides the group-id field until Advanced is checked", async () => {
      element = await openDialog();
      await gotoNameStep(element);
      expect(queryShadow(element, "#group-id")).toBeNull();

      const advanced = queryShadow<HTMLInputElement>(
        element,
        ".advanced-toggle input"
      );
      advanced!.checked = true;
      advanced!.dispatchEvent(new Event("change"));
      await elementUpdated(element);

      expect(queryShadow(element, "#group-id")).not.toBeNull();
      expect(queryShadow(element, ".note")).not.toBeNull();
    });

    it("emits the manual id alongside clusters when Advanced is set", async () => {
      element = await openDialog();
      const { events } = captureEvents(element, "create-group");

      await gotoNameStep(element, "Outlets");
      await setName(element, "Bedroom");

      const advanced = queryShadow<HTMLInputElement>(
        element,
        ".advanced-toggle input"
      );
      advanced!.checked = true;
      advanced!.dispatchEvent(new Event("change"));
      await elementUpdated(element);

      const idInput = queryShadow<HTMLInputElement>(element, "#group-id");
      idInput!.value = "100";
      idInput!.dispatchEvent(new Event("input"));
      await elementUpdated(element);

      clickButton(element, "Create");

      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({
        name: "Bedroom",
        clusters: [CLUSTER_ON_OFF],
        groupId: 100,
      });
    });

    it("rejects an out-of-range manual id", async () => {
      element = await openDialog();
      const { events } = captureEvents(element, "create-group");

      await gotoNameStep(element);
      await setName(element, "Bedroom");

      const advanced = queryShadow<HTMLInputElement>(
        element,
        ".advanced-toggle input"
      );
      advanced!.checked = true;
      advanced!.dispatchEvent(new Event("change"));
      await elementUpdated(element);

      const idInput = queryShadow<HTMLInputElement>(element, "#group-id");
      idInput!.value = "99999";
      idInput!.dispatchEvent(new Event("input"));
      await elementUpdated(element);

      clickButton(element, "Create");
      await elementUpdated(element);

      expect(events).toHaveLength(0);
      expect(queryShadow(element, ".error")).not.toBeNull();
    });
  });

  it("emits cancel when Cancel clicked on step 1", async () => {
    element = await openDialog();
    const { events } = captureEvents(element, "cancel");

    clickButton(element, "Cancel");

    expect(events).toHaveLength(1);
  });
});

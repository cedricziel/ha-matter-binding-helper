/**
 * Tests for CreateGroupDialog component.
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

describe("CreateGroupDialog", () => {
  let element: CreateGroupDialog;

  afterEach(() => {
    element?.remove();
  });

  it("renders nothing when closed", async () => {
    element = await fixture(html`<matter-create-group-dialog></matter-create-group-dialog>`);
    expect(queryShadow(element, ".dialog-overlay")).toBeNull();
  });

  it("renders only a name input when open (id is auto-allocated)", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    expect(queryShadow(element, "#group-id")).toBeNull();
    expect(queryShadow(element, "#group-name")).not.toBeNull();
  });

  it("emits create-group with just the trimmed name", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    const { events } = captureEvents(element, "create-group");

    const nameInput = queryShadow<HTMLInputElement>(element, "#group-name");
    nameInput!.value = "  Bedroom  ";
    nameInput!.dispatchEvent(new Event("input"));
    await elementUpdated(element);

    const buttons = queryShadowAll<HTMLButtonElement>(element, "button");
    buttons.find((b) => b.textContent?.includes("Create"))!.click();

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ name: "Bedroom" });
  });

  it("shows an error and emits nothing for an empty name", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    const { events } = captureEvents(element, "create-group");

    const buttons = queryShadowAll<HTMLButtonElement>(element, "button");
    buttons.find((b) => b.textContent?.includes("Create"))!.click();
    await elementUpdated(element);

    expect(events).toHaveLength(0);
    expect(queryShadow(element, ".error")).not.toBeNull();
  });

  it("hides the group-id field until Advanced is checked", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
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

  it("emits the manual id when Advanced is set with a valid id", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    const { events } = captureEvents(element, "create-group");

    const nameInput = queryShadow<HTMLInputElement>(element, "#group-name");
    nameInput!.value = "Bedroom";
    nameInput!.dispatchEvent(new Event("input"));

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

    const buttons = queryShadowAll<HTMLButtonElement>(element, "button");
    buttons.find((b) => b.textContent?.includes("Create"))!.click();

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ name: "Bedroom", groupId: 100 });
  });

  it("rejects an out-of-range manual id", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    const { events } = captureEvents(element, "create-group");

    const nameInput = queryShadow<HTMLInputElement>(element, "#group-name");
    nameInput!.value = "Bedroom";
    nameInput!.dispatchEvent(new Event("input"));

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

    queryShadowAll<HTMLButtonElement>(element, "button")
      .find((b) => b.textContent?.includes("Create"))!
      .click();
    await elementUpdated(element);

    expect(events).toHaveLength(0);
    expect(queryShadow(element, ".error")).not.toBeNull();
  });

  it("emits cancel when Cancel clicked", async () => {
    element = await fixture(
      html`<matter-create-group-dialog .open=${true}></matter-create-group-dialog>`
    );
    const { events } = captureEvents(element, "cancel");

    const buttons = queryShadowAll<HTMLButtonElement>(element, "button");
    buttons.find((b) => b.textContent?.includes("Cancel"))!.click();

    expect(events).toHaveLength(1);
  });
});

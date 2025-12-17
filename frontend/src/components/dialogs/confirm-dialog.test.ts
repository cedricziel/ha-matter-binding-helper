/**
 * Tests for ConfirmDialog component
 *
 * Test-first development: Define expected behavior before implementation.
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
} from "../../test-utils";

// Import component (will be created after tests)
import "./confirm-dialog";
import type { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  let element: ConfirmDialog;

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders title and message", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Delete Item"
          message="Are you sure you want to delete this item?"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const text = element.shadowRoot?.textContent;
      expect(text).toContain("Delete Item");
      expect(text).toContain("Are you sure you want to delete this item?");
    });

    it("shows custom confirm button text", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
          confirmLabel="Yes, Delete"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const confirmBtn = queryShadow(element, ".btn-primary");
      expect(confirmBtn?.textContent?.trim()).toBe("Yes, Delete");
    });

    it("shows custom cancel button text", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
          cancelLabel="Go Back"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary");
      expect(cancelBtn?.textContent?.trim()).toBe("Go Back");
    });

    it("renders warning variant with appropriate styling", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Warning"
          variant="warning"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const dialog = queryShadow(element, ".dialog");
      expect(dialog?.classList.contains("variant-warning")).toBe(true);
    });

    it("renders danger variant with appropriate styling", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Delete"
          variant="danger"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const dialog = queryShadow(element, ".dialog");
      expect(dialog?.classList.contains("variant-danger")).toBe(true);
    });

    it("renders icon when provided", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
          icon="🗑️"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const icon = queryShadow(element, ".confirm-icon");
      expect(icon?.textContent).toContain("🗑️");
    });
  });

  describe("visibility", () => {
    it("is hidden when open is false", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${false}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeFalsy();
    });

    it("is visible when open is true", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeTruthy();
    });
  });

  describe("events", () => {
    it("dispatches confirm event on confirm click", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "confirm");

      const confirmBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      confirmBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches cancel event on cancel click", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "cancel");

      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;
      cancelBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches cancel event on overlay click", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "cancel");

      const overlay = queryShadow(element, ".dialog-overlay") as HTMLElement;
      overlay?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("does not dispatch cancel on dialog body click", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "cancel");

      const dialog = queryShadow(element, ".dialog") as HTMLElement;
      dialog?.click();

      expect(events).toHaveLength(0);

      cleanup();
    });
  });

  describe("disabled states", () => {
    it("disables buttons when loading is true", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
          .loading=${true}
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const confirmBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;

      expect(confirmBtn?.disabled).toBe(true);
      expect(cancelBtn?.disabled).toBe(true);
    });

    it("shows loading state on confirm button", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog
          .open=${true}
          title="Test"
          .loading=${true}
        ></matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const confirmBtn = queryShadow(element, ".btn-primary");
      expect(confirmBtn?.classList.contains("btn-loading")).toBe(true);
    });
  });

  describe("slots", () => {
    it("renders custom content slot", async () => {
      element = await fixture<ConfirmDialog>(html`
        <matter-confirm-dialog .open=${true} title="Test">
          <div slot="content" class="custom-content">Custom Content Here</div>
        </matter-confirm-dialog>
      `);

      await elementUpdated(element);

      const slot = queryShadow(element, 'slot[name="content"]');
      expect(slot).toBeTruthy();
    });
  });
});

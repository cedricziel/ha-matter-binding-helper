/**
 * Tests for OperationProgressDialog component
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
} from "../../test-utils";

// Import component
import "./operation-progress-dialog";
import type { OperationProgressDialog } from "./operation-progress-dialog";
import type { OperationProgressState } from "../../types";

describe("OperationProgressDialog", () => {
  let element: OperationProgressDialog;

  const pendingProgress: OperationProgressState = {
    title: "Removing Binding",
    steps: [
      { label: "Removing binding from device", status: "pending" },
      { label: "Cleaning up ACL entry", status: "pending" },
    ],
    currentStepIndex: 0,
    canCancel: false,
    completed: false,
  };

  const inProgressState: OperationProgressState = {
    title: "Removing Binding",
    steps: [
      { label: "Removing binding from device", status: "in_progress" },
      { label: "Cleaning up ACL entry", status: "pending" },
    ],
    currentStepIndex: 0,
    canCancel: false,
    completed: false,
  };

  const completedProgress: OperationProgressState = {
    title: "Binding Removed",
    steps: [
      { label: "Removing binding from device", status: "success" },
      { label: "Cleaning up ACL entry", status: "success" },
    ],
    currentStepIndex: 1,
    canCancel: false,
    completed: true,
  };

  const errorProgress: OperationProgressState = {
    title: "Operation Failed",
    steps: [
      { label: "Removing binding from device", status: "error", message: "Device unreachable" },
    ],
    currentStepIndex: 0,
    canCancel: false,
    completed: true,
    error: "Failed to communicate with device",
  };

  const cancellableProgress: OperationProgressState = {
    title: "Repairing ACL Permissions",
    steps: [
      { label: "Step 1", status: "success" },
      { label: "Step 2", status: "pending" },
    ],
    currentStepIndex: 1,
    canCancel: true,
    completed: false,
  };

  afterEach(() => {
    element?.remove();
  });

  describe("visibility", () => {
    it("renders nothing when open is false", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${false}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeFalsy();
    });

    it("renders dialog when open is true", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeTruthy();
    });

    it("renders nothing when progress is null", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${null}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeFalsy();
    });
  });

  describe("rendering", () => {
    it("renders dialog title", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".dialog-header");
      expect(header?.textContent).toContain("Removing Binding");
    });

    it("renders all operation steps", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const steps = queryShadowAll(element, ".operation-step");
      expect(steps.length).toBe(2);
    });

    it("shows step labels", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const content = element.shadowRoot?.textContent;
      expect(content).toContain("Removing binding from device");
      expect(content).toContain("Cleaning up ACL entry");
    });
  });

  describe("step status icons", () => {
    it("shows pending icon for pending steps", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${pendingProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const icons = queryShadowAll(element, ".step-icon");
      expect(icons[0]?.textContent?.trim()).toBe("○");
    });

    it("shows loading icon for in_progress steps", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${inProgressState}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const icons = queryShadowAll(element, ".step-icon");
      expect(icons[0]?.textContent?.trim()).toBe("⏳");
    });

    it("shows success icon for completed steps", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${completedProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const icons = queryShadowAll(element, ".step-icon");
      expect(icons[0]?.textContent?.trim()).toBe("✓");
    });

    it("shows error icon for failed steps", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${errorProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const icon = queryShadow(element, ".step-icon");
      expect(icon?.textContent?.trim()).toBe("✗");
    });
  });

  describe("completion state", () => {
    it("shows hint when not completed", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${inProgressState}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const hint = queryShadow(element, ".operation-hint");
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toContain("Communicating with Matter device");
    });

    it("hides hint when completed", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${completedProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const hint = queryShadow(element, ".operation-hint");
      expect(hint).toBeFalsy();
    });

    it("shows Done button when completed", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${completedProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const doneBtn = queryShadow(element, ".btn-primary");
      expect(doneBtn?.textContent).toContain("Done");
    });

    it("shows error message when error present", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${errorProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const error = queryShadow(element, ".operation-error");
      expect(error?.textContent).toContain("Failed to communicate");
    });
  });

  describe("cancellation", () => {
    it("shows Cancel button when canCancel is true", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${cancellableProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary");
      expect(cancelBtn?.textContent).toContain("Cancel");
    });

    it("hides Cancel button when canCancel is false", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${inProgressState}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary");
      expect(cancelBtn).toBeFalsy();
    });
  });

  describe("events", () => {
    it("dispatches close event when Done clicked", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${completedProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "close");

      const doneBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      doneBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });

    it("dispatches cancel event when Cancel clicked", async () => {
      element = await fixture<OperationProgressDialog>(html`
        <matter-operation-progress-dialog
          .open=${true}
          .progress=${cancellableProgress}
        ></matter-operation-progress-dialog>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "cancel");

      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;
      cancelBtn?.click();

      expect(events).toHaveLength(1);
      cleanup();
    });
  });
});

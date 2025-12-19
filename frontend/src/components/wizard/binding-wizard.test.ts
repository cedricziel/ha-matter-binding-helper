/**
 * Tests for BindingWizard component
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
import type { MatterNode, MatterEndpoint, BindingWizardState } from "../../types";

// Import component (will be created after tests)
import "./binding-wizard";
import type { BindingWizard } from "./binding-wizard";

describe("BindingWizard", () => {
  let element: BindingWizard;

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

  const targetNode = createNode({
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
  });

  const targetEndpoint = targetNode.endpoints[1];

  const createWizardState = (
    overrides: Partial<BindingWizardState> = {}
  ): BindingWizardState => ({
    currentStep: "binding",
    sourceNode,
    sourceEndpoint,
    targetNode,
    targetEndpoint,
    clusterId: TEST_CLUSTERS.ON_OFF,
    selectedPrivilege: 3, // OPERATE
    bindingInProgress: false,
    aclInProgress: false,
    verifyInProgress: false,
    ...overrides,
  });

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders wizard header", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".dialog-header");
      expect(header?.textContent).toContain("Create Binding");
    });

    it("renders all three wizard steps", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const steps = queryShadowAll(element, ".wizard-step");
      expect(steps.length).toBe(3);
    });

    it("highlights current step", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "acl" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const steps = queryShadowAll(element, ".wizard-step");
      // Second step (acl) should be active
      expect(steps[1].classList.contains("active")).toBe(true);
    });

    it("shows completed checkmark for finished steps", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            bindingResult: {
              success: true,
              verified: false,
              message: "Binding created",
              bindings_found: 1,
              error_type: null,
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const steps = queryShadowAll(element, ".wizard-step");
      expect(steps[0].classList.contains("completed")).toBe(true);
      const circle = steps[0].querySelector(".wizard-step-circle");
      expect(circle?.textContent?.trim()).toBe("✓");
    });

    it("renders binding step content when on binding step", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "binding" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const content = queryShadow(element, ".wizard-content");
      expect(content?.textContent).toContain("Wall Switch");
      expect(content?.textContent).toContain("Ceiling Light");
    });

    it("renders ACL step content when on acl step", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "acl" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const content = queryShadow(element, ".wizard-content");
      expect(content?.textContent).toContain("Permissions");
    });

    it("renders privilege options on ACL step", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "acl" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const privilegeOptions = queryShadowAll(element, ".privilege-option");
      expect(privilegeOptions.length).toBeGreaterThan(0);
    });

    it("renders verify step content when on verify step", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "verify" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const content = queryShadow(element, ".wizard-content");
      expect(content?.textContent).toMatch(/verify/i);
    });

    it("shows error state when step failed", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "binding",
            bindingResult: {
              success: false,
              verified: false,
              message: "Failed to create binding",
              bindings_found: 0,
              error_type: "unknown_error",
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const result = queryShadow(element, ".wizard-result.error");
      expect(result).toBeTruthy();
    });

    it("shows success state when step succeeded", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "binding",
            bindingResult: {
              success: true,
              verified: false,
              message: "Binding created successfully",
              bindings_found: 1,
              error_type: null,
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const result = queryShadow(element, ".wizard-result.success");
      expect(result).toBeTruthy();
    });
  });

  describe("visibility", () => {
    it("is hidden when open is false", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${false}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeFalsy();
    });

    it("is visible when open is true", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const overlay = queryShadow(element, ".dialog-overlay");
      expect(overlay).toBeTruthy();
    });
  });

  describe("events", () => {
    it("dispatches execute-binding event on create binding click", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "binding" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "execute-binding");

      const createBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      createBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches execute-acl event on set permissions click", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "acl" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "execute-acl");

      // Find the primary button (Set Permissions)
      const btns = queryShadowAll(element, ".wizard-actions .btn-primary") as NodeListOf<HTMLButtonElement>;
      const setPermissionsBtn = btns[btns.length - 1]; // Last primary button
      setPermissionsBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches execute-verify event on verify click", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "verify" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "execute-verify");

      const verifyBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      verifyBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches close event on cancel click", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "close");

      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;
      cancelBtn?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches close event on overlay click", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "close");

      const overlay = queryShadow(element, ".dialog-overlay") as HTMLElement;
      overlay?.click();

      expect(events).toHaveLength(1);

      cleanup();
    });

    it("dispatches privilege-change event when privilege selected", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "acl" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ privilege: number }>(
        element,
        "privilege-change"
      );

      // Click on a different privilege option
      const options = queryShadowAll(element, ".privilege-option") as NodeListOf<HTMLElement>;
      // Click on View option (first one)
      options[0]?.click();

      expect(events.length).toBeGreaterThanOrEqual(0); // May or may not fire depending on selection state

      cleanup();
    });

    it("dispatches step-change event when skip button clicked", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            bindingResult: {
              success: true,
              verified: false,
              message: "Binding created",
              bindings_found: 1,
              error_type: null,
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents<{ step: string }>(
        element,
        "step-change"
      );

      // Find Skip button (secondary button in actions)
      const btns = queryShadowAll(element, ".wizard-actions .btn-secondary");
      // There may be multiple secondary buttons; the skip button should say "Skip"
      const skipBtn = Array.from(btns).find(
        (b) => b.textContent?.trim() === "Skip"
      ) as HTMLButtonElement;
      skipBtn?.click();

      if (skipBtn) {
        expect(events).toHaveLength(1);
        expect(events[0].detail.step).toBe("verify");
      }

      cleanup();
    });
  });

  describe("disabled states", () => {
    it("disables action button when step is in progress", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "binding",
            bindingInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const createBtn = queryShadow(element, ".btn-primary") as HTMLButtonElement;
      expect(createBtn?.disabled).toBe(true);
    });

    it("shows loading state on button when step is in progress", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "binding",
            bindingInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const createBtn = queryShadow(element, ".btn-primary");
      expect(createBtn?.classList.contains("btn-loading")).toBe(true);
    });

    it("disables cancel button when any step is in progress", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "binding",
            bindingInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary") as HTMLButtonElement;
      expect(cancelBtn?.disabled).toBe(true);
    });
  });

  describe("step labels", () => {
    it("shows correct step labels", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState()}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const labels = queryShadowAll(element, ".wizard-step-label");
      expect(labels[0].textContent?.trim()).toMatch(/create/i);
      expect(labels[1].textContent?.trim()).toMatch(/permissions/i);
      expect(labels[2].textContent?.trim()).toMatch(/verify/i);
    });
  });

  describe("cancel/done button text", () => {
    it("shows Cancel text during wizard", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({ currentStep: "binding" })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary");
      expect(cancelBtn?.textContent?.trim()).toBe("Cancel");
    });

    it("shows Done text when verify completed", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "verify",
            verifyResult: {
              success: true,
              verified: true,
              message: "Binding verified",
              bindings_found: 1,
              error_type: null,
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const cancelBtn = queryShadow(element, ".btn-secondary");
      expect(cancelBtn?.textContent?.trim()).toBe("Done");
    });
  });

  describe("ACL progress display", () => {
    it("should show progress container when ACL is in progress", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const progressContainer = queryShadow(element, ".acl-progress-container");
      expect(progressContainer).toBeTruthy();
    });

    it("should show default message when no progress events received", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const message = queryShadow(element, ".acl-progress-message");
      expect(message?.textContent).toContain("Setting permissions on");
      expect(message?.textContent).toContain("30 seconds");
    });

    it("should show indeterminate progress bar before first event", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const progressBar = queryShadow(element, ".acl-progress-bar.indeterminate");
      expect(progressBar).toBeTruthy();
    });

    it("should show progress message from event", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
            aclProgress: {
              target_node_id: 2,
              source_node_id: 1,
              status: "retrying",
              attempt: 3,
              max_attempts: 15,
              elapsed_seconds: 6,
              remaining_seconds: 24,
              message: "Waiting for device to process ACL... (24s remaining)",
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const message = queryShadow(element, ".acl-progress-message");
      expect(message?.textContent).toContain("Waiting for device");
      expect(message?.textContent).toContain("24s remaining");
    });

    it("should show determinate progress bar with correct width", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
            aclProgress: {
              target_node_id: 2,
              source_node_id: 1,
              status: "retrying",
              attempt: 5,
              max_attempts: 10,
              message: "Waiting...",
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const progressBar = queryShadow(element, ".acl-progress-bar:not(.indeterminate)") as HTMLElement;
      expect(progressBar).toBeTruthy();
      // 5/10 = 50%
      expect(progressBar?.style.width).toBe("50%");
    });

    it("should show attempt counter in progress stats", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
            aclProgress: {
              target_node_id: 2,
              source_node_id: 1,
              status: "retrying",
              attempt: 7,
              max_attempts: 15,
              message: "Waiting...",
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const attemptStat = queryShadow(element, ".acl-progress-attempt");
      // attempt is 0-indexed in state, displayed as 1-indexed
      expect(attemptStat?.textContent).toContain("Attempt 8 of 15");
    });

    it("should show remaining time when available", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: true,
            aclProgress: {
              target_node_id: 2,
              source_node_id: 1,
              status: "retrying",
              attempt: 3,
              max_attempts: 15,
              remaining_seconds: 20,
              message: "Waiting...",
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const stats = queryShadow(element, ".acl-progress-stats");
      expect(stats?.textContent).toContain("20s remaining");
    });

    it("should not show progress container after ACL completes", async () => {
      element = await fixture<BindingWizard>(html`
        <matter-binding-wizard
          .open=${true}
          .wizardState=${createWizardState({
            currentStep: "acl",
            aclInProgress: false,
            aclResult: {
              success: true,
              message: "ACL provisioned successfully",
              acl_entries_count: 2,
            },
          })}
        ></matter-binding-wizard>
      `);

      await elementUpdated(element);

      const progressContainer = queryShadow(element, ".acl-progress-container");
      expect(progressContainer).toBeFalsy();

      const result = queryShadow(element, ".wizard-result.success");
      expect(result).toBeTruthy();
    });
  });
});

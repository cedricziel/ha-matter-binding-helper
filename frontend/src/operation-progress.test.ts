/**
 * Tests for Operation Progress State types and logic
 */

import { describe, it, expect } from "vitest";
import type { OperationProgressState, OperationStep, OperationStepStatus } from "./types";

describe("OperationProgressState", () => {
  it("initializes with pending steps", () => {
    const state: OperationProgressState = {
      title: "Test Operation",
      steps: [
        { label: "Step 1", status: "pending" },
        { label: "Step 2", status: "pending" },
      ],
      currentStepIndex: 0,
      canCancel: false,
      completed: false,
    };
    expect(state.steps.every((s) => s.status === "pending")).toBe(true);
    expect(state.completed).toBe(false);
  });

  it("tracks step progression correctly", () => {
    const steps: OperationStep[] = [
      { label: "Step 1", status: "success" },
      { label: "Step 2", status: "in_progress" },
      { label: "Step 3", status: "pending" },
    ];
    const inProgressIndex = steps.findIndex((s) => s.status === "in_progress");
    expect(inProgressIndex).toBe(1);
    expect(steps[0].status).toBe("success");
    expect(steps[2].status).toBe("pending");
  });

  it("handles error state", () => {
    const state: OperationProgressState = {
      title: "Failed Operation",
      steps: [{ label: "Step 1", status: "error", message: "Device unreachable" }],
      currentStepIndex: 0,
      canCancel: false,
      completed: true,
      error: "Operation failed",
    };
    expect(state.completed).toBe(true);
    expect(state.error).toBeDefined();
    expect(state.steps[0].message).toBe("Device unreachable");
  });

  it("supports cancellation flag", () => {
    const state: OperationProgressState = {
      title: "Cancellable Operation",
      steps: [
        { label: "Step 1", status: "success" },
        { label: "Step 2", status: "pending" },
      ],
      currentStepIndex: 1,
      canCancel: true,
      completed: false,
    };
    expect(state.canCancel).toBe(true);
  });

  it("marks skipped steps correctly", () => {
    const steps: OperationStep[] = [
      { label: "Step 1", status: "success" },
      { label: "Step 2", status: "skipped" },
      { label: "Step 3", status: "skipped" },
    ];
    const skippedCount = steps.filter((s) => s.status === "skipped").length;
    expect(skippedCount).toBe(2);
  });
});

describe("OperationStep", () => {
  it("supports all status values", () => {
    const statuses: OperationStepStatus[] = ["pending", "in_progress", "success", "error", "skipped"];

    const steps: OperationStep[] = statuses.map((status, i) => ({
      label: `Step ${i + 1}`,
      status,
    }));

    expect(steps.length).toBe(5);
    statuses.forEach((status, i) => {
      expect(steps[i].status).toBe(status);
    });
  });

  it("includes optional message field", () => {
    const stepWithMessage: OperationStep = {
      label: "Step with message",
      status: "error",
      message: "Connection timeout",
    };

    const stepWithoutMessage: OperationStep = {
      label: "Step without message",
      status: "success",
    };

    expect(stepWithMessage.message).toBe("Connection timeout");
    expect(stepWithoutMessage.message).toBeUndefined();
  });
});

describe("Operation Progress Workflow", () => {
  it("simulates delete binding progress flow", () => {
    // Initial state
    let state: OperationProgressState = {
      title: "Removing Binding",
      steps: [
        { label: "Removing binding from device", status: "pending" },
        { label: "Cleaning up ACL entry", status: "pending" },
      ],
      currentStepIndex: 0,
      canCancel: false,
      completed: false,
    };

    // Step 1: in progress
    state = {
      ...state,
      steps: [
        { ...state.steps[0], status: "in_progress" },
        state.steps[1],
      ],
    };
    expect(state.steps[0].status).toBe("in_progress");

    // Step 1: success
    state = {
      ...state,
      steps: [
        { ...state.steps[0], status: "success" },
        state.steps[1],
      ],
      currentStepIndex: 1,
    };
    expect(state.steps[0].status).toBe("success");

    // Step 2: in progress
    state = {
      ...state,
      steps: [
        state.steps[0],
        { ...state.steps[1], status: "in_progress" },
      ],
    };
    expect(state.steps[1].status).toBe("in_progress");

    // Step 2: success, completed
    state = {
      ...state,
      steps: [
        state.steps[0],
        { ...state.steps[1], status: "success" },
      ],
      completed: true,
    };
    expect(state.steps[1].status).toBe("success");
    expect(state.completed).toBe(true);
  });

  it("simulates bulk repair with cancellation", () => {
    // Initial state with 3 steps
    let state: OperationProgressState = {
      title: "Repairing 3 ACL Permissions",
      steps: [
        { label: "Provisioning ACL on Device A", status: "pending" },
        { label: "Provisioning ACL on Device B", status: "pending" },
        { label: "Provisioning ACL on Device C", status: "pending" },
      ],
      currentStepIndex: 0,
      canCancel: true,
      completed: false,
    };

    // Complete first step
    state = {
      ...state,
      steps: [
        { ...state.steps[0], status: "success" },
        ...state.steps.slice(1),
      ],
      currentStepIndex: 1,
    };

    // User cancels - skip remaining steps
    state = {
      ...state,
      steps: state.steps.map((step) =>
        step.status === "pending" ? { ...step, status: "skipped" as const } : step
      ),
      completed: true,
      error: "Operation cancelled by user",
    };

    expect(state.steps[0].status).toBe("success");
    expect(state.steps[1].status).toBe("skipped");
    expect(state.steps[2].status).toBe("skipped");
    expect(state.completed).toBe(true);
    expect(state.error).toContain("cancelled");
  });

  it("simulates single step repair", () => {
    let state: OperationProgressState = {
      title: "Repairing ACL Permission",
      steps: [
        { label: "Provisioning ACL on Target Device", status: "pending" },
      ],
      currentStepIndex: 0,
      canCancel: false,
      completed: false,
    };

    // Start operation
    state = {
      ...state,
      steps: [{ ...state.steps[0], status: "in_progress" }],
    };

    // Complete successfully
    state = {
      ...state,
      steps: [{ ...state.steps[0], status: "success" }],
      completed: true,
    };

    expect(state.steps[0].status).toBe("success");
    expect(state.completed).toBe(true);
    expect(state.error).toBeUndefined();
  });
});

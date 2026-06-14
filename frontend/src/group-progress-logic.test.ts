import { describe, it, expect } from "vitest";
import {
  groupProgressStepStatus,
  isRelevantGroupProgress,
} from "./group-progress-logic";
import type { GroupProgressEvent } from "./types";

describe("groupProgressStepStatus", () => {
  it("maps provisioning to in_progress", () => {
    expect(groupProgressStepStatus("provisioning")).toBe("in_progress");
  });
  it("maps success to success", () => {
    expect(groupProgressStepStatus("success")).toBe("success");
  });
  it("maps failed to error", () => {
    expect(groupProgressStepStatus("failed")).toBe("error");
  });
});

describe("isRelevantGroupProgress", () => {
  const event: GroupProgressEvent = {
    group_id: 5,
    source_node_id: 4,
    cluster_id: 6,
    status: "provisioning",
    message: "…",
  };

  it("matches the active source + group", () => {
    expect(isRelevantGroupProgress(event, 4, 5)).toBe(true);
  });
  it("ignores a different source node", () => {
    expect(isRelevantGroupProgress(event, 9, 5)).toBe(false);
  });
  it("ignores a different group", () => {
    expect(isRelevantGroupProgress(event, 4, 6)).toBe(false);
  });
});

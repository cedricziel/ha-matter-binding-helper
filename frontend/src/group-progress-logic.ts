/**
 * Pure helpers for surfacing group provisioning progress (EVENT_GROUP_PROGRESS).
 */

import type {
  GroupProgressEvent,
  GroupProgressStatus,
  OperationStepStatus,
} from "./types";

/** Map a group provisioning status to an operation-progress step status. */
export function groupProgressStepStatus(
  status: GroupProgressStatus
): OperationStepStatus {
  switch (status) {
    case "failed":
      return "error";
    case "success":
      return "success";
    default:
      return "in_progress";
  }
}

/** Whether a progress event belongs to the binding being created right now. */
export function isRelevantGroupProgress(
  event: GroupProgressEvent,
  sourceNodeId: number,
  groupId: number
): boolean {
  return event.source_node_id === sourceNodeId && event.group_id === groupId;
}

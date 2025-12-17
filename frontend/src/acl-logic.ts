/**
 * ACL (Access Control List) logic for binding wizard
 *
 * Provides helper functions for determining recommended ACL privilege levels
 * based on cluster type.
 */

import {
  ACL_PRIVILEGE_OPERATE,
  CLUSTER_ON_OFF,
  CLUSTER_LEVEL_CONTROL,
  CLUSTER_COLOR_CONTROL,
  CLUSTER_THERMOSTAT,
  CLUSTER_SCENES,
} from "./types";

// Door Lock cluster ID
const CLUSTER_DOOR_LOCK = 0x0101;

// Re-export privilege constants for convenience
export { ACL_PRIVILEGE_VIEW, ACL_PRIVILEGE_OPERATE, ACL_PRIVILEGE_MANAGE } from "./types";

/**
 * Maps cluster IDs to recommended ACL privilege levels.
 * Most control clusters require OPERATE privilege.
 */
export const CLUSTER_PRIVILEGE_MAP: Record<number, number> = {
  [CLUSTER_ON_OFF]: ACL_PRIVILEGE_OPERATE,
  [CLUSTER_LEVEL_CONTROL]: ACL_PRIVILEGE_OPERATE,
  [CLUSTER_COLOR_CONTROL]: ACL_PRIVILEGE_OPERATE,
  [CLUSTER_THERMOSTAT]: ACL_PRIVILEGE_OPERATE,
  [CLUSTER_SCENES]: ACL_PRIVILEGE_OPERATE,
  [CLUSTER_DOOR_LOCK]: ACL_PRIVILEGE_OPERATE,
};

/**
 * Default privilege level for clusters not in the map.
 */
export const DEFAULT_CLUSTER_PRIVILEGE = ACL_PRIVILEGE_OPERATE;

/**
 * Get the recommended ACL privilege level for a given cluster.
 *
 * @param clusterId - The Matter cluster ID
 * @returns The recommended privilege level (defaults to OPERATE)
 */
export function getRecommendedPrivilege(clusterId: number): number {
  return CLUSTER_PRIVILEGE_MAP[clusterId] ?? DEFAULT_CLUSTER_PRIVILEGE;
}

/**
 * Privilege options for the wizard UI.
 */
export interface PrivilegeOption {
  value: number;
  label: string;
  description: string;
}

/**
 * Available privilege options for the binding wizard.
 * Note: VIEW is included for read-only sensor bindings,
 * OPERATE for most control scenarios.
 */
export const PRIVILEGE_OPTIONS: PrivilegeOption[] = [
  {
    value: 1, // ACL_PRIVILEGE_VIEW
    label: "View",
    description: "Read-only access to device state",
  },
  {
    value: 3, // ACL_PRIVILEGE_OPERATE
    label: "Operate",
    description: "Control the device (on/off, level, etc.)",
  },
  {
    value: 4, // ACL_PRIVILEGE_MANAGE
    label: "Manage",
    description: "Configure device settings",
  },
];

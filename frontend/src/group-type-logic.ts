/**
 * Group-type logic.
 *
 * Matter groups are untyped 16-bit multicast addresses on the wire — the device
 * has no notion of "this is a lighting group". The integration's registry is the
 * *only* type authority: each group records the clusters it is meant to control.
 *
 * These pure helpers turn that cluster set into the three things the UI needs:
 *   1. a small set of friendly presets for the create wizard ("what will this
 *      control?"), plus a Custom escape hatch;
 *   2. member-endpoint compatibility filtering (only offer endpoints that can
 *      actually speak one of the group's clusters);
 *   3. a sensible default cluster for a groupcast binding to the group.
 *
 * Kept dependency-free (no Lit) so it is unit-testable in isolation, mirroring
 * group-progress-logic.ts.
 */

import {
  CLUSTER_ON_OFF,
  CLUSTER_LEVEL_CONTROL,
  CLUSTER_COLOR_CONTROL,
  CLUSTER_WINDOW_COVERING,
  getClusterName,
} from "./types";
import type { MatterEndpoint, MatterGroup } from "./types";

/** A preset answer to "what will this group control?". */
export interface GroupCategory {
  id: string;
  label: string;
  description: string;
  /** The clusters a member of this group is controlled through. */
  clusters: number[];
}

/** The Custom category id — user picks a single cluster instead of a preset. */
export const CUSTOM_CATEGORY_ID = "custom";

/**
 * Built-in presets. Ordered most-common-first. "Custom" is intentionally not in
 * this list; it's handled as an escape hatch by the dialog.
 */
export const GROUP_CATEGORIES: GroupCategory[] = [
  {
    id: "lights",
    label: "Lights",
    description: "On/off, brightness and color control",
    clusters: [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_COLOR_CONTROL],
  },
  {
    id: "outlets",
    label: "Outlets & switches",
    description: "On/off control only",
    clusters: [CLUSTER_ON_OFF],
  },
  {
    id: "covers",
    label: "Window coverings",
    description: "Blinds, shades and shutters",
    clusters: [CLUSTER_WINDOW_COVERING],
  },
];

/** The clusters a group controls (empty array for untyped / legacy groups). */
export function groupControlClusters(
  group: Pick<MatterGroup, "clusters">
): number[] {
  return group.clusters ?? [];
}

/**
 * Whether an endpoint can be a member of a group with the given control clusters.
 *
 * An endpoint is compatible if it exposes at least one of the group's clusters as
 * a *server* cluster (i.e. it can be commanded on it). An untyped group (no
 * clusters) matches every endpoint, preserving legacy behaviour.
 */
export function endpointMatchesGroup(
  endpoint: Pick<MatterEndpoint, "server_clusters">,
  clusters: number[]
): boolean {
  if (clusters.length === 0) {
    return true;
  }
  return clusters.some((c) => endpoint.server_clusters.includes(c));
}

/**
 * A friendly label for a group's type: the matching preset name if the cluster
 * set is exactly a preset, otherwise the cluster names, otherwise "Any type".
 */
export function groupTypeLabel(clusters: number[]): string {
  if (clusters.length === 0) {
    return "Any type";
  }
  const preset = GROUP_CATEGORIES.find(
    (c) =>
      c.clusters.length === clusters.length &&
      c.clusters.every((x) => clusters.includes(x))
  );
  if (preset) {
    return preset.label;
  }
  return clusters.map((c) => getClusterName(c)).join(", ");
}

/**
 * The cluster a groupcast binding to this group should default to: the group's
 * primary (first) control cluster, or null if untyped.
 */
export function groupDefaultCluster(clusters: number[]): number | null {
  return clusters.length > 0 ? clusters[0] : null;
}

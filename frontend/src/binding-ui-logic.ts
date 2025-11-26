/**
 * Pure functions for binding UI logic
 * Extracted for testability
 */

import type { MatterNode, MatterEndpoint } from './types';

/**
 * Filter endpoints to exclude root node (endpoint 0) and those without server clusters
 */
export function filterValidTargetEndpoints(endpoints: MatterEndpoint[]): MatterEndpoint[] {
  return endpoints.filter(
    (ep) =>
      ep.endpoint_id !== 0 && // Exclude root node endpoint
      ep.server_clusters &&
      ep.server_clusters.length > 0
  );
}

/**
 * Get the first valid target endpoint from a node
 * Returns null if no valid endpoints found
 */
export function getFirstValidTargetEndpoint(
  node: MatterNode
): MatterEndpoint | null {
  const validEndpoints = filterValidTargetEndpoints(node.endpoints);
  return validEndpoints.length > 0 ? validEndpoints[0] : null;
}

/**
 * Count compatible clusters between source client clusters and target endpoint
 */
export function countCompatibleClusters(
  sourceClientClusters: number[],
  targetEndpoint: MatterEndpoint
): number {
  const targetServerClusters = targetEndpoint.server_clusters || [];
  return sourceClientClusters.filter((c) => targetServerClusters.includes(c)).length;
}

/**
 * Find the first valid target node (excluding source node) with valid endpoints
 */
export function findFirstValidTargetNode(
  nodes: MatterNode[],
  sourceNodeId: number
): MatterNode | null {
  const availableTargets = nodes.filter((n) => n.node_id !== sourceNodeId);

  // Find first node that has at least one valid endpoint
  for (const node of availableTargets) {
    const validEndpoints = filterValidTargetEndpoints(node.endpoints);
    if (validEndpoints.length > 0) {
      return node;
    }
  }

  return availableTargets.length > 0 ? availableTargets[0] : null;
}

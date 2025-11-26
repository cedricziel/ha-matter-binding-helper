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

/**
 * Infrastructure clusters that should be filtered out when showing control capabilities
 * These are protocol-level clusters that don't represent user-facing control functionality
 */
const INFRASTRUCTURE_CLUSTERS = [
  0x001d, // Descriptor
  0x0028, // Basic Information
  0x001e, // Binding (don't show as "can control")
  0x0003, // Identify
  0x0004, // Groups
  0x001f, // Access Control
  0x0029, // OTA Software Update Requestor
  0x002a, // Localization Configuration
  0x002b, // Time Format Localization
  0x002c, // Unit Localization
  0x0030, // Power Source Configuration
  0x0031, // Power Source
  0x003c, // General Commissioning
  0x003e, // Network Commissioning
  0x003f, // Diagnostic Logs
  0x0033, // General Diagnostics
  0x0034, // Software Diagnostics
  0x0035, // Thread Network Diagnostics
  0x0036, // WiFi Network Diagnostics
  0x0037, // Ethernet Network Diagnostics
  0x003b, // Switch (this is a server cluster for switches)
];

/**
 * Filter out infrastructure clusters to show only user-facing control capabilities
 * Used to display what an endpoint can control
 */
export function filterControlClusters(clusterIds: number[]): number[] {
  return clusterIds.filter((c) => !INFRASTRUCTURE_CLUSTERS.includes(c));
}

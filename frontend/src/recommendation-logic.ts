/**
 * Pure functions for computing binding recommendations
 * Extracted for testability
 */

import type { MatterNode, BindingWithContext, BindingRecommendation } from './types';

/**
 * Compute binding recommendations based on available nodes and existing bindings
 */
export function computeBindingRecommendations(
  nodes: MatterNode[],
  allBindings: BindingWithContext[]
): BindingRecommendation[] {
  const recommendations: BindingRecommendation[] = [];

  // Find all endpoints that can create bindings (have client clusters)
  for (const sourceNode of nodes) {
    for (const sourceEndpoint of sourceNode.endpoints) {
      const sourceClientClusters = sourceEndpoint.client_clusters || [];
      if (sourceClientClusters.length === 0 || !sourceEndpoint.has_binding_cluster) {
        continue;
      }

      // Find potential targets (endpoints with matching server clusters)
      for (const targetNode of nodes) {
        for (const targetEndpoint of targetNode.endpoints) {
          // Skip same endpoint
          if (sourceNode.node_id === targetNode.node_id &&
              sourceEndpoint.endpoint_id === targetEndpoint.endpoint_id) {
            continue;
          }

          const targetServerClusters = targetEndpoint.server_clusters || [];
          const compatibleClusters = sourceClientClusters.filter((c) =>
            targetServerClusters.includes(c)
          );

          if (compatibleClusters.length === 0) {
            continue;
          }

          // Filter out clusters where exact binding (source→target→cluster) already exists
          const availableClusters = compatibleClusters.filter((clusterId) =>
            !allBindings.some((b) =>
              b.binding.node_id === sourceNode.node_id &&
              b.binding.endpoint_id === sourceEndpoint.endpoint_id &&
              b.binding.target_node_id === targetNode.node_id &&
              b.binding.target_endpoint_id === targetEndpoint.endpoint_id &&
              b.binding.cluster_id === clusterId
            )
          );

          if (availableClusters.length === 0) {
            continue;
          }

          recommendations.push({
            sourceNode,
            sourceEndpoint,
            targetNode,
            targetEndpoint,
            compatibleClusters: availableClusters,
          });
        }
      }
    }
  }

  // Sort by number of compatible clusters (more = higher priority)
  recommendations.sort((a, b) => b.compatibleClusters.length - a.compatibleClusters.length);

  return recommendations;
}

/**
 * Tests for binding recommendation logic
 */

import { describe, it, expect } from 'vitest';
import { computeBindingRecommendations } from './recommendation-logic';
import type { MatterNode, MatterEndpoint, BindingWithContext } from './types';

// Test constants - common Matter cluster IDs
const CLUSTER_ON_OFF = 0x0006;
const CLUSTER_LEVEL_CONTROL = 0x0008;
const CLUSTER_BINDING = 0x001e;

// Helper function to create a minimal MatterNode
function createNode(
  id: number,
  name: string,
  endpoints: MatterEndpoint[]
): MatterNode {
  return {
    node_id: id,
    name,
    available: true,
    endpoints,
  };
}

// Helper function to create a MatterEndpoint
function createEndpoint(
  id: number,
  clientClusters: number[],
  serverClusters: number[],
  hasBindingCluster = true
): MatterEndpoint {
  return {
    endpoint_id: id,
    device_types: [],
    has_binding_cluster: hasBindingCluster,
    client_clusters: clientClusters,
    server_clusters: serverClusters,
  };
}

// Helper function to create a BindingWithContext
function createBinding(
  sourceNodeId: number,
  sourceEndpointId: number,
  targetNodeId: number,
  targetEndpointId: number,
  clusterId: number,
  nodes: MatterNode[]
): BindingWithContext {
  const sourceNode = nodes.find(n => n.node_id === sourceNodeId)!;
  const targetNode = nodes.find(n => n.node_id === targetNodeId)!;
  const sourceEndpoint = sourceNode.endpoints.find(e => e.endpoint_id === sourceEndpointId)!;
  const targetEndpoint = targetNode.endpoints.find(e => e.endpoint_id === targetEndpointId)!;

  return {
    binding: {
      node_id: sourceNodeId,
      endpoint_id: sourceEndpointId,
      cluster_id: clusterId,
      target_node_id: targetNodeId,
      target_endpoint_id: targetEndpointId,
      target_group_id: null,
    },
    sourceNode,
    sourceEndpoint,
    targetNode,
    targetEndpoint,
  };
}

describe('computeBindingRecommendations', () => {
  it('recommends multiple bindings for same cluster to different targets', () => {
    // Setup: 1 switch with On/Off client, 3 lights with On/Off server
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF], []),
    ]);
    const light1 = createNode(2, 'Light 1', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);
    const light2 = createNode(3, 'Light 2', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);
    const light3 = createNode(4, 'Light 3', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);

    const nodes = [switch1, light1, light2, light3];
    const bindings: BindingWithContext[] = [];

    const recommendations = computeBindingRecommendations(nodes, bindings);

    // Should recommend binding to all 3 lights
    expect(recommendations).toHaveLength(3);
    expect(recommendations[0].sourceNode.node_id).toBe(1);
    expect(recommendations[0].compatibleClusters).toContain(CLUSTER_ON_OFF);

    const targetNodeIds = recommendations.map(r => r.targetNode.node_id).sort();
    expect(targetNodeIds).toEqual([2, 3, 4]);
  });

  it('prevents exact duplicate bindings (source→target→cluster)', () => {
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF], []),
    ]);
    const light1 = createNode(2, 'Light 1', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);
    const light2 = createNode(3, 'Light 2', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);

    const nodes = [switch1, light1, light2];

    // Existing binding: Switch → Light 1 (On/Off)
    const bindings = [
      createBinding(1, 1, 2, 1, CLUSTER_ON_OFF, nodes)
    ];

    const recommendations = computeBindingRecommendations(nodes, bindings);

    // Should only recommend Light 2, not Light 1 (duplicate)
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].targetNode.node_id).toBe(3);
    expect(recommendations[0].compatibleClusters).toContain(CLUSTER_ON_OFF);
  });

  it('allows same cluster to multiple targets (the fix we just made)', () => {
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL], []),
    ]);
    const light1 = createNode(2, 'Light 1', [
      createEndpoint(1, [], [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
    ]);
    const light2 = createNode(3, 'Light 2', [
      createEndpoint(1, [], [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
    ]);

    const nodes = [switch1, light1, light2];

    // Existing binding: Switch → Light 1 (On/Off)
    // In old logic, this would prevent Switch → Light 2 (On/Off)
    const bindings = [
      createBinding(1, 1, 2, 1, CLUSTER_ON_OFF, nodes)
    ];

    const recommendations = computeBindingRecommendations(nodes, bindings);

    // NEW BEHAVIOR: Should recommend both Light 1 and Light 2
    // Light 1: Only Level Control (On/Off already bound)
    // Light 2: Both On/Off and Level Control
    expect(recommendations).toHaveLength(2);

    const light1Rec = recommendations.find(r => r.targetNode.node_id === 2);
    const light2Rec = recommendations.find(r => r.targetNode.node_id === 3);

    // Light 1 should only have Level Control available (On/Off is already bound)
    expect(light1Rec?.compatibleClusters).toEqual([CLUSTER_LEVEL_CONTROL]);

    // Light 2 should have both clusters (sorted with Level Control first due to sorting)
    expect(light2Rec?.compatibleClusters).toContain(CLUSTER_ON_OFF);
    expect(light2Rec?.compatibleClusters).toContain(CLUSTER_LEVEL_CONTROL);
  });

  it('filters out endpoints without client clusters', () => {
    // Light with only server clusters should not generate recommendations
    const light = createNode(1, 'Light', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]), // No client clusters
    ]);
    const anotherLight = createNode(2, 'Another Light', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);

    const recommendations = computeBindingRecommendations([light, anotherLight], []);

    expect(recommendations).toHaveLength(0);
  });

  it('filters out endpoints without binding cluster', () => {
    const deviceWithoutBinding = createNode(1, 'Device', [
      createEndpoint(1, [CLUSTER_ON_OFF], [], false), // hasBindingCluster = false
    ]);
    const light = createNode(2, 'Light', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);

    const recommendations = computeBindingRecommendations([deviceWithoutBinding, light], []);

    expect(recommendations).toHaveLength(0);
  });

  it('filters out targets with no matching server clusters', () => {
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF], []),
    ]);
    const thermostat = createNode(2, 'Thermostat', [
      createEndpoint(1, [], [0x0201]), // Thermostat cluster, not On/Off
    ]);

    const recommendations = computeBindingRecommendations([switch1, thermostat], []);

    expect(recommendations).toHaveLength(0);
  });

  it('skips same endpoint bindings', () => {
    // A device with both client and server clusters on same endpoint
    const device = createNode(1, 'Device', [
      createEndpoint(1, [CLUSTER_ON_OFF], [CLUSTER_ON_OFF]),
    ]);

    const recommendations = computeBindingRecommendations([device], []);

    // Should not recommend binding to itself
    expect(recommendations).toHaveLength(0);
  });

  it('only includes compatible cluster pairs (client→server)', () => {
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL], []),
    ]);
    const light = createNode(2, 'Light', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]), // Only has On/Off server
    ]);

    const recommendations = computeBindingRecommendations([switch1, light], []);

    expect(recommendations).toHaveLength(1);
    // Should only include On/Off, not Level Control
    expect(recommendations[0].compatibleClusters).toEqual([CLUSTER_ON_OFF]);
    expect(recommendations[0].compatibleClusters).not.toContain(CLUSTER_LEVEL_CONTROL);
  });

  it('sorts recommendations by number of compatible clusters (priority)', () => {
    const switch1 = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL], []),
    ]);
    const simpleBulb = createNode(2, 'Simple Bulb', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]), // 1 cluster
    ]);
    const dimmableBulb = createNode(3, 'Dimmable Bulb', [
      createEndpoint(1, [], [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]), // 2 clusters
    ]);

    const recommendations = computeBindingRecommendations([switch1, simpleBulb, dimmableBulb], []);

    expect(recommendations).toHaveLength(2);
    // Dimmable bulb (2 clusters) should be first (higher priority)
    expect(recommendations[0].targetNode.node_id).toBe(3);
    expect(recommendations[0].compatibleClusters).toHaveLength(2);

    // Simple bulb (1 cluster) should be second
    expect(recommendations[1].targetNode.node_id).toBe(2);
    expect(recommendations[1].compatibleClusters).toHaveLength(1);
  });

  it('handles complex multi-device scenario', () => {
    // Real-world scenario: 2 switches, 3 lights
    const switch1 = createNode(1, 'Switch 1', [
      createEndpoint(1, [CLUSTER_ON_OFF], []),
    ]);
    const switch2 = createNode(2, 'Switch 2', [
      createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL], []),
    ]);
    const light1 = createNode(3, 'Light 1', [
      createEndpoint(1, [], [CLUSTER_ON_OFF]),
    ]);
    const light2 = createNode(4, 'Light 2', [
      createEndpoint(1, [], [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
    ]);
    const light3 = createNode(5, 'Light 3', [
      createEndpoint(1, [], [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
    ]);

    const nodes = [switch1, switch2, light1, light2, light3];

    // Existing bindings: Switch1 → Light1 (On/Off), Switch2 → Light2 (On/Off)
    const bindings = [
      createBinding(1, 1, 3, 1, CLUSTER_ON_OFF, nodes),
      createBinding(2, 1, 4, 1, CLUSTER_ON_OFF, nodes),
    ];

    const recommendations = computeBindingRecommendations(nodes, bindings);

    // Switch 1 should recommend: Light 2, Light 3 (not Light 1 - duplicate On/Off)
    // Switch 2 should recommend:
    //   - Light 1 (On/Off only)
    //   - Light 2 (Level Control only, On/Off already bound)
    //   - Light 3 (On/Off + Level Control)
    // Total: 5 recommendations
    expect(recommendations).toHaveLength(5);

    const switch1Recs = recommendations.filter(r => r.sourceNode.node_id === 1);
    const switch2Recs = recommendations.filter(r => r.sourceNode.node_id === 2);

    expect(switch1Recs).toHaveLength(2);
    expect(switch2Recs).toHaveLength(3);

    // Verify Switch 2 can still bind Level Control to Light 2 (different cluster)
    const switch2ToLight2 = switch2Recs.find(r => r.targetNode.node_id === 4);
    expect(switch2ToLight2?.compatibleClusters).toEqual([CLUSTER_LEVEL_CONTROL]);
  });
});

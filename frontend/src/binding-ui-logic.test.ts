/**
 * Tests for binding UI logic
 */

import { describe, it, expect } from 'vitest';
import {
  filterValidTargetEndpoints,
  getFirstValidTargetEndpoint,
  countCompatibleClusters,
  findFirstValidTargetNode,
} from './binding-ui-logic';
import type { MatterNode, MatterEndpoint } from './types';

// Test constants
const CLUSTER_ON_OFF = 0x0006;
const CLUSTER_LEVEL_CONTROL = 0x0008;

// Helper function to create a minimal MatterEndpoint
function createEndpoint(
  id: number,
  serverClusters: number[]
): MatterEndpoint {
  return {
    endpoint_id: id,
    device_types: [],
    has_binding_cluster: false,
    client_clusters: [],
    server_clusters: serverClusters,
  };
}

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

describe('filterValidTargetEndpoints', () => {
  it('excludes root node endpoint (0)', () => {
    const endpoints = [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root node - should be excluded
      createEndpoint(1, [CLUSTER_ON_OFF]),
    ];

    const filtered = filterValidTargetEndpoints(endpoints);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].endpoint_id).toBe(1);
  });

  it('excludes endpoints without server clusters', () => {
    const endpoints = [
      createEndpoint(1, []), // No server clusters - should be excluded
      createEndpoint(2, [CLUSTER_ON_OFF]),
    ];

    const filtered = filterValidTargetEndpoints(endpoints);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].endpoint_id).toBe(2);
  });

  it('excludes both root node and endpoints without server clusters', () => {
    const endpoints = [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root node
      createEndpoint(1, []), // No server clusters
      createEndpoint(2, [CLUSTER_ON_OFF]), // Valid
      createEndpoint(3, [CLUSTER_LEVEL_CONTROL]), // Valid
    ];

    const filtered = filterValidTargetEndpoints(endpoints);

    expect(filtered).toHaveLength(2);
    expect(filtered.map(ep => ep.endpoint_id)).toEqual([2, 3]);
  });

  it('returns empty array when no valid endpoints', () => {
    const endpoints = [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root node
      createEndpoint(1, []), // No server clusters
    ];

    const filtered = filterValidTargetEndpoints(endpoints);

    expect(filtered).toHaveLength(0);
  });

  it('includes all valid endpoints', () => {
    const endpoints = [
      createEndpoint(1, [CLUSTER_ON_OFF]),
      createEndpoint(2, [CLUSTER_LEVEL_CONTROL]),
      createEndpoint(3, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
    ];

    const filtered = filterValidTargetEndpoints(endpoints);

    expect(filtered).toHaveLength(3);
  });
});

describe('getFirstValidTargetEndpoint', () => {
  it('returns first valid endpoint', () => {
    const node = createNode(1, 'Light', [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root - excluded
      createEndpoint(1, [CLUSTER_ON_OFF]), // First valid
      createEndpoint(2, [CLUSTER_LEVEL_CONTROL]),
    ]);

    const result = getFirstValidTargetEndpoint(node);

    expect(result).not.toBeNull();
    expect(result?.endpoint_id).toBe(1);
  });

  it('returns null when no valid endpoints', () => {
    const node = createNode(1, 'Device', [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root - excluded
      createEndpoint(1, []), // No server clusters
    ]);

    const result = getFirstValidTargetEndpoint(node);

    expect(result).toBeNull();
  });

  it('returns null for node with no endpoints', () => {
    const node = createNode(1, 'Empty Device', []);

    const result = getFirstValidTargetEndpoint(node);

    expect(result).toBeNull();
  });

  it('skips invalid endpoints and returns first valid', () => {
    const node = createNode(1, 'Complex Device', [
      createEndpoint(0, [CLUSTER_ON_OFF]), // Root - excluded
      createEndpoint(1, []), // No server clusters - excluded
      createEndpoint(2, []), // No server clusters - excluded
      createEndpoint(3, [CLUSTER_LEVEL_CONTROL]), // First valid
    ]);

    const result = getFirstValidTargetEndpoint(node);

    expect(result).not.toBeNull();
    expect(result?.endpoint_id).toBe(3);
  });
});

describe('countCompatibleClusters', () => {
  it('counts matching clusters', () => {
    const sourceClientClusters = [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL];
    const targetEndpoint = createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]);

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    expect(count).toBe(2);
  });

  it('returns 0 when no matching clusters', () => {
    const sourceClientClusters = [CLUSTER_ON_OFF];
    const targetEndpoint = createEndpoint(1, [CLUSTER_LEVEL_CONTROL]);

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    expect(count).toBe(0);
  });

  it('counts partial matches', () => {
    const sourceClientClusters = [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, 0x0300]; // 3 clusters
    const targetEndpoint = createEndpoint(1, [CLUSTER_ON_OFF]); // Only 1 matches

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    expect(count).toBe(1);
  });

  it('returns 0 when source has no client clusters', () => {
    const sourceClientClusters: number[] = [];
    const targetEndpoint = createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]);

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    expect(count).toBe(0);
  });

  it('returns 0 when target has no server clusters', () => {
    const sourceClientClusters = [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL];
    const targetEndpoint = createEndpoint(1, []);

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    expect(count).toBe(0);
  });

  it('handles duplicate clusters correctly', () => {
    const sourceClientClusters = [CLUSTER_ON_OFF, CLUSTER_ON_OFF]; // Duplicate (shouldn't happen but handle it)
    const targetEndpoint = createEndpoint(1, [CLUSTER_ON_OFF]);

    const count = countCompatibleClusters(sourceClientClusters, targetEndpoint);

    // Should count 2 since source has it twice (even if unusual)
    expect(count).toBe(2);
  });
});

describe('findFirstValidTargetNode', () => {
  it('excludes source node', () => {
    const nodes = [
      createNode(1, 'Source', [createEndpoint(1, [CLUSTER_ON_OFF])]),
      createNode(2, 'Target', [createEndpoint(1, [CLUSTER_ON_OFF])]),
    ];

    const result = findFirstValidTargetNode(nodes, 1);

    expect(result).not.toBeNull();
    expect(result?.node_id).toBe(2);
  });

  it('finds first node with valid endpoints', () => {
    const nodes = [
      createNode(1, 'Source', [createEndpoint(1, [CLUSTER_ON_OFF])]),
      createNode(2, 'Bad Target', [createEndpoint(0, [CLUSTER_ON_OFF])]), // Only root endpoint
      createNode(3, 'Good Target', [createEndpoint(1, [CLUSTER_ON_OFF])]), // Has valid endpoint
    ];

    const result = findFirstValidTargetNode(nodes, 1);

    expect(result).not.toBeNull();
    expect(result?.node_id).toBe(3);
  });

  it('returns first available node if no valid endpoints anywhere', () => {
    const nodes = [
      createNode(1, 'Source', [createEndpoint(1, [CLUSTER_ON_OFF])]),
      createNode(2, 'Target 1', [createEndpoint(0, [CLUSTER_ON_OFF])]), // Only root
      createNode(3, 'Target 2', [createEndpoint(0, [CLUSTER_ON_OFF])]), // Only root
    ];

    const result = findFirstValidTargetNode(nodes, 1);

    // Should return first available target even without valid endpoints
    expect(result).not.toBeNull();
    expect(result?.node_id).toBe(2);
  });

  it('returns null when only source node exists', () => {
    const nodes = [
      createNode(1, 'Source', [createEndpoint(1, [CLUSTER_ON_OFF])]),
    ];

    const result = findFirstValidTargetNode(nodes, 1);

    expect(result).toBeNull();
  });

  it('returns null for empty node list', () => {
    const nodes: MatterNode[] = [];

    const result = findFirstValidTargetNode(nodes, 1);

    expect(result).toBeNull();
  });

  it('handles multiple nodes and finds first with valid endpoint', () => {
    const nodes = [
      createNode(1, 'Switch', [createEndpoint(1, [CLUSTER_ON_OFF])]),
      createNode(2, 'Bad Light 1', [createEndpoint(0, [CLUSTER_ON_OFF])]),
      createNode(3, 'Bad Light 2', [createEndpoint(1, [])]), // No server clusters
      createNode(4, 'Good Light', [
        createEndpoint(0, [CLUSTER_ON_OFF]),
        createEndpoint(1, [CLUSTER_ON_OFF]), // Valid!
      ]),
      createNode(5, 'Another Good Light', [createEndpoint(1, [CLUSTER_ON_OFF])]),
    ];

    const result = findFirstValidTargetNode(nodes, 1);

    expect(result).not.toBeNull();
    expect(result?.node_id).toBe(4); // First node with valid endpoint
  });
});

describe('Integration tests - Real-world scenarios', () => {
  it('correctly filters and counts for typical light setup', () => {
    // Typical dimmable light with multiple endpoints
    const light = createNode(1, 'Dimmable Light', [
      createEndpoint(0, [0x001d, 0x0003, 0x0004]), // Root node with descriptor clusters
      createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]), // Main light endpoint
    ]);

    const validEndpoints = filterValidTargetEndpoints(light.endpoints);
    expect(validEndpoints).toHaveLength(1);
    expect(validEndpoints[0].endpoint_id).toBe(1);

    const sourceClientClusters = [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL];
    const compatCount = countCompatibleClusters(sourceClientClusters, validEndpoints[0]);
    expect(compatCount).toBe(2);
  });

  it('handles switch to multiple lights scenario', () => {
    const switchNode = createNode(1, 'Switch', [
      createEndpoint(1, [CLUSTER_ON_OFF]), // Switch endpoint with client cluster
    ]);

    const lights = [
      createNode(2, 'Light 1', [
        createEndpoint(0, [0x001d]),
        createEndpoint(1, [CLUSTER_ON_OFF]),
      ]),
      createNode(3, 'Light 2', [
        createEndpoint(0, [0x001d]),
        createEndpoint(1, [CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL]),
      ]),
      createNode(4, 'Light 3', [
        createEndpoint(0, [0x001d]),
        createEndpoint(1, [CLUSTER_ON_OFF]),
      ]),
    ];

    // All lights should have valid target endpoints
    lights.forEach(light => {
      const validEps = filterValidTargetEndpoints(light.endpoints);
      expect(validEps.length).toBeGreaterThan(0);
    });

    // First valid target should be Light 1
    const allNodes = [switchNode, ...lights];
    const firstTarget = findFirstValidTargetNode(allNodes, 1);
    expect(firstTarget?.node_id).toBe(2);
  });
});

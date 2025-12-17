/**
 * Test utilities for Matter Binding Helper components
 *
 * Provides mock data fixtures and helper functions for testing Lit components.
 */

import type {
  HomeAssistant,
  MatterNode,
  MatterEndpoint,
  Binding,
  BindingWithContext,
  ACLEntry,
  ACLTarget,
  DeviceInfo,
  EntityInfo,
  BindingRecommendation,
} from "./types";

// ============================================================================
// Cluster Constants (for test readability)
// ============================================================================

export const TEST_CLUSTERS = {
  ON_OFF: 0x0006,
  LEVEL_CONTROL: 0x0008,
  COLOR_CONTROL: 0x0300,
  THERMOSTAT: 0x0201,
  BINDING: 0x001e,
  DESCRIPTOR: 0x001d,
  BASIC_INFO: 0x0028,
  IDENTIFY: 0x0003,
  GROUPS: 0x0004,
} as const;

// ============================================================================
// Mock HomeAssistant
// ============================================================================

export interface MockHassOptions {
  callWSResponse?: unknown;
  language?: string;
}

export function createMockHass(options: MockHassOptions = {}): HomeAssistant {
  return {
    callWS: vi.fn().mockResolvedValue(options.callWSResponse ?? {}),
    callService: vi.fn().mockResolvedValue(undefined),
    connection: {
      subscribeEvents: vi.fn().mockResolvedValue(() => {}),
    },
    language: options.language ?? "en",
    localize: vi.fn((key: string) => key),
  };
}

// ============================================================================
// Device Info Factory
// ============================================================================

export interface DeviceInfoOptions {
  vendorName?: string | null;
  vendorId?: number | null;
  productName?: string | null;
  productId?: number | null;
  nodeLabel?: string | null;
  hardwareVersion?: string | null;
  softwareVersion?: string | null;
}

export function createDeviceInfo(
  options: DeviceInfoOptions = {}
): DeviceInfo {
  return {
    vendor_name: options.vendorName ?? "Test Vendor",
    vendor_id: options.vendorId ?? 0x1234,
    product_name: options.productName ?? "Test Product",
    product_id: options.productId ?? 0x5678,
    node_label: options.nodeLabel ?? null,
    hardware_version: options.hardwareVersion ?? "1.0",
    software_version: options.softwareVersion ?? "1.0.0",
  };
}

// ============================================================================
// Entity Info Factory
// ============================================================================

export interface EntityInfoOptions {
  entityId?: string;
  domain?: string;
  name?: string | null;
  originalName?: string | null;
  platform?: string;
  disabled?: boolean;
}

export function createEntityInfo(
  options: EntityInfoOptions = {}
): EntityInfo {
  const domain = options.domain ?? "light";
  return {
    entity_id: options.entityId ?? `${domain}.test_entity`,
    domain,
    name: options.name ?? "Test Entity",
    original_name: options.originalName ?? null,
    platform: options.platform ?? "matter",
    disabled: options.disabled ?? false,
  };
}

// ============================================================================
// Endpoint Factory
// ============================================================================

export interface EndpointOptions {
  id?: number;
  deviceTypes?: Array<{ id: number; revision: number }>;
  hasBindingCluster?: boolean;
  serverClusters?: number[];
  clientClusters?: number[];
}

export function createEndpoint(options: EndpointOptions = {}): MatterEndpoint {
  return {
    endpoint_id: options.id ?? 1,
    device_types: options.deviceTypes ?? [{ id: 256, revision: 1 }], // Default: On/Off Light
    has_binding_cluster: options.hasBindingCluster ?? false,
    server_clusters: options.serverClusters ?? [TEST_CLUSTERS.ON_OFF],
    client_clusters: options.clientClusters ?? [],
  };
}

// ============================================================================
// Node Factory
// ============================================================================

export interface NodeOptions {
  nodeId?: number;
  name?: string;
  available?: boolean;
  deviceInfo?: DeviceInfo | null;
  endpoints?: MatterEndpoint[];
  areaName?: string | null;
  haDeviceId?: string | null;
  entities?: EntityInfo[];
}

export function createNode(options: NodeOptions = {}): MatterNode {
  return {
    node_id: options.nodeId ?? 1,
    name: options.name ?? "Test Node",
    available: options.available ?? true,
    device_info: options.deviceInfo ?? createDeviceInfo(),
    endpoints: options.endpoints ?? [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({ id: 1 }),
    ],
    area_name: options.areaName ?? null,
    ha_device_id: options.haDeviceId ?? "device_123",
    entities: options.entities ?? [],
  };
}

// ============================================================================
// Binding Factory
// ============================================================================

export interface BindingOptions {
  nodeId?: number;
  endpointId?: number;
  clusterId?: number;
  targetNodeId?: number | null;
  targetEndpointId?: number | null;
  targetGroupId?: number | null;
}

export function createBinding(options: BindingOptions = {}): Binding {
  return {
    node_id: options.nodeId ?? 1,
    endpoint_id: options.endpointId ?? 1,
    cluster_id: options.clusterId ?? TEST_CLUSTERS.ON_OFF,
    target_node_id: options.targetNodeId ?? 2,
    target_endpoint_id: options.targetEndpointId ?? 1,
    target_group_id: options.targetGroupId ?? null,
  };
}

// ============================================================================
// Binding With Context Factory
// ============================================================================

export interface BindingWithContextOptions {
  binding?: Binding;
  sourceNode?: MatterNode;
  sourceEndpoint?: MatterEndpoint;
  targetNode?: MatterNode | null;
  targetEndpoint?: MatterEndpoint | null;
}

export function createBindingWithContext(
  options: BindingWithContextOptions = {}
): BindingWithContext {
  const sourceNode = options.sourceNode ?? createNode({ nodeId: 1, name: "Switch" });
  const targetNode = options.targetNode ?? createNode({ nodeId: 2, name: "Light" });

  return {
    binding: options.binding ?? createBinding(),
    sourceNode,
    sourceEndpoint:
      options.sourceEndpoint ??
      sourceNode.endpoints.find((e) => e.endpoint_id === 1) ??
      createEndpoint(),
    targetNode,
    targetEndpoint:
      options.targetEndpoint ??
      (targetNode?.endpoints.find((e) => e.endpoint_id === 1) ?? null),
  };
}

// ============================================================================
// ACL Entry Factory
// ============================================================================

export interface ACLEntryOptions {
  privilege?: number;
  privilegeName?: string;
  authMode?: number;
  authModeName?: string;
  subjects?: number[];
  targets?: ACLTarget[];
  fabricIndex?: number;
}

export function createACLEntry(options: ACLEntryOptions = {}): ACLEntry {
  return {
    privilege: options.privilege ?? 3, // Operate
    privilege_name: options.privilegeName ?? "Operate",
    auth_mode: options.authMode ?? 2, // CASE
    auth_mode_name: options.authModeName ?? "CASE",
    subjects: options.subjects ?? [1],
    targets: options.targets ?? [{ cluster: null, endpoint: null, device_type: null }],
    fabric_index: options.fabricIndex ?? 1,
  };
}

// ============================================================================
// Binding Recommendation Factory
// ============================================================================

export interface BindingRecommendationOptions {
  sourceNode?: MatterNode;
  sourceEndpoint?: MatterEndpoint;
  targetNode?: MatterNode;
  targetEndpoint?: MatterEndpoint;
  compatibleClusters?: number[];
}

export function createBindingRecommendation(
  options: BindingRecommendationOptions = {}
): BindingRecommendation {
  const sourceNode = options.sourceNode ?? createNode({
    nodeId: 1,
    name: "Switch",
    endpoints: [
      createEndpoint({
        id: 1,
        hasBindingCluster: true,
        clientClusters: [TEST_CLUSTERS.ON_OFF],
        serverClusters: [],
      }),
    ],
  });
  const targetNode = options.targetNode ?? createNode({
    nodeId: 2,
    name: "Light",
    endpoints: [
      createEndpoint({
        id: 1,
        serverClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
      }),
    ],
  });

  return {
    sourceNode,
    sourceEndpoint:
      options.sourceEndpoint ??
      sourceNode.endpoints.find((e) => e.endpoint_id === 1)!,
    targetNode,
    targetEndpoint:
      options.targetEndpoint ??
      targetNode.endpoints.find((e) => e.endpoint_id === 1)!,
    compatibleClusters: options.compatibleClusters ?? [TEST_CLUSTERS.ON_OFF],
  };
}

// ============================================================================
// Common Test Scenarios
// ============================================================================

/**
 * Creates a typical switch-to-light binding scenario
 */
export function createSwitchToLightScenario() {
  const switchNode = createNode({
    nodeId: 1,
    name: "Wall Switch",
    endpoints: [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 259, revision: 1 }], // On/Off Light Switch
        hasBindingCluster: true,
        clientClusters: [TEST_CLUSTERS.ON_OFF, TEST_CLUSTERS.LEVEL_CONTROL],
        serverClusters: [TEST_CLUSTERS.IDENTIFY],
      }),
    ],
  });

  const lightNode = createNode({
    nodeId: 2,
    name: "Ceiling Light",
    endpoints: [
      createEndpoint({ id: 0, serverClusters: [TEST_CLUSTERS.DESCRIPTOR] }),
      createEndpoint({
        id: 1,
        deviceTypes: [{ id: 257, revision: 1 }], // Dimmable Light
        serverClusters: [
          TEST_CLUSTERS.ON_OFF,
          TEST_CLUSTERS.LEVEL_CONTROL,
          TEST_CLUSTERS.IDENTIFY,
        ],
      }),
    ],
  });

  const binding = createBinding({
    nodeId: 1,
    endpointId: 1,
    clusterId: TEST_CLUSTERS.ON_OFF,
    targetNodeId: 2,
    targetEndpointId: 1,
  });

  const bindingWithContext = createBindingWithContext({
    binding,
    sourceNode: switchNode,
    sourceEndpoint: switchNode.endpoints[1],
    targetNode: lightNode,
    targetEndpoint: lightNode.endpoints[1],
  });

  return {
    switchNode,
    lightNode,
    binding,
    bindingWithContext,
    nodes: [switchNode, lightNode],
  };
}

/**
 * Creates a scenario with a binding that has missing ACL
 */
export function createMissingACLScenario() {
  const scenario = createSwitchToLightScenario();
  return {
    ...scenario,
    aclEntries: [] as ACLEntry[], // No ACL entries = missing permission
  };
}

/**
 * Creates a scenario with proper ACL
 */
export function createWithACLScenario() {
  const scenario = createSwitchToLightScenario();
  return {
    ...scenario,
    aclEntries: [
      createACLEntry({
        privilege: 3, // Operate
        subjects: [scenario.switchNode.node_id],
        targets: [{ cluster: null, endpoint: 1, device_type: null }],
      }),
    ],
  };
}

// ============================================================================
// Lit Component Test Helpers
// ============================================================================

/**
 * Waits for the Lit component to complete its update cycle
 */
export async function elementUpdated(el: HTMLElement): Promise<void> {
  await (el as unknown as { updateComplete: Promise<boolean> }).updateComplete;
}

/**
 * Queries shadow DOM for an element
 */
export function queryShadow<T extends Element>(
  el: HTMLElement,
  selector: string
): T | null {
  return el.shadowRoot?.querySelector<T>(selector) ?? null;
}

/**
 * Queries shadow DOM for all matching elements
 */
export function queryShadowAll<T extends Element>(
  el: HTMLElement,
  selector: string
): T[] {
  return Array.from(el.shadowRoot?.querySelectorAll<T>(selector) ?? []);
}

/**
 * Simulates a click event on an element in the shadow DOM
 */
export function clickShadow(el: HTMLElement, selector: string): void {
  const target = queryShadow(el, selector);
  if (target) {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
  }
}

/**
 * Captures custom events dispatched by a component
 */
export function captureEvents<T = unknown>(
  el: HTMLElement,
  eventName: string
): { events: Array<CustomEvent<T>>; cleanup: () => void } {
  const events: Array<CustomEvent<T>> = [];
  const handler = (e: Event) => events.push(e as CustomEvent<T>);
  el.addEventListener(eventName, handler);
  return {
    events,
    cleanup: () => el.removeEventListener(eventName, handler),
  };
}

// Re-export vi for convenience in tests
import { vi } from "vitest";
export { vi };

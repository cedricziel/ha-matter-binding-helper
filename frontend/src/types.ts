/**
 * Type definitions for Matter Binding Helper
 */

export interface HomeAssistant {
  callWS: <T>(msg: WebSocketMessage) => Promise<T>;
  connection: {
    subscribeEvents: (
      callback: (event: unknown) => void,
      eventType: string
    ) => Promise<() => void>;
  };
  language: string;
  localize: (key: string, ...args: unknown[]) => string;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export interface DeviceInfo {
  vendor_name: string | null;
  vendor_id: number | null;
  product_name: string | null;
  product_id: number | null;
  node_label: string | null;
  hardware_version: string | null;
  software_version: string | null;
}

export interface MatterNode {
  node_id: number;
  name: string;
  available: boolean;
  device_info?: DeviceInfo;
  endpoints: MatterEndpoint[];
}

export interface MatterEndpoint {
  endpoint_id: number;
  device_types: DeviceType[];
  has_binding_cluster: boolean;
  clusters: number[];
}

export interface DeviceType {
  id: number;
  revision: number;
}

export interface Binding {
  node_id: number;
  endpoint_id: number;
  cluster_id: number;
  target_node_id: number | null;
  target_endpoint_id: number | null;
  target_group_id: number | null;
}

export interface MatterGroup {
  group_id: number;
  name: string;
  members: GroupMember[];
}

export interface GroupMember {
  node_id: number;
  endpoint_id: number;
}

export interface ListNodesResponse {
  nodes: MatterNode[];
}

export interface ListBindingsResponse {
  bindings: Binding[];
}

export interface ListGroupsResponse {
  groups: MatterGroup[];
}

export interface SuccessResponse {
  success: boolean;
}

// Cluster IDs
export const CLUSTER_ON_OFF = 0x0006;
export const CLUSTER_LEVEL_CONTROL = 0x0008;
export const CLUSTER_COLOR_CONTROL = 0x0300;
export const CLUSTER_SCENES = 0x0005;

export const CLUSTER_NAMES: Record<number, string> = {
  [CLUSTER_ON_OFF]: "On/Off",
  [CLUSTER_LEVEL_CONTROL]: "Level Control",
  [CLUSTER_COLOR_CONTROL]: "Color Control",
  [CLUSTER_SCENES]: "Scenes",
};

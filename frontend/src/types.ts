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
  area_name?: string | null;
  ha_device_id?: string | null;
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
export const CLUSTER_IDENTIFY = 0x0003;
export const CLUSTER_GROUPS = 0x0004;
export const CLUSTER_SCENES = 0x0005;
export const CLUSTER_ON_OFF = 0x0006;
export const CLUSTER_LEVEL_CONTROL = 0x0008;
export const CLUSTER_DESCRIPTOR = 0x001d;
export const CLUSTER_BINDING = 0x001e;
export const CLUSTER_ACCESS_CONTROL = 0x001f;
export const CLUSTER_BASIC_INFO = 0x0028;
export const CLUSTER_POWER_SOURCE = 0x002f;
export const CLUSTER_COLOR_CONTROL = 0x0300;
export const CLUSTER_THERMOSTAT = 0x0201;
export const CLUSTER_THERMOSTAT_UI = 0x0204;

export const CLUSTER_NAMES: Record<number, string> = {
  [CLUSTER_IDENTIFY]: "Identify",
  [CLUSTER_GROUPS]: "Groups",
  [CLUSTER_SCENES]: "Scenes",
  [CLUSTER_ON_OFF]: "On/Off",
  [CLUSTER_LEVEL_CONTROL]: "Level Control",
  [CLUSTER_DESCRIPTOR]: "Descriptor",
  [CLUSTER_BINDING]: "Binding",
  [CLUSTER_ACCESS_CONTROL]: "Access Control",
  [CLUSTER_BASIC_INFO]: "Basic Information",
  42: "OTA Update",
  [CLUSTER_POWER_SOURCE]: "Power Source",
  48: "General Commissioning",
  49: "Network Commissioning",
  50: "Diagnostic Logs",
  51: "General Diagnostics",
  52: "Software Diagnostics",
  53: "Thread Diagnostics",
  56: "Ethernet Diagnostics",
  60: "Admin Commissioning",
  62: "Operational Credentials",
  63: "Group Key Management",
  70: "Time Sync",
  [CLUSTER_COLOR_CONTROL]: "Color Control",
  [CLUSTER_THERMOSTAT]: "Thermostat",
  [CLUSTER_THERMOSTAT_UI]: "Thermostat UI",
  514: "Fan Control",
};

// Device Type IDs
export const DEVICE_TYPE_NAMES: Record<number, string> = {
  // Utility device types
  17: "Power Source",
  18: "OTA Requestor",
  19: "OTA Provider",
  20: "Aggregator",
  22: "Root Node",

  // Lighting
  256: "On/Off Light",
  257: "Dimmable Light",
  258: "Color Temperature Light",
  259: "On/Off Light Switch",
  260: "Dimmer Switch",
  261: "Color Dimmer Switch",
  262: "Light Sensor",
  263: "Occupancy Sensor",
  266: "On/Off Plug-in Unit",
  267: "Dimmable Plug-in Unit",
  268: "Color Temperature Light",
  269: "Extended Color Light",

  // HVAC
  769: "Thermostat",
  770: "Temperature Sensor",
  771: "Humidity Sensor",
  772: "Air Quality Sensor",

  // Closure
  10: "Door Lock",
  11: "Door Lock Controller",
  514: "Window Covering",
  515: "Window Covering Controller",

  // Safety
  21: "Contact Sensor",
  38: "Flow Sensor",
  44: "Smoke/CO Alarm",

  // Media
  35: "Casting Video Player",
  36: "Content App",
  40: "Basic Video Player",
  41: "Casting Video Client",
  43: "Speaker",
};

// Helper functions
export function getClusterName(clusterId: number): string {
  return CLUSTER_NAMES[clusterId] || `0x${clusterId.toString(16).padStart(4, "0")}`;
}

export function getDeviceTypeName(deviceTypeId: number): string {
  return DEVICE_TYPE_NAMES[deviceTypeId] || `Type ${deviceTypeId}`;
}

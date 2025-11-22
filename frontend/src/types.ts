/**
 * Type definitions for Matter Binding Helper
 */

export interface HomeAssistant {
  callWS: <T>(msg: WebSocketMessage) => Promise<T>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ) => Promise<void>;
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
  server_clusters: number[];
  client_clusters: number[];
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

// Binding with full context for overview display
export interface BindingWithContext {
  binding: Binding;
  sourceNode: MatterNode;
  sourceEndpoint: MatterEndpoint;
  targetNode: MatterNode | null;
  targetEndpoint: MatterEndpoint | null;
}

// Recommended binding suggestion
export interface BindingRecommendation {
  sourceNode: MatterNode;
  sourceEndpoint: MatterEndpoint;
  targetNode: MatterNode;
  targetEndpoint: MatterEndpoint;
  compatibleClusters: number[];
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
export const CLUSTER_TEMPERATURE_MEASUREMENT = 0x0402;
export const CLUSTER_PRESSURE_MEASUREMENT = 0x0403;
export const CLUSTER_HUMIDITY_MEASUREMENT = 0x0405;
export const CLUSTER_OCCUPANCY_SENSING = 0x0406;

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
  [CLUSTER_TEMPERATURE_MEASUREMENT]: "Temperature",
  [CLUSTER_PRESSURE_MEASUREMENT]: "Pressure",
  [CLUSTER_HUMIDITY_MEASUREMENT]: "Humidity",
  [CLUSTER_OCCUPANCY_SENSING]: "Occupancy",
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

// Cluster binding descriptions - explains what happens when devices are bound via this cluster
export const CLUSTER_BINDING_DESCRIPTIONS: Record<number, { action: string; dataType: string }> = {
  [CLUSTER_ON_OFF]: {
    action: "control the on/off state of",
    dataType: "on/off commands",
  },
  [CLUSTER_LEVEL_CONTROL]: {
    action: "control the brightness/level of",
    dataType: "level/dimming commands",
  },
  [CLUSTER_COLOR_CONTROL]: {
    action: "control the color of",
    dataType: "color commands",
  },
  [CLUSTER_TEMPERATURE_MEASUREMENT]: {
    action: "read temperature data from",
    dataType: "temperature readings",
  },
  [CLUSTER_PRESSURE_MEASUREMENT]: {
    action: "read pressure data from",
    dataType: "pressure readings",
  },
  [CLUSTER_HUMIDITY_MEASUREMENT]: {
    action: "read humidity data from",
    dataType: "humidity readings",
  },
  [CLUSTER_OCCUPANCY_SENSING]: {
    action: "receive occupancy status from",
    dataType: "occupancy/presence data",
  },
  [CLUSTER_THERMOSTAT]: {
    action: "control thermostat settings on",
    dataType: "thermostat commands",
  },
  [CLUSTER_SCENES]: {
    action: "trigger scenes on",
    dataType: "scene commands",
  },
  [CLUSTER_GROUPS]: {
    action: "manage group membership on",
    dataType: "group commands",
  },
};

// Helper functions
export function getClusterName(clusterId: number): string {
  return CLUSTER_NAMES[clusterId] || `0x${clusterId.toString(16).padStart(4, "0")}`;
}

export function getDeviceTypeName(deviceTypeId: number): string {
  return DEVICE_TYPE_NAMES[deviceTypeId] || `Type ${deviceTypeId}`;
}

export function getClusterBindingDescription(clusterId: number): { action: string; dataType: string } {
  return CLUSTER_BINDING_DESCRIPTIONS[clusterId] || {
    action: "communicate with",
    dataType: `${getClusterName(clusterId)} data`,
  };
}

// Automation recommendation for device combinations that can't use bindings
export interface AutomationTemplate {
  id: string;
  sourceDeviceTypes: number[];  // Device types that benefit from this automation
  targetDeviceTypes: number[];  // Device types that provide the trigger/data
  title: string;
  description: string;
  why: string;  // Explanation of why binding doesn't work
  icon: string;
}

// Templates for common automation scenarios
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "thermostat-contact-window",
    sourceDeviceTypes: [769],  // Thermostat
    targetDeviceTypes: [21],   // Contact Sensor
    title: "Turn off heating when window opens",
    description: "Automatically pause heating/cooling when a window or door is opened to save energy.",
    why: "Thermostats don't have a client cluster for Boolean State (contact sensors). Matter bindings require matching client/server clusters.",
    icon: "🪟",
  },
  {
    id: "thermostat-occupancy",
    sourceDeviceTypes: [769],  // Thermostat
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Adjust temperature based on occupancy",
    description: "Lower the temperature when room is unoccupied, restore when someone enters.",
    why: "Thermostats don't have a client cluster for Occupancy Sensing. A Home Assistant automation can bridge this gap.",
    icon: "🚶",
  },
  {
    id: "light-occupancy",
    sourceDeviceTypes: [256, 257, 258, 268, 269],  // Various light types
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Turn on light when motion detected",
    description: "Automatically turn on lights when someone enters the room.",
    why: "Lights are servers (receive commands), not clients. Occupancy sensors report state but can't send on/off commands.",
    icon: "💡",
  },
  {
    id: "light-contact-door",
    sourceDeviceTypes: [256, 257, 258, 268, 269],  // Various light types
    targetDeviceTypes: [21],   // Contact Sensor
    title: "Turn on light when door opens",
    description: "Automatically turn on lights when a door is opened (e.g., closet light).",
    why: "Contact sensors report open/close state but don't have client clusters to control lights directly.",
    icon: "🚪",
  },
  {
    id: "plug-occupancy",
    sourceDeviceTypes: [266, 267],  // Plug-in units
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Control device based on occupancy",
    description: "Turn on/off a device when room occupancy changes.",
    why: "Plug-in units are servers (receive commands). Occupancy sensors can't directly control them via Matter binding.",
    icon: "🔌",
  },
];

// Recommendation result
export interface AutomationRecommendation {
  template: AutomationTemplate;
  sourceNode: MatterNode;
  sourceEndpoint: MatterEndpoint;
  targetNode: MatterNode;
  targetEndpoint: MatterEndpoint;
}

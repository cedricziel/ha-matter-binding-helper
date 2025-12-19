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

export interface EntityInfo {
  entity_id: string;
  domain: string;
  name: string | null;
  original_name: string | null;
  platform: string;
  disabled: boolean;
}

export interface MatterNode {
  node_id: number;
  name: string;
  available: boolean;
  device_info?: DeviceInfo;
  endpoints: MatterEndpoint[];
  area_name?: string | null;
  ha_device_id?: string | null;
  entities?: EntityInfo[];
}

export interface ClusterCommandInfo {
  accepted: number[];  // List of accepted command IDs
  names: Record<number, string>;  // Map of command_id -> command name
}

export interface MatterEndpoint {
  endpoint_id: number;
  device_types: DeviceType[];
  has_binding_cluster: boolean;
  server_clusters: number[];
  client_clusters: number[];
  cluster_commands?: Record<number, ClusterCommandInfo>;  // Map of cluster_id -> command info
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

// Error types for Matter operations
export type OperationErrorType =
  | "success"
  | "permission_denied"
  | "device_unavailable"
  | "device_timeout"
  | "device_rejected"
  | "invalid_request"
  | "unknown_error";

export interface BindingVerificationResponse {
  success: boolean;
  verified: boolean;
  message: string;
  bindings_found: number;
  error_type: OperationErrorType;
}

// ACL (Access Control List) types
export interface ACLTarget {
  cluster: number | null;
  endpoint: number | null;
  device_type: number | null;
}

export interface ACLEntry {
  privilege: number;
  privilege_name: string;
  auth_mode: number;
  auth_mode_name: string;
  subjects: number[];
  targets: ACLTarget[];
  fabric_index: number;
}

export interface ListACLResponse {
  success: boolean;
  entries: ACLEntry[];
}

// ACL Privilege levels (matches backend const.py)
export const ACL_PRIVILEGE_VIEW = 1;
export const ACL_PRIVILEGE_PROXY_VIEW = 2;
export const ACL_PRIVILEGE_OPERATE = 3;
export const ACL_PRIVILEGE_MANAGE = 4;
export const ACL_PRIVILEGE_ADMINISTER = 5;

export const ACL_PRIVILEGE_NAMES: Record<number, string> = {
  [ACL_PRIVILEGE_VIEW]: "View",
  [ACL_PRIVILEGE_PROXY_VIEW]: "Proxy View",
  [ACL_PRIVILEGE_OPERATE]: "Operate",
  [ACL_PRIVILEGE_MANAGE]: "Manage",
  [ACL_PRIVILEGE_ADMINISTER]: "Administer",
};

// ACL provisioning response types
export interface ProvisionACLResponse {
  success: boolean;
  message: string;
  acl_entries_count: number;
  error_type?: OperationErrorType;
}

// ACL progress event (fired during polling verification)
export type ACLProgressStatus = "verifying" | "retrying" | "success" | "failed";

export interface ACLProgressEvent {
  target_node_id: number;
  source_node_id: number;
  status: ACLProgressStatus;
  attempt: number;
  max_attempts: number;
  timeout_seconds?: number;
  elapsed_seconds?: number;
  remaining_seconds?: number;
  message: string;
}

// Event name constant
export const EVENT_ACL_PROGRESS = "matter_binding_helper_acl_progress";

export interface ProvisionACLForBindingsResponse {
  success: boolean;
  results: Array<{
    target_node_id: number;
    target_endpoint_id: number;
    cluster_id: number;
    success: boolean;
    message: string;
  }>;
  total: number;
  succeeded: number;
}

// Binding wizard types
export type BindingWizardStep = "binding" | "acl" | "verify";

export interface BindingWizardState {
  currentStep: BindingWizardStep;
  sourceNode: MatterNode;
  sourceEndpoint: MatterEndpoint;
  targetNode: MatterNode;
  targetEndpoint: MatterEndpoint;
  clusterId: number;
  selectedPrivilege: number;
  // Step results
  bindingResult?: BindingVerificationResponse;
  aclResult?: ProvisionACLResponse;
  verifyResult?: BindingVerificationResponse;
  // Loading states per step
  bindingInProgress: boolean;
  aclInProgress: boolean;
  verifyInProgress: boolean;
  // ACL progress tracking (updated via events during polling)
  aclProgress?: ACLProgressEvent;
}

// Operation progress types for blocking dialogs
export type OperationStepStatus = "pending" | "in_progress" | "success" | "error" | "skipped";

export interface OperationStep {
  label: string;
  status: OperationStepStatus;
  message?: string;
}

export interface OperationProgressState {
  title: string;
  steps: OperationStep[];
  currentStepIndex: number;
  canCancel: boolean;
  error?: string;
  completed: boolean;
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
export const CLUSTER_SWITCH = 0x003b;

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
  [CLUSTER_SWITCH]: "Switch",
};

// Device Type IDs
export const DEVICE_TYPE_NAMES: Record<number, string> = {
  // Utility device types
  15: "Generic Switch",
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
  [CLUSTER_SWITCH]: {
    action: "send button events to",
    dataType: "press/release events",
  },
};

// Import device registry for proprietary cluster lookups
import { getEnhancedClusterName, getClusterInfo, isProprietaryCluster } from "./device-registry";

// Re-export device registry functions
export { getEnhancedClusterName, getClusterInfo, isProprietaryCluster };

// Helper functions
export function getClusterName(clusterId: number): string {
  // First check standard cluster names
  if (CLUSTER_NAMES[clusterId]) {
    return CLUSTER_NAMES[clusterId];
  }
  // Fall back to device registry for proprietary clusters
  return getEnhancedClusterName(clusterId);
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
// Use {source} and {target} placeholders for device names
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: "thermostat-contact-window",
    sourceDeviceTypes: [769],  // Thermostat
    targetDeviceTypes: [21],   // Contact Sensor
    title: "Turn off heating when window opens",
    description: "Automatically pause heating/cooling when a window or door is opened to save energy.",
    why: "This thermostat doesn't have a client cluster for Boolean State (contact sensors). Matter bindings require matching client/server clusters.",
    icon: "🪟",
  },
  {
    id: "thermostat-occupancy",
    sourceDeviceTypes: [769],  // Thermostat
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Adjust temperature based on occupancy",
    description: "Lower the temperature when room is unoccupied, restore when someone enters.",
    why: "This thermostat doesn't have a client cluster for Occupancy Sensing. A Home Assistant automation can bridge this gap.",
    icon: "🚶",
  },
  {
    id: "light-occupancy",
    sourceDeviceTypes: [256, 257, 258, 268, 269],  // Various light types
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Turn on light when motion detected",
    description: "Automatically turn on lights when someone enters the room.",
    why: "This light is a server (receives commands), not a client. The occupancy sensor reports state but can't send on/off commands to it.",
    icon: "💡",
  },
  {
    id: "light-contact-door",
    sourceDeviceTypes: [256, 257, 258, 268, 269],  // Various light types
    targetDeviceTypes: [21],   // Contact Sensor
    title: "Turn on light when door opens",
    description: "Automatically turn on lights when a door is opened (e.g., closet light).",
    why: "This contact sensor reports open/close state but doesn't have client clusters to control lights directly.",
    icon: "🚪",
  },
  {
    id: "plug-occupancy",
    sourceDeviceTypes: [266, 267],  // Plug-in units
    targetDeviceTypes: [263],  // Occupancy Sensor
    title: "Control device based on occupancy",
    description: "Turn on/off a device when room occupancy changes.",
    why: "This plug is a server (receives commands). The occupancy sensor can't directly control it via Matter binding.",
    icon: "🔌",
  },
  {
    id: "button-light-toggle",
    sourceDeviceTypes: [256, 257, 258, 268, 269],  // Various light types
    targetDeviceTypes: [15],  // Generic Switch
    title: "Toggle light with button press",
    description: "Press the button to toggle light on/off. Long press for dimming, double-tap for scenes.",
    why: "Generic Switch emits button events (press/release/multi-press) rather than state changes. Home Assistant automations can respond to these events to control lights.",
    icon: "🔘",
  },
  {
    id: "button-plug-toggle",
    sourceDeviceTypes: [266, 267],  // Plug-in units
    targetDeviceTypes: [15],  // Generic Switch
    title: "Toggle device with button press",
    description: "Use a physical button to control a smart plug or outlet.",
    why: "Generic Switch emits button events that need Home Assistant automation to translate into on/off commands for the plug.",
    icon: "🔘",
  },
  {
    id: "button-scene",
    sourceDeviceTypes: [256, 257, 258, 266, 267, 268, 269, 769],  // Lights, plugs, thermostat
    targetDeviceTypes: [15],  // Generic Switch
    title: "Trigger scene with button",
    description: "Assign different scenes to single press, double press, and long press actions.",
    why: "Matter scenes via binding require specific cluster support. Home Assistant automations offer more flexibility for multi-press actions.",
    icon: "🎬",
  },
  {
    id: "button-thermostat-adjust",
    sourceDeviceTypes: [769],  // Thermostat
    targetDeviceTypes: [15],  // Generic Switch
    title: "Adjust thermostat with buttons",
    description: "Use buttons to raise/lower temperature setpoint or switch heating/cooling modes.",
    why: "Generic Switch button events need Home Assistant automation to adjust thermostat settings. Perfect for climate sensors with built-in buttons.",
    icon: "🌡️",
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

// Entity option for automation creation
export interface EntityOption {
  entity_id: string;
  name: string;
  domain: string;
  disabled?: boolean;
}

// Create automation request
export interface CreateAutomationRequest {
  template_id: string;
  source_node_id: number;
  source_endpoint_id: number;
  target_node_id: number;
  target_endpoint_id: number;
  source_device_types?: number[];
  target_device_types?: number[];
  trigger_entity_id?: string;
  action_entity_id?: string;
  alias?: string;
  preview_only?: boolean;
}

// Create automation response
export interface CreateAutomationResponse {
  success: boolean;
  automation_id?: string;
  automation_config?: Record<string, unknown>;
  available_entities?: {
    trigger: EntityOption[];
    action: EntityOption[];
  };
  message: string;
  error_code?: string;
}

// Eve thermostat schedule types
export interface EveTimeSlot {
  time: string;  // HH:MM format
  minutes: number;  // Minutes from midnight
  profile_id: string;  // Profile character (e.g., '$', '%', '&')
}

export interface EveDayAssignment {
  day: string;  // Day name
  profile_id: string;  // Profile character
}

export interface EveSchedule {
  name: string | null;
  device_serial: string | null;
  zone_id: string | null;
  time_slots: EveTimeSlot[];
  day_assignments: EveDayAssignment[];
}

export interface EveScheduleResponse {
  node_id: number;
  endpoint_id: number;
  has_eve_cluster: boolean;
  schedule: EveSchedule | null;
  vendor_id?: number | null;
  cluster_ids?: number[];
  error?: string;
}

// Eve vendor and cluster constants
export const EVE_VENDOR_ID = 4874;
export const EVE_CLUSTER_ID = 319486977;  // 0x130AFC01

// =============================================================================
// Thermostat Schedule Types (Standard Matter)
// =============================================================================

// Days of week as used by Matter schedule commands
export type ScheduleDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "away";

export const SCHEDULE_DAYS: ScheduleDay[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "away"
];

export const WEEKDAYS: ScheduleDay[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
export const WEEKEND: ScheduleDay[] = ["saturday", "sunday"];

// A single schedule transition (time + temperature)
export interface ScheduleTransition {
  transition_time: number;  // Minutes from midnight (0-1439)
  heat_setpoint: number | null;  // Temperature in °C
  cool_setpoint: number | null;  // Temperature in °C
}

// Full schedule response from backend
export interface WeeklySchedule {
  day_of_week: number;  // Bitmap: bit 0=Sun, bit 1=Mon, ..., bit 6=Sat, bit 7=Away
  day_names: ScheduleDay[];  // Parsed day names
  mode: number;  // Bitmap: bit 0=Heat, bit 1=Cool
  mode_names: ("heat" | "cool")[];  // Parsed mode names
  transitions: ScheduleTransition[];
}

// Response types
export interface GetScheduleResponse {
  schedule: WeeklySchedule;
}

export interface SetScheduleResponse {
  success: boolean;
}

export interface ClearScheduleResponse {
  success: boolean;
}

// Helper: Convert minutes to time string (HH:MM)
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Helper: Convert time string (HH:MM) to minutes from midnight
export function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// Helper: Format temperature with unit
export function formatTemperature(celsius: number | null, unit: "°C" | "°F" = "°C"): string {
  if (celsius === null) return "—";
  if (unit === "°F") {
    return `${Math.round(celsius * 9/5 + 32)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
}

// Helper: Check if endpoint has thermostat with schedule support
export function hasThermostatSchedule(endpoint: MatterEndpoint): boolean {
  // Must have thermostat cluster and be device type 769 (Thermostat)
  return (
    endpoint.server_clusters.includes(CLUSTER_THERMOSTAT) &&
    endpoint.device_types.some(dt => dt.id === 769)
  );
}

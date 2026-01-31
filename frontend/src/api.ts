/**
 * WebSocket API client for Matter Binding Helper
 */

import type {
  HomeAssistant,
  ListNodesResponse,
  ListBindingsResponse,
  ListGroupsResponse,
  ListACLResponse,
  SuccessResponse,
  BindingVerificationResponse,
  ProvisionACLResponse,
  ProvisionACLForBindingsResponse,
  EveScheduleResponse,
  GetScheduleResponse,
  SetScheduleResponse,
  ClearScheduleResponse,
  ScheduleDay,
  ScheduleTransition,
  CreateAutomationRequest,
  CreateAutomationResponse,
} from "./types";

const DOMAIN = "matter_binding_helper";

export async function listNodes(hass: HomeAssistant): Promise<ListNodesResponse> {
  return hass.callWS({
    type: `${DOMAIN}/list_nodes`,
  });
}

export async function listBindings(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number
): Promise<ListBindingsResponse> {
  return hass.callWS({
    type: `${DOMAIN}/list_bindings`,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

export async function createBinding(
  hass: HomeAssistant,
  sourceNodeId: number,
  sourceEndpointId: number,
  clusterId: number,
  targetNodeId?: number,
  targetEndpointId?: number,
  targetGroupId?: number,
  verify: boolean = true,
  provisionACL: boolean = true
): Promise<BindingVerificationResponse> {
  return hass.callWS({
    type: `${DOMAIN}/create_binding`,
    source_node_id: sourceNodeId,
    source_endpoint_id: sourceEndpointId,
    cluster_id: clusterId,
    verify,
    provision_acl: provisionACL,
    ...(targetNodeId !== undefined && { target_node_id: targetNodeId }),
    ...(targetEndpointId !== undefined && { target_endpoint_id: targetEndpointId }),
    ...(targetGroupId !== undefined && { target_group_id: targetGroupId }),
  });
}

export async function deleteBinding(
  hass: HomeAssistant,
  sourceNodeId: number,
  sourceEndpointId: number,
  targetNodeId?: number,
  targetEndpointId?: number,
  targetGroupId?: number,
  verify: boolean = true
): Promise<BindingVerificationResponse> {
  return hass.callWS({
    type: `${DOMAIN}/delete_binding`,
    source_node_id: sourceNodeId,
    source_endpoint_id: sourceEndpointId,
    verify,
    ...(targetNodeId !== undefined && { target_node_id: targetNodeId }),
    ...(targetEndpointId !== undefined && { target_endpoint_id: targetEndpointId }),
    ...(targetGroupId !== undefined && { target_group_id: targetGroupId }),
  });
}

/**
 * Force re-read bindings from the device to verify current state.
 * This bypasses any cached state and reads directly from the Matter device.
 */
export async function verifyBindings(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number
): Promise<BindingVerificationResponse> {
  return hass.callWS({
    type: `${DOMAIN}/verify_bindings`,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

/**
 * Get Access Control List entries for a node.
 * ACL entries define which devices/subjects have permission to control this node.
 *
 * @param hass - Home Assistant instance
 * @param nodeId - Matter node ID
 */
export async function listACL(
  hass: HomeAssistant,
  nodeId: number
): Promise<ListACLResponse> {
  return hass.callWS({
    type: `${DOMAIN}/list_acl`,
    node_id: nodeId,
  });
}

/**
 * Provision an ACL entry on the target device to allow the source node
 * to control the specified endpoint/cluster.
 *
 * @param hass - Home Assistant instance
 * @param targetNodeId - Node that will receive the ACL entry (the device being controlled)
 * @param targetEndpointId - Endpoint on the target device
 * @param sourceNodeId - Node that will be granted access (the controller)
 * @param clusterId - Cluster the source is allowed to access
 */
export async function provisionACL(
  hass: HomeAssistant,
  targetNodeId: number,
  targetEndpointId: number,
  sourceNodeId: number,
  clusterId: number | null  // null means "any cluster" per Matter spec
): Promise<ProvisionACLResponse> {
  return hass.callWS({
    type: `${DOMAIN}/provision_acl`,
    target_node_id: targetNodeId,
    target_endpoint_id: targetEndpointId,
    source_node_id: sourceNodeId,
    ...(clusterId !== null && { cluster_id: clusterId }),
  });
}

/**
 * Remove an ACL entry from a target device.
 *
 * @param hass - Home Assistant instance
 * @param targetNodeId - Node to remove the ACL entry from
 * @param sourceNodeId - Node whose access is being revoked
 * @param targetEndpointId - Optional: specific endpoint (if omitted, removes all matching)
 * @param clusterId - Optional: specific cluster (if omitted, removes all matching)
 */
export async function removeACL(
  hass: HomeAssistant,
  targetNodeId: number,
  sourceNodeId: number,
  targetEndpointId?: number | null,
  clusterId?: number | null  // null/undefined means "any cluster"
): Promise<ProvisionACLResponse> {
  return hass.callWS({
    type: `${DOMAIN}/remove_acl`,
    target_node_id: targetNodeId,
    source_node_id: sourceNodeId,
    ...(targetEndpointId != null && { target_endpoint_id: targetEndpointId }),
    ...(clusterId != null && { cluster_id: clusterId }),
  });
}

/**
 * Bulk provision ACLs for all existing bindings on an endpoint.
 * Used for "Repair All" functionality to fix bindings created before ACL provisioning.
 *
 * @param hass - Home Assistant instance
 * @param nodeId - Source node with bindings
 * @param endpointId - Endpoint with bindings to repair
 */
export async function provisionACLForBindings(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number
): Promise<ProvisionACLForBindingsResponse> {
  return hass.callWS({
    type: `${DOMAIN}/provision_acl_for_bindings`,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

export async function listGroups(hass: HomeAssistant): Promise<ListGroupsResponse> {
  return hass.callWS({
    type: `${DOMAIN}/list_groups`,
  });
}

export async function createGroup(
  hass: HomeAssistant,
  groupId: number,
  name: string
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/create_group`,
    group_id: groupId,
    name,
  });
}

export async function deleteGroup(
  hass: HomeAssistant,
  groupId: number
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/delete_group`,
    group_id: groupId,
  });
}

export async function addToGroup(
  hass: HomeAssistant,
  groupId: number,
  nodeId: number,
  endpointId: number
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/add_to_group`,
    group_id: groupId,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

export async function removeFromGroup(
  hass: HomeAssistant,
  groupId: number,
  nodeId: number,
  endpointId: number
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/remove_from_group`,
    group_id: groupId,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

export async function getEveSchedule(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number = 1
): Promise<EveScheduleResponse> {
  return hass.callWS({
    type: `${DOMAIN}/get_eve_schedule`,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

// =============================================================================
// Thermostat Schedule API (Standard Matter)
// =============================================================================

/**
 * Get the weekly schedule from a thermostat.
 *
 * @param hass - Home Assistant instance
 * @param nodeId - Matter node ID
 * @param endpointId - Endpoint with thermostat cluster
 * @param days - Optional list of days to retrieve (default: all)
 * @param heat - Request heat setpoints (default: true)
 * @param cool - Request cool setpoints (default: false)
 */
export async function getThermostatSchedule(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number,
  days?: ScheduleDay[],
  heat: boolean = true,
  cool: boolean = false
): Promise<GetScheduleResponse> {
  return hass.callWS({
    type: `${DOMAIN}/get_schedule`,
    node_id: nodeId,
    endpoint_id: endpointId,
    ...(days && { days }),
    heat,
    cool,
  });
}

/**
 * Set the weekly schedule on a thermostat.
 *
 * @param hass - Home Assistant instance
 * @param nodeId - Matter node ID
 * @param endpointId - Endpoint with thermostat cluster
 * @param days - Days this schedule applies to
 * @param transitions - List of time/temperature transitions (max 10)
 * @param heat - Schedule includes heat setpoints (default: true)
 * @param cool - Schedule includes cool setpoints (default: false)
 */
export async function setThermostatSchedule(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number,
  days: ScheduleDay[],
  transitions: ScheduleTransition[],
  heat: boolean = true,
  cool: boolean = false
): Promise<SetScheduleResponse> {
  return hass.callWS({
    type: `${DOMAIN}/set_schedule`,
    node_id: nodeId,
    endpoint_id: endpointId,
    days,
    transitions,
    heat,
    cool,
  });
}

/**
 * Clear all weekly schedules on a thermostat.
 *
 * @param hass - Home Assistant instance
 * @param nodeId - Matter node ID
 * @param endpointId - Endpoint with thermostat cluster
 */
export async function clearThermostatSchedule(
  hass: HomeAssistant,
  nodeId: number,
  endpointId: number
): Promise<ClearScheduleResponse> {
  return hass.callWS({
    type: `${DOMAIN}/clear_schedule`,
    node_id: nodeId,
    endpoint_id: endpointId,
  });
}

// =============================================================================
// Automation Creation API
// =============================================================================

/**
 * Create or preview a Home Assistant automation from a template.
 *
 * @param hass - Home Assistant instance
 * @param request - Automation creation request
 *
 * @example
 * // Preview an automation
 * const preview = await createAutomation(hass, {
 *   template_id: "light-occupancy",
 *   source_node_id: 1,
 *   source_endpoint_id: 1,
 *   target_node_id: 2,
 *   target_endpoint_id: 1,
 *   preview_only: true,
 * });
 *
 * // Create an automation with user-selected entities
 * const result = await createAutomation(hass, {
 *   template_id: "light-occupancy",
 *   source_node_id: 1,
 *   source_endpoint_id: 1,
 *   target_node_id: 2,
 *   target_endpoint_id: 1,
 *   trigger_entity_id: "binary_sensor.occupancy_sensor",
 *   action_entity_id: "light.living_room",
 *   alias: "Living room motion light",
 * });
 */
export async function createAutomation(
  hass: HomeAssistant,
  request: CreateAutomationRequest
): Promise<CreateAutomationResponse> {
  return hass.callWS({
    type: `${DOMAIN}/create_automation`,
    template_id: request.template_id,
    source_node_id: request.source_node_id,
    source_endpoint_id: request.source_endpoint_id,
    target_node_id: request.target_node_id,
    target_endpoint_id: request.target_endpoint_id,
    ...(request.source_device_types && { source_device_types: request.source_device_types }),
    ...(request.target_device_types && { target_device_types: request.target_device_types }),
    ...(request.trigger_entity_id && { trigger_entity_id: request.trigger_entity_id }),
    ...(request.action_entity_id && { action_entity_id: request.action_entity_id }),
    ...(request.alias && { alias: request.alias }),
    preview_only: request.preview_only ?? false,
  });
}

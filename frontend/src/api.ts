/**
 * WebSocket API client for Matter Binding Helper
 */

import type {
  HomeAssistant,
  ListNodesResponse,
  ListBindingsResponse,
  ListGroupsResponse,
  SuccessResponse,
  BindingVerificationResponse,
  EveScheduleResponse,
  GetScheduleResponse,
  SetScheduleResponse,
  ClearScheduleResponse,
  ScheduleDay,
  ScheduleTransition,
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
  verify: boolean = true
): Promise<BindingVerificationResponse> {
  return hass.callWS({
    type: `${DOMAIN}/create_binding`,
    source_node_id: sourceNodeId,
    source_endpoint_id: sourceEndpointId,
    cluster_id: clusterId,
    verify,
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

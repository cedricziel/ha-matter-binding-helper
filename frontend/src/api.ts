/**
 * WebSocket API client for Matter Binding Helper
 */

import type {
  HomeAssistant,
  ListNodesResponse,
  ListBindingsResponse,
  ListGroupsResponse,
  SuccessResponse,
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
  targetGroupId?: number
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/create_binding`,
    source_node_id: sourceNodeId,
    source_endpoint_id: sourceEndpointId,
    cluster_id: clusterId,
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
  targetGroupId?: number
): Promise<SuccessResponse> {
  return hass.callWS({
    type: `${DOMAIN}/delete_binding`,
    source_node_id: sourceNodeId,
    source_endpoint_id: sourceEndpointId,
    ...(targetNodeId !== undefined && { target_node_id: targetNodeId }),
    ...(targetEndpointId !== undefined && { target_endpoint_id: targetEndpointId }),
    ...(targetGroupId !== undefined && { target_group_id: targetGroupId }),
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

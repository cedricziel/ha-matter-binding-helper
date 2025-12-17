/**
 * Tests for API client functions
 */

import { describe, it, expect, vi } from "vitest";
import {
  provisionACL,
  removeACL,
  provisionACLForBindings,
  createBinding,
} from "./api";
import type { HomeAssistant } from "./types";

// Mock HomeAssistant instance
const createMockHass = () => ({
  callWS: vi.fn(),
});

describe("ACL API functions", () => {
  describe("provisionACL", () => {
    it("calls WebSocket with correct parameters", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        message: "ACL provisioned",
        acl_entries_count: 2,
      });

      const result = await provisionACL(
        mockHass as unknown as HomeAssistant,
        1, // targetNodeId
        1, // targetEndpointId
        2, // sourceNodeId
        0x0006 // clusterId (On/Off)
      );

      expect(mockHass.callWS).toHaveBeenCalledWith({
        type: "matter_binding_helper/provision_acl",
        target_node_id: 1,
        target_endpoint_id: 1,
        source_node_id: 2,
        cluster_id: 0x0006,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("removeACL", () => {
    it("calls WebSocket with all parameters", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        message: "ACL removed",
        acl_entries_count: 1,
      });

      const result = await removeACL(
        mockHass as unknown as HomeAssistant,
        1, // targetNodeId
        2, // sourceNodeId
        1, // targetEndpointId
        0x0008 // clusterId
      );

      expect(mockHass.callWS).toHaveBeenCalledWith({
        type: "matter_binding_helper/remove_acl",
        target_node_id: 1,
        source_node_id: 2,
        target_endpoint_id: 1,
        cluster_id: 0x0008,
      });
      expect(result.success).toBe(true);
    });

    it("calls WebSocket without optional parameters", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        message: "ACL removed",
        acl_entries_count: 0,
      });

      await removeACL(
        mockHass as unknown as HomeAssistant,
        1, // targetNodeId
        2 // sourceNodeId - no endpoint or cluster
      );

      expect(mockHass.callWS).toHaveBeenCalledWith({
        type: "matter_binding_helper/remove_acl",
        target_node_id: 1,
        source_node_id: 2,
      });
    });
  });

  describe("provisionACLForBindings", () => {
    it("calls bulk repair endpoint", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        results: [
          { target_node_id: 1, target_endpoint_id: 1, cluster_id: 6, success: true, message: "OK" },
        ],
        total: 1,
        succeeded: 1,
      });

      const result = await provisionACLForBindings(
        mockHass as unknown as HomeAssistant,
        2, // nodeId
        1 // endpointId
      );

      expect(mockHass.callWS).toHaveBeenCalledWith({
        type: "matter_binding_helper/provision_acl_for_bindings",
        node_id: 2,
        endpoint_id: 1,
      });
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
    });
  });

  describe("createBinding", () => {
    it("calls WebSocket with provisionACL parameter defaulting to true", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        verified: true,
        message: "Binding created",
        bindings_found: 1,
        error_type: "success",
      });

      await createBinding(
        mockHass as unknown as HomeAssistant,
        2, // sourceNodeId
        1, // sourceEndpointId
        0x0006, // clusterId
        1, // targetNodeId
        1 // targetEndpointId
      );

      expect(mockHass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "matter_binding_helper/create_binding",
          source_node_id: 2,
          source_endpoint_id: 1,
          cluster_id: 0x0006,
          target_node_id: 1,
          target_endpoint_id: 1,
          verify: true,
          provision_acl: true, // Default
        })
      );
    });

    it("calls WebSocket with provisionACL set to false", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        verified: true,
        message: "Binding created",
        bindings_found: 1,
        error_type: "success",
      });

      await createBinding(
        mockHass as unknown as HomeAssistant,
        2, // sourceNodeId
        1, // sourceEndpointId
        0x0006, // clusterId
        1, // targetNodeId
        1, // targetEndpointId
        undefined, // targetGroupId
        true, // verify
        false // provisionACL = false
      );

      expect(mockHass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          provision_acl: false,
        })
      );
    });

    it("handles group binding", async () => {
      const mockHass = createMockHass();
      mockHass.callWS.mockResolvedValue({
        success: true,
        verified: true,
        message: "Group binding created",
        bindings_found: 1,
        error_type: "success",
      });

      await createBinding(
        mockHass as unknown as HomeAssistant,
        2, // sourceNodeId
        1, // sourceEndpointId
        0x0006, // clusterId
        undefined, // targetNodeId
        undefined, // targetEndpointId
        100 // targetGroupId
      );

      expect(mockHass.callWS).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "matter_binding_helper/create_binding",
          target_group_id: 100,
        })
      );
    });
  });
});

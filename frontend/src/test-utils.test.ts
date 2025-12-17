/**
 * Tests for test utilities
 *
 * Ensures the mock factories and helpers work correctly.
 */

import { describe, it, expect, vi } from "vitest";
import {
  createMockHass,
  createDeviceInfo,
  createEntityInfo,
  createEndpoint,
  createNode,
  createBinding,
  createBindingWithContext,
  createACLEntry,
  createBindingRecommendation,
  createSwitchToLightScenario,
  createMissingACLScenario,
  createWithACLScenario,
  TEST_CLUSTERS,
} from "./test-utils";

describe("TEST_CLUSTERS", () => {
  it("contains correct cluster IDs", () => {
    expect(TEST_CLUSTERS.ON_OFF).toBe(0x0006);
    expect(TEST_CLUSTERS.LEVEL_CONTROL).toBe(0x0008);
    expect(TEST_CLUSTERS.COLOR_CONTROL).toBe(0x0300);
    expect(TEST_CLUSTERS.BINDING).toBe(0x001e);
  });
});

describe("createMockHass", () => {
  it("creates a mock HomeAssistant object", () => {
    const hass = createMockHass();

    expect(hass.callWS).toBeDefined();
    expect(hass.callService).toBeDefined();
    expect(hass.connection).toBeDefined();
    expect(hass.language).toBe("en");
    expect(hass.localize).toBeDefined();
  });

  it("allows custom callWS response", async () => {
    const mockResponse = { nodes: [] };
    const hass = createMockHass({ callWSResponse: mockResponse });

    const result = await hass.callWS({ type: "test" });

    expect(result).toEqual(mockResponse);
  });

  it("allows custom language", () => {
    const hass = createMockHass({ language: "de" });

    expect(hass.language).toBe("de");
  });
});

describe("createDeviceInfo", () => {
  it("creates device info with defaults", () => {
    const info = createDeviceInfo();

    expect(info.vendor_name).toBe("Test Vendor");
    expect(info.vendor_id).toBe(0x1234);
    expect(info.product_name).toBe("Test Product");
    expect(info.product_id).toBe(0x5678);
  });

  it("allows custom values", () => {
    const info = createDeviceInfo({
      vendorName: "Custom Vendor",
      vendorId: 0xabcd,
    });

    expect(info.vendor_name).toBe("Custom Vendor");
    expect(info.vendor_id).toBe(0xabcd);
  });
});

describe("createEntityInfo", () => {
  it("creates entity info with defaults", () => {
    const entity = createEntityInfo();

    expect(entity.entity_id).toBe("light.test_entity");
    expect(entity.domain).toBe("light");
    expect(entity.name).toBe("Test Entity");
    expect(entity.platform).toBe("matter");
    expect(entity.disabled).toBe(false);
  });

  it("generates entity_id from domain", () => {
    const entity = createEntityInfo({ domain: "switch" });

    expect(entity.entity_id).toBe("switch.test_entity");
    expect(entity.domain).toBe("switch");
  });
});

describe("createEndpoint", () => {
  it("creates endpoint with defaults", () => {
    const endpoint = createEndpoint();

    expect(endpoint.endpoint_id).toBe(1);
    expect(endpoint.device_types).toHaveLength(1);
    expect(endpoint.has_binding_cluster).toBe(false);
    expect(endpoint.server_clusters).toContain(TEST_CLUSTERS.ON_OFF);
    expect(endpoint.client_clusters).toEqual([]);
  });

  it("allows custom configuration", () => {
    const endpoint = createEndpoint({
      id: 2,
      hasBindingCluster: true,
      clientClusters: [TEST_CLUSTERS.ON_OFF],
      serverClusters: [TEST_CLUSTERS.LEVEL_CONTROL],
    });

    expect(endpoint.endpoint_id).toBe(2);
    expect(endpoint.has_binding_cluster).toBe(true);
    expect(endpoint.client_clusters).toContain(TEST_CLUSTERS.ON_OFF);
    expect(endpoint.server_clusters).toContain(TEST_CLUSTERS.LEVEL_CONTROL);
  });
});

describe("createNode", () => {
  it("creates node with defaults", () => {
    const node = createNode();

    expect(node.node_id).toBe(1);
    expect(node.name).toBe("Test Node");
    expect(node.available).toBe(true);
    expect(node.endpoints).toHaveLength(2);
    expect(node.device_info).toBeDefined();
  });

  it("allows custom configuration", () => {
    const node = createNode({
      nodeId: 5,
      name: "Custom Node",
      available: false,
      areaName: "Living Room",
    });

    expect(node.node_id).toBe(5);
    expect(node.name).toBe("Custom Node");
    expect(node.available).toBe(false);
    expect(node.area_name).toBe("Living Room");
  });
});

describe("createBinding", () => {
  it("creates binding with defaults", () => {
    const binding = createBinding();

    expect(binding.node_id).toBe(1);
    expect(binding.endpoint_id).toBe(1);
    expect(binding.cluster_id).toBe(TEST_CLUSTERS.ON_OFF);
    expect(binding.target_node_id).toBe(2);
    expect(binding.target_endpoint_id).toBe(1);
    expect(binding.target_group_id).toBeNull();
  });

  it("allows custom target", () => {
    const binding = createBinding({
      targetNodeId: 5,
      targetEndpointId: 3,
      clusterId: TEST_CLUSTERS.LEVEL_CONTROL,
    });

    expect(binding.target_node_id).toBe(5);
    expect(binding.target_endpoint_id).toBe(3);
    expect(binding.cluster_id).toBe(TEST_CLUSTERS.LEVEL_CONTROL);
  });
});

describe("createBindingWithContext", () => {
  it("creates binding with full context", () => {
    const bwc = createBindingWithContext();

    expect(bwc.binding).toBeDefined();
    expect(bwc.sourceNode).toBeDefined();
    expect(bwc.sourceEndpoint).toBeDefined();
    expect(bwc.targetNode).toBeDefined();
    expect(bwc.targetEndpoint).toBeDefined();
    expect(bwc.sourceNode.name).toBe("Switch");
    expect(bwc.targetNode?.name).toBe("Light");
  });
});

describe("createACLEntry", () => {
  it("creates ACL entry with defaults", () => {
    const acl = createACLEntry();

    expect(acl.privilege).toBe(3); // Operate
    expect(acl.privilege_name).toBe("Operate");
    expect(acl.auth_mode).toBe(2); // CASE
    expect(acl.subjects).toEqual([1]);
    expect(acl.targets).toHaveLength(1);
  });

  it("allows custom privilege level", () => {
    const acl = createACLEntry({
      privilege: 5,
      privilegeName: "Administer",
      subjects: [1, 2, 3],
    });

    expect(acl.privilege).toBe(5);
    expect(acl.privilege_name).toBe("Administer");
    expect(acl.subjects).toEqual([1, 2, 3]);
  });
});

describe("createBindingRecommendation", () => {
  it("creates recommendation with defaults", () => {
    const rec = createBindingRecommendation();

    expect(rec.sourceNode).toBeDefined();
    expect(rec.targetNode).toBeDefined();
    expect(rec.compatibleClusters).toContain(TEST_CLUSTERS.ON_OFF);
  });
});

describe("scenario factories", () => {
  describe("createSwitchToLightScenario", () => {
    it("creates a complete switch-to-light scenario", () => {
      const scenario = createSwitchToLightScenario();

      expect(scenario.switchNode.name).toBe("Wall Switch");
      expect(scenario.lightNode.name).toBe("Ceiling Light");
      expect(scenario.binding.node_id).toBe(1);
      expect(scenario.binding.target_node_id).toBe(2);
      expect(scenario.nodes).toHaveLength(2);
      expect(scenario.bindingWithContext).toBeDefined();
    });

    it("switch has binding cluster", () => {
      const { switchNode } = createSwitchToLightScenario();
      const switchEndpoint = switchNode.endpoints.find(
        (e) => e.endpoint_id === 1
      );

      expect(switchEndpoint?.has_binding_cluster).toBe(true);
      expect(switchEndpoint?.client_clusters).toContain(TEST_CLUSTERS.ON_OFF);
    });

    it("light has server clusters", () => {
      const { lightNode } = createSwitchToLightScenario();
      const lightEndpoint = lightNode.endpoints.find(
        (e) => e.endpoint_id === 1
      );

      expect(lightEndpoint?.server_clusters).toContain(TEST_CLUSTERS.ON_OFF);
      expect(lightEndpoint?.server_clusters).toContain(
        TEST_CLUSTERS.LEVEL_CONTROL
      );
    });
  });

  describe("createMissingACLScenario", () => {
    it("creates scenario with empty ACL entries", () => {
      const scenario = createMissingACLScenario();

      expect(scenario.aclEntries).toEqual([]);
      expect(scenario.switchNode).toBeDefined();
      expect(scenario.lightNode).toBeDefined();
    });
  });

  describe("createWithACLScenario", () => {
    it("creates scenario with ACL entries", () => {
      const scenario = createWithACLScenario();

      expect(scenario.aclEntries).toHaveLength(1);
      expect(scenario.aclEntries[0].privilege).toBe(3); // Operate
      expect(scenario.aclEntries[0].subjects).toContain(
        scenario.switchNode.node_id
      );
    });
  });
});

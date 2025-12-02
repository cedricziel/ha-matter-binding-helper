/**
 * Device Registry Integration
 *
 * Provides access to the matter-device-definitions registry for
 * looking up proprietary cluster and attribute metadata.
 */

import {
  allClusters,
  allDevices,
  findDevice,
  getCluster,
  type ClusterDefinition,
  type DeviceDefinition,
  type AttributeDefinition,
} from "@matter-survey/device-definitions";

// Re-export types for convenience
export type { ClusterDefinition, DeviceDefinition, AttributeDefinition };

// Vendor names by ID
const VENDOR_NAMES: Record<number, string> = {
  4874: "Eve",
  4447: "Aqara",
};

/**
 * Check if a cluster ID is a proprietary (vendor-specific) cluster.
 * Vendor-specific clusters have vendor ID encoded in upper bits.
 */
export function isProprietaryCluster(clusterId: number): boolean {
  // Standard clusters are < 0x10000 (65536)
  // Vendor-specific clusters have vendor ID in bits 16-31
  return clusterId >= 0x10000;
}

/**
 * Extract vendor ID from a proprietary cluster ID.
 */
export function getVendorIdFromCluster(clusterId: number): number | null {
  if (!isProprietaryCluster(clusterId)) {
    return null;
  }
  // Vendor ID is in bits 16-31, but the format varies
  // For Eve: 0x130AFC01 -> vendor 0x130A (4874)
  // For Aqara: 0x115FFC02 -> vendor 0x115F (4447)
  // The pattern is: upper 16 bits contain vendor ID
  return (clusterId >> 16) & 0xffff;
}

/**
 * Get vendor name from vendor ID.
 */
export function getVendorName(vendorId: number): string {
  return VENDOR_NAMES[vendorId] || `Vendor ${vendorId}`;
}

/**
 * Get cluster definition from the registry.
 */
export function getClusterDefinition(
  clusterId: number
): ClusterDefinition | undefined {
  return getCluster(clusterId);
}

/**
 * Get enhanced cluster name, including vendor name for proprietary clusters.
 */
export function getEnhancedClusterName(clusterId: number): string {
  // First check the registry
  const clusterDef = getCluster(clusterId);
  if (clusterDef) {
    return clusterDef.name;
  }

  // Check if it's a proprietary cluster
  if (isProprietaryCluster(clusterId)) {
    const vendorId = getVendorIdFromCluster(clusterId);
    if (vendorId) {
      const vendorName = getVendorName(vendorId);
      return `${vendorName} Proprietary (0x${clusterId.toString(16)})`;
    }
    return `Proprietary (0x${clusterId.toString(16)})`;
  }

  return `Cluster 0x${clusterId.toString(16).padStart(4, "0")}`;
}

/**
 * Get cluster info with full metadata.
 */
export interface ClusterInfo {
  id: number;
  name: string;
  isProprietary: boolean;
  vendorId: number | null;
  vendorName: string | null;
  description: string | null;
  attributes: AttributeDefinition[];
}

export function getClusterInfo(clusterId: number): ClusterInfo {
  const clusterDef = getCluster(clusterId);
  const isProprietary = isProprietaryCluster(clusterId);
  const vendorId = isProprietary ? getVendorIdFromCluster(clusterId) : null;

  return {
    id: clusterId,
    name: clusterDef?.name || getEnhancedClusterName(clusterId),
    isProprietary,
    vendorId,
    vendorName: vendorId ? getVendorName(vendorId) : null,
    description: clusterDef?.description || null,
    attributes: clusterDef?.attributes || [],
  };
}

/**
 * Find a device definition that matches the given fingerprint.
 */
export function findMatchingDevice(
  vendorId: number,
  clusterIds: number[],
  deviceTypes: number[]
): DeviceDefinition | undefined {
  return findDevice(vendorId, clusterIds, deviceTypes);
}

/**
 * Get all proprietary clusters from the registry.
 */
export function getAllProprietaryClusters(): ClusterDefinition[] {
  return allClusters;
}

/**
 * Get all device definitions from the registry.
 */
export function getAllDevices(): DeviceDefinition[] {
  return allDevices;
}

/**
 * Tests for ACL logic helpers
 */

import { describe, it, expect } from "vitest";
import {
  getRecommendedPrivilege,
  CLUSTER_PRIVILEGE_MAP,
  DEFAULT_CLUSTER_PRIVILEGE,
  ACL_PRIVILEGE_OPERATE,
  PRIVILEGE_OPTIONS,
} from "./acl-logic";
import {
  CLUSTER_ON_OFF,
  CLUSTER_LEVEL_CONTROL,
  CLUSTER_COLOR_CONTROL,
  CLUSTER_THERMOSTAT,
  CLUSTER_SCENES,
} from "./types";

describe("getRecommendedPrivilege", () => {
  it("returns OPERATE for On/Off cluster", () => {
    expect(getRecommendedPrivilege(CLUSTER_ON_OFF)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns OPERATE for Level Control cluster", () => {
    expect(getRecommendedPrivilege(CLUSTER_LEVEL_CONTROL)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns OPERATE for Color Control cluster", () => {
    expect(getRecommendedPrivilege(CLUSTER_COLOR_CONTROL)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns OPERATE for Thermostat cluster", () => {
    expect(getRecommendedPrivilege(CLUSTER_THERMOSTAT)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns OPERATE for Scenes cluster", () => {
    expect(getRecommendedPrivilege(CLUSTER_SCENES)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns OPERATE for Door Lock cluster (0x0101)", () => {
    expect(getRecommendedPrivilege(0x0101)).toBe(ACL_PRIVILEGE_OPERATE);
  });

  it("returns default OPERATE for unknown clusters", () => {
    expect(getRecommendedPrivilege(0x9999)).toBe(DEFAULT_CLUSTER_PRIVILEGE);
    expect(getRecommendedPrivilege(0xFFFF)).toBe(DEFAULT_CLUSTER_PRIVILEGE);
    expect(getRecommendedPrivilege(12345)).toBe(DEFAULT_CLUSTER_PRIVILEGE);
  });

  it("returns OPERATE as the default privilege", () => {
    expect(DEFAULT_CLUSTER_PRIVILEGE).toBe(ACL_PRIVILEGE_OPERATE);
  });
});

describe("CLUSTER_PRIVILEGE_MAP", () => {
  it("contains all standard control clusters", () => {
    expect(CLUSTER_PRIVILEGE_MAP[CLUSTER_ON_OFF]).toBeDefined();
    expect(CLUSTER_PRIVILEGE_MAP[CLUSTER_LEVEL_CONTROL]).toBeDefined();
    expect(CLUSTER_PRIVILEGE_MAP[CLUSTER_COLOR_CONTROL]).toBeDefined();
    expect(CLUSTER_PRIVILEGE_MAP[CLUSTER_THERMOSTAT]).toBeDefined();
    expect(CLUSTER_PRIVILEGE_MAP[CLUSTER_SCENES]).toBeDefined();
  });

  it("maps all clusters to OPERATE privilege", () => {
    for (const clusterId of Object.keys(CLUSTER_PRIVILEGE_MAP)) {
      expect(CLUSTER_PRIVILEGE_MAP[Number(clusterId)]).toBe(ACL_PRIVILEGE_OPERATE);
    }
  });
});

describe("PRIVILEGE_OPTIONS", () => {
  it("contains View, Operate, and Manage options", () => {
    const labels = PRIVILEGE_OPTIONS.map(opt => opt.label);
    expect(labels).toContain("View");
    expect(labels).toContain("Operate");
    expect(labels).toContain("Manage");
  });

  it("has correct privilege values", () => {
    const viewOption = PRIVILEGE_OPTIONS.find(opt => opt.label === "View");
    const operateOption = PRIVILEGE_OPTIONS.find(opt => opt.label === "Operate");
    const manageOption = PRIVILEGE_OPTIONS.find(opt => opt.label === "Manage");

    expect(viewOption?.value).toBe(1);
    expect(operateOption?.value).toBe(3);
    expect(manageOption?.value).toBe(4);
  });

  it("has descriptions for all options", () => {
    for (const option of PRIVILEGE_OPTIONS) {
      expect(option.description).toBeTruthy();
      expect(option.description.length).toBeGreaterThan(10);
    }
  });
});

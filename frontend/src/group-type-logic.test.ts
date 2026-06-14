/**
 * Tests for group-type-logic — the pure helpers that turn a group's recorded
 * cluster set (the integration's type authority) into UI behaviour.
 */

import { describe, it, expect } from "vitest";
import {
  GROUP_CATEGORIES,
  CUSTOM_CATEGORY_ID,
  groupControlClusters,
  endpointMatchesGroup,
  groupTypeLabel,
  groupDefaultCluster,
} from "./group-type-logic";

const CLUSTER_ON_OFF = 0x0006;
const CLUSTER_LEVEL_CONTROL = 0x0008;
const CLUSTER_COLOR_CONTROL = 0x0300;
const CLUSTER_WINDOW_COVERING = 0x0102;

const ep = (...server_clusters: number[]) => ({ server_clusters });

describe("GROUP_CATEGORIES", () => {
  it("offers Lights, Outlets and Window coverings presets", () => {
    expect(GROUP_CATEGORIES.map((c) => c.id)).toEqual([
      "lights",
      "outlets",
      "covers",
    ]);
  });

  it("never collides with the custom id", () => {
    expect(GROUP_CATEGORIES.some((c) => c.id === CUSTOM_CATEGORY_ID)).toBe(false);
  });

  it("maps the Lights preset to on/off, level and color", () => {
    const lights = GROUP_CATEGORIES.find((c) => c.id === "lights")!;
    expect(lights.clusters).toEqual([
      CLUSTER_ON_OFF,
      CLUSTER_LEVEL_CONTROL,
      CLUSTER_COLOR_CONTROL,
    ]);
  });
});

describe("groupControlClusters", () => {
  it("returns the clusters of a typed group", () => {
    expect(groupControlClusters({ clusters: [CLUSTER_ON_OFF] })).toEqual([
      CLUSTER_ON_OFF,
    ]);
  });

  it("returns [] for an untyped/legacy group", () => {
    expect(groupControlClusters({})).toEqual([]);
    expect(groupControlClusters({ clusters: undefined })).toEqual([]);
  });
});

describe("endpointMatchesGroup", () => {
  it("matches when the endpoint exposes one of the group's clusters", () => {
    expect(
      endpointMatchesGroup(ep(CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL), [
        CLUSTER_ON_OFF,
        CLUSTER_LEVEL_CONTROL,
        CLUSTER_COLOR_CONTROL,
      ])
    ).toBe(true);
  });

  it("rejects an endpoint that exposes none of the group's clusters", () => {
    expect(
      endpointMatchesGroup(ep(CLUSTER_WINDOW_COVERING), [CLUSTER_ON_OFF])
    ).toBe(false);
  });

  it("matches everything for an untyped group", () => {
    expect(endpointMatchesGroup(ep(CLUSTER_WINDOW_COVERING), [])).toBe(true);
  });

  it("matches an on/off plug against a Lights group (shared On/Off)", () => {
    // A plug only speaks On/Off, but a Lights group commands On/Off too, so the
    // plug is a legitimate member for that part of the group.
    expect(
      endpointMatchesGroup(ep(CLUSTER_ON_OFF), [
        CLUSTER_ON_OFF,
        CLUSTER_LEVEL_CONTROL,
        CLUSTER_COLOR_CONTROL,
      ])
    ).toBe(true);
  });
});

describe("groupTypeLabel", () => {
  it("names a preset cluster set", () => {
    expect(
      groupTypeLabel([CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_COLOR_CONTROL])
    ).toBe("Lights");
    expect(groupTypeLabel([CLUSTER_ON_OFF])).toBe("Outlets & switches");
    expect(groupTypeLabel([CLUSTER_WINDOW_COVERING])).toBe("Window coverings");
  });

  it("is order-insensitive when matching a preset", () => {
    expect(
      groupTypeLabel([CLUSTER_COLOR_CONTROL, CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL])
    ).toBe("Lights");
  });

  it("falls back to cluster names for a non-preset set", () => {
    expect(groupTypeLabel([CLUSTER_LEVEL_CONTROL])).toBe("Level Control");
  });

  it("labels an untyped group as Any type", () => {
    expect(groupTypeLabel([])).toBe("Any type");
  });
});

describe("groupDefaultCluster", () => {
  it("returns the primary (first) cluster", () => {
    expect(
      groupDefaultCluster([CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL])
    ).toBe(CLUSTER_ON_OFF);
  });

  it("returns null for an untyped group", () => {
    expect(groupDefaultCluster([])).toBeNull();
  });
});

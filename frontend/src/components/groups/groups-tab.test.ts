/**
 * Tests for GroupsTab component
 */

import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import {
  captureEvents,
  elementUpdated,
  queryShadow,
  queryShadowAll,
} from "../../test-utils";

// Import component
import "./groups-tab";
import type { GroupsTab } from "./groups-tab";
import type { MatterGroup } from "../../types";

describe("GroupsTab", () => {
  let element: GroupsTab;

  const mockGroups: MatterGroup[] = [
    {
      group_id: 1,
      name: "Living Room Lights",
      members: [
        { node_id: 2, endpoint_id: 1 },
        { node_id: 3, endpoint_id: 1 },
      ],
    },
    {
      group_id: 2,
      name: "Kitchen",
      members: [
        { node_id: 4, endpoint_id: 1 },
      ],
    },
  ];

  afterEach(() => {
    element?.remove();
  });

  describe("rendering", () => {
    it("renders card with header", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${[]}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const header = queryShadow(element, ".card-header");
      expect(header?.textContent).toContain("Matter Groups");
    });

    it("shows loading state", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .loading=${true}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const loading = queryShadow(element, ".loading");
      expect(loading).toBeTruthy();
      expect(loading?.textContent).toContain("Loading");
    });

    it("shows empty state when no groups", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${[]} .loading=${false}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const empty = queryShadow(element, ".empty-state");
      expect(empty).toBeTruthy();
      expect(empty?.textContent).toContain("No Matter groups configured");
    });

    it("renders all groups", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const cards = queryShadowAll(element, ".group-card");
      expect(cards.length).toBe(2);
    });

    it("displays group name", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const content = element.shadowRoot?.textContent;
      expect(content).toContain("Living Room Lights");
      expect(content).toContain("Kitchen");
    });

    it("displays group ID", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const content = element.shadowRoot?.textContent;
      expect(content).toContain("Group ID: 1");
      expect(content).toContain("Group ID: 2");
    });

    it("displays member count", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const content = element.shadowRoot?.textContent;
      expect(content).toContain("2 member(s)");
      expect(content).toContain("1 member(s)");
    });

    it("renders member chips", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const chips = queryShadowAll(element, ".member-chip");
      expect(chips.length).toBe(3); // 2 members in group 1 + 1 member in group 2
    });

    it("shows node and endpoint in member chip", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const chip = queryShadow(element, ".member-chip");
      expect(chip?.textContent).toContain("Node 2");
      expect(chip?.textContent).toContain("EP 1");
    });
  });

  describe("events", () => {
    it("dispatches group-click when group card clicked", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const { events, cleanup } = captureEvents(element, "group-click");

      const card = queryShadow(element, ".group-card") as HTMLElement;
      card?.click();

      expect(events).toHaveLength(1);
      expect((events[0] as CustomEvent).detail.group.group_id).toBe(1);
      cleanup();
    });
  });

  describe("empty members", () => {
    it("hides member list when group has no members", async () => {
      const emptyGroup: MatterGroup[] = [
        {
          group_id: 1,
          name: "Empty Group",
          members: [],
        },
      ];

      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${emptyGroup}></matter-groups-tab>
      `);

      await elementUpdated(element);

      const memberList = queryShadow(element, ".member-list");
      expect(memberList).toBeFalsy();
    });
  });

  describe("management actions", () => {
    it("emits create-group-click when the Create Group button is clicked", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${[]}></matter-groups-tab>
      `);
      const { events } = captureEvents(element, "create-group-click");

      const buttons = queryShadowAll<HTMLButtonElement>(element, "button");
      buttons.find((b) => b.textContent?.includes("Create Group"))!.click();

      expect(events).toHaveLength(1);
    });

    it("emits delete-group (and not group-click) when Delete is clicked", async () => {
      element = await fixture<GroupsTab>(html`
        <matter-groups-tab .groups=${mockGroups}></matter-groups-tab>
      `);
      const del = captureEvents(element, "delete-group");
      const click = captureEvents(element, "group-click");

      const deleteBtn = queryShadowAll<HTMLButtonElement>(element, "button").find(
        (b) => b.textContent?.includes("Delete")
      );
      deleteBtn!.click();

      expect(del.events).toHaveLength(1);
      expect((del.events[0] as CustomEvent).detail.group.group_id).toBe(1);
      // stopPropagation prevents the card's group-click from firing.
      expect(click.events).toHaveLength(0);
    });
  });
});

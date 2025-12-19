/**
 * Tests for CreateAutomationDialog component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fixture, html, elementUpdated } from "@open-wc/testing-helpers";
import "./create-automation-dialog";
import type { CreateAutomationDialog } from "./create-automation-dialog";
import type { AutomationRecommendation, HomeAssistant, MatterNode, MatterEndpoint, AutomationTemplate } from "../../types";

// Mock the API module
vi.mock("../../api", () => ({
  createAutomation: vi.fn(),
}));

import { createAutomation } from "../../api";

// Helper to create mock HomeAssistant
function createMockHass(): HomeAssistant {
  return {
    callWS: vi.fn().mockResolvedValue({}),
  } as unknown as HomeAssistant;
}

// Helper to create mock node
function createMockNode(overrides: Partial<MatterNode> = {}): MatterNode {
  return {
    node_id: 1,
    name: "Test Node",
    available: true,
    endpoints: [],
    device_info: {
      vendor_name: "Test Vendor",
      product_name: "Test Product",
      vendor_id: null,
      product_id: null,
      node_label: null,
      hardware_version: null,
      software_version: null,
    },
    ha_device_id: "device_123",
    area_name: "Living Room",
    entities: [],
    ...overrides,
  };
}

// Helper to create mock endpoint
function createMockEndpoint(overrides: Partial<MatterEndpoint> = {}): MatterEndpoint {
  return {
    endpoint_id: 1,
    device_types: [{ id: 256, revision: 1 }],
    has_binding_cluster: false,
    server_clusters: [],
    client_clusters: [],
    ...overrides,
  };
}

// Helper to create mock template
function createMockTemplate(overrides: Partial<AutomationTemplate> = {}): AutomationTemplate {
  return {
    id: "light-occupancy",
    sourceDeviceTypes: [256],
    targetDeviceTypes: [263],
    title: "Turn on light when motion detected",
    description: "Automatically turn on lights when someone enters the room.",
    why: "Light is a server, sensor can't control it directly.",
    icon: "💡",
    ...overrides,
  };
}

// Helper to create mock recommendation
function createMockRecommendation(overrides: Partial<AutomationRecommendation> = {}): AutomationRecommendation {
  return {
    template: createMockTemplate(),
    sourceNode: createMockNode({ node_id: 1, name: "Living Room Light" }),
    sourceEndpoint: createMockEndpoint({ endpoint_id: 1, device_types: [{ id: 256, revision: 1 }] }),
    targetNode: createMockNode({ node_id: 2, name: "Motion Sensor" }),
    targetEndpoint: createMockEndpoint({ endpoint_id: 1, device_types: [{ id: 263, revision: 1 }] }),
    ...overrides,
  };
}

describe("CreateAutomationDialog", () => {
  let element: CreateAutomationDialog;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should not render when closed", async () => {
      element = await fixture(html`
        <matter-create-automation-dialog
          .open=${false}
        ></matter-create-automation-dialog>
      `);

      // Should render nothing when closed
      expect(element.shadowRoot?.querySelector(".dialog-overlay")).toBeNull();
    });

    it("should render dialog when open", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      // Mock the API to return a preview
      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test Automation" },
        available_entities: {
          trigger: [{ entity_id: "binary_sensor.motion", name: "Motion", domain: "binary_sensor" }],
          action: [{ entity_id: "light.test", name: "Test Light", domain: "light" }],
        },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);

      // Should render the dialog
      expect(element.shadowRoot?.querySelector(".dialog-overlay")).not.toBeNull();
      expect(element.shadowRoot?.querySelector(".dialog")).not.toBeNull();
    });

    it("should display device names", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);

      const deviceCards = element.shadowRoot?.querySelectorAll(".device-card-name");
      expect(deviceCards?.length).toBe(2);
    });

    it("should display template icon and title", async () => {
      const hass = createMockHass();
      const template = createMockTemplate({ icon: "🔘", title: "Custom Title" });
      const recommendation = createMockRecommendation({ template });

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);

      const header = element.shadowRoot?.querySelector(".dialog-header");
      expect(header?.textContent).toContain("🔘");
      expect(header?.textContent).toContain("Custom Title");
    });
  });

  describe("preview functionality", () => {
    it("should call API with preview_only=true when opened", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);

      // Wait for the async preview fetch
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(createAutomation).toHaveBeenCalledWith(
        hass,
        expect.objectContaining({
          preview_only: true,
          template_id: "light-occupancy",
        })
      );
    });

    it("should display loading state while fetching preview", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      // Make the API call hang
      (createAutomation as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      // Should show loading state
      expect(element.shadowRoot?.querySelector(".loading-spinner")).not.toBeNull();
    });
  });

  describe("entity selection", () => {
    it("should render entity select when multiple entities available", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: {
          trigger: [
            { entity_id: "binary_sensor.motion1", name: "Motion 1", domain: "binary_sensor" },
            { entity_id: "binary_sensor.motion2", name: "Motion 2", domain: "binary_sensor" },
          ],
          action: [{ entity_id: "light.test", name: "Test", domain: "light" }],
        },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const selects = element.shadowRoot?.querySelectorAll(".entity-select");
      expect(selects?.length).toBeGreaterThan(0);
    });
  });

  describe("form submission", () => {
    it("should call API without preview_only when create button clicked", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_id: "automation_123",
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Created successfully",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      // Find and click create button
      const createButton = element.shadowRoot?.querySelector(".btn-primary:not(.btn-loading)") as HTMLButtonElement;
      createButton?.click();

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have been called twice: once for preview, once for create
      expect(createAutomation).toHaveBeenCalledTimes(2);
      expect(createAutomation).toHaveBeenLastCalledWith(
        hass,
        expect.objectContaining({
          preview_only: false,
        })
      );
    });

    it("should dispatch created event on successful creation", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_id: "automation_123",
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Created successfully",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const events: CustomEvent[] = [];
      element.addEventListener("created", (e) => events.push(e as CustomEvent));

      const createButton = element.shadowRoot?.querySelector(".btn-primary:not(.btn-loading)") as HTMLButtonElement;
      createButton?.click();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(events.length).toBe(1);
      expect(events[0].detail.automation_id).toBe("automation_123");
    });
  });

  describe("error handling", () => {
    it("should display error message on API failure", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("API Error")
      );

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const errorMessage = element.shadowRoot?.querySelector(".error-message");
      expect(errorMessage).not.toBeNull();
      expect(errorMessage?.textContent).toContain("API Error");
    });
  });

  describe("dialog closing", () => {
    it("should dispatch close event when cancel clicked", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const events: Event[] = [];
      element.addEventListener("close", (e) => events.push(e));

      const cancelButton = element.shadowRoot?.querySelector(".btn-secondary") as HTMLButtonElement;
      cancelButton?.click();

      expect(events.length).toBe(1);
    });

    it("should dispatch close event when overlay clicked", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Success",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const events: Event[] = [];
      element.addEventListener("close", (e) => events.push(e));

      const overlay = element.shadowRoot?.querySelector(".dialog-overlay") as HTMLElement;
      overlay?.click();

      expect(events.length).toBe(1);
    });
  });

  describe("success state", () => {
    it("should show success message after creation", async () => {
      const hass = createMockHass();
      const recommendation = createMockRecommendation();

      (createAutomation as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        automation_id: "automation_123",
        automation_config: { id: "test", alias: "Test" },
        available_entities: { trigger: [], action: [] },
        message: "Created successfully",
      });

      element = await fixture(html`
        <matter-create-automation-dialog
          .hass=${hass}
          .open=${true}
          .recommendation=${recommendation}
        ></matter-create-automation-dialog>
      `);

      await elementUpdated(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const createButton = element.shadowRoot?.querySelector(".btn-primary:not(.btn-loading)") as HTMLButtonElement;
      createButton?.click();

      await new Promise((resolve) => setTimeout(resolve, 100));
      await elementUpdated(element);

      const successMessage = element.shadowRoot?.querySelector(".success-message");
      expect(successMessage).not.toBeNull();
      expect(successMessage?.textContent).toContain("Automation Created");
    });
  });
});

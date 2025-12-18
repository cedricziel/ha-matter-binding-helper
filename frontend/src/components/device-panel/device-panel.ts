/**
 * Device Panel Component
 *
 * Displays device details including header, endpoint selector, ACL section,
 * entity list, and bindings for the selected Matter device.
 */

import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type {
  MatterNode,
  MatterEndpoint,
  Binding,
  BindingWithContext,
  ACLEntry,
  EveSchedule,
  OperationErrorType,
} from "../../types";
import { getDeviceTypeName } from "../../types";
import { devicePanelStyles } from "../../styles/device-panel-styles";
import { sharedStyles } from "../../styles/shared-styles";
import { cardStyles } from "../../styles/card-styles";
import { miscStyles } from "../../styles/misc-styles";
import { findMatchingDevice, type DeviceDefinition } from "../../device-registry";

// Import sub-components
import "./endpoint-selector";
import "../acl/acl-section";
import "../bindings/binding-card";

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  message: string;
  error_type?: OperationErrorType;
}

@customElement("matter-device-panel")
export class DevicePanel extends LitElement {
  @property({ attribute: false }) node!: MatterNode;
  @property({ attribute: false }) selectedEndpoint: MatterEndpoint | null = null;
  @property({ attribute: false }) bindings: Binding[] = [];
  @property({ attribute: false }) bindingsWithContext: BindingWithContext[] = [];
  @property({ attribute: false }) nodes: MatterNode[] = [];
  @property({ attribute: false }) aclEntries: ACLEntry[] | null = null;
  @property({ attribute: false }) targetACLCache: Map<number, ACLEntry[]> = new Map();
  @property({ type: Boolean }) aclLoading = false;
  @property({ type: Boolean }) verificationInProgress = false;
  @property({ attribute: false }) verificationResult: VerificationResult | null = null;
  @property({ attribute: false }) actionInProgress: string | null = null;
  @property({ attribute: false }) eveSchedule: EveSchedule | null = null;
  @property({ type: Boolean }) eveScheduleLoading = false;
  @property({ attribute: false }) aclRepairInProgress: Map<string, boolean> = new Map();

  static styles = [
    ...devicePanelStyles,
    ...sharedStyles,
    ...cardStyles,
    ...miscStyles,
  ];

  // Domain icons for entity chips
  private _domainIcons: Record<string, string> = {
    light: "💡",
    switch: "🔌",
    event: "🔘",
    sensor: "📊",
    binary_sensor: "⚡",
    climate: "🌡️",
    cover: "🪟",
    fan: "💨",
    lock: "🔒",
    button: "⏺️",
  };

  render() {
    if (!this.node) {
      return html`<div class="empty-state">Select a device to view details</div>`;
    }

    const primaryDeviceType = this._getPrimaryDeviceType();

    return html`
      <div class="device-details">
        ${this._renderHeader(primaryDeviceType)}
        ${this._renderEndpointSelector()}
        ${this._renderAclSection()}
        ${this._renderEntityList()}
        ${this._renderDeviceRegistryInfo()}
        ${this._renderEveSchedule()}
        ${this._renderBindingsSection()}
      </div>
    `;
  }

  private _renderHeader(primaryDeviceType: string | null) {
    const deviceInfo = this.node.device_info;

    return html`
      <div class="device-header">
        <div class="device-title">
          <h2>${this.node.name}</h2>
          ${this.node.ha_device_id
            ? html`<a
                class="device-ha-link"
                href="/config/devices/device/${this.node.ha_device_id}"
                title="View in Home Assistant"
              >↗</a>`
            : nothing}
        </div>
        <div class="device-meta">
          ${primaryDeviceType
            ? html`<span class="device-type-tag">${primaryDeviceType}</span>`
            : nothing}
          ${this.node.area_name
            ? html`<span class="device-area-tag">${this.node.area_name}</span>`
            : nothing}
          ${deviceInfo?.software_version
            ? html`<span class="device-version">v${deviceInfo.software_version}</span>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderEndpointSelector() {
    return html`
      <div class="device-section">
        <matter-endpoint-selector
          .endpoints=${this.node.endpoints}
          .selectedEndpointId=${this.selectedEndpoint?.endpoint_id ?? null}
          @endpoint-selected=${this._handleEndpointSelected}
        ></matter-endpoint-selector>
      </div>
    `;
  }

  private _renderAclSection() {
    return html`
      <matter-acl-section
        .node=${this.node}
        .entries=${this.aclEntries}
        .nodes=${this.nodes}
        .loading=${this.aclLoading}
        @load-acl=${this._handleLoadAcl}
      ></matter-acl-section>
    `;
  }

  private _renderEntityList() {
    const entities = this.node.entities || [];
    if (entities.length === 0) {
      return nothing;
    }

    return html`
      <div class="device-section">
        <div class="section-header">Home Assistant Entities</div>
        <div class="entity-chips">
          ${entities
            .filter((e) => !e.disabled)
            .map(
              (entity) => html`
                <button
                  class="entity-chip"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._handleEntityClick(entity.entity_id);
                  }}
                >
                  <span class="domain-icon">${this._domainIcons[entity.domain] || "📦"}</span>
                  <span>${entity.name || entity.entity_id}</span>
                </button>
              `
            )}
        </div>
      </div>
    `;
  }

  private _renderDeviceRegistryInfo() {
    const deviceDef = this._getMatchingDeviceDefinition();
    if (!deviceDef) {
      return nothing;
    }

    const hasExtensions = deviceDef.extends && deviceDef.extends.length > 0;

    return html`
      <div class="device-section registry-info">
        <div class="section-header">
          Device Database
          <span class="registry-badge">Matched</span>
        </div>
        <div class="registry-details">
          <div class="registry-model">
            <strong>${deviceDef.vendor}</strong> ${deviceDef.model}
          </div>
          ${deviceDef.description
            ? html`<div class="registry-description">${deviceDef.description}</div>`
            : nothing}
          ${hasExtensions
            ? html`
                <div class="registry-features">
                  <span class="feature-label">Features:</span>
                  ${deviceDef.extends!.map(
                    (ext) => html`<span class="feature-tag">${ext.name}</span>`
                  )}
                </div>
              `
            : nothing}
          ${deviceDef.productUrl
            ? html`
                <a
                  class="registry-link"
                  href="${deviceDef.productUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  Product Page ↗
                </a>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderEveSchedule() {
    // Only show for Eve devices
    if (!this._isEveDevice()) {
      return nothing;
    }

    // Show loading state
    if (this.eveScheduleLoading) {
      return html`
        <div class="device-section">
          <div class="section-header">Heating Schedule</div>
          <div class="eve-schedule-loading">Loading Eve schedule...</div>
        </div>
      `;
    }

    if (!this.eveSchedule) {
      return nothing;
    }

    const profileNames: Record<string, string> = {
      '"': 'Comfort',
      '$': 'Eco',
      '%': 'Boost',
      '&': 'Off',
      '*': 'Custom',
    };

    return html`
      <div class="device-section">
        <div class="section-header">
          Heating Schedule
          ${this.eveSchedule.name
            ? html`<span class="section-context">${this.eveSchedule.name}</span>`
            : nothing}
        </div>

        ${this.eveSchedule.day_assignments.length > 0
          ? html`
              <div class="eve-schedule-grid">
                ${this.eveSchedule.day_assignments.map(
                  (day) => html`
                    <div class="eve-day-slot">
                      <div class="eve-day-name">${day.day.slice(0, 3)}</div>
                      <div class="eve-day-profile">${profileNames[day.profile_id] || day.profile_id}</div>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}

        ${this.eveSchedule.time_slots.length > 0
          ? html`
              <div class="eve-time-slots">
                ${this.eveSchedule.time_slots.map(
                  (slot) => html`
                    <div class="eve-time-slot">
                      <span class="eve-time">${slot.time}</span>
                      <span class="eve-profile">${profileNames[slot.profile_id] || slot.profile_id}</span>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderBindingsSection() {
    return html`
      <div class="device-section">
        <div class="section-header">
          Bindings
          ${this.selectedEndpoint
            ? html`
                <span class="section-context">
                  Endpoint ${this.selectedEndpoint.endpoint_id}
                </span>
                <button
                  class="btn btn-small btn-verify ${this.verificationInProgress ? "btn-loading" : ""}"
                  ?disabled=${this.verificationInProgress || this.actionInProgress !== null}
                  @click=${this._handleVerifyBindings}
                  title="Re-read bindings from device to verify"
                >
                  ${this.verificationInProgress ? "" : "✓ Verify on Device"}
                </button>
                <button
                  class="btn btn-small btn-primary"
                  @click=${this._handleAddBinding}
                >
                  Add Binding
                </button>
              `
            : nothing}
        </div>
        ${this._renderVerificationResult()}
        ${this._renderBindingsList()}
      </div>
    `;
  }

  private _renderVerificationResult() {
    if (!this.verificationResult) {
      return nothing;
    }

    const resultClass = this.verificationResult.verified
      ? "verified"
      : this.verificationResult.success
        ? "warning"
        : "error";

    const icon = this.verificationResult.verified
      ? "✓"
      : this.verificationResult.success
        ? "⚠"
        : "✗";

    return html`
      <div class="verification-result ${resultClass}">
        <span class="verification-icon">${icon}</span>
        <span class="verification-message">${this.verificationResult.message}</span>
        <button class="verification-dismiss" @click=${this._handleDismissVerification}>×</button>
      </div>
    `;
  }

  private _renderBindingsList() {
    if (!this.selectedEndpoint) {
      return html`
        <div class="empty-state-small">
          Select an endpoint with binding support to manage bindings.
        </div>
      `;
    }

    if (this.bindings.length === 0) {
      return html`
        <div class="empty-state-small">
          No bindings configured for this endpoint.
        </div>
      `;
    }

    return html`
      <div class="binding-list">
        ${this.bindings.map((binding) => {
          const bindingCtx = this._getBindingContext(binding);
          if (!bindingCtx) return nothing;

          const isGroupBinding = binding.target_group_id !== null;
          const aclStatus = !isGroupBinding
            ? this._checkBindingACL(binding)
            : { hasPermission: true, reason: "" };

          const actionKey = `delete-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
          const repairKey = `${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}-${binding.cluster_id}`;

          return html`
            <matter-binding-card
              .binding=${bindingCtx}
              .aclMissing=${!aclStatus.hasPermission}
              .aclReason=${aclStatus.reason}
              .showRepairButton=${!aclStatus.hasPermission && !isGroupBinding}
              .repairInProgress=${this.aclRepairInProgress.get(repairKey) || false}
              .deleteInProgress=${this.actionInProgress === actionKey}
              .disabled=${this.actionInProgress !== null}
              @delete-binding=${this._handleDeleteBinding}
              @repair-acl=${this._handleRepairAcl}
              @navigate-device=${this._handleNavigateDevice}
            ></matter-binding-card>
          `;
        })}
      </div>
    `;
  }

  // Helper methods

  private _getPrimaryDeviceType(): string | null {
    const primaryEndpoint = this.node.endpoints.find((e) => e.endpoint_id === 1)
      || this.node.endpoints.find((e) => e.endpoint_id > 0);
    if (primaryEndpoint && primaryEndpoint.device_types.length > 0) {
      return getDeviceTypeName(primaryEndpoint.device_types[0].id);
    }
    return null;
  }

  private _getMatchingDeviceDefinition(): DeviceDefinition | undefined {
    const vendorId = this.node.device_info?.vendor_id;
    if (!vendorId) return undefined;

    const allClusterIds = new Set<number>();
    const allDeviceTypes = new Set<number>();
    for (const endpoint of this.node.endpoints) {
      for (const clusterId of endpoint.server_clusters || []) {
        allClusterIds.add(clusterId);
      }
      for (const dt of endpoint.device_types) {
        allDeviceTypes.add(dt.id);
      }
    }

    return findMatchingDevice(vendorId, Array.from(allClusterIds), Array.from(allDeviceTypes));
  }

  private _isEveDevice(): boolean {
    return this.node.device_info?.vendor_id === 4937;
  }

  private _getBindingContext(binding: Binding): BindingWithContext | null {
    // Find from pre-computed context if available
    const found = this.bindingsWithContext.find(
      (b) =>
        b.binding.node_id === binding.node_id &&
        b.binding.endpoint_id === binding.endpoint_id &&
        b.binding.target_node_id === binding.target_node_id &&
        b.binding.target_endpoint_id === binding.target_endpoint_id &&
        b.binding.cluster_id === binding.cluster_id
    );
    if (found) return found;

    // Fallback: build context from available data
    const targetNode = this.nodes.find((n) => n.node_id === binding.target_node_id);
    const targetEndpoint = targetNode?.endpoints.find(
      (e) => e.endpoint_id === binding.target_endpoint_id
    );

    return {
      binding,
      sourceNode: this.node,
      sourceEndpoint: this.selectedEndpoint!,
      targetNode: targetNode || null,
      targetEndpoint: targetEndpoint || null,
    };
  }

  private _checkBindingACL(binding: Binding): { hasPermission: boolean; reason: string } {
    if (binding.target_node_id === null) {
      return { hasPermission: true, reason: "" };
    }

    const targetAcls = this.targetACLCache.get(binding.target_node_id);
    if (!targetAcls) {
      return { hasPermission: true, reason: "ACL not loaded" };
    }

    // Check if source node has operate permission on target
    const sourceNodeId = this.node.node_id;
    const hasPermission = targetAcls.some((acl) => {
      // Privilege 3 = Operate, 4 = Manage, 5 = Administer
      if (acl.privilege < 3) return false;
      // Check if subjects include the source node
      if (acl.subjects === null) return true; // null = all nodes
      return acl.subjects.includes(sourceNodeId);
    });

    return {
      hasPermission,
      reason: hasPermission ? "" : "Source device lacks permission on target",
    };
  }

  // Event handlers

  private _handleEndpointSelected(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("endpoint-selected", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleLoadAcl(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("load-acl", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleEntityClick(entityId: string) {
    this.dispatchEvent(new CustomEvent("entity-click", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleAddBinding() {
    this.dispatchEvent(new CustomEvent("add-binding", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleVerifyBindings() {
    this.dispatchEvent(new CustomEvent("verify-bindings", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDismissVerification() {
    this.dispatchEvent(new CustomEvent("dismiss-verification", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDeleteBinding(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent("delete-binding", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRepairAcl(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent("repair-acl", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleNavigateDevice(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent("navigate-device", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-device-panel": DevicePanel;
  }
}

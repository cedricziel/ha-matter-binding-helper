/**
 * OverviewTab component
 *
 * Container component for the overview tab that orchestrates
 * established bindings, recommendations, and automation suggestions.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles, badgeStyles } from "../../styles/shared-styles";
import { baseCardStyles, overviewCardStyles } from "../../styles/card-styles";
import { filterControlStyles, automationStyles } from "../../styles/misc-styles";
import type {
  HomeAssistant,
  BindingWithContext,
  BindingRecommendation,
  AutomationRecommendation,
} from "../../types";

// Import sub-components
import "./established-bindings";
import "./recommendation-list";
import "../dialogs/create-automation-dialog";

export interface ACLStatus {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Container for the overview tab content.
 *
 * @fires repair-all - When repair all ACLs button clicked
 * @fires verify-binding - When verify button clicked
 * @fires delete-binding - When delete button clicked
 * @fires repair-acl - When single ACL repair clicked
 * @fires create-binding - When recommendation create clicked
 * @fires navigate-device - When device link clicked
 * @fires filter-change - When same area filter toggled
 */
@customElement("matter-overview-tab")
export class OverviewTab extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    badgeStyles,
    baseCardStyles,
    overviewCardStyles,
    filterControlStyles,
    automationStyles,
    css`
      :host {
        display: block;
      }

      .overview-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--secondary-text-color);
      }

      .device-link {
        cursor: pointer;
        text-decoration: underline;
        text-decoration-style: dotted;
        text-underline-offset: 2px;
      }

      .device-link:hover {
        color: var(--primary-color);
        text-decoration-style: solid;
      }

      .overview-binding-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .binding-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .binding-description {
        flex: 1;
      }

      .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `,
  ];

  /** Home Assistant instance */
  @property({ attribute: false })
  hass?: HomeAssistant;

  /** Whether data is loading */
  @property({ type: Boolean })
  loading = false;

  /** All established bindings */
  @property({ attribute: false })
  bindings: BindingWithContext[] = [];

  /** Bindings with missing ACL */
  @property({ attribute: false })
  bindingsWithMissingACL: BindingWithContext[] = [];

  /** ACL status map for bindings */
  @property({ attribute: false })
  aclStatusMap: Map<BindingWithContext, ACLStatus> = new Map();

  /** ACL repair in progress map */
  @property({ attribute: false })
  aclRepairInProgress: Map<string, boolean> = new Map();

  /** Bulk repair in progress */
  @property({ type: Boolean })
  bulkRepairInProgress = false;

  /** Binding recommendations */
  @property({ attribute: false })
  recommendations: BindingRecommendation[] = [];

  /** Automation recommendations */
  @property({ attribute: false })
  automationRecommendations: AutomationRecommendation[] = [];

  /** Filter same area only */
  @property({ type: Boolean })
  filterSameAreaOnly = false;

  /** Whether any action is in progress */
  @property({ type: Boolean })
  actionInProgress = false;

  /** Whether verification is in progress */
  @property({ type: Boolean })
  verificationInProgress = false;

  /** Whether create automation dialog is open */
  @state()
  private _createDialogOpen = false;

  /** Selected automation recommendation for dialog */
  @state()
  private _selectedRecommendation?: AutomationRecommendation;

  render() {
    return html`
      <div class="overview-content">
        ${this.loading
          ? html`<div class="loading">Loading bindings...</div>`
          : html`
              ${this._renderEstablishedSection()}
              ${this._renderRecommendedSection()}
              ${this._renderAutomationsSection()}
            `}
      </div>

      <matter-create-automation-dialog
        .hass=${this.hass}
        .open=${this._createDialogOpen}
        .recommendation=${this._selectedRecommendation}
        @close=${this._handleDialogClose}
        @created=${this._handleAutomationCreated}
      ></matter-create-automation-dialog>
    `;
  }

  private _renderEstablishedSection() {
    return html`
      <matter-established-bindings
        .bindings=${this.bindings}
        .bindingsWithMissingACL=${this.bindingsWithMissingACL}
        .aclStatusMap=${this.aclStatusMap}
        .aclRepairInProgress=${this.aclRepairInProgress}
        .bulkRepairInProgress=${this.bulkRepairInProgress}
        .actionInProgress=${this.actionInProgress}
        .verificationInProgress=${this.verificationInProgress}
        @repair-all=${this._handleRepairAll}
        @verify-binding=${this._handleVerifyBinding}
        @delete-binding=${this._handleDeleteBinding}
        @repair-acl=${this._handleRepairAcl}
        @navigate-device=${this._handleNavigateDevice}
      ></matter-established-bindings>
    `;
  }

  private _renderRecommendedSection() {
    // Filter recommendations based on toggle
    const filteredRecommendations = this.filterSameAreaOnly
      ? this.recommendations.filter((r) => {
          const sourceArea = r.sourceNode.area_name;
          const targetArea = r.targetNode.area_name;
          return sourceArea && targetArea && sourceArea === targetArea;
        })
      : this.recommendations;

    const hiddenCount = this.recommendations.length - filteredRecommendations.length;
    const emptyMessage = this.filterSameAreaOnly && this.recommendations.length > 0
      ? "No same-area recommendations. Toggle filter to see cross-area bindings."
      : "No binding recommendations. All compatible endpoints are already bound.";

    return html`
      <div class="card overview-card">
        <div class="card-header">
          Recommended Bindings
          <span class="count-badge">${filteredRecommendations.length}</span>
        </div>
        <div class="filter-controls">
          <label>
            <span class="toggle-switch">
              <input
                type="checkbox"
                ?checked=${this.filterSameAreaOnly}
                @change=${this._handleFilterToggle}
              />
              <span class="toggle-slider"></span>
            </span>
            Same area only
          </label>
          ${this.filterSameAreaOnly && hiddenCount > 0
            ? html`<span class="filter-info">(${hiddenCount} hidden)</span>`
            : nothing}
        </div>
        <matter-recommendation-list
          .recommendations=${filteredRecommendations}
          .actionInProgress=${this.actionInProgress}
          .hideCard=${true}
          .emptyMessage=${emptyMessage}
          @create-binding=${this._handleCreateBinding}
          @navigate-device=${this._handleNavigateDevice}
        ></matter-recommendation-list>
      </div>
    `;
  }

  private _renderAutomationsSection() {
    if (this.automationRecommendations.length === 0) {
      return nothing;
    }

    return html`
      <div class="card overview-card automation-card">
        <div class="card-header">
          <span>Recommended Automations</span>
          <span class="count-badge">${this.automationRecommendations.length}</span>
        </div>
        <div class="automation-intro">
          These device combinations can't use Matter bindings directly, but Home Assistant automations can achieve the same result.
        </div>
        <div class="binding-list">
          ${this.automationRecommendations.map((r) => this._renderAutomationRow(r))}
        </div>
      </div>
    `;
  }

  private _renderAutomationRow(recommendation: AutomationRecommendation) {
    const { template, sourceNode, targetNode } = recommendation;

    return html`
      <div class="overview-binding-row automation readable">
        <div class="binding-description">
          <div class="automation-title">
            <span class="automation-icon">${template.icon}</span>
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._handleNavigateDeviceId(sourceNode.ha_device_id!)
                : nothing}
            >${sourceNode.name}</strong> + <strong
              class="${targetNode.ha_device_id ? "device-link" : ""}"
              @click=${targetNode.ha_device_id
                ? () => this._handleNavigateDeviceId(targetNode.ha_device_id!)
                : nothing}
            >${targetNode.name}</strong>
          </div>
          <div class="automation-suggestion">${template.title}</div>
          <div class="automation-why">
            <span class="why-label">Why not a binding?</span> ${template.why}
          </div>
          ${sourceNode.area_name ? html`<div class="binding-meta">${sourceNode.area_name}</div>` : nothing}
        </div>
        <button
          class="btn btn-small btn-primary"
          @click=${() => this._handleOpenCreateDialog(recommendation)}
          title="Create this automation in Home Assistant"
        >
          Create Automation
        </button>
      </div>
    `;
  }

  // Event handlers - forward to parent

  private _handleRepairAll() {
    this.dispatchEvent(new CustomEvent("repair-all", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleVerifyBinding(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("verify-binding", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDeleteBinding(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("delete-binding", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRepairAcl(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("repair-acl", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCreateBinding(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("create-binding", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleNavigateDevice(e: CustomEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("navigate-device", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleNavigateDeviceId(deviceId: string) {
    this.dispatchEvent(new CustomEvent("navigate-device", {
      detail: { deviceId },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleFilterToggle(e: Event) {
    const input = e.target as HTMLInputElement;
    this.filterSameAreaOnly = input.checked;
    this.dispatchEvent(new CustomEvent("filter-change", {
      detail: { filterSameAreaOnly: input.checked },
      bubbles: true,
      composed: true,
    }));
  }

  // Automation dialog handlers

  private _handleOpenCreateDialog(recommendation: AutomationRecommendation) {
    this._selectedRecommendation = recommendation;
    this._createDialogOpen = true;
  }

  private _handleDialogClose() {
    this._createDialogOpen = false;
    this._selectedRecommendation = undefined;
  }

  private _handleAutomationCreated(e: CustomEvent) {
    // Optionally dispatch event to parent for notification
    this.dispatchEvent(new CustomEvent("automation-created", {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-overview-tab": OverviewTab;
  }
}

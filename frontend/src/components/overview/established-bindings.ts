/**
 * EstablishedBindings component
 *
 * Displays a list of established Matter bindings with actions.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles, stateStyles, badgeStyles } from "../../styles/shared-styles";
import { baseCardStyles, overviewCardStyles } from "../../styles/card-styles";
import { repairStyles, buttonLoadingStyles } from "../../styles/misc-styles";
import type { BindingWithContext } from "../../types";
import { getClusterBindingDescription } from "../../types";

export interface ACLStatus {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Displays established bindings with verify, delete, and repair actions.
 *
 * @fires repair-all - When repair all button is clicked
 * @fires verify-binding - When verify button is clicked for a binding
 * @fires delete-binding - When delete button is clicked for a binding
 * @fires navigate-device - When a device name link is clicked
 * @fires repair-acl - When repair icon is clicked for a binding
 */
@customElement("matter-established-bindings")
export class EstablishedBindings extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    badgeStyles,
    baseCardStyles,
    overviewCardStyles,
    repairStyles,
    buttonLoadingStyles,
    css`
      :host {
        display: block;
      }

      .binding-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
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

      .overview-binding-row:hover {
        background: var(--secondary-background-color);
      }

      .overview-binding-row.binding-missing-acl {
        border-color: var(--warning-color, #ff9800);
        background: rgba(255, 152, 0, 0.05);
      }

      .binding-description {
        flex: 1;
        min-width: 0;
      }

      .binding-sentence {
        font-size: 14px;
        margin-bottom: 4px;
      }

      .binding-action {
        color: var(--secondary-text-color);
        margin: 0 4px;
      }

      .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .binding-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 12px;
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

      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        font-size: 14px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .btn-icon:hover:not(:disabled) {
        background: var(--secondary-background-color);
      }

      .btn-icon:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-icon.verify {
        color: var(--success-color, #4caf50);
      }

      .btn-icon.delete {
        color: var(--error-color, #f44336);
      }

      .acl-warning {
        margin-right: 4px;
      }

      .acl-warning-text {
        color: var(--warning-color, #ff9800);
      }

      .btn-small {
        padding: 4px 8px;
        font-size: 12px;
      }
    `,
  ];

  /** All established bindings to display */
  @property({ attribute: false })
  bindings: BindingWithContext[] = [];

  /** Bindings that are missing ACL permissions */
  @property({ attribute: false })
  bindingsWithMissingACL: BindingWithContext[] = [];

  /** Map of binding to ACL status */
  @property({ attribute: false })
  aclStatusMap: Map<BindingWithContext, ACLStatus> = new Map();

  /** Map of binding key to repair in progress status */
  @property({ attribute: false })
  aclRepairInProgress: Map<string, boolean> = new Map();

  /** Whether bulk repair is in progress */
  @property({ type: Boolean })
  bulkRepairInProgress = false;

  /** Whether any action is in progress */
  @property({ type: Boolean })
  actionInProgress = false;

  /** Whether verification is in progress */
  @property({ type: Boolean })
  verificationInProgress = false;

  render() {
    return html`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this.bindings.length}</span>
          ${this.bindingsWithMissingACL.length > 0
            ? html`
                <button
                  class="btn btn-small btn-repair ${this.bulkRepairInProgress ? "btn-loading" : ""}"
                  ?disabled=${this.bulkRepairInProgress}
                  @click=${this._handleRepairAll}
                  title="Repair ACL permissions for all bindings"
                >
                  ${this.bulkRepairInProgress ? "Repairing..." : `Repair All (${this.bindingsWithMissingACL.length})`}
                </button>
              `
            : nothing}
        </div>
        ${this.bindings.length === 0
          ? html`<div class="empty-state">No bindings configured yet.</div>`
          : html`
              <div class="binding-list">
                ${this.bindings.map((b) => this._renderBindingRow(b))}
              </div>
            `}
      </div>
    `;
  }

  private _renderBindingRow(bindingCtx: BindingWithContext) {
    const { binding, sourceNode, sourceEndpoint, targetNode } = bindingCtx;
    const targetName = targetNode?.name || `Node ${binding.target_node_id}`;
    const isGroupBinding = binding.target_group_id !== null;
    const clusterDesc = getClusterBindingDescription(binding.cluster_id);

    // Check ACL status from map or default to OK
    const aclStatus = this.aclStatusMap.get(bindingCtx) || { hasPermission: true };
    const repairKey = `${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${binding.target_node_id}-${binding.cluster_id}`;
    const isRepairing = this.aclRepairInProgress.get(repairKey) || false;

    return html`
      <div class="overview-binding-row readable ${!aclStatus.hasPermission ? "binding-missing-acl" : ""}">
        <div class="binding-description">
          <div class="binding-sentence">
            ${!aclStatus.hasPermission
              ? html`<span class="acl-warning" title="${aclStatus.reason || "Missing ACL permission"}">⚠️</span>`
              : nothing}
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._handleNavigateDevice(sourceNode.ha_device_id!)
                : nothing}
            >${sourceNode.name}</strong>
            <span class="binding-action">${clusterDesc.action}</span>
            <strong
              class="${!isGroupBinding && targetNode?.ha_device_id ? "device-link" : ""}"
              @click=${!isGroupBinding && targetNode?.ha_device_id
                ? () => this._handleNavigateDevice(targetNode.ha_device_id!)
                : nothing}
            >${isGroupBinding ? `Group ${binding.target_group_id}` : targetName}</strong>
          </div>
          <div class="binding-meta">
            #${sourceNode.node_id} EP ${sourceEndpoint.endpoint_id} → ${isGroupBinding ? `Group` : `#${binding.target_node_id} EP ${binding.target_endpoint_id}`}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
            ${!aclStatus.hasPermission
              ? html`<span class="acl-warning-text"> · ${aclStatus.reason}</span>`
              : nothing}
          </div>
        </div>
        <div class="binding-actions">
          ${!aclStatus.hasPermission && !isGroupBinding
            ? html`
                <span
                  class="repair-icon ${isRepairing ? "loading" : ""}"
                  title="Repair ACL permissions"
                  @click=${() => this._handleRepairAcl(bindingCtx)}
                >
                  ${isRepairing ? "⏳" : "🔧"}
                </span>
              `
            : nothing}
          <button
            class="btn-icon verify"
            title="Verify binding on device"
            ?disabled=${this.verificationInProgress || this.actionInProgress}
            @click=${() => this._handleVerify(bindingCtx)}
          >
            ✓
          </button>
          <button
            class="btn-icon delete"
            title="Delete binding"
            ?disabled=${this.actionInProgress}
            @click=${() => this._handleDelete(bindingCtx)}
          >
            ✕
          </button>
        </div>
      </div>
    `;
  }

  private _handleRepairAll() {
    this.dispatchEvent(new CustomEvent("repair-all", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleVerify(binding: BindingWithContext) {
    this.dispatchEvent(new CustomEvent("verify-binding", {
      detail: { binding },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDelete(binding: BindingWithContext) {
    this.dispatchEvent(new CustomEvent("delete-binding", {
      detail: { binding },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleNavigateDevice(deviceId: string) {
    this.dispatchEvent(new CustomEvent("navigate-device", {
      detail: { deviceId },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRepairAcl(binding: BindingWithContext) {
    this.dispatchEvent(new CustomEvent("repair-acl", {
      detail: { binding },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-established-bindings": EstablishedBindings;
  }
}

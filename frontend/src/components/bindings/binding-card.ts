/**
 * BindingCard component
 *
 * Displays a Matter binding with source/target device info and action buttons.
 * Supports multiple display variants and ACL warning states.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { BindingWithContext } from "../../types";
import { getClusterName, getClusterBindingDescription } from "../../types";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { bindingCardStyles } from "../../styles/card-styles";

export type BindingCardVariant = "default" | "compact" | "readable";

/**
 * Displays a single Matter binding with action buttons.
 *
 * @fires delete-binding - When delete button is clicked
 * @fires verify-binding - When verify button is clicked
 * @fires repair-acl - When repair button is clicked
 * @fires navigate-device - When a device link is clicked
 */
@customElement("matter-binding-card")
export class BindingCard extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    bindingCardStyles,
    css`
      :host {
        display: block;
      }

      .binding-card.compact {
        padding: 12px;
      }

      .binding-card.compact .binding-info {
        gap: 12px;
      }

      .binding-card.readable {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .binding-card.readable .binding-description {
        flex: 1;
      }

      .binding-card.readable .binding-sentence {
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .binding-card.readable .binding-sentence strong {
        color: var(--primary-color);
      }

      .binding-card.readable .binding-action {
        color: var(--secondary-text-color);
      }

      .binding-card.readable .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .binding-card.readable .binding-actions {
        align-self: flex-end;
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
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .btn-loading {
        opacity: 0.5;
      }
    `,
  ];

  /** The binding with full context (source/target nodes and endpoints) */
  @property({ attribute: false })
  binding!: BindingWithContext;

  /** Whether ACL permission is missing for this binding */
  @property({ type: Boolean })
  aclMissing = false;

  /** Reason for missing ACL (shown in warning banner) */
  @property({ type: String })
  aclReason = "";

  /** Whether to show the repair ACL button */
  @property({ type: Boolean })
  showRepairButton = false;

  /** Whether to show the verify binding button */
  @property({ type: Boolean })
  showVerifyButton = false;

  /** Whether ACL repair is in progress */
  @property({ type: Boolean })
  repairInProgress = false;

  /** Whether binding verification is in progress */
  @property({ type: Boolean })
  verifyInProgress = false;

  /** Whether binding deletion is in progress */
  @property({ type: Boolean })
  deleteInProgress = false;

  /** Disable all action buttons */
  @property({ type: Boolean })
  disabled = false;

  /** Display variant */
  @property({ type: String })
  variant: BindingCardVariant = "default";

  render() {
    const { binding, sourceNode, sourceEndpoint, targetNode, targetEndpoint } =
      this.binding;
    const isGroupBinding = binding.target_group_id !== null;
    const clusterName = getClusterName(binding.cluster_id);
    const clusterDesc = getClusterBindingDescription(binding.cluster_id);

    const cardClasses = [
      "binding-card",
      this.variant,
      this.aclMissing ? "binding-missing-acl" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (this.variant === "readable") {
      return this._renderReadableVariant(
        cardClasses,
        binding,
        sourceNode,
        sourceEndpoint,
        targetNode,
        isGroupBinding,
        clusterDesc
      );
    }

    return this._renderDefaultVariant(
      cardClasses,
      binding,
      targetNode,
      isGroupBinding,
      clusterName
    );
  }

  private _renderDefaultVariant(
    cardClasses: string,
    binding: BindingWithContext["binding"],
    targetNode: BindingWithContext["targetNode"],
    isGroupBinding: boolean,
    clusterName: string
  ) {
    const targetDeviceId = targetNode?.ha_device_id;
    const targetName = isGroupBinding
      ? `Group ${binding.target_group_id}`
      : targetNode?.name || `Node ${binding.target_node_id}`;

    return html`
      <div class=${cardClasses}>
        ${this.aclMissing && this.aclReason
          ? html`<div class="acl-warning-banner">⚠️ ${this.aclReason}</div>`
          : nothing}
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${isGroupBinding
                ? targetName
                : html`<span
                      class="${targetDeviceId ? "device-link" : ""}"
                      @click=${targetDeviceId
                        ? (e: Event) => this._handleDeviceClick(e, targetDeviceId)
                        : nothing}
                      >${targetNode?.name || `Node ${binding.target_node_id}`}</span
                    >
                    - Endpoint ${binding.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">${clusterName}</span>
          </div>
        </div>
        ${this._renderActions()}
      </div>
    `;
  }

  private _renderReadableVariant(
    cardClasses: string,
    binding: BindingWithContext["binding"],
    sourceNode: BindingWithContext["sourceNode"],
    sourceEndpoint: BindingWithContext["sourceEndpoint"],
    targetNode: BindingWithContext["targetNode"],
    isGroupBinding: boolean,
    clusterDesc: ReturnType<typeof getClusterBindingDescription>
  ) {
    const sourceDeviceId = sourceNode.ha_device_id;
    const targetDeviceId = targetNode?.ha_device_id;
    const targetName = isGroupBinding
      ? `Group ${binding.target_group_id}`
      : targetNode?.name || `Node ${binding.target_node_id}`;

    return html`
      <div class=${cardClasses}>
        ${this.aclMissing && this.aclReason
          ? html`<div class="acl-warning-banner">⚠️ ${this.aclReason}</div>`
          : nothing}
        <div class="binding-description">
          <div class="binding-sentence">
            ${this.aclMissing
              ? html`<span class="acl-warning" title="${this.aclReason}">⚠️</span>`
              : nothing}
            <strong
              class="${sourceDeviceId ? "device-link" : ""}"
              @click=${sourceDeviceId
                ? (e: Event) => this._handleDeviceClick(e, sourceDeviceId)
                : nothing}
              >${sourceNode.name}</strong
            >
            <span class="binding-action">${clusterDesc.action}</span>
            <strong
              class="${!isGroupBinding && targetDeviceId ? "device-link" : ""}"
              @click=${!isGroupBinding && targetDeviceId
                ? (e: Event) => this._handleDeviceClick(e, targetDeviceId)
                : nothing}
              >${targetName}</strong
            >
          </div>
          <div class="binding-meta">
            #${sourceNode.node_id} EP ${sourceEndpoint.endpoint_id} →
            ${isGroupBinding
              ? `Group`
              : `#${binding.target_node_id} EP ${binding.target_endpoint_id}`}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
            ${this.aclMissing && this.aclReason
              ? html`<span class="acl-warning-text"> · ${this.aclReason}</span>`
              : nothing}
          </div>
        </div>
        ${this._renderActions()}
      </div>
    `;
  }

  private _renderActions() {
    const allDisabled = this.disabled;

    return html`
      <div class="binding-actions">
        ${this.aclMissing && this.showRepairButton
          ? html`
              <button
                class="btn-icon repair ${this.repairInProgress ? "btn-loading" : ""}"
                title="Repair ACL permissions"
                ?disabled=${allDisabled || this.repairInProgress}
                @click=${this._handleRepairClick}
              >
                ${this.repairInProgress ? "⏳" : "🔧"}
              </button>
            `
          : nothing}
        ${this.showVerifyButton
          ? html`
              <button
                class="btn-icon verify"
                title="Verify binding on device"
                ?disabled=${allDisabled || this.verifyInProgress}
                @click=${this._handleVerifyClick}
              >
                ✓
              </button>
            `
          : nothing}
        <button
          class="btn-icon delete ${this.deleteInProgress ? "btn-loading" : ""}"
          title="Delete binding"
          ?disabled=${allDisabled || this.deleteInProgress}
          @click=${this._handleDeleteClick}
        >
          ✕
        </button>
      </div>
    `;
  }

  private _handleDeleteClick() {
    this.dispatchEvent(
      new CustomEvent("delete-binding", {
        detail: { binding: this.binding },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleVerifyClick() {
    this.dispatchEvent(
      new CustomEvent("verify-binding", {
        detail: { binding: this.binding },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleRepairClick() {
    this.dispatchEvent(
      new CustomEvent("repair-acl", {
        detail: { binding: this.binding },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleDeviceClick(e: Event, deviceId: string | null) {
    if (!deviceId) return;
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("navigate-device", {
        detail: { deviceId },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-binding-card": BindingCard;
  }
}

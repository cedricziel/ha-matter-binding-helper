/**
 * CreateBindingDialog component
 *
 * A dialog for creating new Matter bindings with cascading dropdowns
 * for target node, endpoint, and cluster selection.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles, formStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";
import type { MatterNode, MatterEndpoint, MatterGroup } from "../../types";
import { getClusterName } from "../../types";
import {
  groupControlClusters,
  groupDefaultCluster,
} from "../../group-type-logic";

/**
 * A dialog for creating new Matter bindings.
 *
 * @fires target-node-change - When target node selection changes
 * @fires target-endpoint-change - When target endpoint selection changes
 * @fires create-binding - When form is submitted with valid selection
 * @fires cancel - When cancel button or overlay is clicked
 */
@customElement("matter-create-binding-dialog")
export class CreateBindingDialog extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    formStyles,
    dialogBaseStyles,
    css`
      :host {
        display: contents;
      }

      .dialog {
        max-width: 500px;
        width: 90vw;
      }

      .dialog-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .source-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: normal;
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .form-group select {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .form-group select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .warning-message {
        padding: 12px;
        background: var(--warning-color, #ff9800);
        color: white;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.4;
      }

      .cluster-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];

  /** Whether the dialog is open/visible */
  @property({ type: Boolean })
  open = false;

  /** Source node (the device initiating the binding) */
  @property({ attribute: false })
  sourceNode: MatterNode | null = null;

  /** Source endpoint (the endpoint initiating the binding) */
  @property({ attribute: false })
  sourceEndpoint: MatterEndpoint | null = null;

  /** List of available target nodes */
  @property({ attribute: false })
  availableNodes: MatterNode[] = [];

  /** Currently selected target node ID */
  @property({ type: Number })
  selectedTargetNodeId: number | null = null;

  /** Currently selected target endpoint ID */
  @property({ type: Number })
  selectedTargetEndpointId: number | null = null;

  /** Whether binding creation is in progress */
  @property({ type: Boolean })
  loading = false;

  /** Available Matter groups (enables the group-target option when non-empty) */
  @property({ attribute: false })
  availableGroups: MatterGroup[] = [];

  /** Internal state for selected cluster */
  @state()
  private _selectedClusterId: number | null = null;

  /** Whether the binding targets a device or a group */
  @state()
  private _targetType: "device" | "group" = "device";

  /** Selected group id (group target mode) */
  @state()
  private _selectedGroupId: number | null = null;

  render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${this._handleDialogClick}>
          <form @submit=${this._handleSubmit}>
            ${this._renderHeader()}
            ${this._renderBody()}
            ${this._renderActions()}
          </form>
        </div>
      </div>
    `;
  }

  private _renderHeader() {
    const nodeName = this.sourceNode?.name ?? "Unknown";
    const endpointId = this.sourceEndpoint?.endpoint_id ?? 0;

    return html`
      <div class="dialog-header">
        <span>Create Binding</span>
        <span class="source-info">From: ${nodeName} EP${endpointId}</span>
      </div>
    `;
  }

  private _renderBody() {
    const sourceClientClusters = this.sourceEndpoint?.client_clusters ?? [];
    const hasNoClientClusters = sourceClientClusters.length === 0;

    return html`
      <div class="dialog-body">
        ${hasNoClientClusters ? this._renderNoClientClustersWarning() : nothing}
        ${this.availableGroups.length > 0 ? this._renderTargetTypeToggle() : nothing}
        ${this._targetType === "group"
          ? this._renderGroupTarget()
          : html`
              ${this._renderTargetNodeSelect()}
              ${this.selectedTargetNodeId
                ? this._renderTargetEndpointSelect()
                : nothing}
              ${this.selectedTargetNodeId && this.selectedTargetEndpointId
                ? this._renderClusterSelect()
                : nothing}
            `}
      </div>
    `;
  }

  private _renderTargetTypeToggle() {
    return html`
      <div class="form-group">
        <label for="targetType">Target Type</label>
        <select
          id="targetType"
          name="targetType"
          @change=${this._handleTargetTypeChange}
          .value=${this._targetType}
        >
          <option value="device">Device (unicast)</option>
          <option value="group">Group (groupcast)</option>
        </select>
      </div>
    `;
  }

  /**
   * The clusters offered for a groupcast binding to the selected group.
   *
   * A typed group restricts the choice to the clusters it controls that the
   * source can actually emit (its client clusters); if that intersection is
   * empty we fall back to the group's clusters so the user can still see what
   * the group expects. An untyped group (or no selection) just lists the
   * source's client clusters, as before.
   */
  private _groupClusterChoices(): number[] {
    const sourceClientClusters = this.sourceEndpoint?.client_clusters ?? [];
    const group = this.availableGroups.find(
      (g) => g.group_id === this._selectedGroupId
    );
    const groupClusters = group ? groupControlClusters(group) : [];
    if (groupClusters.length === 0) {
      return sourceClientClusters;
    }
    const intersection = sourceClientClusters.filter((c) =>
      groupClusters.includes(c)
    );
    return intersection.length > 0 ? intersection : groupClusters;
  }

  private _renderGroupTarget() {
    const clusterChoices = this._groupClusterChoices();
    const group = this.availableGroups.find(
      (g) => g.group_id === this._selectedGroupId
    );
    // Default to the group's primary cluster when typed, else the first choice.
    if (this._selectedClusterId === null && clusterChoices.length > 0) {
      const preferred = group
        ? groupDefaultCluster(groupControlClusters(group))
        : null;
      this._selectedClusterId =
        preferred !== null && clusterChoices.includes(preferred)
          ? preferred
          : clusterChoices[0];
    }
    return html`
      <div class="form-group">
        <label for="targetGroup">Target Group</label>
        <select
          id="targetGroup"
          name="targetGroup"
          required
          @change=${this._handleTargetGroupChange}
          .value=${this._selectedGroupId?.toString() ?? ""}
        >
          <option value="" disabled selected>Select a group...</option>
          ${this.availableGroups.map(
            (g) => html`
              <option value=${g.group_id}>
                ${g.name} (ID ${g.group_id})
              </option>
            `
          )}
        </select>
      </div>
      ${clusterChoices.length > 0
        ? html`
            <div class="form-group">
              <label for="groupCluster">Cluster</label>
              <select
                id="groupCluster"
                name="groupCluster"
                required
                @change=${this._handleClusterChange}
                .value=${this._selectedClusterId?.toString() ?? ""}
              >
                ${clusterChoices.map(
                  (clusterId) => html`
                    <option
                      value=${clusterId}
                      ?selected=${clusterId === this._selectedClusterId}
                    >
                      ${getClusterName(clusterId)}
                    </option>
                  `
                )}
              </select>
              <div class="cluster-info">
                The source will multicast this cluster's commands to the group.
              </div>
            </div>
          `
        : nothing}
    `;
  }

  private _renderNoClientClustersWarning() {
    return html`
      <div class="warning-message">
        This endpoint has no client clusters and can't control other devices.
      </div>
    `;
  }

  private _renderTargetNodeSelect() {
    return html`
      <div class="form-group">
        <label for="targetNode">Target Device</label>
        <select
          id="targetNode"
          name="targetNode"
          required
          @change=${this._handleTargetNodeChange}
          .value=${this.selectedTargetNodeId?.toString() ?? ""}
        >
          <option value="">Select a device...</option>
          ${this.availableNodes.map(
            (node) => html`
              <option value=${node.node_id}>
                ${node.name}${node.area_name ? ` (${node.area_name})` : ""}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  private _renderTargetEndpointSelect() {
    const targetNode = this._getSelectedTargetNode();
    if (!targetNode) return nothing;

    // Get non-root endpoints (endpoint 0 is the root node)
    const targetEndpoints = targetNode.endpoints.filter((e) => e.endpoint_id > 0);

    return html`
      <div class="form-group">
        <label for="targetEndpoint">Target Endpoint</label>
        <select
          id="targetEndpoint"
          name="targetEndpoint"
          required
          @change=${this._handleTargetEndpointChange}
          .value=${this.selectedTargetEndpointId?.toString() ?? ""}
        >
          <option value="">Select an endpoint...</option>
          ${targetEndpoints.map(
            (ep) => html`
              <option value=${ep.endpoint_id}>
                Endpoint ${ep.endpoint_id}${this._getEndpointLabel(ep)}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }

  private _renderClusterSelect() {
    const compatibleClusters = this._getCompatibleClusters();

    if (compatibleClusters.length === 0) {
      return html`
        <div class="warning-message">
          No compatible clusters found between source and target endpoints.
        </div>
      `;
    }

    // Auto-select first cluster if none selected
    if (this._selectedClusterId === null && compatibleClusters.length > 0) {
      this._selectedClusterId = compatibleClusters[0];
    }

    return html`
      <div class="form-group">
        <label for="cluster">Cluster</label>
        <select
          id="cluster"
          name="cluster"
          required
          @change=${this._handleClusterChange}
          .value=${this._selectedClusterId?.toString() ?? ""}
        >
          ${compatibleClusters.map(
            (clusterId) => html`
              <option value=${clusterId}>${getClusterName(clusterId)}</option>
            `
          )}
        </select>
        <div class="cluster-info">
          The binding will allow the source to control this cluster on the target.
        </div>
      </div>
    `;
  }

  private _renderActions() {
    const canSubmit = this._targetType === "group"
      ? this._selectedGroupId !== null &&
        (this.sourceEndpoint?.client_clusters ?? []).length > 0 &&
        !this.loading
      : this.selectedTargetNodeId !== null &&
        this.selectedTargetEndpointId !== null &&
        this._getCompatibleClusters().length > 0 &&
        !this.loading;

    return html`
      <div class="dialog-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleCancel}
          ?disabled=${this.loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary ${this.loading ? "btn-loading" : ""}"
          ?disabled=${!canSubmit}
        >
          Create Binding
        </button>
      </div>
    `;
  }

  private _getSelectedTargetNode(): MatterNode | null {
    if (!this.selectedTargetNodeId) return null;
    return (
      this.availableNodes.find((n) => n.node_id === this.selectedTargetNodeId) ??
      null
    );
  }

  private _getSelectedTargetEndpoint(): MatterEndpoint | null {
    const targetNode = this._getSelectedTargetNode();
    if (!targetNode || !this.selectedTargetEndpointId) return null;
    return (
      targetNode.endpoints.find(
        (e) => e.endpoint_id === this.selectedTargetEndpointId
      ) ?? null
    );
  }

  private _getEndpointLabel(endpoint: MatterEndpoint): string {
    if (endpoint.device_types && endpoint.device_types.length > 0) {
      // Could use getDeviceTypeName here but keeping it simple
      return ` - Device Type ${endpoint.device_types[0].id}`;
    }
    return "";
  }

  private _getCompatibleClusters(): number[] {
    const sourceClientClusters = this.sourceEndpoint?.client_clusters ?? [];
    const targetEndpoint = this._getSelectedTargetEndpoint();
    const targetServerClusters = targetEndpoint?.server_clusters ?? [];

    // Find clusters that exist as client on source and server on target
    return sourceClientClusters.filter((clusterId) =>
      targetServerClusters.includes(clusterId)
    );
  }

  private _handleOverlayClick() {
    this._handleCancel();
  }

  private _handleDialogClick(e: Event) {
    e.stopPropagation();
  }

  private _handleTargetNodeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const nodeId = parseInt(select.value, 10);

    if (!isNaN(nodeId)) {
      // Reset endpoint and cluster selection when node changes
      this._selectedClusterId = null;

      this.dispatchEvent(
        new CustomEvent("target-node-change", {
          detail: { nodeId },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _handleTargetEndpointChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const endpointId = parseInt(select.value, 10);

    if (!isNaN(endpointId)) {
      // Reset cluster selection when endpoint changes
      this._selectedClusterId = null;

      this.dispatchEvent(
        new CustomEvent("target-endpoint-change", {
          detail: { endpointId },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _handleClusterChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const clusterId = parseInt(select.value, 10);
    if (!isNaN(clusterId)) {
      this._selectedClusterId = clusterId;
    }
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();

    if (this._targetType === "group") {
      const clusterId = this._selectedClusterId ?? this._groupClusterChoices()[0];
      if (this._selectedGroupId !== null && clusterId !== undefined) {
        this.dispatchEvent(
          new CustomEvent("create-binding", {
            detail: { targetGroupId: this._selectedGroupId, clusterId },
            bubbles: true,
            composed: true,
          })
        );
      }
      return;
    }

    const compatibleClusters = this._getCompatibleClusters();
    const clusterId = this._selectedClusterId ?? compatibleClusters[0];

    if (
      this.selectedTargetNodeId !== null &&
      this.selectedTargetEndpointId !== null &&
      clusterId !== undefined
    ) {
      this.dispatchEvent(
        new CustomEvent("create-binding", {
          detail: {
            targetNodeId: this.selectedTargetNodeId,
            targetEndpointId: this.selectedTargetEndpointId,
            clusterId,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _handleTargetTypeChange(e: Event) {
    this._targetType = (e.target as HTMLSelectElement).value as "device" | "group";
    this._selectedClusterId = null;
  }

  private _handleTargetGroupChange(e: Event) {
    const groupId = parseInt((e.target as HTMLSelectElement).value, 10);
    if (!isNaN(groupId)) {
      this._selectedGroupId = groupId;
      // Clear so the cluster default re-applies for the newly selected group's
      // type (a Lights group defaults to On/Off, a covers group to Window
      // Covering, etc.).
      this._selectedClusterId = null;
    }
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent("cancel", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-create-binding-dialog": CreateBindingDialog;
  }
}

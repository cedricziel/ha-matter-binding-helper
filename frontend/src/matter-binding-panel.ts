/**
 * Matter Binding Helper Panel
 * Main panel component for managing Matter bindings
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  MatterNode,
  MatterEndpoint,
  Binding,
  MatterGroup,
} from "./types";
import { CLUSTER_NAMES, CLUSTER_ON_OFF } from "./types";
import * as api from "./api";

@customElement("matter-binding-helper-panel")
export class MatterBindingPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public narrow = false;

  @state() private _nodes: MatterNode[] = [];
  @state() private _selectedSourceNode: MatterNode | null = null;
  @state() private _selectedSourceEndpoint: MatterEndpoint | null = null;
  @state() private _bindings: Binding[] = [];
  @state() private _groups: MatterGroup[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _activeTab: "bindings" | "groups" = "bindings";
  @state() private _showCreateDialog = false;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      background: var(--primary-background-color);
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
      color: var(--primary-text-color);
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      padding: 12px 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      color: var(--secondary-text-color);
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }

    .narrow .content {
      grid-template-columns: 1fr;
    }

    .card {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.1));
    }

    .card-header {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: var(--primary-text-color);
    }

    .node-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .node-item {
      padding: 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .node-item:hover {
      background: var(--secondary-background-color);
    }

    .node-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .node-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success-color, #4caf50);
    }

    .node-status.unavailable {
      background: var(--error-color, #f44336);
    }

    .endpoint-list {
      margin-left: 32px;
      margin-top: 8px;
    }

    .endpoint-item {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      border-radius: 4px;
    }

    .endpoint-item:hover {
      background: var(--secondary-background-color);
    }

    .endpoint-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .endpoint-item.no-binding {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .node-name {
      font-weight: 500;
    }

    .node-vendor {
      font-size: 12px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .node-area {
      font-size: 12px;
      color: var(--primary-color);
      opacity: 0.9;
    }

    .node-details {
      margin-left: 32px;
      margin-top: 8px;
    }

    .node-version {
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 8px;
    }

    .no-endpoints {
      font-size: 13px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
    }

    .bindings-panel {
      min-height: 400px;
    }

    .binding-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .binding-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .binding-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .binding-arrow {
      color: var(--primary-color);
      font-size: 20px;
    }

    .binding-target {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .binding-target-name {
      font-weight: 500;
    }

    .binding-cluster {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .delete-btn {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--secondary-text-color);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    .error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color, #f44336);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    /* Dialog styles */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      min-width: 400px;
      max-width: 90vw;
    }

    .dialog-header {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .form-select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
  `;

  protected firstUpdated(): void {
    this._loadNodes();
  }

  private async _loadNodes(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const response = await api.listNodes(this.hass);
      this._nodes = response.nodes;
    } catch (err) {
      this._error = `Failed to load nodes: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private async _loadBindings(): Promise<void> {
    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) {
      return;
    }
    this._loading = true;
    try {
      const response = await api.listBindings(
        this.hass,
        this._selectedSourceNode.node_id,
        this._selectedSourceEndpoint.endpoint_id
      );
      this._bindings = response.bindings;
    } catch (err) {
      this._error = `Failed to load bindings: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private async _loadGroups(): Promise<void> {
    this._loading = true;
    try {
      const response = await api.listGroups(this.hass);
      this._groups = response.groups;
    } catch (err) {
      this._error = `Failed to load groups: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private _selectNode(node: MatterNode): void {
    if (this._selectedSourceNode?.node_id === node.node_id) {
      this._selectedSourceNode = null;
      this._selectedSourceEndpoint = null;
      this._bindings = [];
    } else {
      this._selectedSourceNode = node;
      this._selectedSourceEndpoint = null;
      this._bindings = [];
    }
  }

  private _selectEndpoint(endpoint: MatterEndpoint): void {
    if (!endpoint.has_binding_cluster) return;
    this._selectedSourceEndpoint = endpoint;
    this._loadBindings();
  }

  private async _deleteBinding(binding: Binding): Promise<void> {
    if (!confirm("Are you sure you want to delete this binding?")) return;

    try {
      await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );
      await this._loadBindings();
    } catch (err) {
      this._error = `Failed to delete binding: ${err}`;
    }
  }

  private _openCreateDialog(): void {
    this._showCreateDialog = true;
  }

  private _closeCreateDialog(): void {
    this._showCreateDialog = false;
  }

  private async _handleCreateBinding(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const targetNodeId = parseInt(formData.get("targetNode") as string, 10);
    const targetEndpointId = parseInt(formData.get("targetEndpoint") as string, 10);
    const clusterId = parseInt(formData.get("cluster") as string, 10);

    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) return;

    try {
      await api.createBinding(
        this.hass,
        this._selectedSourceNode.node_id,
        this._selectedSourceEndpoint.endpoint_id,
        clusterId,
        targetNodeId,
        targetEndpointId
      );
      this._closeCreateDialog();
      await this._loadBindings();
    } catch (err) {
      this._error = `Failed to create binding: ${err}`;
    }
  }

  private _getNodeName(nodeId: number): string {
    const node = this._nodes.find((n) => n.node_id === nodeId);
    return node?.name || `Node ${nodeId}`;
  }

  private _getClusterName(clusterId: number): string {
    return CLUSTER_NAMES[clusterId] || `Cluster 0x${clusterId.toString(16)}`;
  }

  protected render() {
    return html`
      <div class="${this.narrow ? "narrow" : ""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <button
            class="btn btn-primary"
            @click=${this._loadNodes}
            ?disabled=${this._loading}
          >
            Refresh
          </button>
        </div>

        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

        <div class="tabs">
          <button
            class="tab ${this._activeTab === "bindings" ? "active" : ""}"
            @click=${() => (this._activeTab = "bindings")}
          >
            Bindings
          </button>
          <button
            class="tab ${this._activeTab === "groups" ? "active" : ""}"
            @click=${() => {
              this._activeTab = "groups";
              this._loadGroups();
            }}
          >
            Groups
          </button>
        </div>

        ${this._activeTab === "bindings"
          ? this._renderBindingsTab()
          : this._renderGroupsTab()}
        ${this._showCreateDialog ? this._renderCreateDialog() : nothing}
      </div>
    `;
  }

  private _renderBindingsTab() {
    return html`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Nodes</div>
          ${this._loading && this._nodes.length === 0
            ? html`<div class="loading">Loading...</div>`
            : html`
                <ul class="node-list">
                  ${this._nodes.map((node) => this._renderNodeItem(node))}
                </ul>
              `}
        </div>

        <div class="card bindings-panel">
          <div class="card-header">
            ${this._selectedSourceEndpoint
              ? html`
                  Bindings for ${this._selectedSourceNode?.name} - Endpoint
                  ${this._selectedSourceEndpoint.endpoint_id}
                  <button
                    class="btn btn-primary"
                    style="float: right; margin-top: -8px;"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `
              : "Select a node and endpoint to view bindings"}
          </div>

          ${this._selectedSourceEndpoint
            ? this._bindings.length > 0
              ? html`
                  <div class="binding-list">
                    ${this._bindings.map((binding) =>
                      this._renderBindingCard(binding)
                    )}
                  </div>
                `
              : html`
                  <div class="empty-state">
                    No bindings configured for this endpoint.
                  </div>
                `
            : html`
                <div class="empty-state">
                  Select a node with binding support to manage its bindings.
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _renderNodeItem(node: MatterNode) {
    const isSelected = this._selectedSourceNode?.node_id === node.node_id;
    const bindableEndpoints = node.endpoints.filter((e) => e.has_binding_cluster);
    const totalEndpoints = node.endpoints.length;
    const deviceInfo = node.device_info;

    return html`
      <li>
        <div
          class="node-item ${isSelected ? "selected" : ""}"
          @click=${() => this._selectNode(node)}
        >
          <span
            class="node-status ${node.available ? "" : "unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">${node.name}</span>
            ${node.area_name
              ? html`<span class="node-area">${node.area_name}</span>`
              : deviceInfo?.vendor_name
                ? html`<span class="node-vendor">${deviceInfo.vendor_name}</span>`
                : nothing}
          </div>
          <small>
            ${totalEndpoints > 0
              ? bindableEndpoints.length > 0
                ? `(${bindableEndpoints.length}/${totalEndpoints} bindable)`
                : `(${totalEndpoints} endpoints, none bindable)`
              : "(no endpoints)"}
          </small>
        </div>
        ${isSelected
          ? html`
              <div class="node-details">
                ${deviceInfo?.software_version
                  ? html`<span class="node-version">v${deviceInfo.software_version}</span>`
                  : nothing}
                ${totalEndpoints > 0
                  ? html`
                      <div class="endpoint-list">
                        ${node.endpoints.map((endpoint) =>
                          this._renderEndpointItem(endpoint)
                        )}
                      </div>
                    `
                  : html`<div class="no-endpoints">No endpoints found</div>`}
              </div>
            `
          : nothing}
      </li>
    `;
  }

  private _renderEndpointItem(endpoint: MatterEndpoint) {
    const isSelected =
      this._selectedSourceEndpoint?.endpoint_id === endpoint.endpoint_id;
    return html`
      <div
        class="endpoint-item ${isSelected ? "selected" : ""} ${!endpoint.has_binding_cluster
          ? "no-binding"
          : ""}"
        @click=${() => this._selectEndpoint(endpoint)}
      >
        Endpoint ${endpoint.endpoint_id}
        ${!endpoint.has_binding_cluster ? "(no binding support)" : ""}
      </div>
    `;
  }

  private _renderBindingCard(binding: Binding) {
    return html`
      <div class="binding-card">
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${binding.target_group_id !== null
                ? `Group ${binding.target_group_id}`
                : `${this._getNodeName(binding.target_node_id!)} - Endpoint ${binding.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">
              ${this._getClusterName(binding.cluster_id)}
            </span>
          </div>
        </div>
        <button class="delete-btn" @click=${() => this._deleteBinding(binding)}>
          Delete
        </button>
      </div>
    `;
  }

  private _renderGroupsTab() {
    return html`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading
          ? html`<div class="loading">Loading...</div>`
          : this._groups.length > 0
            ? html`
                <div class="binding-list">
                  ${this._groups.map(
                    (group) => html`
                      <div class="binding-card">
                        <div>
                          <strong>${group.name}</strong>
                          <div style="font-size: 12px; color: var(--secondary-text-color);">
                            Group ID: ${group.group_id} |
                            ${group.members.length} member(s)
                          </div>
                        </div>
                      </div>
                    `
                  )}
                </div>
              `
            : html`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `;
  }

  private _renderCreateDialog() {
    return html`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>
          <form @submit=${this._handleCreateBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select name="targetNode" class="form-select" required>
                ${this._nodes
                  .filter((n) => n.node_id !== this._selectedSourceNode?.node_id)
                  .map(
                    (node) => html`
                      <option value=${node.node_id}>${node.name}</option>
                    `
                  )}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Endpoint</label>
              <select name="targetEndpoint" class="form-select" required>
                <option value="1">Endpoint 1</option>
                <option value="2">Endpoint 2</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              <select name="cluster" class="form-select" required>
                <option value=${CLUSTER_ON_OFF}>On/Off</option>
                ${Object.entries(CLUSTER_NAMES).map(
                  ([id, name]) => html`
                    <option value=${id}>${name}</option>
                  `
                )}
              </select>
            </div>

            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click=${this._closeCreateDialog}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Create Binding
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-binding-helper-panel": MatterBindingPanel;
  }
}

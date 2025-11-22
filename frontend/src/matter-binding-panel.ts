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
  BindingWithContext,
  BindingRecommendation,
  MatterGroup,
} from "./types";
import { CLUSTER_NAMES, CLUSTER_ON_OFF, getClusterName, getDeviceTypeName } from "./types";
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
  @state() private _activeTab: "overview" | "bindings" | "groups" = "overview";
  @state() private _showCreateDialog = false;
  @state() private _allBindings: BindingWithContext[] = [];
  @state() private _recommendations: BindingRecommendation[] = [];
  @state() private _overviewLoading = false;
  @state() private _surveySubmitting = false;
  @state() private _selectedTargetNodeId: number | null = null;
  @state() private _selectedTargetEndpointId: number | null = null;
  @state() private _filterSameAreaOnly = true;
  @state() private _actionInProgress: string | null = null;

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
      grid-template-columns: 380px 1fr;
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

    .node-item.selected .node-name,
    .node-item.selected .node-device-type,
    .node-item.selected .node-area,
    .node-item.selected .node-vendor,
    .node-item.selected .node-endpoints,
    .node-item.selected .node-meta-sep,
    .node-item.selected .node-version {
      color: var(--text-primary-color);
      opacity: 1;
    }

    .node-meta-sep {
      color: var(--secondary-text-color);
      opacity: 0.5;
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
      padding: 10px 12px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      margin-bottom: 8px;
    }

    .endpoint-item:hover {
      background: var(--secondary-background-color);
      border-color: var(--primary-color);
    }

    .endpoint-item.selected {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .endpoint-item.no-binding {
      opacity: 0.6;
      cursor: not-allowed;
      border-style: dashed;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .endpoint-id {
      font-weight: 500;
    }

    .endpoint-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .endpoint-badge.binding {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .endpoint-device-types {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 2px;
    }

    .endpoint-item.selected .endpoint-device-types {
      color: var(--text-primary-color);
      opacity: 0.9;
    }

    .endpoint-clusters {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .endpoint-item.selected .endpoint-clusters {
      color: var(--text-primary-color);
      opacity: 0.8;
    }

    .cluster-role {
      font-weight: 500;
      opacity: 0.7;
      margin-right: 4px;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      gap: 2px;
    }

    .node-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .node-vendor {
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .node-device-type {
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .node-area {
      color: var(--primary-color);
      opacity: 0.9;
    }

    .node-endpoints {
      color: var(--secondary-text-color);
      opacity: 0.7;
    }

    .node-endpoints.has-binding {
      color: var(--success-color, #4caf50);
      opacity: 1;
    }

    .node-details {
      margin-left: 32px;
      margin-top: 8px;
    }

    .node-version {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.6;
      margin-left: auto;
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

    .dialog-warning {
      background: var(--warning-color, #ff9800);
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .no-clusters-warning {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.4;
    }

    .form-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Overview Tab Styles */
    .overview-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .overview-card {
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .overview-card .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--divider-color);
      font-size: 16px;
      font-weight: 500;
    }

    .count-badge {
      background: var(--primary-color);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: normal;
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .binding-list {
      padding: 8px 0;
    }

    .overview-binding-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .overview-binding-row:last-child {
      border-bottom: none;
    }

    .overview-binding-row.recommendation {
      background: var(--secondary-background-color);
    }

    .binding-source,
    .binding-target {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      min-width: 180px;
      flex: 1;
    }

    .binding-source > div:first-child,
    .binding-target > div:first-child {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .binding-source .node-name,
    .binding-target .node-name {
      font-weight: 500;
    }

    .endpoint-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .area-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .binding-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .binding-arrow {
      color: var(--primary-color);
      font-size: 18px;
      flex-shrink: 0;
    }

    .binding-cluster-badge {
      background: var(--primary-color);
      color: white;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .compatible-clusters {
      font-size: 11px;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color);
      padding: 4px 8px;
      border-radius: 4px;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--secondary-text-color);
    }

    .btn-icon:hover {
      background: var(--secondary-background-color);
    }

    .btn-icon.delete {
      color: var(--error-color, #f44336);
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .group-target {
      font-style: italic;
      color: var(--secondary-text-color);
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .filter-controls label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .filter-info {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .toggle-switch {
      position: relative;
      width: 40px;
      height: 22px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--disabled-color, #ccc);
      transition: 0.3s;
      border-radius: 22px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
      background-color: var(--primary-color);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(18px);
    }

    .btn-loading {
      position: relative;
      color: transparent !important;
    }

    .btn-loading::after {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      top: 50%;
      left: 50%;
      margin-left: -7px;
      margin-top: -7px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .btn-icon.btn-loading::after,
    .delete-btn.btn-loading::after {
      border-color: rgba(244, 67, 54, 0.3);
      border-top-color: var(--error-color, #f44336);
    }
  `;

  protected firstUpdated(): void {
    this._loadNodes().then(() => {
      // Load overview data after nodes are loaded
      if (this._activeTab === "overview") {
        this._loadOverviewData();
      }
    });
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

  private async _loadOverviewData(): Promise<void> {
    this._overviewLoading = true;
    this._error = null;

    try {
      // Load all bindings from all endpoints with binding clusters
      const allBindings: BindingWithContext[] = [];

      for (const node of this._nodes) {
        for (const endpoint of node.endpoints) {
          if (endpoint.has_binding_cluster) {
            try {
              const response = await api.listBindings(
                this.hass,
                node.node_id,
                endpoint.endpoint_id
              );

              for (const binding of response.bindings) {
                // Find target node and endpoint
                const targetNode = binding.target_node_id
                  ? this._nodes.find((n) => n.node_id === binding.target_node_id) || null
                  : null;
                const targetEndpoint = targetNode && binding.target_endpoint_id
                  ? targetNode.endpoints.find((ep) => ep.endpoint_id === binding.target_endpoint_id) || null
                  : null;

                allBindings.push({
                  binding,
                  sourceNode: node,
                  sourceEndpoint: endpoint,
                  targetNode,
                  targetEndpoint,
                });
              }
            } catch {
              // Skip endpoints that fail to load bindings
            }
          }
        }
      }

      this._allBindings = allBindings;

      // Compute recommendations
      this._recommendations = this._computeRecommendations();
    } catch (err) {
      this._error = `Failed to load overview data: ${err}`;
    } finally {
      this._overviewLoading = false;
    }
  }

  private _computeRecommendations(): BindingRecommendation[] {
    const recommendations: BindingRecommendation[] = [];

    // Find all endpoints that can create bindings (have client clusters)
    for (const sourceNode of this._nodes) {
      for (const sourceEndpoint of sourceNode.endpoints) {
        const sourceClientClusters = sourceEndpoint.client_clusters || [];
        if (sourceClientClusters.length === 0 || !sourceEndpoint.has_binding_cluster) {
          continue;
        }

        // Find potential targets (endpoints with matching server clusters)
        for (const targetNode of this._nodes) {
          for (const targetEndpoint of targetNode.endpoints) {
            // Skip same endpoint
            if (sourceNode.node_id === targetNode.node_id &&
                sourceEndpoint.endpoint_id === targetEndpoint.endpoint_id) {
              continue;
            }

            const targetServerClusters = targetEndpoint.server_clusters || [];
            const compatibleClusters = sourceClientClusters.filter((c) =>
              targetServerClusters.includes(c)
            );

            if (compatibleClusters.length === 0) {
              continue;
            }

            // Check if this binding already exists
            const alreadyBound = this._allBindings.some(
              (b) =>
                b.binding.node_id === sourceNode.node_id &&
                b.binding.endpoint_id === sourceEndpoint.endpoint_id &&
                b.binding.target_node_id === targetNode.node_id &&
                b.binding.target_endpoint_id === targetEndpoint.endpoint_id
            );

            if (alreadyBound) {
              continue;
            }

            recommendations.push({
              sourceNode,
              sourceEndpoint,
              targetNode,
              targetEndpoint,
              compatibleClusters,
            });
          }
        }
      }
    }

    // Sort by number of compatible clusters (more = higher priority)
    recommendations.sort((a, b) => b.compatibleClusters.length - a.compatibleClusters.length);

    return recommendations;
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

  private _selectEndpoint(e: Event, endpoint: MatterEndpoint): void {
    e.stopPropagation(); // Prevent node toggle
    if (!endpoint.has_binding_cluster) return;
    this._selectedSourceEndpoint = endpoint;
    this._loadBindings();
  }

  private async _deleteBinding(binding: Binding): Promise<void> {
    if (!confirm("Are you sure you want to delete this binding?")) return;

    const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    this._actionInProgress = actionKey;

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
    } finally {
      this._actionInProgress = null;
    }
  }

  private _openCreateDialog(): void {
    // Set default target node (first node that isn't the source)
    const availableTargets = this._nodes.filter(
      (n) => n.node_id !== this._selectedSourceNode?.node_id
    );
    if (availableTargets.length > 0) {
      this._selectedTargetNodeId = availableTargets[0].node_id;
      // Set default endpoint (first one with server clusters)
      const targetNode = availableTargets[0];
      const validEndpoints = targetNode.endpoints.filter(
        (ep) => ep.server_clusters && ep.server_clusters.length > 0
      );
      this._selectedTargetEndpointId = validEndpoints.length > 0
        ? validEndpoints[0].endpoint_id
        : (targetNode.endpoints[0]?.endpoint_id ?? null);
    }
    this._showCreateDialog = true;
  }

  private _closeCreateDialog(): void {
    this._showCreateDialog = false;
    this._selectedTargetNodeId = null;
    this._selectedTargetEndpointId = null;
  }

  private _handleTargetNodeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._selectedTargetNodeId = parseInt(select.value, 10);
    // Reset endpoint selection when node changes
    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    if (targetNode) {
      const validEndpoints = targetNode.endpoints.filter(
        (ep) => ep.server_clusters && ep.server_clusters.length > 0
      );
      this._selectedTargetEndpointId = validEndpoints.length > 0
        ? validEndpoints[0].endpoint_id
        : (targetNode.endpoints[0]?.endpoint_id ?? null);
    }
  }

  private _handleTargetEndpointChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._selectedTargetEndpointId = parseInt(select.value, 10);
  }

  private _getCompatibleClusters(): number[] {
    if (!this._selectedSourceEndpoint || !this._selectedTargetNodeId || !this._selectedTargetEndpointId) {
      return [];
    }

    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    const targetEndpoint = targetNode?.endpoints.find(
      (ep) => ep.endpoint_id === this._selectedTargetEndpointId
    );

    if (!targetEndpoint) return [];

    // Source must have cluster as CLIENT (can send commands)
    const sourceClientClusters = this._selectedSourceEndpoint.client_clusters || [];
    // Target must have cluster as SERVER (can receive commands)
    const targetServerClusters = targetEndpoint.server_clusters || [];

    // Return intersection - clusters where source is client AND target is server
    return sourceClientClusters.filter((c) => targetServerClusters.includes(c));
  }

  private async _handleCreateBinding(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const targetNodeId = parseInt(formData.get("targetNode") as string, 10);
    const targetEndpointId = parseInt(formData.get("targetEndpoint") as string, 10);
    const clusterId = parseInt(formData.get("cluster") as string, 10);

    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) return;

    // Validate cluster compatibility
    const sourceClientClusters = this._selectedSourceEndpoint.client_clusters || [];
    const targetNode = this._nodes.find((n) => n.node_id === targetNodeId);
    const targetEndpoint = targetNode?.endpoints.find((ep) => ep.endpoint_id === targetEndpointId);
    const targetServerClusters = targetEndpoint?.server_clusters || [];

    if (!sourceClientClusters.includes(clusterId)) {
      this._error = `Source endpoint does not have cluster ${getClusterName(clusterId)} as a client cluster`;
      return;
    }

    if (!targetServerClusters.includes(clusterId)) {
      this._error = `Target endpoint does not have cluster ${getClusterName(clusterId)} as a server cluster`;
      return;
    }

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

  private async _submitSurvey(): Promise<void> {
    this._surveySubmitting = true;
    try {
      await this.hass.callService("matter_binding_helper", "submit_survey", {});
      // Show success feedback (could use a toast notification in the future)
      alert("Survey submitted successfully! Thank you for contributing.");
    } catch (err) {
      this._error = `Failed to submit survey: ${err}`;
    } finally {
      this._surveySubmitting = false;
    }
  }

  protected render() {
    return html`
      <div class="${this.narrow ? "narrow" : ""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <div style="display: flex; gap: 8px;">
            <button
              class="btn btn-secondary"
              @click=${this._submitSurvey}
              ?disabled=${this._surveySubmitting}
              title="Submit anonymized device data to Matter Survey"
            >
              ${this._surveySubmitting ? "Submitting..." : "Submit Survey"}
            </button>
            <button
              class="btn btn-primary"
              @click=${this._loadNodes}
              ?disabled=${this._loading}
            >
              Refresh
            </button>
          </div>
        </div>

        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

        <div class="tabs">
          <button
            class="tab ${this._activeTab === "overview" ? "active" : ""}"
            @click=${() => {
              this._activeTab = "overview";
              this._loadOverviewData();
            }}
          >
            Overview
          </button>
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

        ${this._activeTab === "overview"
          ? this._renderOverviewTab()
          : this._activeTab === "bindings"
            ? this._renderBindingsTab()
            : this._renderGroupsTab()}
        ${this._showCreateDialog ? this._renderCreateDialog() : nothing}
      </div>
    `;
  }

  private _renderOverviewTab() {
    return html`
      <div class="overview-content">
        ${this._overviewLoading
          ? html`<div class="loading">Loading bindings...</div>`
          : html`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
            `}
      </div>
    `;
  }

  private _renderEstablishedBindings() {
    return html`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
        </div>
        ${this._allBindings.length === 0
          ? html`<div class="empty-state">No bindings configured yet.</div>`
          : html`
              <div class="binding-list">
                ${this._allBindings.map((b) => this._renderEstablishedBindingRow(b))}
              </div>
            `}
      </div>
    `;
  }

  private _renderEstablishedBindingRow(bindingCtx: BindingWithContext) {
    const { binding, sourceNode, sourceEndpoint, targetNode } = bindingCtx;
    const targetName = targetNode?.name || `Node ${binding.target_node_id}`;
    const isGroupBinding = binding.target_group_id !== null;
    const sourceArea = sourceNode.area_name;
    const targetArea = targetNode?.area_name;
    const actionKey = `delete-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    const isLoading = this._actionInProgress === actionKey;

    return html`
      <div class="overview-binding-row">
        <div class="binding-source">
          <div>
            <span class="node-name">${sourceNode.name}</span>
            <span class="endpoint-label">EP ${sourceEndpoint.endpoint_id}</span>
          </div>
          ${sourceArea ? html`<span class="area-label">${sourceArea}</span>` : nothing}
        </div>
        <div class="binding-info">
          <span class="binding-cluster-badge">${getClusterName(binding.cluster_id)}</span>
          <span class="binding-arrow">→</span>
        </div>
        <div class="binding-target">
          ${isGroupBinding
            ? html`<span class="group-target">Group ${binding.target_group_id}</span>`
            : html`
                <div>
                  <span class="node-name">${targetName}</span>
                  <span class="endpoint-label">EP ${binding.target_endpoint_id}</span>
                </div>
                ${targetArea ? html`<span class="area-label">${targetArea}</span>` : nothing}
              `}
        </div>
        <button
          class="btn-icon delete ${isLoading ? "btn-loading" : ""}"
          title="Delete binding"
          ?disabled=${isLoading || this._actionInProgress !== null}
          @click=${() => this._deleteBindingFromOverview(bindingCtx)}
        >
          ${isLoading ? "" : "✕"}
        </button>
      </div>
    `;
  }

  private _renderRecommendedBindings() {
    // Filter recommendations based on toggle
    const filteredRecommendations = this._filterSameAreaOnly
      ? this._recommendations.filter((r) => {
          const sourceArea = r.sourceNode.area_name;
          const targetArea = r.targetNode.area_name;
          // Both must have an area and they must match
          return sourceArea && targetArea && sourceArea === targetArea;
        })
      : this._recommendations;

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
                ?checked=${this._filterSameAreaOnly}
                @change=${this._toggleAreaFilter}
              />
              <span class="toggle-slider"></span>
            </span>
            Same area only
          </label>
          ${this._filterSameAreaOnly && filteredRecommendations.length !== this._recommendations.length
            ? html`<span class="filter-info">(${this._recommendations.length - filteredRecommendations.length} hidden)</span>`
            : nothing}
        </div>
        ${filteredRecommendations.length === 0
          ? html`<div class="empty-state">
              ${this._filterSameAreaOnly && this._recommendations.length > 0
                ? "No same-area recommendations. Toggle filter to see cross-area bindings."
                : "No binding recommendations. All compatible endpoints are already bound."}
            </div>`
          : html`
              <div class="binding-list">
                ${filteredRecommendations.map((r) => this._renderRecommendationRow(r))}
              </div>
            `}
      </div>
    `;
  }

  private _toggleAreaFilter(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filterSameAreaOnly = input.checked;
  }

  private _renderRecommendationRow(recommendation: BindingRecommendation) {
    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, compatibleClusters } = recommendation;
    const clusterNames = compatibleClusters.map((c) => getClusterName(c)).join(", ");
    const sourceArea = sourceNode.area_name;
    const targetArea = targetNode.area_name;
    const actionKey = `create-${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${targetNode.node_id}-${targetEndpoint.endpoint_id}`;
    const isLoading = this._actionInProgress === actionKey;

    return html`
      <div class="overview-binding-row recommendation">
        <div class="binding-source">
          <div>
            <span class="node-name">${sourceNode.name}</span>
            <span class="endpoint-label">EP ${sourceEndpoint.endpoint_id}</span>
          </div>
          ${sourceArea ? html`<span class="area-label">${sourceArea}</span>` : nothing}
        </div>
        <div class="binding-info">
          <span class="compatible-clusters" title="Compatible clusters">${clusterNames}</span>
          <span class="binding-arrow">→</span>
        </div>
        <div class="binding-target">
          <div>
            <span class="node-name">${targetNode.name}</span>
            <span class="endpoint-label">EP ${targetEndpoint.endpoint_id}</span>
          </div>
          ${targetArea ? html`<span class="area-label">${targetArea}</span>` : nothing}
        </div>
        <button
          class="btn btn-small btn-primary ${isLoading ? "btn-loading" : ""}"
          ?disabled=${isLoading || this._actionInProgress !== null}
          @click=${() => this._createBindingFromRecommendation(recommendation)}
        >
          Create
        </button>
      </div>
    `;
  }

  private async _deleteBindingFromOverview(bindingCtx: BindingWithContext): Promise<void> {
    const { binding } = bindingCtx;
    const actionKey = `delete-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;

    this._actionInProgress = actionKey;

    try {
      await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );
      // Reload overview data
      await this._loadOverviewData();
    } catch (err) {
      this._error = `Failed to delete binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private async _createBindingFromRecommendation(recommendation: BindingRecommendation): Promise<void> {
    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, compatibleClusters } = recommendation;

    // Use the first compatible cluster (could show a picker for multiple)
    const clusterId = compatibleClusters[0];
    const actionKey = `create-${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${targetNode.node_id}-${targetEndpoint.endpoint_id}`;

    this._actionInProgress = actionKey;

    try {
      await api.createBinding(
        this.hass,
        sourceNode.node_id,
        sourceEndpoint.endpoint_id,
        clusterId,
        targetNode.node_id,
        targetEndpoint.endpoint_id
      );
      // Reload overview data
      await this._loadOverviewData();
    } catch (err) {
      this._error = `Failed to create binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
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

  private _getPrimaryDeviceType(node: MatterNode): string | null {
    // Get device type from endpoint 1, or first non-zero endpoint
    const primaryEndpoint = node.endpoints.find((e) => e.endpoint_id === 1)
      || node.endpoints.find((e) => e.endpoint_id > 0);
    if (primaryEndpoint && primaryEndpoint.device_types.length > 0) {
      return getDeviceTypeName(primaryEndpoint.device_types[0].id);
    }
    return null;
  }

  private _renderNodeItem(node: MatterNode) {
    const isSelected = this._selectedSourceNode?.node_id === node.node_id;
    const bindableEndpoints = node.endpoints.filter((e) => e.has_binding_cluster);
    const totalEndpoints = node.endpoints.length;
    const deviceInfo = node.device_info;
    const primaryDeviceType = this._getPrimaryDeviceType(node);

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
            <div class="node-meta">
              ${primaryDeviceType
                ? html`<span class="node-device-type">${primaryDeviceType}</span>`
                : nothing}
              ${primaryDeviceType && node.area_name
                ? html`<span class="node-meta-sep">·</span>`
                : nothing}
              ${node.area_name
                ? html`<span class="node-area">${node.area_name}</span>`
                : nothing}
              ${deviceInfo?.software_version
                ? html`<span class="node-version">v${deviceInfo.software_version}</span>`
                : nothing}
            </div>
          </div>
        </div>
        ${isSelected
          ? html`
              <div class="node-details">
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

    // Get device type names (skip Root Node for endpoint 0)
    const deviceTypes = endpoint.device_types
      .map((dt) => getDeviceTypeName(dt.id))
      .filter((name) => endpoint.endpoint_id !== 0 || !name.includes("Root"));

    // Get interesting clusters (skip infrastructure ones)
    const infraClusters = [29, 30, 31, 40, 42, 48, 49, 50, 51, 52, 53, 56, 60, 62, 63, 70];

    // Filter and format server clusters
    const serverClusters = (endpoint.server_clusters || [])
      .filter((c) => !infraClusters.includes(c))
      .map((c) => getClusterName(c));

    // Filter and format client clusters
    const clientClusters = (endpoint.client_clusters || [])
      .filter((c) => !infraClusters.includes(c))
      .map((c) => getClusterName(c));

    return html`
      <div
        class="endpoint-item ${isSelected ? "selected" : ""} ${!endpoint.has_binding_cluster
          ? "no-binding"
          : ""}"
        @click=${(e: Event) => this._selectEndpoint(e, endpoint)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${endpoint.endpoint_id}</span>
          ${endpoint.has_binding_cluster
            ? html`<span class="endpoint-badge binding">Binding</span>`
            : nothing}
        </div>
        ${deviceTypes.length > 0
          ? html`<div class="endpoint-device-types">${deviceTypes.join(", ")}</div>`
          : nothing}
        ${serverClusters.length > 0
          ? html`<div class="endpoint-clusters"><span class="cluster-role">Server:</span> ${serverClusters.join(" · ")}</div>`
          : nothing}
        ${clientClusters.length > 0
          ? html`<div class="endpoint-clusters"><span class="cluster-role">Client:</span> ${clientClusters.join(" · ")}</div>`
          : nothing}
      </div>
    `;
  }

  private _renderBindingCard(binding: Binding) {
    const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    const isLoading = this._actionInProgress === actionKey;

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
        <button
          class="delete-btn ${isLoading ? "btn-loading" : ""}"
          ?disabled=${isLoading || this._actionInProgress !== null}
          @click=${() => this._deleteBinding(binding)}
        >
          ${isLoading ? "" : "Delete"}
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
    const availableTargetNodes = this._nodes.filter(
      (n) => n.node_id !== this._selectedSourceNode?.node_id
    );

    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    const targetEndpoints = targetNode?.endpoints || [];

    // Get compatible clusters based on source client + target server
    const compatibleClusters = this._getCompatibleClusters();

    // Check if source has any client clusters at all
    const sourceClientClusters = this._selectedSourceEndpoint?.client_clusters || [];
    const hasClientClusters = sourceClientClusters.length > 0;

    return html`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">Create Binding</div>

          ${!hasClientClusters
            ? html`
                <div class="dialog-warning">
                  <strong>Note:</strong> This endpoint has no client clusters.
                  Bindings are typically used by devices with client clusters to control other devices.
                </div>
              `
            : nothing}

          <form @submit=${this._handleCreateBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select
                name="targetNode"
                class="form-select"
                required
                @change=${this._handleTargetNodeChange}
              >
                ${availableTargetNodes.map(
                  (node) => html`
                    <option
                      value=${node.node_id}
                      ?selected=${node.node_id === this._selectedTargetNodeId}
                    >
                      ${node.name}
                    </option>
                  `
                )}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Endpoint</label>
              <select
                name="targetEndpoint"
                class="form-select"
                required
                @change=${this._handleTargetEndpointChange}
              >
                ${targetEndpoints.map((ep) => {
                  const deviceTypes = ep.device_types
                    .map((dt) => getDeviceTypeName(dt.id))
                    .join(", ");
                  const hasServerClusters = (ep.server_clusters || []).length > 0;
                  return html`
                    <option
                      value=${ep.endpoint_id}
                      ?selected=${ep.endpoint_id === this._selectedTargetEndpointId}
                    >
                      Endpoint ${ep.endpoint_id}${deviceTypes ? ` (${deviceTypes})` : ""}${!hasServerClusters ? " - no server clusters" : ""}
                    </option>
                  `;
                })}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              ${compatibleClusters.length > 0
                ? html`
                    <select name="cluster" class="form-select" required>
                      ${compatibleClusters.map(
                        (clusterId) => html`
                          <option value=${clusterId}>${getClusterName(clusterId)}</option>
                        `
                      )}
                    </select>
                  `
                : html`
                    <div class="no-clusters-warning">
                      No compatible clusters found. The source endpoint needs a <strong>client</strong> cluster
                      that matches a <strong>server</strong> cluster on the target endpoint.
                    </div>
                    <select name="cluster" class="form-select" disabled>
                      <option>No compatible clusters</option>
                    </select>
                  `}
            </div>

            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click=${this._closeCreateDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                ?disabled=${compatibleClusters.length === 0}
              >
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

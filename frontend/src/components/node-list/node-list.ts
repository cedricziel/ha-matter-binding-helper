/**
 * NodeList component
 *
 * Displays a list of Matter nodes with selection support.
 * Shows node name, device type, area, and availability status.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { MatterNode } from "../../types";
import { getDeviceTypeName } from "../../types";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { baseCardStyles } from "../../styles/card-styles";

/**
 * Displays a selectable list of Matter devices.
 *
 * @fires node-selected - When a node is clicked
 */
@customElement("matter-node-list")
export class NodeList extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    baseCardStyles,
    css`
      :host {
        display: block;
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
      .node-item.selected .node-endpoints,
      .node-item.selected .node-meta-sep,
      .node-item.selected .node-id {
        color: var(--text-primary-color);
        opacity: 1;
      }

      .node-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success-color, #4caf50);
        flex-shrink: 0;
      }

      .node-status.unavailable {
        background: var(--error-color, #f44336);
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

      .node-id {
        font-size: 11px;
        color: var(--secondary-text-color);
        opacity: 0.7;
        font-weight: normal;
        margin-left: 6px;
      }

      .node-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        flex-wrap: wrap;
      }

      .node-meta-sep {
        color: var(--secondary-text-color);
        opacity: 0.5;
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

      .binding-badge {
        font-size: 9px;
        padding: 1px 5px;
        background: var(--success-color, #4caf50);
        color: white;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
      }
    `,
  ];

  /** List of Matter nodes to display */
  @property({ attribute: false })
  nodes: MatterNode[] = [];

  /** Currently selected node ID */
  @property({ type: Number })
  selectedNodeId: number | null = null;

  /** Whether the list is loading */
  @property({ type: Boolean })
  loading = false;

  /** Header title */
  @property({ type: String })
  title = "Matter Devices";

  /** Whether to show endpoint counts */
  @property({ type: Boolean })
  showEndpointCount = false;

  render() {
    return html`
      <div class="card">
        <div class="card-header">${this.title}</div>
        ${this._renderContent()}
      </div>
    `;
  }

  private _renderContent() {
    if (this.loading && this.nodes.length === 0) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (this.nodes.length === 0) {
      return html`<div class="empty-state">No Matter devices found.</div>`;
    }

    return html`
      <ul class="node-list">
        ${this.nodes.map((node) => this._renderNodeItem(node))}
      </ul>
    `;
  }

  private _renderNodeItem(node: MatterNode) {
    const isSelected = this.selectedNodeId === node.node_id;
    const primaryDeviceType = this._getPrimaryDeviceType(node);
    const hasBindingCluster = this._hasBindingCluster(node);
    const nonRootEndpoints = node.endpoints.filter((e) => e.endpoint_id > 0);

    return html`
      <li>
        <div
          class="node-item ${isSelected ? "selected" : ""}"
          @click=${() => this._handleNodeClick(node)}
        >
          <span
            class="node-status ${node.available ? "" : "unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">
              ${node.name}
              <span class="node-id">#${node.node_id}</span>
            </span>
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
              ${this.showEndpointCount && nonRootEndpoints.length > 1
                ? html`
                    ${node.area_name || primaryDeviceType
                      ? html`<span class="node-meta-sep">·</span>`
                      : nothing}
                    <span class="node-endpoints"
                      >${nonRootEndpoints.length} endpoints</span
                    >
                  `
                : nothing}
              ${hasBindingCluster
                ? html`<span class="binding-badge">Binding</span>`
                : nothing}
            </div>
          </div>
        </div>
      </li>
    `;
  }

  private _getPrimaryDeviceType(node: MatterNode): string | null {
    // Get device type from endpoint 1, or first non-zero endpoint
    const primaryEndpoint =
      node.endpoints.find((e) => e.endpoint_id === 1) ||
      node.endpoints.find((e) => e.endpoint_id > 0);
    if (primaryEndpoint && primaryEndpoint.device_types.length > 0) {
      return getDeviceTypeName(primaryEndpoint.device_types[0].id);
    }
    return null;
  }

  private _hasBindingCluster(node: MatterNode): boolean {
    return node.endpoints.some((e) => e.has_binding_cluster);
  }

  private _handleNodeClick(node: MatterNode) {
    this.dispatchEvent(
      new CustomEvent("node-selected", {
        detail: { node },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-node-list": NodeList;
  }
}

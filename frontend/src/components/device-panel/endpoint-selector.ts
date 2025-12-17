/**
 * EndpointSelector component
 *
 * Displays a list of Matter endpoints for a device with selection support.
 * Shows device types, clusters, and binding capability badges.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles, stateStyles, badgeStyles } from "../../styles/shared-styles";
import type { MatterEndpoint } from "../../types";
import { getDeviceTypeName, getClusterName, isProprietaryCluster } from "../../types";

// Infrastructure clusters to filter out from display
const INFRA_CLUSTERS = [29, 30, 31, 40, 42, 48, 49, 50, 51, 52, 53, 56, 60, 62, 63, 70];

/**
 * Displays a selectable list of Matter endpoints.
 *
 * @fires endpoint-selected - When an endpoint is clicked
 */
@customElement("matter-endpoint-selector")
export class EndpointSelector extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    badgeStyles,
    css`
      :host {
        display: block;
      }

      .section-header {
        font-size: 14px;
        font-weight: 600;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .endpoint-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .endpoint-item {
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--card-background-color);
      }

      .endpoint-item:hover {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
      }

      .endpoint-item.selected {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
      }

      .endpoint-item.no-binding {
        opacity: 0.7;
      }

      .endpoint-item.no-binding:hover {
        opacity: 1;
      }

      .endpoint-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .endpoint-id {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .endpoint-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .endpoint-badge.binding {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .endpoint-badge.proprietary {
        background: var(--warning-color, #ff9800);
        color: white;
      }

      .endpoint-device-types {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }

      .endpoint-item.selected .endpoint-device-types {
        color: var(--primary-text-color);
      }

      .endpoint-clusters {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cluster-section {
        font-size: 12px;
      }

      .cluster-label {
        color: var(--secondary-text-color);
        font-weight: 500;
        margin-right: 4px;
      }

      .cluster-list {
        display: inline;
      }

      .cluster-tag {
        display: inline-block;
        padding: 2px 6px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        margin: 2px 2px 2px 0;
        font-size: 11px;
        color: var(--primary-text-color);
      }

      .cluster-tag.proprietary {
        background: rgba(255, 152, 0, 0.2);
        color: var(--warning-color, #ff9800);
      }

      .endpoint-item.selected .cluster-tag {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.2);
      }

      .empty-state {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
    `,
  ];

  /** List of endpoints to display */
  @property({ attribute: false })
  endpoints: MatterEndpoint[] = [];

  /** Currently selected endpoint ID */
  @property({ type: Number })
  selectedEndpointId: number | null = null;

  render() {
    return html`
      <div class="section-header">Endpoints</div>
      ${this.endpoints.length > 0
        ? html`
            <div class="endpoint-list">
              ${this.endpoints.map((endpoint) => this._renderEndpointItem(endpoint))}
            </div>
          `
        : html`<div class="empty-state">No endpoints found</div>`}
    `;
  }

  private _renderEndpointItem(endpoint: MatterEndpoint) {
    const isSelected = this.selectedEndpointId === endpoint.endpoint_id;

    // Get device type names (skip Root Node for endpoint 0)
    const deviceTypes = endpoint.device_types
      .map((dt) => getDeviceTypeName(dt.id))
      .filter((name) => endpoint.endpoint_id !== 0 || !name.includes("Root"));

    // Filter and process server clusters
    const serverClusterData = this._processClusterData(endpoint.server_clusters || []);

    // Filter and process client clusters
    const clientClusterData = this._processClusterData(endpoint.client_clusters || []);

    // Check if endpoint has any proprietary clusters
    const hasProprietary =
      serverClusterData.some((c) => c.isProprietary) ||
      clientClusterData.some((c) => c.isProprietary);

    const classes = [
      "endpoint-item",
      isSelected ? "selected" : "",
      !endpoint.has_binding_cluster ? "no-binding" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${classes} @click=${() => this._handleEndpointClick(endpoint)}>
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${endpoint.endpoint_id}</span>
          ${endpoint.has_binding_cluster
            ? html`<span class="endpoint-badge binding">Binding</span>`
            : nothing}
          ${hasProprietary
            ? html`<span class="endpoint-badge proprietary">Proprietary</span>`
            : nothing}
        </div>
        ${deviceTypes.length > 0
          ? html`<div class="endpoint-device-types">${deviceTypes.join(", ")}</div>`
          : nothing}
        ${this._renderClusters(serverClusterData, clientClusterData)}
      </div>
    `;
  }

  private _processClusterData(clusterIds: number[]) {
    return clusterIds
      .filter((c) => !INFRA_CLUSTERS.includes(c))
      .map((c) => ({
        id: c,
        name: getClusterName(c),
        isProprietary: isProprietaryCluster(c),
      }));
  }

  private _renderClusters(
    serverClusters: Array<{ id: number; name: string; isProprietary: boolean }>,
    clientClusters: Array<{ id: number; name: string; isProprietary: boolean }>
  ) {
    if (serverClusters.length === 0 && clientClusters.length === 0) {
      return nothing;
    }

    return html`
      <div class="endpoint-clusters">
        ${serverClusters.length > 0
          ? html`
              <div class="cluster-section">
                <span class="cluster-label">Server:</span>
                <span class="cluster-list">
                  ${serverClusters.map(
                    (c) => html`
                      <span
                        class="cluster-tag ${c.isProprietary ? "proprietary" : ""}"
                        title="${c.name} (0x${c.id.toString(16).toUpperCase()})"
                      >
                        ${c.name}
                      </span>
                    `
                  )}
                </span>
              </div>
            `
          : nothing}
        ${clientClusters.length > 0
          ? html`
              <div class="cluster-section">
                <span class="cluster-label">Client:</span>
                <span class="cluster-list client">
                  ${clientClusters.map(
                    (c) => html`
                      <span
                        class="cluster-tag ${c.isProprietary ? "proprietary" : ""}"
                        title="${c.name} (0x${c.id.toString(16).toUpperCase()})"
                      >
                        ${c.name}
                      </span>
                    `
                  )}
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _handleEndpointClick(endpoint: MatterEndpoint) {
    this.dispatchEvent(
      new CustomEvent("endpoint-selected", {
        detail: { endpoint },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-endpoint-selector": EndpointSelector;
  }
}

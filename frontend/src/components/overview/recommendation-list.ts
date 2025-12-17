/**
 * RecommendationList component
 *
 * Displays a list of recommended Matter bindings with create actions.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles, stateStyles, badgeStyles } from "../../styles/shared-styles";
import { baseCardStyles, overviewCardStyles } from "../../styles/card-styles";
import type { BindingRecommendation } from "../../types";
import { getClusterName, getClusterBindingDescription } from "../../types";

/**
 * Displays a list of binding recommendations.
 *
 * @fires create-binding - When create button is clicked for a recommendation
 * @fires navigate-device - When a device name link is clicked
 */
@customElement("matter-recommendation-list")
export class RecommendationList extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    badgeStyles,
    baseCardStyles,
    overviewCardStyles,
    css`
      :host {
        display: block;
      }

      .recommendation-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .recommendation-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .recommendation-row:hover {
        background: var(--secondary-background-color);
      }

      .binding-description {
        flex: 1;
        min-width: 0;
      }

      .binding-sentence {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 4px;
      }

      .binding-sentence strong {
        font-weight: 500;
      }

      .binding-action {
        color: var(--secondary-text-color);
        margin: 0 4px;
      }

      .device-link {
        color: var(--primary-color);
        cursor: pointer;
      }

      .device-link:hover {
        text-decoration: underline;
      }

      .cluster-badges {
        display: inline-flex;
        gap: 4px;
        margin-left: 8px;
        flex-wrap: wrap;
      }

      .cluster-badge {
        font-size: 10px;
        padding: 2px 6px;
        background: var(--primary-color);
        color: white;
        border-radius: 4px;
        font-weight: 500;
      }

      .binding-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .empty-state {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .loading {
        padding: 24px 16px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .count-badge {
        background: var(--primary-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 8px;
      }
    `,
  ];

  /** List of binding recommendations to display */
  @property({ attribute: false })
  recommendations: BindingRecommendation[] = [];

  /** Whether data is loading */
  @property({ type: Boolean })
  loading = false;

  /** Whether an action is in progress (disables buttons) */
  @property({ type: Boolean })
  actionInProgress = false;

  /** Title for the section */
  @property({ type: String })
  title = "Recommended Bindings";

  render() {
    return html`
      <div class="card overview-card">
        <div class="card-header">
          ${this.title}
          <span class="count-badge">${this.recommendations.length}</span>
        </div>
        ${this._renderContent()}
      </div>
    `;
  }

  private _renderContent() {
    if (this.loading) {
      return html`<div class="loading">Loading recommendations...</div>`;
    }

    if (this.recommendations.length === 0) {
      return html`
        <div class="empty-state">
          No binding recommendations. All compatible endpoints are already bound.
        </div>
      `;
    }

    return html`
      <div class="recommendation-list">
        ${this.recommendations.map((r) => this._renderRecommendationRow(r))}
      </div>
    `;
  }

  private _renderRecommendationRow(recommendation: BindingRecommendation) {
    const {
      sourceNode,
      sourceEndpoint,
      targetNode,
      targetEndpoint,
      compatibleClusters,
    } = recommendation;

    // Build action description from compatible clusters
    const actions = compatibleClusters.map((c) => {
      const desc = getClusterBindingDescription(c);
      return desc.action.replace(/^(control |read |receive |trigger |manage )/, "");
    });
    // Deduplicate and join
    const uniqueActions = [...new Set(actions)];
    const actionText =
      uniqueActions.length > 2
        ? `${uniqueActions.slice(0, 2).join(", ")}...`
        : uniqueActions.join(", ");

    const actionDescription =
      compatibleClusters.length === 1
        ? getClusterBindingDescription(compatibleClusters[0]).action
        : `access ${actionText} from`;

    return html`
      <div class="recommendation-row">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._handleNavigateDevice(sourceNode.ha_device_id!)
                : nothing}
            >
              ${sourceNode.name}
            </strong>
            <span class="binding-action">can ${actionDescription}</span>
            <strong
              class="${targetNode.ha_device_id ? "device-link" : ""}"
              @click=${targetNode.ha_device_id
                ? () => this._handleNavigateDevice(targetNode.ha_device_id!)
                : nothing}
            >
              ${targetNode.name}
            </strong>
            <span class="cluster-badges">
              ${compatibleClusters.map((clusterId) => {
                const clusterName = getClusterName(clusterId);
                const clusterDesc = getClusterBindingDescription(clusterId);
                const tooltip = `${clusterName}: ${clusterDesc.dataType}`;
                return html`
                  <span class="cluster-badge" title="${tooltip}">${clusterName}</span>
                `;
              })}
            </span>
          </div>
          <div class="binding-meta">
            #${sourceNode.node_id} EP ${sourceEndpoint.endpoint_id} →
            #${targetNode.node_id} EP ${targetEndpoint.endpoint_id}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
          </div>
        </div>
        <button
          class="btn btn-small btn-primary"
          ?disabled=${this.actionInProgress}
          @click=${() => this._handleCreateBinding(recommendation)}
        >
          Create
        </button>
      </div>
    `;
  }

  private _handleCreateBinding(recommendation: BindingRecommendation) {
    this.dispatchEvent(
      new CustomEvent("create-binding", {
        detail: { recommendation },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleNavigateDevice(deviceId: string | null) {
    if (!deviceId) return;

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
    "matter-recommendation-list": RecommendationList;
  }
}

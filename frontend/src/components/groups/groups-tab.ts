/**
 * GroupsTab component
 *
 * Displays Matter groups with their members.
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { stateStyles, buttonStyles } from "../../styles/shared-styles";
import { baseCardStyles } from "../../styles/card-styles";
import type { MatterGroup } from "../../types";

/**
 * Displays Matter groups and their members.
 *
 * @fires group-click - When a group is clicked
 */
@customElement("matter-groups-tab")
export class GroupsTab extends LitElement {
  static styles = [
    stateStyles,
    buttonStyles,
    baseCardStyles,
    css`
      :host {
        display: block;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .group-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }

      .group-card-header .group-info {
        flex: 1;
        min-width: 0;
      }

      .btn-delete-group {
        flex-shrink: 0;
      }

      .binding-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .group-card {
        padding: 12px 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: background 0.2s;
      }

      .group-card:hover {
        background: var(--secondary-background-color);
      }

      .group-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .group-meta {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .member-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
      }

      .member-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: var(--secondary-background-color);
        border-radius: 12px;
        font-size: 11px;
      }
    `,
  ];

  /** Matter groups to display */
  @property({ attribute: false })
  groups: MatterGroup[] = [];

  /** Whether groups are loading */
  @property({ type: Boolean })
  loading = false;

  render() {
    return html`
      <div class="card">
        <div class="card-header">
          <span>Matter Groups</span>
          <span class="header-actions">
            <button
              type="button"
              class="btn btn-secondary"
              title="Re-provision keys and access for existing groupcast bindings"
              @click=${this._handleRepairClick}
            >
              Repair
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._handleCreateClick}
            >
              Create Group
            </button>
          </span>
        </div>
        ${this.loading
          ? html`<div class="loading">Loading...</div>`
          : this.groups.length > 0
            ? this._renderGroupList()
            : html`
                <div class="empty-state">
                  No Matter groups configured. Create one to get started.
                </div>
              `}
      </div>
    `;
  }

  private _renderGroupList() {
    return html`
      <div class="binding-list">
        ${this.groups.map((group) => this._renderGroup(group))}
      </div>
    `;
  }

  private _renderGroup(group: MatterGroup) {
    return html`
      <div class="group-card" @click=${() => this._handleGroupClick(group)}>
        <div class="group-card-header">
          <div class="group-info">
            <div class="group-name">${group.name}</div>
            <div class="group-meta">
              Group ID: ${group.group_id} | ${group.members.length} member(s)
            </div>
          </div>
          <button
            type="button"
            class="btn btn-secondary btn-delete-group"
            @click=${(e: Event) => this._handleDeleteClick(e, group)}
          >
            Delete
          </button>
        </div>
        ${group.members.length > 0
          ? html`
              <div class="member-list">
                ${group.members.map(
                  (member) => html`
                    <span class="member-chip">
                      Node ${member.node_id} EP ${member.endpoint_id}
                    </span>
                  `
                )}
              </div>
            `
          : null}
      </div>
    `;
  }

  private _handleGroupClick(group: MatterGroup) {
    this.dispatchEvent(new CustomEvent("group-click", {
      detail: { group },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCreateClick() {
    this.dispatchEvent(new CustomEvent("create-group-click", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleRepairClick() {
    this.dispatchEvent(new CustomEvent("repair-groups-click", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleDeleteClick(e: Event, group: MatterGroup) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent("delete-group", {
      detail: { group },
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-groups-tab": GroupsTab;
  }
}

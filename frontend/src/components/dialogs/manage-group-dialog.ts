/**
 * ManageGroupDialog component
 *
 * Lists a group's members and lets the user add/remove endpoints.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";
import type { MatterEndpoint, MatterGroup, MatterNode } from "../../types";
import { getDeviceTypeName } from "../../types";

/**
 * Dialog to manage a Matter group's members.
 *
 * @fires add-member - { nodeId: number, endpointId: number }
 * @fires remove-member - { nodeId: number, endpointId: number }
 * @fires close - When dismissed
 */
@customElement("matter-manage-group-dialog")
export class ManageGroupDialog extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    dialogBaseStyles,
    css`
      :host {
        display: contents;
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
        margin: 16px 0 8px;
        color: var(--primary-text-color);
      }
      .member-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .member-label {
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 4px 0 8px;
      }
      .add-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .add-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 120px;
      }
      .add-field label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      select {
        padding: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }
    `,
  ];

  /** Whether the dialog is open */
  @property({ type: Boolean })
  open = false;

  /** The group being managed */
  @property({ attribute: false })
  group: MatterGroup | null = null;

  /** Nodes available to add as members */
  @property({ attribute: false })
  availableNodes: MatterNode[] = [];

  /** Whether an action is in progress */
  @property({ type: Boolean })
  loading = false;

  @state() private _selectedNodeId: number | null = null;
  @state() private _selectedEndpointId: number | null = null;

  render() {
    if (!this.open || !this.group) {
      return nothing;
    }

    const group = this.group;

    return html`
      <div class="dialog-overlay" @click=${this._handleClose}>
        <div class="dialog" @click=${this._stop}>
          <div class="dialog-header">
            ${group.name} <span class="source-info">Group ${group.group_id}</span>
          </div>
          <div class="dialog-body">
            <div class="section-title">Members</div>
            ${group.members.length === 0
              ? html`<div class="empty">No members yet. Add one below.</div>`
              : group.members.map((m) => this._renderMember(m.node_id, m.endpoint_id))}

            <div class="section-title">Add member</div>
            ${this._renderAddRow()}
          </div>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._handleClose}
              ?disabled=${this.loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /** A label describing what an endpoint is, e.g. "EP 1 — Dimmable Light". */
  private _endpointLabel(endpoint: MatterEndpoint): string {
    const deviceTypeId = endpoint.device_types?.[0]?.id;
    const typeName =
      deviceTypeId !== undefined ? getDeviceTypeName(deviceTypeId) : null;
    return typeName
      ? `EP ${endpoint.endpoint_id} — ${typeName}`
      : `EP ${endpoint.endpoint_id}`;
  }

  private _renderMember(nodeId: number, endpointId: number) {
    const node = this.availableNodes.find((n) => n.node_id === nodeId);
    const name = node?.name ?? `Node ${nodeId}`;
    const endpoint = node?.endpoints.find((e) => e.endpoint_id === endpointId);
    const label = endpoint ? this._endpointLabel(endpoint) : `EP ${endpointId}`;
    return html`
      <div class="member-row">
        <span class="member-label">${name} — ${label}</span>
        <button
          type="button"
          class="btn btn-secondary"
          @click=${() => this._removeMember(nodeId, endpointId)}
          ?disabled=${this.loading}
        >
          Remove
        </button>
      </div>
    `;
  }

  private _renderAddRow() {
    const node = this.availableNodes.find(
      (n) => n.node_id === this._selectedNodeId
    );
    // Endpoints excluding the root (0), which can't be a group member.
    const endpoints = (node?.endpoints ?? []).filter((e) => e.endpoint_id !== 0);

    return html`
      <div class="add-row">
        <div class="add-field">
          <label for="add-node">Device</label>
          <select
            id="add-node"
            @change=${this._onNodeChange}
            ?disabled=${this.loading}
          >
            <option value="" ?selected=${this._selectedNodeId === null}>
              Select…
            </option>
            ${this.availableNodes.map(
              (n) => html`
                <option value=${n.node_id} ?selected=${n.node_id === this._selectedNodeId}>
                  ${n.name} (${n.node_id})
                </option>
              `
            )}
          </select>
        </div>
        <div class="add-field">
          <label for="add-endpoint">Endpoint</label>
          <select
            id="add-endpoint"
            @change=${this._onEndpointChange}
            ?disabled=${this.loading || this._selectedNodeId === null}
          >
            <option value="" ?selected=${this._selectedEndpointId === null}>
              Select…
            </option>
            ${endpoints.map(
              (e) => html`
                <option
                  value=${e.endpoint_id}
                  ?selected=${e.endpoint_id === this._selectedEndpointId}
                >
                  ${this._endpointLabel(e)}
                </option>
              `
            )}
          </select>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          @click=${this._addMember}
          ?disabled=${this.loading ||
          this._selectedNodeId === null ||
          this._selectedEndpointId === null ||
          this._isAlreadyMember()}
        >
          Add
        </button>
      </div>
    `;
  }

  private _isAlreadyMember(): boolean {
    if (
      !this.group ||
      this._selectedNodeId === null ||
      this._selectedEndpointId === null
    ) {
      return false;
    }
    return this.group.members.some(
      (m) =>
        m.node_id === this._selectedNodeId &&
        m.endpoint_id === this._selectedEndpointId
    );
  }

  private _stop(e: Event) {
    e.stopPropagation();
  }

  private _onNodeChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this._selectedNodeId = value === "" ? null : parseInt(value, 10);
    this._selectedEndpointId = null;
  }

  private _onEndpointChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this._selectedEndpointId = value === "" ? null : parseInt(value, 10);
  }

  private _addMember() {
    if (this._selectedNodeId === null || this._selectedEndpointId === null) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("add-member", {
        detail: {
          nodeId: this._selectedNodeId,
          endpointId: this._selectedEndpointId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _removeMember(nodeId: number, endpointId: number) {
    this.dispatchEvent(
      new CustomEvent("remove-member", {
        detail: { nodeId, endpointId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleClose() {
    this._selectedNodeId = null;
    this._selectedEndpointId = null;
    this.dispatchEvent(
      new CustomEvent("close", { bubbles: true, composed: true })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-manage-group-dialog": ManageGroupDialog;
  }
}

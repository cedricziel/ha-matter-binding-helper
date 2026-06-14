/**
 * CreateGroupDialog component
 *
 * Dialog for creating a new Matter group. Name-only by default (the group id is
 * auto-allocated by the backend); an "Advanced" toggle reveals an optional
 * manual group id field.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";

/**
 * Dialog to create a Matter group.
 *
 * @fires create-group - { name: string, groupId?: number } (groupId only when set via Advanced)
 * @fires cancel - When cancelled
 */
@customElement("matter-create-group-dialog")
export class CreateGroupDialog extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    dialogBaseStyles,
    css`
      :host {
        display: contents;
      }
      .field {
        margin-bottom: 16px;
      }
      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      input {
        width: 100%;
        box-sizing: border-box;
        padding: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }
      .error {
        color: var(--error-color, #f44336);
        font-size: 12px;
        margin-top: 8px;
      }
      .advanced-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 400;
        cursor: pointer;
        margin-bottom: 12px;
      }
      .advanced-toggle input {
        width: auto;
      }
      .note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 6px;
        line-height: 1.4;
      }
    `,
  ];

  /** Whether the dialog is open */
  @property({ type: Boolean })
  open = false;

  /** Whether an action is in progress */
  @property({ type: Boolean })
  loading = false;

  @state() private _name = "";
  @state() private _error = "";
  @state() private _advanced = false;
  @state() private _groupId = "";

  render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="dialog-overlay" @click=${this._handleCancel}>
        <div class="dialog" @click=${this._stop}>
          <div class="dialog-header">Create Group</div>
          <div class="dialog-body">
            <div class="field">
              <label for="group-name">Name</label>
              <input
                id="group-name"
                type="text"
                .value=${this._name}
                @input=${this._onName}
                ?disabled=${this.loading}
                placeholder="e.g. Living Room Lights"
              />
            </div>
            <label class="advanced-toggle">
              <input
                type="checkbox"
                .checked=${this._advanced}
                @change=${this._onAdvancedToggle}
                ?disabled=${this.loading}
              />
              Advanced: set group ID manually
            </label>
            ${this._advanced
              ? html`
                  <div class="field">
                    <label for="group-id">Group ID</label>
                    <input
                      id="group-id"
                      type="number"
                      min="1"
                      max="65527"
                      .value=${this._groupId}
                      @input=${this._onGroupId}
                      ?disabled=${this.loading}
                      placeholder="e.g. 100"
                    />
                    <div class="note">
                      Leave Advanced off to let Home Assistant pick a free ID
                      automatically. Only set this if you need to match a specific
                      Matter group ID (1–65527); it must not already be in use.
                    </div>
                  </div>
                `
              : nothing}
            ${this._error
              ? html`<div class="error">${this._error}</div>`
              : nothing}
          </div>
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
              type="button"
              class="btn btn-primary ${this.loading ? "btn-loading" : ""}"
              @click=${this._handleCreate}
              ?disabled=${this.loading}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _stop(e: Event) {
    e.stopPropagation();
  }

  private _onName(e: Event) {
    this._name = (e.target as HTMLInputElement).value;
    this._error = "";
  }

  private _onAdvancedToggle(e: Event) {
    this._advanced = (e.target as HTMLInputElement).checked;
    this._error = "";
  }

  private _onGroupId(e: Event) {
    this._groupId = (e.target as HTMLInputElement).value;
    this._error = "";
  }

  private _handleCreate() {
    if (!this._name.trim()) {
      this._error = "Name is required.";
      return;
    }

    const detail: { name: string; groupId?: number } = {
      name: this._name.trim(),
    };

    if (this._advanced && this._groupId.trim() !== "") {
      const groupId = parseInt(this._groupId, 10);
      if (!Number.isInteger(groupId) || groupId < 1 || groupId > 65527) {
        this._error = "Group ID must be a whole number between 1 and 65527.";
        return;
      }
      detail.groupId = groupId;
    }

    this.dispatchEvent(
      new CustomEvent("create-group", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleCancel() {
    this._name = "";
    this._groupId = "";
    this._advanced = false;
    this._error = "";
    this.dispatchEvent(
      new CustomEvent("cancel", { bubbles: true, composed: true })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-create-group-dialog": CreateGroupDialog;
  }
}

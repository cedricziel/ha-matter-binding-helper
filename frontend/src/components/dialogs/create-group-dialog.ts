/**
 * CreateGroupDialog component
 *
 * Dialog for creating a new Matter group (group id + name).
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";

/**
 * Dialog to create a Matter group.
 *
 * @fires create-group - { groupId: number, name: string }
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

  private _handleCreate() {
    if (!this._name.trim()) {
      this._error = "Name is required.";
      return;
    }
    this.dispatchEvent(
      new CustomEvent("create-group", {
        detail: { name: this._name.trim() },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleCancel() {
    this._name = "";
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

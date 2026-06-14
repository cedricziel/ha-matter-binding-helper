/**
 * CreateGroupDialog component
 *
 * Two-step wizard for creating a Matter group:
 *   Step 1 — "What will this group control?": pick a preset (Lights, Outlets,
 *            Window coverings) or Custom (a single cluster). This records the
 *            group's *type*, which the integration's registry is the sole
 *            authority for (Matter groups are untyped on the wire).
 *   Step 2 — Name the group. The group id is auto-allocated by the backend; an
 *            "Advanced" toggle reveals an optional manual group id field.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";
import {
  GROUP_CATEGORIES,
  CUSTOM_CATEGORY_ID,
  type GroupCategory,
} from "../../group-type-logic";
import { CLUSTER_NAMES, getClusterName } from "../../types";

// Clusters offered in the Custom step — controllable application clusters that
// make sense as a groupcast target. (Group/management clusters are excluded.)
const CUSTOM_CLUSTER_CHOICES = [0x0006, 0x0008, 0x0300, 0x0102, 0x0201].filter(
  (c) => c in CLUSTER_NAMES
);

/**
 * Dialog to create a Matter group.
 *
 * @fires create-group - { name: string, clusters: number[], groupId?: number }
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
      input,
      select {
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
      .category-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .category-card {
        display: block;
        width: 100%;
        text-align: left;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }
      .category-card:hover {
        background: var(--secondary-background-color);
      }
      .category-card.selected {
        border-color: var(--primary-color, #03a9f4);
      }
      .category-label {
        font-weight: 500;
        margin-bottom: 2px;
      }
      .category-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .step-summary {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
    `,
  ];

  /** Whether the dialog is open */
  @property({ type: Boolean })
  open = false;

  /** Whether an action is in progress */
  @property({ type: Boolean })
  loading = false;

  @state() private _step: 1 | 2 = 1;
  @state() private _categoryId = "";
  @state() private _customCluster = "";
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
            ${this._step === 1 ? this._renderStep1() : this._renderStep2()}
            ${this._error
              ? html`<div class="error">${this._error}</div>`
              : nothing}
          </div>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._step === 1 ? this._handleCancel : this._back}
              ?disabled=${this.loading}
            >
              ${this._step === 1 ? "Cancel" : "Back"}
            </button>
            ${this._step === 1
              ? html`
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click=${this._next}
                  >
                    Next
                  </button>
                `
              : html`
                  <button
                    type="button"
                    class="btn btn-primary ${this.loading ? "btn-loading" : ""}"
                    @click=${this._handleCreate}
                    ?disabled=${this.loading}
                  >
                    Create
                  </button>
                `}
          </div>
        </div>
      </div>
    `;
  }

  private _renderStep1() {
    return html`
      <div class="field">
        <label>What will this group control?</label>
        <div class="category-list">
          ${GROUP_CATEGORIES.map(
            (cat) => html`
              <button
                type="button"
                class="category-card ${this._categoryId === cat.id
                  ? "selected"
                  : ""}"
                @click=${() => this._selectCategory(cat)}
              >
                <div class="category-label">${cat.label}</div>
                <div class="category-desc">${cat.description}</div>
              </button>
            `
          )}
          <button
            type="button"
            class="category-card ${this._categoryId === CUSTOM_CATEGORY_ID
              ? "selected"
              : ""}"
            @click=${this._selectCustom}
          >
            <div class="category-label">Custom</div>
            <div class="category-desc">Pick a single cluster manually</div>
          </button>
        </div>
        ${this._categoryId === CUSTOM_CATEGORY_ID
          ? html`
              <div class="field" style="margin-top: 12px;">
                <label for="custom-cluster">Cluster</label>
                <select
                  id="custom-cluster"
                  .value=${this._customCluster}
                  @change=${this._onCustomCluster}
                >
                  <option value="">Select a cluster…</option>
                  ${CUSTOM_CLUSTER_CHOICES.map(
                    (c) => html`
                      <option
                        value=${c}
                        ?selected=${this._customCluster === String(c)}
                      >
                        ${getClusterName(c)} (0x${c.toString(16).padStart(4, "0")})
                      </option>
                    `
                  )}
                </select>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderStep2() {
    const clusters = this._selectedClusters();
    const typeLabel =
      this._categoryId === CUSTOM_CATEGORY_ID
        ? getClusterName(clusters[0])
        : GROUP_CATEGORIES.find((c) => c.id === this._categoryId)?.label ?? "";
    return html`
      <div class="step-summary">Type: ${typeLabel}</div>
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
    `;
  }

  /** The clusters implied by the current step-1 selection. */
  private _selectedClusters(): number[] {
    if (this._categoryId === CUSTOM_CATEGORY_ID) {
      const c = parseInt(this._customCluster, 10);
      return Number.isInteger(c) ? [c] : [];
    }
    const preset = GROUP_CATEGORIES.find((c) => c.id === this._categoryId);
    return preset ? [...preset.clusters] : [];
  }

  private _stop(e: Event) {
    e.stopPropagation();
  }

  private _selectCategory(cat: GroupCategory) {
    this._categoryId = cat.id;
    this._error = "";
  }

  private _selectCustom() {
    this._categoryId = CUSTOM_CATEGORY_ID;
    this._error = "";
  }

  private _onCustomCluster(e: Event) {
    this._customCluster = (e.target as HTMLSelectElement).value;
    this._error = "";
  }

  private _next() {
    if (!this._categoryId) {
      this._error = "Pick what this group will control.";
      return;
    }
    if (
      this._categoryId === CUSTOM_CATEGORY_ID &&
      this._selectedClusters().length === 0
    ) {
      this._error = "Select a cluster for the custom group.";
      return;
    }
    this._error = "";
    this._step = 2;
  }

  private _back() {
    this._error = "";
    this._step = 1;
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

    const clusters = this._selectedClusters();
    const detail: { name: string; clusters: number[]; groupId?: number } = {
      name: this._name.trim(),
      clusters,
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
    this._reset();
    this.dispatchEvent(
      new CustomEvent("cancel", { bubbles: true, composed: true })
    );
  }

  private _reset() {
    this._step = 1;
    this._categoryId = "";
    this._customCluster = "";
    this._name = "";
    this._groupId = "";
    this._advanced = false;
    this._error = "";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-create-group-dialog": CreateGroupDialog;
  }
}

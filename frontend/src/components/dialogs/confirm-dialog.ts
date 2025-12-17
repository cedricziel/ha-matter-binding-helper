/**
 * ConfirmDialog component
 *
 * A reusable confirmation dialog with customizable title, message, and buttons.
 * Supports different variants (info, warning, danger) and custom content via slots.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles, confirmDialogStyles } from "../../styles/dialog-styles";

export type ConfirmDialogVariant = "info" | "warning" | "danger";

/**
 * A reusable confirmation dialog component.
 *
 * @fires confirm - When confirm button is clicked
 * @fires cancel - When cancel button or overlay is clicked
 * @slot - Default slot for custom content to display in the dialog body
 */
@customElement("matter-confirm-dialog")
export class ConfirmDialog extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    dialogBaseStyles,
    confirmDialogStyles,
    css`
      :host {
        display: contents;
      }

      .dialog.variant-warning .btn-primary {
        background: var(--warning-color, #ff9800);
      }

      .dialog.variant-danger .btn-primary {
        background: var(--error-color, #f44336);
      }

      .dialog.variant-warning .confirm-icon {
        color: var(--warning-color, #ff9800);
      }

      .dialog.variant-danger .confirm-icon {
        color: var(--error-color, #f44336);
      }

      .dialog-body {
        margin-bottom: 24px;
      }

      .default-message {
        font-size: 14px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }
    `,
  ];

  /** Whether the dialog is open/visible */
  @property({ type: Boolean })
  open = false;

  /** Dialog title */
  @property({ type: String })
  title = "Confirm";

  /** Dialog message (displayed if no content slot provided) */
  @property({ type: String })
  message = "";

  /** Icon to display next to title */
  @property({ type: String })
  icon = "";

  /** Variant affects button color and icon styling */
  @property({ type: String })
  variant: ConfirmDialogVariant = "info";

  /** Text for confirm button */
  @property({ type: String })
  confirmLabel = "Confirm";

  /** Text for cancel button */
  @property({ type: String })
  cancelLabel = "Cancel";

  /** Whether an action is in progress (disables buttons) */
  @property({ type: Boolean })
  loading = false;

  render() {
    if (!this.open) {
      return nothing;
    }

    const dialogClasses = [
      "dialog",
      "confirm-dialog",
      `variant-${this.variant}`,
    ].join(" ");

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class=${dialogClasses} @click=${this._handleDialogClick}>
          <div class="dialog-header">
            ${this.icon
              ? html`<span class="confirm-icon">${this.icon}</span>`
              : nothing}
            ${this.title}
          </div>

          <div class="dialog-body">
            <slot>
              ${this.message
                ? html`<div class="default-message">${this.message}</div>`
                : nothing}
            </slot>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._handleCancel}
              ?disabled=${this.loading}
            >
              ${this.cancelLabel}
            </button>
            <button
              type="button"
              class="btn btn-primary ${this.loading ? "btn-loading" : ""}"
              @click=${this._handleConfirm}
              ?disabled=${this.loading}
            >
              ${this.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleOverlayClick() {
    this._handleCancel();
  }

  private _handleDialogClick(e: Event) {
    e.stopPropagation();
  }

  private _handleConfirm() {
    this.dispatchEvent(
      new CustomEvent("confirm", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent("cancel", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-confirm-dialog": ConfirmDialog;
  }
}

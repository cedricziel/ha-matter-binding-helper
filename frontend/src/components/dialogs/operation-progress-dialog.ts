/**
 * OperationProgressDialog component
 *
 * A blocking modal that displays step-by-step operation progress.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles } from "../../styles/shared-styles";
import { dialogStyles } from "../../styles/dialog-styles";
import { operationStepStyles } from "../../styles/misc-styles";
import type { OperationProgressState } from "../../types";

/**
 * Displays a blocking progress dialog for multi-step operations.
 *
 * @fires close - When Done button is clicked
 * @fires cancel - When Cancel button is clicked (if canCancel)
 */
@customElement("matter-operation-progress-dialog")
export class OperationProgressDialog extends LitElement {
  static styles = [
    buttonStyles,
    dialogStyles,
    operationStepStyles,
    css`
      :host {
        display: block;
      }

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

      .dialog-overlay.blocking {
        pointer-events: auto;
      }

      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .dialog-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
        font-size: 18px;
        font-weight: 500;
      }

      .dialog-content {
        padding: 20px;
      }

      .dialog-actions {
        padding: 12px 20px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .operation-steps {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .operation-step {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        background: var(--secondary-background-color);
      }

      .operation-step.in_progress {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
      }

      .operation-step.success .step-icon {
        color: var(--success-color, #4caf50);
      }

      .operation-step.error .step-icon {
        color: var(--error-color, #f44336);
      }

      .operation-step.skipped {
        opacity: 0.6;
      }

      .step-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
      }

      .step-label {
        flex: 1;
      }

      .step-message {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .operation-hint {
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 13px;
        margin-top: 16px;
      }

      .operation-error {
        color: var(--error-color, #f44336);
        background: rgba(244, 67, 54, 0.1);
        padding: 12px;
        border-radius: 4px;
        margin-top: 16px;
      }
    `,
  ];

  /** The operation progress state */
  @property({ attribute: false })
  progress: OperationProgressState | null = null;

  /** Whether to show the dialog */
  @property({ type: Boolean })
  open = false;

  render() {
    if (!this.open || !this.progress) {
      return nothing;
    }

    const { title, steps, completed, error, canCancel } = this.progress;

    return html`
      <div class="dialog-overlay blocking">
        <div class="dialog operation-progress-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">${title}</div>
          <div class="dialog-content">
            <div class="operation-steps">
              ${steps.map((step) => html`
                <div class="operation-step ${step.status}">
                  <span class="step-icon">
                    ${step.status === "in_progress" ? "⏳" :
                      step.status === "success" ? "✓" :
                      step.status === "error" ? "✗" :
                      step.status === "skipped" ? "–" : "○"}
                  </span>
                  <span class="step-label">${step.label}</span>
                  ${step.message ? html`<span class="step-message">${step.message}</span>` : nothing}
                </div>
              `)}
            </div>
            ${error ? html`<div class="operation-error">${error}</div>` : nothing}
            ${!completed ? html`<div class="operation-hint">Communicating with Matter device...</div>` : nothing}
          </div>
          <div class="dialog-actions">
            ${completed
              ? html`<button class="btn btn-primary" @click=${this._handleClose}>Done</button>`
              : canCancel
                ? html`<button class="btn btn-secondary" @click=${this._handleCancel}>Cancel</button>`
                : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private _handleClose() {
    this.dispatchEvent(new CustomEvent("close", {
      bubbles: true,
      composed: true,
    }));
  }

  private _handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel", {
      bubbles: true,
      composed: true,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-operation-progress-dialog": OperationProgressDialog;
  }
}

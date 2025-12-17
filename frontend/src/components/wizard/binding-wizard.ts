/**
 * BindingWizard component
 *
 * A multi-step wizard for creating Matter bindings with ACL provisioning.
 * Steps: 1) Create binding, 2) Set permissions (ACL), 3) Verify binding
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles, wizardStyles, privilegeSelectorStyles } from "../../styles/dialog-styles";
import type { BindingWizardState, BindingWizardStep } from "../../types";
import { getClusterName, getClusterBindingDescription } from "../../types";
import { getRecommendedPrivilege, PRIVILEGE_OPTIONS } from "../../acl-logic";

const STEPS: BindingWizardStep[] = ["binding", "acl", "verify"];

/**
 * A multi-step wizard for creating Matter bindings.
 *
 * @fires execute-binding - When create binding button is clicked
 * @fires execute-acl - When set permissions button is clicked
 * @fires execute-verify - When verify button is clicked
 * @fires privilege-change - When privilege selection changes
 * @fires step-change - When step is changed (e.g., skip)
 * @fires close - When cancel/done button or overlay is clicked
 */
@customElement("matter-binding-wizard")
export class BindingWizard extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    dialogBaseStyles,
    wizardStyles,
    privilegeSelectorStyles,
    css`
      :host {
        display: contents;
      }

      .dialog {
        max-width: 550px;
        width: 90vw;
      }

      .wizard-content {
        padding: 16px 0;
      }

      .wizard-step-info {
        margin-bottom: 16px;
      }

      .wizard-step-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .wizard-step-description {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .binding-devices {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .binding-device-card {
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        text-align: center;
        min-width: 120px;
      }

      .binding-device-card.source {
        border: 2px solid var(--primary-color);
      }

      .binding-device-card.target {
        border: 2px solid var(--success-color, #4caf50);
      }

      .binding-device-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .binding-device-endpoint {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .binding-arrow-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .binding-cluster-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .binding-arrow-large {
        font-size: 24px;
        color: var(--primary-color);
      }

      .binding-explanation {
        padding: 12px;
        background: var(--info-color-light, rgba(33, 150, 243, 0.1));
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .binding-explanation-content {
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }

      .wizard-progress-note {
        text-align: center;
        padding: 12px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .wizard-result {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        margin-top: 16px;
      }

      .wizard-result.success {
        background: var(--success-color-light, rgba(76, 175, 80, 0.1));
        color: var(--success-color, #4caf50);
      }

      .wizard-result.error {
        background: var(--error-color-light, rgba(244, 67, 54, 0.1));
        color: var(--error-color, #f44336);
      }

      .wizard-result-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .wizard-result-message {
        font-size: 13px;
        line-height: 1.4;
      }

      .wizard-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .verify-prompt {
        text-align: center;
        padding: 24px;
        color: var(--secondary-text-color);
      }

      .verify-success-message {
        text-align: center;
        margin-top: 16px;
        color: var(--success-color, #4caf50);
        font-weight: 500;
      }
    `,
  ];

  /** Whether the wizard is open/visible */
  @property({ type: Boolean })
  open = false;

  /** Current wizard state */
  @property({ attribute: false })
  wizardState: BindingWizardState | null = null;

  render() {
    if (!this.open || !this.wizardState) {
      return nothing;
    }

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${this._handleDialogClick}>
          <div class="dialog-header">Create Binding</div>

          ${this._renderStepIndicator()}

          <div class="wizard-content">
            ${this._renderStepContent()}
          </div>

          ${this._renderActions()}
        </div>
      </div>
    `;
  }

  private _renderStepIndicator() {
    const wizard = this.wizardState!;
    const currentStepIndex = STEPS.indexOf(wizard.currentStep);

    return html`
      <div class="wizard-steps">
        ${STEPS.map((step, idx) => {
          const isCompleted = this._isStepCompleted(step, idx, currentStepIndex);
          const isActive = idx === currentStepIndex;

          return html`
            ${idx > 0
              ? html`<div class="wizard-connector ${idx <= currentStepIndex ? "completed" : ""}"></div>`
              : nothing}
            <div class="wizard-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}">
              <div class="wizard-step-circle">
                ${isCompleted ? "✓" : idx + 1}
              </div>
              <div class="wizard-step-label">
                ${this._getStepLabel(step)}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _isStepCompleted(step: BindingWizardStep, stepIndex: number, currentIndex: number): boolean {
    const wizard = this.wizardState!;

    // Steps before current are completed if we're past them
    if (stepIndex < currentIndex) {
      return true;
    }

    // Current step is completed if it has a successful result
    if (stepIndex === currentIndex) {
      switch (step) {
        case "binding":
          return wizard.bindingResult?.success === true;
        case "acl":
          return wizard.aclResult?.success === true;
        case "verify":
          return wizard.verifyResult?.success === true;
      }
    }

    return false;
  }

  private _getStepLabel(step: BindingWizardStep): string {
    switch (step) {
      case "binding":
        return "Create";
      case "acl":
        return "Permissions";
      case "verify":
        return "Verify";
    }
  }

  private _renderStepContent() {
    const wizard = this.wizardState!;

    switch (wizard.currentStep) {
      case "binding":
        return this._renderBindingStep();
      case "acl":
        return this._renderACLStep();
      case "verify":
        return this._renderVerifyStep();
    }
  }

  private _renderBindingStep() {
    const wizard = this.wizardState!;
    const clusterDesc = getClusterBindingDescription(wizard.clusterId);

    return html`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 1: Create Binding</div>
        <div class="wizard-step-description">
          Write the binding to <strong>${wizard.sourceNode.name}</strong>
        </div>
      </div>

      <div class="binding-devices">
        <div class="binding-device-card source">
          <div class="binding-device-name">${wizard.sourceNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${wizard.sourceEndpoint.endpoint_id}</div>
        </div>
        <div class="binding-arrow-container">
          <span class="binding-cluster-label">${getClusterName(wizard.clusterId)}</span>
          <span class="binding-arrow-large">→</span>
        </div>
        <div class="binding-device-card target">
          <div class="binding-device-name">${wizard.targetNode.name}</div>
          <div class="binding-device-endpoint">Endpoint ${wizard.targetEndpoint.endpoint_id}</div>
        </div>
      </div>

      <div class="binding-explanation">
        <div class="binding-explanation-content">
          <strong>${wizard.sourceNode.name}</strong> will ${clusterDesc.action}
          <strong>${wizard.targetNode.name}</strong> using ${clusterDesc.dataType}.
        </div>
      </div>

      ${wizard.bindingInProgress
        ? html`
            <div class="wizard-progress-note">
              Communicating with Matter device... This may take a few seconds.
            </div>
          `
        : nothing}

      ${wizard.bindingResult
        ? html`
            <div class="wizard-result ${wizard.bindingResult.success ? "success" : "error"}">
              <span class="wizard-result-icon">${wizard.bindingResult.success ? "✓" : "✗"}</span>
              <span class="wizard-result-message">${wizard.bindingResult.message}</span>
            </div>
          `
        : nothing}
    `;
  }

  private _renderACLStep() {
    const wizard = this.wizardState!;
    const recommendedPrivilege = getRecommendedPrivilege(wizard.clusterId);

    return html`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 2: Set Permissions</div>
        <div class="wizard-step-description">
          Allow <strong>${wizard.sourceNode.name}</strong> to control
          <strong>${wizard.targetNode.name}</strong>
        </div>
      </div>

      <div class="privilege-selector">
        ${PRIVILEGE_OPTIONS.map(
          (option) => html`
            <div
              class="privilege-option ${wizard.selectedPrivilege === option.value ? "selected" : ""}"
              @click=${() => this._handlePrivilegeChange(option.value)}
            >
              <div class="privilege-radio"></div>
              <div class="privilege-content">
                <div class="privilege-label">
                  ${option.label}
                  ${option.value === recommendedPrivilege
                    ? html`<span class="privilege-badge recommended">Recommended</span>`
                    : nothing}
                </div>
                <div class="privilege-description">${option.description}</div>
              </div>
            </div>
          `
        )}
      </div>

      ${wizard.aclInProgress
        ? html`
            <div class="wizard-progress-note">
              Provisioning ACL on ${wizard.targetNode.name}... This may take a few seconds.
            </div>
          `
        : nothing}

      ${wizard.aclResult
        ? html`
            <div class="wizard-result ${wizard.aclResult.success ? "success" : "error"}">
              <span class="wizard-result-icon">${wizard.aclResult.success ? "✓" : "✗"}</span>
              <span class="wizard-result-message">${wizard.aclResult.message}</span>
            </div>
          `
        : nothing}
    `;
  }

  private _renderVerifyStep() {
    const wizard = this.wizardState!;

    return html`
      <div class="wizard-step-info">
        <div class="wizard-step-title">Step 3: Verify Binding</div>
        <div class="wizard-step-description">
          Read the binding back from the device to confirm it was saved correctly
        </div>
      </div>

      ${wizard.verifyInProgress
        ? html`
            <div class="wizard-progress-note">
              Reading bindings from ${wizard.sourceNode.name}... This may take a few seconds.
            </div>
          `
        : nothing}

      ${wizard.verifyResult
        ? html`
            <div class="wizard-result ${wizard.verifyResult.verified ? "success" : wizard.verifyResult.success ? "success" : "error"}">
              <span class="wizard-result-icon">
                ${wizard.verifyResult.verified ? "✓" : wizard.verifyResult.success ? "⚠" : "✗"}
              </span>
              <span class="wizard-result-message">${wizard.verifyResult.message}</span>
            </div>

            ${wizard.verifyResult.verified
              ? html`
                  <div class="verify-success-message">
                    Binding created and verified successfully!
                  </div>
                `
              : nothing}
          `
        : html`
            <div class="verify-prompt">
              Click "Verify Binding" to confirm the binding was saved to the device.
            </div>
          `}
    `;
  }

  private _renderActions() {
    const wizard = this.wizardState!;
    const isAnyLoading =
      wizard.bindingInProgress || wizard.aclInProgress || wizard.verifyInProgress;

    const closeButtonText =
      wizard.currentStep === "verify" && wizard.verifyResult ? "Done" : "Cancel";

    return html`
      <div class="wizard-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleClose}
          ?disabled=${isAnyLoading}
        >
          ${closeButtonText}
        </button>

        ${this._renderStepActions(wizard, isAnyLoading)}
      </div>
    `;
  }

  private _renderStepActions(wizard: BindingWizardState, isAnyLoading: boolean) {
    switch (wizard.currentStep) {
      case "binding":
        return html`
          <button
            type="button"
            class="btn btn-primary ${wizard.bindingInProgress ? "btn-loading" : ""}"
            @click=${this._handleExecuteBinding}
            ?disabled=${isAnyLoading}
          >
            Create Binding
          </button>
        `;

      case "acl":
        return html`
          ${wizard.bindingResult?.success
            ? html`
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click=${() => this._handleStepChange("verify")}
                  ?disabled=${isAnyLoading}
                >
                  Skip
                </button>
              `
            : nothing}
          <button
            type="button"
            class="btn btn-primary ${wizard.aclInProgress ? "btn-loading" : ""}"
            @click=${this._handleExecuteACL}
            ?disabled=${isAnyLoading}
          >
            Set Permissions
          </button>
        `;

      case "verify":
        if (!wizard.verifyResult) {
          return html`
            <button
              type="button"
              class="btn btn-primary ${wizard.verifyInProgress ? "btn-loading" : ""}"
              @click=${this._handleExecuteVerify}
              ?disabled=${isAnyLoading}
            >
              Verify Binding
            </button>
          `;
        }
        return nothing;
    }
  }

  private _handleOverlayClick() {
    this._handleClose();
  }

  private _handleDialogClick(e: Event) {
    e.stopPropagation();
  }

  private _handleClose() {
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleExecuteBinding() {
    this.dispatchEvent(
      new CustomEvent("execute-binding", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleExecuteACL() {
    this.dispatchEvent(
      new CustomEvent("execute-acl", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleExecuteVerify() {
    this.dispatchEvent(
      new CustomEvent("execute-verify", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handlePrivilegeChange(privilege: number) {
    this.dispatchEvent(
      new CustomEvent("privilege-change", {
        detail: { privilege },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleStepChange(step: BindingWizardStep) {
    this.dispatchEvent(
      new CustomEvent("step-change", {
        detail: { step },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-binding-wizard": BindingWizard;
  }
}

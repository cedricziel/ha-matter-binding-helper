/**
 * Dialog and modal styles for Matter Binding Helper
 *
 * Styles for dialogs, modals, confirmation prompts, and wizards.
 */

import { css } from "lit";

/**
 * Base dialog overlay and container styles
 */
export const dialogBaseStyles = css`
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

  .dialog {
    background: var(--card-background-color);
    border-radius: 12px;
    padding: 24px;
    min-width: 400px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .dialog-header {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 24px;
    color: var(--primary-text-color);
  }

  .dialog-subheader {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
  }

  .dialog-content {
    margin-bottom: 24px;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .dialog-warning {
    background: var(--warning-color, #ff9800);
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .dialog-info {
    background: var(--secondary-background-color);
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--primary-text-color);
  }
`;

/**
 * Confirmation dialog specific styles
 */
export const confirmDialogStyles = css`
  .confirm-dialog {
    max-width: 480px;
  }

  .confirm-dialog .dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .confirm-icon {
    font-size: 24px;
  }

  .confirm-icon.warning {
    color: var(--warning-color, #ff9800);
  }

  .confirm-icon.danger {
    color: var(--error-color, #f44336);
  }

  .confirm-icon.info {
    color: var(--primary-color);
  }

  .confirm-message {
    font-size: 14px;
    line-height: 1.5;
    color: var(--primary-text-color);
    margin-bottom: 16px;
  }

  .confirm-details {
    background: var(--secondary-background-color);
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .confirm-details dt {
    color: var(--secondary-text-color);
    font-size: 12px;
    margin-bottom: 4px;
  }

  .confirm-details dd {
    margin: 0 0 12px 0;
    color: var(--primary-text-color);
  }

  .confirm-details dd:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Verification modal styles
 */
export const verificationModalStyles = css`
  .verification-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    gap: 16px;
  }

  .verification-modal-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .verification-modal-result.verified {
    background: rgba(76, 175, 80, 0.15);
    border: 1px solid var(--success-color, #4caf50);
  }

  .verification-modal-result.warning {
    background: rgba(255, 152, 0, 0.15);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .verification-modal-result.error {
    background: rgba(244, 67, 54, 0.15);
    border: 1px solid var(--error-color, #f44336);
  }

  .verification-status-icon {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .verification-modal-result.verified .verification-status-icon {
    color: var(--success-color, #4caf50);
  }

  .verification-modal-result.warning .verification-status-icon {
    color: var(--warning-color, #ff9800);
  }

  .verification-modal-result.error .verification-status-icon {
    color: var(--error-color, #f44336);
  }

  .verification-status-text {
    font-size: 18px;
    font-weight: 500;
  }

  .verification-details {
    padding: 16px;
  }

  .verification-message {
    font-size: 14px;
    margin: 0 0 16px 0;
    color: var(--primary-text-color);
  }

  .verification-binding-info {
    background: var(--secondary-background-color);
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .verification-help {
    background: rgba(255, 152, 0, 0.1);
    border-left: 3px solid var(--warning-color, #ff9800);
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    font-size: 13px;
  }

  .verification-help ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }

  .verification-help li {
    margin-bottom: 4px;
  }
`;

/**
 * Wizard styles (multi-step dialogs)
 */
export const wizardStyles = css`
  .wizard-dialog {
    min-width: 500px;
    max-width: 600px;
  }

  .wizard-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    padding: 16px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .wizard-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 100px;
  }

  .wizard-step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 14px;
    border: 2px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    transition: all 0.3s;
  }

  .wizard-step.active .wizard-step-indicator {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
  }

  .wizard-step.completed .wizard-step-indicator {
    border-color: var(--success-color, #4caf50);
    background: var(--success-color, #4caf50);
    color: white;
  }

  .wizard-step.error .wizard-step-indicator {
    border-color: var(--error-color, #f44336);
    background: var(--error-color, #f44336);
    color: white;
  }

  .wizard-step-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-align: center;
  }

  .wizard-step.active .wizard-step-label {
    color: var(--primary-color);
    font-weight: 500;
  }

  .wizard-step.completed .wizard-step-label {
    color: var(--success-color, #4caf50);
  }

  .wizard-connector {
    flex: 1;
    height: 2px;
    background: var(--divider-color);
    margin: 0 8px;
    max-width: 60px;
  }

  .wizard-connector.completed {
    background: var(--success-color, #4caf50);
  }

  .wizard-content {
    min-height: 200px;
    padding: 16px 0;
  }

  .wizard-step-content {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/**
 * Privilege selector styles (used in ACL dialogs)
 */
export const privilegeSelectorStyles = css`
  .privilege-selector {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .privilege-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .privilege-option:hover {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.05);
  }

  .privilege-option.selected {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.1);
  }

  .privilege-radio {
    margin-top: 2px;
  }

  .privilege-content {
    flex: 1;
  }

  .privilege-name {
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }

  .privilege-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }

  .privilege-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    margin-left: 8px;
  }

  .privilege-badge.recommended {
    background: var(--success-color, #4caf50);
    color: white;
  }
`;

/**
 * Operation progress modal styles
 */
export const operationProgressStyles = css`
  .operation-progress-dialog {
    min-width: 360px;
    text-align: center;
  }

  .operation-progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 16px;
  }

  .operation-progress-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .operation-progress-message {
    font-size: 16px;
    color: var(--primary-text-color);
  }

  .operation-progress-detail {
    font-size: 13px;
    color: var(--secondary-text-color);
  }
`;

/**
 * All dialog styles combined
 */
export const dialogStyles = [
  dialogBaseStyles,
  confirmDialogStyles,
  verificationModalStyles,
  wizardStyles,
  privilegeSelectorStyles,
  operationProgressStyles,
];

/**
 * Miscellaneous styles for Matter Binding Helper
 *
 * Styles for Eve schedules, automation recommendations, filter controls,
 * toggle switches, bulk repair, verification results, and loading states.
 */

import { css } from "lit";

/**
 * Eve schedule styles (proprietary Eve thermostat schedules)
 */
export const eveScheduleStyles = css`
  .eve-schedule {
    margin-top: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
    border-left: 3px solid var(--primary-color);
  }

  .eve-schedule-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .eve-schedule-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .eve-schedule-name {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .eve-schedule-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 6px;
    margin-bottom: 10px;
  }

  .eve-day-slot {
    background: var(--card-background-color);
    border-radius: 4px;
    padding: 6px 8px;
    text-align: center;
    font-size: 11px;
  }

  .eve-day-name {
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 2px;
  }

  .eve-day-profile {
    color: var(--secondary-text-color);
    font-size: 10px;
  }

  .eve-time-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .eve-time-slot {
    background: var(--card-background-color);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .eve-time {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .eve-profile {
    color: var(--primary-color);
    font-weight: 500;
  }

  .eve-schedule-loading {
    font-size: 12px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`;

/**
 * Automation recommendation styles
 */
export const automationStyles = css`
  .automation-card {
    border-left: 3px solid var(--warning-color, #ff9800);
  }

  .automation-intro {
    padding: 12px 16px;
    font-size: 13px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    border-bottom: 1px solid var(--divider-color);
  }

  .overview-binding-row.automation {
    background: rgba(255, 152, 0, 0.05);
  }

  .automation-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .automation-icon {
    font-size: 18px;
  }

  .automation-suggestion {
    font-size: 14px;
    color: var(--primary-color);
    font-weight: 500;
    margin-bottom: 6px;
  }

  .automation-why {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .why-label {
    font-weight: 500;
    color: var(--warning-color, #ff9800);
  }
`;

/**
 * Filter controls and toggle switch styles
 */
export const filterControlStyles = css`
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .filter-controls label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }

  .filter-info {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .toggle-switch {
    position: relative;
    width: 40px;
    height: 22px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--disabled-color, #ccc);
    transition: 0.3s;
    border-radius: 22px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: var(--primary-color);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(18px);
  }
`;

/**
 * Button loading state styles
 */
export const buttonLoadingStyles = css`
  .btn-loading {
    position: relative;
    color: transparent !important;
  }

  .btn-loading::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    top: 50%;
    left: 50%;
    margin-left: -7px;
    margin-top: -7px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-icon.btn-loading::after,
  .delete-btn.btn-loading::after {
    border-color: rgba(244, 67, 54, 0.3);
    border-top-color: var(--error-color, #f44336);
  }
`;

/**
 * Bulk repair modal styles
 */
export const bulkRepairStyles = css`
  .bulk-repair-results {
    max-height: 300px;
    overflow-y: auto;
  }

  .bulk-repair-summary {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .bulk-repair-stat {
    text-align: center;
  }

  .bulk-repair-stat-value {
    font-size: 24px;
    font-weight: 600;
  }

  .bulk-repair-stat-label {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .bulk-repair-stat.success .bulk-repair-stat-value {
    color: var(--success-color, #4caf50);
  }

  .bulk-repair-stat.failed .bulk-repair-stat-value {
    color: var(--error-color, #f44336);
  }

  .bulk-repair-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid var(--divider-color);
  }

  .bulk-repair-item:last-child {
    border-bottom: none;
  }

  .bulk-repair-item-icon {
    font-size: 16px;
  }

  .bulk-repair-item-icon.success {
    color: var(--success-color, #4caf50);
  }

  .bulk-repair-item-icon.failed {
    color: var(--error-color, #f44336);
  }
`;

/**
 * Verification result inline styles
 */
export const verificationResultStyles = css`
  .verification-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .verification-result.verified {
    background: rgba(76, 175, 80, 0.15);
    border: 1px solid var(--success-color, #4caf50);
    color: var(--success-color, #4caf50);
  }

  .verification-result.warning {
    background: rgba(255, 152, 0, 0.15);
    border: 1px solid var(--warning-color, #ff9800);
    color: var(--warning-color, #ff9800);
  }

  .verification-result.error {
    background: rgba(244, 67, 54, 0.15);
    border: 1px solid var(--error-color, #f44336);
    color: var(--error-color, #f44336);
  }

  .verification-icon {
    font-size: 16px;
    font-weight: bold;
  }

  .verification-message {
    flex: 1;
  }

  .verification-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 0 4px;
    opacity: 0.7;
    color: inherit;
  }

  .verification-dismiss:hover {
    opacity: 1;
  }
`;

/**
 * Operation step progress styles (blocking progress dialog)
 */
export const operationStepStyles = css`
  .dialog-overlay.blocking {
    pointer-events: auto;
  }

  .operation-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
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
    background: rgba(var(--rgb-primary-color), 0.1);
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
`;

/**
 * Repair button and icon styles
 */
export const repairStyles = css`
  .btn-repair {
    background: rgba(255, 152, 0, 0.15);
    color: var(--warning-color, #ff9800);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .btn-repair:hover:not(:disabled) {
    background: rgba(255, 152, 0, 0.25);
  }

  .repair-icon {
    cursor: pointer;
    color: var(--warning-color, #ff9800);
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .repair-icon:hover {
    background: rgba(255, 152, 0, 0.15);
  }

  .repair-icon.loading {
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

/**
 * All miscellaneous styles combined
 */
export const miscStyles = [
  eveScheduleStyles,
  automationStyles,
  filterControlStyles,
  buttonLoadingStyles,
  bulkRepairStyles,
  verificationResultStyles,
  operationStepStyles,
  repairStyles,
];

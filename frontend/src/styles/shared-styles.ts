/**
 * Shared CSS styles for Matter Binding Helper components
 *
 * Contains common layout, button, and utility styles used across components.
 */

import { css } from "lit";

/**
 * Common button styles
 */
export const buttonStyles = css`
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--divider-color);
  }

  .btn-danger {
    background: var(--error-color, #f44336);
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-warning {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .btn-warning:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-icon {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon.delete {
    color: var(--error-color, #f44336);
  }

  .btn-icon.delete:hover:not(:disabled) {
    background: rgba(244, 67, 54, 0.1);
  }

  .btn-icon.verify {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color, #4caf50);
    border: 1px solid var(--success-color, #4caf50);
  }

  .btn-icon.verify:hover:not(:disabled) {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .btn-icon.repair {
    background: rgba(255, 152, 0, 0.1);
    color: var(--warning-color, #ff9800);
    border: 1px solid var(--warning-color, #ff9800);
  }

  .btn-icon.repair:hover:not(:disabled) {
    background: var(--warning-color, #ff9800);
    color: white;
  }
`;

/**
 * Loading and error state styles
 */
export const stateStyles = css`
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: var(--secondary-text-color);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--divider-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    background: rgba(244, 67, 54, 0.1);
    color: var(--error-color, #f44336);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .warning {
    background: rgba(255, 152, 0, 0.1);
    color: var(--warning-color, #ff9800);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .success {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color, #4caf50);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 48px;
    color: var(--secondary-text-color);
  }

  .empty-state-small {
    font-size: 13px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`;

/**
 * Form element styles
 */
export const formStyles = css`
  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--secondary-text-color);
  }

  .form-select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
    font-family: inherit;
  }

  .form-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

/**
 * Badge/tag styles
 */
export const badgeStyles = css`
  .badge {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .badge-primary {
    background: var(--primary-color);
    color: white;
  }

  .badge-success {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .badge-warning {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .badge-error {
    background: var(--error-color, #f44336);
    color: white;
  }

  .badge-secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .count-badge {
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: normal;
  }

  .cluster-badge {
    background: var(--primary-color);
    color: white;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 8px;
    font-weight: 500;
    cursor: help;
    white-space: nowrap;
  }

  .cluster-badge:hover {
    filter: brightness(1.15);
  }

  .device-type-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
`;

/**
 * Layout utility styles
 */
export const layoutStyles = css`
  .flex {
    display: flex;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .gap-4 {
    gap: 4px;
  }

  .gap-8 {
    gap: 8px;
  }

  .gap-12 {
    gap: 12px;
  }

  .gap-16 {
    gap: 16px;
  }

  .gap-24 {
    gap: 24px;
  }
`;

/**
 * All shared styles combined
 */
export const sharedStyles = [
  buttonStyles,
  stateStyles,
  formStyles,
  badgeStyles,
  layoutStyles,
];

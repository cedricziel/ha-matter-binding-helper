/**
 * Card component styles for Matter Binding Helper
 *
 * Styles for binding cards, ACL entries, and similar card-based components.
 */

import { css } from "lit";

/**
 * Base card styles
 */
export const baseCardStyles = css`
  .card {
    background: var(--card-background-color);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.1));
  }

  .card-header {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    color: var(--primary-text-color);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 12px;
  }

  .section-header .btn {
    margin-left: auto;
  }

  .section-context {
    font-size: 12px;
    font-weight: normal;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    padding: 2px 8px;
    border-radius: 4px;
  }
`;

/**
 * Binding card styles
 */
export const bindingCardStyles = css`
  .binding-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .binding-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--secondary-background-color);
    border-radius: 8px;
  }

  .binding-card.binding-missing-acl {
    border-left: 3px solid var(--warning-color, #ff9800);
    background: rgba(255, 152, 0, 0.05);
    flex-wrap: wrap;
  }

  .binding-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .binding-arrow {
    color: var(--primary-color);
    font-size: 20px;
  }

  .binding-source,
  .binding-target {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .binding-source-name,
  .binding-target-name {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .binding-source-endpoint,
  .binding-target-endpoint {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-cluster {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-actions {
    display: flex;
    gap: 4px;
  }

  /* ACL warning styles */
  .acl-warning {
    cursor: help;
    font-size: 14px;
    margin-right: 4px;
  }

  .acl-warning-text {
    color: var(--warning-color, #ff9800);
    font-size: 11px;
  }

  .acl-warning-banner {
    background: rgba(255, 152, 0, 0.12);
    color: var(--warning-color, #ff9800);
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 8px;
    width: 100%;
  }
`;

/**
 * ACL entry styles
 */
export const aclEntryStyles = css`
  .acl-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .acl-entry {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 6px;
    font-size: 13px;
  }

  .acl-privilege {
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    text-transform: uppercase;
  }

  .acl-privilege.view {
    background: rgba(158, 158, 158, 0.2);
    color: var(--secondary-text-color);
  }

  .acl-privilege.operate {
    background: rgba(76, 175, 80, 0.2);
    color: var(--success-color, #4caf50);
  }

  .acl-privilege.manage {
    background: rgba(33, 150, 243, 0.2);
    color: #2196f3;
  }

  .acl-privilege.administer {
    background: rgba(156, 39, 176, 0.2);
    color: #9c27b0;
  }

  .acl-subjects {
    color: var(--primary-text-color);
  }

  .acl-targets {
    color: var(--secondary-text-color);
    font-size: 12px;
  }

  .acl-auth-mode {
    margin-left: auto;
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.7;
  }
`;

/**
 * Overview card styles (for the overview tab)
 */
export const overviewCardStyles = css`
  .overview-card {
    background: var(--card-background-color);
    border-radius: 8px;
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .overview-card .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 0;
  }

  .overview-card .card-content {
    padding: 16px;
  }

  .overview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .overview-row:hover {
    background: var(--secondary-background-color);
  }

  .overview-row + .overview-row {
    border-top: 1px solid var(--divider-color);
  }

  .binding-sentence {
    font-size: 14px;
    color: var(--primary-text-color);
  }

  .binding-sentence strong {
    color: var(--primary-color);
  }

  .cluster-badges {
    display: inline-flex;
    gap: 6px;
    margin-left: 8px;
    vertical-align: middle;
  }
`;

/**
 * All card styles combined
 */
export const cardStyles = [
  baseCardStyles,
  bindingCardStyles,
  aclEntryStyles,
  overviewCardStyles,
];

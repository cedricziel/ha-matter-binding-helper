/**
 * Binding visualization styles for Matter Binding Helper
 *
 * Styles for binding device cards, arrows, and explanations used in confirm dialogs.
 */

import { css } from "lit";

/**
 * Binding devices visualization (source/target cards with arrow)
 */
export const bindingDevicesStyles = css`
  .binding-devices {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 20px 0;
  }

  .binding-device-card {
    flex: 1;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .binding-device-card.source {
    border-color: var(--primary-color);
  }

  .binding-device-card.target {
    border-color: var(--success-color, #4caf50);
  }

  .binding-device-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .binding-device-endpoint {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .binding-device-area {
    font-size: 11px;
    color: var(--secondary-text-color);
    font-style: italic;
    margin-top: 4px;
  }

  .binding-arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .binding-arrow-large {
    font-size: 24px;
    color: var(--primary-color);
  }

  .binding-cluster-label {
    font-size: 11px;
    background: var(--primary-color);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
  }
`;

/**
 * Binding explanation box styles
 */
export const bindingExplanationStyles = css`
  .binding-explanation {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
  }

  .binding-explanation-header {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
  }

  .binding-explanation-content {
    font-size: 16px;
    line-height: 1.6;
  }

  .binding-explanation-content strong {
    color: var(--primary-color);
  }
`;

/**
 * Cluster selection dropdown styles
 */
export const clusterSelectStyles = css`
  .cluster-select-group {
    margin-top: 16px;
  }

  .cluster-select-group label {
    display: block;
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }
`;

/**
 * Overview binding row styles
 */
export const overviewBindingRowStyles = css`
  .overview-binding-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  .overview-binding-row:last-child {
    border-bottom: none;
  }

  .overview-binding-row.recommendation {
    background: var(--secondary-background-color);
  }

  .overview-binding-row.readable {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
  }

  .binding-description {
    flex: 1;
    min-width: 0;
  }

  .binding-sentence {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 4px;
  }

  .binding-sentence strong {
    color: var(--primary-text-color);
  }

  .binding-action {
    color: var(--secondary-text-color);
    margin: 0 4px;
  }

  .binding-meta {
    font-size: 12px;
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .overview-binding-row.recommendation .binding-action {
    color: var(--primary-color);
  }

  .binding-source,
  .binding-target {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 180px;
    flex: 1;
  }

  .binding-source > div:first-child,
  .binding-target > div:first-child {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .binding-source .node-name,
  .binding-target .node-name {
    font-weight: 500;
  }

  .endpoint-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .area-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .binding-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .binding-arrow {
    color: var(--primary-color);
    font-size: 18px;
    flex-shrink: 0;
  }

  .binding-cluster-badge {
    background: var(--primary-color);
    color: white;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .compatible-clusters {
    font-size: 11px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color);
    padding: 4px 8px;
    border-radius: 4px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-target {
    font-style: italic;
    color: var(--secondary-text-color);
  }
`;

/**
 * All binding visualization styles combined
 */
export const bindingVizStyles = [
  bindingDevicesStyles,
  bindingExplanationStyles,
  clusterSelectStyles,
  overviewBindingRowStyles,
];

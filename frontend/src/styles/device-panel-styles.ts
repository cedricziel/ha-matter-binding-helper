/**
 * Device panel styles for Matter Binding Helper
 *
 * Styles for device details, node info, entity list, and registry info.
 */

import { css } from "lit";

/**
 * Device details container styles
 */
export const deviceDetailsStyles = css`
  .device-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .device-header {
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 16px;
  }

  .device-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .device-title h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .device-ha-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 16px;
    opacity: 0.7;
  }

  .device-ha-link:hover {
    opacity: 1;
  }

  .device-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .device-type-tag {
    background: var(--primary-color);
    color: white;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 500;
  }

  .device-area-tag {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 12px;
  }

  .device-version {
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .device-section {
    background: var(--secondary-background-color);
    border-radius: 8px;
    padding: 16px;
  }

  .device-link {
    cursor: pointer;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
  }

  .device-link:hover {
    color: var(--primary-color);
    text-decoration-style: solid;
  }
`;

/**
 * Node list and item styles
 */
export const nodeListStyles = css`
  .node-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .node-item {
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .node-item:hover {
    background: var(--secondary-background-color);
  }

  .node-item.selected {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .node-item.selected .node-name,
  .node-item.selected .node-device-type,
  .node-item.selected .node-area,
  .node-item.selected .node-vendor,
  .node-item.selected .node-endpoints,
  .node-item.selected .node-meta-sep,
  .node-item.selected .node-version {
    color: var(--text-primary-color);
    opacity: 1;
  }

  .node-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 2px;
  }

  .node-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-id {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.7;
    font-weight: normal;
    margin-left: 6px;
  }

  .node-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .node-meta-sep {
    color: var(--secondary-text-color);
    opacity: 0.5;
  }

  .node-vendor {
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .node-device-type {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  .node-area {
    color: var(--primary-color);
    opacity: 0.9;
  }

  .node-endpoints {
    color: var(--secondary-text-color);
    opacity: 0.7;
  }

  .node-endpoints.has-binding {
    color: var(--success-color, #4caf50);
    opacity: 1;
  }

  .node-details {
    margin-left: 32px;
    margin-top: 8px;
  }

  .node-version {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.6;
    margin-left: auto;
  }

  .node-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color, #4caf50);
  }

  .node-status.unavailable {
    background: var(--error-color, #f44336);
  }

  .no-endpoints {
    font-size: 13px;
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }
`;

/**
 * Endpoint list and item styles (for main panel)
 */
export const endpointListStyles = css`
  .endpoint-list {
    margin-left: 32px;
    margin-top: 8px;
  }

  .endpoint-item {
    padding: 10px 12px;
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid var(--divider-color);
    margin-bottom: 8px;
  }

  .endpoint-item:hover {
    background: var(--secondary-background-color);
    border-color: var(--primary-color);
  }

  .endpoint-item.selected {
    background: var(--primary-color);
    color: var(--text-primary-color);
    border-color: var(--primary-color);
  }

  .endpoint-item.no-binding {
    opacity: 0.6;
    cursor: not-allowed;
    border-style: dashed;
  }

  .endpoint-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .endpoint-id {
    font-weight: 500;
  }

  .endpoint-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .endpoint-badge.binding {
    background: var(--success-color, #4caf50);
    color: white;
  }

  .endpoint-badge.proprietary {
    background: var(--warning-color, #ff9800);
    color: white;
  }

  .cluster-proprietary {
    color: var(--warning-color, #ff9800);
    font-weight: 500;
  }

  .endpoint-device-types {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-bottom: 2px;
  }

  .endpoint-item.selected .endpoint-device-types {
    color: var(--text-primary-color);
    opacity: 0.9;
  }

  .endpoint-clusters {
    font-size: 11px;
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .endpoint-item.selected .endpoint-clusters {
    color: var(--text-primary-color);
    opacity: 0.8;
  }

  .cluster-role {
    font-weight: 500;
    opacity: 0.7;
    margin-right: 4px;
  }

  .cluster-name {
    cursor: help;
  }

  .cluster-cmd-count {
    font-size: 10px;
    opacity: 0.7;
    margin-left: 2px;
  }
`;

/**
 * Entity list and chip styles
 */
export const entityListStyles = css`
  .entity-list {
    margin-top: 12px;
    padding: 12px;
    background: var(--secondary-background-color);
    border-radius: 6px;
  }

  .entity-list-header {
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  .entity-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .entity-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 12px;
    font-size: 11px;
    font-family: inherit;
    color: var(--primary-text-color);
    cursor: pointer;
    transition: all 0.2s;
  }

  .entity-chip:hover {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .entity-chip .domain-icon {
    font-size: 12px;
  }

  .entity-chip.disabled {
    opacity: 0.5;
    text-decoration: line-through;
  }
`;

/**
 * Device registry info styles
 */
export const registryInfoStyles = css`
  .registry-info {
    background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.05), transparent);
    border-left: 3px solid var(--primary-color);
    padding-left: 12px;
  }

  .registry-badge {
    background: var(--primary-color);
    color: var(--text-primary-color);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
    margin-left: 8px;
  }

  .registry-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .registry-model {
    font-size: 14px;
  }

  .registry-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }

  .registry-features {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .feature-label {
    font-size: 11px;
    color: var(--secondary-text-color);
  }

  .feature-tag {
    font-size: 10px;
    padding: 2px 6px;
    background: var(--warning-color, #ff9800);
    color: white;
    border-radius: 4px;
    font-weight: 500;
  }

  .registry-link {
    font-size: 12px;
    color: var(--primary-color);
    text-decoration: none;
  }

  .registry-link:hover {
    text-decoration: underline;
  }
`;

/**
 * All device panel styles combined
 */
export const devicePanelStyles = [
  deviceDetailsStyles,
  nodeListStyles,
  endpointListStyles,
  entityListStyles,
  registryInfoStyles,
];

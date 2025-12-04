/**
 * Matter Binding Helper Panel
 * Main panel component for managing Matter bindings
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  MatterNode,
  MatterEndpoint,
  Binding,
  BindingWithContext,
  BindingRecommendation,
  MatterGroup,
  AutomationRecommendation,
  EveSchedule,
} from "./types";
import { CLUSTER_NAMES, CLUSTER_ON_OFF, getClusterName, getDeviceTypeName, getClusterBindingDescription, AUTOMATION_TEMPLATES, EVE_CLUSTER_ID, isProprietaryCluster, getClusterInfo, hasThermostatSchedule } from "./types";
import { findMatchingDevice, type DeviceDefinition } from "./device-registry";
import "./thermostat-schedule-editor";
import { computeBindingRecommendations } from "./recommendation-logic";
import { filterValidTargetEndpoints, getFirstValidTargetEndpoint, countCompatibleClusters, filterControlClusters } from "./binding-ui-logic";
import * as api from "./api";

@customElement("matter-binding-helper-panel")
export class MatterBindingPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public narrow = false;

  @state() private _nodes: MatterNode[] = [];
  @state() private _selectedSourceNode: MatterNode | null = null;
  @state() private _selectedSourceEndpoint: MatterEndpoint | null = null;
  @state() private _bindings: Binding[] = [];
  @state() private _groups: MatterGroup[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _activeTab: "overview" | "bindings" | "groups" = "overview";
  @state() private _showCreateDialog = false;
  @state() private _allBindings: BindingWithContext[] = [];
  @state() private _recommendations: BindingRecommendation[] = [];
  @state() private _overviewLoading = false;
  @state() private _surveySubmitting = false;
  @state() private _surveyResult: { success: boolean; message: string } | null = null;
  @state() private _selectedTargetNodeId: number | null = null;
  @state() private _selectedTargetEndpointId: number | null = null;
  @state() private _filterSameAreaOnly = true;
  @state() private _actionInProgress: string | null = null;
  @state() private _pendingBindingRecommendation: BindingRecommendation | null = null;
  @state() private _selectedClusterForBinding: number | null = null;
  @state() private _pendingManualBinding: { sourceNode: MatterNode; sourceEndpoint: MatterEndpoint; targetNode: MatterNode; targetEndpoint: MatterEndpoint; clusterId: number } | null = null;
  @state() private _pendingDeleteBinding: BindingWithContext | null = null;
  @state() private _automationRecommendations: AutomationRecommendation[] = [];
  @state() private _eveSchedules: Map<number, EveSchedule> = new Map();
  @state() private _eveScheduleLoading: Set<number> = new Set();

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      background: var(--primary-background-color);
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
      color: var(--primary-text-color);
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      padding: 12px 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      color: var(--secondary-text-color);
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .content {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
    }

    .narrow .content {
      grid-template-columns: 1fr;
    }

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

    .node-meta-sep {
      color: var(--secondary-text-color);
      opacity: 0.5;
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

    /* Device Registry Info */
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

    .node-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
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

    .no-endpoints {
      font-size: 13px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
    }

    .bindings-panel {
      min-height: 400px;
    }

    .device-panel {
      min-height: 400px;
    }

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

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 12px;
    }

    .section-context {
      font-size: 12px;
      font-weight: normal;
      color: var(--secondary-text-color);
      background: var(--card-background-color);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .section-header .btn {
      margin-left: auto;
    }

    .empty-state-small {
      font-size: 13px;
      color: var(--secondary-text-color);
      font-style: italic;
      padding: 8px 0;
    }

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

    .binding-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .binding-arrow {
      color: var(--primary-color);
      font-size: 20px;
    }

    .binding-target {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .binding-target-name {
      font-weight: 500;
    }

    .binding-cluster {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .delete-btn {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
    }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--secondary-text-color);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    .error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color, #f44336);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    /* Dialog styles */
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
    }

    .dialog-header {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 24px;
    }

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
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .dialog-warning {
      background: var(--warning-color, #ff9800);
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .no-clusters-warning {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.4;
    }

    .form-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Overview Tab Styles */
    .overview-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

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
    }

    .count-badge {
      background: var(--primary-color);
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: normal;
    }

    .cluster-badges {
      display: inline-flex;
      gap: 6px;
      margin-left: 8px;
      vertical-align: middle;
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
      margin-left: 8px;
      vertical-align: middle;
    }

    .dialog-subheader {
      padding: 0 16px 12px 16px;
      color: var(--secondary-text-color);
      font-size: 14px;
      border-bottom: 1px solid var(--divider-color);
      margin-bottom: 16px;
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .binding-list {
      padding: 8px 0;
    }

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

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      color: var(--secondary-text-color);
    }

    .btn-icon:hover {
      background: var(--secondary-background-color);
    }

    .btn-icon.delete {
      color: var(--error-color, #f44336);
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }

    .group-target {
      font-style: italic;
      color: var(--secondary-text-color);
    }

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

    .confirm-dialog {
      max-width: 500px;
    }

    .confirm-dialog .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .confirm-icon {
      font-size: 24px;
    }

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

    .cluster-select-group {
      margin-top: 16px;
    }

    .cluster-select-group label {
      display: block;
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    /* Readable binding rows */
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

    /* Automation recommendations */
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

    .btn-secondary {
      text-decoration: none;
      display: inline-block;
    }

    /* Eve Schedule Styles */
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

  protected firstUpdated(): void {
    this._loadNodes().then(() => {
      // Load overview data after nodes are loaded
      if (this._activeTab === "overview") {
        this._loadOverviewData();
      }
    });
  }

  private async _loadNodes(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const response = await api.listNodes(this.hass);
      this._nodes = response.nodes;
    } catch (err) {
      this._error = `Failed to load nodes: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private async _loadBindings(): Promise<void> {
    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) {
      return;
    }
    this._loading = true;
    try {
      const response = await api.listBindings(
        this.hass,
        this._selectedSourceNode.node_id,
        this._selectedSourceEndpoint.endpoint_id
      );
      this._bindings = response.bindings;
    } catch (err) {
      this._error = `Failed to load bindings: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private async _loadGroups(): Promise<void> {
    this._loading = true;
    try {
      const response = await api.listGroups(this.hass);
      this._groups = response.groups;
    } catch (err) {
      this._error = `Failed to load groups: ${err}`;
    } finally {
      this._loading = false;
    }
  }

  private _isEveDevice(node: MatterNode): boolean {
    // Check if any endpoint has the Eve cluster
    return node.endpoints.some((ep) =>
      ep.server_clusters.includes(EVE_CLUSTER_ID)
    );
  }

  private async _loadEveSchedule(node: MatterNode): Promise<void> {
    if (this._eveSchedules.has(node.node_id) || this._eveScheduleLoading.has(node.node_id)) {
      return;
    }

    // Find the thermostat endpoint (usually endpoint 1)
    const thermostatEndpoint = node.endpoints.find((ep) =>
      ep.server_clusters.includes(EVE_CLUSTER_ID) && ep.endpoint_id > 0
    );

    if (!thermostatEndpoint) return;

    this._eveScheduleLoading = new Set([...this._eveScheduleLoading, node.node_id]);

    try {
      const response = await api.getEveSchedule(
        this.hass,
        node.node_id,
        thermostatEndpoint.endpoint_id
      );

      if (response.schedule) {
        this._eveSchedules = new Map(this._eveSchedules).set(node.node_id, response.schedule);
      }
    } catch (err) {
      console.error(`Failed to load Eve schedule for node ${node.node_id}:`, err);
    } finally {
      const newLoading = new Set(this._eveScheduleLoading);
      newLoading.delete(node.node_id);
      this._eveScheduleLoading = newLoading;
    }
  }

  private _renderEveSchedule(node: MatterNode) {
    // Only show for Eve devices
    if (!this._isEveDevice(node)) {
      return nothing;
    }

    // Show loading state
    if (this._eveScheduleLoading.has(node.node_id)) {
      return html`
        <div class="device-section">
          <div class="section-header">Heating Schedule</div>
          <div class="eve-schedule-loading">Loading Eve schedule...</div>
        </div>
      `;
    }

    const schedule = this._eveSchedules.get(node.node_id);
    if (!schedule) {
      return nothing;
    }

    // Group time slots by profile
    const profileNames: Record<string, string> = {
      '"': 'Comfort',
      '$': 'Eco',
      '%': 'Boost',
      '&': 'Off',
      '*': 'Custom',
    };

    return html`
      <div class="device-section">
        <div class="section-header">
          Heating Schedule
          ${schedule.name
            ? html`<span class="section-context">${schedule.name}</span>`
            : nothing}
        </div>

        ${schedule.day_assignments.length > 0
          ? html`
              <div class="eve-schedule-grid">
                ${schedule.day_assignments.map(
                  (day) => html`
                    <div class="eve-day-slot">
                      <div class="eve-day-name">${day.day.slice(0, 3)}</div>
                      <div class="eve-day-profile">${profileNames[day.profile_id] || day.profile_id}</div>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}

        ${schedule.time_slots.length > 0
          ? html`
              <div class="eve-time-slots">
                ${schedule.time_slots.map(
                  (slot) => html`
                    <div class="eve-time-slot">
                      <span class="eve-time">${slot.time}</span>
                      <span class="eve-profile">${profileNames[slot.profile_id] || slot.profile_id}</span>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  /**
   * Render the standard Matter thermostat schedule editor.
   * Shows for thermostats that support the weekly schedule feature.
   */
  private _renderThermostatSchedule(node: MatterNode) {
    // Skip Eve devices - they use their proprietary schedule format
    if (this._isEveDevice(node)) {
      return nothing;
    }

    // Find the first thermostat endpoint with schedule support
    const thermostatEndpoint = node.endpoints.find(
      (ep) => hasThermostatSchedule(ep)
    );

    if (!thermostatEndpoint) {
      return nothing;
    }

    return html`
      <thermostat-schedule-editor
        .hass=${this.hass}
        .node=${node}
        .endpoint=${thermostatEndpoint}
      ></thermostat-schedule-editor>
    `;
  }

  private async _loadOverviewData(): Promise<void> {
    this._overviewLoading = true;
    this._error = null;

    try {
      // Load all bindings from all endpoints with binding clusters
      const allBindings: BindingWithContext[] = [];

      for (const node of this._nodes) {
        for (const endpoint of node.endpoints) {
          if (endpoint.has_binding_cluster) {
            try {
              const response = await api.listBindings(
                this.hass,
                node.node_id,
                endpoint.endpoint_id
              );

              for (const binding of response.bindings) {
                // Find target node and endpoint
                const targetNode = binding.target_node_id
                  ? this._nodes.find((n) => n.node_id === binding.target_node_id) || null
                  : null;
                const targetEndpoint = targetNode && binding.target_endpoint_id
                  ? targetNode.endpoints.find((ep) => ep.endpoint_id === binding.target_endpoint_id) || null
                  : null;

                allBindings.push({
                  binding,
                  sourceNode: node,
                  sourceEndpoint: endpoint,
                  targetNode,
                  targetEndpoint,
                });
              }
            } catch {
              // Skip endpoints that fail to load bindings
            }
          }
        }
      }

      this._allBindings = allBindings;

      // Compute recommendations
      this._recommendations = this._computeRecommendations();

      // Compute automation recommendations
      this._automationRecommendations = this._computeAutomationRecommendations();
    } catch (err) {
      this._error = `Failed to load overview data: ${err}`;
    } finally {
      this._overviewLoading = false;
    }
  }

  private _computeAutomationRecommendations(): AutomationRecommendation[] {
    const recommendations: AutomationRecommendation[] = [];
    const seen = new Set<string>();

    for (const sourceNode of this._nodes) {
      for (const sourceEndpoint of sourceNode.endpoints) {
        const sourceDeviceTypes = sourceEndpoint.device_types.map((dt) => dt.id);

        for (const targetNode of this._nodes) {
          // Only consider same-area devices for automation recommendations
          if (sourceNode.area_name && targetNode.area_name &&
              sourceNode.area_name !== targetNode.area_name) {
            continue;
          }

          for (const targetEndpoint of targetNode.endpoints) {
            // Skip same device
            if (sourceNode.node_id === targetNode.node_id) continue;

            const targetDeviceTypes = targetEndpoint.device_types.map((dt) => dt.id);

            // Check each automation template
            for (const template of AUTOMATION_TEMPLATES) {
              const sourceMatch = template.sourceDeviceTypes.some((dt) =>
                sourceDeviceTypes.includes(dt)
              );
              const targetMatch = template.targetDeviceTypes.some((dt) =>
                targetDeviceTypes.includes(dt)
              );

              if (sourceMatch && targetMatch) {
                // Create a unique key to avoid duplicates
                const key = `${template.id}-${sourceNode.node_id}-${targetNode.node_id}`;
                if (seen.has(key)) continue;
                seen.add(key);

                recommendations.push({
                  template,
                  sourceNode,
                  sourceEndpoint,
                  targetNode,
                  targetEndpoint,
                });
              }
            }
          }
        }
      }
    }

    return recommendations;
  }

  private _computeRecommendations(): BindingRecommendation[] {
    return computeBindingRecommendations(this._nodes, this._allBindings);
  }

  private _selectNode(node: MatterNode): void {
    if (this._selectedSourceNode?.node_id === node.node_id) {
      this._selectedSourceNode = null;
      this._selectedSourceEndpoint = null;
      this._bindings = [];
    } else {
      this._selectedSourceNode = node;
      this._selectedSourceEndpoint = null;
      this._bindings = [];

      // Load Eve schedule if this is an Eve device
      if (this._isEveDevice(node)) {
        this._loadEveSchedule(node);
      }
    }
  }

  private _selectEndpoint(e: Event, endpoint: MatterEndpoint): void {
    e.stopPropagation(); // Prevent node toggle
    if (!endpoint.has_binding_cluster) return;
    this._selectedSourceEndpoint = endpoint;
    this._loadBindings();
  }

  private async _deleteBinding(binding: Binding): Promise<void> {
    if (!confirm("Are you sure you want to delete this binding?")) return;

    const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    this._actionInProgress = actionKey;

    try {
      await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );
      await this._loadBindings();
    } catch (err) {
      this._error = `Failed to delete binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private _openCreateDialog(): void {
    // Set default target node (first node that isn't the source and has compatible endpoints)
    const availableTargets = this._nodes.filter(
      (n) => n.node_id !== this._selectedSourceNode?.node_id
    );
    if (availableTargets.length > 0) {
      this._selectedTargetNodeId = availableTargets[0].node_id;
      // Set default endpoint (first valid endpoint)
      const targetNode = availableTargets[0];
      const firstValidEndpoint = getFirstValidTargetEndpoint(targetNode);
      this._selectedTargetEndpointId = firstValidEndpoint?.endpoint_id ?? null;
    }
    this._showCreateDialog = true;
  }

  private _closeCreateDialog(): void {
    this._showCreateDialog = false;
    this._selectedTargetNodeId = null;
    this._selectedTargetEndpointId = null;
  }

  private _handleTargetNodeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._selectedTargetNodeId = parseInt(select.value, 10);
    // Reset endpoint selection when node changes
    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    if (targetNode) {
      const firstValidEndpoint = getFirstValidTargetEndpoint(targetNode);
      this._selectedTargetEndpointId = firstValidEndpoint?.endpoint_id ?? null;
    }
  }

  private _handleTargetEndpointChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._selectedTargetEndpointId = parseInt(select.value, 10);
  }

  private _getCompatibleClusters(): number[] {
    if (!this._selectedSourceEndpoint || !this._selectedTargetNodeId || !this._selectedTargetEndpointId) {
      return [];
    }

    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    const targetEndpoint = targetNode?.endpoints.find(
      (ep) => ep.endpoint_id === this._selectedTargetEndpointId
    );

    if (!targetEndpoint) return [];

    // Source must have cluster as CLIENT (can send commands)
    const sourceClientClusters = this._selectedSourceEndpoint.client_clusters || [];
    // Target must have cluster as SERVER (can receive commands)
    const targetServerClusters = targetEndpoint.server_clusters || [];

    // Return intersection - clusters where source is client AND target is server
    return sourceClientClusters.filter((c) => targetServerClusters.includes(c));
  }

  private _handleReviewBinding(e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const targetNodeId = parseInt(formData.get("targetNode") as string, 10);
    const targetEndpointId = parseInt(formData.get("targetEndpoint") as string, 10);
    const clusterId = parseInt(formData.get("cluster") as string, 10);

    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) return;

    // Validate cluster compatibility
    const sourceClientClusters = this._selectedSourceEndpoint.client_clusters || [];
    const targetNode = this._nodes.find((n) => n.node_id === targetNodeId);
    const targetEndpoint = targetNode?.endpoints.find((ep) => ep.endpoint_id === targetEndpointId);
    const targetServerClusters = targetEndpoint?.server_clusters || [];

    if (!sourceClientClusters.includes(clusterId)) {
      this._error = `Source endpoint does not have cluster ${getClusterName(clusterId)} as a client cluster`;
      return;
    }

    if (!targetServerClusters.includes(clusterId)) {
      this._error = `Target endpoint does not have cluster ${getClusterName(clusterId)} as a server cluster`;
      return;
    }

    if (!targetNode || !targetEndpoint) {
      this._error = "Invalid target selection";
      return;
    }

    // Set pending manual binding for confirmation dialog
    this._pendingManualBinding = {
      sourceNode: this._selectedSourceNode,
      sourceEndpoint: this._selectedSourceEndpoint,
      targetNode,
      targetEndpoint,
      clusterId,
    };

    // Close create dialog
    this._showCreateDialog = false;
  }

  private async _confirmManualBinding(): Promise<void> {
    if (!this._pendingManualBinding) return;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId } = this._pendingManualBinding;
    const actionKey = `create-${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${targetNode.node_id}-${targetEndpoint.endpoint_id}-${clusterId}`;

    this._actionInProgress = actionKey;

    try {
      await api.createBinding(
        this.hass,
        sourceNode.node_id,
        sourceEndpoint.endpoint_id,
        clusterId,
        targetNode.node_id,
        targetEndpoint.endpoint_id
      );
      this._pendingManualBinding = null;
      await this._loadBindings();
    } catch (err) {
      this._error = `Failed to create binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private _closeManualBindingConfirmDialog(): void {
    this._pendingManualBinding = null;
  }

  private _getNodeName(nodeId: number): string {
    const node = this._nodes.find((n) => n.node_id === nodeId);
    return node?.name || `Node ${nodeId}`;
  }

  private _getNodeDeviceId(nodeId: number): string | null | undefined {
    const node = this._nodes.find((n) => n.node_id === nodeId);
    return node?.ha_device_id;
  }

  private _getClusterName(clusterId: number): string {
    return CLUSTER_NAMES[clusterId] || `Cluster 0x${clusterId.toString(16)}`;
  }

  private async _submitSurvey(): Promise<void> {
    this._surveySubmitting = true;
    try {
      await this.hass.callService("matter_binding_helper", "submit_survey", {});
      this._surveyResult = {
        success: true,
        message: "Survey submitted successfully! Thank you for contributing to Matter device research.",
      };
    } catch (err) {
      this._surveyResult = {
        success: false,
        message: `Failed to submit survey: ${err}`,
      };
    } finally {
      this._surveySubmitting = false;
    }
  }

  private _closeSurveyResultDialog(): void {
    this._surveyResult = null;
  }

  private _renderSurveyResultDialog() {
    if (!this._surveyResult) return nothing;

    const { success, message } = this._surveyResult;

    return html`
      <div class="dialog-overlay" @click=${this._closeSurveyResultDialog}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${success ? "✓" : "✗"}</span>
            ${success ? "Survey Submitted" : "Survey Failed"}
          </div>
          <p style="margin: 16px 0; color: var(--primary-text-color);">${message}</p>
          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeSurveyResultDialog}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    return html`
      <div class="${this.narrow ? "narrow" : ""}">
        <div class="header">
          <h1>Matter Binding Helper</h1>
          <div style="display: flex; gap: 8px;">
            <button
              class="btn btn-secondary"
              @click=${this._submitSurvey}
              ?disabled=${this._surveySubmitting}
              title="Submit anonymized device data to Matter Survey"
            >
              ${this._surveySubmitting ? "Submitting..." : "Submit Survey"}
            </button>
            <button
              class="btn btn-primary"
              @click=${this._loadNodes}
              ?disabled=${this._loading}
            >
              Refresh
            </button>
          </div>
        </div>

        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

        <div class="tabs">
          <button
            class="tab ${this._activeTab === "overview" ? "active" : ""}"
            @click=${() => {
              this._activeTab = "overview";
              this._loadOverviewData();
            }}
          >
            Overview
          </button>
          <button
            class="tab ${this._activeTab === "bindings" ? "active" : ""}"
            @click=${() => (this._activeTab = "bindings")}
          >
            Devices
          </button>
          <button
            class="tab ${this._activeTab === "groups" ? "active" : ""}"
            @click=${() => {
              this._activeTab = "groups";
              this._loadGroups();
            }}
          >
            Groups
          </button>
        </div>

        ${this._activeTab === "overview"
          ? this._renderOverviewTab()
          : this._activeTab === "bindings"
            ? this._renderBindingsTab()
            : this._renderGroupsTab()}
        ${this._showCreateDialog ? this._renderCreateDialog() : nothing}
        ${this._pendingBindingRecommendation ? this._renderBindingConfirmDialog() : nothing}
        ${this._pendingManualBinding ? this._renderManualBindingConfirmDialog() : nothing}
        ${this._pendingDeleteBinding ? this._renderDeleteConfirmDialog() : nothing}
        ${this._renderSurveyResultDialog()}
      </div>
    `;
  }

  private _renderOverviewTab() {
    return html`
      <div class="overview-content">
        ${this._overviewLoading
          ? html`<div class="loading">Loading bindings...</div>`
          : html`
              ${this._renderEstablishedBindings()}
              ${this._renderRecommendedBindings()}
              ${this._renderRecommendedAutomations()}
            `}
      </div>
    `;
  }

  private _renderEstablishedBindings() {
    return html`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
        </div>
        ${this._allBindings.length === 0
          ? html`<div class="empty-state">No bindings configured yet.</div>`
          : html`
              <div class="binding-list">
                ${this._allBindings.map((b) => this._renderEstablishedBindingRow(b))}
              </div>
            `}
      </div>
    `;
  }

  private _renderEstablishedBindingRow(bindingCtx: BindingWithContext) {
    const { binding, sourceNode, sourceEndpoint, targetNode } = bindingCtx;
    const targetName = targetNode?.name || `Node ${binding.target_node_id}`;
    const isGroupBinding = binding.target_group_id !== null;
    const clusterDesc = getClusterBindingDescription(binding.cluster_id);

    return html`
      <div class="overview-binding-row readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._navigateToDevice(sourceNode.ha_device_id)
                : nothing}
            >${sourceNode.name}</strong>
            <span class="binding-action">${clusterDesc.action}</span>
            <strong
              class="${!isGroupBinding && targetNode?.ha_device_id ? "device-link" : ""}"
              @click=${!isGroupBinding && targetNode?.ha_device_id
                ? () => this._navigateToDevice(targetNode.ha_device_id)
                : nothing}
            >${isGroupBinding ? `Group ${binding.target_group_id}` : targetName}</strong>
          </div>
          <div class="binding-meta">
            EP ${sourceEndpoint.endpoint_id} → ${isGroupBinding ? `Group` : `EP ${binding.target_endpoint_id}`}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
          </div>
        </div>
        <button
          class="btn-icon delete"
          title="Delete binding"
          ?disabled=${this._actionInProgress !== null}
          @click=${() => this._showDeleteConfirmDialog(bindingCtx)}
        >
          ✕
        </button>
      </div>
    `;
  }

  private _renderRecommendedBindings() {
    // Filter recommendations based on toggle
    const filteredRecommendations = this._filterSameAreaOnly
      ? this._recommendations.filter((r) => {
          const sourceArea = r.sourceNode.area_name;
          const targetArea = r.targetNode.area_name;
          // Both must have an area and they must match
          return sourceArea && targetArea && sourceArea === targetArea;
        })
      : this._recommendations;

    return html`
      <div class="card overview-card">
        <div class="card-header">
          Recommended Bindings
          <span class="count-badge">${filteredRecommendations.length}</span>
        </div>
        <div class="filter-controls">
          <label>
            <span class="toggle-switch">
              <input
                type="checkbox"
                ?checked=${this._filterSameAreaOnly}
                @change=${this._toggleAreaFilter}
              />
              <span class="toggle-slider"></span>
            </span>
            Same area only
          </label>
          ${this._filterSameAreaOnly && filteredRecommendations.length !== this._recommendations.length
            ? html`<span class="filter-info">(${this._recommendations.length - filteredRecommendations.length} hidden)</span>`
            : nothing}
        </div>
        ${filteredRecommendations.length === 0
          ? html`<div class="empty-state">
              ${this._filterSameAreaOnly && this._recommendations.length > 0
                ? "No same-area recommendations. Toggle filter to see cross-area bindings."
                : "No binding recommendations. All compatible endpoints are already bound."}
            </div>`
          : html`
              <div class="binding-list">
                ${filteredRecommendations.map((r) => this._renderRecommendationRow(r))}
              </div>
            `}
      </div>
    `;
  }

  private _renderRecommendedAutomations() {
    if (this._automationRecommendations.length === 0) {
      return nothing;
    }

    return html`
      <div class="card overview-card automation-card">
        <div class="card-header">
          <span>💡 Recommended Automations</span>
          <span class="count-badge">${this._automationRecommendations.length}</span>
        </div>
        <div class="automation-intro">
          These device combinations can't use Matter bindings directly, but Home Assistant automations can achieve the same result.
        </div>
        <div class="binding-list">
          ${this._automationRecommendations.map((r) => this._renderAutomationRow(r))}
        </div>
      </div>
    `;
  }

  private _renderAutomationRow(recommendation: AutomationRecommendation) {
    const { template, sourceNode, targetNode } = recommendation;

    return html`
      <div class="overview-binding-row automation readable">
        <div class="binding-description">
          <div class="automation-title">
            <span class="automation-icon">${template.icon}</span>
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._navigateToDevice(sourceNode.ha_device_id)
                : nothing}
            >${sourceNode.name}</strong> + <strong
              class="${targetNode.ha_device_id ? "device-link" : ""}"
              @click=${targetNode.ha_device_id
                ? () => this._navigateToDevice(targetNode.ha_device_id)
                : nothing}
            >${targetNode.name}</strong>
          </div>
          <div class="automation-suggestion">${template.title}</div>
          <div class="automation-why">
            <span class="why-label">Why not a binding?</span> ${template.why}
          </div>
          ${sourceNode.area_name ? html`<div class="binding-meta">${sourceNode.area_name}</div>` : nothing}
        </div>
        <a
          class="btn btn-small btn-secondary"
          href="/config/automation/new"
          target="_blank"
          title="Create this automation in Home Assistant"
        >
          Create in HA →
        </a>
      </div>
    `;
  }

  private _toggleAreaFilter(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._filterSameAreaOnly = input.checked;
  }

  private _renderRecommendationRow(recommendation: BindingRecommendation) {
    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, compatibleClusters } = recommendation;

    // Build action description from compatible clusters
    const actions = compatibleClusters.map((c) => {
      const desc = getClusterBindingDescription(c);
      return desc.action.replace(/^(control |read |receive |trigger |manage )/, '');
    });
    // Deduplicate and join
    const uniqueActions = [...new Set(actions)];
    const actionText = uniqueActions.length > 2
      ? `${uniqueActions.slice(0, 2).join(', ')}...`
      : uniqueActions.join(', ');

    return html`
      <div class="overview-binding-row recommendation readable">
        <div class="binding-description">
          <div class="binding-sentence">
            <strong
              class="${sourceNode.ha_device_id ? "device-link" : ""}"
              @click=${sourceNode.ha_device_id
                ? () => this._navigateToDevice(sourceNode.ha_device_id)
                : nothing}
            >${sourceNode.name}</strong>
            <span class="binding-action">can ${compatibleClusters.length === 1 ? getClusterBindingDescription(compatibleClusters[0]).action : `access ${actionText} from`}</span>
            <strong
              class="${targetNode.ha_device_id ? "device-link" : ""}"
              @click=${targetNode.ha_device_id
                ? () => this._navigateToDevice(targetNode.ha_device_id)
                : nothing}
            >${targetNode.name}</strong>
            <span class="cluster-badges">
              ${compatibleClusters.map((clusterId) => {
                const clusterName = getClusterName(clusterId);
                const clusterDesc = getClusterBindingDescription(clusterId);
                const tooltip = `${clusterName}: ${clusterDesc.dataType}`;
                return html`<span class="cluster-badge" title="${tooltip}">${clusterName}</span>`;
              })}
            </span>
          </div>
          <div class="binding-meta">
            EP ${sourceEndpoint.endpoint_id} → EP ${targetEndpoint.endpoint_id}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
          </div>
        </div>
        <button
          class="btn btn-small btn-primary"
          ?disabled=${this._actionInProgress !== null}
          @click=${() => this._showBindingConfirmDialog(recommendation)}
        >
          Create
        </button>
      </div>
    `;
  }

  private _showDeleteConfirmDialog(bindingCtx: BindingWithContext): void {
    this._pendingDeleteBinding = bindingCtx;
  }

  private _closeDeleteConfirmDialog(): void {
    this._pendingDeleteBinding = null;
  }

  private async _confirmDeleteBinding(): Promise<void> {
    if (!this._pendingDeleteBinding) return;

    const { binding } = this._pendingDeleteBinding;
    const actionKey = `delete-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;

    this._actionInProgress = actionKey;

    try {
      await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );
      this._closeDeleteConfirmDialog();
      // Reload overview data
      await this._loadOverviewData();
    } catch (err) {
      this._error = `Failed to delete binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private _showBindingConfirmDialog(recommendation: BindingRecommendation): void {
    this._pendingBindingRecommendation = recommendation;
    // Default to first compatible cluster
    this._selectedClusterForBinding = recommendation.compatibleClusters[0];
  }

  private _closeBindingConfirmDialog(): void {
    this._pendingBindingRecommendation = null;
    this._selectedClusterForBinding = null;
  }

  private _handleClusterSelectChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._selectedClusterForBinding = parseInt(select.value, 10);
  }

  private async _confirmCreateBinding(): Promise<void> {
    if (!this._pendingBindingRecommendation || !this._selectedClusterForBinding) return;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint } = this._pendingBindingRecommendation;
    const clusterId = this._selectedClusterForBinding;
    const actionKey = `create-${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${targetNode.node_id}-${targetEndpoint.endpoint_id}`;

    this._actionInProgress = actionKey;

    try {
      await api.createBinding(
        this.hass,
        sourceNode.node_id,
        sourceEndpoint.endpoint_id,
        clusterId,
        targetNode.node_id,
        targetEndpoint.endpoint_id
      );
      this._closeBindingConfirmDialog();
      // Reload overview data
      await this._loadOverviewData();
    } catch (err) {
      this._error = `Failed to create binding: ${err}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private _renderBindingsTab() {
    return html`
      <div class="content">
        <div class="card">
          <div class="card-header">Matter Devices</div>
          ${this._loading && this._nodes.length === 0
            ? html`<div class="loading">Loading...</div>`
            : html`
                <ul class="node-list">
                  ${this._nodes.map((node) => this._renderNodeItem(node))}
                </ul>
              `}
        </div>

        <div class="card device-panel">
          ${this._selectedSourceNode
            ? this._renderDeviceDetails(this._selectedSourceNode)
            : html`
                <div class="empty-state">
                  Select a device to view details and manage bindings.
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _renderDeviceDetails(node: MatterNode) {
    const deviceInfo = node.device_info;
    const primaryDeviceType = this._getPrimaryDeviceType(node);
    const totalEndpoints = node.endpoints.length;

    return html`
      <div class="device-details">
        <div class="device-header">
          <div class="device-title">
            <h2>${node.name}</h2>
            ${node.ha_device_id
              ? html`<a
                  class="device-ha-link"
                  href="/config/devices/device/${node.ha_device_id}"
                  title="View in Home Assistant"
                >↗</a>`
              : nothing}
          </div>
          <div class="device-meta">
            ${primaryDeviceType
              ? html`<span class="device-type-tag">${primaryDeviceType}</span>`
              : nothing}
            ${node.area_name
              ? html`<span class="device-area-tag">${node.area_name}</span>`
              : nothing}
            ${deviceInfo?.software_version
              ? html`<span class="device-version">v${deviceInfo.software_version}</span>`
              : nothing}
          </div>
        </div>

        <div class="device-section">
          <div class="section-header">Endpoints</div>
          ${totalEndpoints > 0
            ? html`
                <div class="endpoint-list">
                  ${node.endpoints.map((endpoint) =>
                    this._renderEndpointItem(endpoint)
                  )}
                </div>
              `
            : html`<div class="no-endpoints">No endpoints found</div>`}
        </div>

        ${this._renderEntityList(node)}
        ${this._renderDeviceRegistryInfo(node)}
        ${this._renderEveSchedule(node)}
        ${this._renderThermostatSchedule(node)}

        <div class="device-section">
          <div class="section-header">
            Bindings
            ${this._selectedSourceEndpoint
              ? html`
                  <span class="section-context">
                    Endpoint ${this._selectedSourceEndpoint.endpoint_id}
                  </span>
                  <button
                    class="btn btn-small btn-primary"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `
              : nothing}
          </div>
          ${this._selectedSourceEndpoint
            ? this._bindings.length > 0
              ? html`
                  <div class="binding-list">
                    ${this._bindings.map((binding) =>
                      this._renderBindingCard(binding)
                    )}
                  </div>
                `
              : html`
                  <div class="empty-state-small">
                    No bindings configured for this endpoint.
                  </div>
                `
            : html`
                <div class="empty-state-small">
                  Select an endpoint with binding support to manage bindings.
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _getPrimaryDeviceType(node: MatterNode): string | null {
    // Get device type from endpoint 1, or first non-zero endpoint
    const primaryEndpoint = node.endpoints.find((e) => e.endpoint_id === 1)
      || node.endpoints.find((e) => e.endpoint_id > 0);
    if (primaryEndpoint && primaryEndpoint.device_types.length > 0) {
      return getDeviceTypeName(primaryEndpoint.device_types[0].id);
    }
    return null;
  }

  private _renderNodeItem(node: MatterNode) {
    const isSelected = this._selectedSourceNode?.node_id === node.node_id;
    const primaryDeviceType = this._getPrimaryDeviceType(node);

    return html`
      <li>
        <div
          class="node-item ${isSelected ? "selected" : ""}"
          @click=${() => this._selectNode(node)}
        >
          <span
            class="node-status ${node.available ? "" : "unavailable"}"
          ></span>
          <div class="node-info">
            <span class="node-name">${node.name}</span>
            <div class="node-meta">
              ${primaryDeviceType
                ? html`<span class="node-device-type">${primaryDeviceType}</span>`
                : nothing}
              ${primaryDeviceType && node.area_name
                ? html`<span class="node-meta-sep">·</span>`
                : nothing}
              ${node.area_name
                ? html`<span class="node-area">${node.area_name}</span>`
                : nothing}
            </div>
          </div>
        </div>
      </li>
    `;
  }

  private _renderEntityList(node: MatterNode) {
    const entities = node.entities || [];
    if (entities.length === 0) {
      return nothing;
    }

    // Domain icons mapping
    const domainIcons: Record<string, string> = {
      light: "💡",
      switch: "🔌",
      event: "🔘",
      sensor: "📊",
      binary_sensor: "⚡",
      climate: "🌡️",
      cover: "🪟",
      fan: "💨",
      lock: "🔒",
      button: "⏺️",
    };

    return html`
      <div class="device-section">
        <div class="section-header">Home Assistant Entities</div>
        <div class="entity-chips">
          ${entities
            .filter((e) => !e.disabled)
            .map(
              (entity) => html`
                <button
                  class="entity-chip"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._openEntityMoreInfo(entity.entity_id);
                  }}
                >
                  <span class="domain-icon">${domainIcons[entity.domain] || "📦"}</span>
                  <span>${entity.name || entity.entity_id}</span>
                </button>
              `
            )}
        </div>
      </div>
    `;
  }

  private _openEntityMoreInfo(entityId: string) {
    // Fire the hass-more-info event to open the entity dialog
    const event = new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _getMatchingDeviceDefinition(node: MatterNode): DeviceDefinition | undefined {
    const vendorId = node.device_info?.vendor_id;
    if (!vendorId) return undefined;

    // Collect all cluster IDs from all endpoints
    const allClusterIds = new Set<number>();
    const allDeviceTypes = new Set<number>();
    for (const endpoint of node.endpoints) {
      for (const clusterId of endpoint.server_clusters || []) {
        allClusterIds.add(clusterId);
      }
      for (const dt of endpoint.device_types) {
        allDeviceTypes.add(dt.id);
      }
    }

    return findMatchingDevice(vendorId, Array.from(allClusterIds), Array.from(allDeviceTypes));
  }

  private _renderDeviceRegistryInfo(node: MatterNode) {
    const deviceDef = this._getMatchingDeviceDefinition(node);
    if (!deviceDef) {
      return nothing;
    }

    // Check if device has extensions with proprietary data
    const hasExtensions = deviceDef.extends && deviceDef.extends.length > 0;

    return html`
      <div class="device-section registry-info">
        <div class="section-header">
          Device Database
          <span class="registry-badge">Matched</span>
        </div>
        <div class="registry-details">
          <div class="registry-model">
            <strong>${deviceDef.vendor}</strong> ${deviceDef.model}
          </div>
          ${deviceDef.description
            ? html`<div class="registry-description">${deviceDef.description}</div>`
            : nothing}
          ${hasExtensions
            ? html`
                <div class="registry-features">
                  <span class="feature-label">Features:</span>
                  ${deviceDef.extends!.map(
                    (ext) => html`<span class="feature-tag">${ext.name}</span>`
                  )}
                </div>
              `
            : nothing}
          ${deviceDef.productUrl
            ? html`
                <a
                  class="registry-link"
                  href="${deviceDef.productUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  Product Page ↗
                </a>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _navigateToDevice(deviceId: string | null | undefined) {
    if (!deviceId) return;
    // Navigate to HA device page using History API
    history.pushState(null, "", `/config/devices/device/${deviceId}`);
    window.dispatchEvent(new CustomEvent("location-changed"));
  }

  private _renderEndpointItem(endpoint: MatterEndpoint) {
    const isSelected =
      this._selectedSourceEndpoint?.endpoint_id === endpoint.endpoint_id;

    // Get device type names (skip Root Node for endpoint 0)
    const deviceTypes = endpoint.device_types
      .map((dt) => getDeviceTypeName(dt.id))
      .filter((name) => endpoint.endpoint_id !== 0 || !name.includes("Root"));

    // Get interesting clusters (skip infrastructure ones)
    const infraClusters = [29, 30, 31, 40, 42, 48, 49, 50, 51, 52, 53, 56, 60, 62, 63, 70];
    const clusterCommands = endpoint.cluster_commands || {};

    // Filter server clusters and identify proprietary ones
    const serverClusterData = (endpoint.server_clusters || [])
      .filter((c) => !infraClusters.includes(c))
      .map((c) => {
        const cmdInfo = clusterCommands[c];
        return {
          id: c,
          name: getClusterName(c),
          isProprietary: isProprietaryCluster(c),
          commands: cmdInfo?.accepted || [],
          commandNames: cmdInfo?.names || {},
        };
      });

    // Filter client clusters and identify proprietary ones
    const clientClusterData = (endpoint.client_clusters || [])
      .filter((c) => !infraClusters.includes(c))
      .map((c) => {
        const cmdInfo = clusterCommands[c];
        return {
          id: c,
          name: getClusterName(c),
          isProprietary: isProprietaryCluster(c),
          commands: cmdInfo?.accepted || [],
          commandNames: cmdInfo?.names || {},
        };
      });

    // Check if endpoint has any proprietary clusters
    const hasProprietary = serverClusterData.some(c => c.isProprietary) || clientClusterData.some(c => c.isProprietary);

    // Helper to format commands tooltip with names
    const formatCommandsTooltip = (cluster: { id: number; name: string; commands: number[]; commandNames: Record<number, string> }) => {
      const header = `${cluster.name} (0x${cluster.id.toString(16).toUpperCase()})`;
      if (cluster.commands.length === 0) return header;

      const cmdList = cluster.commands
        .map((cmdId) => {
          const cmdName = cluster.commandNames[cmdId];
          return cmdName ? `${cmdName} (${cmdId})` : `${cmdId}`;
        })
        .join("\n  ");

      return `${header}\n\nAccepted commands:\n  ${cmdList}`;
    };

    return html`
      <div
        class="endpoint-item ${isSelected ? "selected" : ""} ${!endpoint.has_binding_cluster
          ? "no-binding"
          : ""}"
        @click=${(e: Event) => this._selectEndpoint(e, endpoint)}
      >
        <div class="endpoint-header">
          <span class="endpoint-id">Endpoint ${endpoint.endpoint_id}</span>
          ${endpoint.has_binding_cluster
            ? html`<span class="endpoint-badge binding">Binding</span>`
            : nothing}
          ${hasProprietary
            ? html`<span class="endpoint-badge proprietary">Proprietary</span>`
            : nothing}
        </div>
        ${deviceTypes.length > 0
          ? html`<div class="endpoint-device-types">${deviceTypes.join(", ")}</div>`
          : nothing}
        ${serverClusterData.length > 0
          ? html`<div class="endpoint-clusters">
              <span class="cluster-role">Server:</span>
              ${serverClusterData.map((c, i) => html`${i > 0 ? " · " : ""}<span
                class="${c.isProprietary ? "cluster-proprietary" : "cluster-name"}"
                title="${formatCommandsTooltip(c)}"
              >${c.name}${c.commands.length > 0 ? html`<span class="cluster-cmd-count">(${c.commands.length})</span>` : nothing}</span>`)}
            </div>`
          : nothing}
        ${clientClusterData.length > 0
          ? html`<div class="endpoint-clusters">
              <span class="cluster-role">Client:</span>
              ${clientClusterData.map((c, i) => html`${i > 0 ? " · " : ""}<span
                class="${c.isProprietary ? "cluster-proprietary" : "cluster-name"}"
                title="${formatCommandsTooltip(c)}"
              >${c.name}${c.commands.length > 0 ? html`<span class="cluster-cmd-count">(${c.commands.length})</span>` : nothing}</span>`)}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderBindingCard(binding: Binding) {
    const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    const isLoading = this._actionInProgress === actionKey;

    return html`
      <div class="binding-card">
        <div class="binding-info">
          <span class="binding-arrow">→</span>
          <div class="binding-target">
            <span class="binding-target-name">
              ${binding.target_group_id !== null
                ? `Group ${binding.target_group_id}`
                : html`<span
                    class="${this._getNodeDeviceId(binding.target_node_id!) ? "device-link" : ""}"
                    @click=${this._getNodeDeviceId(binding.target_node_id!)
                      ? (e: Event) => {
                          e.stopPropagation();
                          this._navigateToDevice(this._getNodeDeviceId(binding.target_node_id!));
                        }
                      : nothing}
                  >${this._getNodeName(binding.target_node_id!)}</span> - Endpoint ${binding.target_endpoint_id}`}
            </span>
            <span class="binding-cluster">
              ${this._getClusterName(binding.cluster_id)}
            </span>
          </div>
        </div>
        <button
          class="delete-btn ${isLoading ? "btn-loading" : ""}"
          ?disabled=${isLoading || this._actionInProgress !== null}
          @click=${() => this._deleteBinding(binding)}
        >
          ${isLoading ? "" : "Delete"}
        </button>
      </div>
    `;
  }

  private _renderGroupsTab() {
    return html`
      <div class="card">
        <div class="card-header">Matter Groups</div>
        ${this._loading
          ? html`<div class="loading">Loading...</div>`
          : this._groups.length > 0
            ? html`
                <div class="binding-list">
                  ${this._groups.map(
                    (group) => html`
                      <div class="binding-card">
                        <div>
                          <strong>${group.name}</strong>
                          <div style="font-size: 12px; color: var(--secondary-text-color);">
                            Group ID: ${group.group_id} |
                            ${group.members.length} member(s)
                          </div>
                        </div>
                      </div>
                    `
                  )}
                </div>
              `
            : html`
                <div class="empty-state">
                  No Matter groups configured. Group management is coming soon.
                </div>
              `}
      </div>
    `;
  }

  private _renderBindingConfirmDialog() {
    if (!this._pendingBindingRecommendation || !this._selectedClusterForBinding) return nothing;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, compatibleClusters } = this._pendingBindingRecommendation;
    const clusterId = this._selectedClusterForBinding;
    const clusterDesc = getClusterBindingDescription(clusterId);
    const isLoading = this._actionInProgress !== null;

    return html`
      <div class="dialog-overlay" @click=${this._closeBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${sourceNode.name}</div>
              <div class="binding-device-endpoint">Endpoint ${sourceEndpoint.endpoint_id}</div>
              ${sourceNode.area_name
                ? html`<div class="binding-device-area">${sourceNode.area_name}</div>`
                : nothing}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${getClusterName(clusterId)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${targetNode.name}</div>
              <div class="binding-device-endpoint">Endpoint ${targetEndpoint.endpoint_id}</div>
              ${targetNode.area_name
                ? html`<div class="binding-device-area">${targetNode.area_name}</div>`
                : nothing}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${sourceNode.name}</strong> will ${clusterDesc.action}
              <strong>${targetNode.name}</strong> using ${clusterDesc.dataType}.
            </div>
          </div>

          ${compatibleClusters.length > 1
            ? html`
                <div class="cluster-select-group">
                  <label>Select cluster to bind:</label>
                  <select
                    class="form-select"
                    @change=${this._handleClusterSelectChange}
                  >
                    ${compatibleClusters.map(
                      (c) => html`
                        <option value=${c} ?selected=${c === clusterId}>
                          ${getClusterName(c)} - ${getClusterBindingDescription(c).dataType}
                        </option>
                      `
                    )}
                  </select>
                </div>
              `
            : nothing}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeBindingConfirmDialog}
              ?disabled=${isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${isLoading ? "btn-loading" : ""}"
              @click=${this._confirmCreateBinding}
              ?disabled=${isLoading}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderManualBindingConfirmDialog() {
    if (!this._pendingManualBinding) return nothing;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId } = this._pendingManualBinding;
    const clusterDesc = getClusterBindingDescription(clusterId);
    const isLoading = this._actionInProgress !== null;

    return html`
      <div class="dialog-overlay" @click=${this._closeManualBindingConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🔗</span>
            Create Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${sourceNode.name}</div>
              <div class="binding-device-endpoint">Endpoint ${sourceEndpoint.endpoint_id}</div>
              ${sourceNode.area_name
                ? html`<div class="binding-device-area">${sourceNode.area_name}</div>`
                : nothing}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${getClusterName(clusterId)}</span>
              <span class="binding-arrow-large">→</span>
            </div>
            <div class="binding-device-card target">
              <div class="binding-device-name">${targetNode.name}</div>
              <div class="binding-device-endpoint">Endpoint ${targetEndpoint.endpoint_id}</div>
              ${targetNode.area_name
                ? html`<div class="binding-device-area">${targetNode.area_name}</div>`
                : nothing}
            </div>
          </div>

          <div class="binding-explanation">
            <div class="binding-explanation-header">What this binding does:</div>
            <div class="binding-explanation-content">
              <strong>${sourceNode.name}</strong> will ${clusterDesc.action}
              <strong>${targetNode.name}</strong> using ${clusterDesc.dataType}.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeManualBindingConfirmDialog}
              ?disabled=${isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${isLoading ? "btn-loading" : ""}"
              @click=${this._confirmManualBinding}
              ?disabled=${isLoading}
            >
              Create Binding
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderDeleteConfirmDialog() {
    if (!this._pendingDeleteBinding) return nothing;

    const { binding, sourceNode, sourceEndpoint, targetNode } = this._pendingDeleteBinding;
    const clusterDesc = getClusterBindingDescription(binding.cluster_id);
    const targetName = targetNode?.name || `Node ${binding.target_node_id}`;
    const isLoading = this._actionInProgress !== null;
    const isGroupBinding = binding.target_group_id !== null;

    return html`
      <div class="dialog-overlay" @click=${this._closeDeleteConfirmDialog}>
        <div class="dialog confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">🗑️</span>
            Remove Binding
          </div>

          <div class="binding-devices">
            <div class="binding-device-card source">
              <div class="binding-device-name">${sourceNode.name}</div>
              <div class="binding-device-endpoint">Endpoint ${sourceEndpoint.endpoint_id}</div>
              ${sourceNode.area_name
                ? html`<div class="binding-device-area">${sourceNode.area_name}</div>`
                : nothing}
            </div>
            <div class="binding-arrow-container">
              <span class="binding-cluster-label">${getClusterName(binding.cluster_id)}</span>
              <span class="binding-arrow-large" style="text-decoration: line-through; color: var(--error-color);">→</span>
            </div>
            <div class="binding-device-card target">
              ${isGroupBinding
                ? html`<div class="binding-device-name">Group ${binding.target_group_id}</div>`
                : html`
                    <div class="binding-device-name">${targetName}</div>
                    <div class="binding-device-endpoint">Endpoint ${binding.target_endpoint_id}</div>
                    ${targetNode?.area_name
                      ? html`<div class="binding-device-area">${targetNode.area_name}</div>`
                      : nothing}
                  `}
            </div>
          </div>

          <div class="binding-explanation" style="border-left: 3px solid var(--error-color);">
            <div class="binding-explanation-header">After removing this binding:</div>
            <div class="binding-explanation-content">
              <strong>${sourceNode.name}</strong> will stop being able to ${clusterDesc.action}
              <strong>${isGroupBinding ? `Group ${binding.target_group_id}` : targetName}</strong>.
            </div>
          </div>

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._closeDeleteConfirmDialog}
              ?disabled=${isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary ${isLoading ? "btn-loading" : ""}"
              style="background: var(--error-color);"
              @click=${this._confirmDeleteBinding}
              ?disabled=${isLoading}
            >
              Remove Binding
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderCreateDialog() {
    const availableTargetNodes = this._nodes.filter(
      (n) => n.node_id !== this._selectedSourceNode?.node_id
    );

    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    // Filter endpoints: exclude root node (0) and those without server clusters
    const targetEndpoints = filterValidTargetEndpoints(targetNode?.endpoints || []);

    // Get compatible clusters based on source client + target server
    const compatibleClusters = this._getCompatibleClusters();

    // Check if source has any client clusters at all
    const sourceClientClusters = this._selectedSourceEndpoint?.client_clusters || [];
    const hasClientClusters = sourceClientClusters.length > 0;

    // Extract source endpoint device type for header
    const sourceDeviceType = this._selectedSourceEndpoint?.device_types[0]
      ? getDeviceTypeName(this._selectedSourceEndpoint.device_types[0].id)
      : null;

    // Extract and filter client clusters (exclude infrastructure clusters)
    const controlClusters = filterControlClusters(sourceClientClusters)
      .map((c) => getClusterName(c));

    return html`
      <div class="dialog-overlay" @click=${this._closeCreateDialog}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            Create Binding from ${this._selectedSourceNode?.name} EP${this._selectedSourceEndpoint?.endpoint_id}
            ${sourceDeviceType ? html`<span class="device-type-badge">${sourceDeviceType}</span>` : nothing}
          </div>

          ${controlClusters.length > 0
            ? html`
                <div class="dialog-subheader">
                  Can control: ${controlClusters.join(', ')}
                </div>
              `
            : nothing}

          ${!hasClientClusters
            ? html`
                <div class="dialog-warning">
                  <strong>Note:</strong> This endpoint can't control other devices (no client clusters).
                  Try selecting a different endpoint.
                </div>
              `
            : nothing}

          ${compatibleClusters.length > 0
            ? html`
                <div style="color: var(--success-color, #4caf50); padding: 8px 0; font-size: 14px;">
                  ✓ ${compatibleClusters.length} compatible cluster${compatibleClusters.length !== 1 ? 's' : ''} found
                </div>
              `
            : nothing}

          <form @submit=${this._handleReviewBinding}>
            <div class="form-group">
              <label class="form-label">Target Node</label>
              <select
                name="targetNode"
                class="form-select"
                required
                @change=${this._handleTargetNodeChange}
              >
                ${availableTargetNodes.map((node) => {
                  // Get primary device type from first non-root endpoint
                  const primaryEndpoint = node.endpoints.find(ep => ep.endpoint_id !== 0);
                  const deviceType = primaryEndpoint?.device_types[0]
                    ? getDeviceTypeName(primaryEndpoint.device_types[0].id)
                    : null;
                  const area = node.area_name;
                  const context = [deviceType, area].filter(Boolean).join(' · ');

                  return html`
                    <option
                      value=${node.node_id}
                      ?selected=${node.node_id === this._selectedTargetNodeId}
                    >
                      ${node.name}${context ? ` (${context})` : ''}
                    </option>
                  `;
                })}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Target Endpoint</label>
              <select
                name="targetEndpoint"
                class="form-select"
                required
                @change=${this._handleTargetEndpointChange}
              >
                ${targetEndpoints.map((ep) => {
                  const deviceTypes = ep.device_types
                    .map((dt) => getDeviceTypeName(dt.id))
                    .join(", ");
                  const compatCount = countCompatibleClusters(sourceClientClusters, ep);

                  return html`
                    <option
                      value=${ep.endpoint_id}
                      ?selected=${ep.endpoint_id === this._selectedTargetEndpointId}
                    >
                      Endpoint ${ep.endpoint_id}${deviceTypes ? ` (${deviceTypes})` : ''} · ${compatCount} compatible cluster${compatCount !== 1 ? 's' : ''}
                    </option>
                  `;
                })}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cluster</label>
              ${compatibleClusters.length > 0
                ? html`
                    <select name="cluster" class="form-select" required>
                      ${compatibleClusters.map((clusterId) => {
                        const clusterName = getClusterName(clusterId);
                        const clusterDesc = getClusterBindingDescription(clusterId);
                        return html`
                          <option value=${clusterId} title="${clusterName}: ${clusterDesc.dataType}">
                            ${clusterName} - ${clusterDesc.dataType}
                          </option>
                        `;
                      })}
                    </select>
                  `
                : html`
                    <div class="no-clusters-warning">
                      No compatible clusters found. These devices can't communicate.
                      Try selecting a different target endpoint.
                    </div>
                    <select name="cluster" class="form-select" disabled>
                      <option>No compatible clusters</option>
                    </select>
                  `}
            </div>

            <div class="dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click=${this._closeCreateDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                ?disabled=${compatibleClusters.length === 0}
              >
                Review Binding
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-binding-helper-panel": MatterBindingPanel;
  }
}

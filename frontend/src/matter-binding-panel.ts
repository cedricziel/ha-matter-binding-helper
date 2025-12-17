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
  ACLEntry,
  OperationErrorType,
  BindingWizardState,
  ProvisionACLForBindingsResponse,
  OperationProgressState,
  OperationStep,
} from "./types";
import { CLUSTER_NAMES, CLUSTER_ON_OFF, getClusterName, getDeviceTypeName, getClusterBindingDescription, AUTOMATION_TEMPLATES, EVE_CLUSTER_ID, isProprietaryCluster, getClusterInfo, hasThermostatSchedule } from "./types";
import { findMatchingDevice, type DeviceDefinition } from "./device-registry";
import "./thermostat-schedule-editor";
import { computeBindingRecommendations } from "./recommendation-logic";
import { filterValidTargetEndpoints, getFirstValidTargetEndpoint, countCompatibleClusters, filterControlClusters } from "./binding-ui-logic";
import { getRecommendedPrivilege, PRIVILEGE_OPTIONS } from "./acl-logic";
import * as api from "./api";

// Import extracted components
import "./components/node-list/node-list";
import "./components/bindings/binding-card";
import "./components/acl/acl-section";
import "./components/dialogs/create-binding-dialog";
import "./components/dialogs/confirm-dialog";
import "./components/wizard/binding-wizard";
import "./components/device-panel/endpoint-selector";
import "./components/overview/recommendation-list";

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
  @state() private _verificationInProgress = false;
  @state() private _lastVerificationResult: { success: boolean; verified: boolean; message: string; error_type?: OperationErrorType } | null = null;
  @state() private _showVerificationModal = false;
  @state() private _verificationModalResult: { success: boolean; verified: boolean; message: string; error_type?: OperationErrorType; bindingContext?: BindingWithContext } | null = null;
  @state() private _aclLoading = false;
  @state() private _aclEntries: ACLEntry[] | null = null;
  @state() private _targetACLCache: Map<number, ACLEntry[]> = new Map();
  @state() private _aclLoadingNodes: Set<number> = new Set();

  // Binding wizard state
  @state() private _bindingWizard: BindingWizardState | null = null;
  @state() private _aclRepairInProgress: Map<string, boolean> = new Map();
  @state() private _bulkRepairInProgress = false;
  @state() private _bulkRepairResult: ProvisionACLForBindingsResponse | null = null;
  @state() private _showBulkRepairModal = false;

  // Operation progress state for blocking dialogs
  @state() private _operationProgress: OperationProgressState | null = null;

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

    .node-id {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.7;
      font-weight: normal;
      margin-left: 6px;
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

    /* ACL warning styles */
    .binding-missing-acl {
      border-left: 3px solid var(--warning-color, #ff9800);
      background: rgba(255, 152, 0, 0.05);
    }

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

    .binding-card.binding-missing-acl {
      flex-wrap: wrap;
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

    /* Verification Result Styles */
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

    /* Verification Modal Styles */
    .verification-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 16px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    /* Binding Actions Container */
    .binding-actions {
      display: flex;
      gap: 4px;
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

    .btn-verify {
      background: rgba(76, 175, 80, 0.15);
      color: var(--success-color, #4caf50);
      border: 1px solid var(--success-color, #4caf50);
      font-weight: 500;
    }

    .btn-verify:hover:not(:disabled) {
      background: var(--success-color, #4caf50);
      color: white;
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

    /* ACL Section Styles */
    .acl-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .acl-entry {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
    }

    .acl-entry.acl-admin {
      border-left: 3px solid var(--error-color, #f44336);
    }

    .acl-entry.acl-operate {
      border-left: 3px solid var(--success-color, #4caf50);
    }

    .acl-entry-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .acl-index {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .acl-privilege {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--divider-color);
    }

    .acl-privilege.administer {
      background: rgba(244, 67, 54, 0.15);
      color: var(--error-color, #f44336);
    }

    .acl-privilege.operate {
      background: rgba(76, 175, 80, 0.15);
      color: var(--success-color, #4caf50);
    }

    .acl-privilege.manage {
      background: rgba(255, 152, 0, 0.15);
      color: var(--warning-color, #ff9800);
    }

    .acl-privilege.view {
      background: rgba(33, 150, 243, 0.15);
      color: var(--info-color, #2196f3);
    }

    .acl-auth-mode {
      font-size: 11px;
      color: var(--secondary-text-color);
    }

    .acl-entry-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .acl-row {
      display: flex;
      gap: 8px;
      font-size: 12px;
    }

    .acl-label {
      color: var(--secondary-text-color);
      min-width: 60px;
    }

    .acl-value {
      color: var(--primary-text-color);
      word-break: break-word;
    }

    /* Binding Wizard Styles */
    .wizard-steps {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
      gap: 0;
    }

    .wizard-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .wizard-step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
      transition: all 0.3s ease;
    }

    .wizard-step.active .wizard-step-circle {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .wizard-step.completed .wizard-step-circle {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .wizard-step-label {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 6px;
      text-align: center;
      max-width: 80px;
    }

    .wizard-step.active .wizard-step-label {
      color: var(--primary-color);
      font-weight: 500;
    }

    .wizard-step.completed .wizard-step-label {
      color: var(--success-color, #4caf50);
    }

    .wizard-connector {
      flex: 0 0 60px;
      height: 2px;
      background: var(--divider-color);
      margin: 0 8px;
      margin-bottom: 22px;
    }

    .wizard-connector.completed {
      background: var(--success-color, #4caf50);
    }

    .wizard-content {
      min-height: 120px;
    }

    .wizard-step-info {
      text-align: center;
      padding: 16px;
    }

    .wizard-step-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .wizard-step-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }

    .wizard-progress-note {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-style: italic;
      margin-top: 8px;
    }

    .wizard-result {
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
    }

    .wizard-result.success {
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--success-color, #4caf50);
    }

    .wizard-result.error {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid var(--error-color, #f44336);
    }

    .wizard-result-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    .wizard-result-message {
      font-size: 13px;
    }

    .wizard-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color);
    }

    /* Privilege Selector */
    .privilege-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
    }

    .privilege-option {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .privilege-option:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.05);
    }

    .privilege-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
    }

    .privilege-radio {
      width: 18px;
      height: 18px;
      border: 2px solid var(--divider-color);
      border-radius: 50%;
      margin-right: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .privilege-option.selected .privilege-radio {
      border-color: var(--primary-color);
    }

    .privilege-option.selected .privilege-radio::after {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary-color);
    }

    .privilege-content {
      flex: 1;
    }

    .privilege-label {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .privilege-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .privilege-badge.recommended {
      background: var(--success-color, #4caf50);
      color: white;
    }

    .privilege-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    /* Repair Buttons */
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
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Bulk Repair Modal */
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

    /* Operation Progress Modal Styles */
    .dialog-overlay.blocking {
      pointer-events: auto;
    }

    .operation-progress-dialog {
      min-width: 400px;
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

  // =============================================================================
  // Operation Progress Helper Methods
  // =============================================================================

  private _updateStepStatus(
    stepIndex: number,
    status: OperationStep["status"],
    message?: string
  ): void {
    if (!this._operationProgress) return;

    const newSteps = [...this._operationProgress.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], status, message };

    this._operationProgress = {
      ...this._operationProgress,
      steps: newSteps,
      currentStepIndex: stepIndex,
    };
  }

  private _closeOperationProgress(): void {
    this._operationProgress = null;
    // Reload data after operation completes
    this._loadOverviewData();
  }

  /**
   * Safely extract error message from API response.
   * Handles cases where message might be an object instead of string.
   */
  private _extractErrorMessage(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }
    if (message && typeof message === "object") {
      // Try common error object shapes
      const obj = message as Record<string, unknown>;
      if (typeof obj.message === "string") return obj.message;
      if (typeof obj.error === "string") return obj.error;
      if (typeof obj.text === "string") return obj.text;
      // Fallback to JSON
      return JSON.stringify(message);
    }
    return String(message);
  }

  private _cancelOperation(): void {
    if (!this._operationProgress) return;

    // Mark remaining pending steps as skipped
    const newSteps = this._operationProgress.steps.map((step) =>
      step.status === "pending" ? { ...step, status: "skipped" as const } : step
    );

    this._operationProgress = {
      ...this._operationProgress,
      steps: newSteps,
      completed: true,
      error: "Operation cancelled by user",
    };
  }

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
      this._error = `Failed to load nodes: ${this._extractErrorMessage(err)}`;
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

      // Load ACLs for target nodes (for permission checking)
      const targetNodeIds = new Set(
        response.bindings
          .filter((b) => b.target_node_id !== null)
          .map((b) => b.target_node_id!)
      );
      // Load ACLs in background - don't block the UI
      Promise.all(
        Array.from(targetNodeIds).map((nodeId) => this._loadACLForNode(nodeId))
      ).catch((err) => console.error("Failed to load some target ACLs:", err));
    } catch (err) {
      this._error = `Failed to load bindings: ${this._extractErrorMessage(err)}`;
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
      this._error = `Failed to load groups: ${this._extractErrorMessage(err)}`;
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

      // Load ACLs for all unique target nodes (for permission checking)
      const targetNodeIds = new Set(
        allBindings
          .filter((b) => b.binding.target_node_id !== null)
          .map((b) => b.binding.target_node_id!)
      );
      // Load ACLs in parallel, don't wait for them to complete
      Promise.all(
        Array.from(targetNodeIds).map((nodeId) => this._loadACLForNode(nodeId))
      ).catch((err) => console.error("Failed to load some target ACLs:", err));

      // Compute recommendations
      this._recommendations = this._computeRecommendations();

      // Compute automation recommendations
      this._automationRecommendations = this._computeAutomationRecommendations();
    } catch (err) {
      this._error = `Failed to load overview data: ${this._extractErrorMessage(err)}`;
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
    // Clear verification result and ACL when switching nodes
    this._lastVerificationResult = null;
    this._aclEntries = null;

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
    // Clear verification result when switching endpoints
    this._lastVerificationResult = null;
    this._selectedSourceEndpoint = endpoint;
    this._loadBindings();
  }

  private async _deleteBinding(binding: Binding): Promise<void> {
    if (!confirm("Are you sure you want to delete this binding?")) return;

    const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
    this._actionInProgress = actionKey;

    try {
      const result = await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );
      this._lastVerificationResult = {
        success: result.success,
        verified: result.verified,
        message: result.message,
        error_type: result.error_type,
      };
      await this._loadBindings();
    } catch (err) {
      this._error = `Failed to delete binding: ${this._extractErrorMessage(err)}`;
    } finally {
      this._actionInProgress = null;
    }
  }

  private async _verifyBindings(): Promise<void> {
    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) return;

    this._verificationInProgress = true;
    this._lastVerificationResult = null;

    try {
      const result = await api.verifyBindings(
        this.hass,
        this._selectedSourceNode.node_id,
        this._selectedSourceEndpoint.endpoint_id
      );
      this._lastVerificationResult = {
        success: result.success,
        verified: result.verified,
        message: result.message,
        error_type: result.error_type,
      };
      // Reload bindings to refresh the list
      await this._loadBindings();
    } catch (err) {
      this._lastVerificationResult = {
        success: false,
        verified: false,
        message: `Failed to verify bindings: ${this._extractErrorMessage(err)}`,
        error_type: "unknown_error",
      };
    } finally {
      this._verificationInProgress = false;
    }
  }

  private async _verifyBindingWithModal(bindingCtx: BindingWithContext): Promise<void> {
    const { binding } = bindingCtx;

    this._verificationInProgress = true;
    this._showVerificationModal = true;
    this._verificationModalResult = null;

    try {
      const result = await api.verifyBindings(
        this.hass,
        binding.node_id,
        binding.endpoint_id
      );
      this._verificationModalResult = {
        success: result.success,
        verified: result.verified,
        message: result.message,
        bindingContext: bindingCtx,
      };
    } catch (err) {
      this._verificationModalResult = {
        success: false,
        verified: false,
        message: `Failed to verify: ${this._extractErrorMessage(err)}`,
        bindingContext: bindingCtx,
      };
    } finally {
      this._verificationInProgress = false;
    }
  }

  private _closeVerificationModal(): void {
    this._showVerificationModal = false;
    this._verificationModalResult = null;
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

  private _handleCreateDialogTargetNodeChange(e: CustomEvent<{ nodeId: number }>) {
    this._selectedTargetNodeId = e.detail.nodeId;
    // Reset endpoint selection when node changes
    const targetNode = this._nodes.find((n) => n.node_id === this._selectedTargetNodeId);
    if (targetNode) {
      const firstValidEndpoint = getFirstValidTargetEndpoint(targetNode);
      this._selectedTargetEndpointId = firstValidEndpoint?.endpoint_id ?? null;
    }
  }

  private _handleCreateDialogTargetEndpointChange(e: CustomEvent<{ endpointId: number }>) {
    this._selectedTargetEndpointId = e.detail.endpointId;
  }

  private _handleCreateDialogCreateBinding(e: CustomEvent<{ targetNodeId: number; targetEndpointId: number; clusterId: number }>) {
    const { targetNodeId, targetEndpointId, clusterId } = e.detail;

    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) return;

    const targetNode = this._nodes.find((n) => n.node_id === targetNodeId);
    const targetEndpoint = targetNode?.endpoints.find((ep) => ep.endpoint_id === targetEndpointId);

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

  private _confirmManualBinding(): void {
    if (!this._pendingManualBinding) return;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId } = this._pendingManualBinding;

    // Close the confirm dialog and launch the wizard
    this._pendingManualBinding = null;
    this._startBindingWizard(sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId);
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
        message: `Failed to submit survey: ${this._extractErrorMessage(err)}`,
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
        <matter-create-binding-dialog
          .open=${this._showCreateDialog}
          .sourceNode=${this._selectedSourceNode}
          .sourceEndpoint=${this._selectedSourceEndpoint}
          .availableNodes=${this._nodes.filter((n) => n.node_id !== this._selectedSourceNode?.node_id)}
          .selectedTargetNodeId=${this._selectedTargetNodeId}
          .selectedTargetEndpointId=${this._selectedTargetEndpointId}
          .loading=${this._actionInProgress !== null}
          @target-node-change=${this._handleCreateDialogTargetNodeChange}
          @target-endpoint-change=${this._handleCreateDialogTargetEndpointChange}
          @create-binding=${this._handleCreateDialogCreateBinding}
          @cancel=${this._closeCreateDialog}
        ></matter-create-binding-dialog>
        ${this._renderBindingConfirmDialogComponent()}
        ${this._renderManualBindingConfirmDialogComponent()}
        ${this._renderDeleteConfirmDialogComponent()}
        ${this._showVerificationModal ? this._renderVerificationModal() : nothing}
        <matter-binding-wizard
          .open=${this._bindingWizard !== null}
          .wizardState=${this._bindingWizard}
          @execute-binding=${this._handleWizardExecuteBinding}
          @execute-acl=${this._handleWizardExecuteAcl}
          @execute-verify=${this._handleWizardExecuteVerify}
          @privilege-change=${this._handleWizardPrivilegeChange}
          @step-change=${this._handleWizardStepChange}
          @close=${this._handleWizardClose}
        ></matter-binding-wizard>
        ${this._showBulkRepairModal ? this._renderBulkRepairModal() : nothing}
        ${this._operationProgress ? this._renderOperationProgressModal() : nothing}
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
    // Count bindings with missing ACL permissions
    const bindingsWithMissingACL = this._allBindings.filter((b) => {
      const isGroupBinding = b.binding.target_group_id !== null;
      if (isGroupBinding) return false;
      const aclStatus = this._checkBindingACL(b.binding, b.sourceNode.node_id);
      return !aclStatus.hasPermission;
    });

    return html`
      <div class="card overview-card">
        <div class="card-header">
          Established Bindings
          <span class="count-badge">${this._allBindings.length}</span>
          ${bindingsWithMissingACL.length > 0 ? html`
            <button
              class="btn btn-small btn-repair ${this._bulkRepairInProgress ? "btn-loading" : ""}"
              ?disabled=${this._bulkRepairInProgress}
              @click=${this._repairAllACLs}
              title="Repair ACL permissions for all bindings"
            >
              ${this._bulkRepairInProgress ? "Repairing..." : `🔧 Repair All (${bindingsWithMissingACL.length})`}
            </button>
          ` : nothing}
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

    // Check ACL permissions for non-group bindings
    const aclStatus = !isGroupBinding
      ? this._checkBindingACL(binding, sourceNode.node_id)
      : { hasPermission: true, status: "ok" as const };

    return html`
      <div class="overview-binding-row readable ${!aclStatus.hasPermission ? "binding-missing-acl" : ""}">
        <div class="binding-description">
          <div class="binding-sentence">
            ${!aclStatus.hasPermission
              ? html`<span class="acl-warning" title="${aclStatus.reason || "Missing ACL permission"}">⚠️</span>`
              : nothing}
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
            #${sourceNode.node_id} EP ${sourceEndpoint.endpoint_id} → ${isGroupBinding ? `Group` : `#${binding.target_node_id} EP ${binding.target_endpoint_id}`}
            ${sourceNode.area_name ? html` · ${sourceNode.area_name}` : nothing}
            ${!aclStatus.hasPermission
              ? html`<span class="acl-warning-text"> · ${aclStatus.reason}</span>`
              : nothing}
          </div>
        </div>
        <div class="binding-actions">
          ${!aclStatus.hasPermission && !isGroupBinding ? html`
            <span
              class="repair-icon ${this._aclRepairInProgress.get(`${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${binding.target_node_id}-${binding.cluster_id}`) ? "loading" : ""}"
              title="Repair ACL permissions"
              @click=${() => this._repairBindingACL(bindingCtx)}
            >
              ${this._aclRepairInProgress.get(`${sourceNode.node_id}-${sourceEndpoint.endpoint_id}-${binding.target_node_id}-${binding.cluster_id}`) ? "⏳" : "🔧"}
            </span>
          ` : nothing}
          <button
            class="btn-icon verify"
            title="Verify binding on device"
            ?disabled=${this._verificationInProgress || this._actionInProgress !== null}
            @click=${() => this._verifyBindingWithModal(bindingCtx)}
          >
            ✓
          </button>
          <button
            class="btn-icon delete"
            title="Delete binding"
            ?disabled=${this._actionInProgress !== null}
            @click=${() => this._showDeleteConfirmDialog(bindingCtx)}
          >
            ✕
          </button>
        </div>
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

    const hiddenCount = this._recommendations.length - filteredRecommendations.length;
    const emptyMessage = this._filterSameAreaOnly && this._recommendations.length > 0
      ? "No same-area recommendations. Toggle filter to see cross-area bindings."
      : "No binding recommendations. All compatible endpoints are already bound.";

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
          ${this._filterSameAreaOnly && hiddenCount > 0
            ? html`<span class="filter-info">(${hiddenCount} hidden)</span>`
            : nothing}
        </div>
        <matter-recommendation-list
          .recommendations=${filteredRecommendations}
          .actionInProgress=${this._actionInProgress !== null}
          .hideCard=${true}
          .emptyMessage=${emptyMessage}
          @create-binding=${this._handleRecommendationCreateBinding}
          @navigate-device=${this._handleRecommendationNavigateDevice}
        ></matter-recommendation-list>
      </div>
    `;
  }

  private _handleRecommendationCreateBinding(e: CustomEvent<{ recommendation: BindingRecommendation }>) {
    this._showBindingConfirmDialog(e.detail.recommendation);
  }

  private _handleRecommendationNavigateDevice(e: CustomEvent<{ deviceId: string }>) {
    this._navigateToDevice(e.detail.deviceId);
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

  private _showDeleteConfirmDialog(bindingCtx: BindingWithContext): void {
    this._pendingDeleteBinding = bindingCtx;
  }

  private _closeDeleteConfirmDialog(): void {
    this._pendingDeleteBinding = null;
  }

  private async _confirmDeleteBinding(): Promise<void> {
    if (!this._pendingDeleteBinding) return;

    const bindingCtx = this._pendingDeleteBinding;
    const { binding, sourceNode } = bindingCtx;
    const hasACLToRemove = binding.target_node_id !== null && binding.target_group_id === null;

    // Close the confirm dialog
    this._closeDeleteConfirmDialog();

    // Initialize progress state
    this._operationProgress = {
      title: "Removing Binding",
      steps: [
        { label: "Removing binding from device", status: "pending" },
        ...(hasACLToRemove ? [{ label: "Cleaning up ACL entry", status: "pending" as const }] : []),
      ],
      currentStepIndex: 0,
      canCancel: false,
      completed: false,
    };

    // Step 1: Delete binding
    this._updateStepStatus(0, "in_progress");
    try {
      const result = await api.deleteBinding(
        this.hass,
        binding.node_id,
        binding.endpoint_id,
        binding.target_node_id ?? undefined,
        binding.target_endpoint_id ?? undefined,
        binding.target_group_id ?? undefined
      );

      if (!result.success) {
        const errorMsg = this._extractErrorMessage(result.message);
        this._updateStepStatus(0, "error", errorMsg);
        this._operationProgress = { ...this._operationProgress!, completed: true, error: errorMsg };
        return;
      }

      this._updateStepStatus(0, "success");
    } catch (err) {
      const message = this._extractErrorMessage(err);
      this._updateStepStatus(0, "error", message);
      this._operationProgress = { ...this._operationProgress!, completed: true, error: message };
      return;
    }

    // Step 2: Remove ACL (if applicable)
    if (hasACLToRemove && binding.target_node_id !== null && binding.target_endpoint_id !== null) {
      this._updateStepStatus(1, "in_progress");
      try {
        const aclResult = await api.removeACL(
          this.hass,
          binding.target_node_id,
          sourceNode.node_id,
          binding.target_endpoint_id,
          binding.cluster_id
        );

        if (aclResult.success) {
          this._updateStepStatus(1, "success");
          // Invalidate ACL cache for the target node
          this._targetACLCache = new Map(this._targetACLCache);
          this._targetACLCache.delete(binding.target_node_id);
        } else {
          this._updateStepStatus(1, "error", this._extractErrorMessage(aclResult.message));
        }
      } catch (err) {
        const message = this._extractErrorMessage(err);
        this._updateStepStatus(1, "error", message);
      }
    }

    this._operationProgress = { ...this._operationProgress!, completed: true };
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

  private _confirmCreateBinding(): void {
    if (!this._pendingBindingRecommendation || !this._selectedClusterForBinding) return;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint } = this._pendingBindingRecommendation;
    const clusterId = this._selectedClusterForBinding;

    // Close the confirm dialog and launch the wizard
    this._closeBindingConfirmDialog();
    this._startBindingWizard(sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId);
  }

  private _renderBindingsTab() {
    return html`
      <div class="content">
        <matter-node-list
          .nodes=${this._nodes}
          .selectedNodeId=${this._selectedSourceNode?.node_id ?? null}
          .loading=${this._loading}
          @node-selected=${this._handleNodeSelected}
        ></matter-node-list>

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

  private _handleNodeSelected(e: CustomEvent<{ node: MatterNode }>) {
    this._selectNode(e.detail.node);
  }

  private _handleBindingCardDelete(e: CustomEvent<{ binding: BindingWithContext }>) {
    this._showDeleteConfirmDialog(e.detail.binding);
  }

  private _handleBindingCardRepairAcl(e: CustomEvent<{ binding: BindingWithContext }>) {
    this._repairBindingACL(e.detail.binding);
  }

  private _handleBindingCardNavigate(e: CustomEvent<{ deviceId: string }>) {
    this._navigateToDevice(e.detail.deviceId);
  }

  private _handleLoadAcl(e: CustomEvent<{ nodeId: number }>) {
    this._loadACL(e.detail.nodeId);
  }

  private _handleEndpointSelected(e: CustomEvent<{ endpoint: MatterEndpoint }>) {
    if (!e.detail.endpoint.has_binding_cluster) return;
    this._lastVerificationResult = null;
    this._selectedSourceEndpoint = e.detail.endpoint;
    this._loadBindings();
  }

  private _handleWizardExecuteBinding() {
    this._executeBindingStep();
  }

  private _handleWizardExecuteAcl() {
    this._executeACLStep();
  }

  private _handleWizardExecuteVerify() {
    this._executeVerifyStep();
  }

  private _handleWizardPrivilegeChange(e: CustomEvent<{ privilege: number }>) {
    this._handlePrivilegeChange(e.detail.privilege);
  }

  private _handleWizardStepChange(e: CustomEvent<{ step: "binding" | "acl" | "verify" }>) {
    this._goToWizardStep(e.detail.step);
  }

  private _handleWizardClose() {
    this._closeBindingWizard();
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
          <matter-endpoint-selector
            .endpoints=${node.endpoints}
            .selectedEndpointId=${this._selectedSourceEndpoint?.endpoint_id ?? null}
            @endpoint-selected=${this._handleEndpointSelected}
          ></matter-endpoint-selector>
        </div>

        <matter-acl-section
          .node=${node}
          .entries=${this._aclEntries}
          .nodes=${this._nodes}
          .loading=${this._aclLoading}
          @load-acl=${this._handleLoadAcl}
        ></matter-acl-section>

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
                    class="btn btn-small btn-verify ${this._verificationInProgress ? "btn-loading" : ""}"
                    ?disabled=${this._verificationInProgress || this._actionInProgress !== null}
                    @click=${this._verifyBindings}
                    title="Re-read bindings from device to verify"
                  >
                    ${this._verificationInProgress ? "" : "✓ Verify on Device"}
                  </button>
                  <button
                    class="btn btn-small btn-primary"
                    @click=${this._openCreateDialog}
                  >
                    Add Binding
                  </button>
                `
              : nothing}
          </div>
          ${this._lastVerificationResult
            ? html`
                <div class="verification-result ${this._lastVerificationResult.verified ? "verified" : this._lastVerificationResult.success ? "warning" : "error"} ${this._lastVerificationResult.error_type ? this._getErrorDisplay(this._lastVerificationResult.error_type).cssClass : ""}">
                  <span class="verification-icon">
                    ${this._lastVerificationResult.verified
                      ? "✓"
                      : this._lastVerificationResult.success
                        ? "⚠"
                        : this._lastVerificationResult.error_type
                          ? this._getErrorDisplay(this._lastVerificationResult.error_type).icon
                          : "✗"}
                  </span>
                  <span class="verification-message">${this._extractErrorMessage(this._lastVerificationResult.message)}</span>
                  <button class="verification-dismiss" @click=${() => this._lastVerificationResult = null}>×</button>
                </div>
              `
            : nothing}
          ${this._selectedSourceEndpoint
            ? this._bindings.length > 0
              ? html`
                  <div class="binding-list">
                    ${this._bindings.map((binding) => {
                      const bindingCtx = this._getBindingContext(binding);
                      if (!bindingCtx) return nothing;
                      const isGroupBinding = binding.target_group_id !== null;
                      const aclStatus = !isGroupBinding
                        ? this._checkBindingACL(binding, this._selectedSourceNode!.node_id)
                        : { hasPermission: true, status: "ok" as const };
                      const actionKey = `delete-tab-${binding.node_id}-${binding.endpoint_id}-${binding.target_node_id}-${binding.target_endpoint_id}`;
                      return html`
                        <matter-binding-card
                          .binding=${bindingCtx}
                          .aclMissing=${!aclStatus.hasPermission}
                          .aclReason=${aclStatus.reason || ""}
                          .showRepairButton=${!aclStatus.hasPermission && !isGroupBinding}
                          .deleteInProgress=${this._actionInProgress === actionKey}
                          .disabled=${this._actionInProgress !== null}
                          @delete-binding=${this._handleBindingCardDelete}
                          @repair-acl=${this._handleBindingCardRepairAcl}
                          @navigate-device=${this._handleBindingCardNavigate}
                        ></matter-binding-card>
                      `;
                    })}
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

  private async _loadACL(nodeId: number) {
    this._aclLoading = true;
    this._aclEntries = null;
    try {
      const response = await api.listACL(this.hass, nodeId);
      if (response.success) {
        this._aclEntries = response.entries;
      }
    } catch (err) {
      console.error("Failed to load ACL:", err);
    } finally {
      this._aclLoading = false;
    }
  }

  /**
   * Load ACL for a target node into the cache (for binding permission checks).
   */
  private async _loadACLForNode(nodeId: number): Promise<void> {
    if (this._targetACLCache.has(nodeId) || this._aclLoadingNodes.has(nodeId)) {
      return;
    }
    this._aclLoadingNodes = new Set([...this._aclLoadingNodes, nodeId]);
    try {
      const response = await api.listACL(this.hass, nodeId);
      if (response.success) {
        this._targetACLCache = new Map([...this._targetACLCache, [nodeId, response.entries]]);
      }
    } catch (err) {
      console.error(`Failed to load ACL for node ${nodeId}:`, err);
    } finally {
      const newSet = new Set(this._aclLoadingNodes);
      newSet.delete(nodeId);
      this._aclLoadingNodes = newSet;
    }
  }

  /**
   * Create a BindingWithContext from a Binding using current selection state.
   */
  private _getBindingContext(binding: Binding): BindingWithContext | null {
    if (!this._selectedSourceNode || !this._selectedSourceEndpoint) {
      return null;
    }

    const targetNode = binding.target_node_id !== null
      ? this._nodes.find((n) => n.node_id === binding.target_node_id) || null
      : null;
    const targetEndpoint = targetNode && binding.target_endpoint_id !== null
      ? targetNode.endpoints.find((e) => e.endpoint_id === binding.target_endpoint_id) || null
      : null;

    return {
      binding,
      sourceNode: this._selectedSourceNode,
      sourceEndpoint: this._selectedSourceEndpoint,
      targetNode,
      targetEndpoint,
    };
  }

  /**
   * Check if a binding has the required ACL permission on the target device.
   * Returns status object with hasPermission flag and reason if missing.
   */
  private _checkBindingACL(
    binding: Binding,
    sourceNodeId: number
  ): { hasPermission: boolean; status: "ok" | "missing" | "loading" | "unknown"; reason?: string } {
    const targetNodeId = binding.target_node_id;

    // Group bindings - not checking for now
    if (targetNodeId === null) {
      return { hasPermission: true, status: "ok" };
    }

    // Check if we're still loading
    if (this._aclLoadingNodes.has(targetNodeId)) {
      return { hasPermission: true, status: "loading" };
    }

    // Check if we have ACL data
    const targetACL = this._targetACLCache.get(targetNodeId);
    if (targetACL === undefined) {
      return { hasPermission: true, status: "unknown", reason: "ACL not loaded" };
    }

    if (targetACL.length === 0) {
      return { hasPermission: false, status: "missing", reason: "No ACL entries on target" };
    }

    // Determine required privilege based on cluster type
    // Control clusters need Operate (3), sensor clusters need View (1)
    const clusterId = binding.cluster_id;
    const controlClusters = [0x0006, 0x0008, 0x0300, 0x0201, 0x0202]; // On/Off, Level, Color, Thermostat, Fan
    const requiredPrivilege = controlClusters.includes(clusterId) ? 3 : 1;
    const requiredPrivilegeName = requiredPrivilege === 3 ? "Operate" : "View";

    // Find a matching ACL entry
    for (const entry of targetACL) {
      // Must be CASE auth mode (2) for device-to-device
      if (entry.auth_mode !== 2) continue;

      // Must have sufficient privilege
      if (entry.privilege < requiredPrivilege) continue;

      // Check subjects - empty means all authenticated, otherwise must include source
      if (entry.subjects.length > 0 && !entry.subjects.includes(sourceNodeId)) continue;

      // Check targets - empty means all, otherwise must match cluster
      if (entry.targets.length > 0) {
        const clusterMatch = entry.targets.some(
          (t) => t.cluster === null || t.cluster === clusterId
        );
        if (!clusterMatch) continue;
      }

      // Found a matching entry!
      return { hasPermission: true, status: "ok" };
    }

    // No matching entry found
    return {
      hasPermission: false,
      status: "missing",
      reason: `Target missing ${requiredPrivilegeName} permission for source node ${sourceNodeId}`,
    };
  }

  /**
   * Get display information for an operation error type.
   */
  private _getErrorDisplay(errorType?: OperationErrorType): { icon: string; cssClass: string } {
    switch (errorType) {
      case "permission_denied":
        return { icon: "🔒", cssClass: "error-permission" };
      case "device_unavailable":
        return { icon: "📴", cssClass: "error-unavailable" };
      case "device_timeout":
        return { icon: "⏱️", cssClass: "error-timeout" };
      case "device_rejected":
        return { icon: "🚫", cssClass: "error-rejected" };
      case "invalid_request":
        return { icon: "⚠️", cssClass: "error-invalid" };
      case "unknown_error":
      default:
        return { icon: "❌", cssClass: "error-unknown" };
    }
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

  private _renderBindingConfirmDialogComponent() {
    if (!this._pendingBindingRecommendation || !this._selectedClusterForBinding) return nothing;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, compatibleClusters } = this._pendingBindingRecommendation;
    const clusterId = this._selectedClusterForBinding;
    const clusterDesc = getClusterBindingDescription(clusterId);

    return html`
      <matter-confirm-dialog
        .open=${true}
        title="Create Binding"
        icon="🔗"
        confirmLabel="Create Binding"
        .loading=${this._actionInProgress !== null}
        @confirm=${this._confirmCreateBinding}
        @cancel=${this._closeBindingConfirmDialog}
      >
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
      </matter-confirm-dialog>
    `;
  }

  private _renderManualBindingConfirmDialogComponent() {
    if (!this._pendingManualBinding) return nothing;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId } = this._pendingManualBinding;
    const clusterDesc = getClusterBindingDescription(clusterId);

    return html`
      <matter-confirm-dialog
        .open=${true}
        title="Create Binding"
        icon="🔗"
        confirmLabel="Create Binding"
        .loading=${this._actionInProgress !== null}
        @confirm=${this._confirmManualBinding}
        @cancel=${this._closeManualBindingConfirmDialog}
      >
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
      </matter-confirm-dialog>
    `;
  }

  private _renderDeleteConfirmDialogComponent() {
    if (!this._pendingDeleteBinding) return nothing;

    const { binding, sourceNode, sourceEndpoint, targetNode } = this._pendingDeleteBinding;
    const clusterDesc = getClusterBindingDescription(binding.cluster_id);
    const targetName = targetNode?.name || `Node ${binding.target_node_id}`;
    const isGroupBinding = binding.target_group_id !== null;

    return html`
      <matter-confirm-dialog
        .open=${true}
        title="Remove Binding"
        icon="🗑️"
        variant="danger"
        confirmLabel="Remove Binding"
        .loading=${this._actionInProgress !== null}
        @confirm=${this._confirmDeleteBinding}
        @cancel=${this._closeDeleteConfirmDialog}
      >
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
      </matter-confirm-dialog>
    `;
  }

  private _renderVerificationModal() {
    const result = this._verificationModalResult;
    const bindingCtx = result?.bindingContext;
    const isLoading = this._verificationInProgress;

    return html`
      <div class="dialog-overlay" @click=${this._closeVerificationModal}>
        <div class="dialog confirm-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="confirm-icon">${isLoading ? "⏳" : result?.verified ? "✅" : result?.success ? "⚠️" : "❌"}</span>
            Binding Verification
          </div>

          ${isLoading
            ? html`
                <div class="verification-loading">
                  <div class="loading-spinner"></div>
                  <p>Reading bindings from device...</p>
                </div>
              `
            : result
              ? html`
                  <div class="verification-modal-result ${result.verified ? "verified" : result.success ? "warning" : "error"}">
                    <div class="verification-status-icon">
                      ${result.verified ? "✓" : result.success ? "⚠" : "✗"}
                    </div>
                    <div class="verification-status-text">
                      ${result.verified
                        ? "Binding Verified"
                        : result.success
                          ? "Verification Warning"
                          : "Verification Failed"}
                    </div>
                  </div>

                  <div class="verification-details">
                    <p class="verification-message">${this._extractErrorMessage(result.message)}</p>

                    ${bindingCtx
                      ? html`
                          <div class="verification-binding-info">
                            <strong>${bindingCtx.sourceNode.name}</strong>
                            <span class="binding-action">${getClusterBindingDescription(bindingCtx.binding.cluster_id).action}</span>
                            <strong>${bindingCtx.targetNode?.name || `Node ${bindingCtx.binding.target_node_id}`}</strong>
                          </div>
                        `
                      : nothing}

                    ${!result.verified && result.success
                      ? html`
                          <div class="verification-help">
                            <strong>What this means:</strong>
                            <p>The binding data was written, but could not be confirmed on the device. This might happen if:</p>
                            <ul>
                              <li>The device rejected the binding due to ACL restrictions</li>
                              <li>The device doesn't support this binding type</li>
                              <li>The device is temporarily unavailable</li>
                            </ul>
                          </div>
                        `
                      : nothing}
                  </div>
                `
              : nothing}

          <div class="dialog-actions">
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._closeVerificationModal}
              ?disabled=${isLoading}
            >
              ${isLoading ? "Verifying..." : "Close"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =============================================================================
  // Binding Wizard Methods
  // =============================================================================

  private _startBindingWizard(
    sourceNode: MatterNode,
    sourceEndpoint: MatterEndpoint,
    targetNode: MatterNode,
    targetEndpoint: MatterEndpoint,
    clusterId: number
  ): void {
    this._bindingWizard = {
      currentStep: "binding",
      sourceNode,
      sourceEndpoint,
      targetNode,
      targetEndpoint,
      clusterId,
      selectedPrivilege: getRecommendedPrivilege(clusterId),
      bindingInProgress: false,
      aclInProgress: false,
      verifyInProgress: false,
    };
  }

  private _closeBindingWizard(): void {
    this._bindingWizard = null;
    // Reload data after wizard completes
    this._loadOverviewData();
  }

  private _goToWizardStep(step: "binding" | "acl" | "verify"): void {
    if (!this._bindingWizard) return;
    this._bindingWizard = { ...this._bindingWizard, currentStep: step };
  }

  private _handlePrivilegeChange(privilege: number): void {
    if (!this._bindingWizard) return;
    this._bindingWizard = { ...this._bindingWizard, selectedPrivilege: privilege };
  }

  private async _executeBindingStep(): Promise<void> {
    if (!this._bindingWizard) return;

    const { sourceNode, sourceEndpoint, targetNode, targetEndpoint, clusterId } = this._bindingWizard;

    this._bindingWizard = { ...this._bindingWizard, bindingInProgress: true };

    try {
      const result = await api.createBinding(
        this.hass,
        sourceNode.node_id,
        sourceEndpoint.endpoint_id,
        clusterId,
        targetNode.node_id,
        targetEndpoint.endpoint_id,
        undefined, // no group
        true, // verify
        false // don't auto-provision ACL - we do it in step 2
      );

      this._bindingWizard = {
        ...this._bindingWizard,
        bindingResult: result,
        bindingInProgress: false,
      };

      // Auto-advance to ACL step if binding succeeded
      if (result.success) {
        this._goToWizardStep("acl");
      }
    } catch (err) {
      this._bindingWizard = {
        ...this._bindingWizard,
        bindingResult: {
          success: false,
          verified: false,
          message: `Failed to create binding: ${this._extractErrorMessage(err)}`,
          bindings_found: 0,
          error_type: "unknown_error",
        },
        bindingInProgress: false,
      };
    }
  }

  private async _executeACLStep(): Promise<void> {
    if (!this._bindingWizard) return;

    const { sourceNode, targetNode, targetEndpoint, clusterId } = this._bindingWizard;

    this._bindingWizard = { ...this._bindingWizard, aclInProgress: true };

    try {
      const result = await api.provisionACL(
        this.hass,
        targetNode.node_id,
        targetEndpoint.endpoint_id,
        sourceNode.node_id,
        clusterId
      );

      this._bindingWizard = {
        ...this._bindingWizard,
        aclResult: result,
        aclInProgress: false,
      };

      // Auto-advance to verify step if ACL succeeded
      if (result.success) {
        this._goToWizardStep("verify");
      }
    } catch (err) {
      this._bindingWizard = {
        ...this._bindingWizard,
        aclResult: {
          success: false,
          message: `Failed to provision ACL: ${this._extractErrorMessage(err)}`,
          acl_entries_count: 0,
        },
        aclInProgress: false,
      };
    }
  }

  private async _executeVerifyStep(): Promise<void> {
    if (!this._bindingWizard) return;

    const { sourceNode, sourceEndpoint } = this._bindingWizard;

    this._bindingWizard = { ...this._bindingWizard, verifyInProgress: true };

    try {
      const result = await api.verifyBindings(
        this.hass,
        sourceNode.node_id,
        sourceEndpoint.endpoint_id
      );

      this._bindingWizard = {
        ...this._bindingWizard,
        verifyResult: result,
        verifyInProgress: false,
      };
    } catch (err) {
      this._bindingWizard = {
        ...this._bindingWizard,
        verifyResult: {
          success: false,
          verified: false,
          message: `Failed to verify bindings: ${this._extractErrorMessage(err)}`,
          bindings_found: 0,
          error_type: "unknown_error",
        },
        verifyInProgress: false,
      };
    }
  }

  // =============================================================================
  // ACL Repair Methods
  // =============================================================================

  private async _repairBindingACL(bindingCtx: BindingWithContext): Promise<void> {
    // Group bindings don't have ACLs to repair
    if (bindingCtx.binding.target_node_id === null || bindingCtx.binding.target_endpoint_id === null) {
      return;
    }

    const targetNodeId = bindingCtx.binding.target_node_id;
    const targetEndpointId = bindingCtx.binding.target_endpoint_id;
    const targetNode = this._nodes.find((n) => n.node_id === targetNodeId);
    const targetName = targetNode?.name || `Node ${targetNodeId}`;

    // Initialize progress state
    this._operationProgress = {
      title: "Repairing ACL Permission",
      steps: [
        { label: `Provisioning ACL on ${targetName}`, status: "pending" },
      ],
      currentStepIndex: 0,
      canCancel: false,
      completed: false,
    };

    // Execute ACL provisioning
    this._updateStepStatus(0, "in_progress");
    try {
      const result = await api.provisionACL(
        this.hass,
        targetNodeId,
        targetEndpointId,
        bindingCtx.sourceNode.node_id,
        bindingCtx.binding.cluster_id
      );

      if (!result.success) {
        const errorMsg = this._extractErrorMessage(result.message);
        this._updateStepStatus(0, "error", errorMsg);
        this._operationProgress = { ...this._operationProgress!, completed: true, error: errorMsg };
        return;
      }

      this._updateStepStatus(0, "success");

      // Invalidate ACL cache for the target node
      this._targetACLCache = new Map(this._targetACLCache);
      this._targetACLCache.delete(targetNodeId);
    } catch (err) {
      const message = this._extractErrorMessage(err);
      this._updateStepStatus(0, "error", message);
      this._operationProgress = { ...this._operationProgress!, completed: true, error: message };
      return;
    }

    this._operationProgress = { ...this._operationProgress!, completed: true };
  }

  private async _repairAllACLs(): Promise<void> {
    // Find all bindings with missing ACL permissions
    const bindingsToRepair = this._allBindings.filter((b) => {
      const isGroupBinding = b.binding.target_group_id !== null;
      if (isGroupBinding) return false;
      const aclStatus = this._checkBindingACL(b.binding, b.sourceNode.node_id);
      return !aclStatus.hasPermission;
    });

    if (bindingsToRepair.length === 0) return;

    // Build step labels
    const steps = bindingsToRepair.map((bindingCtx) => {
      const targetNode = this._nodes.find((n) => n.node_id === bindingCtx.binding.target_node_id);
      const targetName = targetNode?.name || `Node ${bindingCtx.binding.target_node_id}`;
      return {
        label: `Provisioning ACL on ${targetName}`,
        status: "pending" as const,
      };
    });

    // Initialize progress state
    this._operationProgress = {
      title: `Repairing ${bindingsToRepair.length} ACL Permission${bindingsToRepair.length !== 1 ? "s" : ""}`,
      steps,
      currentStepIndex: 0,
      canCancel: true,
      completed: false,
    };

    // Repair each binding sequentially to avoid overwhelming devices
    for (let i = 0; i < bindingsToRepair.length; i++) {
      // Check if cancelled
      if (this._operationProgress?.steps[i]?.status === "skipped") {
        continue;
      }

      const bindingCtx = bindingsToRepair[i];
      const { binding, sourceNode } = bindingCtx;
      if (binding.target_node_id === null || binding.target_endpoint_id === null) {
        this._updateStepStatus(i, "skipped", "Invalid binding");
        continue;
      }

      this._updateStepStatus(i, "in_progress");

      try {
        const result = await api.provisionACL(
          this.hass,
          binding.target_node_id,
          binding.target_endpoint_id,
          sourceNode.node_id,
          binding.cluster_id
        );

        if (result.success) {
          this._updateStepStatus(i, "success");
        } else {
          this._updateStepStatus(i, "error", this._extractErrorMessage(result.message));
        }
      } catch (err) {
        const message = this._extractErrorMessage(err);
        this._updateStepStatus(i, "error", message);
      }
    }

    // Invalidate all ACL caches
    this._targetACLCache = new Map();

    // Mark as completed
    this._operationProgress = { ...this._operationProgress!, completed: true, canCancel: false };
  }

  private _closeBulkRepairModal(): void {
    this._showBulkRepairModal = false;
    this._bulkRepairResult = null;
  }

  // =============================================================================
  // Bulk Repair Modal Render
  // =============================================================================

  private _renderBulkRepairModal() {
    if (!this._showBulkRepairModal || !this._bulkRepairResult) return nothing;

    const result = this._bulkRepairResult;
    const failed = result.total - result.succeeded;

    return html`
      <div class="dialog-overlay" @click=${this._closeBulkRepairModal}>
        <div class="dialog" style="max-width: 500px;" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">ACL Repair Results</div>

          <div class="bulk-repair-summary">
            <div class="bulk-repair-stat">
              <div class="bulk-repair-stat-value">${result.total}</div>
              <div class="bulk-repair-stat-label">Total</div>
            </div>
            <div class="bulk-repair-stat success">
              <div class="bulk-repair-stat-value">${result.succeeded}</div>
              <div class="bulk-repair-stat-label">Succeeded</div>
            </div>
            ${failed > 0 ? html`
              <div class="bulk-repair-stat failed">
                <div class="bulk-repair-stat-value">${failed}</div>
                <div class="bulk-repair-stat-label">Failed</div>
              </div>
            ` : nothing}
          </div>

          ${result.results.length > 0 ? html`
            <div class="bulk-repair-results">
              ${result.results.map(item => {
                const targetNode = this._nodes.find(n => n.node_id === item.target_node_id);
                return html`
                  <div class="bulk-repair-item">
                    <span class="bulk-repair-item-icon ${item.success ? "success" : "failed"}">
                      ${item.success ? "✓" : "✗"}
                    </span>
                    <span>
                      ${targetNode?.name || `Node ${item.target_node_id}`}
                      (EP ${item.target_endpoint_id}, Cluster ${getClusterName(item.cluster_id)})
                      ${!item.success ? html`<br><small style="color: var(--error-color);">${this._extractErrorMessage(item.message)}</small>` : nothing}
                    </span>
                  </div>
                `;
              })}
            </div>
          ` : html`
            <div style="text-align: center; padding: 16px; color: var(--secondary-text-color);">
              No bindings found to repair.
            </div>
          `}

          <div class="dialog-actions">
            <button type="button" class="btn btn-primary" @click=${this._closeBulkRepairModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =============================================================================
  // Operation Progress Modal Render
  // =============================================================================

  private _renderOperationProgressModal() {
    if (!this._operationProgress) return nothing;

    const { title, steps, completed, error, canCancel } = this._operationProgress;

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
              ? html`<button class="btn btn-primary" @click=${this._closeOperationProgress}>Done</button>`
              : canCancel
                ? html`<button class="btn btn-secondary" @click=${this._cancelOperation}>Cancel</button>`
                : nothing}
          </div>
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

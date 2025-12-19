/**
 * CreateAutomationDialog component
 *
 * A dialog for previewing and creating Home Assistant automations
 * from Matter device combinations.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { dialogBaseStyles } from "../../styles/dialog-styles";
import { createAutomation } from "../../api";
import type {
  HomeAssistant,
  AutomationRecommendation,
  CreateAutomationResponse,
  EntityOption,
} from "../../types";

/**
 * Dialog for creating automations from recommendations.
 *
 * @fires close - When dialog is closed
 * @fires created - When automation is successfully created, with detail containing automation_id
 */
@customElement("matter-create-automation-dialog")
export class CreateAutomationDialog extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    dialogBaseStyles,
    css`
      :host {
        display: contents;
      }

      .automation-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        font-size: 24px;
      }

      .section {
        margin-bottom: 20px;
      }

      .section-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .entity-select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .entity-select:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .entity-select option {
        padding: 8px;
      }

      .alias-input {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        box-sizing: border-box;
      }

      .alias-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .alias-input::placeholder {
        color: var(--secondary-text-color);
      }

      .preview-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .preview-yaml {
        font-family: monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--primary-text-color);
        max-height: 200px;
        overflow-y: auto;
      }

      .info-notice {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: rgba(33, 150, 243, 0.1);
        border-left: 3px solid var(--primary-color);
        padding: 12px 16px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .info-notice-icon {
        flex-shrink: 0;
        font-size: 16px;
      }

      .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 16px;
        text-align: center;
      }

      .success-icon {
        font-size: 48px;
        color: var(--success-color, #4caf50);
        margin-bottom: 16px;
      }

      .success-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .success-detail {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-bottom: 24px;
      }

      .error-message {
        background: rgba(244, 67, 54, 0.1);
        border-left: 3px solid var(--error-color, #f44336);
        padding: 12px 16px;
        border-radius: 0 6px 6px 0;
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--error-color, #f44336);
      }

      .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .device-info {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .device-card {
        flex: 1;
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 12px;
      }

      .device-card-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .device-card-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .arrow-icon {
        display: flex;
        align-items: center;
        color: var(--secondary-text-color);
        font-size: 20px;
      }
    `,
  ];

  /** Home Assistant instance */
  @property({ attribute: false })
  hass?: HomeAssistant;

  /** Whether the dialog is open */
  @property({ type: Boolean })
  open = false;

  /** The automation recommendation to create */
  @property({ attribute: false })
  recommendation?: AutomationRecommendation;

  /** Preview response from API */
  @state()
  private _preview?: CreateAutomationResponse;

  /** Selected trigger entity ID */
  @state()
  private _triggerEntityId?: string;

  /** Selected action entity ID */
  @state()
  private _actionEntityId?: string;

  /** Custom alias for the automation */
  @state()
  private _alias = "";

  /** Loading state */
  @state()
  private _loading = false;

  /** Error message */
  @state()
  private _error?: string;

  /** Whether automation was created successfully */
  @state()
  private _created = false;

  /** Created automation ID */
  @state()
  private _createdAutomationId?: string;

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string, unknown>) {
    // When dialog opens or recommendation changes, fetch preview
    if (
      (changedProperties.has("open") || changedProperties.has("recommendation")) &&
      this.open &&
      this.recommendation &&
      this.hass
    ) {
      this._fetchPreview();
    }

    // Reset state when dialog closes
    if (changedProperties.has("open") && !this.open) {
      this._resetState();
    }
  }

  private _resetState() {
    this._preview = undefined;
    this._triggerEntityId = undefined;
    this._actionEntityId = undefined;
    this._alias = "";
    this._loading = false;
    this._error = undefined;
    this._created = false;
    this._createdAutomationId = undefined;
  }

  private async _fetchPreview() {
    if (!this.hass || !this.recommendation) return;

    this._loading = true;
    this._error = undefined;

    try {
      const { template, sourceNode, sourceEndpoint, targetNode, targetEndpoint } =
        this.recommendation;

      const response = await createAutomation(this.hass, {
        template_id: template.id,
        source_node_id: sourceNode.node_id,
        source_endpoint_id: sourceEndpoint.endpoint_id,
        target_node_id: targetNode.node_id,
        target_endpoint_id: targetEndpoint.endpoint_id,
        source_device_types: sourceEndpoint.device_types.map((dt) => dt.id),
        target_device_types: targetEndpoint.device_types.map((dt) => dt.id),
        preview_only: true,
      });

      this._preview = response;

      // Set default selections
      if (response.available_entities?.trigger?.length) {
        const firstEnabled = response.available_entities.trigger.find((e) => !e.disabled);
        this._triggerEntityId = firstEnabled?.entity_id || response.available_entities.trigger[0].entity_id;
      }
      if (response.available_entities?.action?.length) {
        const firstEnabled = response.available_entities.action.find((e) => !e.disabled);
        this._actionEntityId = firstEnabled?.entity_id || response.available_entities.action[0].entity_id;
      }
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Failed to load preview";
    } finally {
      this._loading = false;
    }
  }

  private async _handleCreate() {
    if (!this.hass || !this.recommendation) return;

    this._loading = true;
    this._error = undefined;

    try {
      const { template, sourceNode, sourceEndpoint, targetNode, targetEndpoint } =
        this.recommendation;

      const response = await createAutomation(this.hass, {
        template_id: template.id,
        source_node_id: sourceNode.node_id,
        source_endpoint_id: sourceEndpoint.endpoint_id,
        target_node_id: targetNode.node_id,
        target_endpoint_id: targetEndpoint.endpoint_id,
        source_device_types: sourceEndpoint.device_types.map((dt) => dt.id),
        target_device_types: targetEndpoint.device_types.map((dt) => dt.id),
        trigger_entity_id: this._triggerEntityId,
        action_entity_id: this._actionEntityId,
        alias: this._alias || undefined,
        preview_only: false,
      });

      if (response.success) {
        this._created = true;
        this._createdAutomationId = response.automation_id;
        this.dispatchEvent(
          new CustomEvent("created", {
            detail: { automation_id: response.automation_id },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        this._error = response.message || "Failed to create automation";
      }
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Failed to create automation";
    } finally {
      this._loading = false;
    }
  }

  private _handleClose() {
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleOverlayClick() {
    if (!this._loading) {
      this._handleClose();
    }
  }

  private _handleDialogClick(e: Event) {
    e.stopPropagation();
  }

  private _formatYaml(config: Record<string, unknown>): string {
    // Simple YAML formatting
    const formatValue = (value: unknown, indent: number): string => {
      const indentStr = "  ".repeat(indent);
      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              const lines = Object.entries(item)
                .map(([k, v], i) => {
                  const prefix = i === 0 ? "- " : "  ";
                  return `${indentStr}${prefix}${k}: ${formatValue(v, 0)}`;
                })
                .join("\n");
              return lines;
            }
            return `${indentStr}- ${item}`;
          })
          .join("\n");
      }
      if (typeof value === "object" && value !== null) {
        return (
          "\n" +
          Object.entries(value)
            .map(([k, v]) => `${indentStr}  ${k}: ${formatValue(v, indent + 1)}`)
            .join("\n")
        );
      }
      if (typeof value === "string" && value.includes("{{")) {
        return `"${value}"`;
      }
      return String(value);
    };

    return Object.entries(config)
      .map(([key, value]) => `${key}: ${formatValue(value, 0)}`)
      .join("\n");
  }

  render() {
    if (!this.open) {
      return nothing;
    }

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog automation-dialog" @click=${this._handleDialogClick}>
          ${this._created ? this._renderSuccess() : this._renderForm()}
        </div>
      </div>
    `;
  }

  private _renderSuccess() {
    return html`
      <div class="success-message">
        <div class="success-icon">✓</div>
        <div class="success-title">Automation Created</div>
        <div class="success-detail">
          The automation has been created but is disabled by default.
          Enable it in Home Assistant when you're ready.
        </div>
        <div class="dialog-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click=${this._handleClose}
          >
            Close
          </button>
          <a
            class="btn btn-primary"
            href="/config/automation/dashboard"
            target="_blank"
          >
            View Automations
          </a>
        </div>
      </div>
    `;
  }

  private _renderForm() {
    const { recommendation } = this;
    if (!recommendation) return nothing;

    const { template, sourceNode, targetNode } = recommendation;

    return html`
      <div class="dialog-header">
        <span class="header-icon">${template.icon}</span>
        <span>${template.title}</span>
      </div>

      <div class="device-info">
        <div class="device-card">
          <div class="device-card-label">Trigger (sensor)</div>
          <div class="device-card-name">${targetNode.name}</div>
        </div>
        <div class="arrow-icon">→</div>
        <div class="device-card">
          <div class="device-card-label">Action (device)</div>
          <div class="device-card-name">${sourceNode.name}</div>
        </div>
      </div>

      ${this._error
        ? html`<div class="error-message">${this._error}</div>`
        : nothing}

      ${this._loading && !this._preview
        ? html`
            <div class="preview-section">
              <div class="loading-spinner"></div>
              Loading preview...
            </div>
          `
        : nothing}

      ${this._preview ? this._renderPreviewForm() : nothing}

      <div class="info-notice">
        <span class="info-notice-icon">ℹ️</span>
        <span>
          The automation will be created <strong>disabled</strong>.
          You can enable it from the Home Assistant automations page after reviewing.
        </span>
      </div>

      <div class="dialog-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click=${this._handleClose}
          ?disabled=${this._loading}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary ${this._loading ? "btn-loading" : ""}"
          @click=${this._handleCreate}
          ?disabled=${this._loading || !this._preview?.success}
        >
          ${this._loading
            ? html`<span class="loading-spinner"></span>Creating...`
            : "Create Automation"}
        </button>
      </div>
    `;
  }

  private _renderPreviewForm() {
    const { _preview: preview } = this;
    if (!preview) return nothing;

    const triggerEntities = preview.available_entities?.trigger || [];
    const actionEntities = preview.available_entities?.action || [];

    return html`
      ${triggerEntities.length > 1
        ? html`
            <div class="section">
              <div class="section-label">Trigger Entity</div>
              <select
                class="entity-select"
                .value=${this._triggerEntityId || ""}
                @change=${(e: Event) => {
                  this._triggerEntityId = (e.target as HTMLSelectElement).value;
                }}
              >
                ${triggerEntities.map(
                  (entity) => html`
                    <option
                      value=${entity.entity_id}
                      ?disabled=${entity.disabled}
                    >
                      ${entity.name} (${entity.entity_id})
                      ${entity.disabled ? " - Disabled" : ""}
                    </option>
                  `
                )}
              </select>
            </div>
          `
        : nothing}

      ${actionEntities.length > 1
        ? html`
            <div class="section">
              <div class="section-label">Action Entity</div>
              <select
                class="entity-select"
                .value=${this._actionEntityId || ""}
                @change=${(e: Event) => {
                  this._actionEntityId = (e.target as HTMLSelectElement).value;
                }}
              >
                ${actionEntities.map(
                  (entity) => html`
                    <option
                      value=${entity.entity_id}
                      ?disabled=${entity.disabled}
                    >
                      ${entity.name} (${entity.entity_id})
                      ${entity.disabled ? " - Disabled" : ""}
                    </option>
                  `
                )}
              </select>
            </div>
          `
        : nothing}

      <div class="section">
        <div class="section-label">Custom Name (optional)</div>
        <input
          type="text"
          class="alias-input"
          placeholder=${preview.automation_config?.alias || "Enter a custom name..."}
          .value=${this._alias}
          @input=${(e: Event) => {
            this._alias = (e.target as HTMLInputElement).value;
          }}
        />
      </div>

      ${preview.automation_config
        ? html`
            <div class="section">
              <div class="section-label">Preview</div>
              <div class="preview-section">
                <div class="preview-yaml">
                  ${this._formatYaml(preview.automation_config)}
                </div>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-create-automation-dialog": CreateAutomationDialog;
  }
}

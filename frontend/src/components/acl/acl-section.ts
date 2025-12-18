/**
 * AclSection component
 *
 * Displays Access Control List entries for a Matter device.
 * Shows subject nodes, privilege levels, and target resources.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ACLEntry, MatterNode } from "../../types";
import { CLUSTER_NAMES } from "../../types";
import { buttonStyles, stateStyles } from "../../styles/shared-styles";
import { baseCardStyles, aclEntryStyles } from "../../styles/card-styles";

/**
 * Displays ACL entries for a Matter device.
 *
 * @fires load-acl - When load button is clicked
 */
@customElement("matter-acl-section")
export class AclSection extends LitElement {
  static styles = [
    buttonStyles,
    stateStyles,
    baseCardStyles,
    aclEntryStyles,
    css`
      :host {
        display: block;
      }

      .device-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
      }

      .btn-small {
        padding: 4px 12px;
        font-size: 12px;
      }

      .acl-entry {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 6px;
        margin-bottom: 8px;
      }

      .acl-entry:last-child {
        margin-bottom: 0;
      }

      .acl-entry.acl-admin {
        border-left: 3px solid #9c27b0;
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
        font-size: 11px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .acl-privilege {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
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

      .acl-auth-mode {
        font-size: 11px;
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .acl-entry-details {
        font-size: 13px;
      }

      .acl-row {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
      }

      .acl-row:last-child {
        margin-bottom: 0;
      }

      .acl-label {
        color: var(--secondary-text-color);
        min-width: 60px;
      }

      .acl-value {
        color: var(--primary-text-color);
      }
    `,
  ];

  /** The Matter node whose ACLs are displayed */
  @property({ attribute: false })
  node!: MatterNode;

  /** ACL entries to display (null = not loaded yet) */
  @property({ attribute: false })
  entries: ACLEntry[] | null = null;

  /** All nodes in the fabric (for resolving subject names) */
  @property({ attribute: false })
  nodes: MatterNode[] = [];

  /** Whether ACL is currently loading */
  @property({ type: Boolean })
  loading = false;

  render() {
    return html`
      <div class="device-section">
        <div class="section-header">
          <span>Access Control (ACL)</span>
          <button
            class="btn btn-small"
            ?disabled=${this.loading}
            @click=${this._handleLoadClick}
          >
            ${this.loading ? "Loading..." : "Load from Device"}
          </button>
        </div>
        ${this._renderContent()}
      </div>
    `;
  }

  private _renderContent() {
    if (this.entries === null) {
      return html`
        <div class="empty-state-small">
          Click "Load from Device" to read ACL entries.
        </div>
      `;
    }

    if (this.entries.length === 0) {
      return html`
        <div class="empty-state-small">No ACL entries found on device.</div>
      `;
    }

    return html`
      <div class="acl-list">
        ${this.entries.map((entry, index) => this._renderEntry(entry, index))}
      </div>
    `;
  }

  private _renderEntry(entry: ACLEntry, index: number) {
    // Resolve subject node IDs to names
    const subjectNames = entry.subjects.map((subjectId) => {
      const subjectNode = this.nodes.find((n) => n.node_id === subjectId);
      return subjectNode
        ? `${subjectNode.name} (${subjectId})`
        : `Node ${subjectId}`;
    });

    // Format targets
    const targetStrings =
      entry.targets && entry.targets.length > 0
        ? entry.targets.map((t) => {
            const parts: string[] = [];
            if (t.cluster !== null) {
              const clusterName =
                CLUSTER_NAMES[t.cluster] ||
                `0x${t.cluster.toString(16).padStart(4, "0")}`;
              parts.push(clusterName);
            }
            if (t.endpoint !== null) {
              parts.push(`EP ${t.endpoint}`);
            }
            if (t.device_type !== null) {
              parts.push(`DT ${t.device_type}`);
            }
            return parts.join(", ");
          })
        : ["All resources"];

    const isAdminEntry = entry.privilege === 5; // Administer
    const isOperateEntry = entry.privilege === 3; // Operate

    const entryClasses = [
      "acl-entry",
      isAdminEntry ? "acl-admin" : "",
      isOperateEntry ? "acl-operate" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${entryClasses}>
        <div class="acl-entry-header">
          <span class="acl-index">#${index + 1}</span>
          <span class="acl-privilege ${entry.privilege_name.toLowerCase()}"
            >${entry.privilege_name}</span
          >
          <span class="acl-auth-mode">(${entry.auth_mode_name})</span>
        </div>
        <div class="acl-entry-details">
          <div class="acl-row">
            <span class="acl-label">Subjects:</span>
            <span class="acl-value">
              ${subjectNames.length > 0
                ? subjectNames.join(", ")
                : "All (any authenticated)"}
            </span>
          </div>
          <div class="acl-row">
            <span class="acl-label">Targets:</span>
            <span class="acl-value">${targetStrings.join("; ")}</span>
          </div>
        </div>
      </div>
    `;
  }

  private _handleLoadClick() {
    this.dispatchEvent(
      new CustomEvent("load-acl", {
        detail: { nodeId: this.node.node_id },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-acl-section": AclSection;
  }
}

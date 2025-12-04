/**
 * Thermostat Schedule Editor Component
 *
 * A UI component for managing Matter thermostat weekly schedules.
 * Reads/writes directly to the Matter device - no separate HA persistence needed.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  MatterNode,
  MatterEndpoint,
  WeeklySchedule,
  ScheduleTransition,
  ScheduleDay,
} from "./types";
import {
  SCHEDULE_DAYS,
  WEEKDAYS,
  WEEKEND,
  minutesToTime,
  timeToMinutes,
  formatTemperature,
} from "./types";
import * as api from "./api";

// Day display names
const DAY_NAMES: Record<ScheduleDay, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  away: "Away",
};

const DAY_FULL_NAMES: Record<ScheduleDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  away: "Away Mode",
};

@customElement("thermostat-schedule-editor")
export class ThermostatScheduleEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public node!: MatterNode;
  @property({ attribute: false }) public endpoint!: MatterEndpoint;

  @state() private _loading = false;
  @state() private _saving = false;
  @state() private _error: string | null = null;
  @state() private _success: string | null = null;
  @state() private _notSupported = false;

  // Current schedule from device
  @state() private _schedule: WeeklySchedule | null = null;

  // Editing state
  @state() private _selectedDays: Set<ScheduleDay> = new Set(WEEKDAYS);
  @state() private _transitions: ScheduleTransition[] = [];
  @state() private _hasChanges = false;

  static styles = css`
    :host {
      display: block;
    }

    .schedule-editor {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title ha-icon {
      color: var(--primary-color);
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
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
      background: var(--error-color);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      padding: 8px;
      min-width: 36px;
      justify-content: center;
    }

    /* Day Selection */
    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .day-chip {
      padding: 8px 16px;
      border-radius: 20px;
      border: 2px solid var(--divider-color);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }

    .day-chip:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .day-chip.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .day-presets {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .preset-btn {
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .preset-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Transitions */
    .transitions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transition-row {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .transition-time {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-time label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .transition-time input {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: monospace;
    }

    .transition-temp {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transition-temp label {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .temp-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .temp-input-group input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      text-align: center;
    }

    .temp-unit {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .transition-delete {
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 50%;
      transition: all 0.2s;
    }

    .transition-delete:hover {
      background: var(--error-color);
      color: white;
    }

    .add-transition {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 14px;
      transition: all 0.2s;
    }

    .add-transition:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Timeline visualization */
    .timeline {
      position: relative;
      height: 60px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      margin-top: 16px;
      overflow: hidden;
    }

    .timeline-labels {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }

    .timeline-bar {
      position: absolute;
      top: 20px;
      left: 8px;
      right: 8px;
      height: 24px;
      background: var(--divider-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .timeline-segment {
      position: absolute;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
      color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 4px;
    }

    .timeline-markers {
      position: absolute;
      bottom: 4px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
    }

    .timeline-marker {
      font-size: 9px;
      color: var(--secondary-text-color);
    }

    /* Messages */
    .message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message.error {
      background: rgba(244, 67, 54, 0.1);
      color: var(--error-color);
    }

    .message.success {
      background: rgba(76, 175, 80, 0.1);
      color: var(--success-color);
    }

    .message.info {
      background: rgba(33, 150, 243, 0.1);
      color: var(--info-color);
    }

    /* Not Supported Card */
    .not-supported-card {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .not-supported-card .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .not-supported-card .header ha-icon {
      color: var(--warning-color);
      font-size: 24px;
    }

    .not-supported-card .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .not-supported-card .description {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.5;
    }

    /* Loading */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    /* Changes indicator */
    .changes-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--warning-color);
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadSchedule();
  }

  private async _loadSchedule() {
    this._loading = true;
    this._error = null;
    this._notSupported = false;

    // Check if thermostat supports GetWeeklySchedule command (0x02) before trying
    const CLUSTER_THERMOSTAT = 0x0201;  // 513
    const CMD_GET_WEEKLY_SCHEDULE = 0x02;  // 2
    const clusterCommands = this.endpoint.cluster_commands || {};
    const thermostatCmdInfo = clusterCommands[CLUSTER_THERMOSTAT];
    const acceptedCommands = thermostatCmdInfo?.accepted || [];

    if (thermostatCmdInfo !== undefined && !acceptedCommands.includes(CMD_GET_WEEKLY_SCHEDULE)) {
      // Device explicitly doesn't support schedule commands
      this._notSupported = true;
      this._loading = false;
      return;
    }

    try {
      const response = await api.getThermostatSchedule(
        this.hass,
        this.node.node_id,
        this.endpoint.endpoint_id
      );

      if (response.schedule) {
        this._schedule = response.schedule;
        // Initialize editing state from loaded schedule
        this._selectedDays = new Set(response.schedule.day_names);
        this._transitions = [...response.schedule.transitions];
        this._hasChanges = false;
      }
    } catch (err: unknown) {
      console.error("Failed to load schedule - full error:", JSON.stringify(err, null, 2));
      console.error("Failed to load schedule - raw:", err);

      // HA WebSocket errors have { code, message } structure
      const errObj = err as { code?: string; message?: string };

      // Check if device doesn't support schedules
      if (errObj?.code === "schedule_not_supported") {
        this._notSupported = true;
        return;
      }

      // Extract message from various error formats
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null) {
        const obj = err as Record<string, unknown>;
        message = (obj.message as string) || (obj.error as string) || (obj.code as string) || JSON.stringify(err);
      } else {
        message = String(err);
      }

      this._error = `Failed to load schedule: ${message}`;
    } finally {
      this._loading = false;
    }
  }

  private async _saveSchedule() {
    if (this._selectedDays.size === 0) {
      this._error = "Please select at least one day";
      return;
    }

    if (this._transitions.length === 0) {
      this._error = "Please add at least one time slot";
      return;
    }

    this._saving = true;
    this._error = null;
    this._success = null;

    try {
      // Sort transitions by time
      const sortedTransitions = [...this._transitions].sort(
        (a, b) => a.transition_time - b.transition_time
      );

      const response = await api.setThermostatSchedule(
        this.hass,
        this.node.node_id,
        this.endpoint.endpoint_id,
        Array.from(this._selectedDays),
        sortedTransitions,
        true, // heat
        false // cool (most EU thermostats are heat-only)
      );

      if (response.success) {
        this._success = "Schedule saved to device";
        this._hasChanges = false;
        // Reload to confirm
        setTimeout(() => this._loadSchedule(), 1000);
      } else {
        this._error = "Failed to save schedule";
      }
    } catch (err: unknown) {
      console.error("Failed to save schedule:", err);
      const message = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message || String(err);
      this._error = `Failed to save schedule: ${message}`;
    } finally {
      this._saving = false;
    }
  }

  private async _clearSchedule() {
    if (!confirm("Are you sure you want to clear all schedules from this device?")) {
      return;
    }

    this._saving = true;
    this._error = null;
    this._success = null;

    try {
      const response = await api.clearThermostatSchedule(
        this.hass,
        this.node.node_id,
        this.endpoint.endpoint_id
      );

      if (response.success) {
        this._success = "Schedule cleared";
        this._schedule = null;
        this._transitions = [];
        this._hasChanges = false;
      } else {
        this._error = "Failed to clear schedule";
      }
    } catch (err: unknown) {
      console.error("Failed to clear schedule:", err);
      const message = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message || String(err);
      this._error = `Failed to clear schedule: ${message}`;
    } finally {
      this._saving = false;
    }
  }

  private _toggleDay(day: ScheduleDay) {
    const newDays = new Set(this._selectedDays);
    if (newDays.has(day)) {
      newDays.delete(day);
    } else {
      newDays.add(day);
    }
    this._selectedDays = newDays;
    this._hasChanges = true;
  }

  private _selectPreset(preset: "weekdays" | "weekend" | "all") {
    switch (preset) {
      case "weekdays":
        this._selectedDays = new Set(WEEKDAYS);
        break;
      case "weekend":
        this._selectedDays = new Set(WEEKEND);
        break;
      case "all":
        this._selectedDays = new Set(SCHEDULE_DAYS.filter(d => d !== "away"));
        break;
    }
    this._hasChanges = true;
  }

  private _addTransition() {
    // Find a good default time (next hour after last transition, or 6:00)
    let defaultTime = 6 * 60; // 6:00 AM
    if (this._transitions.length > 0) {
      const lastTime = Math.max(...this._transitions.map(t => t.transition_time));
      defaultTime = Math.min(lastTime + 60, 23 * 60); // +1 hour, max 23:00
    }

    this._transitions = [
      ...this._transitions,
      {
        transition_time: defaultTime,
        heat_setpoint: 20.0,
        cool_setpoint: null,
      },
    ];
    this._hasChanges = true;
  }

  private _updateTransitionTime(index: number, timeStr: string) {
    const minutes = timeToMinutes(timeStr);
    this._transitions = this._transitions.map((t, i) =>
      i === index ? { ...t, transition_time: minutes } : t
    );
    this._hasChanges = true;
  }

  private _updateTransitionTemp(index: number, tempStr: string) {
    const temp = parseFloat(tempStr);
    if (isNaN(temp)) return;

    this._transitions = this._transitions.map((t, i) =>
      i === index ? { ...t, heat_setpoint: temp } : t
    );
    this._hasChanges = true;
  }

  private _deleteTransition(index: number) {
    this._transitions = this._transitions.filter((_, i) => i !== index);
    this._hasChanges = true;
  }

  private _getTimelineSegments(): Array<{ start: number; end: number; temp: number; color: string }> {
    if (this._transitions.length === 0) return [];

    const sorted = [...this._transitions].sort((a, b) => a.transition_time - b.transition_time);
    const segments: Array<{ start: number; end: number; temp: number; color: string }> = [];

    // Color scale from blue (cold) to red (hot)
    const getColor = (temp: number) => {
      const minTemp = 15;
      const maxTemp = 25;
      const ratio = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
      const hue = (1 - ratio) * 240; // 240 = blue, 0 = red
      return `hsl(${hue}, 70%, 50%)`;
    };

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const temp = current.heat_setpoint ?? 20;

      segments.push({
        start: current.transition_time,
        end: next ? next.transition_time : 24 * 60,
        temp,
        color: getColor(temp),
      });
    }

    // Add segment from midnight to first transition
    if (sorted.length > 0 && sorted[0].transition_time > 0) {
      const lastTemp = sorted[sorted.length - 1].heat_setpoint ?? 20;
      segments.unshift({
        start: 0,
        end: sorted[0].transition_time,
        temp: lastTemp,
        color: getColor(lastTemp),
      });
    }

    return segments;
  }

  render() {
    // Show explicit message if device doesn't support Matter weekly schedules
    if (this._notSupported) {
      return html`
        <div class="not-supported-card">
          <div class="header">
            <ha-icon icon="mdi:calendar-remove"></ha-icon>
            <span class="title">Weekly Schedule Not Supported</span>
          </div>
          <div class="description">
            This thermostat does not support the standard Matter weekly schedule commands.
            The manufacturer may use a proprietary scheduling method or the device may not
            support programmable schedules through Matter.
          </div>
        </div>
      `;
    }

    return html`
      <div class="schedule-editor">
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:calendar-clock"></ha-icon>
            Weekly Schedule
            ${this._hasChanges ? html`<span class="changes-indicator">Unsaved</span>` : nothing}
          </div>
          <div class="actions">
            <button
              class="btn btn-secondary"
              @click=${this._loadSchedule}
              ?disabled=${this._loading || this._saving}
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
              Reload
            </button>
            <button
              class="btn btn-danger"
              @click=${this._clearSchedule}
              ?disabled=${this._loading || this._saving}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
              Clear
            </button>
            <button
              class="btn btn-primary"
              @click=${this._saveSchedule}
              ?disabled=${this._loading || this._saving || !this._hasChanges}
            >
              <ha-icon icon="mdi:content-save"></ha-icon>
              ${this._saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        ${this._error ? html`
          <div class="message error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            ${this._error}
          </div>
        ` : nothing}

        ${this._success ? html`
          <div class="message success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            ${this._success}
          </div>
        ` : nothing}

        ${this._loading ? html`
          <div class="loading">
            <div class="spinner"></div>
            Loading schedule from device...
          </div>
        ` : html`
          <!-- Day Selection -->
          <div class="section">
            <div class="section-title">Apply to days</div>
            <div class="day-selector">
              ${SCHEDULE_DAYS.filter(d => d !== "away").map(day => html`
                <div
                  class="day-chip ${this._selectedDays.has(day) ? "selected" : ""}"
                  @click=${() => this._toggleDay(day)}
                >
                  ${DAY_NAMES[day]}
                </div>
              `)}
            </div>
            <div class="day-presets">
              <button class="preset-btn" @click=${() => this._selectPreset("weekdays")}>
                Weekdays
              </button>
              <button class="preset-btn" @click=${() => this._selectPreset("weekend")}>
                Weekend
              </button>
              <button class="preset-btn" @click=${() => this._selectPreset("all")}>
                Every day
              </button>
            </div>
          </div>

          <!-- Time Slots -->
          <div class="section">
            <div class="section-title">Time slots (max 10)</div>
            <div class="transitions-list">
              ${this._transitions.length === 0 ? html`
                <div class="empty-state">
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                  <p>No time slots configured.<br>Add a time slot to set temperatures throughout the day.</p>
                </div>
              ` : this._transitions
                .map((t, index) => ({ ...t, index }))
                .sort((a, b) => a.transition_time - b.transition_time)
                .map(t => html`
                  <div class="transition-row">
                    <div class="transition-time">
                      <label>Time</label>
                      <input
                        type="time"
                        .value=${minutesToTime(t.transition_time)}
                        @change=${(e: Event) => this._updateTransitionTime(t.index, (e.target as HTMLInputElement).value)}
                      />
                    </div>
                    <div class="transition-temp">
                      <label>Heat setpoint</label>
                      <div class="temp-input-group">
                        <input
                          type="number"
                          min="5"
                          max="35"
                          step="0.5"
                          .value=${t.heat_setpoint?.toString() ?? "20"}
                          @change=${(e: Event) => this._updateTransitionTemp(t.index, (e.target as HTMLInputElement).value)}
                        />
                        <span class="temp-unit">°C</span>
                      </div>
                    </div>
                    <button
                      class="transition-delete"
                      @click=${() => this._deleteTransition(t.index)}
                      title="Remove time slot"
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                `)}

              ${this._transitions.length < 10 ? html`
                <div class="add-transition" @click=${this._addTransition}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  Add time slot
                </div>
              ` : nothing}
            </div>
          </div>

          <!-- Timeline Visualization -->
          ${this._transitions.length > 0 ? html`
            <div class="section">
              <div class="section-title">Preview</div>
              <div class="timeline">
                <div class="timeline-labels">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>12 AM</span>
                </div>
                <div class="timeline-bar">
                  ${this._getTimelineSegments().map(seg => {
                    const totalMinutes = 24 * 60;
                    const left = (seg.start / totalMinutes) * 100;
                    const width = ((seg.end - seg.start) / totalMinutes) * 100;
                    return html`
                      <div
                        class="timeline-segment"
                        style="left: ${left}%; width: ${width}%; background: ${seg.color};"
                        title="${minutesToTime(seg.start)} - ${minutesToTime(seg.end)}: ${seg.temp}°C"
                      >
                        ${width > 8 ? `${seg.temp}°` : ""}
                      </div>
                    `;
                  })}
                </div>
              </div>
            </div>
          ` : nothing}
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "thermostat-schedule-editor": ThermostatScheduleEditor;
  }
}

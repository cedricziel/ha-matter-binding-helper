/**
 * Panel layout styles for Matter Binding Helper
 *
 * Styles for the main panel layout, header, tabs, and content grid.
 */

import { css } from "lit";

/**
 * Host and panel container styles
 */
export const panelHostStyles = css`
  :host {
    display: block;
    padding: 16px;
    background: var(--primary-background-color);
    min-height: 100vh;
  }
`;

/**
 * Header and title styles
 */
export const headerStyles = css`
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
`;

/**
 * Tab navigation styles
 */
export const tabStyles = css`
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
    font-family: inherit;
  }

  .tab:hover {
    color: var(--primary-text-color);
  }

  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
`;

/**
 * Content grid layout styles
 */
export const contentGridStyles = css`
  .content {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 24px;
  }

  .narrow .content {
    grid-template-columns: 1fr;
  }

  .bindings-panel {
    min-height: 400px;
  }

  .device-panel {
    min-height: 400px;
  }
`;

/**
 * Overview content layout
 */
export const overviewLayoutStyles = css`
  .overview-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;

/**
 * Footer styles
 */
export const footerStyles = css`
  .footer {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--divider-color);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }

  .footer-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.5;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
  }

  .footer-link {
    color: var(--primary-color);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .footer-link:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

/**
 * All panel layout styles combined
 */
export const panelLayoutStyles = [
  panelHostStyles,
  headerStyles,
  tabStyles,
  contentGridStyles,
  overviewLayoutStyles,
  footerStyles,
];

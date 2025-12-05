// tools.js - creates the UI tools section

import {LitElement, html, css} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faGear } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faGear);

export class AppTools extends LitElement {
  static properties = {
    drawerOpen: { type: Boolean },
    activeTool: { type: String }
  };

  constructor() {
    super();
    this.drawerOpen = false;
    this.activeTool = null;
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  handleToolClick(toolName) {
    this.activeTool = toolName;

    // Dispatch event to notify other components
    const toolChangeEvent = new CustomEvent('toolChanged', {
      detail: toolName
    });
    window.dispatchEvent(toolChangeEvent);
  }

  static styles = css`
    :host {
      position: relative;
    }

    p, li, span, a, button {
      font-family: var(--font-family-cabin);
      font-size: 1rem;
    }

    .tools-footer {
      position: fixed;
      bottom: 2.5rem;
      left: 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      pointer-events: auto;
    }

    .gear-button {
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--background-gradient);
      color: var(--white);
      padding: 0.5rem 0.75rem; 
      margin: 0;
      cursor: pointer;
      vertical-align: middle;
      text-align: center;

      p {
        display: inline-block;
        margin: 0;
        padding-left: 0.5rem;
        font-size: 18px;
      }
    }

    button svg,
    .gear-button svg {
      width: 18px;
      height: 18px;
      vertical-align: text-top;
    }

    .tool-drawer {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--background-gradient);
      color: var(--white);
      opacity: 0;
      transform: translateX(-16px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .tool-drawer.open {
      opacity: 1;
      transform: translateX(12px);
      pointer-events: auto;
    }

    .tool-drawer button {
      margin: 0;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--button-surface-gradient);
      color: var(--white);
      cursor: pointer;

      &:hover, &:focus, &:active {
        background: var(--colorful-gradient);
        border: 3px solid var(--mrkt3-blue-2);
        color: #232D74;
      }
    }

    .tool-drawer .disabled {
      color: var(--gray-60);
      background: none;
      text-decoration: none;
      cursor: not-allowed;
      border: 3px solid var(--gray-40);
    }

    .tool-drawer .active {
      background: var(--colorful-gradient);
      border: 3px solid var(--mrkt3-blue-2);
      color: #232D74;
    }
  `;

  render() {
    const gearIcon = icon({ prefix: 'fas', iconName: 'gear' });

    return html`
      <footer class="tools-footer">
        <button class="gear-button" @click="${this.toggleDrawer}">
          ${unsafeHTML(gearIcon.html[0])}
          <p>Tools</p>
        </button>
        <div class="tool-drawer ${this.drawerOpen ? 'open' : ''}">
          <button
            @click="${() => this.handleToolClick('satellite-list')}"
            class="${this.activeTool === 'satellite-list' ? 'active' : ''}">
            satellite list
          </button>
          <button class="disabled">charts & graphs</button>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-tools', AppTools);
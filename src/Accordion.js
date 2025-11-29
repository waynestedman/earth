// Accordion.js - creates a reusable accordion component

import {LitElement, html, css} from 'lit';

export class Accordion extends LitElement {
  static properties = {
    title: { type: String },
    isOpen: { type: Boolean, state: true }
  };

  static styles = css`
    .accordion {
      background-color: rgba(138, 63, 252, 0.15);
      border: 1px solid var(--blue-40);
      border-radius: 8px;
      margin: 0.5rem 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 1rem;
      cursor: pointer;
      color: var(--blue-30);
      font-weight: 600;
      user-select: none;
      transition: background-color 0.2s ease;
    }

    .accordion-header:hover {
      background-color: rgba(138, 63, 252, 0.25);
    }

    .accordion-icon {
      transition: transform 0.3s ease;
      font-size: 1.2rem;
    }

    .accordion-icon.open {
      transform: rotate(180deg);
    }

    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      padding: 0 1rem;
    }

    .accordion-content.open {
      max-height: 1000px;
      padding: 0.25rem 1rem;
    }

    .content-wrapper {
      color: var(--blue-30);
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.isOpen = false;
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  render() {
    return html`
      <div class="accordion">
        <div class="accordion-header" @click="${this.toggleAccordion}">
          <span>${this.title}</span>
          <span class="accordion-icon ${this.isOpen ? 'open' : ''}">▼</span>
        </div>
        <div class="accordion-content ${this.isOpen ? 'open' : ''}">
          <div class="content-wrapper">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('accordion-item', Accordion);

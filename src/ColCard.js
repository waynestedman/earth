// ColCard.js - creates a column like card for the UI

import {LitElement, html, css} from 'lit';

export class ColCard extends LitElement {
  static styles = css`
    section {
      position: relative;
      color: var(--blue-30);
      background-color: rgba(138, 63, 252, 0.15);
      border: 1px solid var(--blue-40);
      border-radius: 8px;
      box-shadow: 2px 2px 6px rgba(255, 255, 255, 0.2);
      text-align: center;
      margin: 1rem;
      padding: 1rem;
      width: 400px;
      height: auto;
      pointer-events: auto; /* allow clicks */
    }
  `;

  render() {
    return html`
      <section>
        <h3>Hello from Test Element!</h3>
      </section>
    `;
  }
}
customElements.define('col-card', ColCard);
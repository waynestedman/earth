// header.js - creates the UI header

import {LitElement, html, css} from 'lit';

export class AppHeader extends LitElement {
  static styles = css`
    header {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 50%;
      margin: 1rem auto 0 auto;
      padding-inline: 0.5rem;
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--colorful-gradient);
      color: var(--white);
      text-align: center;
      pointer-events: auto; 
      cursor: default;
    }

    h1 {
      margin: 0 0 0 4rem; 
      color: var(--mrkt3-blue-2);
    }
  `;

  render() {
    return html`
      <header>
        <h1>Satellite Visualization tools</h1>
      </header>
    `;
  }
}
customElements.define('app-header', AppHeader);
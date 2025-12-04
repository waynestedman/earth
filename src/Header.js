// header.js - creates the UI header

import {LitElement, html, css} from 'lit';

export class AppHeader extends LitElement {
  static styles = css`
    header {
      margin: 0;
      padding-inline: 0.5rem;
      background: var(--colorful-gradient);
      color: var(--white);
      text-align: center;
      pointer-events: auto; 
    }

    h1 {
      margin: 0;
    }
  `;

  render() {
    return html`
      <header>
        <h1>Earth & satellites</h1>
      </header>
    `;
  }
}
customElements.define('app-header', AppHeader);
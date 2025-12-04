// ui.js - creates the UI, using Lit

import {LitElement, html, css} from 'lit';
import {AppHeader} from './Header.js';
import {ColCard} from './ColCard.js';
import {AppTools} from './Tools.js';
import { inject } from "@vercel/analytics";

export class AppUI extends LitElement {
  static styles = css`
    main {
      position: absolute;
      top: 0;
      left: 0;
      display: grid;
      grid-template-columns: 100vw;
      grid-template-rows: auto 1fr;
      width: 100vw;
      height: 100vh;
      pointer-events: none; /* allow clicks to pass through */
    }
  `;

  render() {
    return html`
      <main>
        <app-header></app-header>
        <col-card></col-card>
        <app-tools></app-tools>
      </main>
    `;
  }
}
customElements.define('app-ui', AppUI);
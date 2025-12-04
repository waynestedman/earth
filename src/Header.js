// header.js - creates the UI header

import {LitElement, html, css} from 'lit';

export class AppHeader extends LitElement {
  static styles = css`
    header {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
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

    button {
      margin: 0 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--background-gradient);
      color: var(--white);
      /* cursor: pointer; */
    }

    .disabled {
      color: var(--gray-60);
      background: var(--gray-30);
      text-decoration: none;
      cursor: not-allowed;
      border: none;
    }

  `;

  render() {
    return html`
      <header>
        <h1>Satellite Analysis tool</h1>
        <div class="tools">
          <button>satellite list</button>
          <button class="disabled">charts & graphs</button>

        </div>

      </header>
    `;
  }
}
customElements.define('app-header', AppHeader);
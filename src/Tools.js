// tools.js - creates the UI tools section

import {LitElement, html, css} from 'lit';

export class AppTools extends LitElement {
  static styles = css`
    p, li, span, a, button {
      font-family: var(--font-family-cabin);
      font-size: 1rem;
    }

    .tools-footer {
      position: sticky;
      bottom: 0;
      left: 1rem;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      width: 30%;
      margin: 0 0 2.5rem 0;
      padding-inline: 0.5rem;
      border-radius: 0.5rem;
      border: 3px solid var(--border-color);
      background: var(--background-gradient);
      color: var(--white);
      text-align: center;
      pointer-events: auto; 
      cursor: default;
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
      background: none;
      text-decoration: none;
      cursor: not-allowed;
      border: 3px solid var(--gray-40);
    }

  `;

  render() {
    return html`
      <footer class="tools-footer">
        <button class="gear">G</button>
        <div class="tool-buttons">
          <button>satellite list</button>
          <button class="disabled">charts & graphs</button>

        </div>
      </footer>
    `;
  }
}
customElements.define('app-tools', AppTools);
// ColCard.js - creates a column like card for the UI

import {LitElement, html, css} from 'lit';
import {Accordion} from './Accordion.js';

export class ColCard extends LitElement {
  static properties = {
    satellites: { type: Array, state: true }
  };

  static styles = css`
    section {
      position: relative;
      color: var(--blue-30);
      background-color: rgba(138, 63, 252, 0.15);
      border: 1px solid var(--blue-40);
      border-radius: 8px;
      box-shadow: 2px 2px 6px rgba(255, 255, 255, 0.2);
      text-align: left;
      margin: 1rem;
      padding: 1rem;
      width: 400px;
      height: auto;
      pointer-events: auto; /* allow clicks */
    }
    h3 {
      text-align: center;
      margin-top: 0;
    }
/*    ul {
      list-style-type: none;
      padding-left: 0;
    }
    ul ul {
      padding-left: 1.5rem;
      margin-top: 0.25rem;
      font-size: 0.85rem;
    }
    li {
      margin: 0.75rem 0;
    }
*/
    .satellite-name {
      font-weight: 600;
      font-size: 1rem;
    }
    .satellite-details p {
      margin: 0.25rem 0;
    }
  `;

  constructor() {
    super();
    this.satellites = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadSatelliteData();
  }

  async loadSatelliteData() {
    try {
      const response = await fetch('./src/data/satellites.json');
      const data = await response.json();
      this.satellites = data;
    } catch (error) {
      console.error('Error loading satellite data:', error);
    }
  }

  render() {
    return html`
      <section>
        <h3>Satellite Info:</h3>
        ${this.satellites.length > 0 ? html`
          <div>
            ${this.satellites.map(sat => html`
              <accordion-item title="${sat.name}">
                <div class="satellite-details">
                  <p>Launch Date: ${sat.launchDate}</p>
                  <p>Location: ${sat.launchLocation}</p>
                </div>
              </accordion-item>
            `)}
          </div>
        ` : html`<p>Loading...</p>`}
      </section>
    `;
  }
}
customElements.define('col-card', ColCard);
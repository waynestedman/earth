// ColCard.js - creates a column like card for the UI

import {LitElement, html, css} from 'lit';
import {Accordion} from './Accordion.js';

export class ColCard extends LitElement {
  static properties = {
    satellites: { type: Array, state: true },
    selectedSatellite: { type: Object, state: true }
  };

  static styles = css`
    .ui-panels {
      display: grid;
      grid-template-columns: 240px 240px;
      gap: 0.5rem;
      pointer-events: none; /* disable clicks to underlying elements */
    }
    .panel {
      position: relative;
      color: var(--white);
      background: var(--background-gradient);
      border: 3px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 2px 2px 6px rgba(255, 255, 255, 0.2);
      text-align: left;
      margin: 1rem;
      padding: 1rem;
      width: 200px;
      height: auto;
      pointer-events: auto; /* allow clicks */
      transform:
        perspective(1000px)
        rotateY(8deg);
    }
    h3 {
      text-align: center;
      margin-top: 0;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    li {
      margin: 0.5rem 0;
    }
    .satellite-name {
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background-color: var(--button-surface);
      transition: background-color 0.2s;
    }
    .satellite-name:hover {
      background-color: var(--background-gradient);
      outline: 3px solid var(--border-color);
    }
    .selected-satellite {
      /* background-color: rgba(138, 63, 252, 0.3); */
      height: fit-content;
      margin-top: 44px;
      box-shadow: -3px 6px 16px rgba(255, 255, 255, 0.4);
    }
    .satellite-details p {
      margin: 0.25rem 0;
    }

  `;

  constructor() {
    super();
    this.satellites = [];
    this.selectedSatellite = null;

    // Bind the event handler
    this.handleSatelliteSelected = this.handleSatelliteSelected.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadSatelliteData();

    // Listen for satellite selection events
    window.addEventListener('satelliteSelected', this.handleSatelliteSelected);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up event listener
    window.removeEventListener('satelliteSelected', this.handleSatelliteSelected);
  }

  handleSatelliteSelected(event) {
    this.selectedSatellite = event.detail;
    console.log('UI received satellite:', this.selectedSatellite.name);
  }

  handleSatelliteClick(satellite) {
    // Update selected satellite
    this.selectedSatellite = satellite;

    // Dispatch the same event that Viz.js dispatches
    const satelliteClickEvent = new CustomEvent('satelliteSelected', {
      detail: satellite
    });
    window.dispatchEvent(satelliteClickEvent);

    console.log('Satellite clicked from list:', satellite.name);
  }

  async loadSatelliteData() {
    try {
      const response = await fetch('/data/satellites.json');
      const data = await response.json();
      this.satellites = data;
    } catch (error) {
      console.error('Error loading satellite data:', error);
    }
  }

  render() {
    return html`
      <div class="ui-panels">
        <div class="panel satellite-list">
          <h3>Satellite List:</h3>
          ${this.satellites.length > 0 ? html`
            <div>
              <h4>All Satellites:</h4>
              <ul>
                ${this.satellites.map(sat => html`
                  <li class="satellite-name" @click=${() => this.handleSatelliteClick(sat)}>
                    ${sat.name}
                  </li>
                `)}
              </ul>
            </div>
          ` : html`<p>Loading...</p>`}
        </div>
          ${this.selectedSatellite ? html`
            <div class="panel selected-satellite">
              <h3>Satellite details: ${this.selectedSatellite.name}</h3>
              <div class="satellite-details">
                <p><strong>Launch Date:</strong> ${this.selectedSatellite.launchDate}</p>
                <p><strong>Launch Location:<br></strong> ${this.selectedSatellite.launchLocation}</p>
                <p><strong>Radius:</strong> ${this.selectedSatellite.radius}</p>
                <p><strong>Speed:</strong> ${this.selectedSatellite.speed}</p>
                <p><strong>Inclination:</strong> ${this.selectedSatellite.inclination}</p>
              </div>
            </div>
          ` : html``}
      </div>
    `;
  }
}
customElements.define('col-card', ColCard);
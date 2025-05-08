import fs from 'fs';
import path from 'path';
import axios from 'axios';

const brightest100 = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle';
const noaaurl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=tle';
const stations = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';
const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'; // all active satellites
 
const outputPath = path.join(process.cwd(), 'public', 'data', 'stations-tle.json');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

function parseTLEtoJSON(tleData) {
  const lines = tleData.trim().split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1]?.trim();
    const line2 = lines[i + 2]?.trim();

    if (line1 && line2) {
      result.push({ name, line1, line2 });
    }
  }

  // return { satellites: result }; // wrap result in satellites object
  return result;
}

async function fetchTLE() {
  try {
    const response = await axios.get(stations);

    const tleText = response.data; // Axios returns plain text here

    const satellites = parseTLEtoJSON(tleText);

    // Convert to JSON and write to a file
    const jsonData = JSON.stringify(satellites, null, 2);
    fs.writeFileSync(outputPath, jsonData);

    console.log("TLE data saved to stations-tle.json");
  } catch (error) {
    console.error('Error fetching TLE data:', error);
  }
}

// Run the function
fetchTLE();

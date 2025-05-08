import fs from 'fs';
import path from 'path';
import axios from 'axios';

const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle";
 
const outputPath = path.join(process.cwd(), 'public', 'data', 'tle.json');

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

  return result;
}

async function fetchTLE() {
  try {
    const response = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle');
    const tleText = response.data; // Axios returns plain text here

    const satellites = parseTLEtoJSON(tleText);

    // Convert to JSON and write to a file
    const jsonData = JSON.stringify(satellites, null, 2);
    fs.writeFileSync(outputPath, jsonData);

    console.log("TLE data saved to tle.json");
  } catch (error) {
    console.error('Error fetching TLE data:', error);
  }
}

// Run the function
fetchTLE();

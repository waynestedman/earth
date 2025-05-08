const fs = require('fs');
const axios = require("axios");

// const fetch = require('node-fetch'); // Install with `npm install node-fetch`

async function fetchTLE() {
    const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle";

    try {
        const response = await axios.get(url);
        const text = await response.text();

        // Split into lines and group into sets of 3 (Name, Line 1, Line 2)
        const lines = text.trim().split("\n");
        const satellites = [];

        for (let i = 0; i < lines.length; i += 3) {
            if (lines[i + 1] && lines[i + 2]) {
                satellites.push({
                    name: lines[i].trim(),
                    tleLine1: lines[i + 1].trim(),
                    tleLine2: lines[i + 2].trim()
                });
            }
        }

        // Convert to JSON and write to a file
        const jsonData = JSON.stringify(satellites, null, 2);
        fs.writeFileSync("tle.json", jsonData);

        console.log("TLE data saved to tle.json");

    } catch (error) {
        console.error("Error fetching TLE data:", error);
    }
}

// Run the function
fetchTLE();

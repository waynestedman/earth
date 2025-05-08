const fs = require('fs').promises;
const path = require('path');

const assetsData = 'public/data/assets.json';
const tleData = 'public/data/tle.json';

// Read and sort data1.json
async function readAndProcessData1(filePath) {
  try {
    const jsonData = await fs.readFile(path.resolve(filePath), 'utf-8');
    const data = JSON.parse(jsonData);

    if (!Array.isArray(data.asset_table_rows)) {
      throw new Error('"asset_table_rows" should be an array');
    }

    console.log(`Total number of assets: ${data.asset_table_rows.length}`);

    return data.asset_table_rows
      .map(obj => ({
        noradID: obj.NORAD_CAT_ID,
        name: obj.OBJECT_NAME,
      }))
      // .sort((a, b) => a.noradID.localeCompare(b.noradID));
      .sort((a, b) => {
        if (a.noradID < b.noradID) return -1;
        if (a.noradID > b.noradID) return 1;
        return 0;
      });
  } catch (error) {
    console.error('Error processing data1:', error.message);
    return [];
  }
}

// Helper: extract NORAD ID from line2 (first 5-digit number)
function getNoradIdFromLine2(line2) {
  return line2.slice(2, 7).trim(); // positions 3–7 are NORAD ID in TLE line2 format
}

// Modified function
async function filterAndWriteMatchingData(data1Path, data2Path, outputPath) {
  try {
    const data1 = await readAndProcessData1(data1Path);
    const noradIdSet = new Set(data1.map(item => item.noradID.toString().padStart(5, '0')));

    const jsonData2 = await fs.readFile(path.resolve(data2Path), 'utf-8');
    const tleArray = JSON.parse(jsonData2);

    if (!Array.isArray(tleArray)) {
      throw new Error('data2 should be an array of TLE objects');
    }

    const filtered = tleArray.filter(obj => {
      if (!obj.line2) return false;
      const noradId = getNoradIdFromLine2(obj.line2);
      return noradIdSet.has(noradId);
    });

    await fs.writeFile(path.resolve(outputPath), JSON.stringify(filtered, null, 2), 'utf-8');
    console.log(`Filtered ${filtered.length} matching TLE entries to ${outputPath}`);
  } catch (error) {
    console.error('Error filtering/writing TLE data:', error.message);
  }
}

filterAndWriteMatchingData(assetsData, tleData, './public/data/filtered-data.json');
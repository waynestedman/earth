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

// Read data2.json, filter by names from data1, and write to new JSON
async function filterAndWriteMatchingData(data1Path, data2Path, outputPath) {
  try {
    const data1 = await readAndProcessData1(data1Path);
    const namesSet = new Set(data1.map(item => item.name));

    const jsonData2 = await fs.readFile(path.resolve(data2Path), 'utf-8');
    const data2 = JSON.parse(jsonData2);

    if (!Array.isArray(data2)) {
      throw new Error('data2.json should be an array');
    }

    const filtered = data2.filter(obj => namesSet.has(obj.name));

    await fs.writeFile(path.resolve(outputPath), JSON.stringify(filtered, null, 2), 'utf-8');
    console.log(`Filtered data written to ${outputPath}`);
  } catch (error) {
    console.error('Error filtering/writing data:', error.message);
  }
}

filterAndWriteMatchingData(assetsData, tleData, './public/data/filtered-data.json');
const fs = require('fs');
const path = require('path');

const configPath = '/Users/marvin/.gemini/antigravity/scratch/omni-config-editor/inspect_config.json';

try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Config Name:", data.name);
    console.log("Keys in values:");
    const keys = Object.keys(data.values).sort();
    console.log(keys);

    // Look for anything related to "top_row"
    const topRowKeys = keys.filter(k => k.toLowerCase().includes('top_row'));
    console.log("\nTop Row related keys:", topRowKeys);

} catch (err) {
    console.error("Error reading config:", err);
}

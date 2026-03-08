const fs = require('fs');

const configPath = '/Users/marvin/.gemini/antigravity/scratch/omni-config-editor/inspect_config.json';

try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const val = data.values['top_row_item_limits'];
    if (val) {
        let decoded;
        if (typeof val === 'string') {
            decoded = JSON.parse(Buffer.from(val, 'base64').toString());
        } else if (val._data) {
            decoded = JSON.parse(Buffer.from(val._data, 'base64').toString());
        }
        console.log("top_row_item_limits:", JSON.stringify(decoded, null, 2));
    } else {
        console.log("Key not found");
    }

} catch (err) {
    console.error("Error:", err);
}

const fs = require('fs');

const configPath = '/Users/marvin/.gemini/antigravity/scratch/omni-config-editor/inspect_config.json';

try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const decode = (val) => {
        if (!val) return val;
        if (typeof val === 'string') return JSON.parse(Buffer.from(val, 'base64').toString());
        if (val._data) return JSON.parse(Buffer.from(val._data, 'base64').toString());
        return val;
    };

    console.log("Selected Catalogs:", decode(data.values['selected_catalogs']));
    console.log("\nCatalog Ordering Keys:", Object.keys(decode(data.values['catalog_ordering']) || {}));
    console.log("\nCustom Catalog Names Keys:", Object.keys(decode(data.values['custom_catalog_names']) || {}));

} catch (err) {
    console.error("Error:", err);
}

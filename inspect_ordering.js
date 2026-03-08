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

    const ordering = decode(data.values['catalog_ordering']);
    console.log("type of catalog_ordering:", typeof ordering);
    if (ordering) {
        console.log("keys of catalog_ordering:", Object.keys(ordering).slice(0, 10));
        console.log("first item:", ordering[Object.keys(ordering)[0]]);
    }

} catch (err) {
    console.error("Error:", err);
}

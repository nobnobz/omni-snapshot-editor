const fs = require('fs');
const path = '/Users/marvin/Library/Containers/AB138D02-0C58-4878-8B91-8E87F5BD437C/Data/Documents/Backups/omni-config-2026-03-06T18-25.json';

const config = JSON.parse(fs.readFileSync(path, 'utf8'));

function decode(val) {
    if (val && val._data) {
        return JSON.parse(Buffer.from(val._data, 'base64').toString('utf8'));
    }
    return val;
}

const mainGroups = decode(config.values.main_catalog_groups);
console.log("Main Groups Keys:", Object.keys(mainGroups));

const catalogGroups = decode(config.values.catalog_groups);
console.log("Catalog Groups Keys Sample:", Object.keys(catalogGroups).slice(0, 10));

const subgroupOrder = decode(config.values.subgroup_order);
console.log("Subgroup Order Sample:", JSON.stringify(subgroupOrder, null, 2).slice(0, 500));

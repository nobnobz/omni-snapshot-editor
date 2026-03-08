const fs = require('fs');
const path = '/Users/marvin/Library/Containers/AB138D02-0C58-4878-8B91-8E87F5BD437C/Data/Documents/Backups/omni-config-2026-03-06T18-25.json';

const config = JSON.parse(fs.readFileSync(path, 'utf8'));
const groupsData = config.values.catalog_groups._data;
const binary = Buffer.from(groupsData, 'base64').toString('utf8');
const groups = JSON.parse(binary);

console.log(JSON.stringify(Object.keys(groups), null, 2));

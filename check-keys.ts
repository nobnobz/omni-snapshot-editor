import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('/Users/marvin/Library/Containers/AB138D02-0C58-4878-8B91-8E87F5BD437C/Data/Documents/Backups/omni-config-2026-03-06T18-25.json', 'utf8'));
const values = data.values;

const keys = [
    "hide_spoilers",
    "small_continue_watching_shelf",
    "hide_external_playback_prompt",
    "mdblist_enabled_ratings",
    "selected_catalogs",
    "pinned_catalogs",
    "small_catalogs",
    "top_row_catalogs",
    "starred_catalogs",
    "randomized_catalogs",
    "small_toprow_catalogs",
    "catalog_ordering",
    "custom_catalog_names",
    "regex_pattern_custom_names",
    "regex_pattern_image_urls",
    "pattern_tag_enabled_patterns",
    "pattern_default_filter_enabled_patterns",
    "pattern_image_color_indices",
    "pattern_border_radius_indices",
    "pattern_background_opacities",
    "pattern_border_thickness_indices",
    "pattern_color_indices",
    "pattern_color_hex_values",
    "auto_play_enabled_patterns",
    "auto_play_patterns",
    "landscape_catalogs",
    "disabled_shelves",
    "subtitle_color",
    "subtitle_background_color",
    "top_row_item_limits",
    "shelf_order",
    "subgroup_order",
    "main_catalog_groups",
    "catalog_groups",
    "catalog_group_image_urls"
];

for (const key of keys) {
    if (key in values) {
        if (typeof values[key] === 'object' && values[key] !== null && '_data' in values[key]) {
            console.log(`Wrapping correct for: ${key}`);
        } else {
            console.log(`MISMATCH - SHOULD NOT BE WRAPPED: ${key} -> ${JSON.stringify(values[key])}`);
        }
    } else {
        console.log(`Missing in source file: ${key}`);
    }
}

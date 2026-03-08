"use strict";
/**
 * Utilities for decoding and encoding the _data base64 strings in the Omni Config.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneDisabledKeys = exports.pruneDisabledCatalogs = exports.encodeConfig = exports.decodeConfig = exports.isBase64DataNode = void 0;
// Helper to check if an object is a _data wrapper
var isBase64DataNode = function (node) {
    return node && typeof node === "object" && !Array.isArray(node) && Object.keys(node).length === 1 && typeof node._data === "string";
};
exports.isBase64DataNode = isBase64DataNode;
/**
 * Recursively decodes _data fields in a JSON object
 */
var decodeConfig = function (obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return (0, exports.decodeConfig)(item); });
    }
    if (typeof obj === "object") {
        if ((0, exports.isBase64DataNode)(obj)) {
            try {
                var decodedStr = atob(obj._data);
                var parsed = JSON.parse(decodedStr);
                // We do not recursively decode here unless we expect nested base64 (usually not the case)
                return parsed;
            }
            catch (e) {
                console.error("Failed to decode or parse base64 data", obj._data, e);
                return obj; // Return original if it fails
            }
        }
        var result = {};
        for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            result[key] = (0, exports.decodeConfig)(value);
        }
        return result;
    }
    return obj;
};
exports.decodeConfig = decodeConfig;
/**
 * Recursively encodes objects/arrays back to _data fields based on the original structure.
 * We need to know which keys were originally encoded.  For this app, it's safer to explicitly
 * define or infer during load, or just check the original object.
 *
 * An alternative simpler approach:  When we load, we keep track of which keys were base64 encoded.
 * We can pass that map here, or compare against original.
 */
var encodeConfig = function (currentParsedMap, originalValuesMap, disabledKeys) {
    var result = {};
    // List of keys that Omni EXPECTS to be base64 wrapped even if they weren't in original
    var ALWAYS_WRAPPED_KEYS = [
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
    for (var _i = 0, _a = Object.entries(currentParsedMap); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        var originalValue = originalValuesMap[key];
        var shouldBeWrapped = (0, exports.isBase64DataNode)(originalValue) || ALWAYS_WRAPPED_KEYS.includes(key);
        if (shouldBeWrapped) {
            try {
                var stringified = JSON.stringify(value);
                var encoded = btoa(stringified);
                result[key] = { _data: encoded };
            }
            catch (e) {
                console.error("Failed to encode data for key", key, e);
                result[key] = value;
            }
        }
        else {
            // It wasn't base64 originally and isn't on our must-wrap list
            result[key] = value;
        }
    }
    return result;
};
exports.encodeConfig = encodeConfig;
/**
 * Prunes disabled catalogs from specific arrays (like ordering arrays or selected catalogs).
 */
var pruneDisabledCatalogs = function (values, disabledCatalogs) {
    // Deep clone to avoid mutating state directly during export
    var cloned = JSON.parse(JSON.stringify(values));
    var pruneArray = function (arr) { return arr.filter(function (item) {
        if (typeof item === 'string') {
            return !disabledCatalogs.has(item);
        }
        // If it's an object with an 'id' or something similar
        if (item && typeof item === 'object' && item.id) {
            return !disabledCatalogs.has(item.id);
        }
        return true;
    }); };
    // Recursive search and prune arrays
    var walkAndPrune = function (obj) {
        if (Array.isArray(obj)) {
            return pruneArray(obj);
        }
        if (obj !== null && typeof obj === 'object') {
            for (var key in obj) {
                // If the key itself is a disabled group/catalog name, delete it.
                // This covers `catalog_groups[disabled]` and `catalog_group_image_urls[disabled]`
                if (disabledCatalogs.has(key)) {
                    delete obj[key];
                    continue;
                }
                if (Array.isArray(obj[key])) {
                    obj[key] = pruneArray(obj[key]);
                }
                else if (typeof obj[key] === 'object') {
                    obj[key] = walkAndPrune(obj[key]);
                }
            }
        }
        return obj;
    };
    return walkAndPrune(cloned);
};
exports.pruneDisabledCatalogs = pruneDisabledCatalogs;
/**
 * Deeply prunes keys that were explicitly disabled via GenericRenderer switches.
 * `disabledKeys` contains dot-notation paths like "parent.child.key".
 */
var pruneDisabledKeys = function (values, disabledKeys) {
    var cloned = JSON.parse(JSON.stringify(values));
    var walkAndPrune = function (obj, currentPath) {
        if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
            for (var key in obj) {
                var pathStr = __spreadArray(__spreadArray([], currentPath, true), [key], false).join('.');
                if (disabledKeys.has(pathStr)) {
                    delete obj[key];
                    continue;
                }
                obj[key] = walkAndPrune(obj[key], __spreadArray(__spreadArray([], currentPath, true), [key], false));
            }
        }
        return obj;
    };
    return walkAndPrune(cloned, []);
};
exports.pruneDisabledKeys = pruneDisabledKeys;

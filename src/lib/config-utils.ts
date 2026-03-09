/**
 * Utilities for decoding and encoding the _data base64 strings in the Omni Config.
 */

// Helper to check if an object is a _data wrapper
export const isBase64DataNode = (node: any): boolean => {
    return node && typeof node === "object" && !Array.isArray(node) && Object.keys(node).length === 1 && typeof node._data === "string";
};

/**
 * Recursively decodes _data fields in a JSON object
 */
export const decodeConfig = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => decodeConfig(item));
    }

    if (typeof obj === "object") {
        if (isBase64DataNode(obj)) {
            try {
                const decodedStr = atob(obj._data);
                const parsed = JSON.parse(decodedStr);
                // We do not recursively decode here unless we expect nested base64 (usually not the case)
                return parsed;
            } catch (e) {
                console.error("Failed to decode or parse base64 data", obj._data, e);
                return obj; // Return original if it fails
            }
        }

        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = decodeConfig(value);
        }
        return result;
    }

    return obj;
};

/**
 * Recursively encodes objects/arrays back to _data fields based on the original structure.
 * We need to know which keys were originally encoded.  For this app, it's safer to explicitly
 * define or infer during load, or just check the original object.
 *
 * An alternative simpler approach:  When we load, we keep track of which keys were base64 encoded.
 * We can pass that map here, or compare against original.
 */
export const encodeConfig = (currentParsedMap: Record<string, any>, originalValuesMap: Record<string, any>, disabledKeys: Set<string>): Record<string, any> => {
    const result: Record<string, any> = {};

    // List of keys that Omni EXPECTS to be base64 wrapped even if they weren't in original
    const ALWAYS_WRAPPED_KEYS = [
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

    for (const [key, value] of Object.entries(currentParsedMap)) {
        const originalValue = originalValuesMap[key];
        const shouldBeWrapped = isBase64DataNode(originalValue) || ALWAYS_WRAPPED_KEYS.includes(key);

        if (shouldBeWrapped) {
            try {
                const stringified = JSON.stringify(value);
                const encoded = btoa(stringified);
                result[key] = { _data: encoded };
            } catch (e) {
                console.error("Failed to encode data for key", key, e);
                result[key] = value;
            }
        } else {
            // It wasn't base64 originally and isn't on our must-wrap list
            result[key] = value;
        }
    }

    return result;
};

/**
 * Prunes disabled catalogs from specific arrays (like ordering arrays or selected catalogs).
 */
export const pruneDisabledCatalogs = (values: Record<string, any>, disabledCatalogs: Set<string>) => {
    // Deep clone to avoid mutating state directly during export
    const cloned = JSON.parse(JSON.stringify(values));

    const pruneArray = (arr: any[]) => arr.filter(item => {
        if (typeof item === 'string') {
            return !disabledCatalogs.has(item);
        }
        // If it's an object with an 'id' or something similar
        if (item && typeof item === 'object' && item.id) {
            return !disabledCatalogs.has(item.id);
        }
        return true;
    });

    // Recursive search and prune arrays
    const walkAndPrune = (obj: any) => {
        if (Array.isArray(obj)) {
            return pruneArray(obj);
        }
        if (obj !== null && typeof obj === 'object') {
            for (const key in obj) {
                // If the key itself is a disabled group/catalog name, delete it.
                // This covers `catalog_groups[disabled]` and `catalog_group_image_urls[disabled]`
                if (disabledCatalogs.has(key)) {
                    delete obj[key];
                    continue;
                }

                if (Array.isArray(obj[key])) {
                    obj[key] = pruneArray(obj[key]);
                } else if (typeof obj[key] === 'object') {
                    obj[key] = walkAndPrune(obj[key]);
                }
            }
        }
        return obj;
    };

    return walkAndPrune(cloned);
};

/**
 * Deeply prunes keys that were explicitly disabled via GenericRenderer switches.
 * `disabledKeys` contains dot-notation paths like "parent.child.key".
 */
export const pruneDisabledKeys = (values: Record<string, any>, disabledKeys: Set<string>) => {
    const cloned = JSON.parse(JSON.stringify(values));

    const walkAndPrune = (obj: any, currentPath: string[]) => {
        if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
            for (const key in obj) {
                const pathStr = [...currentPath, key].join('.');
                if (disabledKeys.has(pathStr)) {
                    delete obj[key];
                    continue;
                }
                obj[key] = walkAndPrune(obj[key], [...currentPath, key]);
            }
        }
        return obj;
    };

    return walkAndPrune(cloned, []);
};
/**
 * Validates if the given object is a valid Omni Configuration structure.
 */
export const validateOmniConfig = (config: any): boolean => {
    if (!config || typeof config !== 'object') return false;

    // An Omni config must have either a 'values' or 'config' root object
    const values = config.values || config.config;
    if (!values || typeof values !== 'object') return false;

    // Check for some common Omni keys to be reasonably sure it's the right format.
    // We check for at least ONE of these known keys.
    const commonKeys = [
        "catalog_ordering",
        "hide_spoilers",
        "mdblist_enabled_ratings",
        "preferred_audio_language",
        "catalog_groups",
        "main_catalog_groups",
        "subtitle_color"
    ];

    const hasCommonKey = commonKeys.some(key => key in values);

    // Also allow "clean" templates which might only have a few keys but are valid objects
    return hasCommonKey || Object.keys(values).length > 0;
};

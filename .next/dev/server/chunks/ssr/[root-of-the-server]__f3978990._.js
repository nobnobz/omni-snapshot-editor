module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/config-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilities for decoding and encoding the _data base64 strings in the Omni Config.
 */ // Helper to check if an object is a _data wrapper
__turbopack_context__.s([
    "decodeConfig",
    ()=>decodeConfig,
    "encodeConfig",
    ()=>encodeConfig,
    "isBase64DataNode",
    ()=>isBase64DataNode,
    "pruneDisabledCatalogs",
    ()=>pruneDisabledCatalogs,
    "pruneDisabledKeys",
    ()=>pruneDisabledKeys
]);
const isBase64DataNode = (node)=>{
    return node && typeof node === "object" && !Array.isArray(node) && Object.keys(node).length === 1 && typeof node._data === "string";
};
const decodeConfig = (obj)=>{
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) {
        return obj.map((item)=>decodeConfig(item));
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
        const result = {};
        for (const [key, value] of Object.entries(obj)){
            result[key] = decodeConfig(value);
        }
        return result;
    }
    return obj;
};
const encodeConfig = (currentParsedMap, originalValuesMap, disabledKeys)=>{
    const result = {};
    for (const [key, value] of Object.entries(currentParsedMap)){
        // Skip check here since `pruneDisabledKeys` handles deep pruning.
        // We only check against `originalValuesMap` and base64 re-encoding.
        const originalValue = originalValuesMap[key];
        if (isBase64DataNode(originalValue)) {
            try {
                const stringified = JSON.stringify(value);
                const encoded = btoa(stringified);
                result[key] = {
                    _data: encoded
                };
            } catch (e) {
                console.error("Failed to encode data for key", key, e);
                result[key] = value;
            }
        } else {
            // It wasn't base64 originally, just copy it back (deep clone might be safer, but usually value is already updated)
            // Note: we should recursively prune disabled catalogs from lists here, but we will handle that in a specific pruning function.
            result[key] = value;
        }
    }
    return result;
};
const pruneDisabledCatalogs = (values, disabledCatalogs)=>{
    // Deep clone to avoid mutating state directly during export
    const cloned = JSON.parse(JSON.stringify(values));
    const pruneArray = (arr)=>arr.filter((item)=>{
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
    const walkAndPrune = (obj)=>{
        if (Array.isArray(obj)) {
            return pruneArray(obj);
        }
        if (obj !== null && typeof obj === 'object') {
            for(const key in obj){
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
const pruneDisabledKeys = (values, disabledKeys)=>{
    const cloned = JSON.parse(JSON.stringify(values));
    const walkAndPrune = (obj, currentPath)=>{
        if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
            for(const key in obj){
                const pathStr = [
                    ...currentPath,
                    key
                ].join('.');
                if (disabledKeys.has(pathStr)) {
                    delete obj[key];
                    continue;
                }
                obj[key] = walkAndPrune(obj[key], [
                    ...currentPath,
                    key
                ]);
            }
        }
        return obj;
    };
    return walkAndPrune(cloned, []);
};
}),
"[project]/src/lib/mutations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Helper: counts how many places a string-keyed group name is referenced.
 */ __turbopack_context__.s([
    "assignSubgroup",
    ()=>assignSubgroup,
    "countGroupReferences",
    ()=>countGroupReferences,
    "countMainGroupReferences",
    ()=>countMainGroupReferences,
    "createMainGroup",
    ()=>createMainGroup,
    "createSubgroup",
    ()=>createSubgroup,
    "disableCatalog",
    ()=>disableCatalog,
    "disableGroup",
    ()=>disableGroup,
    "disableMainGroup",
    ()=>disableMainGroup,
    "getAllCatalogIds",
    ()=>getAllCatalogIds,
    "importGroups",
    ()=>importGroups,
    "renameGroup",
    ()=>renameGroup,
    "renameMainGroup",
    ()=>renameMainGroup,
    "unassignSubgroup",
    ()=>unassignSubgroup,
    "validateAndFix",
    ()=>validateAndFix
]);
function countGroupReferences(name, state) {
    let count = 0;
    if (state.catalog_groups && state.catalog_groups[name]) count++;
    if (state.catalog_group_order && state.catalog_group_order.includes(name)) count++;
    if (state.catalog_group_image_urls && state.catalog_group_image_urls[name] !== undefined) count++;
    if (state.subgroup_order) {
        Object.values(state.subgroup_order).forEach((arr)=>{
            if (Array.isArray(arr) && arr.includes(name)) count++;
        });
    }
    if (state.main_catalog_groups) {
        Object.values(state.main_catalog_groups).forEach((group)=>{
            if (group && Array.isArray(group.subgroupNames) && group.subgroupNames.includes(name)) count++;
        });
    }
    return count;
}
function countMainGroupReferences(uuid, state) {
    let count = 0;
    if (state.main_catalog_groups && state.main_catalog_groups[uuid]) count++;
    if (state.main_group_order && state.main_group_order.includes(uuid)) count++;
    if (state.subgroup_order && state.subgroup_order[uuid]) count++;
    return count;
}
function renameGroup(oldName, newName, state) {
    if (oldName === newName) return state;
    // We do NOT mutate the original state, make a deep copy or do immutable updates
    const draft = JSON.parse(JSON.stringify(state));
    const mergeArrays = (arr1 = [], arr2 = [])=>{
        return Array.from(new Set([
            ...arr1,
            ...arr2
        ])); // Quick unique merge
    };
    // 1. Rename the key in catalog_groups
    if (draft.catalog_groups) {
        if (draft.catalog_groups[oldName]) {
            const oldItems = draft.catalog_groups[oldName] || [];
            if (draft.catalog_groups[newName]) {
                // Merge logic if newName exists
                draft.catalog_groups[newName] = mergeArrays(draft.catalog_groups[newName], oldItems);
            } else {
                draft.catalog_groups[newName] = oldItems;
            }
            delete draft.catalog_groups[oldName];
        }
    }
    // 2. Replace the old name in catalog_group_order
    if (Array.isArray(draft.catalog_group_order)) {
        const index = draft.catalog_group_order.indexOf(oldName);
        if (index !== -1) {
            // If the target name already exists, we just filter out the oldName to prevent dupes
            if (draft.catalog_group_order.includes(newName)) {
                draft.catalog_group_order = draft.catalog_group_order.filter((g)=>g !== oldName);
            } else {
                draft.catalog_group_order[index] = newName;
            }
        }
    }
    // 3. Replace the old name in subgroup_order arrays
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID)=>{
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                const index = arr.indexOf(oldName);
                if (index !== -1) {
                    if (arr.includes(newName)) {
                        draft.subgroup_order[mainGroupUUID] = arr.filter((s)=>s !== oldName);
                    } else {
                        arr[index] = newName;
                    }
                }
            }
        });
    }
    // 4. Replace within main_catalog_groups[*].subgroupNames
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid)=>{
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                const index = group.subgroupNames.indexOf(oldName);
                if (index !== -1) {
                    if (group.subgroupNames.includes(newName)) {
                        group.subgroupNames = group.subgroupNames.filter((s)=>s !== oldName);
                    } else {
                        group.subgroupNames[index] = newName;
                    }
                }
            }
        });
    }
    // 5. Rename the key in catalog_group_image_urls
    if (draft.catalog_group_image_urls) {
        if (draft.catalog_group_image_urls[oldName] !== undefined) {
            // Always overwrite target image url, or keep existing target if preferable.
            // Let's keep existing target if it exists, otherwise move old
            if (draft.catalog_group_image_urls[newName] === undefined) {
                draft.catalog_group_image_urls[newName] = draft.catalog_group_image_urls[oldName];
            }
            delete draft.catalog_group_image_urls[oldName];
        }
    }
    return draft;
}
function renameMainGroup(uuid, newName, state) {
    const draft = JSON.parse(JSON.stringify(state));
    if (draft.main_catalog_groups && draft.main_catalog_groups[uuid]) {
        draft.main_catalog_groups[uuid].name = newName;
    }
    return draft;
}
function unassignSubgroup(name, state) {
    const draft = JSON.parse(JSON.stringify(state));
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID)=>{
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s)=>s !== name);
            }
        });
    }
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid)=>{
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s)=>s !== name);
            }
        });
    }
    return draft;
}
function assignSubgroup(name, targetMainGroupUuid, state) {
    const draft = JSON.parse(JSON.stringify(state));
    // First unassign it from any existing main groups to ensure it only lives in one place
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID)=>{
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s)=>s !== name);
            }
        });
    }
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid)=>{
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s)=>s !== name);
            }
        });
    }
    // Now assign to the new parent
    if (!draft.main_catalog_groups[targetMainGroupUuid]) {
        draft.main_catalog_groups[targetMainGroupUuid] = {
            name: "Unknown Group",
            subgroupNames: []
        };
    }
    if (!Array.isArray(draft.main_catalog_groups[targetMainGroupUuid].subgroupNames)) {
        draft.main_catalog_groups[targetMainGroupUuid].subgroupNames = [];
    }
    // Add to the end of the new parent's list
    draft.main_catalog_groups[targetMainGroupUuid].subgroupNames.push(name);
    // ALSO keep subgroup_order in sync (this is what the editor reads from to render subgroups)
    if (!draft.subgroup_order) draft.subgroup_order = {};
    if (!Array.isArray(draft.subgroup_order[targetMainGroupUuid])) {
        draft.subgroup_order[targetMainGroupUuid] = [];
    }
    if (!draft.subgroup_order[targetMainGroupUuid].includes(name)) {
        draft.subgroup_order[targetMainGroupUuid].push(name);
    }
    return draft;
}
function createMainGroup(name, assignedSubgroups, state) {
    const draft = JSON.parse(JSON.stringify(state));
    const newUuid = crypto.randomUUID();
    if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
    if (!draft.main_group_order) draft.main_group_order = [];
    if (!draft.subgroup_order) draft.subgroup_order = {};
    draft.main_catalog_groups[newUuid] = {
        name,
        subgroupNames: [],
        posterSize: "Default",
        posterType: "Square"
    };
    draft.main_group_order.push(newUuid);
    // Now securely assign the selected subgroups
    let tempDraft = draft;
    for (const sg of assignedSubgroups){
        tempDraft = assignSubgroup(sg, newUuid, tempDraft);
    }
    return tempDraft;
}
function createSubgroup(name, targetMainGroupUuid, imageUrl, initialCatalogs = [], state) {
    const draft = JSON.parse(JSON.stringify(state));
    if (!draft.catalog_groups) draft.catalog_groups = {};
    if (!draft.catalog_group_order) draft.catalog_group_order = [];
    if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
    // Create the subgroup with the provided catalog list
    draft.catalog_groups[name] = initialCatalogs;
    draft.catalog_group_order.push(name);
    if (imageUrl) {
        draft.catalog_group_image_urls[name] = imageUrl;
    }
    // Now assign it to the selected main group
    if (targetMainGroupUuid) {
        return assignSubgroup(name, targetMainGroupUuid, draft);
    }
    return draft;
}
function disableGroup(name, state) {
    const draft = JSON.parse(JSON.stringify(state));
    if (draft.catalog_groups) {
        delete draft.catalog_groups[name];
    }
    if (Array.isArray(draft.catalog_group_order)) {
        draft.catalog_group_order = draft.catalog_group_order.filter((g)=>g !== name);
    }
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID)=>{
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s)=>s !== name);
            }
            // If empty, we can optionally delete the uuid key from subgroup_order
            if (draft.subgroup_order[mainGroupUUID].length === 0) {
                delete draft.subgroup_order[mainGroupUUID];
            }
        });
    }
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid)=>{
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s)=>s !== name);
            }
        });
    }
    if (draft.catalog_group_image_urls) {
        delete draft.catalog_group_image_urls[name];
    }
    return draft;
}
function disableMainGroup(uuid, state) {
    const draft = JSON.parse(JSON.stringify(state));
    // 1. Remove from main_group_order
    if (Array.isArray(draft.main_group_order)) {
        draft.main_group_order = draft.main_group_order.filter((id)=>id !== uuid);
    }
    // 2. Cascade delete subgroups
    const subgroupNames = draft.main_catalog_groups?.[uuid]?.subgroupNames || draft.subgroup_order?.[uuid] || [];
    if (Array.isArray(subgroupNames)) {
        subgroupNames.forEach((name)=>{
            if (draft.catalog_groups) delete draft.catalog_groups[name];
            if (Array.isArray(draft.catalog_group_order)) {
                draft.catalog_group_order = draft.catalog_group_order.filter((g)=>g !== name);
            }
            if (draft.catalog_group_image_urls) delete draft.catalog_group_image_urls[name];
        });
    }
    // 3. Remove main group entries
    if (draft.main_catalog_groups) {
        delete draft.main_catalog_groups[uuid];
    }
    if (draft.subgroup_order) {
        delete draft.subgroup_order[uuid];
    }
    return draft;
}
function disableCatalog(catalogId, state) {
    const draft = JSON.parse(JSON.stringify(state));
    // Remove from catalog_groups lists
    if (draft.catalog_groups) {
        Object.keys(draft.catalog_groups).forEach((groupName)=>{
            const arr = draft.catalog_groups[groupName];
            if (Array.isArray(arr)) {
                draft.catalog_groups[groupName] = arr.filter((c)=>c !== catalogId);
            }
        });
    }
    // Remove from common flat catalog arrays
    const commonLists = [
        "selected_catalogs",
        "pinned_catalogs",
        "small_catalogs",
        "top_row_catalogs",
        "starred_catalogs",
        "randomized_catalogs",
        "small_toprow_catalogs",
        "catalog_ordering"
    ];
    commonLists.forEach((listName)=>{
        if (Array.isArray(draft[listName])) {
            draft[listName] = draft[listName].filter((c)=>c !== catalogId);
        }
    });
    return draft;
}
function validateAndFix(state) {
    const draft = JSON.parse(JSON.stringify(state));
    const validGroupNames = new Set(Object.keys(draft.catalog_groups || {}));
    // Ensure catalog_group_order exists and is cleaned
    if (!Array.isArray(draft.catalog_group_order)) {
        draft.catalog_group_order = [];
    }
    // Fix corruption where order might be ["_data"]
    if (draft.catalog_group_order.length === 1 && draft.catalog_group_order[0] === "_data") {
        draft.catalog_group_order = [];
    }
    // Dedupe & Clean
    draft.catalog_group_order = Array.from(new Set(draft.catalog_group_order)).filter((g)=>typeof g === 'string' && validGroupNames.has(g));
    // Ensure every existing group appears
    validGroupNames.forEach((name)=>{
        if (!draft.catalog_group_order.includes(name)) {
            draft.catalog_group_order.push(name);
        }
    });
    // CRITICAL: Reorder the keys in catalog_groups and related objects to match catalog_group_order
    // This ensures that modern JSON stringifiers preserve the order requested by the user.
    if (draft.catalog_groups) {
        const orderedGroups = {};
        draft.catalog_group_order.forEach((name)=>{
            if (draft.catalog_groups[name]) {
                orderedGroups[name] = draft.catalog_groups[name];
            }
        });
        draft.catalog_groups = orderedGroups;
    }
    if (draft.catalog_group_image_urls) {
        const orderedUrls = {};
        draft.catalog_group_order.forEach((name)=>{
            if (draft.catalog_group_image_urls[name] !== undefined) {
                orderedUrls[name] = draft.catalog_group_image_urls[name];
            }
        });
        draft.catalog_group_image_urls = orderedUrls;
    }
    // Dedupe & Clean subgroup_order
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((uuid)=>{
            let arr = draft.subgroup_order[uuid];
            if (Array.isArray(arr)) {
                arr = Array.from(new Set(arr)).filter((g)=>typeof g === 'string' && validGroupNames.has(g));
                draft.subgroup_order[uuid] = arr;
                if (arr.length === 0) {
                    delete draft.subgroup_order[uuid];
                }
            }
        });
    }
    // Clean main_catalog_groups references
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid)=>{
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = Array.from(new Set(group.subgroupNames)).filter((g)=>typeof g === 'string' && validGroupNames.has(g));
            }
        });
    }
    // Dedupe catalog lists
    const commonLists = [
        "selected_catalogs",
        "pinned_catalogs",
        "small_catalogs",
        "top_row_catalogs",
        "starred_catalogs",
        "randomized_catalogs",
        "small_toprow_catalogs",
        "catalog_ordering"
    ];
    commonLists.forEach((listName)=>{
        if (Array.isArray(draft[listName])) {
            draft[listName] = Array.from(new Set(draft[listName]));
        }
    });
    return draft;
}
function importGroups(payload, state) {
    const draft = JSON.parse(JSON.stringify(state));
    if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
    if (!draft.main_group_order) draft.main_group_order = [];
    if (!draft.catalog_groups) draft.catalog_groups = {};
    if (!draft.catalog_group_order) draft.catalog_group_order = [];
    if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
    if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
        draft.subgroup_order = {};
    }
    // Build a reverse lookup: main group name -> existing UUID in current config
    const existingMgByName = {};
    Object.entries(draft.main_catalog_groups).forEach(([uid, mg])=>{
        if (mg?.name) existingMgByName[mg.name] = uid;
    });
    // 1. Import Main Groups
    Object.keys(payload.mainGroups).forEach((uuid)=>{
        const mg = payload.mainGroups[uuid];
        const incomingSubgroups = [
            ...mg.subgroupNames || []
        ];
        // If a group with the same NAME already exists, update its subgroup links
        // instead of creating a brand-new duplicate entry
        const existingUuid = existingMgByName[mg.name];
        if (existingUuid) {
            // Merge subgroup names into the existing group
            if (!draft.main_catalog_groups[existingUuid].subgroupNames) {
                draft.main_catalog_groups[existingUuid].subgroupNames = [];
            }
            incomingSubgroups.forEach((sgName)=>{
                if (!draft.main_catalog_groups[existingUuid].subgroupNames.includes(sgName)) {
                    draft.main_catalog_groups[existingUuid].subgroupNames.push(sgName);
                }
            });
            // Rebuild subgroup_order for the existing group (replace + merge)
            if (!draft.subgroup_order[existingUuid]) draft.subgroup_order[existingUuid] = [];
            incomingSubgroups.forEach((sgName)=>{
                if (!draft.subgroup_order[existingUuid].includes(sgName)) {
                    draft.subgroup_order[existingUuid].push(sgName);
                }
            });
        } else {
            // Brand new main group
            let targetUuid = uuid;
            if (draft.main_catalog_groups[targetUuid]) {
                targetUuid = crypto.randomUUID();
            }
            draft.main_catalog_groups[targetUuid] = {
                name: mg.name,
                subgroupNames: incomingSubgroups,
                posterType: mg.posterType,
                posterSize: mg.posterSize
            };
            draft.main_group_order.push(targetUuid);
            draft.subgroup_order[targetUuid] = incomingSubgroups;
        }
    });
    // 2. Import / Ensure Subgroups exist in catalog_groups
    Object.keys(payload.subgroups).forEach((name)=>{
        const sg = payload.subgroups[name];
        // Always ensure the catalog entry exists (create or update)
        draft.catalog_groups[name] = [
            ...sg.catalogs || []
        ];
        if (!draft.catalog_group_order.includes(name)) {
            draft.catalog_group_order.push(name);
        }
        if (sg.imageUrl) {
            draft.catalog_group_image_urls[name] = sg.imageUrl;
        }
        // Handle standalone assignment (subgroups not coming from a main group)
        const targetMainUuid = payload.standaloneAssignments[name];
        if (targetMainUuid && draft.main_catalog_groups[targetMainUuid]) {
            if (!draft.main_catalog_groups[targetMainUuid].subgroupNames) {
                draft.main_catalog_groups[targetMainUuid].subgroupNames = [];
            }
            if (!draft.main_catalog_groups[targetMainUuid].subgroupNames.includes(name)) {
                draft.main_catalog_groups[targetMainUuid].subgroupNames.push(name);
            }
            if (!draft.subgroup_order[targetMainUuid]) {
                draft.subgroup_order[targetMainUuid] = [];
            }
            if (!draft.subgroup_order[targetMainUuid].includes(name)) {
                draft.subgroup_order[targetMainUuid].push(name);
            }
        }
    });
    // 3. Import Metadata (Names, Images, Patterns)
    if (payload.metadata) {
        const meta = payload.metadata;
        if (meta.custom_catalog_names) {
            if (!draft.custom_catalog_names) draft.custom_catalog_names = {};
            Object.assign(draft.custom_catalog_names, meta.custom_catalog_names);
        }
        if (meta.regex_pattern_image_urls) {
            if (!draft.regex_pattern_image_urls) draft.regex_pattern_image_urls = {};
            Object.assign(draft.regex_pattern_image_urls, meta.regex_pattern_image_urls);
        }
        if (Array.isArray(meta.enabled_patterns)) {
            // Merge into both potential enable lists for coverage
            const lists = [
                "auto_play_enabled_patterns",
                "pattern_tag_enabled_patterns"
            ];
            lists.forEach((list)=>{
                if (!Array.isArray(draft[list])) draft[list] = [];
                meta.enabled_patterns.forEach((p)=>{
                    if (!draft[list].includes(p)) draft[list].push(p);
                });
            });
        }
    }
    // 4. Import Global Settings
    if (payload.globalSettings) {
        Object.assign(draft, payload.globalSettings);
    }
    return validateAndFix(draft);
}
function getAllCatalogIds(state) {
    const ids = new Set();
    const addIds = (source)=>{
        if (!source) return;
        if (Array.isArray(source)) {
            source.forEach((id)=>{
                if (typeof id === 'string') ids.add(id);
            });
        } else if (typeof source === 'object') {
            Object.values(source).forEach((val)=>{
                if (typeof val === 'string') ids.add(val);
                else if (Array.isArray(val)) val.forEach((id)=>{
                    if (typeof id === 'string') ids.add(id);
                });
            });
        }
    };
    // 1. Standard flat arrays
    const commonLists = [
        "selected_catalogs",
        "pinned_catalogs",
        "small_catalogs",
        "top_row_catalogs",
        "starred_catalogs",
        "randomized_catalogs",
        "small_toprow_catalogs"
    ];
    commonLists.forEach((list)=>addIds(state[list]));
    // 2. Complex structures
    addIds(state.catalog_ordering);
    if (state.catalog_groups) {
        Object.values(state.catalog_groups).forEach((arr)=>addIds(arr));
    }
    // 3. Known names (even if not in any list)
    if (state.custom_catalog_names) {
        Object.keys(state.custom_catalog_names).forEach((id)=>{
            if (!id.startsWith("_")) ids.add(id);
        });
    }
    return ids;
}
}),
"[project]/src/context/ConfigContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfigProvider",
    ()=>ConfigProvider,
    "useConfig",
    ()=>useConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mutations.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const ConfigContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const ConfigProvider = ({ children })=>{
    const [originalConfig, setOriginalConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initialValues, setInitialValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [currentValues, setCurrentValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [disabledKeys, setDisabledKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [disabledCatalogs, setDisabledCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [deletedSubgroups, setDeletedSubgroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [deletedMainGroups, setDeletedMainGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [catalogs, setCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fileName, setFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("omni-config.json");
    // Custom fallbacks from localStorage
    const [customFallbacks, setCustomFallbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, []);
    const loadConfig = (config, fn = "omni-config.json")=>{
        setOriginalConfig(config);
        setFileName(fn);
        // Map config.values OR config.config to internal values state
        const rawValues = config.values || config.config || {};
        const decodedValues = {};
        // Decode fields if they use the base64 wrapper format (_data)
        for (const [key, val] of Object.entries(rawValues)){
            decodedValues[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeConfig"])(val);
        }
        // Extract catalogs if it's a manifest format (config.catalogs[])
        let extractedCatalogs = [];
        if (Array.isArray(config.config?.catalogs)) {
            extractedCatalogs = config.config.catalogs;
        } else if (Array.isArray(config.catalogs)) {
            extractedCatalogs = config.catalogs;
        }
        // FALLBACK: If no manifest catalogs found, synthesize minimal objects from state-format selected_catalogs
        if (extractedCatalogs.length === 0) {
            const decodedCatalogOrdering = decodedValues.catalog_ordering || decodedValues.selected_catalogs || [];
            const topRowList = decodedValues.top_row_catalogs || [];
            const customNames = decodedValues.custom_catalog_names || {};
            const topRowLimits = decodedValues.top_row_item_limits || {};
            // All IDs in scope
            const allIds = new Set([
                ...decodedCatalogOrdering,
                ...topRowList
            ]);
            extractedCatalogs = Array.from(allIds).map((id)=>({
                    id,
                    name: customNames[id] || id,
                    enabled: decodedCatalogOrdering.length > 0 ? decodedCatalogOrdering.includes(id) : true,
                    showInHome: topRowList.includes(id),
                    metadata: topRowLimits[id] ? {
                        itemCount: topRowLimits[id]
                    } : undefined,
                    _synthetic: true
                }));
        }
        setCatalogs(extractedCatalogs);
        setCurrentValues(decodedValues);
        setInitialValues(JSON.parse(JSON.stringify(decodedValues))); // Deep clone for safety
        setDisabledKeys(new Set());
        setDisabledCatalogs(new Set());
        setDeletedSubgroups([]);
        setDeletedMainGroups([]);
    };
    const updateValuePath = (obj, path, value)=>{
        if (path.length === 0) return value;
        if (path.length === 1) {
            if (value === undefined) {
                const newObj = {
                    ...obj
                };
                delete newObj[path[0]];
                return newObj;
            }
            return {
                ...obj,
                [path[0]]: value
            };
        }
        const [head, ...rest] = path;
        const innerObj = obj ? obj[head] : {};
        return {
            ...obj,
            [head]: updateValuePath(innerObj, rest, value)
        };
    };
    const getValuePath = (obj, path)=>{
        return path.reduce((acc, part)=>acc && acc[part] !== undefined ? acc[part] : undefined, obj);
    };
    const updateValue = (keyPath, value)=>{
        setCurrentValues((prev)=>updateValuePath(prev, keyPath, value));
    };
    const toggleKey = (keyPath, isEnabled)=>{
        const keyString = keyPath.join(".");
        setDisabledKeys((prev)=>{
            const next = new Set(prev);
            if (isEnabled) {
                next.delete(keyString);
            } else {
                next.add(keyString);
            }
            return next;
        });
        if (isEnabled && originalConfig?.values) {
            // Only restore if it is NOT in currentValues (preserving session-level deletions/changes)
            const currentVal = getValuePath(currentValues, keyPath);
            if (currentVal === undefined) {
                const origVal = getValuePath(originalConfig.values, keyPath);
                if (origVal !== undefined) {
                    // Need to decode it just in case it was a base64 originally
                    updateValue(keyPath, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeConfig"])(origVal));
                }
            }
        }
    };
    const toggleCatalog = (catalogId, isEnabled)=>{
        setDisabledCatalogs((prev)=>{
            const next = new Set(prev);
            if (isEnabled) next.delete(catalogId);
            else next.add(catalogId);
            return next;
        });
    };
    const updateCatalogsOrder = (newOrder)=>{
    // Specifically for catalogs
    };
    const renameCatalogGroup = (oldName, newName)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renameGroup"])(oldName, newName, prev));
    };
    const renameMainCatalogGroup = (uuid, newName)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renameMainGroup"])(uuid, newName, prev));
    };
    const removeMainCatalogGroup = (uuid)=>{
        // Archive for Recycle Bin
        const group = currentValues.main_catalog_groups?.[uuid];
        const subgroupNames = currentValues.subgroup_order?.[uuid] || group?.subgroupNames || [];
        setDeletedMainGroups((prev)=>[
                {
                    uuid,
                    name: group?.name || "Group",
                    subgroupNames,
                    deletedAt: new Date().toISOString()
                },
                ...prev
            ]);
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["disableMainGroup"])(uuid, prev));
    };
    const restoreMainGroup = (item)=>{
        setCurrentValues((prev)=>{
            const draft = JSON.parse(JSON.stringify(prev));
            // 1. Restore the main group entry
            if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
            draft.main_catalog_groups[item.uuid] = {
                name: item.name,
                subgroupNames: item.subgroupNames
            };
            // 2. Restore the subgroup order array
            if (!draft.subgroup_order) draft.subgroup_order = {};
            draft.subgroup_order[item.uuid] = item.subgroupNames;
            // 3. Add back to main_group_order if missing
            if (!draft.main_group_order) draft.main_group_order = [];
            if (!draft.main_group_order.includes(item.uuid)) {
                draft.main_group_order.push(item.uuid);
            }
            return draft;
        });
        setDeletedMainGroups((prev)=>prev.filter((i)=>i.uuid !== item.uuid || i.deletedAt !== item.deletedAt));
    };
    const removeCatalogGroup = (name)=>{
        // Archive data before deletion for Recycle Bin
        const catalogs = currentValues.catalog_groups?.[name] || [];
        const imageUrl = currentValues.catalog_group_image_urls?.[name] || "";
        // Find parent UUID
        let parentUUID = "";
        if (currentValues.subgroup_order) {
            parentUUID = Object.keys(currentValues.subgroup_order).find((uuid)=>Array.isArray(currentValues.subgroup_order[uuid]) && currentValues.subgroup_order[uuid].includes(name)) || "";
        }
        const parentName = parentUUID ? currentValues.main_catalog_groups?.[parentUUID]?.name || "General" : "General";
        setDeletedSubgroups((prev)=>[
                {
                    name,
                    catalogs,
                    imageUrl,
                    parentUUID,
                    parentName,
                    deletedAt: new Date().toISOString()
                },
                ...prev
            ]);
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["disableGroup"])(name, prev));
    };
    const unassignCatalogGroup = (name)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["unassignSubgroup"])(name, prev));
    };
    const assignCatalogGroup = (name, targetMainGroupUuid)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assignSubgroup"])(name, targetMainGroupUuid, prev));
    };
    const addMainCatalogGroup = (name, assignedSubgroups)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createMainGroup"])(name, assignedSubgroups, prev));
    };
    const addCatalogGroup = (name, targetMainGroupUuid, imageUrl, initialCatalogs = [])=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSubgroup"])(name, targetMainGroupUuid, imageUrl, initialCatalogs, prev));
    };
    const importGroupsToState = (payload)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["importGroups"])(payload, prev));
    };
    const restoreSubgroup = (item)=>{
        setCurrentValues((prev)=>{
            const draft = JSON.parse(JSON.stringify(prev));
            // 1. Restore core data
            if (!draft.catalog_groups) draft.catalog_groups = {};
            draft.catalog_groups[item.name] = item.catalogs;
            if (item.imageUrl) {
                if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
                draft.catalog_group_image_urls[item.name] = item.imageUrl;
            }
            // 2. Restore ordering references
            const targetUUID = item.parentUUID || Object.keys(draft.main_catalog_groups || {})[0];
            if (targetUUID) {
                if (!draft.subgroup_order) draft.subgroup_order = {};
                if (!Array.isArray(draft.subgroup_order[targetUUID])) draft.subgroup_order[targetUUID] = [];
                if (!draft.subgroup_order[targetUUID].includes(item.name)) {
                    draft.subgroup_order[targetUUID].push(item.name);
                }
                if (draft.main_catalog_groups?.[targetUUID]) {
                    if (!Array.isArray(draft.main_catalog_groups[targetUUID].subgroupNames)) {
                        draft.main_catalog_groups[targetUUID].subgroupNames = [];
                    }
                    if (!draft.main_catalog_groups[targetUUID].subgroupNames.includes(item.name)) {
                        draft.main_catalog_groups[targetUUID].subgroupNames.push(item.name);
                    }
                }
            }
            return draft;
        });
        setDeletedSubgroups((prev)=>prev.filter((i)=>i.name !== item.name || i.deletedAt !== item.deletedAt));
    };
    const clearDeletedSubgroups = ()=>{
        setDeletedSubgroups([]);
        setDeletedMainGroups([]);
    };
    // --- Manifest Catalog Mutations ---
    // These directly mutate the config.catalogs[] array
    const updateCatalogField = (id, patch)=>{
        setCatalogs((prev)=>{
            return prev.map((c)=>{
                if (c.id !== id) return c;
                const updated = {
                    ...c
                };
                for (const [key, val] of Object.entries(patch)){
                    if (key === 'metadata') {
                        updated.metadata = {
                            ...c.metadata,
                            ...val
                        };
                    } else {
                        updated[key] = val;
                    }
                }
                return updated;
            });
        });
    };
    const addManifestCatalog = (catalog)=>{
        setCatalogs((prev)=>{
            if (prev.find((c)=>c.id === catalog.id)) return prev; // No duplicates
            return [
                ...prev,
                catalog
            ];
        });
    };
    const removeManifestCatalog = (id)=>{
        // Soft delete: set enabled=false and showInHome=false
        setCatalogs((prev)=>prev.map((c)=>c.id === id ? {
                    ...c,
                    enabled: false,
                    showInHome: false
                } : c));
    };
    const reorderManifestCatalogs = (newCatalogs)=>{
        setCatalogs(newCatalogs);
    };
    const removeCatalog = (id)=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["disableCatalog"])(id, prev));
    };
    const countReferences = (name, isMainGroup = false)=>{
        return isMainGroup ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["countMainGroupReferences"])(name, currentValues) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["countGroupReferences"])(name, currentValues);
    };
    const cleanupOrphans = ()=>{
        setCurrentValues((prev)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateAndFix"])(prev));
    };
    const resetAll = ()=>{
        if (originalConfig) {
            loadConfig(originalConfig, fileName);
        }
    };
    const unloadConfig = ()=>{
        setOriginalConfig(null);
        setCurrentValues({});
        setInitialValues({});
        setCatalogs([]);
        setFileName("omni-config.json");
    };
    const exportConfig = ()=>{
        if (!originalConfig) return null;
        // 1. Start with deep clone of current decoded values
        let clonedValues = JSON.parse(JSON.stringify(currentValues));
        // 2. Prune explicitly disabled keys (from GenericRenderer toggles)
        clonedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pruneDisabledKeys"])(clonedValues, disabledKeys);
        // 3. Prune disabled catalogs (remove from arrays and entries)
        // Only prune if it's completely inactive (both shelf and top row disabled)
        const deadCatalogs = new Set(catalogs.filter((c)=>c.enabled === false && c.showInHome !== true).map((c)=>c.id));
        clonedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pruneDisabledCatalogs"])(clonedValues, deadCatalogs);
        // 4. Validate, Fix and Reorder keys
        // This also MUST happen while decoded
        const validatedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateAndFix"])(clonedValues);
        // 5a. If manifest mode (config.catalogs[]) — real objects, not synthetic
        const finalResult = {
            ...originalConfig
        };
        const isSynthetic = catalogs.length > 0 && catalogs[0]?._synthetic === true;
        if (originalConfig.config && !isSynthetic && catalogs.length > 0) {
            // Manifest format: write catalogs back into config.catalogs[]
            const cleanCatalogs = catalogs.map((c)=>{
                const out = {
                    ...c
                };
                delete out._synthetic;
                return out;
            });
            // Also merge any side-array changes from currentValues (e.g. landscape_catalogs added by editor)
            // These live in currentValues but aren't catalog objects
            const sideArrayKeys = [
                'landscape_catalogs',
                'small_catalogs',
                'small_top_row_catalogs',
                'pinned_catalogs',
                'custom_catalog_names',
                'top_row_item_limits'
            ];
            const mergedConfig = {
                ...originalConfig.config || {}
            };
            for (const key of sideArrayKeys){
                if (currentValues[key] !== undefined) {
                    mergedConfig[key] = currentValues[key];
                }
            }
            finalResult.config = {
                ...mergedConfig,
                catalogs: cleanCatalogs
            };
            return finalResult;
        }
        // 5b. State format (or synthetic): encode values with updated state arrays
        // Sync the synthetic catalog state back to currentValues arrays before encoding
        let valuesToExport = {
            ...validatedValues
        };
        if (isSynthetic) {
            const activeIds = catalogs.map((c)=>c.id);
            const enabledIds = catalogs.filter((c)=>c.enabled !== false).map((c)=>c.id);
            const topRowIds = catalogs.filter((c)=>c.showInHome).map((c)=>c.id);
            const customNamesOut = {};
            const limitsOut = {};
            catalogs.forEach((c)=>{
                if (c.name && c.name !== c.id) customNamesOut[c.id] = c.name;
                if (c.metadata?.itemCount) limitsOut[c.id] = c.metadata.itemCount;
            });
            // Ensure selected_catalogs is always updated as it's the main reading source
            valuesToExport.selected_catalogs = enabledIds;
            // Also update catalog_ordering if the original config used it. It MUST contain all active catalogs (including hidden ones for top row)
            if (valuesToExport.catalog_ordering !== undefined) {
                valuesToExport.catalog_ordering = activeIds;
            }
            valuesToExport.top_row_catalogs = topRowIds;
            if (Object.keys(customNamesOut).length) valuesToExport.custom_catalog_names = {
                ...valuesToExport.custom_catalog_names || {},
                ...customNamesOut
            };
            if (Object.keys(limitsOut).length) valuesToExport.top_row_item_limits = limitsOut;
        }
        const originalValues = originalConfig.values || originalConfig.config || {};
        const encodedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeConfig"])(valuesToExport, originalValues, disabledKeys);
        if (originalConfig.values) {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        } else if (originalConfig.config) {
            finalResult.config = encodedValues;
        } else {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        }
        return finalResult;
    };
    const exportPartialConfig = (sectionKeys)=>{
        if (!originalConfig) return null;
        // Build a filtered values map containing only the specified section keys
        const filteredValues = {};
        for (const key of sectionKeys){
            if (currentValues[key] !== undefined) {
                filteredValues[key] = JSON.parse(JSON.stringify(currentValues[key]));
            }
        }
        // Also include main_group_order if exporting group keys
        if (sectionKeys.includes('main_catalog_groups') && currentValues.main_group_order) {
            filteredValues.main_group_order = JSON.parse(JSON.stringify(currentValues.main_group_order));
        }
        // Validate & fix the filtered subset
        const validatedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mutations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateAndFix"])(filteredValues);
        // Encode using the original values for format detection
        const originalValues = originalConfig.values || originalConfig.config || {};
        const encodedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeConfig"])(validatedValues, originalValues, disabledKeys);
        // Build the full config shell
        const finalResult = {
            ...originalConfig
        };
        if (originalConfig.values) {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        } else if (originalConfig.config) {
            // Preserve config structure but only with partial values
            finalResult.config = encodedValues;
        } else {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        }
        return finalResult;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfigContext.Provider, {
        value: {
            originalConfig,
            initialValues,
            currentValues,
            disabledKeys,
            disabledCatalogs,
            deletedSubgroups,
            deletedMainGroups,
            catalogs,
            fileName,
            isLoaded: !!originalConfig,
            loadConfig,
            updateValue,
            toggleKey,
            toggleCatalog,
            updateCatalogsOrder,
            updateCatalogField,
            addManifestCatalog,
            removeManifestCatalog,
            reorderManifestCatalogs,
            renameCatalogGroup,
            renameMainCatalogGroup,
            removeMainCatalogGroup,
            removeCatalogGroup,
            unassignCatalogGroup,
            assignCatalogGroup,
            addMainCatalogGroup,
            addCatalogGroup,
            importGroups: importGroupsToState,
            removeCatalog,
            countReferences,
            restoreSubgroup,
            restoreMainGroup,
            clearDeletedSubgroups,
            cleanupOrphans,
            resetAll,
            unloadConfig,
            exportConfig,
            exportPartialConfig,
            customFallbacks,
            setCustomFallbacks
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ConfigContext.tsx",
        lineNumber: 515,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useConfig = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ConfigContext);
    if (!context) throw new Error("useConfig must be used within ConfigProvider");
    return context;
};
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f3978990._.js.map
import { ensureCatalogPrefix, resolveCatalogName } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mutation layer edits arbitrary user-defined config trees.
type LooseAny = any;
type MutableState = Record<string, LooseAny>;

/**
 * Helper: counts how many places a string-keyed group name is referenced.
 */
export function countGroupReferences(name: string, state: MutableState): number {
    let count = 0;
    if (state.catalog_groups && state.catalog_groups[name]) count++;
    if (state.catalog_group_order && state.catalog_group_order.includes(name)) count++;
    if (state.catalog_group_image_urls && state.catalog_group_image_urls[name] !== undefined) count++;

    if (state.subgroup_order) {
        Object.values(state.subgroup_order as Record<string, unknown>).forEach((arr) => {
            if (Array.isArray(arr) && arr.includes(name)) count++;
        });
    }

    if (state.main_catalog_groups) {
        Object.values(state.main_catalog_groups as Record<string, unknown>).forEach((group) => {
            if (!group || typeof group !== "object") return;
            const subgroupNames = (group as { subgroupNames?: unknown }).subgroupNames;
            if (Array.isArray(subgroupNames) && subgroupNames.includes(name)) count++;
        });
    }

    return count;
}

/**
 * Helper: counts if a main group UUID exists in order arrays
 */
export function countMainGroupReferences(uuid: string, state: MutableState): number {
    let count = 0;
    if (state.main_catalog_groups && state.main_catalog_groups[uuid]) count++;
    if (state.main_group_order && state.main_group_order.includes(uuid)) count++;
    if (state.subgroup_order && state.subgroup_order[uuid]) count++;
    return count;
}

export function renameGroup(oldName: string, newName: string, state: MutableState): MutableState {
    if (oldName === newName) return state;

    // We do NOT mutate the original state, make a deep copy or do immutable updates
    const draft = JSON.parse(JSON.stringify(state));

    const mergeArrays = (arr1: string[] = [], arr2: string[] = []) => {
        return Array.from(new Set([...arr1, ...arr2])); // Quick unique merge
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
                draft.catalog_group_order = draft.catalog_group_order.filter((g: string) => g !== oldName);
            } else {
                draft.catalog_group_order[index] = newName;
            }
        }
    }

    // 3. Replace the old name in subgroup_order arrays
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach(mainGroupUUID => {
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                const index = arr.indexOf(oldName);
                if (index !== -1) {
                    if (arr.includes(newName)) {
                        draft.subgroup_order[mainGroupUUID] = arr.filter((s: string) => s !== oldName);
                    } else {
                        arr[index] = newName;
                    }
                }
            }
        });
    }

    // 4. Replace within main_catalog_groups[*].subgroupNames
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach(uuid => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                const index = group.subgroupNames.indexOf(oldName);
                if (index !== -1) {
                    if (group.subgroupNames.includes(newName)) {
                        group.subgroupNames = group.subgroupNames.filter((s: string) => s !== oldName);
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

export function renameMainGroup(uuid: string, newName: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    if (draft.main_catalog_groups && draft.main_catalog_groups[uuid]) {
        draft.main_catalog_groups[uuid].name = newName;
    }

    return draft;
}

/**
 * Removes a group entirely from all relational arrays and objects.
 */
/**
 * Unassigns a subgroup from all main groups without deleting its data from catalog_groups.
 */
export function unassignSubgroup(name: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach(mainGroupUUID => {
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s: string) => s !== name);
            }
        });
    }

    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach(uuid => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s: string) => s !== name);
            }
        });
    }

    return draft;
}

/**
 * Assigns a subgroup to a specific main group.
 */
export function assignSubgroup(name: string, targetMainGroupUuid: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    // First unassign it from any existing main groups to ensure it only lives in one place
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach(mainGroupUUID => {
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s: string) => s !== name);
            }
        });
    }

    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach(uuid => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s: string) => s !== name);
            }
        });
    }

    // Now assign to the new parent
    if (!draft.main_catalog_groups[targetMainGroupUuid]) {
        draft.main_catalog_groups[targetMainGroupUuid] = { name: "Unknown Group", subgroupNames: [] };
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

/**
 * Creates a new Main Group.
 */
export function createMainGroup(name: string, assignedSubgroups: string[], state: MutableState): MutableState {
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
    for (const sg of assignedSubgroups) {
        tempDraft = assignSubgroup(sg, newUuid, tempDraft);
    }

    return tempDraft;
}

/**
 * Creates a new Subgroup.
 */
export function createSubgroup(name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs: string[] = [], state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    if (!draft.catalog_groups) draft.catalog_groups = {};
    if (!draft.catalog_group_order) draft.catalog_group_order = [];
    if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};

    // Create the subgroup with the provided catalog list
    const normalizedCatalogs = initialCatalogs.map(id => ensureCatalogPrefix(id, resolveCatalogName(id, draft.custom_catalog_names || {})));
    draft.catalog_groups[name] = normalizedCatalogs;
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

export function disableGroup(name: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    if (draft.catalog_groups) {
        delete draft.catalog_groups[name];
    }

    if (Array.isArray(draft.catalog_group_order)) {
        draft.catalog_group_order = draft.catalog_group_order.filter((g: string) => g !== name);
    }

    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach(mainGroupUUID => {
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((s: string) => s !== name);
            }
            // If empty, we can optionally delete the uuid key from subgroup_order
            if (draft.subgroup_order[mainGroupUUID].length === 0) {
                delete draft.subgroup_order[mainGroupUUID];
            }
        });
    }

    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach(uuid => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((s: string) => s !== name);
            }
        });
    }

    if (draft.catalog_group_image_urls) {
        delete draft.catalog_group_image_urls[name];
    }

    return draft;
}

export function disableMainGroup(uuid: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    // 1. Remove from main_group_order
    if (Array.isArray(draft.main_group_order)) {
        draft.main_group_order = draft.main_group_order.filter((id: unknown) => id !== uuid);
    }

    // 2. Cascade delete subgroups
    const subgroupNames = (draft.main_catalog_groups?.[uuid]?.subgroupNames) || (draft.subgroup_order?.[uuid]) || [];
    if (Array.isArray(subgroupNames)) {
        subgroupNames.forEach((name: string) => {
            if (draft.catalog_groups) delete draft.catalog_groups[name];
            if (Array.isArray(draft.catalog_group_order)) {
                draft.catalog_group_order = draft.catalog_group_order.filter((g: unknown) => g !== name);
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


/**
 * Sweeps a catalog from every list in the config when disabled.
 */
export function disableCatalog(catalogId: string, state: MutableState): MutableState {
    const draft = JSON.parse(JSON.stringify(state));

    // Remove from catalog_groups lists
    if (draft.catalog_groups) {
        Object.keys(draft.catalog_groups).forEach(groupName => {
            const arr = draft.catalog_groups[groupName];
            if (Array.isArray(arr)) {
                draft.catalog_groups[groupName] = arr.filter((c: string) => c !== catalogId);
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

    commonLists.forEach(listName => {
        if (Array.isArray(draft[listName])) {
            draft[listName] = draft[listName].filter((c: string) => c !== catalogId);
        }
    });

    return draft;
}

/**
 * Dedupe & Validation Pass
 * Ensures arrays don't have dupes, and ordering arrays don't hold references to non-existent groups.
 */
export function validateAndFix(state: MutableState): MutableState {
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
    draft.catalog_group_order = Array.from(new Set(draft.catalog_group_order))
        .filter((g: unknown): g is string => typeof g === 'string' && validGroupNames.has(g));

    // Ensure every existing group appears
    validGroupNames.forEach(name => {
        if (!draft.catalog_group_order.includes(name)) {
            draft.catalog_group_order.push(name);
        }
    });

    // CRITICAL: Reorder the keys in catalog_groups and related objects to match catalog_group_order
    // This ensures that modern JSON stringifiers preserve the order requested by the user.
    if (draft.catalog_groups) {
        const orderedGroups: MutableState = {};
        draft.catalog_group_order.forEach((name: string) => {
            if (draft.catalog_groups[name]) {
                orderedGroups[name] = draft.catalog_groups[name];
            }
        });
        draft.catalog_groups = orderedGroups;
    }

    if (draft.catalog_group_image_urls) {
        const orderedUrls: MutableState = {};
        draft.catalog_group_order.forEach((name: string) => {
            if (draft.catalog_group_image_urls[name] !== undefined) {
                orderedUrls[name] = draft.catalog_group_image_urls[name];
            }
        });
        draft.catalog_group_image_urls = orderedUrls;
    }

    // Dedupe & Clean subgroup_order
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach(uuid => {
            let arr = draft.subgroup_order[uuid];
            if (Array.isArray(arr)) {
                arr = Array.from(new Set(arr)).filter(g => typeof g === 'string' && validGroupNames.has(g));
                draft.subgroup_order[uuid] = arr;

                if (arr.length === 0) {
                    delete draft.subgroup_order[uuid];
                }
            }
        });
    }

    // Clean main_catalog_groups references
    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach(uuid => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = Array.from(new Set(group.subgroupNames))
                    .filter((g: unknown): g is string => typeof g === 'string' && validGroupNames.has(g));
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

    commonLists.forEach(listName => {
        if (Array.isArray(draft[listName])) {
            draft[listName] = Array.from(new Set(draft[listName]));
        }
    });

    return draft;
}

export function importGroups(
    payload: {
        mainGroups: Record<string, LooseAny>;
        subgroups: Record<string, { catalogs: string[], imageUrl?: string }>;
        standaloneAssignments: Record<string, string>;
        metadata?: {
            custom_catalog_names?: Record<string, string>;
            regex_pattern_image_urls?: Record<string, string>;
            enabled_patterns?: string[];
        };
        globalSettings?: Record<string, LooseAny>;
    },
    state: MutableState
): MutableState {
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
    const existingMgByName: Record<string, string> = {};
    Object.entries(draft.main_catalog_groups as Record<string, unknown>).forEach(([uid, mg]) => {
        if (!mg || typeof mg !== "object") return;
        const maybeName = (mg as { name?: unknown }).name;
        if (typeof maybeName === "string" && maybeName) {
            existingMgByName[maybeName] = uid;
        }
    });

    // 1. Import Main Groups
    Object.keys(payload.mainGroups).forEach(uuid => {
        const mg = payload.mainGroups[uuid];
        const incomingSubgroups = [...(mg.subgroupNames || [])];

        // If a group with the same NAME already exists, update its subgroup links
        // instead of creating a brand-new duplicate entry
        const existingUuid = existingMgByName[mg.name];
        if (existingUuid) {
            // Merge subgroup names into the existing group
            if (!draft.main_catalog_groups[existingUuid].subgroupNames) {
                draft.main_catalog_groups[existingUuid].subgroupNames = [];
            }
            incomingSubgroups.forEach(sgName => {
                if (!draft.main_catalog_groups[existingUuid].subgroupNames.includes(sgName)) {
                    draft.main_catalog_groups[existingUuid].subgroupNames.push(sgName);
                }
            });

            // Rebuild subgroup_order for the existing group (replace + merge)
            if (!draft.subgroup_order[existingUuid]) draft.subgroup_order[existingUuid] = [];
            incomingSubgroups.forEach(sgName => {
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
    Object.keys(payload.subgroups).forEach(name => {
        const sg = payload.subgroups[name];

        // Always ensure the catalog entry exists (create or update)
        const normalized = (sg.catalogs || []).map((id: string) => ensureCatalogPrefix(id, resolveCatalogName(id, draft.custom_catalog_names || {})));
        draft.catalog_groups[name] = normalized;

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
            const lists = ["auto_play_enabled_patterns", "pattern_tag_enabled_patterns"];
            lists.forEach(list => {
                if (!Array.isArray(draft[list])) draft[list] = [];
                meta.enabled_patterns!.forEach(p => {
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
/**
 * Finds all unique catalog IDs in the config from all known sources.
 */
export function getAllCatalogIds(state: MutableState): Set<string> {
    const ids = new Set<string>();

    const addIds = (source: unknown) => {
        if (!source) return;
        if (Array.isArray(source)) {
            source.forEach(id => { if (typeof id === 'string') ids.add(id); });
        } else if (typeof source === 'object') {
            Object.values(source).forEach(val => {
                if (typeof val === 'string') ids.add(val);
                else if (Array.isArray(val)) val.forEach(id => { if (typeof id === 'string') ids.add(id); });
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
    commonLists.forEach(list => addIds(state[list]));

    // 2. Complex structures
    addIds(state.catalog_ordering);
    if (state.catalog_groups) {
        Object.values(state.catalog_groups).forEach(arr => addIds(arr));
    }

    // 3. Known names (even if not in any list)
    if (state.custom_catalog_names) {
        Object.keys(state.custom_catalog_names).forEach(id => {
            if (!id.startsWith("_")) ids.add(id);
        });
    }

    return ids;
}
/**
 * Generates the final catalog_group_order based on main group configuration.
 */
export function reorderCatalogGroupOrder(state: MutableState): string[] {
    const mainGroupOrder = state.main_group_order || [];
    const mainGroups = state.main_catalog_groups || {};
    const catalogGroups = state.catalog_groups || {};

    const finalOrder: string[] = [];
    const seen = new Set<string>();

    mainGroupOrder.forEach((uuid: string) => {
        const mg = mainGroups[uuid];
        if (!mg) return;

        const mainGroupName = (mg.name || "").trim();
        if (!mainGroupName) return;

        // Try both variations of the emoji: ❗️ (U+2757 FE0F) and ❗ (U+2757)
        const placeholders = [
            `❗️[${mainGroupName}]`,
            `❗[${mainGroupName}]`
        ];

        // 1. Add the first placeholder variant that exists in catalogGroups
        for (const pName of placeholders) {
            if (catalogGroups[pName] && !seen.has(pName)) {
                finalOrder.push(pName);
                seen.add(pName);
                break;
            }
        }

        // 2. Real subgroups (sorted A-Z)
        const subgroups = Array.isArray(mg.subgroupNames) ? [...mg.subgroupNames] : [];
        subgroups.sort((a, b) => a.localeCompare(b));

        subgroups.forEach(sgName => {
            const trimmedSgName = sgName.trim();
            // Don't add if it's any of our possible placeholders
            if (!placeholders.includes(trimmedSgName) && catalogGroups[trimmedSgName] && !seen.has(trimmedSgName)) {
                finalOrder.push(trimmedSgName);
                seen.add(trimmedSgName);
            }
        });
    });

    // 3. Catch-all for any orphaned subgroups that aren't in any main group but exist in data
    Object.keys(catalogGroups).forEach(name => {
        if (!seen.has(name)) {
            finalOrder.push(name);
            seen.add(name);
        }
    });

    return finalOrder;
}

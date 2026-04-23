import { produce } from "immer";
import { ensureCatalogPrefix, resolveCatalogName } from "./utils";
import { normalizeMainGroupOrder, normalizeSubgroupNames } from "./main-group-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mutation layer edits arbitrary user-defined config trees.
type LooseAny = any;
type MutableState = Record<string, LooseAny>;

const COMMON_CATALOG_LISTS = [
    "selected_catalogs",
    "pinned_catalogs",
    "small_catalogs",
    "top_row_catalogs",
    "starred_catalogs",
    "randomized_catalogs",
    "small_toprow_catalogs",
    "catalog_ordering",
] as const;

const ensureObject = (value: unknown): MutableState =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as MutableState) : {};

const uniqueMerge = (left: string[] = [], right: string[] = []) => Array.from(new Set([...left, ...right]));

const mutateUnassignSubgroup = (draft: MutableState, name: string) => {
    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID) => {
            const arr = draft.subgroup_order[mainGroupUUID];
            if (Array.isArray(arr)) {
                draft.subgroup_order[mainGroupUUID] = arr.filter((subgroupName: string) => subgroupName !== name);
            }
        });
    }

    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid) => {
            const group = draft.main_catalog_groups[uuid];
            if (group && Array.isArray(group.subgroupNames)) {
                group.subgroupNames = group.subgroupNames.filter((subgroupName: string) => subgroupName !== name);
            }
        });
    }
};

const mutateAssignSubgroup = (draft: MutableState, name: string, targetMainGroupUuid: string) => {
    mutateUnassignSubgroup(draft, name);

    if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
    if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
        draft.subgroup_order = {};
    }

    if (!draft.main_catalog_groups[targetMainGroupUuid]) {
        draft.main_catalog_groups[targetMainGroupUuid] = { name: "Unknown Group", subgroupNames: [] };
    }

    const targetGroup = draft.main_catalog_groups[targetMainGroupUuid];
    if (!Array.isArray(targetGroup.subgroupNames)) {
        targetGroup.subgroupNames = [];
    }
    if (!targetGroup.subgroupNames.includes(name)) {
        targetGroup.subgroupNames.push(name);
    }

    if (!Array.isArray(draft.subgroup_order[targetMainGroupUuid])) {
        draft.subgroup_order[targetMainGroupUuid] = [];
    }
    if (!draft.subgroup_order[targetMainGroupUuid].includes(name)) {
        draft.subgroup_order[targetMainGroupUuid].push(name);
    }
};

const buildMainGroupSignature = (
    group: { posterType?: unknown; posterSize?: unknown; subgroupNames?: unknown },
    catalogGroups: Record<string, unknown>
) => {
    const subgroupNames = normalizeSubgroupNames(
        group.subgroupNames,
        undefined,
        new Set(Object.keys(catalogGroups))
    );

    return JSON.stringify({
        posterType: typeof group.posterType === "string" ? group.posterType : "",
        posterSize: typeof group.posterSize === "string" ? group.posterSize : "",
        subgroupSignatures: subgroupNames
            .map((subgroupName) => JSON.stringify((Array.isArray(catalogGroups[subgroupName]) ? catalogGroups[subgroupName] : []).filter((catalogId): catalogId is string => typeof catalogId === "string").slice().sort((left, right) => left.localeCompare(right))))
            .sort((left, right) => left.localeCompare(right)),
    });
};

const updateMainGroupLayout = (group: MutableState[string], incomingMainGroup: { name?: string; posterType?: string; posterSize?: string }) => {
    if (!group || typeof group !== "object") return;

    if (incomingMainGroup.name !== undefined && group.name !== incomingMainGroup.name) {
        group.name = incomingMainGroup.name;
    }
    if (incomingMainGroup.posterType !== undefined) {
        group.posterType = incomingMainGroup.posterType;
    }
    if (incomingMainGroup.posterSize !== undefined) {
        group.posterSize = incomingMainGroup.posterSize;
    }
};

const updateExistingMainGroupByUuid = (
    draft: MutableState,
    existingUuid: string,
    incomingMainGroup: { name?: string; posterType?: string; posterSize?: string }
) => {
    updateMainGroupLayout(draft.main_catalog_groups[existingUuid], incomingMainGroup);
};

const updateExistingMainGroupByName = (
    draft: MutableState,
    existingUuid: string,
    incomingMainGroup: { posterType?: string; posterSize?: string },
    incomingSubgroups: string[]
) => {
    if (incomingMainGroup.posterType) {
        draft.main_catalog_groups[existingUuid].posterType = incomingMainGroup.posterType;
    }
    if (incomingMainGroup.posterSize) {
        draft.main_catalog_groups[existingUuid].posterSize = incomingMainGroup.posterSize;
    }

    incomingSubgroups.forEach((subgroupName) => {
        mutateAssignSubgroup(draft, subgroupName, existingUuid);
    });
};

const mutateRenameGroup = (draft: MutableState, oldName: string, newName: string) => {
    if (oldName === newName) return;

    if (draft.catalog_groups?.[oldName]) {
        const oldItems = draft.catalog_groups[oldName] || [];
        if (draft.catalog_groups[newName]) {
            draft.catalog_groups[newName] = uniqueMerge(draft.catalog_groups[newName], oldItems);
        } else {
            draft.catalog_groups[newName] = oldItems;
        }
        delete draft.catalog_groups[oldName];
    }

    if (Array.isArray(draft.catalog_group_order)) {
        const index = draft.catalog_group_order.indexOf(oldName);
        if (index !== -1) {
            if (draft.catalog_group_order.includes(newName)) {
                draft.catalog_group_order = draft.catalog_group_order.filter((groupName: string) => groupName !== oldName);
            } else {
                draft.catalog_group_order[index] = newName;
            }
        }
    }

    if (draft.subgroup_order) {
        Object.keys(draft.subgroup_order).forEach((mainGroupUUID) => {
            const subgroupNames = draft.subgroup_order[mainGroupUUID];
            if (!Array.isArray(subgroupNames)) return;
            const index = subgroupNames.indexOf(oldName);
            if (index === -1) return;

            if (subgroupNames.includes(newName)) {
                draft.subgroup_order[mainGroupUUID] = subgroupNames.filter((subgroupName: string) => subgroupName !== oldName);
            } else {
                subgroupNames[index] = newName;
            }
        });
    }

    if (draft.main_catalog_groups) {
        Object.keys(draft.main_catalog_groups).forEach((uuid) => {
            const group = draft.main_catalog_groups[uuid];
            if (!group || !Array.isArray(group.subgroupNames)) return;
            const index = group.subgroupNames.indexOf(oldName);
            if (index === -1) return;

            if (group.subgroupNames.includes(newName)) {
                group.subgroupNames = group.subgroupNames.filter((subgroupName: string) => subgroupName !== oldName);
            } else {
                group.subgroupNames[index] = newName;
            }
        });
    }

    if (draft.catalog_group_image_urls?.[oldName] !== undefined) {
        if (draft.catalog_group_image_urls[newName] === undefined) {
            draft.catalog_group_image_urls[newName] = draft.catalog_group_image_urls[oldName];
        }
        delete draft.catalog_group_image_urls[oldName];
    }
};

const mutateRemoveCatalogIdFromLists = (draft: MutableState, matcher: (catalogId: string) => boolean) => {
    if (draft.catalog_groups) {
        Object.keys(draft.catalog_groups).forEach((groupName) => {
            const catalogIds = draft.catalog_groups[groupName];
            if (Array.isArray(catalogIds)) {
                draft.catalog_groups[groupName] = catalogIds.filter((catalogId: string) => !matcher(catalogId));
            }
        });
    }

    COMMON_CATALOG_LISTS.forEach((listName) => {
        if (Array.isArray(draft[listName])) {
            draft[listName] = draft[listName].filter((catalogId: string) => !matcher(catalogId));
        }
    });
};

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

    return produce(state, (draft) => {
        mutateRenameGroup(draft, oldName, newName);
    });
}

export function renameMainGroup(uuid: string, newName: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        if (draft.main_catalog_groups?.[uuid]) {
            draft.main_catalog_groups[uuid].name = newName;
        }
    });
}

/**
 * Unassigns a subgroup from all main groups without deleting its data from catalog_groups.
 */
export function unassignSubgroup(name: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        mutateUnassignSubgroup(draft, name);
    });
}

/**
 * Assigns a subgroup to a specific main group.
 */
export function assignSubgroup(name: string, targetMainGroupUuid: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        mutateAssignSubgroup(draft, name, targetMainGroupUuid);
    });
}

/**
 * Creates a new Main Group.
 */
export function createMainGroup(name: string, assignedSubgroups: string[], state: MutableState): MutableState {
    return produce(state, (draft) => {
        const newUuid = crypto.randomUUID();

        if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
        if (!Array.isArray(draft.main_group_order)) draft.main_group_order = [];
        if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
            draft.subgroup_order = {};
        }

        draft.main_catalog_groups[newUuid] = {
            name,
            subgroupNames: [],
            posterSize: "Default",
            posterType: "Square",
        };
        draft.main_group_order.push(newUuid);

        assignedSubgroups.forEach((subgroupName) => {
            mutateAssignSubgroup(draft, subgroupName, newUuid);
        });
    });
}

/**
 * Creates a new Subgroup.
 */
export function createSubgroup(name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs: string[] = [], state: MutableState): MutableState {
    return produce(state, (draft) => {
        if (!draft.catalog_groups) draft.catalog_groups = {};
        if (!Array.isArray(draft.catalog_group_order)) draft.catalog_group_order = [];
        if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};

        const customNames = ensureObject(draft.custom_catalog_names);
        draft.catalog_groups[name] = initialCatalogs.map((id) => ensureCatalogPrefix(id, resolveCatalogName(id, customNames as Record<string, string>)));
        if (!draft.catalog_group_order.includes(name)) {
            draft.catalog_group_order.push(name);
        }

        if (imageUrl) {
            draft.catalog_group_image_urls[name] = imageUrl;
        }

        if (targetMainGroupUuid) {
            mutateAssignSubgroup(draft, name, targetMainGroupUuid);
        }
    });
}

export function disableGroup(name: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        if (draft.catalog_groups) {
            delete draft.catalog_groups[name];
        }

        if (Array.isArray(draft.catalog_group_order)) {
            draft.catalog_group_order = draft.catalog_group_order.filter((groupName: string) => groupName !== name);
        }

        if (draft.subgroup_order) {
            Object.keys(draft.subgroup_order).forEach((mainGroupUUID) => {
                const subgroupNames = draft.subgroup_order[mainGroupUUID];
                if (Array.isArray(subgroupNames)) {
                    draft.subgroup_order[mainGroupUUID] = subgroupNames.filter((subgroupName: string) => subgroupName !== name);
                }
                if (Array.isArray(draft.subgroup_order[mainGroupUUID]) && draft.subgroup_order[mainGroupUUID].length === 0) {
                    delete draft.subgroup_order[mainGroupUUID];
                }
            });
        }

        if (draft.main_catalog_groups) {
            Object.keys(draft.main_catalog_groups).forEach((uuid) => {
                const group = draft.main_catalog_groups[uuid];
                if (group && Array.isArray(group.subgroupNames)) {
                    group.subgroupNames = group.subgroupNames.filter((subgroupName: string) => subgroupName !== name);
                }
            });
        }

        if (draft.catalog_group_image_urls) {
            delete draft.catalog_group_image_urls[name];
        }
    });
}

export function disableMainGroup(uuid: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        if (Array.isArray(draft.main_group_order)) {
            draft.main_group_order = draft.main_group_order.filter((groupId: unknown) => groupId !== uuid);
        }

        const subgroupNames = (draft.main_catalog_groups?.[uuid]?.subgroupNames) || (draft.subgroup_order?.[uuid]) || [];
        if (Array.isArray(subgroupNames)) {
            subgroupNames.forEach((name: string) => {
                if (draft.catalog_groups) delete draft.catalog_groups[name];
                if (Array.isArray(draft.catalog_group_order)) {
                    draft.catalog_group_order = draft.catalog_group_order.filter((groupName: unknown) => groupName !== name);
                }
                if (draft.catalog_group_image_urls) delete draft.catalog_group_image_urls[name];
            });
        }

        if (draft.main_catalog_groups) {
            delete draft.main_catalog_groups[uuid];
        }
        if (draft.subgroup_order) {
            delete draft.subgroup_order[uuid];
        }
    });
}

/**
 * Sweeps a catalog from every list in the config when disabled.
 */
export function disableCatalog(catalogId: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        mutateRemoveCatalogIdFromLists(draft, (candidateId) => candidateId === catalogId);
    });
}

/**
 * Removes a catalog from catalog-manager-owned arrays while preserving subgroup links.
 */
export function pruneCatalogFromManager(catalogId: string, state: MutableState): MutableState {
    return produce(state, (draft) => {
        COMMON_CATALOG_LISTS.forEach((listName) => {
            if (Array.isArray(draft[listName])) {
                draft[listName] = draft[listName].filter((candidateId: string) => candidateId !== catalogId);
            }
        });
    });
}

/**
 * Dedupe & Validation Pass
 * Ensures arrays don't have dupes, and ordering arrays don't hold references to non-existent groups.
 */
export function validateAndFix(state: MutableState): MutableState {
    return produce(state, (draft) => {
        const validGroupNames = new Set(Object.keys(ensureObject(draft.catalog_groups)));
        const validMainGroupIds = new Set(Object.keys(ensureObject(draft.main_catalog_groups)));

        if (draft.main_catalog_groups || draft.main_group_order !== undefined) {
            draft.main_group_order = normalizeMainGroupOrder(
                ensureObject(draft.main_catalog_groups) as Record<string, unknown>,
                draft.main_group_order
            ).filter((uuid: string) => validMainGroupIds.has(uuid));
        }

        if (draft.catalog_group_order !== undefined) {
            if (!Array.isArray(draft.catalog_group_order)) {
                draft.catalog_group_order = [];
            }

            if (draft.catalog_group_order.length === 1 && draft.catalog_group_order[0] === "_data") {
                draft.catalog_group_order = [];
            }

            draft.catalog_group_order = Array.from(new Set(draft.catalog_group_order))
                .filter((groupName: unknown): groupName is string => typeof groupName === "string" && validGroupNames.has(groupName));

            validGroupNames.forEach((name) => {
                if (!draft.catalog_group_order.includes(name)) {
                    draft.catalog_group_order.push(name);
                }
            });
        }

        if (draft.catalog_groups && Array.isArray(draft.catalog_group_order)) {
            const orderedGroups: MutableState = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_groups[name]) {
                    orderedGroups[name] = draft.catalog_groups[name];
                }
            });
            draft.catalog_groups = orderedGroups;
        }

        if (draft.catalog_group_image_urls && Array.isArray(draft.catalog_group_order)) {
            const orderedUrls: MutableState = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_group_image_urls[name] !== undefined) {
                    orderedUrls[name] = draft.catalog_group_image_urls[name];
                }
            });
            draft.catalog_group_image_urls = orderedUrls;
        }

        if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
            draft.subgroup_order = {};
        }

        Object.keys(draft.subgroup_order).forEach((uuid) => {
            if (!validMainGroupIds.has(uuid)) {
                delete draft.subgroup_order[uuid];
            }
        });

        if (draft.main_catalog_groups) {
            Object.keys(draft.main_catalog_groups).forEach((uuid) => {
                const group = draft.main_catalog_groups[uuid];
                if (!group || typeof group !== "object") return;

                const canonicalSubgroups = normalizeSubgroupNames(
                    group.subgroupNames,
                    draft.subgroup_order[uuid],
                    validGroupNames
                );

                group.subgroupNames = canonicalSubgroups;

                if (canonicalSubgroups.length > 0) {
                    draft.subgroup_order[uuid] = canonicalSubgroups;
                } else {
                    delete draft.subgroup_order[uuid];
                }
            });
        }

        COMMON_CATALOG_LISTS.forEach((listName) => {
            if (Array.isArray(draft[listName])) {
                draft[listName] = Array.from(new Set(draft[listName]));
            }
        });

        const shelfKeys = ["shelf_order", "disabled_shelves", "stream_button_elements_order", "hidden_stream_button_elements"];
        shelfKeys.forEach((key) => {
            if (draft[key] === undefined) return;
            if (!Array.isArray(draft[key])) {
                draft[key] = [];
            }
            draft[key] = Array.from(new Set(draft[key].filter((entry: unknown) => typeof entry === "string")));
        });
    });
}

/**
 * Reorders shelves based on a new order array.
 */
export function reorderShelves(newOrder: string[], state: MutableState): MutableState {
    return produce(state, (draft) => {
        draft.shelf_order = newOrder;
    });
}

export function reorderStreamElements(newOrder: string[], state: MutableState): MutableState {
    return produce(state, (draft) => {
        draft.stream_button_elements_order = newOrder;
    });
}

/**
 * Toggles a shelf's enabled/disabled status.
 */
export function toggleShelf(shelfName: string, isEnabled: boolean, state: MutableState): MutableState {
    return produce(state, (draft) => {
        const disabled = new Set(draft.disabled_shelves || []);
        if (isEnabled) {
            disabled.delete(shelfName);
        } else {
            disabled.add(shelfName);
        }
        draft.disabled_shelves = Array.from(disabled);
    });
}

export function toggleStreamElement(elementName: string, isVisible: boolean, state: MutableState): MutableState {
    return produce(state, (draft) => {
        const hidden = new Set(draft.hidden_stream_button_elements || []);
        if (isVisible) {
            hidden.delete(elementName);
        } else {
            hidden.add(elementName);
        }
        draft.hidden_stream_button_elements = Array.from(hidden);
    });
}

export function importGroups(
    payload: {
        mainGroups: Record<string, LooseAny>;
        subgroups: Record<string, { catalogs?: string[]; imageUrl?: string; renameFrom?: string; overwriteCatalogs?: boolean; overwriteImage?: boolean }>;
        standaloneAssignments: Record<string, string | null>;
        metadata?: {
            custom_catalog_names?: Record<string, string>;
            regex_pattern_image_urls?: Record<string, string>;
            enabled_patterns?: string[];
        };
        globalSettings?: Record<string, LooseAny>;
    },
    state: MutableState
): MutableState {
    const imported = produce(state, (draft) => {
        if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
        if (!Array.isArray(draft.main_group_order)) draft.main_group_order = [];
        if (!draft.catalog_groups) draft.catalog_groups = {};
        if (!Array.isArray(draft.catalog_group_order)) draft.catalog_group_order = [];
        if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
        if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
            draft.subgroup_order = {};
        }

        Object.entries(payload.subgroups).forEach(([incomingName, subgroup]) => {
            const previousName = subgroup.renameFrom;
            if (!previousName || previousName === incomingName) return;
            if (!Object.prototype.hasOwnProperty.call(draft.catalog_groups, previousName)) return;
            mutateRenameGroup(draft, previousName, incomingName);
        });

        const incomingCatalogGroups = Object.fromEntries(
            Object.entries(payload.subgroups).map(([name, subgroup]) => [
                name,
                subgroup.catalogs || [],
            ])
        );

        const existingMgByUuid: Record<string, string> = {};
        const existingMgByName: Record<string, string> = {};
        const existingMgBySignature: Record<string, string[]> = {};
        Object.entries(draft.main_catalog_groups as Record<string, unknown>).forEach(([uid, mainGroup]) => {
            if (!mainGroup || typeof mainGroup !== "object") return;
            existingMgByUuid[uid] = uid;
            const maybeName = (mainGroup as { name?: unknown }).name;
            if (typeof maybeName === "string" && maybeName) {
                existingMgByName[maybeName] = uid;
            }
            const signature = buildMainGroupSignature(mainGroup as { posterType?: unknown; posterSize?: unknown; subgroupNames?: unknown }, draft.catalog_groups || {});
            if (!existingMgBySignature[signature]) {
                existingMgBySignature[signature] = [];
            }
            existingMgBySignature[signature].push(uid);
        });
        const resolvedMainGroupUuids: Record<string, string> = {};
        const usedExistingMainGroupUuids = new Set<string>();

        Object.keys(payload.mainGroups).forEach((uuid) => {
            const incomingMainGroup = payload.mainGroups[uuid];
            const incomingSubgroups = [...(incomingMainGroup.subgroupNames || [])];
            const existingUuidById = existingMgByUuid[uuid];
            const incomingSignature = buildMainGroupSignature(incomingMainGroup, incomingCatalogGroups);
            const existingUuidBySignature = (existingMgBySignature[incomingSignature] || []).find((candidateUuid) => !usedExistingMainGroupUuids.has(candidateUuid));
            const existingUuidByName = existingMgByName[incomingMainGroup.name];
            const existingUuid = existingUuidById || existingUuidBySignature || existingUuidByName;

            if (existingUuidById) {
                resolvedMainGroupUuids[uuid] = existingUuid;
                usedExistingMainGroupUuids.add(existingUuid);
                updateExistingMainGroupByUuid(draft, existingUuid, incomingMainGroup);
                return;
            }

            if (existingUuidBySignature) {
                resolvedMainGroupUuids[uuid] = existingUuidBySignature;
                usedExistingMainGroupUuids.add(existingUuidBySignature);
                updateExistingMainGroupByUuid(draft, existingUuidBySignature, incomingMainGroup);
                return;
            }

            if (existingUuidByName) {
                resolvedMainGroupUuids[uuid] = existingUuidByName;
                usedExistingMainGroupUuids.add(existingUuidByName);
                updateExistingMainGroupByName(draft, existingUuidByName, incomingMainGroup, incomingSubgroups);
                return;
            }

            let targetUuid = uuid;
            if (draft.main_catalog_groups[targetUuid]) {
                targetUuid = crypto.randomUUID();
            }

            draft.main_catalog_groups[targetUuid] = {
                name: incomingMainGroup.name,
                subgroupNames: [],
                posterType: incomingMainGroup.posterType,
                posterSize: incomingMainGroup.posterSize,
            };
            draft.main_group_order.push(targetUuid);
            draft.subgroup_order[targetUuid] = [];
            resolvedMainGroupUuids[uuid] = targetUuid;

            incomingSubgroups.forEach((subgroupName) => {
                mutateAssignSubgroup(draft, subgroupName, targetUuid);
            });
        });

        Object.keys(payload.subgroups).forEach((name) => {
            const subgroup = payload.subgroups[name];
            const subgroupAlreadyExists = Object.prototype.hasOwnProperty.call(draft.catalog_groups, name);
            const shouldWriteCatalogs = subgroup.overwriteCatalogs === true || !subgroupAlreadyExists;
            const shouldWriteImage = (subgroup.overwriteImage === true || !subgroupAlreadyExists) && !!subgroup.imageUrl;

            if (shouldWriteCatalogs) {
                const customNames = ensureObject(draft.custom_catalog_names) as Record<string, string>;
                draft.catalog_groups[name] = (subgroup.catalogs || []).map((id: string) =>
                    ensureCatalogPrefix(id, resolveCatalogName(id, customNames))
                );
            }

            if (!draft.catalog_group_order.includes(name)) {
                draft.catalog_group_order.push(name);
            }

            if (shouldWriteImage) {
                draft.catalog_group_image_urls[name] = subgroup.imageUrl;
            }

            if (Object.prototype.hasOwnProperty.call(payload.standaloneAssignments, name)) {
                const rawTargetMainUuid = payload.standaloneAssignments[name];

                if (rawTargetMainUuid === null) {
                    mutateUnassignSubgroup(draft, name);
                    return;
                }

                const resolvedTargetMainUuid = resolvedMainGroupUuids[rawTargetMainUuid] || rawTargetMainUuid;
                if (resolvedTargetMainUuid && draft.main_catalog_groups[resolvedTargetMainUuid]) {
                    mutateAssignSubgroup(draft, name, resolvedTargetMainUuid);
                }
            }
        });

        if (payload.metadata) {
            const metadata = payload.metadata;

            if (metadata.custom_catalog_names) {
                if (!draft.custom_catalog_names) draft.custom_catalog_names = {};
                Object.assign(draft.custom_catalog_names, metadata.custom_catalog_names);
            }

            if (metadata.regex_pattern_image_urls) {
                if (!draft.regex_pattern_image_urls) draft.regex_pattern_image_urls = {};
                Object.assign(draft.regex_pattern_image_urls, metadata.regex_pattern_image_urls);
            }

            if (Array.isArray(metadata.enabled_patterns)) {
                ["auto_play_enabled_patterns", "pattern_tag_enabled_patterns"].forEach((listName) => {
                    if (!Array.isArray(draft[listName])) draft[listName] = [];
                    metadata.enabled_patterns?.forEach((pattern) => {
                        if (!draft[listName].includes(pattern)) {
                            draft[listName].push(pattern);
                        }
                    });
                });
            }
        }

        if (payload.globalSettings) {
            Object.assign(draft, payload.globalSettings);
        }
    });

    return validateAndFix(imported);
}

/**
 * Finds all unique catalog IDs in the config from all known sources.
 */
export function getAllCatalogIds(state: MutableState): Set<string> {
    const ids = new Set<string>();

    const addIds = (source: unknown) => {
        if (!source) return;
        if (Array.isArray(source)) {
            source.forEach((id) => { if (typeof id === "string") ids.add(id); });
        } else if (typeof source === "object") {
            Object.values(source).forEach((value) => {
                if (typeof value === "string") ids.add(value);
                else if (Array.isArray(value)) value.forEach((id) => { if (typeof id === "string") ids.add(id); });
            });
        }
    };

    [
        "selected_catalogs",
        "pinned_catalogs",
        "small_catalogs",
        "top_row_catalogs",
        "starred_catalogs",
        "randomized_catalogs",
        "small_toprow_catalogs",
    ].forEach((listName) => addIds(state[listName]));

    addIds(state.catalog_ordering);
    if (state.catalog_groups) {
        Object.values(state.catalog_groups).forEach((catalogIds) => addIds(catalogIds));
    }

    if (state.custom_catalog_names) {
        Object.keys(state.custom_catalog_names).forEach((id) => {
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
        const mainGroup = mainGroups[uuid];
        if (!mainGroup) return;

        const mainGroupName = (mainGroup.name || "").trim();
        if (!mainGroupName) return;

        const placeholders = [
            `❗️[${mainGroupName}]`,
            `❗[${mainGroupName}]`,
        ];

        for (const placeholderName of placeholders) {
            if (catalogGroups[placeholderName] && !seen.has(placeholderName)) {
                finalOrder.push(placeholderName);
                seen.add(placeholderName);
                break;
            }
        }

        const subgroupNames = Array.isArray(mainGroup.subgroupNames) ? [...mainGroup.subgroupNames] : [];
        subgroupNames.sort((left, right) => left.localeCompare(right));

        subgroupNames.forEach((subgroupName) => {
            const trimmedSubgroupName = subgroupName.trim();
            if (!placeholders.includes(trimmedSubgroupName) && catalogGroups[trimmedSubgroupName] && !seen.has(trimmedSubgroupName)) {
                finalOrder.push(trimmedSubgroupName);
                seen.add(trimmedSubgroupName);
            }
        });
    });

    Object.keys(catalogGroups).forEach((name) => {
        if (!seen.has(name)) {
            finalOrder.push(name);
            seen.add(name);
        }
    });

    return finalOrder;
}

/**
 * Bulk version of disableCatalog for efficiency.
 */
export function bulkDisableCatalogs(catalogIds: string[], state: MutableState): MutableState {
    const idsToPrune = new Set(catalogIds);
    return produce(state, (draft) => {
        mutateRemoveCatalogIdFromLists(draft, (candidateId) => idsToPrune.has(candidateId));
    });
}

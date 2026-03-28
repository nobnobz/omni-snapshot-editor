import { produce } from "immer";
import { encodeConfig, pruneDisabledCatalogs, pruneDisabledKeys } from "./config-utils";
import { MDBLIST_SETTINGS_KEYS, normalizeMdblistSettings } from "./mdblist-ratings";
import { reorderCatalogGroupOrder, validateAndFix } from "./mutations";
import { OmniConfig } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- export logic serializes user-defined config objects.
type LooseAny = any;
type ConfigValues = Record<string, LooseAny>;

type ManifestCatalog = {
    id: string;
    enabled?: boolean;
    showInHome?: boolean;
    metadata?: { itemCount?: number; [key: string]: LooseAny };
    _synthetic?: boolean;
    [key: string]: LooseAny;
};

type ExportableConfig = OmniConfig & {
    values?: ConfigValues;
    config?: ConfigValues;
    includedKeys?: string[];
    catalogs?: ManifestCatalog[];
};

type BuildExportConfigArgs = {
    originalConfig: OmniConfig;
    currentValues: ConfigValues;
    initialValues: ConfigValues;
    disabledKeys: Set<string>;
    catalogs: ManifestCatalog[];
    isSyntheticSession: boolean;
};

type BuildPartialExportConfigArgs = {
    originalConfig: OmniConfig;
    currentValues: ConfigValues;
    disabledKeys: Set<string>;
    sectionKeys: string[];
    catalogs: ManifestCatalog[];
};

const OMITTED_LEGACY_CATALOG_GROUP_NAMES = new Set([
    "❗️[Awards]",
    "❗[Awards]",
]);

export const CATALOG_RELATED_EXPORT_KEYS = [
    "selected_catalogs",
    "pinned_catalogs",
    "small_catalogs",
    "top_row_catalogs",
    "starred_catalogs",
    "randomized_catalogs",
    "small_toprow_catalogs",
    "catalog_ordering",
    "custom_catalog_names",
    "landscape_catalogs",
    "top_row_item_limits",
] as const;

const hasMdblistSectionKeys = (sectionKeys: readonly string[]) =>
    sectionKeys.some((key) => MDBLIST_SETTINGS_KEYS.includes(key as typeof MDBLIST_SETTINGS_KEYS[number]));

const sanitizeDisabledKeys = (disabledKeys: Set<string>) =>
    new Set(
        Array.from(disabledKeys).filter(
            (key) => !MDBLIST_SETTINGS_KEYS.includes(key as typeof MDBLIST_SETTINGS_KEYS[number])
        )
    );

const getExplicitSelectedCatalogs = (catalogs: ManifestCatalog[]): string[] => {
    let enabledIds = catalogs.filter(c => c.enabled !== false).map(c => c.id);

    if (enabledIds.length > 1 && enabledIds.includes("omni_empty_setup_placeholder")) {
        enabledIds = enabledIds.filter(id => id !== "omni_empty_setup_placeholder");
    }

    return enabledIds;
};

export const isCatalogRelatedExport = (sectionKeys: readonly string[]): boolean =>
    sectionKeys.some(key => CATALOG_RELATED_EXPORT_KEYS.includes(key as typeof CATALOG_RELATED_EXPORT_KEYS[number]));

export const materializeSelectedCatalogsForExport = (
    values: ConfigValues,
    catalogs: ManifestCatalog[]
): ConfigValues => ({
    ...values,
    selected_catalogs: getExplicitSelectedCatalogs(catalogs),
});

const sanitizeLegacyCatalogGroupsForExport = (values: ConfigValues): ConfigValues =>
    produce(values, (draft) => {
        if (draft.catalog_groups && typeof draft.catalog_groups === "object" && !Array.isArray(draft.catalog_groups)) {
            Object.keys(draft.catalog_groups).forEach((groupName) => {
                if (OMITTED_LEGACY_CATALOG_GROUP_NAMES.has(groupName)) {
                    delete draft.catalog_groups[groupName];
                }
            });
        }

        if (draft.catalog_group_image_urls && typeof draft.catalog_group_image_urls === "object" && !Array.isArray(draft.catalog_group_image_urls)) {
            Object.keys(draft.catalog_group_image_urls).forEach((groupName) => {
                if (OMITTED_LEGACY_CATALOG_GROUP_NAMES.has(groupName)) {
                    delete draft.catalog_group_image_urls[groupName];
                }
            });
        }

        if (Array.isArray(draft.catalog_group_order)) {
            draft.catalog_group_order = draft.catalog_group_order.filter(
                (groupName: string) => !OMITTED_LEGACY_CATALOG_GROUP_NAMES.has(groupName)
            );
        }

        if (draft.main_catalog_groups && typeof draft.main_catalog_groups === "object" && !Array.isArray(draft.main_catalog_groups)) {
            Object.values(draft.main_catalog_groups).forEach((mainGroup) => {
                if (!mainGroup || typeof mainGroup !== "object") return;
                const mutableMainGroup = mainGroup as { subgroupNames?: string[] };
                if (Array.isArray(mutableMainGroup.subgroupNames)) {
                    mutableMainGroup.subgroupNames = mutableMainGroup.subgroupNames.filter(
                        (subgroupName: string) => !OMITTED_LEGACY_CATALOG_GROUP_NAMES.has(subgroupName)
                    );
                }
            });
        }

        if (draft.subgroup_order && typeof draft.subgroup_order === "object" && !Array.isArray(draft.subgroup_order)) {
            Object.keys(draft.subgroup_order).forEach((uuid) => {
                const subgroupNames = draft.subgroup_order[uuid];
                if (Array.isArray(subgroupNames)) {
                    draft.subgroup_order[uuid] = subgroupNames.filter(
                        (subgroupName: string) => !OMITTED_LEGACY_CATALOG_GROUP_NAMES.has(subgroupName)
                    );
                }
            });
        }
    });

export function buildExportConfig({
    originalConfig,
    currentValues,
    initialValues,
    disabledKeys,
    catalogs,
    isSyntheticSession,
}: BuildExportConfigArgs): OmniConfig {
    const safeDisabledKeys = sanitizeDisabledKeys(disabledKeys);

    // 1. Start with deep clone of current decoded values
    let clonedValues = produce(currentValues, () => {});

    // 2. Prune explicitly disabled keys (from GenericRenderer toggles)
    clonedValues = pruneDisabledKeys(clonedValues, safeDisabledKeys);

    // 3. Prune disabled and deleted catalogs
    const currentIdSet = new Set(catalogs.map(c => c.id));
    const originalIdSet = new Set([
        ...(initialValues.selected_catalogs || []),
        ...(initialValues.catalog_ordering || []),
        ...(initialValues.top_row_catalogs || []),
        ...(initialValues.small_toprow_catalogs || []),
        ...(initialValues.pinned_catalogs || []),
        ...(initialValues.starred_catalogs || []),
    ]);

    const starred = new Set(clonedValues.starred_catalogs || []);
    const deadCatalogs = new Set<string>();

    catalogs.forEach(c => {
        if (c.enabled === false && c.showInHome !== true && !starred.has(c.id)) {
            deadCatalogs.add(c.id);
        }
    });

    originalIdSet.forEach(id => {
        if (!currentIdSet.has(id)) {
            deadCatalogs.add(id);
        }
    });

    clonedValues = pruneDisabledCatalogs(clonedValues, deadCatalogs);

    clonedValues = normalizeMdblistSettings(clonedValues);

    // 4. Validate, Fix and Reorder keys
    const validatedValues = produce(validateAndFix(clonedValues), (draft) => {
        draft.catalog_group_order = reorderCatalogGroupOrder(draft);

        if (draft.catalog_groups) {
            const orderedGroups: Record<string, LooseAny> = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_groups[name]) {
                    orderedGroups[name] = draft.catalog_groups[name];
                }
            });
            draft.catalog_groups = orderedGroups;
        }

        if (draft.catalog_group_image_urls) {
            const orderedUrls: Record<string, LooseAny> = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_group_image_urls[name] !== undefined) {
                    orderedUrls[name] = draft.catalog_group_image_urls[name];
                }
            });
            draft.catalog_group_image_urls = orderedUrls;
        }
    });

    const sanitizedValues = sanitizeLegacyCatalogGroupsForExport(validatedValues);

    // 5. Sync catalog state back to decoded values before encoding
    const valuesToExport = { ...sanitizedValues };
    const activeIds = catalogs.map(c => c.id);
    const topRowIds = catalogs.filter(c => c.showInHome).map(c => c.id);
    const customNamesOut: Record<string, string> = {};
    const limitsOut: Record<string, number> = {};

    catalogs.forEach(c => {
        if (c.name && c.name !== c.id) customNamesOut[c.id] = c.name;
        if (c.metadata?.itemCount) limitsOut[c.id] = c.metadata.itemCount;
    });

    const valuesWithSelectedCatalogs = materializeSelectedCatalogsForExport(valuesToExport, catalogs);

    if (valuesWithSelectedCatalogs.catalog_ordering !== undefined || !isSyntheticSession) {
        valuesWithSelectedCatalogs.catalog_ordering = activeIds;
    }

    valuesWithSelectedCatalogs.top_row_catalogs = topRowIds;

    if (Object.keys(customNamesOut).length) {
        valuesWithSelectedCatalogs.custom_catalog_names = { ...(valuesWithSelectedCatalogs.custom_catalog_names || {}), ...customNamesOut };
    }

    if (Object.keys(limitsOut).length) {
        valuesWithSelectedCatalogs.top_row_item_limits = { ...(valuesWithSelectedCatalogs.top_row_item_limits || {}), ...limitsOut };
    }

    const originalValues = originalConfig.values || originalConfig.config || {};
    const encodedValues = encodeConfig(valuesWithSelectedCatalogs, originalValues, safeDisabledKeys);
    const finalResult: ExportableConfig = { ...originalConfig };

    if (originalConfig.config && !isSyntheticSession && catalogs.length > 0) {
        const cleanCatalogs = catalogs.map(c => {
            const out = { ...c };
            delete out._synthetic;
            return out;
        });

        finalResult.config = {
            ...encodedValues,
            catalogs: cleanCatalogs
        };
        return finalResult;
    }

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
}

export function buildPartialExportConfig({
    originalConfig,
    currentValues,
    disabledKeys,
    sectionKeys,
    catalogs,
}: BuildPartialExportConfigArgs): OmniConfig {
    const safeDisabledKeys = sanitizeDisabledKeys(disabledKeys);

    // Build a filtered values map containing only the specified section keys
    const filteredValues: Record<string, unknown> = {};
    for (const key of sectionKeys) {
        if (currentValues[key] !== undefined) {
            filteredValues[key] = produce(currentValues[key], () => {});
        }
    }

    // Also include main_group_order if exporting group keys
    if (sectionKeys.includes("main_catalog_groups") && currentValues.main_group_order) {
        filteredValues.main_group_order = produce(currentValues.main_group_order, () => {});
    }

    if (hasMdblistSectionKeys(sectionKeys)) {
        Object.assign(filteredValues, normalizeMdblistSettings(filteredValues));
    }

    // Validate & fix the filtered subset
    const validatedValues = produce(validateAndFix(filteredValues), (draft) => {
        if (!(sectionKeys.includes("catalog_groups") || sectionKeys.includes("catalog_group_order"))) {
            return;
        }

        draft.catalog_group_order = reorderCatalogGroupOrder(draft);

        if (draft.catalog_groups) {
            const orderedGroups: Record<string, LooseAny> = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_groups[name]) {
                    orderedGroups[name] = draft.catalog_groups[name];
                }
            });
            draft.catalog_groups = orderedGroups;
        }
        if (draft.catalog_group_image_urls) {
            const orderedUrls: Record<string, LooseAny> = {};
            draft.catalog_group_order.forEach((name: string) => {
                if (draft.catalog_group_image_urls[name] !== undefined) {
                    orderedUrls[name] = draft.catalog_group_image_urls[name];
                }
            });
            draft.catalog_group_image_urls = orderedUrls;
        }
    });

    const sanitizedValues = sanitizeLegacyCatalogGroupsForExport(validatedValues);

    const valuesToExport = isCatalogRelatedExport(sectionKeys)
        ? materializeSelectedCatalogsForExport(sanitizedValues, catalogs)
        : sanitizedValues;

    // Encode using the original values for format detection
    const originalValues = originalConfig.values || originalConfig.config || {};
    const encodedValues = encodeConfig(valuesToExport, originalValues, safeDisabledKeys);

    // Build the full config shell
    const finalResult: ExportableConfig = {
        ...originalConfig,
        exportedAt: new Date().toISOString()
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
}

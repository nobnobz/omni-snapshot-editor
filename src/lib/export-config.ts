import { encodeConfig, pruneDisabledCatalogs, pruneDisabledKeys } from "./config-utils";
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

export function buildExportConfig({
    originalConfig,
    currentValues,
    initialValues,
    disabledKeys,
    catalogs,
    isSyntheticSession,
}: BuildExportConfigArgs): OmniConfig {
    // 1. Start with deep clone of current decoded values
    let clonedValues = JSON.parse(JSON.stringify(currentValues));

    // 2. Prune explicitly disabled keys (from GenericRenderer toggles)
    clonedValues = pruneDisabledKeys(clonedValues, disabledKeys);

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

    // 4. Validate, Fix and Reorder keys
    const validatedValues = validateAndFix(clonedValues);
    validatedValues.catalog_group_order = reorderCatalogGroupOrder(validatedValues);

    if (validatedValues.catalog_groups) {
        const orderedGroups: Record<string, LooseAny> = {};
        validatedValues.catalog_group_order.forEach((name: string) => {
            if (validatedValues.catalog_groups[name]) {
                orderedGroups[name] = validatedValues.catalog_groups[name];
            }
        });
        validatedValues.catalog_groups = orderedGroups;
    }

    if (validatedValues.catalog_group_image_urls) {
        const orderedUrls: Record<string, LooseAny> = {};
        validatedValues.catalog_group_order.forEach((name: string) => {
            if (validatedValues.catalog_group_image_urls[name] !== undefined) {
                orderedUrls[name] = validatedValues.catalog_group_image_urls[name];
            }
        });
        validatedValues.catalog_group_image_urls = orderedUrls;
    }

    // 5. Sync catalog state back to decoded values before encoding
    const valuesToExport = { ...validatedValues };
    const activeIds = catalogs.map(c => c.id);
    const enabledIds = catalogs.filter(c => c.enabled !== false).map(c => c.id);
    const topRowIds = catalogs.filter(c => c.showInHome).map(c => c.id);
    const customNamesOut: Record<string, string> = {};
    const limitsOut: Record<string, number> = {};

    catalogs.forEach(c => {
        if (c.name && c.name !== c.id) customNamesOut[c.id] = c.name;
        if (c.metadata?.itemCount) limitsOut[c.id] = c.metadata.itemCount;
    });

    let finalEnabledIds = enabledIds;
    if (finalEnabledIds.length > 1 && finalEnabledIds.includes("omni_empty_setup_placeholder")) {
        finalEnabledIds = finalEnabledIds.filter(id => id !== "omni_empty_setup_placeholder");
    }

    valuesToExport.selected_catalogs = finalEnabledIds;

    if (valuesToExport.catalog_ordering !== undefined || !isSyntheticSession) {
        valuesToExport.catalog_ordering = activeIds;
    }

    valuesToExport.top_row_catalogs = topRowIds;

    if (Object.keys(customNamesOut).length) {
        valuesToExport.custom_catalog_names = { ...(valuesToExport.custom_catalog_names || {}), ...customNamesOut };
    }

    if (Object.keys(limitsOut).length) {
        valuesToExport.top_row_item_limits = { ...(valuesToExport.top_row_item_limits || {}), ...limitsOut };
    }

    const originalValues = originalConfig.values || originalConfig.config || {};
    const encodedValues = encodeConfig(valuesToExport, originalValues, disabledKeys);
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

import { CATALOG_FALLBACKS, type CatalogFallback } from "./catalog-fallbacks";
import type {
    AIOMetadataCatalogExportOverride,
    AIOMetadataExportTemplateDefinition,
    AIOMetadataExportOverrideState,
    AIOMetadataTemplateApplyMode,
    AIOMetadataTemplateTargetRule,
    AIOMetadataLetterboxdExportOverride,
    AIOMetadataMDBListExportOverride,
    AIOMetadataMDBListSort,
    AIOMetadataSourceScopedOverrideMap,
    AIOMetadataStreamingExportOverride,
    AIOMetadataStreamingSort,
    AIOMetadataTraktExportOverride,
    AIOMetadataTraktSort,
} from "./aiometadata-export-settings";
import {
    DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
    MDBLIST_SORT_OPTIONS,
    STREAMING_SORT_OPTIONS,
    TRAKT_SORT_OPTIONS,
} from "./aiometadata-export-settings";
import {
    getAIOMetadataCatalogIdentityKey,
    getAIOMetadataCatalogLookupKeys,
    getDefaultAIOMetadataExtraExportFields,
    type AIOMetadataCatalogSource,
    type AIOMetadataCatalogType,
    type AIOMetadataFallbackMap,
    type AIOMetadataNormalizedCatalog,
    normalizeAIOMetadataCatalogId,
    normalizeAIOMetadataCatalogTypeFromId,
    stripAIOMetadataCatalogTypePrefix,
} from "./aiometadata-sync";
import { ensureCatalogPrefix, formatDisplayName } from "./utils";
import { normalizeMainGroupOrder, normalizeSubgroupNames } from "./main-group-utils";

const LETTERBOXD_DEFAULT_CACHE_TTL = 86400;

type ConfigValues = Record<string, unknown>;

type AIOMetadataLinkedCatalog = {
    widgetId: string;
    widgetName: string;
    itemName: string;
    omniCatalogId: string;
};

export type AIOMetadataCatalogExportEntry = {
    id: string;
    type: AIOMetadataCatalogType;
    name: string;
    enabled: true;
    source: AIOMetadataCatalogSource;
    displayType: AIOMetadataCatalogType;
} & Record<string, unknown>;

export type AIOMetadataCatalogOccurrence = {
    comparisonKey: string;
    widgetId: string;
    widgetName: string;
    widgetOrder: number;
    itemId: string;
    itemName: string;
    omniCatalogId: string;
    strippedCatalogId: string;
    rawName: string;
    source: AIOMetadataCatalogSource;
    type: AIOMetadataCatalogType;
    exportCatalog: AIOMetadataCatalogExportEntry;
    importedCatalog?: AIOMetadataNormalizedCatalog;
    isSynced: boolean;
    isExportable: boolean;
};

export type AIOMetadataExportItem = {
    id: string;
    name: string;
    occurrences: AIOMetadataCatalogOccurrence[];
    exportableCount: number;
    syncedCount: number;
};

export type AIOMetadataExportWidget = {
    id: string;
    name: string;
    order: number;
    items: AIOMetadataExportItem[];
    exportableCount: number;
    syncedCount: number;
};

export type AIOMetadataExportInventory = {
    widgets: AIOMetadataExportWidget[];
    occurrences: AIOMetadataCatalogOccurrence[];
    exportableComparisonKeys: string[];
    exportableSources: AIOMetadataCatalogSource[];
    hasAuthoritativeCatalogInventory: boolean;
    importedCatalogsByComparisonKey: Map<string, AIOMetadataNormalizedCatalog>;
};

export type AIOMetadataFilteredExportItem = {
    id: string;
    name: string;
    occurrences: AIOMetadataCatalogOccurrence[];
};

export type AIOMetadataFilteredExportWidget = {
    id: string;
    name: string;
    items: AIOMetadataFilteredExportItem[];
};

export type AIOMetadataCanonicalOccurrence = AIOMetadataCatalogOccurrence & {
    sortKey: string;
};

export type AIOMetadataResolvedMDBListExportFields = {
    sort: AIOMetadataMDBListSort;
    order: "asc" | "desc";
    cacheTTL: number;
};

export type AIOMetadataResolvedTraktExportFields = {
    sort: AIOMetadataTraktSort;
    sortDirection: "asc" | "desc";
    cacheTTL: number;
};

export type AIOMetadataResolvedStreamingExportFields = {
    sort?: AIOMetadataStreamingSort;
    sortDirection?: "asc" | "desc";
};

export type AIOMetadataResolvedLetterboxdExportFields = {
    cacheTTL: number;
};

const GENERAL_WIDGET_ID = "__unassigned__";
const GENERAL_WIDGET_NAME = "Unassigned";
const HEADER_WIDGET_ID = "__catalog_manager_header__";
const HEADER_WIDGET_NAME = "Header";
const TOP_ROW_WIDGET_ID = "__catalog_manager_top_row__";
const TOP_ROW_WIDGET_NAME = "Top Row";
const CATALOG_WIDGET_ID = "__catalog_manager_catalog__";
const CATALOG_WIDGET_NAME = "Catalog";
const CATALOG_MANAGER_ITEM_NAME = "Catalog Manager";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const getCatalogSource = (catalogId: string): AIOMetadataCatalogSource | undefined => {
    const strippedId = normalizeAIOMetadataCatalogId(catalogId);

    if (strippedId.startsWith("mdblist.")) return "mdblist";
    if (strippedId.startsWith("streaming.")) return "streaming";
    if (strippedId.startsWith("trakt.")) return "trakt";
    if (strippedId.startsWith("letterboxd.")) return "letterboxd";

    return undefined;
};

const getCatalogTypePrefix = (catalogId: string): AIOMetadataCatalogType | undefined => {
    if (catalogId.startsWith("movie:")) return "movie";
    if (catalogId.startsWith("series:")) return "series";
    if (catalogId.startsWith("anime:")) return "anime";
    if (catalogId.startsWith("all:")) return "all";
    return undefined;
};

const normalizeNamePrefix = (name: string) => name.replace(/^\[[^\]]+\]\s*/, "").trim();
const getItemIdentity = (widgetId: string, itemName: string) => `${widgetId}:${itemName}`;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MDBLIST_SORT_VALUES = new Set(MDBLIST_SORT_OPTIONS.map((option) => option.value));
const TRAKT_SORT_VALUES = new Set(TRAKT_SORT_OPTIONS.map((option) => option.value));
const STREAMING_SORT_VALUES = new Set(STREAMING_SORT_OPTIONS.map((option) => option.value));

const isValidMDBListSort = (value: unknown): value is AIOMetadataMDBListSort =>
    typeof value === "string" && MDBLIST_SORT_VALUES.has(value as AIOMetadataMDBListSort);
const isValidTraktSort = (value: unknown): value is AIOMetadataTraktSort =>
    typeof value === "string" && TRAKT_SORT_VALUES.has(value as AIOMetadataTraktSort);
const isValidStreamingSort = (value: unknown): value is AIOMetadataStreamingSort =>
    typeof value === "string" && STREAMING_SORT_VALUES.has(value as AIOMetadataStreamingSort);
const isValidMDBListOrder = (value: unknown): value is "asc" | "desc" =>
    value === "asc" || value === "desc";
const isValidSortDirection = (value: unknown): value is "asc" | "desc" =>
    value === "asc" || value === "desc";
const isValidCacheTTL = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 300;

const getFallbackEntry = (
    fallbacks: AIOMetadataFallbackMap | Record<string, CatalogFallback>,
    omniCatalogId: string
): string | CatalogFallback | undefined => {
    return getAIOMetadataCatalogLookupKeys(omniCatalogId).find((key) => fallbacks[key]) ? fallbacks[getAIOMetadataCatalogLookupKeys(omniCatalogId).find((key) => fallbacks[key])!] : undefined;
};

const resolveCatalogType = (
    omniCatalogId: string,
    rawName: string,
    importedFallbacks: AIOMetadataFallbackMap
): AIOMetadataCatalogType => {
    if (getCatalogSource(omniCatalogId) === "letterboxd") {
        return "movie";
    }

    const idType = normalizeAIOMetadataCatalogTypeFromId(omniCatalogId);
    if (idType) return idType;

    const prefixedType = getCatalogTypePrefix(omniCatalogId);
    if (prefixedType) return prefixedType;

    const importedFallback = getFallbackEntry(importedFallbacks, omniCatalogId);
    if (importedFallback && typeof importedFallback !== "string") {
        return importedFallback.type;
    }

    const staticFallback = getFallbackEntry(CATALOG_FALLBACKS, omniCatalogId);
    if (staticFallback && typeof staticFallback !== "string") {
        return staticFallback.type;
    }

    return getCatalogTypePrefix(ensureCatalogPrefix(stripAIOMetadataCatalogTypePrefix(omniCatalogId), rawName)) || "movie";
};

const getSyncedDecoratedCatalogType = (
    source: AIOMetadataCatalogSource,
    importedCatalog?: AIOMetadataNormalizedCatalog
): AIOMetadataCatalogType | null => {
    if (source !== "trakt" && source !== "letterboxd") {
        return importedCatalog?.displayType || importedCatalog?.type || null;
    }

    const syncedType = importedCatalog?.displayType || importedCatalog?.type;
    if (syncedType === "movie" || syncedType === "series") {
        return syncedType;
    }

    return null;
};

const resolveCatalogName = (
    omniCatalogId: string,
    configCustomNames: Record<string, string>,
    importedFallbacks: AIOMetadataFallbackMap
) => {
    const strippedId = stripAIOMetadataCatalogTypePrefix(omniCatalogId);

    const configuredName = configCustomNames[omniCatalogId] || configCustomNames[strippedId];
    if (typeof configuredName === "string" && configuredName.trim()) {
        return formatDisplayName(configuredName);
    }

    const importedFallback = getFallbackEntry(importedFallbacks, omniCatalogId);
    if (typeof importedFallback === "string" && importedFallback.trim()) {
        return formatDisplayName(importedFallback);
    }
    if (importedFallback && typeof importedFallback !== "string" && importedFallback.name.trim()) {
        return formatDisplayName(importedFallback.name);
    }

    const staticFallback = getFallbackEntry(CATALOG_FALLBACKS, omniCatalogId);
    if (staticFallback && typeof staticFallback !== "string" && staticFallback.name.trim()) {
        return formatDisplayName(staticFallback.name);
    }

    return strippedId;
};

const getCatalogTypeLabel = (type: AIOMetadataCatalogType) => {
    if (type === "movie") return "Movies";
    if (type === "series") return "Shows";
    if (type === "all") return "All";
    if (type === "anime") return "Anime";
    return "";
};

const getCatalogTypeTrailingWhitespace = (type: AIOMetadataCatalogType) => {
    if (type === "movie") return " ";
    if (type === "all") return "   ";
    if (type === "anime") return "  ";
    return "";
};

const stripDuplicatedWidgetPrefix = (widgetName: string, itemName: string) => {
    const normalizedItemName = formatDisplayName(itemName).trim();
    if (!normalizedItemName) return normalizedItemName;

    const widgetPrefixPattern = new RegExp(`^\\[${escapeRegExp(widgetName.trim())}\\]\\s*`, "iu");
    return normalizedItemName.replace(widgetPrefixPattern, "").trim();
};

const appendCatalogTypeLabel = (baseLabel: string, type: AIOMetadataCatalogType | null) => {
    if (!type) return baseLabel.trim();

    const suffix = getCatalogTypeLabel(type);
    if (!suffix) return baseLabel;

    const normalizedBase = baseLabel.trim().toLowerCase();
    const normalizedSuffix = suffix.toLowerCase();
    const hasTypeSuffix =
        (normalizedSuffix === "movies" && /\b(movie|movies)\b/u.test(normalizedBase))
        || (normalizedSuffix === "shows" && /\b(show|shows|series)\b/u.test(normalizedBase))
        || (normalizedSuffix === "all" && /\ball\b/u.test(normalizedBase))
        || (normalizedSuffix === "anime" && /\banime\b/u.test(normalizedBase))
        || normalizedBase.endsWith(normalizedSuffix);

    if (hasTypeSuffix) {
        return baseLabel.trim();
    }

    return `${baseLabel} (${suffix})${getCatalogTypeTrailingWhitespace(type)}`;
};

const buildSubgroupCatalogExportName = (
    widgetName: string,
    itemName: string,
    type: AIOMetadataCatalogType | null
) => {
    const baseLabel = stripDuplicatedWidgetPrefix(widgetName, itemName) || itemName.trim();
    const subgroupLabelWithType = appendCatalogTypeLabel(baseLabel, type);
    return `[${widgetName}] ${subgroupLabelWithType}`;
};

const isCatalogManagerWidget = (widgetId: string, itemName: string) =>
    itemName === CATALOG_MANAGER_ITEM_NAME
    && (widgetId === HEADER_WIDGET_ID || widgetId === TOP_ROW_WIDGET_ID || widgetId === CATALOG_WIDGET_ID);

const buildCatalogManagerExportName = (
    widgetName: string,
    catalogName: string,
    type: AIOMetadataCatalogType | null
) => {
    const baseLabel = stripDuplicatedWidgetPrefix(widgetName, normalizeNamePrefix(catalogName)) || normalizeNamePrefix(catalogName);
    const labelWithType = appendCatalogTypeLabel(baseLabel, type);
    return `[${widgetName}] ${labelWithType}`;
};

const applyExportNameNumbering = (
    catalogs: AIOMetadataCatalogExportEntry[]
) => {
    const nameCounts = new Map<string, number>();

    return catalogs.map((catalog) => {
        const currentCount = (nameCounts.get(catalog.name) || 0) + 1;
        nameCounts.set(catalog.name, currentCount);

        if (currentCount === 1) {
            return catalog;
        }

        return {
            ...catalog,
            name: `${catalog.name}${/\s$/u.test(catalog.name) ? "" : " "}${currentCount}`,
        };
    });
};

const sortAlphabetically = <T,>(entries: T[], getValue: (entry: T) => string) =>
    [...entries].sort((left, right) => getValue(left).localeCompare(getValue(right), undefined, { sensitivity: "base" }));

const buildCatalogManagerLinkedCatalogs = (currentValues: ConfigValues): AIOMetadataLinkedCatalog[] => {
    const selectedList = toStringArray(currentValues.selected_catalogs);
    const topRowList = toStringArray(currentValues.top_row_catalogs);
    const smallTopRowList = toStringArray(currentValues.small_toprow_catalogs);
    const headerList = toStringArray(currentValues.starred_catalogs);
    const legacyHeaderList = toStringArray(currentValues.pinned_catalogs);

    const headerIds = new Set([...headerList, ...legacyHeaderList]);
    const topRowIds = new Set([...topRowList, ...smallTopRowList]);
    const activeIds = Array.from(new Set([
        ...selectedList,
        ...topRowList,
        ...smallTopRowList,
        ...headerList,
        ...legacyHeaderList,
    ]));

    return activeIds.flatMap((omniCatalogId) => {
        if (!getCatalogSource(omniCatalogId)) return [];

        if (headerIds.has(omniCatalogId)) {
            return [{
                widgetId: HEADER_WIDGET_ID,
                widgetName: HEADER_WIDGET_NAME,
                itemName: CATALOG_MANAGER_ITEM_NAME,
                omniCatalogId,
            }];
        }

        if (topRowIds.has(omniCatalogId)) {
            return [{
                widgetId: TOP_ROW_WIDGET_ID,
                widgetName: TOP_ROW_WIDGET_NAME,
                itemName: CATALOG_MANAGER_ITEM_NAME,
                omniCatalogId,
            }];
        }

        return [{
            widgetId: CATALOG_WIDGET_ID,
            widgetName: CATALOG_WIDGET_NAME,
            itemName: CATALOG_MANAGER_ITEM_NAME,
            omniCatalogId,
        }];
    });
};

export function getComparisonKey(
    catalog: { id: string; type: AIOMetadataCatalogType; source: AIOMetadataCatalogSource }
) {
    return getAIOMetadataCatalogIdentityKey(catalog);
}

export function collectLinkedAIOMetadataCatalogs(
    currentValues: ConfigValues
): AIOMetadataLinkedCatalog[] {
    const mainCatalogGroups = isRecord(currentValues.main_catalog_groups)
        ? currentValues.main_catalog_groups
        : {};
    const catalogGroups = isRecord(currentValues.catalog_groups)
        ? currentValues.catalog_groups
        : {};
    const mainGroupOrder = normalizeMainGroupOrder(mainCatalogGroups, currentValues.main_group_order);

    const linkedCatalogs: AIOMetadataLinkedCatalog[] = [];
    const assignedSubgroups = new Set<string>();

    mainGroupOrder.forEach((widgetId, widgetOrder) => {
        const mainGroup = isRecord(mainCatalogGroups[widgetId]) ? mainCatalogGroups[widgetId] : {};
        const widgetName = typeof mainGroup.name === "string" && mainGroup.name.trim()
            ? mainGroup.name.trim()
            : "Unnamed Group";
        const subgroupNames = normalizeSubgroupNames(mainGroup.subgroupNames, undefined, new Set(Object.keys(catalogGroups)));

        subgroupNames.forEach((itemName) => {
            assignedSubgroups.add(itemName);

            toStringArray(catalogGroups[itemName]).forEach((omniCatalogId) => {
                if (!getCatalogSource(omniCatalogId)) return;

                linkedCatalogs.push({
                    widgetId,
                    widgetName,
                    itemName,
                    omniCatalogId,
                });
            });
        });

        void widgetOrder;
    });

    sortAlphabetically(
        Object.keys(catalogGroups).filter((itemName) => !assignedSubgroups.has(itemName)),
        (itemName) => itemName
    ).forEach((itemName) => {
        toStringArray(catalogGroups[itemName]).forEach((omniCatalogId) => {
            if (!getCatalogSource(omniCatalogId)) return;

            linkedCatalogs.push({
                widgetId: GENERAL_WIDGET_ID,
                widgetName: GENERAL_WIDGET_NAME,
                itemName,
                omniCatalogId,
            });
        });
    });

    return [
        ...linkedCatalogs,
        ...buildCatalogManagerLinkedCatalogs(currentValues),
    ];
}

export function normalizeExportableCatalogOccurrence(
    linkedCatalog: AIOMetadataLinkedCatalog,
    configCustomNames: Record<string, string>,
    importedFallbacks: AIOMetadataFallbackMap,
    widgetOrder: number,
    hasAuthoritativeCatalogInventory: boolean,
    importedCatalogsByComparisonKey: Map<string, AIOMetadataNormalizedCatalog>
): AIOMetadataCatalogOccurrence {
    const strippedCatalogId = stripAIOMetadataCatalogTypePrefix(linkedCatalog.omniCatalogId);
    const normalizedCatalogId = normalizeAIOMetadataCatalogId(linkedCatalog.omniCatalogId);
    const source = getCatalogSource(normalizedCatalogId);
    if (!source) {
        throw new Error(`Unsupported AIOMetadata catalog source: ${linkedCatalog.omniCatalogId}`);
    }

    const resolvedCatalogName = resolveCatalogName(linkedCatalog.omniCatalogId, configCustomNames, importedFallbacks);
    const resolvedRawName = normalizeNamePrefix(resolvedCatalogName) || strippedCatalogId;
    const widgetName = linkedCatalog.widgetName.trim() || GENERAL_WIDGET_NAME;
    const type = resolveCatalogType(linkedCatalog.omniCatalogId, resolvedRawName, importedFallbacks);
    const importedCatalog = importedCatalogsByComparisonKey.get(getComparisonKey({
        id: normalizedCatalogId,
        type,
        source,
    }));
    const namingType = getCatalogTypePrefix(linkedCatalog.omniCatalogId) === "anime"
        ? "anime"
        : source === "trakt" || source === "letterboxd"
            ? getSyncedDecoratedCatalogType(source, importedCatalog)
            : type;
    const exportName = isCatalogManagerWidget(linkedCatalog.widgetId, linkedCatalog.itemName)
        ? buildCatalogManagerExportName(widgetName, resolvedCatalogName, namingType)
        : buildSubgroupCatalogExportName(widgetName, linkedCatalog.itemName, namingType);
    const provisionalExportCatalog = {
        id: normalizedCatalogId,
        type,
        name: exportName,
        enabled: true,
        source,
        displayType: source === "letterboxd" ? "movie" : importedCatalog?.displayType || type,
    };
    const comparisonKey = getComparisonKey(provisionalExportCatalog);
    const authoritativeImportedCatalog = importedCatalogsByComparisonKey.get(comparisonKey) || importedCatalog;
    const extraExportFields = {
        ...getDefaultAIOMetadataExtraExportFields({
            id: authoritativeImportedCatalog?.id || normalizedCatalogId,
            type: authoritativeImportedCatalog?.type || type,
            source,
        }),
        ...(authoritativeImportedCatalog?.extraExportFields || {}),
    };
    const exportCatalog: AIOMetadataCatalogExportEntry = {
        ...extraExportFields,
        id: authoritativeImportedCatalog?.id || normalizedCatalogId,
        type: source === "letterboxd" ? "movie" : authoritativeImportedCatalog?.type || type,
        name: exportName,
        enabled: true,
        source,
        displayType: source === "letterboxd" ? "movie" : authoritativeImportedCatalog?.displayType || type,
    };
    const isSynced = hasAuthoritativeCatalogInventory && !!authoritativeImportedCatalog;

    return {
        comparisonKey,
        widgetId: linkedCatalog.widgetId,
        widgetName,
        widgetOrder,
        itemId: getItemIdentity(linkedCatalog.widgetId, linkedCatalog.itemName),
        itemName: linkedCatalog.itemName,
        omniCatalogId: linkedCatalog.omniCatalogId,
        strippedCatalogId,
        rawName: resolvedCatalogName,
        source,
        type,
        exportCatalog,
        importedCatalog: authoritativeImportedCatalog,
        isSynced,
        isExportable: !isSynced,
    };
}

export function buildAIOMetadataExportInventory({
    currentValues,
    importedCatalogs,
    customFallbacks = {},
}: {
    currentValues: ConfigValues;
    importedCatalogs?: AIOMetadataNormalizedCatalog[] | null;
    customFallbacks?: AIOMetadataFallbackMap;
}): AIOMetadataExportInventory {
    const configCustomNames = isRecord(currentValues.custom_catalog_names)
        ? Object.fromEntries(
            Object.entries(currentValues.custom_catalog_names).filter((entry): entry is [string, string] => typeof entry[1] === "string")
        )
        : {};
    const linkedCatalogs = collectLinkedAIOMetadataCatalogs(currentValues);
    const hasAuthoritativeCatalogInventory = Array.isArray(importedCatalogs);
    const importedCatalogsByComparisonKey = new Map<string, AIOMetadataNormalizedCatalog>();
    (importedCatalogs || []).forEach((catalog) => {
        const comparisonKey = getComparisonKey(catalog);
        if (!importedCatalogsByComparisonKey.has(comparisonKey)) {
            importedCatalogsByComparisonKey.set(comparisonKey, catalog);
        }
    });

    const widgetOrderLookup = new Map<string, number>();
    const mainCatalogGroups = isRecord(currentValues.main_catalog_groups)
        ? currentValues.main_catalog_groups
        : {};
    normalizeMainGroupOrder(mainCatalogGroups, currentValues.main_group_order).forEach((widgetId, index) => {
        widgetOrderLookup.set(widgetId, index);
    });
    widgetOrderLookup.set(HEADER_WIDGET_ID, widgetOrderLookup.size);
    widgetOrderLookup.set(TOP_ROW_WIDGET_ID, widgetOrderLookup.size);
    widgetOrderLookup.set(CATALOG_WIDGET_ID, widgetOrderLookup.size);
    widgetOrderLookup.set(GENERAL_WIDGET_ID, widgetOrderLookup.size);

    const occurrences = linkedCatalogs.map((linkedCatalog) =>
        normalizeExportableCatalogOccurrence(
            linkedCatalog,
            configCustomNames,
            customFallbacks,
            widgetOrderLookup.get(linkedCatalog.widgetId) ?? widgetOrderLookup.size,
            hasAuthoritativeCatalogInventory,
            importedCatalogsByComparisonKey
        )
    );

    const groupedWidgets = new Map<string, AIOMetadataExportWidget>();

    occurrences.forEach((occurrence) => {
        const existingWidget = groupedWidgets.get(occurrence.widgetId);
        if (!existingWidget) {
            groupedWidgets.set(occurrence.widgetId, {
                id: occurrence.widgetId,
                name: occurrence.widgetName,
                order: occurrence.widgetOrder,
                items: [],
                exportableCount: 0,
                syncedCount: 0,
            });
        }

        const widget = groupedWidgets.get(occurrence.widgetId)!;
        let item = widget.items.find((candidate) => candidate.name === occurrence.itemName);
        if (!item) {
            item = {
                id: getItemIdentity(occurrence.widgetId, occurrence.itemName),
                name: occurrence.itemName,
                occurrences: [],
                exportableCount: 0,
                syncedCount: 0,
            };
            widget.items.push(item);
        }

        item.occurrences.push(occurrence);
        if (occurrence.isExportable) {
            item.exportableCount += 1;
            widget.exportableCount += 1;
        } else {
            item.syncedCount += 1;
            widget.syncedCount += 1;
        }
    });

    const widgets = sortAlphabetically(
        Array.from(groupedWidgets.values()),
        (widget) => `${widget.order.toString().padStart(4, "0")}:${widget.name}`
    ).map((widget) => ({
        ...widget,
        items: sortAlphabetically(widget.items, (item) => item.name).map((item) => ({
            ...item,
            occurrences: [...item.occurrences].sort((left, right) => {
                if (left.isExportable !== right.isExportable) {
                    return left.isExportable ? -1 : 1;
                }

                return left.exportCatalog.name.localeCompare(right.exportCatalog.name, undefined, { sensitivity: "base" });
            }),
        })),
    }));

    const exportableComparisonKeys = Array.from(
        new Set(
            occurrences
                .filter((occurrence) => occurrence.isExportable)
                .map((occurrence) => occurrence.comparisonKey)
        )
    );
    const exportableSources = Array.from(
        new Set(
            occurrences
                .filter((occurrence) => occurrence.isExportable)
                .map((occurrence) => occurrence.source)
        )
    ) as AIOMetadataCatalogSource[];

    return {
        widgets,
        occurrences,
        exportableComparisonKeys,
        exportableSources,
        hasAuthoritativeCatalogInventory,
        importedCatalogsByComparisonKey,
    };
}

export function filterAIOMetadataExportInventory(
    inventory: AIOMetadataExportInventory,
    query: string
): AIOMetadataFilteredExportWidget[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return inventory.widgets.map((widget) => ({
            id: widget.id,
            name: widget.name,
            items: widget.items.map((item) => ({
                id: item.id,
                name: item.name,
                occurrences: item.occurrences,
            })),
        }));
    }

    const matches = (value: string) => value.toLowerCase().includes(normalizedQuery);

    return inventory.widgets.flatMap((widget) => {
        if (matches(widget.name)) {
            return [{
                id: widget.id,
                name: widget.name,
                items: widget.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    occurrences: item.occurrences,
                })),
            }];
        }

        const items = widget.items.flatMap((item) => {
            if (matches(item.name)) {
                return [{
                    id: item.id,
                    name: item.name,
                    occurrences: item.occurrences,
                }];
            }

            const occurrences = item.occurrences.filter((occurrence) =>
                matches(occurrence.exportCatalog.name)
                || matches(occurrence.rawName)
                || matches(occurrence.strippedCatalogId)
            );

            if (occurrences.length === 0) return [];

            return [{
                id: item.id,
                name: item.name,
                occurrences,
            }];
        });

        if (items.length === 0) return [];

        return [{
            id: widget.id,
            name: widget.name,
            items,
        }];
    });
}

const getOccurrenceSortKey = (occurrence: AIOMetadataCatalogOccurrence) =>
    [
        occurrence.widgetOrder.toString().padStart(4, "0"),
        occurrence.widgetName.toLowerCase(),
        occurrence.itemName.toLowerCase(),
        occurrence.exportCatalog.name.toLowerCase(),
    ].join(":");

const CATALOG_TYPE_DECORATION_RE = /\s+\((Movies|Shows|All|Anime)\)\s*$/iu;

const stripCatalogTypeDecoration = (value: string) => value.replace(CATALOG_TYPE_DECORATION_RE, "").trim();

export function getCanonicalOccurrencesByComparisonKey(
    inventory: AIOMetadataExportInventory
) {
    const canonicalOccurrences = new Map<string, AIOMetadataCanonicalOccurrence>();

    inventory.widgets.forEach((widget) => {
        widget.items.forEach((item) => {
            item.occurrences.forEach((occurrence) => {
                if (!canonicalOccurrences.has(occurrence.comparisonKey)) {
                    canonicalOccurrences.set(occurrence.comparisonKey, {
                        ...occurrence,
                        sortKey: getOccurrenceSortKey(occurrence),
                    });
                }
            });
        });
    });

    return canonicalOccurrences;
}

const getMDBListBaseExportFields = (
    occurrence: AIOMetadataCatalogOccurrence
): AIOMetadataResolvedMDBListExportFields => {
    const defaults = getDefaultAIOMetadataExtraExportFields({
        id: occurrence.exportCatalog.id,
        type: occurrence.exportCatalog.type,
        source: occurrence.exportCatalog.source,
    });

    return {
        sort: isValidMDBListSort(occurrence.exportCatalog.sort ?? defaults.sort)
            ? (occurrence.exportCatalog.sort ?? defaults.sort) as AIOMetadataMDBListSort
            : "default",
        order: isValidMDBListOrder(occurrence.exportCatalog.order ?? defaults.order)
            ? (occurrence.exportCatalog.order ?? defaults.order) as "asc" | "desc"
            : "asc",
        cacheTTL: isValidCacheTTL(occurrence.exportCatalog.cacheTTL ?? defaults.cacheTTL)
            ? (occurrence.exportCatalog.cacheTTL ?? defaults.cacheTTL) as number
            : 43200,
    };
};

const getLetterboxdBaseExportFields = (
    occurrence: AIOMetadataCatalogOccurrence
): AIOMetadataResolvedLetterboxdExportFields => ({
    cacheTTL: isValidCacheTTL(occurrence.exportCatalog.cacheTTL)
        ? occurrence.exportCatalog.cacheTTL as number
        : LETTERBOXD_DEFAULT_CACHE_TTL,
});

const getSourceScopedOverride = <
    TOverride extends Record<string, unknown>,
>(
    scopeOverride: AIOMetadataSourceScopedOverrideMap | undefined,
    source: AIOMetadataCatalogSource
) => scopeOverride?.[source] as TOverride | undefined;

const cloneSourceScopedOverrideMap = (
    map: Record<string, AIOMetadataSourceScopedOverrideMap>
) => Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, { ...value }])
);

const mergeScopedOverrideValues = <
    TOverride extends Record<string, unknown>,
>(
    existing: AIOMetadataSourceScopedOverrideMap | undefined,
    source: AIOMetadataCatalogSource,
    values: Partial<TOverride>,
    mode: AIOMetadataTemplateApplyMode
) => {
    const currentSourceValue = (existing?.[source] || {}) as TOverride;
    const nextSourceValue = mergeOverrideValues(currentSourceValue, values, mode);

    return {
        ...(existing || {}),
        [source]: nextSourceValue,
    };
};

const removeScopedOverrideFields = <
    TOverride extends Record<string, unknown>,
>(
    existing: AIOMetadataSourceScopedOverrideMap | undefined,
    source: AIOMetadataCatalogSource,
    fields: (keyof TOverride)[]
) => {
    if (!existing?.[source]) return existing;

    const nextSourceValue = removeOverrideFields(
        existing[source] as TOverride,
        fields
    );

    if (nextSourceValue) {
        return {
            ...existing,
            [source]: nextSourceValue,
        };
    }

    const nextValue = { ...existing };
    delete nextValue[source];
    return Object.keys(nextValue).length > 0 ? nextValue : undefined;
};

export function resolveMDBListExportOverrideForOccurrence(
    occurrence: AIOMetadataCatalogOccurrence,
    overrides?: AIOMetadataExportOverrideState
): AIOMetadataResolvedMDBListExportFields | null {
    if (occurrence.source !== "mdblist") return null;

    const base = getMDBListBaseExportFields(occurrence);
    const widgetOverride = getSourceScopedOverride<AIOMetadataMDBListExportOverride>(
        overrides?.widgets[occurrence.widgetId],
        "mdblist"
    );
    const itemOverride = getSourceScopedOverride<AIOMetadataMDBListExportOverride>(
        overrides?.items[occurrence.itemId],
        "mdblist"
    );
    const catalogOverride = overrides?.catalogs[occurrence.comparisonKey] as AIOMetadataMDBListExportOverride | undefined;

    const resolveField = <T,>(
        key: keyof AIOMetadataMDBListExportOverride,
        fallback: T
    ) => {
        const catalogValue = catalogOverride?.[key];
        if (catalogValue !== undefined) return catalogValue as T;

        const itemValue = itemOverride?.[key];
        if (itemValue !== undefined) return itemValue as T;

        const widgetValue = widgetOverride?.[key];
        if (widgetValue !== undefined) return widgetValue as T;

        return fallback;
    };

    return {
        sort: resolveField("sort", base.sort),
        order: resolveField("order", base.order),
        cacheTTL: resolveField("cacheTTL", base.cacheTTL),
    };
}

export function resolveTraktExportOverrideForOccurrence(
    occurrence: AIOMetadataCatalogOccurrence,
    overrides?: AIOMetadataExportOverrideState
): AIOMetadataResolvedTraktExportFields | null {
    if (occurrence.source !== "trakt") return null;

    const widgetOverride = getSourceScopedOverride<AIOMetadataTraktExportOverride>(
        overrides?.widgets[occurrence.widgetId],
        "trakt"
    );
    const itemOverride = getSourceScopedOverride<AIOMetadataTraktExportOverride>(
        overrides?.items[occurrence.itemId],
        "trakt"
    );
    const catalogOverride = overrides?.catalogs[occurrence.comparisonKey] as AIOMetadataTraktExportOverride | undefined;

    const resolveField = <T,>(
        key: keyof AIOMetadataTraktExportOverride,
        fallback: T
    ) => {
        const catalogValue = catalogOverride?.[key];
        if (catalogValue !== undefined) return catalogValue as T;

        const itemValue = itemOverride?.[key];
        if (itemValue !== undefined) return itemValue as T;

        const widgetValue = widgetOverride?.[key];
        if (widgetValue !== undefined) return widgetValue as T;

        return fallback;
    };

    return {
        sort: resolveField(
            "sort",
            isValidTraktSort(occurrence.exportCatalog.sort)
                ? occurrence.exportCatalog.sort
                : "added"
        ),
        sortDirection: resolveField(
            "sortDirection",
            isValidSortDirection(occurrence.exportCatalog.sortDirection)
                ? occurrence.exportCatalog.sortDirection as "asc" | "desc"
                : "asc"
        ),
        cacheTTL: resolveField(
            "cacheTTL",
            isValidCacheTTL(occurrence.exportCatalog.cacheTTL)
                ? occurrence.exportCatalog.cacheTTL as number
                : 43200
        ),
    };
}

export function resolveStreamingExportOverrideForOccurrence(
    occurrence: AIOMetadataCatalogOccurrence,
    overrides?: AIOMetadataExportOverrideState
): AIOMetadataResolvedStreamingExportFields | null {
    if (occurrence.source !== "streaming") return null;

    const widgetOverride = getSourceScopedOverride<AIOMetadataStreamingExportOverride>(
        overrides?.widgets[occurrence.widgetId],
        "streaming"
    );
    const itemOverride = getSourceScopedOverride<AIOMetadataStreamingExportOverride>(
        overrides?.items[occurrence.itemId],
        "streaming"
    );
    const catalogOverride = overrides?.catalogs[occurrence.comparisonKey] as AIOMetadataStreamingExportOverride | undefined;

    const resolveField = <T,>(
        key: keyof AIOMetadataStreamingExportOverride,
        fallback: T | undefined
    ) => {
        const catalogValue = catalogOverride?.[key];
        if (catalogValue !== undefined) return catalogValue as T;

        const itemValue = itemOverride?.[key];
        if (itemValue !== undefined) return itemValue as T;

        const widgetValue = widgetOverride?.[key];
        if (widgetValue !== undefined) return widgetValue as T;

        return fallback;
    };

    return {
        sort: resolveField(
            "sort",
            isValidStreamingSort(occurrence.exportCatalog.sort) ? occurrence.exportCatalog.sort : undefined
        ),
        sortDirection: resolveField(
            "sortDirection",
            isValidSortDirection(occurrence.exportCatalog.sortDirection)
                ? occurrence.exportCatalog.sortDirection as "asc" | "desc"
                : undefined
        ),
    };
}

export function resolveLetterboxdExportOverrideForOccurrence(
    occurrence: AIOMetadataCatalogOccurrence,
    overrides?: AIOMetadataExportOverrideState
): AIOMetadataResolvedLetterboxdExportFields | null {
    if (occurrence.source !== "letterboxd") return null;

    const base = getLetterboxdBaseExportFields(occurrence);
    const widgetOverride = getSourceScopedOverride<AIOMetadataLetterboxdExportOverride>(
        overrides?.widgets[occurrence.widgetId],
        "letterboxd"
    );
    const itemOverride = getSourceScopedOverride<AIOMetadataLetterboxdExportOverride>(
        overrides?.items[occurrence.itemId],
        "letterboxd"
    );
    const catalogOverride = overrides?.catalogs[occurrence.comparisonKey] as AIOMetadataLetterboxdExportOverride | undefined;

    const resolveField = <T,>(
        key: keyof AIOMetadataLetterboxdExportOverride,
        fallback: T
    ) => {
        const catalogValue = catalogOverride?.[key];
        if (catalogValue !== undefined) return catalogValue as T;

        const itemValue = itemOverride?.[key];
        if (itemValue !== undefined) return itemValue as T;

        const widgetValue = widgetOverride?.[key];
        if (widgetValue !== undefined) return widgetValue as T;

        return fallback;
    };

    return {
        cacheTTL: resolveField("cacheTTL", base.cacheTTL),
    };
}

export function applyExportOverrideToCatalog(
    occurrence: AIOMetadataCatalogOccurrence,
    overrides?: AIOMetadataExportOverrideState
) {
    if (occurrence.source === "mdblist") {
        const resolved = resolveMDBListExportOverrideForOccurrence(occurrence, overrides);
        if (!resolved) {
            return { ...occurrence.exportCatalog };
        }

        return {
            ...occurrence.exportCatalog,
            sort: resolved.sort,
            order: resolved.order,
            cacheTTL: resolved.cacheTTL,
        };
    }

    if (occurrence.source === "trakt") {
        const resolved = resolveTraktExportOverrideForOccurrence(occurrence, overrides);
        if (!resolved) {
            return { ...occurrence.exportCatalog };
        }

        return {
            ...occurrence.exportCatalog,
            sort: resolved.sort,
            sortDirection: resolved.sortDirection,
            cacheTTL: resolved.cacheTTL,
        };
    }

    if (occurrence.source === "streaming") {
        const resolved = resolveStreamingExportOverrideForOccurrence(occurrence, overrides);
        const streamingCatalog = { ...occurrence.exportCatalog };
        delete (streamingCatalog as { cacheTTL?: unknown }).cacheTTL;
        if (!resolved) {
            return { ...streamingCatalog };
        }

        return {
            ...streamingCatalog,
            ...(resolved.sort !== undefined ? { sort: resolved.sort } : {}),
            ...(resolved.sortDirection !== undefined ? { sortDirection: resolved.sortDirection } : {}),
        };
    }

    if (occurrence.source === "letterboxd") {
        const resolved = resolveLetterboxdExportOverrideForOccurrence(occurrence, overrides);
        const letterboxdCatalog = { ...occurrence.exportCatalog };
        delete (letterboxdCatalog as { sort?: unknown }).sort;
        delete (letterboxdCatalog as { order?: unknown }).order;
        delete (letterboxdCatalog as { sortDirection?: unknown }).sortDirection;
        if (!resolved) {
            return letterboxdCatalog;
        }

        return {
            ...letterboxdCatalog,
            cacheTTL: resolved.cacheTTL,
        };
    }

    return { ...occurrence.exportCatalog };
}

export const applyMDBListExportOverrideToCatalog = applyExportOverrideToCatalog;

const normalizeMatchValue = (value: string) => value.trim().toLowerCase();

export function matchesWidgetNameRule(
    occurrence: AIOMetadataCatalogOccurrence,
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-group" | "trakt-group" | "streaming-group" }>
) {
    const widgetNames = rule.match.widgetNames || [];
    return widgetNames.some((name) => normalizeMatchValue(name) === normalizeMatchValue(occurrence.widgetName));
}

export function matchesNamePrefixRule(
    occurrence: AIOMetadataCatalogOccurrence,
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-group" | "trakt-group" | "streaming-group" }>
) {
    const prefixes = rule.match.namePrefixes || [];
    return prefixes.some((prefix) =>
        occurrence.exportCatalog.name.startsWith(prefix)
        || occurrence.rawName.startsWith(prefix)
    );
}

export function matchesWatchlistRule(
    occurrence: AIOMetadataCatalogOccurrence,
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "trakt-watchlist" }>
) {
    const idMatch = rule.match.catalogIds.some((catalogId) => catalogId === occurrence.exportCatalog.id);
    const nameMatch = (rule.match.names || []).some((name) => name === occurrence.exportCatalog.name);
    return idMatch || nameMatch;
}

export function matchesCatalogRule(
    occurrence: AIOMetadataCatalogOccurrence,
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-catalog" | "trakt-catalog" }>
) {
    const exportNameWithoutWidget = normalizeNamePrefix(occurrence.exportCatalog.name);
    const matchCandidates = Array.from(new Set([
        occurrence.exportCatalog.name,
        occurrence.rawName,
        occurrence.itemName,
        exportNameWithoutWidget,
        stripCatalogTypeDecoration(exportNameWithoutWidget),
    ].filter(Boolean)));
    const idMatch = (rule.match.catalogIds || []).some((catalogId) => catalogId === occurrence.exportCatalog.id);
    const nameMatch = (rule.match.names || []).some((name) =>
        matchCandidates.some((candidate) => normalizeMatchValue(name) === normalizeMatchValue(candidate))
    );
    const prefixMatch = (rule.match.namePrefixes || []).some((prefix) =>
        matchCandidates.some((candidate) => candidate.startsWith(prefix))
    );

    return idMatch || nameMatch || prefixMatch;
}

const mergeOverrideValues = <T extends Record<string, unknown>>(
    existing: T | undefined,
    values: Partial<T>,
    mode: AIOMetadataTemplateApplyMode
) => {
    const nextValue: T = { ...(existing || {} as T) };

    Object.entries(values).forEach(([key, incomingValue]) => {
        if (incomingValue === undefined) return;

        if (mode === "fill-unset" && nextValue[key as keyof T] !== undefined) {
            return;
        }

        nextValue[key as keyof T] = incomingValue as T[keyof T];
    });

    return nextValue;
};

const getTemplateRuleSpecificity = (rule: AIOMetadataTemplateTargetRule) => {
    if (rule.kind === "trakt-watchlist") {
        return 500;
    }

    if (rule.kind === "mdblist-catalog" || rule.kind === "trakt-catalog") {
        const hasExactIds = (rule.match.catalogIds || []).length > 0;
        const hasExactNames = (rule.match.names || []).length > 0;
        const hasPrefixes = (rule.match.namePrefixes || []).length > 0;

        if (hasExactIds || hasExactNames) return 400;
        if (hasPrefixes) return 300;
        return 250;
    }

    const hasWidgetNames = (rule.match.widgetNames || []).length > 0;
    const hasPrefixes = (rule.match.namePrefixes || []).length > 0;

    if (hasWidgetNames || hasPrefixes) return 200;
    return 100;
};

const removeOverrideFields = <T extends Record<string, unknown>>(
    existing: T | undefined,
    fields: (keyof T)[]
) => {
    if (!existing) return undefined;

    const nextValue = { ...existing };
    fields.forEach((field) => {
        delete nextValue[field];
    });

    return Object.keys(nextValue).length > 0 ? nextValue : undefined;
};

const getTemplateGroupRuleSource = (
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-group" | "trakt-group" | "streaming-group" }>
): AIOMetadataCatalogSource => {
    if (rule.kind === "mdblist-group") return "mdblist";
    if (rule.kind === "trakt-group") return "trakt";
    return "streaming";
};

const getTemplateCatalogRuleSource = (
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-catalog" | "trakt-catalog" }>
): AIOMetadataCatalogSource => {
    if (rule.kind === "mdblist-catalog") return "mdblist";
    return "trakt";
};

const getMatchingGroupRuleOccurrences = (
    canonicalOccurrences: AIOMetadataCanonicalOccurrence[],
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-group" | "trakt-group" | "streaming-group" }>
) => canonicalOccurrences.filter((occurrence) =>
    occurrence.source === getTemplateGroupRuleSource(rule)
    && (matchesWidgetNameRule(occurrence, rule) || matchesNamePrefixRule(occurrence, rule))
);

const getFullyMatchedWidgetIds = (
    canonicalOccurrences: AIOMetadataCanonicalOccurrence[],
    rule: Extract<AIOMetadataTemplateTargetRule, { kind: "mdblist-group" | "trakt-group" | "streaming-group" }>
) => {
    const source = getTemplateGroupRuleSource(rule);
    const widgetToSourceOccurrences = new Map<string, AIOMetadataCanonicalOccurrence[]>();

    canonicalOccurrences.forEach((occurrence) => {
        if (occurrence.source !== source) return;

        const current = widgetToSourceOccurrences.get(occurrence.widgetId) || [];
        current.push(occurrence);
        widgetToSourceOccurrences.set(occurrence.widgetId, current);
    });

    return new Set(
        Array.from(widgetToSourceOccurrences.entries())
            .filter(([, occurrences]) =>
                occurrences.length > 0
                && occurrences.every((occurrence) =>
                    matchesWidgetNameRule(occurrence, rule) || matchesNamePrefixRule(occurrence, rule)
                )
            )
            .map(([widgetId]) => widgetId)
    );
};

export function applyAIOMetadataExportTemplate({
    inventory,
    currentOverrides,
    template,
    mode,
}: {
    inventory: AIOMetadataExportInventory;
    currentOverrides: AIOMetadataExportOverrideState;
    template: AIOMetadataExportTemplateDefinition;
    mode: AIOMetadataTemplateApplyMode;
}) {
    const canonicalOccurrences = Array.from(getCanonicalOccurrencesByComparisonKey(inventory).values());
    const nextOverrides: AIOMetadataExportOverrideState = {
        widgets: cloneSourceScopedOverrideMap(currentOverrides.widgets),
        items: cloneSourceScopedOverrideMap(currentOverrides.items),
        catalogs: { ...currentOverrides.catalogs },
    };
    const affectedComparisonKeys = new Set<string>();
    const orderedRules = template.rules
        .map((rule, index) => ({ rule, index, specificity: getTemplateRuleSpecificity(rule) }))
        .sort((left, right) => {
            if (left.specificity !== right.specificity) {
                return mode === "fill-unset"
                    ? right.specificity - left.specificity
                    : left.specificity - right.specificity;
            }

            return left.index - right.index;
        });

    orderedRules.forEach(({ rule }) => {
        if (rule.kind === "mdblist-group") {
            const matchingOccurrences = getMatchingGroupRuleOccurrences(canonicalOccurrences, rule);
            const fullyMatchedWidgetIds = getFullyMatchedWidgetIds(canonicalOccurrences, rule);
            const widgetFieldNames: (keyof AIOMetadataMDBListExportOverride)[] = ["sort", "order", "cacheTTL"];

            fullyMatchedWidgetIds.forEach((widgetId) => {
                nextOverrides.widgets[widgetId] = mergeScopedOverrideValues<AIOMetadataMDBListExportOverride>(
                    nextOverrides.widgets[widgetId],
                    "mdblist",
                    rule.values,
                    mode
                );

                const widgetOccurrences = canonicalOccurrences.filter((occurrence) =>
                    occurrence.source === "mdblist" && occurrence.widgetId === widgetId
                );
                widgetOccurrences.forEach((occurrence) => {
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

                if (mode === "replace-matching") {
                    widgetOccurrences.forEach((occurrence) => {
                        const nextItemOverride = removeScopedOverrideFields<AIOMetadataMDBListExportOverride>(
                            nextOverrides.items[occurrence.itemId],
                            "mdblist",
                            widgetFieldNames
                        );
                        if (nextItemOverride) {
                            nextOverrides.items[occurrence.itemId] = nextItemOverride;
                        } else {
                            delete nextOverrides.items[occurrence.itemId];
                        }

                        const nextCatalogOverride = removeOverrideFields(
                            nextOverrides.catalogs[occurrence.comparisonKey],
                            widgetFieldNames as unknown as (keyof AIOMetadataCatalogExportOverride)[]
                        );
                        if (nextCatalogOverride) {
                            nextOverrides.catalogs[occurrence.comparisonKey] = nextCatalogOverride;
                        } else {
                            delete nextOverrides.catalogs[occurrence.comparisonKey];
                        }
                    });
                }
            });

            matchingOccurrences
                .filter((occurrence) => !fullyMatchedWidgetIds.has(occurrence.widgetId))
                .forEach((occurrence) => {
                    nextOverrides.catalogs[occurrence.comparisonKey] = mergeOverrideValues(
                        nextOverrides.catalogs[occurrence.comparisonKey],
                        rule.values,
                        mode
                    );
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

            return;
        }

        if (rule.kind === "trakt-group") {
            const matchingOccurrences = getMatchingGroupRuleOccurrences(canonicalOccurrences, rule);
            const fullyMatchedWidgetIds = getFullyMatchedWidgetIds(canonicalOccurrences, rule);
            const widgetFieldNames: (keyof AIOMetadataTraktExportOverride)[] = ["sort", "sortDirection", "cacheTTL"];

            fullyMatchedWidgetIds.forEach((widgetId) => {
                nextOverrides.widgets[widgetId] = mergeScopedOverrideValues<AIOMetadataTraktExportOverride>(
                    nextOverrides.widgets[widgetId],
                    "trakt",
                    rule.values,
                    mode
                );

                const widgetOccurrences = canonicalOccurrences.filter((occurrence) =>
                    occurrence.source === "trakt" && occurrence.widgetId === widgetId
                );
                widgetOccurrences.forEach((occurrence) => {
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

                if (mode === "replace-matching") {
                    widgetOccurrences.forEach((occurrence) => {
                        const nextItemOverride = removeScopedOverrideFields<AIOMetadataTraktExportOverride>(
                            nextOverrides.items[occurrence.itemId],
                            "trakt",
                            widgetFieldNames
                        );
                        if (nextItemOverride) {
                            nextOverrides.items[occurrence.itemId] = nextItemOverride;
                        } else {
                            delete nextOverrides.items[occurrence.itemId];
                        }

                        const nextCatalogOverride = removeOverrideFields(
                            nextOverrides.catalogs[occurrence.comparisonKey],
                            widgetFieldNames as unknown as (keyof AIOMetadataCatalogExportOverride)[]
                        );
                        if (nextCatalogOverride) {
                            nextOverrides.catalogs[occurrence.comparisonKey] = nextCatalogOverride;
                        } else {
                            delete nextOverrides.catalogs[occurrence.comparisonKey];
                        }
                    });
                }
            });

            matchingOccurrences
                .filter((occurrence) => !fullyMatchedWidgetIds.has(occurrence.widgetId))
                .forEach((occurrence) => {
                    nextOverrides.catalogs[occurrence.comparisonKey] = mergeOverrideValues(
                        nextOverrides.catalogs[occurrence.comparisonKey],
                        rule.values,
                        mode
                    );
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

            return;
        }

        if (rule.kind === "streaming-group") {
            const matchingOccurrences = getMatchingGroupRuleOccurrences(canonicalOccurrences, rule);
            const fullyMatchedWidgetIds = getFullyMatchedWidgetIds(canonicalOccurrences, rule);
            const widgetFieldNames: (keyof AIOMetadataStreamingExportOverride)[] = ["sort", "sortDirection"];

            fullyMatchedWidgetIds.forEach((widgetId) => {
                nextOverrides.widgets[widgetId] = mergeScopedOverrideValues<AIOMetadataStreamingExportOverride>(
                    nextOverrides.widgets[widgetId],
                    "streaming",
                    rule.values,
                    mode
                );

                const widgetOccurrences = canonicalOccurrences.filter((occurrence) =>
                    occurrence.source === "streaming" && occurrence.widgetId === widgetId
                );
                widgetOccurrences.forEach((occurrence) => {
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

                if (mode === "replace-matching") {
                    widgetOccurrences.forEach((occurrence) => {
                        const nextItemOverride = removeScopedOverrideFields<AIOMetadataStreamingExportOverride>(
                            nextOverrides.items[occurrence.itemId],
                            "streaming",
                            widgetFieldNames
                        );
                        if (nextItemOverride) {
                            nextOverrides.items[occurrence.itemId] = nextItemOverride;
                        } else {
                            delete nextOverrides.items[occurrence.itemId];
                        }

                        const nextCatalogOverride = removeOverrideFields(
                            nextOverrides.catalogs[occurrence.comparisonKey],
                            widgetFieldNames as unknown as (keyof AIOMetadataCatalogExportOverride)[]
                        );
                        if (nextCatalogOverride) {
                            nextOverrides.catalogs[occurrence.comparisonKey] = nextCatalogOverride;
                        } else {
                            delete nextOverrides.catalogs[occurrence.comparisonKey];
                        }
                    });
                }
            });

            matchingOccurrences
                .filter((occurrence) => !fullyMatchedWidgetIds.has(occurrence.widgetId))
                .forEach((occurrence) => {
                    nextOverrides.catalogs[occurrence.comparisonKey] = mergeOverrideValues(
                        nextOverrides.catalogs[occurrence.comparisonKey],
                        rule.values,
                        mode
                    );
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

            return;
        }

        if (rule.kind === "mdblist-catalog" || rule.kind === "trakt-catalog") {
            const source = getTemplateCatalogRuleSource(rule);

            canonicalOccurrences
                .filter((occurrence) => occurrence.source === source && matchesCatalogRule(occurrence, rule))
                .forEach((occurrence) => {
                    nextOverrides.catalogs[occurrence.comparisonKey] = mergeOverrideValues(
                        nextOverrides.catalogs[occurrence.comparisonKey],
                        rule.values,
                        mode
                    );
                    affectedComparisonKeys.add(occurrence.comparisonKey);
                });

            return;
        }

        canonicalOccurrences
            .filter((occurrence) => occurrence.source === "trakt" && matchesWatchlistRule(occurrence, rule))
            .forEach((occurrence) => {
                nextOverrides.catalogs[occurrence.comparisonKey] = mergeOverrideValues(
                    nextOverrides.catalogs[occurrence.comparisonKey],
                    rule.values,
                    mode
                );
                affectedComparisonKeys.add(occurrence.comparisonKey);
            });
    });

    return {
        nextOverrides,
        appliedCatalogCount: affectedComparisonKeys.size,
        affectedComparisonKeys: Array.from(affectedComparisonKeys),
    };
}

export function getDefaultAIOMetadataExportOverrides({
    inventory,
    currentOverrides,
}: {
    inventory: AIOMetadataExportInventory;
    currentOverrides: AIOMetadataExportOverrideState;
}) {
    return applyAIOMetadataExportTemplate({
        inventory,
        currentOverrides,
        template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
        mode: "fill-unset",
    }).nextOverrides;
}

export function buildAIOMetadataCatalogExport({
    inventory,
    selectedComparisonKeys,
    includeAll = false,
    exportSettingsOverrides,
}: {
    inventory: AIOMetadataExportInventory;
    selectedComparisonKeys?: Iterable<string>;
    includeAll?: boolean;
    exportSettingsOverrides?: AIOMetadataExportOverrideState;
}) {
    const selectedKeys = includeAll
        ? null
        : new Set(selectedComparisonKeys || []);
    const uniqueCatalogs = new Map<string, AIOMetadataCanonicalOccurrence>();

    getCanonicalOccurrencesByComparisonKey(inventory).forEach((occurrence, comparisonKey) => {
        if (selectedKeys && !selectedKeys.has(comparisonKey)) {
            return;
        }

        uniqueCatalogs.set(comparisonKey, occurrence);
    });

    const catalogs = Array.from(uniqueCatalogs.values())
        .sort((left, right) => {
            if (left.widgetOrder !== right.widgetOrder) {
                return left.widgetOrder - right.widgetOrder;
            }

            return left.exportCatalog.name.localeCompare(right.exportCatalog.name, undefined, { sensitivity: "base" });
        })
        .map((occurrence) => applyExportOverrideToCatalog(occurrence, exportSettingsOverrides));

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        catalogs: applyExportNameNumbering(catalogs),
    };
}

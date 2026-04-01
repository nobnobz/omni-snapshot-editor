import { CatalogFallback } from "./catalog-fallbacks";
import { formatDisplayName } from "./utils";

type LooseCatalog = Record<string, unknown> & {
    id?: unknown;
    name?: unknown;
    type?: unknown;
    displayType?: unknown;
    metadata?: {
        mediatype?: unknown;
    };
};

export type AIOMetadataFallbackMap = Record<string, string | CatalogFallback>;
export type AIOMetadataCatalogSource = "mdblist" | "streaming" | "trakt";
export type AIOMetadataCatalogType = CatalogFallback["type"];

export type AIOMetadataNormalizedCatalog = {
    id: string;
    name: string;
    type: AIOMetadataCatalogType;
    source: AIOMetadataCatalogSource;
    displayType: AIOMetadataCatalogType;
    extraExportFields?: Record<string, unknown>;
};

export type ParsedAIOMetadataFallbacks = {
    fallbacks: AIOMetadataFallbackMap;
    addedCount: number;
    normalizedCatalogs: AIOMetadataNormalizedCatalog[];
};

type AIOMetadataCatalogIdentity = Pick<AIOMetadataNormalizedCatalog, "id" | "type" | "source">;

const CATALOG_TYPE_PREFIX_RE = /^(movie:|series:|anime:|all:)/;
const STREAMING_TYPE_SUFFIX_RE = /_(movie|series|show|tv|anime|all)$/;
const EXPORT_FIELD_WHITELIST = new Set([
    "showInHome",
    "sort",
    "order",
    "sortDirection",
    "cacheTTL",
    "genreSelection",
    "enableRatingPosters",
    "metadata",
    "randomizePerPage",
]);

export const stripAIOMetadataCatalogTypePrefix = (catalogId: string) => catalogId.replace(CATALOG_TYPE_PREFIX_RE, "");

export const normalizeAIOMetadataCatalogId = (catalogId: string) => {
    const strippedId = stripAIOMetadataCatalogTypePrefix(catalogId);

    if (!strippedId.startsWith("streaming.")) return strippedId;

    return strippedId.replace(STREAMING_TYPE_SUFFIX_RE, "");
};

export const normalizeAIOMetadataCatalogName = (name: string) => {
    const formattedName = formatDisplayName(name).trim();
    return formattedName.replace(/^\[([^\]]*?)\s+\]\s*/u, "[$1] ").replace(/\]\s{2,}/u, "] ");
};

const normalizeCatalogSource = (catalogId: string): AIOMetadataCatalogSource | undefined => {
    const strippedId = normalizeAIOMetadataCatalogId(catalogId);

    if (strippedId.startsWith("mdblist.")) return "mdblist";
    if (strippedId.startsWith("streaming.")) return "streaming";
    if (strippedId.startsWith("trakt.")) return "trakt";

    return undefined;
};

export const normalizeAIOMetadataCatalogValueType = (value: unknown): CatalogFallback["type"] | undefined => {
    if (typeof value !== "string") return undefined;

    if (value === "tv" || value === "show") return "series";
    if (value === "movie" || value === "series" || value === "anime" || value === "all") {
        return value;
    }

    return undefined;
};

export const normalizeAIOMetadataCatalogTypeFromId = (catalogId: string): CatalogFallback["type"] | undefined => {
    const strippedId = stripAIOMetadataCatalogTypePrefix(catalogId);
    const match = strippedId.match(STREAMING_TYPE_SUFFIX_RE);
    return normalizeAIOMetadataCatalogValueType(match?.[1]);
};

export const getAIOMetadataCatalogLookupKeys = (catalogId: string) => {
    const rawId = catalogId.trim().toLowerCase();
    const strippedId = stripAIOMetadataCatalogTypePrefix(rawId);
    const normalizedId = normalizeAIOMetadataCatalogId(rawId);

    return Array.from(new Set([rawId, strippedId, normalizedId].filter(Boolean)));
};

export const getAIOMetadataCatalogIdentityKey = (catalog: AIOMetadataCatalogIdentity) => {
    const normalizedId = normalizeAIOMetadataCatalogId(catalog.id).toLowerCase();

    if (catalog.source === "streaming") {
        return `${catalog.type}:${normalizedId}`;
    }

    return normalizedId;
};

export const getDefaultAIOMetadataExtraExportFields = (
    catalog: AIOMetadataCatalogIdentity
): Record<string, unknown> => {
    if (catalog.source === "mdblist") {
        return {
            sort: "default",
            order: "asc",
            cacheTTL: 43200,
            genreSelection: "standard",
            enableRatingPosters: true,
        };
    }

    if (catalog.source === "streaming") {
        return {
            enableRatingPosters: true,
        };
    }

    return {};
};

const mergeExtraExportFields = (
    existing?: Record<string, unknown>,
    incoming?: Record<string, unknown>
) => {
    if (!existing && !incoming) return undefined;
    if (!existing) return incoming;
    if (!incoming) return existing;

    const existingMetadata = existing.metadata;
    const incomingMetadata = incoming.metadata;

    return {
        ...existing,
        ...incoming,
        ...(
            isRecord(existingMetadata) || isRecord(incomingMetadata)
                ? {
                    metadata: {
                        ...(isRecord(existingMetadata) ? existingMetadata : {}),
                        ...(isRecord(incomingMetadata) ? incomingMetadata : {}),
                    },
                }
                : {}
        ),
    };
};

export const mergeAIOMetadataCatalogs = (
    existingCatalogs: AIOMetadataNormalizedCatalog[] | null | undefined,
    incomingCatalogs: AIOMetadataNormalizedCatalog[]
) => {
    const mergedCatalogs = new Map<string, AIOMetadataNormalizedCatalog>();

    (existingCatalogs || []).forEach((catalog) => {
        mergedCatalogs.set(getAIOMetadataCatalogIdentityKey(catalog), catalog);
    });

    incomingCatalogs.forEach((catalog) => {
        const identityKey = getAIOMetadataCatalogIdentityKey(catalog);
        const existingCatalog = mergedCatalogs.get(identityKey);

        if (!existingCatalog) {
            mergedCatalogs.set(identityKey, catalog);
            return;
        }

        mergedCatalogs.set(identityKey, {
            ...existingCatalog,
            ...catalog,
            extraExportFields: mergeExtraExportFields(
                existingCatalog.extraExportFields,
                catalog.extraExportFields
            ),
        });
    });

    return Array.from(mergedCatalogs.values());
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeCatalogType = (catalog: LooseCatalog): CatalogFallback["type"] | undefined => {
    const idType = typeof catalog.id === "string"
        ? normalizeAIOMetadataCatalogTypeFromId(catalog.id)
        : undefined;
    if (idType) return idType;

    const rawType = catalog.type || catalog.displayType || catalog.metadata?.mediatype;
    return normalizeAIOMetadataCatalogValueType(rawType);
};

const normalizeCatalogDisplayType = (catalog: LooseCatalog, fallbackType: CatalogFallback["type"]): CatalogFallback["type"] => {
    return normalizeAIOMetadataCatalogValueType(catalog.displayType)
        || normalizeAIOMetadataCatalogValueType(catalog.type)
        || fallbackType;
};

const extractExtraExportFields = (catalog: LooseCatalog) => {
    const entries = Object.entries(catalog).filter(([key]) => EXPORT_FIELD_WHITELIST.has(key));

    if (entries.length === 0) return undefined;

    return Object.fromEntries(entries);
};

const extractCatalogsList = (data: unknown): unknown[] | undefined => {
    if (Array.isArray(data)) return data;
    if (typeof data !== "object" || data === null) return undefined;

    const queue: unknown[] = [data];
    const seen = new Set<unknown>();

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current || typeof current !== "object" || seen.has(current)) continue;
        seen.add(current);

        const record = current as Record<string, unknown>;
        if (Array.isArray(record.catalogs)) {
            return record.catalogs;
        }

        ["config", "values", "data", "payload", "result"].forEach((key) => {
            if (record[key] && typeof record[key] === "object") {
                queue.push(record[key]);
            }
        });
    }

    return undefined;
};

export function parseAIOMetadataFallbacks(jsonText: string): ParsedAIOMetadataFallbacks {
    const data = JSON.parse(jsonText) as unknown;
    const catalogsList = extractCatalogsList(data);

    if (!Array.isArray(catalogsList)) {
        throw new Error("Invalid AIOMetadata format. Could not find catalogs array.");
    }

    const fallbacks: AIOMetadataFallbackMap = {};
    const normalizedCatalogs: AIOMetadataNormalizedCatalog[] = [];
    let addedCount = 0;

    catalogsList.forEach((entry) => {
        const catalog = entry as LooseCatalog;
        if (typeof catalog.id !== "string" || typeof catalog.name !== "string") return;

        const normalizedType = normalizeCatalogType(catalog);
        const normalizedSource = normalizeCatalogSource(catalog.id);
        const normalizedId = normalizeAIOMetadataCatalogId(catalog.id);
        const normalizedName = normalizeAIOMetadataCatalogName(catalog.name);
        const fallbackEntry = normalizedType
            ? { name: normalizedName, type: normalizedType }
            : normalizedName;
        getAIOMetadataCatalogLookupKeys(catalog.id).forEach((key) => {
            if (!fallbacks[key]) {
                fallbacks[key] = fallbackEntry;
            }
        });

        if (normalizedType && normalizedSource) {
            const displayType = normalizeCatalogDisplayType(catalog, normalizedType);
            const extraExportFields = extractExtraExportFields(catalog);
            normalizedCatalogs.push({
                id: normalizedId,
                name: normalizedName,
                type: normalizedType,
                source: normalizedSource,
                displayType,
                ...(extraExportFields ? { extraExportFields } : {}),
            });
        }
        addedCount += 1;
    });

    return { fallbacks, addedCount, normalizedCatalogs };
}

import { CatalogFallback } from "./catalog-fallbacks";

type LooseCatalog = {
    id?: unknown;
    name?: unknown;
    type?: unknown;
    displayType?: unknown;
    metadata?: {
        mediatype?: unknown;
    };
};

export type AIOMetadataFallbackMap = Record<string, string | CatalogFallback>;

export type ParsedAIOMetadataFallbacks = {
    fallbacks: AIOMetadataFallbackMap;
    addedCount: number;
};

const normalizeCatalogType = (catalog: LooseCatalog): CatalogFallback["type"] | undefined => {
    const rawType = catalog.type || catalog.displayType || catalog.metadata?.mediatype;
    if (typeof rawType !== "string") return undefined;

    if (rawType === "tv") return "series";
    if (rawType === "movie" || rawType === "series" || rawType === "anime" || rawType === "all") {
        return rawType;
    }

    return undefined;
};

export function parseAIOMetadataFallbacks(jsonText: string): ParsedAIOMetadataFallbacks {
    const data = JSON.parse(jsonText) as unknown;
    const catalogsList = Array.isArray(data)
        ? data
        : ((data as { config?: { catalogs?: unknown }; catalogs?: unknown })?.config?.catalogs
            || (data as { catalogs?: unknown })?.catalogs);

    if (!Array.isArray(catalogsList)) {
        throw new Error("Invalid AIOMetadata format. Could not find catalogs array.");
    }

    const fallbacks: AIOMetadataFallbackMap = {};
    let addedCount = 0;

    catalogsList.forEach((entry) => {
        const catalog = entry as LooseCatalog;
        if (typeof catalog.id !== "string" || typeof catalog.name !== "string") return;

        const normalizedType = normalizeCatalogType(catalog);
        fallbacks[catalog.id] = normalizedType
            ? { name: catalog.name, type: normalizedType }
            : catalog.name;
        addedCount += 1;
    });

    return { fallbacks, addedCount };
}

import { parseAIOMetadataFallbacks } from "./aiometadata-sync";

const MANIFEST_URL_RE = /\/stremio\/([^/]+)\/[^/]+\/manifest\.json$/;

const scorePayload = (jsonText: string) => {
    const parsed = parseAIOMetadataFallbacks(jsonText);

    return parsed.normalizedCatalogs.reduce((score, catalog) => {
        const extraFieldCount = Object.keys(catalog.extraExportFields || {}).length;
        const distinctDisplayTypeBonus = catalog.displayType !== catalog.type ? 1 : 0;

        return score + 100 + (extraFieldCount * 10) + distinctDisplayTypeBonus;
    }, 0);
};

const getCatalogCount = (jsonText: string) => parseAIOMetadataFallbacks(jsonText).normalizedCatalogs.length;

export const deriveAIOMetadataConfigLoadUrl = (manifestUrl: string) => {
    try {
        const url = new URL(manifestUrl);
        const match = url.pathname.match(MANIFEST_URL_RE);
        if (!match?.[1]) return null;

        return new URL(`/api/config/load/${match[1]}`, url.origin).toString();
    } catch {
        return null;
    }
};

export const pickRicherAIOMetadataPayload = (manifestPayload: string, configPayload?: string | null) => {
    if (!configPayload?.trim()) return manifestPayload;

    try {
        const manifestCatalogCount = getCatalogCount(manifestPayload);
        const configCatalogCount = getCatalogCount(configPayload);

        if (configCatalogCount !== manifestCatalogCount) {
            return configCatalogCount > manifestCatalogCount ? configPayload : manifestPayload;
        }

        const manifestScore = scorePayload(manifestPayload);
        const configScore = scorePayload(configPayload);
        return configScore > manifestScore ? configPayload : manifestPayload;
    } catch {
        return manifestPayload;
    }
};

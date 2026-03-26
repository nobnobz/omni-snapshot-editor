import { CatalogFallback } from "./catalog-fallbacks";

type CatalogLike = {
    id: string;
};

type CatalogGroupsRecord = Record<string, unknown>;

type MainCatalogGroupsRecord = Record<string, { subgroupNames?: unknown }>;

export type AIOMetadataFallbackMap = Record<string, string | CatalogFallback>;

export type AIOMetadataAffectedSubgroup = {
    subgroupName: string;
    parentUUID?: string;
    unmatchedCatalogIds: string[];
    mismatchCount: number;
    isEmpty: boolean;
    issueCount: number;
};

export type AIOMetadataAffectedMainGroup = {
    mainGroupId: string;
    affectedSubgroupNames: string[];
    unmatchedCatalogIds: string[];
    mismatchCount: number;
    emptySubgroupCount: number;
    issueCount: number;
};

export type AIOMetadataMismatchAnalysis = {
    unmatchedCatalogIds: string[];
    unmatchedLinkedCatalogIds: string[];
    affectedSubgroups: Record<string, AIOMetadataAffectedSubgroup>;
    affectedMainGroups: Record<string, AIOMetadataAffectedMainGroup>;
    affectedSubgroupCount: number;
    affectedMainGroupCount: number;
    emptySubgroupCount: number;
    hasMismatches: boolean;
    hasIssues: boolean;
};

type AnalyzeAIOMetadataCatalogMismatchesArgs = {
    catalogs?: CatalogLike[];
    catalogGroups?: CatalogGroupsRecord;
    mainCatalogGroups?: MainCatalogGroupsRecord;
    fallbacks: AIOMetadataFallbackMap;
};

const CATALOG_TYPE_PREFIX_RE = /^(movie:|series:|anime:|all:)/;
const IGNORED_CATALOG_IDS = new Set(["omni_empty_setup_placeholder"]);

const hasOwn = (record: Record<string, unknown>, key: string) =>
    Object.prototype.hasOwnProperty.call(record, key);

const uniqueStrings = (entries: string[]) => {
    const seen = new Set<string>();
    const result: string[] = [];

    entries.forEach((entry) => {
        if (!entry || seen.has(entry)) return;
        seen.add(entry);
        result.push(entry);
    });

    return result;
};

const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

export const stripAIOMetadataCatalogTypePrefix = (catalogId: string) =>
    catalogId.replace(CATALOG_TYPE_PREFIX_RE, "");

export const getAIOMetadataCatalogMatchKeys = (catalogId: string) =>
    uniqueStrings([catalogId, stripAIOMetadataCatalogTypePrefix(catalogId)]);

export const hasAIOMetadataCatalogMatch = (catalogId: string, fallbacks: AIOMetadataFallbackMap) =>
    getAIOMetadataCatalogMatchKeys(catalogId).some((key) => hasOwn(fallbacks, key));

export function analyzeAIOMetadataCatalogMismatches({
    catalogs = [],
    catalogGroups = {},
    mainCatalogGroups = {},
    fallbacks,
}: AnalyzeAIOMetadataCatalogMismatchesArgs): AIOMetadataMismatchAnalysis {
    const canEvaluateCatalogMatches = Object.keys(fallbacks).length > 0;

    const subgroupParentMap: Record<string, string> = {};
    const allKnownSubgroupNames = new Set<string>(Object.keys(catalogGroups));

    Object.entries(mainCatalogGroups).forEach(([mainGroupId, group]) => {
        toStringArray(group?.subgroupNames).forEach((subgroupName) => {
            allKnownSubgroupNames.add(subgroupName);
            if (!subgroupParentMap[subgroupName]) {
                subgroupParentMap[subgroupName] = mainGroupId;
            }
        });
    });

    const affectedSubgroups: Record<string, AIOMetadataAffectedSubgroup> = {};

    allKnownSubgroupNames.forEach((subgroupName) => {
        const rawCatalogIds = catalogGroups[subgroupName];
        const catalogIds = toStringArray(rawCatalogIds).filter((catalogId) => !IGNORED_CATALOG_IDS.has(catalogId));
        const unmatchedCatalogIds = uniqueStrings(
            (canEvaluateCatalogMatches ? catalogIds : [])
                .filter((catalogId) => !hasAIOMetadataCatalogMatch(catalogId, fallbacks))
        );
        const isEmpty = Array.isArray(rawCatalogIds) && rawCatalogIds.length === 0;

        if (unmatchedCatalogIds.length === 0 && !isEmpty) return;

        affectedSubgroups[subgroupName] = {
            subgroupName,
            parentUUID: subgroupParentMap[subgroupName],
            unmatchedCatalogIds,
            mismatchCount: unmatchedCatalogIds.length,
            isEmpty,
            issueCount: unmatchedCatalogIds.length + (isEmpty ? 1 : 0),
        };
    });

    const affectedMainGroups: Record<string, AIOMetadataAffectedMainGroup> = {};

    Object.values(affectedSubgroups).forEach((subgroup) => {
        if (!subgroup.parentUUID) return;

        const existing = affectedMainGroups[subgroup.parentUUID];
        if (existing) {
            existing.affectedSubgroupNames.push(subgroup.subgroupName);
            existing.unmatchedCatalogIds = uniqueStrings([
                ...existing.unmatchedCatalogIds,
                ...subgroup.unmatchedCatalogIds,
            ]);
            existing.mismatchCount += subgroup.mismatchCount;
            existing.emptySubgroupCount += subgroup.isEmpty ? 1 : 0;
            existing.issueCount += subgroup.issueCount;
            return;
        }

        affectedMainGroups[subgroup.parentUUID] = {
            mainGroupId: subgroup.parentUUID,
            affectedSubgroupNames: [subgroup.subgroupName],
            unmatchedCatalogIds: [...subgroup.unmatchedCatalogIds],
            mismatchCount: subgroup.mismatchCount,
            emptySubgroupCount: subgroup.isEmpty ? 1 : 0,
            issueCount: subgroup.issueCount,
        };
    });

    const unmatchedCatalogIds = uniqueStrings([
        ...catalogs
            .map((catalog) => catalog.id)
            .filter((catalogId) => catalogId && !IGNORED_CATALOG_IDS.has(catalogId))
            .filter(() => canEvaluateCatalogMatches)
            .filter((catalogId) => !hasAIOMetadataCatalogMatch(catalogId, fallbacks)),
        ...Object.values(affectedSubgroups).flatMap((subgroup) => subgroup.unmatchedCatalogIds),
    ]);
    const unmatchedLinkedCatalogIds = uniqueStrings(
        Object.values(affectedSubgroups).flatMap((subgroup) => subgroup.unmatchedCatalogIds)
    );
    const emptySubgroupCount = Object.values(affectedSubgroups).filter((subgroup) => subgroup.isEmpty).length;

    return {
        unmatchedCatalogIds,
        unmatchedLinkedCatalogIds,
        affectedSubgroups,
        affectedMainGroups,
        affectedSubgroupCount: Object.keys(affectedSubgroups).length,
        affectedMainGroupCount: Object.keys(affectedMainGroups).length,
        emptySubgroupCount,
        hasMismatches: canEvaluateCatalogMatches && unmatchedCatalogIds.length > 0,
        hasIssues: unmatchedLinkedCatalogIds.length > 0 || emptySubgroupCount > 0,
    };
}

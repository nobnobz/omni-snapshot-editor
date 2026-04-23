const normalizeCatalogList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
        : [];

const normalizeStringList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
        : [];

const buildCatalogSignature = (value: unknown) =>
    JSON.stringify(normalizeCatalogList(value).sort((left, right) => left.localeCompare(right)));

export const normalizeImportSetupImageUrl = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

export const hasImportSetupImageChanged = (currentValue: unknown, importedValue: unknown) =>
    normalizeImportSetupImageUrl(currentValue) !== normalizeImportSetupImageUrl(importedValue);

export const hasImportSetupCatalogsChanged = (currentValue: unknown, importedValue: unknown) => {
    const currentCatalogs = normalizeCatalogList(currentValue).sort((left, right) => left.localeCompare(right));
    const importedCatalogs = normalizeCatalogList(importedValue).sort((left, right) => left.localeCompare(right));

    if (currentCatalogs.length !== importedCatalogs.length) {
        return true;
    }

    return currentCatalogs.some((catalogId, index) => catalogId !== importedCatalogs[index]);
};

export const hasImportSetupGroupPlacementChanged = (currentValue: unknown, importedValue: unknown) => {
    const currentGroups = Array.from(new Set(normalizeStringList(currentValue))).sort((left, right) => left.localeCompare(right));
    const importedGroups = Array.from(new Set(normalizeStringList(importedValue))).sort((left, right) => left.localeCompare(right));

    if (currentGroups.length !== importedGroups.length) {
        return true;
    }

    return currentGroups.some((groupName, index) => groupName !== importedGroups[index]);
};

export const classifyImportSetupMainGroupSubgroups = ({
    currentCatalogGroups,
    currentMainGroupCatalogs,
    currentMainGroupSubgroupNames,
    importedSubgroups,
}: {
    currentCatalogGroups: Record<string, unknown>;
    currentMainGroupCatalogs?: Record<string, unknown>;
    currentMainGroupSubgroupNames?: unknown;
    importedSubgroups: Record<string, { catalogs: unknown }>;
}) => {
    const currentMainGroupSubgroupSet = new Set(normalizeStringList(currentMainGroupSubgroupNames));
    const hasCurrentMainGroup = currentMainGroupSubgroupNames !== undefined;
    const currentMainGroupCatalogsBySignature = new Map<string, string[]>();

    Object.entries(currentMainGroupCatalogs || {}).forEach(([name, catalogs]) => {
        const signature = buildCatalogSignature(catalogs);
        if (!currentMainGroupCatalogsBySignature.has(signature)) {
            currentMainGroupCatalogsBySignature.set(signature, []);
        }
        currentMainGroupCatalogsBySignature.get(signature)?.push(name);
    });

    const newSubgroupNames: string[] = [];
    const updatedSubgroupNames: string[] = [];
    const unchangedSubgroupNames: string[] = [];

    Object.entries(importedSubgroups).forEach(([subgroupName, subgroup]) => {
        const existsByName = Object.prototype.hasOwnProperty.call(currentCatalogGroups, subgroupName);

        if (!hasCurrentMainGroup) {
            if (existsByName) {
                updatedSubgroupNames.push(subgroupName);
            } else {
                newSubgroupNames.push(subgroupName);
            }
            return;
        }

        if (currentMainGroupSubgroupSet.has(subgroupName)) {
            unchangedSubgroupNames.push(subgroupName);
            return;
        }

        if (existsByName) {
            updatedSubgroupNames.push(subgroupName);
            return;
        }

        const signature = buildCatalogSignature(subgroup.catalogs);
        if ((currentMainGroupCatalogsBySignature.get(signature) || []).length > 0) {
            updatedSubgroupNames.push(subgroupName);
            return;
        }

        newSubgroupNames.push(subgroupName);
    });

    return {
        newSubgroupNames,
        updatedSubgroupNames,
        unchangedSubgroupNames,
    };
};

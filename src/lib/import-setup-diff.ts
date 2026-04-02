const normalizeCatalogList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
        : [];

const normalizeStringList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
        : [];

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
    currentMainGroupSubgroupNames,
    importedSubgroupNames,
}: {
    currentCatalogGroups: Record<string, unknown>;
    currentMainGroupSubgroupNames?: unknown;
    importedSubgroupNames: string[];
}) => {
    const currentMainGroupSubgroupSet = new Set(normalizeStringList(currentMainGroupSubgroupNames));
    const hasCurrentMainGroup = currentMainGroupSubgroupNames !== undefined;
    const newSubgroupNames: string[] = [];
    const updatedSubgroupNames: string[] = [];
    const unchangedSubgroupNames: string[] = [];

    importedSubgroupNames.forEach((subgroupName) => {
        const existsByName = Object.prototype.hasOwnProperty.call(currentCatalogGroups, subgroupName);

        if (!existsByName) {
            newSubgroupNames.push(subgroupName);
            return;
        }

        if (!hasCurrentMainGroup || !currentMainGroupSubgroupSet.has(subgroupName)) {
            updatedSubgroupNames.push(subgroupName);
            return;
        }

        unchangedSubgroupNames.push(subgroupName);
    });

    return {
        newSubgroupNames,
        updatedSubgroupNames,
        unchangedSubgroupNames,
    };
};

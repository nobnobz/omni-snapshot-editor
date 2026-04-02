const normalizeCatalogList = (value: unknown): string[] =>
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

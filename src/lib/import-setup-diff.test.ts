import { describe, expect, it } from "vitest";

import {
    classifyImportSetupMainGroupSubgroups,
    hasImportSetupCatalogsChanged,
    hasImportSetupGroupPlacementChanged,
    hasImportSetupImageChanged,
    normalizeImportSetupImageUrl,
} from "./import-setup-diff";

describe("import setup image diff", () => {
    it("normalizes empty image values", () => {
        expect(normalizeImportSetupImageUrl(undefined)).toBe("");
        expect(normalizeImportSetupImageUrl(null)).toBe("");
        expect(normalizeImportSetupImageUrl("   ")).toBe("");
    });

    it("does not flag identical URLs", () => {
        expect(hasImportSetupImageChanged("https://example.com/image.jpg", "https://example.com/image.jpg")).toBe(false);
    });

    it("ignores surrounding whitespace", () => {
        expect(hasImportSetupImageChanged(" https://example.com/image.jpg ", "https://example.com/image.jpg")).toBe(false);
    });

    it("flags empty to populated image changes", () => {
        expect(hasImportSetupImageChanged("", "https://example.com/image.jpg")).toBe(true);
    });

    it("flags populated to empty image changes", () => {
        expect(hasImportSetupImageChanged("https://example.com/image.jpg", "")).toBe(true);
    });
});

describe("import setup catalog diff", () => {
    it("does not flag identical catalogs", () => {
        expect(hasImportSetupCatalogsChanged(["a", "b"], ["b", "a"])).toBe(false);
    });

    it("flags changed catalogs", () => {
        expect(hasImportSetupCatalogsChanged(["a"], ["a", "b"])).toBe(true);
    });
});

describe("import setup group placement diff", () => {
    it("does not flag identical group placement", () => {
        expect(hasImportSetupGroupPlacementChanged(["Collections"], ["Collections"])).toBe(false);
    });

    it("ignores order and duplicates when comparing group placement", () => {
        expect(hasImportSetupGroupPlacementChanged(["Lists", "Collections", "Lists"], ["Collections", "Lists"])).toBe(false);
    });

    it("flags subgroup moves between groups", () => {
        expect(hasImportSetupGroupPlacementChanged(["Collections"], ["Lists"])).toBe(true);
    });

    it("flags moves between grouped and unassigned states", () => {
        expect(hasImportSetupGroupPlacementChanged(["Collections"], [])).toBe(true);
        expect(hasImportSetupGroupPlacementChanged([], ["Collections"])).toBe(true);
    });
});

describe("import setup basic main-group diff", () => {
    it("does not mark already-linked existing subgroups as updates", () => {
        expect(classifyImportSetupMainGroupSubgroups({
            currentCatalogGroups: {
                Existing: ["movie:a"],
            },
            currentMainGroupSubgroupNames: ["Existing"],
            importedSubgroupNames: ["Existing"],
        })).toEqual({
            newSubgroupNames: [],
            updatedSubgroupNames: [],
            unchangedSubgroupNames: ["Existing"],
        });
    });

    it("marks existing subgroups as updates when they are not linked to the current main group yet", () => {
        expect(classifyImportSetupMainGroupSubgroups({
            currentCatalogGroups: {
                Existing: ["movie:a"],
            },
            currentMainGroupSubgroupNames: [],
            importedSubgroupNames: ["Existing"],
        })).toEqual({
            newSubgroupNames: [],
            updatedSubgroupNames: ["Existing"],
            unchangedSubgroupNames: [],
        });
    });

    it("marks existing subgroups as updates when the main group is new", () => {
        expect(classifyImportSetupMainGroupSubgroups({
            currentCatalogGroups: {
                Existing: ["movie:a"],
            },
            importedSubgroupNames: ["Existing"],
        })).toEqual({
            newSubgroupNames: [],
            updatedSubgroupNames: ["Existing"],
            unchangedSubgroupNames: [],
        });
    });

    it("keeps new subgroup names in the new bucket", () => {
        expect(classifyImportSetupMainGroupSubgroups({
            currentCatalogGroups: {},
            currentMainGroupSubgroupNames: [],
            importedSubgroupNames: ["Fresh"],
        })).toEqual({
            newSubgroupNames: ["Fresh"],
            updatedSubgroupNames: [],
            unchangedSubgroupNames: [],
        });
    });
});

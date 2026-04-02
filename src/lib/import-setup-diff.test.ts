import { describe, expect, it } from "vitest";

import {
    hasImportSetupCatalogsChanged,
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

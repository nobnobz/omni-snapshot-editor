import { describe, expect, it } from "vitest";
import { buildLargePerfFixture } from "./perf-fixture";

describe("buildLargePerfFixture", () => {
    it("produces a reproducible large fixture shape", () => {
        const fixture = buildLargePerfFixture();

        expect(fixture.mainGroupCount).toBe(80);
        expect(fixture.subgroupCount).toBe(400);
        expect(fixture.linkedCatalogCount).toBe(2000);
        expect(fixture.manifestCatalogCount).toBe(800);
        expect(fixture.fallbackCount).toBeGreaterThanOrEqual(1500);
        expect(Object.keys(fixture.config.values?.main_catalog_groups || {})).toHaveLength(80);
        expect(Object.keys(fixture.config.values?.catalog_groups || {})).toHaveLength(400);
        expect((fixture.config.catalogs || [])).toHaveLength(800);
    });
});

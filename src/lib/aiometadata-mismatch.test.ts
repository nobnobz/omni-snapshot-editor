import { describe, expect, it } from "vitest";
import {
    analyzeAIOMetadataCatalogMismatches,
    getAIOMetadataCatalogMatchKeys,
    hasAIOMetadataCatalogMatch,
    stripAIOMetadataCatalogTypePrefix,
} from "./aiometadata-mismatch";

describe("aiometadata mismatch analysis", () => {
    it("matches prefixed Omni catalog ids against base AIOMetadata ids", () => {
        expect(stripAIOMetadataCatalogTypePrefix("movie:mdblist.123")).toBe("mdblist.123");
        expect(getAIOMetadataCatalogMatchKeys("series:show.one")).toEqual(["series:show.one", "show.one"]);
        expect(hasAIOMetadataCatalogMatch("movie:mdblist.123", { "mdblist.123": "List" })).toBe(true);
    });

    it("collects affected subgroups and main groups from unmatched catalogs", () => {
        const result = analyzeAIOMetadataCatalogMismatches({
            catalogs: [
                { id: "movie:mdblist.123" },
                { id: "movie:missing.one" },
            ],
            catalogGroups: {
                Drama: ["movie:mdblist.123", "movie:missing.one"],
                Kids: ["series:show.one"],
            },
            mainCatalogGroups: {
                groupA: { subgroupNames: ["Drama"] },
                groupB: { subgroupNames: ["Kids"] },
            },
            fallbacks: {
                "mdblist.123": "Known List",
                "show.one": "Show One",
            },
        });

        expect(result.unmatchedCatalogIds).toEqual(["movie:missing.one"]);
        expect(result.unmatchedLinkedCatalogIds).toEqual(["movie:missing.one"]);
        expect(result.affectedSubgroupCount).toBe(1);
        expect(result.affectedMainGroupCount).toBe(1);
        expect(result.affectedSubgroups.Drama).toEqual({
            subgroupName: "Drama",
            parentUUID: "groupA",
            unmatchedCatalogIds: ["movie:missing.one"],
            mismatchCount: 1,
            isEmpty: false,
            issueCount: 1,
        });
        expect(result.affectedMainGroups.groupA).toEqual({
            mainGroupId: "groupA",
            affectedSubgroupNames: ["Drama"],
            unmatchedCatalogIds: ["movie:missing.one"],
            mismatchCount: 1,
            emptySubgroupCount: 0,
            issueCount: 1,
        });
    });

    it("ignores placeholders and keeps unassigned subgroup mismatches local", () => {
        const result = analyzeAIOMetadataCatalogMismatches({
            catalogs: [{ id: "omni_empty_setup_placeholder" }],
            catalogGroups: {
                Loose: ["movie:missing.one", "omni_empty_setup_placeholder"],
            },
            mainCatalogGroups: {},
            fallbacks: {
                "known.one": "Known",
            },
        });

        expect(result.unmatchedCatalogIds).toEqual(["movie:missing.one"]);
        expect(result.unmatchedLinkedCatalogIds).toEqual(["movie:missing.one"]);
        expect(result.affectedSubgroups.Loose?.parentUUID).toBeUndefined();
        expect(result.affectedMainGroups).toEqual({});
    });

    it("tracks empty subgroups as local issues without adding linked mismatches", () => {
        const result = analyzeAIOMetadataCatalogMismatches({
            catalogs: [{ id: "movie:known.one" }],
            catalogGroups: {
                EmptyOne: [],
            },
            mainCatalogGroups: {
                groupA: { subgroupNames: ["EmptyOne"] },
            },
            fallbacks: {
                "known.one": "Known",
            },
        });

        expect(result.unmatchedCatalogIds).toEqual([]);
        expect(result.unmatchedLinkedCatalogIds).toEqual([]);
        expect(result.emptySubgroupCount).toBe(1);
        expect(result.hasIssues).toBe(true);
        expect(result.affectedSubgroups.EmptyOne).toEqual({
            subgroupName: "EmptyOne",
            parentUUID: "groupA",
            unmatchedCatalogIds: [],
            mismatchCount: 0,
            isEmpty: true,
            issueCount: 1,
        });
        expect(result.affectedMainGroups.groupA).toEqual({
            mainGroupId: "groupA",
            affectedSubgroupNames: ["EmptyOne"],
            unmatchedCatalogIds: [],
            mismatchCount: 0,
            emptySubgroupCount: 1,
            issueCount: 1,
        });
    });

    it("does not count a subgroup with unmatched linked catalogs as empty", () => {
        const result = analyzeAIOMetadataCatalogMismatches({
            catalogs: [{ id: "all:mdblist.149584" }],
            catalogGroups: {
                "AMC+": ["all:mdblist.149584"],
            },
            mainCatalogGroups: {
                groupA: { subgroupNames: ["AMC+"] },
            },
            fallbacks: {
                "known.one": "Known",
            },
        });

        expect(result.unmatchedLinkedCatalogIds).toEqual(["all:mdblist.149584"]);
        expect(result.affectedSubgroups["AMC+"]).toEqual({
            subgroupName: "AMC+",
            parentUUID: "groupA",
            unmatchedCatalogIds: ["all:mdblist.149584"],
            mismatchCount: 1,
            isEmpty: false,
            issueCount: 1,
        });
    });

    it("separates linked-catalog mismatches from global catalog mismatches", () => {
        const result = analyzeAIOMetadataCatalogMismatches({
            catalogs: [
                { id: "movie:global.only" },
                { id: "movie:linked.one" },
            ],
            catalogGroups: {
                Drama: ["movie:linked.one"],
            },
            mainCatalogGroups: {
                groupA: { subgroupNames: ["Drama"] },
            },
            fallbacks: {},
        });

        expect(result.unmatchedCatalogIds).toEqual([]);
        expect(result.unmatchedLinkedCatalogIds).toEqual([]);

        const withFallbacks = analyzeAIOMetadataCatalogMismatches({
            catalogs: [
                { id: "movie:global.only" },
                { id: "movie:linked.one" },
            ],
            catalogGroups: {
                Drama: ["movie:linked.one"],
            },
            mainCatalogGroups: {
                groupA: { subgroupNames: ["Drama"] },
            },
            fallbacks: {
                "known.one": "Known",
            },
        });

        expect(withFallbacks.unmatchedCatalogIds).toEqual(["movie:global.only", "movie:linked.one"]);
        expect(withFallbacks.unmatchedLinkedCatalogIds).toEqual(["movie:linked.one"]);
    });
});

import { describe, expect, it } from "vitest";
import { mergeAIOMetadataCatalogs, parseAIOMetadataFallbacks } from "./aiometadata-sync";

describe("parseAIOMetadataFallbacks", () => {
    it("builds a fresh fallback map from AIOMetadata catalogs", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            catalogs: [
                { id: "new.movies", name: "New Movies", type: "movie" },
            ],
        }));

        expect(result).toEqual({
            addedCount: 1,
            fallbacks: {
                "new.movies": {
                    name: "New Movies",
                    type: "movie",
                },
            },
            normalizedCatalogs: [],
        });
    });

    it("supports nested config exports and normalizes tv to series", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            config: {
                catalogs: [
                    { id: "streaming.trending", name: "Trending Shows", metadata: { mediatype: "tv" } },
                ],
            },
        }));

        expect(result).toEqual({
            addedCount: 1,
            fallbacks: {
                "streaming.trending": {
                    name: "Trending Shows",
                    type: "series",
                },
            },
            normalizedCatalogs: [
                {
                    id: "streaming.trending",
                    name: "Trending Shows",
                    type: "series",
                    source: "streaming",
                    displayType: "series",
                    extraExportFields: {
                        metadata: {
                            mediatype: "tv",
                        },
                    },
                },
            ],
        });
    });

    it("supports catalogs nested below values objects", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            values: {
                catalogs: [
                    { id: "mdblist.2", name: "Nested Movies", type: "movie", sort: "default" },
                ],
            },
        }));

        expect(result.normalizedCatalogs).toEqual([
            {
                id: "mdblist.2",
                name: "Nested Movies",
                type: "movie",
                source: "mdblist",
                displayType: "movie",
                extraExportFields: {
                    sort: "default",
                },
            },
        ]);
    });

    it("normalizes supported catalogs for authoritative comparisons", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            catalogs: [
                { id: "mdblist.1", name: "Trending Movies", type: "movie" },
                { id: "trakt.list.22", name: "Collections", displayType: "all" },
            ],
        }));

        expect(result.normalizedCatalogs).toEqual([
            {
                id: "mdblist.1",
                name: "Trending Movies",
                type: "movie",
                source: "mdblist",
                displayType: "movie",
            },
            {
                id: "trakt.list.22",
                name: "Collections",
                type: "all",
                source: "trakt",
                displayType: "all",
            },
        ]);
    });

    it("preserves only supported export fields and keeps distinct display types when present", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            catalogs: [
                {
                    id: "streaming.cru",
                    name: "Crunchyroll Movies",
                    type: "movie",
                    displayType: "anime",
                    showInHome: true,
                    sort: "popularity",
                    sortDirection: "desc",
                    pageSize: 50,
                    extra: [
                        {
                            name: "genre",
                        },
                    ],
                    metadata: {
                        mediatype: "movie",
                        url: "https://example.com/list",
                    },
                },
            ],
        }));

        expect(result.normalizedCatalogs).toEqual([
            {
                id: "streaming.cru",
                name: "Crunchyroll Movies",
                type: "movie",
                source: "streaming",
                displayType: "anime",
                extraExportFields: {
                    showInHome: true,
                    sort: "popularity",
                    sortDirection: "desc",
                    metadata: {
                        mediatype: "movie",
                        url: "https://example.com/list",
                    },
                },
            },
        ]);
    });

    it("normalizes streaming suffix ids to their base catalog ids", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            catalogs: [
                {
                    id: "streaming.cru_movie",
                    name: "Crunchyroll Movies",
                    type: "anime",
                    displayType: "anime",
                    showInHome: true,
                    pageSize: 50,
                },
                {
                    id: "streaming.cru_series",
                    name: "Crunchyroll Shows",
                    type: "anime",
                    displayType: "anime",
                    showInHome: true,
                },
            ],
        }));

        expect(result.normalizedCatalogs).toEqual([
            {
                id: "streaming.cru",
                name: "Crunchyroll Movies",
                type: "movie",
                source: "streaming",
                displayType: "anime",
                extraExportFields: {
                    showInHome: true,
                },
            },
            {
                id: "streaming.cru",
                name: "Crunchyroll Shows",
                type: "series",
                source: "streaming",
                displayType: "anime",
                extraExportFields: {
                    showInHome: true,
                },
            },
        ]);
    });

    it("merges richer previously synced catalogs with newer sparse payloads", () => {
        expect(mergeAIOMetadataCatalogs([
            {
                id: "mdblist.1",
                name: "[Genre] Alpha Movies",
                type: "movie",
                source: "mdblist",
                displayType: "movie",
                extraExportFields: {
                    showInHome: true,
                    sort: "imdbpopular",
                    order: "asc",
                    cacheTTL: 86400,
                    metadata: {
                        url: "https://mdblist.com/lists/example/alpha",
                        author: "example",
                    },
                },
            },
        ], [
            {
                id: "mdblist.1",
                name: "[Genre] Alpha Movies",
                type: "movie",
                source: "mdblist",
                displayType: "movie",
                extraExportFields: {
                    showInHome: false,
                },
            },
        ])).toEqual([
            {
                id: "mdblist.1",
                name: "[Genre] Alpha Movies",
                type: "movie",
                source: "mdblist",
                displayType: "movie",
                extraExportFields: {
                    showInHome: false,
                    sort: "imdbpopular",
                    order: "asc",
                    cacheTTL: 86400,
                    metadata: {
                        url: "https://mdblist.com/lists/example/alpha",
                        author: "example",
                    },
                },
            },
        ]);
    });

    it("throws when no catalogs array exists", () => {
        expect(() => parseAIOMetadataFallbacks(JSON.stringify({ foo: "bar" }))).toThrow(
            "Invalid AIOMetadata format. Could not find catalogs array."
        );
    });
});

import { describe, expect, it } from "vitest";
import { parseAIOMetadataFallbacks } from "./aiometadata-sync";

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
        });
    });

    it("supports nested config exports and normalizes tv to series", () => {
        const result = parseAIOMetadataFallbacks(JSON.stringify({
            config: {
                catalogs: [
                    { id: "shows.trending", name: "Trending Shows", metadata: { mediatype: "tv" } },
                ],
            },
        }));

        expect(result).toEqual({
            addedCount: 1,
            fallbacks: {
                "shows.trending": {
                    name: "Trending Shows",
                    type: "series",
                },
            },
        });
    });

    it("throws when no catalogs array exists", () => {
        expect(() => parseAIOMetadataFallbacks(JSON.stringify({ foo: "bar" }))).toThrow(
            "Invalid AIOMetadata format. Could not find catalogs array."
        );
    });
});

import { describe, expect, it } from "vitest";
import { deriveAIOMetadataConfigLoadUrl, pickRicherAIOMetadataPayload } from "./aiometadata-source";

describe("aiometadata source helpers", () => {
    it("derives the config load endpoint from a manifest url", () => {
        expect(deriveAIOMetadataConfigLoadUrl(
            "https://example.com/stremio/1234-uuid/abcdef/manifest.json"
        )).toBe("https://example.com/api/config/load/1234-uuid");
    });

    it("returns null for non-manifest urls", () => {
        expect(deriveAIOMetadataConfigLoadUrl("https://example.com/configure")).toBeNull();
    });

    it("prefers the richer payload when an api config response contains more catalog metadata", () => {
        const manifestPayload = JSON.stringify({
            catalogs: [
                {
                    id: "mdblist.1",
                    name: "[Genre] Alpha Movies",
                    type: "movie",
                    showInHome: true,
                },
            ],
        });
        const configPayload = JSON.stringify({
            values: {
                catalogs: [
                    {
                        id: "mdblist.1",
                        name: "[Genre] Alpha Movies",
                        type: "movie",
                        showInHome: true,
                        sort: "default",
                        order: "asc",
                        cacheTTL: 86400,
                        metadata: {
                            url: "https://mdblist.com/lists/example/alpha",
                        },
                    },
                ],
            },
        });

        expect(pickRicherAIOMetadataPayload(manifestPayload, configPayload)).toBe(configPayload);
    });
});

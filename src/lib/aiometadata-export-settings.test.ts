import { describe, expect, it } from "vitest";
import {
    STREAMING_SORT_OPTIONS,
    TRAKT_SORT_OPTIONS,
    cacheTtlSecondsFromPreset,
    detectCacheTtlPreset,
} from "./aiometadata-export-settings";

describe("aiometadata export settings helpers", () => {
    it("maps cache TTL presets to seconds", () => {
        expect(cacheTtlSecondsFromPreset("5m")).toBe(300);
        expect(cacheTtlSecondsFromPreset("24h")).toBe(86400);
        expect(cacheTtlSecondsFromPreset("72h")).toBe(259200);
        expect(cacheTtlSecondsFromPreset("custom")).toBeUndefined();
        expect(cacheTtlSecondsFromPreset("inherit")).toBeUndefined();
    });

    it("detects known TTL presets and falls back to custom", () => {
        expect(detectCacheTtlPreset(300)).toBe("5m");
        expect(detectCacheTtlPreset(86400)).toBe("24h");
        expect(detectCacheTtlPreset(12345)).toBe("custom");
        expect(detectCacheTtlPreset(undefined)).toBe("custom");
    });

    it("exposes the observed Trakt sort options", () => {
        expect(TRAKT_SORT_OPTIONS.map((option) => option.value)).toEqual([
            "default",
            "rank",
            "added",
            "title",
            "released",
            "runtime",
            "popularity",
            "percentage",
            "imdb_rating",
            "tmdb_rating",
            "rt_tomatometer",
            "rt_audience",
            "metascore",
            "votes",
            "imdb_votes",
            "collected",
            "watched",
            "my_rating",
            "tmdb_votes",
            "random",
        ]);
    });

    it("exposes the observed Streaming sort options", () => {
        expect(STREAMING_SORT_OPTIONS.map((option) => option.value)).toEqual([
            "popularity",
            "release_date",
            "vote_average",
            "revenue",
        ]);
    });
});

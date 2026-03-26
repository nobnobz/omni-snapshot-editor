import { describe, expect, it } from "vitest";
import {
    MDBLIST_DEFAULT_BADGE_COLOR_VALUES,
    MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES,
    MDBLIST_DEFAULT_ENABLED_RATINGS,
    MDBLIST_RATING_KEYS,
    normalizeMdblistBadgeColorValues,
    normalizeMdblistBadgeTextOverrides,
    normalizeMdblistEnabledRatings,
    normalizeMdblistRatingOrder,
} from "./mdblist-ratings";

describe("MDBList rating helpers", () => {
    it("uses the default enabled ratings when the imported setting is missing", () => {
        expect(normalizeMdblistEnabledRatings(undefined)).toEqual(MDBLIST_DEFAULT_ENABLED_RATINGS);
    });

    it("keeps enabled ratings deterministic while preserving unknown entries", () => {
        expect(normalizeMdblistEnabledRatings(["score", "unknown", "imdb", "score", "tmdb"])).toEqual([
            "imdb",
            "tmdb",
            "score",
            "unknown",
        ]);
    });

    it("normalizes the rating order to the full canonical list and preserves unknown extras", () => {
        expect(normalizeMdblistRatingOrder(["tmdb", "imdb", "legacy"])).toEqual([
            "tmdb",
            "imdb",
            "trakt",
            "letterboxd",
            "tomatoes",
            "audience",
            "metacritic",
            "score",
            "score_average",
            "legacy",
        ]);
        expect(normalizeMdblistRatingOrder(undefined)).toEqual(MDBLIST_RATING_KEYS);
    });

    it("fills badge text defaults for every supported rating and preserves unknown keys", () => {
        expect(normalizeMdblistBadgeTextOverrides({
            imdb: "Custom",
            future_rating: "??",
        })).toEqual({
            future_rating: "??",
            trakt: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.trakt,
            imdb: "Custom",
            tmdb: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.tmdb,
            letterboxd: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.letterboxd,
            tomatoes: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.tomatoes,
            audience: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.audience,
            metacritic: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.metacritic,
            score: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.score,
            score_average: MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.score_average,
        });
    });

    it("falls back to the default badge text when an imported override is empty", () => {
        expect(normalizeMdblistBadgeTextOverrides({
            imdb: "",
        }).imdb).toBe(MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES.imdb);
    });

    it("fills badge color defaults for every supported rating and preserves imported colors", () => {
        expect(normalizeMdblistBadgeColorValues({
            trakt: "#123456",
            future_rating: "#654321",
        })).toEqual({
            future_rating: "#654321",
            trakt: "#123456",
            imdb: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.imdb,
            tmdb: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.tmdb,
            letterboxd: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.letterboxd,
            tomatoes: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.tomatoes,
            audience: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.audience,
            metacritic: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.metacritic,
            score: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.score,
            score_average: MDBLIST_DEFAULT_BADGE_COLOR_VALUES.score_average,
        });
    });
});

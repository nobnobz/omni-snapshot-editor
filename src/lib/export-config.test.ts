import { describe, expect, it } from "vitest";
import { decodeConfig } from "./config-utils";
import { buildExportConfig, buildPartialExportConfig } from "./export-config";
import {
    MDBLIST_DEFAULT_BADGE_COLOR_VALUES,
    MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES,
    MDBLIST_RATING_KEYS,
} from "./mdblist-ratings";

const wrap = (value: unknown) => ({
    _data: Buffer.from(JSON.stringify(value), "utf8").toString("base64")
});

const baseCatalogs = [
    { id: "movie:one", name: "One", enabled: true, showInHome: false },
    { id: "movie:two", name: "Two", enabled: true, showInHome: true }
];

const noSelectedCatalogs = [
    { id: "movie:one", name: "One", enabled: false, showInHome: false },
    { id: "movie:two", name: "Two", enabled: false, showInHome: false }
];

const baseCurrentValues = {
    main_catalog_groups: {
        mg1: { name: "Main", subgroupNames: ["Action", "Drama"] }
    },
    subgroup_order: {
        mg1: ["Action", "Drama"]
    },
    catalog_groups: {
        Action: ["movie:one"],
        Drama: ["movie:two"]
    },
    selected_catalogs: ["movie:one"],
    catalog_ordering: ["movie:one"],
    top_row_catalogs: [],
};

const baseInitialValues = {
    selected_catalogs: ["movie:one"],
    catalog_ordering: ["movie:one"],
    top_row_catalogs: [],
    main_catalog_groups: {
        mg1: { name: "Main", subgroupNames: ["Action"] }
    },
    subgroup_order: {
        mg1: ["Action"]
    },
    catalog_groups: {
        Action: ["movie:one"]
    },
};

const decodeEditablePayload = (result: ReturnType<typeof buildExportConfig>) =>
    decodeConfig(result.values || result.config || {}) as Record<string, unknown>;

const normalizeEditablePayload = (payload: Record<string, unknown>) => {
    const normalized = { ...payload };
    delete normalized.catalogs;
    return normalized;
};

describe("buildExportConfig", () => {
    it("preserves manifest-root settings while exporting updated catalogs and groups", () => {
        const originalConfig = {
            config: {
                catalogs: [
                    { id: "movie:one", name: "One", enabled: true, showInHome: false }
                ],
                main_catalog_groups: wrap({
                    mg1: { name: "Main", subgroupNames: ["Action"] }
                }),
                subgroup_order: wrap({
                    mg1: ["Action"]
                }),
                catalog_groups: wrap({
                    Action: ["movie:one"]
                }),
                regex_pattern_custom_names: wrap({
                    "movie:one": "Pattern One"
                }),
                selected_catalogs: wrap(["movie:one"]),
                catalog_ordering: wrap(["movie:one"]),
                top_row_catalogs: wrap([]),
                hide_spoilers: false,
            }
        };

        const result = buildExportConfig({
            originalConfig,
            currentValues: {
                catalogs: originalConfig.config.catalogs,
                main_catalog_groups: {
                    mg1: { name: "Main", subgroupNames: ["Action", "Drama"] }
                },
                subgroup_order: {
                    mg1: ["Action", "Drama"]
                },
                catalog_groups: {
                    Action: ["movie:one"],
                    Drama: ["movie:two"]
                },
                regex_pattern_custom_names: {
                    "movie:one": "Pattern One",
                    "movie:two": "Pattern Two"
                },
                selected_catalogs: ["movie:one"],
                catalog_ordering: ["movie:one"],
                top_row_catalogs: [],
                hide_spoilers: true,
            },
            initialValues: baseInitialValues,
            disabledKeys: new Set<string>(),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        expect(result.config?.hide_spoilers).toBe(true);
        expect(result.config?.catalogs).toEqual([
            { id: "movie:one", name: "One", enabled: true, showInHome: false },
            { id: "movie:two", name: "Two", enabled: true, showInHome: true }
        ]);
        expect(decodeConfig(result.config?.catalog_groups)).toEqual({
            Action: ["movie:one"],
            Drama: ["movie:two"]
        });
        expect(decodeConfig(result.config?.main_catalog_groups)).toEqual({
            mg1: { name: "Main", subgroupNames: ["Action", "Drama"] }
        });
        expect(decodeConfig(result.config?.regex_pattern_custom_names)).toEqual({
            "movie:one": "Pattern One",
            "movie:two": "Pattern Two"
        });
        expect(decodeConfig(result.config?.selected_catalogs)).toEqual(["movie:one", "movie:two"]);
        expect(decodeConfig(result.config?.catalog_ordering)).toEqual(["movie:one", "movie:two"]);
        expect(decodeConfig(result.config?.top_row_catalogs)).toEqual(["movie:two"]);
    });

    it("exports selected_catalogs explicitly as an empty wrapped array when no catalogs are selected", () => {
        const result = buildExportConfig({
            originalConfig: {
                values: {
                    catalog_ordering: wrap(["movie:one", "movie:two"]),
                    top_row_catalogs: wrap([]),
                    main_catalog_groups: wrap({}),
                    catalog_groups: wrap({}),
                }
            },
            currentValues: {
                catalog_ordering: ["movie:one", "movie:two"],
                top_row_catalogs: [],
                main_catalog_groups: {},
                catalog_groups: {},
            },
            initialValues: {
                catalog_ordering: ["movie:one", "movie:two"],
                top_row_catalogs: [],
            },
            disabledKeys: new Set<string>(),
            catalogs: noSelectedCatalogs,
            isSyntheticSession: false,
        });

        expect(result.values?.selected_catalogs).toEqual({ _data: "W10=" });
        expect(result.includedKeys).toContain("selected_catalogs");
        expect(decodeConfig(result.values?.selected_catalogs)).toEqual([]);
    });

    it("partial catalog export materializes selected_catalogs even when legacy input omitted it", () => {
        const result = buildPartialExportConfig({
            originalConfig: {
                values: {
                    catalog_ordering: wrap(["movie:one", "movie:two"]),
                    top_row_catalogs: wrap([]),
                    custom_catalog_names: wrap({}),
                },
                includedKeys: ["catalog_ordering", "top_row_catalogs", "custom_catalog_names"],
            },
            currentValues: {
                catalog_ordering: ["movie:one", "movie:two"],
                top_row_catalogs: [],
                custom_catalog_names: {},
            },
            disabledKeys: new Set<string>(),
            sectionKeys: ["selected_catalogs", "catalog_ordering", "top_row_catalogs", "custom_catalog_names"],
            catalogs: noSelectedCatalogs,
        });

        expect(result.values?.selected_catalogs).toEqual({ _data: "W10=" });
        expect(result.includedKeys).toContain("selected_catalogs");
        expect(decodeConfig(result.values?.selected_catalogs)).toEqual([]);
    });

    it("partial catalog export preserves non-empty selected_catalogs semantics", () => {
        const result = buildPartialExportConfig({
            originalConfig: {
                values: {
                    selected_catalogs: wrap(["movie:one"]),
                    catalog_ordering: wrap(["movie:one", "movie:two"]),
                    top_row_catalogs: wrap([]),
                }
            },
            currentValues: {
                catalog_ordering: ["movie:one", "movie:two"],
                top_row_catalogs: [],
            },
            disabledKeys: new Set<string>(),
            sectionKeys: ["selected_catalogs", "catalog_ordering", "top_row_catalogs"],
            catalogs: baseCatalogs,
        });

        expect(decodeConfig(result.values?.selected_catalogs)).toEqual(["movie:one", "movie:two"]);
        expect(result.includedKeys).toContain("selected_catalogs");
    });

    it("config-root export does not reintroduce pruned keys", () => {
        const originalConfig = {
            config: {
                catalogs: baseCatalogs,
                hide_spoilers: false,
                regex_pattern_custom_names: wrap({
                    "movie:one": "Legacy Pattern"
                }),
                selected_catalogs: wrap(["movie:one"]),
                catalog_ordering: wrap(["movie:one"]),
                top_row_catalogs: wrap([]),
                main_catalog_groups: wrap({
                    mg1: { name: "Main", subgroupNames: ["Action"] }
                }),
                subgroup_order: wrap({
                    mg1: ["Action"]
                }),
                catalog_groups: wrap({
                    Action: ["movie:one"]
                }),
            }
        };

        const result = buildExportConfig({
            originalConfig,
            currentValues: {
                ...baseCurrentValues
            },
            initialValues: baseInitialValues,
            disabledKeys: new Set(["hide_spoilers"]),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        const decoded = decodeEditablePayload(result);

        expect(decoded.hide_spoilers).toBeUndefined();
        expect(decoded.regex_pattern_custom_names).toBeUndefined();
        expect(decoded.catalog_groups).toEqual({
            Action: ["movie:one"],
            Drama: ["movie:two"]
        });
    });

    it("values-root and config-root export behave the same for the same effective state", () => {
        const valuesRoot = buildExportConfig({
            originalConfig: {
                values: {
                    hide_spoilers: false,
                    regex_pattern_custom_names: wrap({
                        "movie:one": "Legacy Pattern"
                    }),
                    main_catalog_groups: wrap({
                        mg1: { name: "Main", subgroupNames: ["Action"] }
                    }),
                    subgroup_order: wrap({
                        mg1: ["Action"]
                    }),
                    catalog_groups: wrap({
                        Action: ["movie:one"]
                    }),
                    selected_catalogs: wrap(["movie:one"]),
                    catalog_ordering: wrap(["movie:one"]),
                    top_row_catalogs: wrap([]),
                    mdblist_enabled_ratings: wrap(["tomatoes", "imdb"]),
                }
            },
            currentValues: {
                ...baseCurrentValues,
                mdblist_enabled_ratings: ["tomatoes", "imdb"],
            },
            initialValues: baseInitialValues,
            disabledKeys: new Set(["hide_spoilers"]),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        const configRoot = buildExportConfig({
            originalConfig: {
                config: {
                    catalogs: baseCatalogs,
                    hide_spoilers: false,
                    regex_pattern_custom_names: wrap({
                        "movie:one": "Legacy Pattern"
                    }),
                    main_catalog_groups: wrap({
                        mg1: { name: "Main", subgroupNames: ["Action"] }
                    }),
                    subgroup_order: wrap({
                        mg1: ["Action"]
                    }),
                    catalog_groups: wrap({
                        Action: ["movie:one"]
                    }),
                    selected_catalogs: wrap(["movie:one"]),
                    catalog_ordering: wrap(["movie:one"]),
                    top_row_catalogs: wrap([]),
                    mdblist_enabled_ratings: wrap(["tomatoes", "imdb"]),
                }
            },
            currentValues: {
                ...baseCurrentValues,
                mdblist_enabled_ratings: ["tomatoes", "imdb"],
            },
            initialValues: baseInitialValues,
            disabledKeys: new Set(["hide_spoilers"]),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        expect(
            normalizeEditablePayload(decodeEditablePayload(valuesRoot))
        ).toEqual(
            normalizeEditablePayload(decodeEditablePayload(configRoot))
        );
    });

    it("preserves mdblist_enabled_ratings in config-root exports", () => {
        const result = buildExportConfig({
            originalConfig: {
                config: {
                    catalogs: baseCatalogs,
                    selected_catalogs: wrap(["movie:one"]),
                    catalog_ordering: wrap(["movie:one"]),
                    top_row_catalogs: wrap([]),
                    mdblist_enabled_ratings: wrap(["tomatoes", "imdb"]),
                }
            },
            currentValues: {
                selected_catalogs: ["movie:one"],
                catalog_ordering: ["movie:one"],
                top_row_catalogs: [],
                mdblist_enabled_ratings: ["tomatoes", "imdb"],
            },
            initialValues: {
                selected_catalogs: ["movie:one"],
                catalog_ordering: ["movie:one"],
                top_row_catalogs: [],
            },
            disabledKeys: new Set<string>(),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        expect(decodeConfig(result.config?.mdblist_enabled_ratings)).toEqual(["imdb", "tomatoes"]);
    });

    it("normalizes and wraps all MDBList rating settings in full exports", () => {
        const result = buildExportConfig({
            originalConfig: {
                values: {
                    selected_catalogs: wrap(["movie:one"]),
                    catalog_ordering: wrap(["movie:one"]),
                    top_row_catalogs: wrap([]),
                }
            },
            currentValues: {
                selected_catalogs: ["movie:one"],
                catalog_ordering: ["movie:one"],
                top_row_catalogs: [],
                mdblist_enabled_ratings: ["score", "imdb", "future_rating"],
                mdblist_rating_order: ["tmdb", "future_rating"],
                mdblist_badge_text_overrides: { imdb: "Custom IMDb", future_rating: "??" },
                mdblist_badge_color_hex_values: { trakt: "#123456", future_rating: "#654321" },
            },
            initialValues: {
                selected_catalogs: ["movie:one"],
                catalog_ordering: ["movie:one"],
                top_row_catalogs: [],
            },
            disabledKeys: new Set<string>(),
            catalogs: baseCatalogs,
            isSyntheticSession: false,
        });

        expect(decodeConfig(result.values?.mdblist_enabled_ratings)).toEqual(["imdb", "score", "future_rating"]);
        expect(decodeConfig(result.values?.mdblist_rating_order)).toEqual([
            "tmdb",
            "trakt",
            "imdb",
            "letterboxd",
            "tomatoes",
            "audience",
            "metacritic",
            "score",
            "score_average",
            "future_rating",
        ]);
        expect(decodeConfig(result.values?.mdblist_badge_text_overrides)).toEqual({
            ...MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES,
            imdb: "Custom IMDb",
            future_rating: "??",
        });
        expect(decodeConfig(result.values?.mdblist_badge_color_hex_values)).toEqual({
            ...MDBLIST_DEFAULT_BADGE_COLOR_VALUES,
            trakt: "#123456",
            future_rating: "#654321",
        });
    });

    it("includes normalized MDBList keys in partial MDBList exports", () => {
        const result = buildPartialExportConfig({
            originalConfig: { values: {} },
            currentValues: {
                mdblist_enabled_ratings: [],
                mdblist_rating_order: ["score"],
                mdblist_badge_text_overrides: {},
                mdblist_badge_color_hex_values: {},
            },
            disabledKeys: new Set<string>(),
            sectionKeys: [
                "mdblist_enabled_ratings",
                "mdblist_rating_order",
                "mdblist_badge_text_overrides",
                "mdblist_badge_color_hex_values",
            ],
            catalogs: baseCatalogs,
        });

        const decoded = decodeConfig(result.values) as Record<string, unknown>;

        expect(decoded.mdblist_enabled_ratings).toEqual([]);
        expect(decoded.mdblist_rating_order).toEqual([
            "score",
            ...MDBLIST_RATING_KEYS.filter((key) => key !== "score"),
        ]);
        expect(decoded.mdblist_badge_text_overrides).toEqual(MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES);
        expect(decoded.mdblist_badge_color_hex_values).toEqual(MDBLIST_DEFAULT_BADGE_COLOR_VALUES);
    });
});

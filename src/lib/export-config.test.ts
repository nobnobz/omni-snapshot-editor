import { describe, expect, it } from "vitest";
import { decodeConfig } from "./config-utils";
import { buildExportConfig } from "./export-config";

const wrap = (value: unknown) => ({
    _data: Buffer.from(JSON.stringify(value), "utf8").toString("base64")
});

const baseCatalogs = [
    { id: "movie:one", name: "One", enabled: true, showInHome: false },
    { id: "movie:two", name: "Two", enabled: true, showInHome: true }
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

        expect(decodeConfig(result.config?.mdblist_enabled_ratings)).toEqual(["tomatoes", "imdb"]);
    });
});

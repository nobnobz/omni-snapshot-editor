import { describe, expect, it } from "vitest";
import {
    applyAIOMetadataExportTemplate,
    buildAIOMetadataCatalogExport,
    buildAIOMetadataExportInventory,
    collectLinkedAIOMetadataCatalogs,
    filterAIOMetadataExportInventory,
    getDefaultAIOMetadataExportOverrides,
    getComparisonKey,
} from "./aiometadata-export";
import {
    DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
    type AIOMetadataExportOverrideState,
} from "./aiometadata-export-settings";

const currentValues = {
    main_group_order: ["discover-group", "collections-group"],
    main_catalog_groups: {
        "discover-group": {
            name: "Discover",
            subgroupNames: ["Trending", "Streaming"],
        },
        "collections-group": {
            name: "Collections",
            subgroupNames: ["Franchises"],
        },
    },
    catalog_groups: {
        Franchises: [
            "all:trakt.list.2",
        ],
        Loose: [
            "movie:mdblist.3",
        ],
        Streaming: [
            "movie:streaming.netflix",
            "series:streaming.netflix",
            "movie:unsupported.1",
        ],
        Trending: [
            "movie:mdblist.1",
            "all:trakt.list.2",
            "movie:mdblist.4",
        ],
    },
    custom_catalog_names: {
        "mdblist.1": "[Ignore Me] Alpha Movies",
        "trakt.list.2": "Collection Picks",
    },
};

const currentValuesWithCatalogManager = {
    ...currentValues,
    selected_catalogs: [
        "movie:mdblist.10",
        "series:mdblist.11",
        "movie:mdblist.12",
    ],
    top_row_catalogs: [
        "series:mdblist.11",
    ],
    small_toprow_catalogs: [],
    starred_catalogs: [
        "movie:mdblist.12",
    ],
    pinned_catalogs: [],
    custom_catalog_names: {
        ...currentValues.custom_catalog_names,
        "mdblist.10": "Library Movies",
        "mdblist.11": "Top Shelf Shows",
        "mdblist.12": "Hero Movies",
    },
};

const customFallbacks = {
    "mdblist.1": { name: "Alpha Movies", type: "movie" as const },
    "mdblist.3": { name: "Loose Discoveries", type: "movie" as const },
    "mdblist.4": { name: "Zulu Movies", type: "movie" as const },
    "streaming.netflix": { name: "Netflix", type: "movie" as const },
    "trakt.list.2": { name: "Collection Picks", type: "all" as const },
    "mdblist.10": { name: "Library Movies", type: "movie" as const },
    "mdblist.11": { name: "Top Shelf Shows", type: "series" as const },
    "mdblist.12": { name: "Hero Movies", type: "movie" as const },
};

const duplicateCurrentValues = {
    main_group_order: ["discover-group", "collections-group"],
    main_catalog_groups: {
        "discover-group": {
            name: "Discover",
            subgroupNames: ["Trending"],
        },
        "collections-group": {
            name: "Collections",
            subgroupNames: ["Franchises"],
        },
    },
    catalog_groups: {
        Trending: [
            "movie:mdblist.20",
        ],
        Franchises: [
            "movie:mdblist.20",
        ],
    },
    custom_catalog_names: {
        "mdblist.20": "Duplicated Movies",
    },
};

const duplicateFallbacks = {
    "mdblist.20": { name: "Duplicated Movies", type: "movie" as const },
};

const templateCurrentValues = {
    main_group_order: [
        "service-group",
        "genre-group",
        "collections-group",
        "header-group",
        "discover-group",
        "mixed-group",
    ],
    main_catalog_groups: {
        "service-group": {
            name: "Streaming Services",
            subgroupNames: ["Service Picks"],
        },
        "genre-group": {
            name: "Genres",
            subgroupNames: ["Genre Picks"],
        },
        "collections-group": {
            name: "Collections",
            subgroupNames: ["Collection Picks"],
        },
        "header-group": {
            name: "Header",
            subgroupNames: ["Header Picks"],
        },
        "discover-group": {
            name: "Discover",
            subgroupNames: ["Watchlist", "Latest", "Trending"],
        },
        "mixed-group": {
            name: "Mixed",
            subgroupNames: ["Mixed Picks"],
        },
    },
    catalog_groups: {
        "Service Picks": ["movie:mdblist.101", "all:trakt.list.201", "movie:streaming.netflix"],
        "Genre Picks": ["movie:mdblist.102"],
        "Collection Picks": ["movie:mdblist.103", "all:trakt.list.202", "movie:streaming.disney"],
        "Header Picks": ["movie:mdblist.104", "all:trakt.list.203"],
        Watchlist: ["all:trakt.watchlist"],
        Latest: ["movie:mdblist.107", "series:mdblist.108", "movie:trakt.list.204", "series:trakt.list.205"],
        Trending: ["movie:mdblist.109", "series:mdblist.110", "movie:trakt.list.206", "series:trakt.list.207"],
        "Mixed Picks": ["movie:mdblist.105", "movie:mdblist.106"],
    },
    custom_catalog_names: {
        "mdblist.101": "Prime Gems",
        "mdblist.102": "Action Reloaded",
        "mdblist.103": "Alien Saga",
        "mdblist.104": "Header Spotlight",
        "trakt.list.201": "Service Queue",
        "trakt.list.202": "Collection Queue",
        "trakt.list.203": "Header Queue",
        "streaming.netflix": "Netflix",
        "streaming.disney": "Disney+",
        "trakt.watchlist": "Watchlist",
        "mdblist.107": "Latest Movies Source",
        "mdblist.108": "Latest Shows Source",
        "trakt.list.204": "Latest Movies Trakt",
        "trakt.list.205": "Latest Shows Trakt",
        "mdblist.109": "Trending Movies Source",
        "mdblist.110": "Trending Shows Source",
        "trakt.list.206": "Trending Movies Trakt",
        "trakt.list.207": "Trending Shows Trakt",
        "mdblist.105": "[Genre] Hidden Action",
        "mdblist.106": "[Awards] Winner Circle",
    },
};

const templateFallbacks = {
    "mdblist.101": { name: "Prime Gems", type: "movie" as const },
    "mdblist.102": { name: "Action Reloaded", type: "movie" as const },
    "mdblist.103": { name: "Alien Saga", type: "movie" as const },
    "mdblist.104": { name: "Header Spotlight", type: "movie" as const },
    "trakt.list.201": { name: "Service Queue", type: "all" as const },
    "trakt.list.202": { name: "Collection Queue", type: "all" as const },
    "trakt.list.203": { name: "Header Queue", type: "all" as const },
    "streaming.netflix": { name: "Netflix", type: "movie" as const },
    "streaming.disney": { name: "Disney+", type: "movie" as const },
    "trakt.watchlist": { name: "Watchlist", type: "all" as const },
    "mdblist.107": { name: "Latest Movies Source", type: "movie" as const },
    "mdblist.108": { name: "Latest Shows Source", type: "series" as const },
    "trakt.list.204": { name: "Latest Movies Trakt", type: "movie" as const },
    "trakt.list.205": { name: "Latest Shows Trakt", type: "series" as const },
    "mdblist.109": { name: "Trending Movies Source", type: "movie" as const },
    "mdblist.110": { name: "Trending Shows Source", type: "series" as const },
    "trakt.list.206": { name: "Trending Movies Trakt", type: "movie" as const },
    "trakt.list.207": { name: "Trending Shows Trakt", type: "series" as const },
    "mdblist.105": { name: "[Genre] Hidden Action", type: "movie" as const },
    "mdblist.106": { name: "[Awards] Winner Circle", type: "movie" as const },
};

const discoverNamedTemplateCurrentValues = {
    main_group_order: ["discover-group"],
    main_catalog_groups: {
        "discover-group": {
            name: "Discover",
            subgroupNames: ["Latest Movies", "Latest Shows", "Trending Movies", "Trending Shows"],
        },
    },
    catalog_groups: {
        "Latest Movies": ["movie:mdblist.301", "movie:trakt.list.401"],
        "Latest Shows": ["series:mdblist.302", "series:trakt.list.402"],
        "Trending Movies": ["movie:mdblist.303", "movie:trakt.list.403"],
        "Trending Shows": ["series:mdblist.304", "series:trakt.list.404"],
    },
    custom_catalog_names: {
        "mdblist.301": "Latest Movies Source",
        "trakt.list.401": "Latest Movies Trakt",
        "mdblist.302": "Latest Shows Source",
        "trakt.list.402": "Latest Shows Trakt",
        "mdblist.303": "Trending Movies Source",
        "trakt.list.403": "Trending Movies Trakt",
        "mdblist.304": "Trending Shows Source",
        "trakt.list.404": "Trending Shows Trakt",
    },
};

const discoverNamedTemplateFallbacks = {
    "mdblist.301": { name: "Latest Movies Source", type: "movie" as const },
    "trakt.list.401": { name: "Latest Movies Trakt", type: "movie" as const },
    "mdblist.302": { name: "Latest Shows Source", type: "series" as const },
    "trakt.list.402": { name: "Latest Shows Trakt", type: "series" as const },
    "mdblist.303": { name: "Trending Movies Source", type: "movie" as const },
    "trakt.list.403": { name: "Trending Movies Trakt", type: "movie" as const },
    "mdblist.304": { name: "Trending Shows Source", type: "series" as const },
    "trakt.list.404": { name: "Trending Shows Trakt", type: "series" as const },
};

describe("aiometadata export helpers", () => {
    it("collects supported linked catalogs from grouped and unassigned Omni subgroups", () => {
        expect(collectLinkedAIOMetadataCatalogs(currentValues)).toEqual([
            {
                widgetId: "discover-group",
                widgetName: "Discover",
                itemName: "Trending",
                omniCatalogId: "movie:mdblist.1",
            },
            {
                widgetId: "discover-group",
                widgetName: "Discover",
                itemName: "Trending",
                omniCatalogId: "all:trakt.list.2",
            },
            {
                widgetId: "discover-group",
                widgetName: "Discover",
                itemName: "Trending",
                omniCatalogId: "movie:mdblist.4",
            },
            {
                widgetId: "discover-group",
                widgetName: "Discover",
                itemName: "Streaming",
                omniCatalogId: "movie:streaming.netflix",
            },
            {
                widgetId: "discover-group",
                widgetName: "Discover",
                itemName: "Streaming",
                omniCatalogId: "series:streaming.netflix",
            },
            {
                widgetId: "collections-group",
                widgetName: "Collections",
                itemName: "Franchises",
                omniCatalogId: "all:trakt.list.2",
            },
            {
                widgetId: "__unassigned__",
                widgetName: "Unassigned",
                itemName: "Loose",
                omniCatalogId: "movie:mdblist.3",
            },
        ]);
    });

    it("collects active catalog manager catalogs with header and top row prefixes", () => {
        expect(collectLinkedAIOMetadataCatalogs(currentValuesWithCatalogManager).slice(-3)).toEqual([
            {
                widgetId: "__catalog_manager_catalog__",
                widgetName: "Catalog",
                itemName: "Catalog Manager",
                omniCatalogId: "movie:mdblist.10",
            },
            {
                widgetId: "__catalog_manager_top_row__",
                widgetName: "Top Row",
                itemName: "Catalog Manager",
                omniCatalogId: "series:mdblist.11",
            },
            {
                widgetId: "__catalog_manager_header__",
                widgetName: "Header",
                itemName: "Catalog Manager",
                omniCatalogId: "movie:mdblist.12",
            },
        ]);
    });

    it("builds export inventory with naming, sorting, and synced-state separation", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [
                {
                    id: "mdblist.1",
                    name: "[Genre] Alpha Movies",
                    type: "movie",
                    source: "mdblist",
                    displayType: "movie",
                },
                {
                    id: "trakt.list.2",
                    name: "[Collection] Picks",
                    type: "all",
                    source: "trakt",
                    displayType: "all",
                },
                {
                    id: "streaming.netflix",
                    name: "[Service] Netflix Movies",
                    type: "movie",
                    source: "streaming",
                    displayType: "movie",
                },
            ],
            customFallbacks,
        });

        expect(inventory.hasAuthoritativeCatalogInventory).toBe(true);
        expect(inventory.exportableComparisonKeys).toEqual([
            "mdblist.4",
            "series:streaming.netflix",
            "mdblist.3",
        ]);
        expect(inventory.exportableSources).toEqual(["mdblist", "streaming"]);
        expect(inventory.widgets.map((widget) => widget.name)).toEqual(["Discover", "Collections", "Unassigned"]);
        expect(inventory.widgets[0].items.map((item) => item.name)).toEqual(["Streaming", "Trending"]);
        expect(inventory.widgets[0].items[1].occurrences.map((occurrence) => ({
            name: occurrence.exportCatalog.name,
            exportable: occurrence.isExportable,
        }))).toEqual([
            {
                name: "[Discover] Trending (Movies) ",
                exportable: true,
            },
            {
                name: "[Discover] Trending (All)   ",
                exportable: false,
            },
            {
                name: "[Discover] Trending (Movies) ",
                exportable: false,
            },
        ]);
        expect(inventory.widgets[2].items[0].occurrences[0].exportCatalog.name).toBe("[Unassigned] Loose (Movies) ");
    });

    it("dedupes streaming by type plus id while keeping mdblist and trakt by id", () => {
        expect(getComparisonKey({
            id: "streaming.netflix",
            type: "movie",
            source: "streaming",
        })).toBe("movie:streaming.netflix");
        expect(getComparisonKey({
            id: "streaming.netflix",
            type: "series",
            source: "streaming",
        })).toBe("series:streaming.netflix");
        expect(getComparisonKey({
            id: "mdblist.1",
            type: "movie",
            source: "mdblist",
        })).toBe("mdblist.1");
        expect(getComparisonKey({
            id: "trakt.list.2",
            type: "all",
            source: "trakt",
        })).toBe("trakt.list.2");
    });

    it("normalizes streaming suffix ids so imported anime catalogs match canonical export ids", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Streaming Services",
                        subgroupNames: ["Crunchyroll"],
                    },
                },
                catalog_groups: {
                    Crunchyroll: ["anime:streaming.cru_movie", "anime:streaming.cru_series"],
                },
            },
            importedCatalogs: [
                {
                    id: "streaming.cru",
                    name: "[Service] Crunchyroll Movies",
                    type: "movie",
                    source: "streaming",
                    displayType: "anime",
                    extraExportFields: {
                        sort: "popularity",
                        sortDirection: "desc",
                    },
                },
                {
                    id: "streaming.cru",
                    name: "[Service] Crunchyroll Shows",
                    type: "series",
                    source: "streaming",
                    displayType: "anime",
                    extraExportFields: {
                        sort: "popularity",
                        sortDirection: "desc",
                    },
                },
            ],
            customFallbacks: {
                "streaming.cru": { name: "Crunchyroll", type: "movie" },
                "streaming.cru_movie": { name: "Crunchyroll Movies", type: "movie" },
                "streaming.cru_series": { name: "Crunchyroll Shows", type: "series" },
            },
        });

        expect(inventory.occurrences.map((occurrence) => occurrence.exportCatalog)).toEqual([
            {
                id: "streaming.cru",
                type: "movie",
                name: "[Streaming Services] Crunchyroll (Anime)  ",
                enabled: true,
                enableRatingPosters: true,
                source: "streaming",
                sort: "popularity",
                sortDirection: "desc",
                displayType: "anime",
            },
            {
                id: "streaming.cru",
                type: "series",
                name: "[Streaming Services] Crunchyroll (Anime)  ",
                enabled: true,
                enableRatingPosters: true,
                source: "streaming",
                sort: "popularity",
                sortDirection: "desc",
                displayType: "anime",
            },
        ]);
        expect(inventory.occurrences.every((occurrence) => occurrence.isSynced)).toBe(true);
    });

    it("treats all linked catalogs as exportable when no authoritative inventory exists", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: null,
            customFallbacks,
        });

        expect(inventory.hasAuthoritativeCatalogInventory).toBe(false);
        expect(inventory.occurrences.every((occurrence) => occurrence.isExportable)).toBe(true);
        expect(inventory.occurrences.every((occurrence) => occurrence.isSynced)).toBe(false);
    });

    it("filters by widget names, item names, and catalog names", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [],
            customFallbacks,
        });

        expect(filterAIOMetadataExportInventory(inventory, "discover")[0].items).toHaveLength(2);
        expect(filterAIOMetadataExportInventory(inventory, "streaming")[0].items[0].occurrences).toHaveLength(2);
        expect(filterAIOMetadataExportInventory(inventory, "zulu")[0].items[0].occurrences.map((occurrence) => occurrence.exportCatalog.name)).toEqual([
            "[Discover] Trending (Movies) ",
        ]);
    });

    it("adds catalog manager catalogs to the inventory with the expected naming prefixes", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: currentValuesWithCatalogManager,
            importedCatalogs: [],
            customFallbacks,
        });

        expect(inventory.widgets.map((widget) => widget.name)).toEqual([
            "Discover",
            "Collections",
            "Header",
            "Top Row",
            "Catalog",
            "Unassigned",
        ]);
        expect(inventory.widgets[2].items[0].occurrences[0].exportCatalog.name).toBe("[Header] Hero Movies (Movies) ");
        expect(inventory.widgets[3].items[0].occurrences[0].exportCatalog.name).toBe("[Top Row] Top Shelf Shows (Shows)");
        expect(inventory.widgets[4].items[0].occurrences[0].exportCatalog.name).toBe("[Catalog] Library Movies (Movies) ");
    });

    it("uses catalog custom names for catalog manager widgets without duplicating suffixes", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                ...currentValuesWithCatalogManager,
                selected_catalogs: [
                    "movie:mdblist.10",
                    "series:mdblist.11",
                    "movie:mdblist.13",
                ],
                top_row_catalogs: ["series:mdblist.11"],
                starred_catalogs: ["movie:mdblist.13"],
                custom_catalog_names: {
                    ...currentValuesWithCatalogManager.custom_catalog_names,
                    "mdblist.13": "Header Spotlight",
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                ...customFallbacks,
                "mdblist.13": { name: "Header Spotlight", type: "movie" },
            },
        });

        expect(inventory.widgets[2].items[0].occurrences[0].exportCatalog.name).toBe("[Header] Header Spotlight (Movies) ");
        expect(inventory.widgets[3].items[0].occurrences[0].exportCatalog.name).toBe("[Top Row] Top Shelf Shows (Shows)");
        expect(inventory.widgets[4].items[0].occurrences[0].exportCatalog.name).toBe("[Catalog] Library Movies (Movies) ");
    });

    it("uses subgroup names for all catalogs and appends the All suffix", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["Watchlist"],
                    },
                },
                catalog_groups: {
                    Watchlist: ["all:trakt.watchlist"],
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "trakt.watchlist": { name: "Watchlist", type: "all" },
            },
        });

        expect(inventory.occurrences[0].exportCatalog.name).toBe("[Discover] Watchlist (All)   ");
    });

    it("numbers duplicate subgroup-derived names after canonical dedupe", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["collections-group"],
                main_catalog_groups: {
                    "collections-group": {
                        name: "Collections",
                        subgroupNames: ["Franchise"],
                    },
                },
                catalog_groups: {
                    Franchise: ["movie:mdblist.21", "movie:mdblist.22"],
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.21": { name: "One", type: "movie" },
                "mdblist.22": { name: "Two", type: "movie" },
            },
        });

        expect(buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
        }).catalogs.map((catalog) => catalog.name)).toEqual([
            "[Collections] Franchise (Movies) ",
            "[Collections] Franchise (Movies) 2",
        ]);
    });

    it("preserves existing suffixes and strips duplicated widget prefixes", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["[Discover] Watchlist All", "Netflix Movies"],
                    },
                },
                catalog_groups: {
                    "[Discover] Watchlist All": ["all:trakt.watchlist"],
                    "Netflix Movies": ["movie:mdblist.30"],
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "trakt.watchlist": { name: "Watchlist", type: "all" },
                "mdblist.30": { name: "Netflix Library", type: "movie" },
            },
        });

        expect(inventory.occurrences.map((occurrence) => occurrence.exportCatalog.name)).toEqual([
            "[Discover] Watchlist All (All)   ",
            "[Discover] Netflix Movies (Movies) ",
        ]);
    });

    it("builds new-catalog and full-catalog exports in widget order and alphabetical group order", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [
                {
                    id: "mdblist.1",
                    name: "[Genre] Alpha Movies",
                    type: "movie",
                    source: "mdblist",
                    displayType: "movie",
                    extraExportFields: {
                        showInHome: true,
                        sort: "default",
                        order: "asc",
                        cacheTTL: 86400,
                        metadata: {
                            itemCount: 30,
                            url: "https://example.com/alpha",
                        },
                    },
                },
                {
                    id: "streaming.netflix",
                    name: "[Service] Netflix Movies",
                    type: "movie",
                    source: "streaming",
                    displayType: "anime",
                    extraExportFields: {
                        showInHome: true,
                        sort: "popularity",
                        sortDirection: "desc",
                    },
                },
            ],
            customFallbacks,
        });

        const selectedExport = buildAIOMetadataCatalogExport({
            inventory,
            selectedComparisonKeys: ["mdblist.4", "movie:streaming.netflix"],
        });
        const fullExport = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
        });

        expect(selectedExport.version).toBe(1);
        expect(selectedExport.catalogs).toEqual([
            {
                id: "streaming.netflix",
                type: "movie",
                name: "[Discover] Streaming (Movies) ",
                enabled: true,
                showInHome: true,
                enableRatingPosters: true,
                source: "streaming",
                sort: "popularity",
                sortDirection: "desc",
                displayType: "anime",
            },
            {
                id: "mdblist.4",
                type: "movie",
                name: "[Discover] Trending (Movies) ",
                enabled: true,
                sort: "default",
                order: "asc",
                cacheTTL: 43200,
                genreSelection: "standard",
                enableRatingPosters: true,
                source: "mdblist",
                displayType: "movie",
            },
        ]);
        expect(fullExport.catalogs.find((catalog) => catalog.id === "mdblist.1")).toEqual({
            id: "mdblist.1",
            type: "movie",
            name: "[Discover] Trending (Movies) 2",
            enabled: true,
            showInHome: true,
            source: "mdblist",
            sort: "default",
            order: "asc",
            cacheTTL: 86400,
            genreSelection: "standard",
            enableRatingPosters: true,
            metadata: {
                itemCount: 30,
                url: "https://example.com/alpha",
            },
            displayType: "movie",
        });
        expect(fullExport.catalogs.find((catalog) => catalog.id === "streaming.netflix" && catalog.type === "movie")).toEqual({
            id: "streaming.netflix",
            type: "movie",
            name: "[Discover] Streaming (Movies) ",
            enabled: true,
            showInHome: true,
            source: "streaming",
            enableRatingPosters: true,
            sort: "popularity",
            sortDirection: "desc",
            displayType: "anime",
        });
        expect(fullExport.catalogs.map((catalog) => catalog.name)).toEqual([
            "[Discover] Streaming (Movies) ",
            "[Discover] Streaming (Shows)",
            "[Discover] Trending (All)   ",
            "[Discover] Trending (Movies) ",
            "[Discover] Trending (Movies) 2",
            "[Unassigned] Loose (Movies) ",
        ]);
    });

    it("supplements safe AIOMetadata defaults when a synced public manifest catalog is sparse", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [
                {
                    id: "mdblist.1",
                    name: "[Genre] Alpha Movies",
                    type: "movie",
                    source: "mdblist",
                    displayType: "movie",
                    extraExportFields: {
                        showInHome: true,
                    },
                },
            ],
            customFallbacks,
        });

        const fullExport = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
        });

        expect(fullExport.catalogs.find((catalog) => catalog.id === "mdblist.1")).toEqual({
            id: "mdblist.1",
            type: "movie",
            name: "[Discover] Trending (Movies) 2",
            enabled: true,
            showInHome: true,
            source: "mdblist",
            sort: "default",
            order: "asc",
            cacheTTL: 43200,
            genreSelection: "standard",
            enableRatingPosters: true,
            displayType: "movie",
        });
    });

    it("applies widget, item, and catalog MDBList overrides field-by-field during export", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [],
            customFallbacks,
        });

        const overrides: AIOMetadataExportOverrideState = {
            widgets: {
                "discover-group": {
                    mdblist: {
                        sort: "rank",
                        order: "desc",
                        cacheTTL: 3600,
                    },
                },
            },
            items: {
                "discover-group:Trending": {
                    mdblist: {
                        sort: "imdbpopular",
                    },
                },
            },
            catalogs: {
                "mdblist.4": {
                    order: "asc",
                    cacheTTL: 900,
                },
            },
        };

        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            selectedComparisonKeys: ["mdblist.1", "mdblist.4", "movie:streaming.netflix"],
            exportSettingsOverrides: overrides,
        });

        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.1")).toMatchObject({
            id: "mdblist.1",
            sort: "imdbpopular",
            order: "desc",
            cacheTTL: 3600,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.4")).toMatchObject({
            id: "mdblist.4",
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 900,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix")).toEqual({
            id: "streaming.netflix",
            type: "movie",
            name: "[Discover] Streaming (Movies) ",
            enabled: true,
            enableRatingPosters: true,
            source: "streaming",
            displayType: "movie",
        });
    });

    it("uses the canonical occurrence for widget and item overrides when a catalog appears multiple times", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: duplicateCurrentValues,
            importedCatalogs: [],
            customFallbacks: duplicateFallbacks,
        });

        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: {
                widgets: {
                    "discover-group": {
                        mdblist: {
                            sort: "rank",
                        },
                    },
                    "collections-group": {
                        mdblist: {
                            sort: "random",
                        },
                    },
                },
                items: {
                    "collections-group:Franchises": {
                        mdblist: {
                            order: "desc",
                        },
                    },
                },
                catalogs: {},
            },
        });

        expect(exportPayload.catalogs).toEqual([
            {
                id: "mdblist.20",
                type: "movie",
                name: "[Discover] Trending (Movies) ",
                enabled: true,
                sort: "rank",
                order: "asc",
                cacheTTL: 43200,
                genreSelection: "standard",
                enableRatingPosters: true,
                source: "mdblist",
                displayType: "movie",
            },
        ]);
    });

    it("applies widget, item, and catalog Trakt overrides field-by-field during export", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [],
            customFallbacks,
        });

        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: {
                widgets: {
                    "collections-group": {
                        trakt: {
                            sort: "rank",
                            sortDirection: "desc",
                            cacheTTL: 7200,
                        },
                    },
                },
                items: {
                    "discover-group:Trending": {
                        trakt: {
                            sort: "title",
                        },
                    },
                },
                catalogs: {
                    "trakt.list.2": {
                        sortDirection: "asc",
                        cacheTTL: 900,
                    },
                },
            },
        });

        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.2")).toMatchObject({
            id: "trakt.list.2",
            sort: "title",
            sortDirection: "asc",
            cacheTTL: 900,
        });
    });

    it("applies widget, item, and catalog Streaming overrides field-by-field during export without adding implicit defaults", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues,
            importedCatalogs: [],
            customFallbacks,
        });

        const baselineExport = buildAIOMetadataCatalogExport({
            inventory,
            selectedComparisonKeys: ["movie:streaming.netflix"],
        });

        expect(baselineExport.catalogs[0]).not.toHaveProperty("sort");
        expect(baselineExport.catalogs[0]).not.toHaveProperty("sortDirection");
        expect(baselineExport.catalogs[0]).not.toHaveProperty("cacheTTL");

        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: {
                widgets: {
                    "discover-group": {
                        streaming: {
                            sort: "popularity",
                            sortDirection: "desc",
                        },
                    },
                },
                items: {
                    "discover-group:Streaming": {
                        streaming: {
                            sort: "release_date",
                        },
                    },
                },
                catalogs: {
                    "movie:streaming.netflix": {
                        sortDirection: "asc",
                    },
                },
            },
        });

        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix" && catalog.type === "movie")).toMatchObject({
            id: "streaming.netflix",
            sort: "release_date",
            sortDirection: "asc",
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix" && catalog.type === "series")).toMatchObject({
            id: "streaming.netflix",
            sort: "release_date",
            sortDirection: "desc",
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix" && catalog.type === "movie")).not.toHaveProperty("cacheTTL");
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix" && catalog.type === "series")).not.toHaveProperty("cacheTTL");
    });

    it("lets catalog overrides win globally even when the catalog also appears as an alias elsewhere", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: duplicateCurrentValues,
            importedCatalogs: [],
            customFallbacks: duplicateFallbacks,
        });

        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: {
                widgets: {
                    "discover-group": {
                        mdblist: {
                            sort: "rank",
                        },
                    },
                },
                items: {},
                catalogs: {
                    "mdblist.20": {
                        order: "desc",
                        cacheTTL: 172800,
                    },
                },
            },
        });

        expect(exportPayload.catalogs[0]).toMatchObject({
            id: "mdblist.20",
            sort: "rank",
            order: "desc",
            cacheTTL: 172800,
        });
    });

    it("applies the standard AIOMetadata template to matching widgets and the watchlist", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: templateCurrentValues,
            importedCatalogs: [],
            customFallbacks: templateFallbacks,
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });
        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: result.nextOverrides,
        });

        expect(result.nextOverrides.widgets["service-group"]).toEqual({
            mdblist: {
                sort: "tmdbpopular",
                order: "asc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
            streaming: {
                sort: "popularity",
                sortDirection: "desc",
            },
        });
        expect(result.nextOverrides.widgets["genre-group"]).toEqual({
            mdblist: {
                sort: "tmdbpopular",
                order: "asc",
                cacheTTL: 43200,
            },
        });
        expect(result.nextOverrides.widgets["collections-group"]).toEqual({
            mdblist: {
                sort: "released",
                order: "desc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "released",
                sortDirection: "asc",
                cacheTTL: 43200,
            },
            streaming: {
                sort: "release_date",
                sortDirection: "desc",
            },
        });
        expect(result.nextOverrides.widgets["header-group"]).toEqual({
            mdblist: {
                sort: "random",
                order: "asc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "random",
                sortDirection: "asc",
                cacheTTL: 43200,
            },
        });
        expect(result.nextOverrides.catalogs["trakt.watchlist"]).toMatchObject({
            sort: "added",
            sortDirection: "asc",
            cacheTTL: 1800,
        });
        expect(result.nextOverrides.catalogs["mdblist.107"]).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.108"]).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.204"]).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.205"]).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.109"]).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.110"]).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.206"]).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.207"]).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.101")).toMatchObject({
            sort: "tmdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.103")).toMatchObject({
            sort: "released",
            order: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.201")).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.202")).toMatchObject({
            sort: "released",
            sortDirection: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.203")).toMatchObject({
            sort: "random",
            sortDirection: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix")).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.disney")).toMatchObject({
            sort: "release_date",
            sortDirection: "desc",
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.netflix")).not.toHaveProperty("cacheTTL");
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "streaming.disney")).not.toHaveProperty("cacheTTL");
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.104")).toMatchObject({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.107")).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.108")).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.204")).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.205")).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.109")).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.110")).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.206")).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.list.207")).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.watchlist")).toMatchObject({
            sort: "added",
            sortDirection: "asc",
            cacheTTL: 1800,
        });
    });

    it("falls back to catalog-level overrides for mixed widgets", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: templateCurrentValues,
            importedCatalogs: [
                {
                    id: "mdblist.105",
                    name: "[Genre] Hidden Action",
                    type: "movie",
                    source: "mdblist",
                    displayType: "movie",
                },
                {
                    id: "mdblist.106",
                    name: "[Awards] Winner Circle",
                    type: "movie",
                    source: "mdblist",
                    displayType: "movie",
                },
            ],
            customFallbacks: templateFallbacks,
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });

        expect(result.nextOverrides.widgets["mixed-group"]).toBeUndefined();
        expect(result.nextOverrides.catalogs["mdblist.105"]).toMatchObject({
            sort: "tmdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.106"]).toBeUndefined();
    });

    it("applies discover latest and trending rules for explicitly named subgroups", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: discoverNamedTemplateCurrentValues,
            importedCatalogs: [],
            customFallbacks: discoverNamedTemplateFallbacks,
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });

        expect(result.nextOverrides.catalogs["mdblist.301"]).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.401"]).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.302"]).toMatchObject({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.402"]).toMatchObject({
            sort: "released",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.303"]).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.403"]).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.304"]).toMatchObject({
            sort: "imdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["trakt.list.404"]).toMatchObject({
            sort: "popularity",
            sortDirection: "desc",
            cacheTTL: 43200,
        });
    });

    it("applies UME sorting special cases for named catalog exceptions", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["Special Picks"],
                    },
                },
                catalog_groups: {
                    "Special Picks": [
                        "movie:mdblist.201",
                        "series:mdblist.202",
                        "movie:mdblist.203",
                        "movie:mdblist.204",
                        "movie:mdblist.205",
                        "movie:mdblist.206",
                        "movie:mdblist.207",
                        "movie:mdblist.208",
                        "movie:mdblist.209",
                        "series:mdblist.210",
                    ],
                },
                custom_catalog_names: {
                    "mdblist.201": "IMDb Top Movies",
                    "mdblist.202": "IMDb Top Shows",
                    "mdblist.203": "Oscars 2026",
                    "mdblist.204": "Academy Awards",
                    "mdblist.205": "Emmy Awards",
                    "mdblist.206": "Golden Globe Awards",
                    "mdblist.207": "Cannes Film Festival",
                    "mdblist.208": "Marvel",
                    "mdblist.209": "DC Universe",
                    "mdblist.210": "DC Universe",
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.201": { name: "IMDb Top Movies", type: "movie" },
                "mdblist.202": { name: "IMDb Top Shows", type: "series" },
                "mdblist.203": { name: "Oscars 2026", type: "movie" },
                "mdblist.204": { name: "Academy Awards", type: "movie" },
                "mdblist.205": { name: "Emmy Awards", type: "movie" },
                "mdblist.206": { name: "Golden Globe Awards", type: "movie" },
                "mdblist.207": { name: "Cannes Film Festival", type: "movie" },
                "mdblist.208": { name: "Marvel", type: "movie" },
                "mdblist.209": { name: "DC Universe", type: "movie" },
                "mdblist.210": { name: "DC Universe", type: "series" },
            },
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });

        expect(result.nextOverrides.catalogs["mdblist.201"]).toEqual({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.202"]).toEqual({
            sort: "tmdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.203"]).toEqual({
            sort: "tmdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.204"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.205"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.206"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.207"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.208"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.209"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.210"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
    });

    it("lets named UME special cases override generic discover latest rules in fill-unset mode", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["Latest"],
                    },
                },
                catalog_groups: {
                    Latest: ["movie:mdblist.201"],
                },
                custom_catalog_names: {
                    "mdblist.201": "IMDb Top Movies",
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.201": { name: "IMDb Top Movies", type: "movie" },
            },
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });

        expect(result.nextOverrides.catalogs["mdblist.201"]).toEqual({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
    });

    it("lets named UME special cases override generic widget rules in replace-matching mode", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group", "collections-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["Latest"],
                    },
                    "collections-group": {
                        name: "Collections",
                        subgroupNames: ["Collection Picks"],
                    },
                },
                catalog_groups: {
                    Latest: ["movie:mdblist.201"],
                    "Collection Picks": ["movie:mdblist.204"],
                },
                custom_catalog_names: {
                    "mdblist.201": "IMDb Top Movies",
                    "mdblist.204": "Academy Awards",
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.201": { name: "IMDb Top Movies", type: "movie" },
                "mdblist.204": { name: "Academy Awards", type: "movie" },
            },
        });

        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "replace-matching",
        });

        expect(result.nextOverrides.widgets["collections-group"]).toEqual({
            mdblist: {
                sort: "released",
                order: "desc",
                cacheTTL: 43200,
            },
        });
        expect(result.nextOverrides.catalogs["mdblist.201"]).toEqual({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(result.nextOverrides.catalogs["mdblist.204"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
    });

    it("includes named UME special cases in effective default overrides", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["discover-group", "collections-group"],
                main_catalog_groups: {
                    "discover-group": {
                        name: "Discover",
                        subgroupNames: ["Latest"],
                    },
                    "collections-group": {
                        name: "Collections",
                        subgroupNames: ["Collection Picks"],
                    },
                },
                catalog_groups: {
                    Latest: ["movie:mdblist.201", "series:mdblist.202"],
                    "Collection Picks": ["movie:mdblist.204"],
                },
                custom_catalog_names: {
                    "mdblist.201": "IMDb Top Movies",
                    "mdblist.202": "IMDb Top Shows",
                    "mdblist.204": "Academy Awards",
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.201": { name: "IMDb Top Movies", type: "movie" },
                "mdblist.202": { name: "IMDb Top Shows", type: "series" },
                "mdblist.204": { name: "Academy Awards", type: "movie" },
            },
        });

        const effectiveOverrides = getDefaultAIOMetadataExportOverrides({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
        });

        expect(effectiveOverrides.catalogs["mdblist.201"]).toEqual({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(effectiveOverrides.catalogs["mdblist.202"]).toEqual({
            sort: "tmdbpopular",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(effectiveOverrides.catalogs["mdblist.204"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
    });

    it("matches UME special-case catalog rules from subgroup-derived export names", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: {
                main_group_order: ["collections-group"],
                main_catalog_groups: {
                    "collections-group": {
                        name: "Collections",
                        subgroupNames: ["IMDb Top Movies", "Academy Awards"],
                    },
                },
                catalog_groups: {
                    "IMDb Top Movies": ["movie:mdblist.501"],
                    "Academy Awards": ["movie:mdblist.502"],
                },
            },
            importedCatalogs: [],
            customFallbacks: {
                "mdblist.501": { name: "Some Other Source Name", type: "movie" },
                "mdblist.502": { name: "Another Source Name", type: "movie" },
            },
        });

        const effectiveOverrides = getDefaultAIOMetadataExportOverrides({
            inventory,
            currentOverrides: {
                widgets: {},
                items: {},
                catalogs: {},
            },
        });

        expect(effectiveOverrides.catalogs["mdblist.501"]).toEqual({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(effectiveOverrides.catalogs["mdblist.502"]).toEqual({
            sort: "released",
            order: "asc",
            cacheTTL: 43200,
        });
    });

    it("preserves existing matching overrides in fill-unset mode and replaces them in replace-matching mode", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: templateCurrentValues,
            importedCatalogs: [],
            customFallbacks: templateFallbacks,
        });

        const existingOverrides: AIOMetadataExportOverrideState = {
            widgets: {
                "service-group": {
                    mdblist: {
                        sort: "random",
                    },
                },
            },
            items: {
                "service-group:Service Picks": {
                    mdblist: {
                        order: "desc",
                    },
                },
            },
            catalogs: {
                "mdblist.101": {
                    cacheTTL: 900,
                },
            },
        };

        const fillResult = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: existingOverrides,
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "fill-unset",
        });
        const replaceResult = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: existingOverrides,
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "replace-matching",
        });

        expect(fillResult.nextOverrides.widgets["service-group"]).toEqual({
            mdblist: {
                sort: "random",
                order: "asc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
            streaming: {
                sort: "popularity",
                sortDirection: "desc",
            },
        });
        expect(fillResult.nextOverrides.items["service-group:Service Picks"]).toEqual({
            mdblist: {
                order: "desc",
            },
        });
        expect(fillResult.nextOverrides.catalogs["mdblist.101"]).toEqual({
            cacheTTL: 900,
        });

        expect(replaceResult.nextOverrides.widgets["service-group"]).toEqual({
            mdblist: {
                sort: "tmdbpopular",
                order: "asc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
            streaming: {
                sort: "popularity",
                sortDirection: "desc",
            },
        });
        expect(replaceResult.nextOverrides.items["service-group:Service Picks"]).toBeUndefined();
        expect(replaceResult.nextOverrides.catalogs["mdblist.101"]).toBeUndefined();
    });

    it("layers default UME sorting under manual overrides", () => {
        const inventory = buildAIOMetadataExportInventory({
            currentValues: templateCurrentValues,
            importedCatalogs: [],
            customFallbacks: templateFallbacks,
        });

        const effectiveOverrides = getDefaultAIOMetadataExportOverrides({
            inventory,
            currentOverrides: {
                widgets: {
                    "service-group": {
                        mdblist: {
                            sort: "random",
                        },
                    },
                },
                items: {},
                catalogs: {
                    "trakt.watchlist": {
                        cacheTTL: 900,
                    },
                },
            },
        });
        const exportPayload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: effectiveOverrides,
        });

        expect(effectiveOverrides.widgets["service-group"]).toEqual({
            mdblist: {
                sort: "random",
                order: "asc",
                cacheTTL: 43200,
            },
            trakt: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
            streaming: {
                sort: "popularity",
                sortDirection: "desc",
            },
        });
        expect(effectiveOverrides.catalogs["trakt.watchlist"]).toEqual({
            sort: "added",
            sortDirection: "asc",
            cacheTTL: 900,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "mdblist.101")).toMatchObject({
            sort: "random",
            order: "asc",
            cacheTTL: 43200,
        });
        expect(exportPayload.catalogs.find((catalog) => catalog.id === "trakt.watchlist")).toMatchObject({
            sort: "added",
            sortDirection: "asc",
            cacheTTL: 900,
        });
    });
});

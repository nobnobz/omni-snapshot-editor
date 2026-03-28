export type AIOMetadataCacheTtlPreset =
    | "inherit"
    | "5m"
    | "15m"
    | "30m"
    | "1h"
    | "2h"
    | "4h"
    | "6h"
    | "12h"
    | "24h"
    | "48h"
    | "72h"
    | "custom";

export type AIOMetadataMDBListSort =
    | "default"
    | "rank"
    | "score"
    | "usort"
    | "score_average"
    | "released"
    | "releasedigital"
    | "imdbrating"
    | "imdbvotes"
    | "last_air_date"
    | "imdbpopular"
    | "tmdbpopular"
    | "rogerbert"
    | "rtomatoes"
    | "rtaudience"
    | "metacritic"
    | "myanimelist"
    | "letterrating"
    | "lettervotes"
    | "budget"
    | "revenue"
    | "runtime"
    | "title"
    | "added"
    | "random";

export type AIOMetadataTraktSort =
    | "default"
    | "rank"
    | "added"
    | "title"
    | "released"
    | "runtime"
    | "popularity"
    | "percentage"
    | "imdb_rating"
    | "tmdb_rating"
    | "rt_tomatometer"
    | "rt_audience"
    | "metascore"
    | "votes"
    | "imdb_votes"
    | "collected"
    | "watched"
    | "my_rating"
    | "tmdb_votes"
    | "random";

export type AIOMetadataStreamingSort =
    | "popularity"
    | "release_date"
    | "vote_average"
    | "revenue";

export type AIOMetadataMDBListExportOverride = {
    sort?: AIOMetadataMDBListSort;
    order?: "asc" | "desc";
    cacheTTL?: number;
};

export type AIOMetadataTraktExportOverride = {
    sort?: AIOMetadataTraktSort;
    sortDirection?: "asc" | "desc";
    cacheTTL?: number;
};

export type AIOMetadataStreamingExportOverride = {
    sort?: AIOMetadataStreamingSort;
    sortDirection?: "asc" | "desc";
};

export type AIOMetadataCatalogExportOverride = (
    AIOMetadataMDBListExportOverride
    | AIOMetadataTraktExportOverride
    | AIOMetadataStreamingExportOverride
) & {
    sortDirection?: "asc" | "desc";
};

export type AIOMetadataSourceScopedOverrideMap = Partial<{
    mdblist: AIOMetadataMDBListExportOverride;
    trakt: AIOMetadataTraktExportOverride;
    streaming: AIOMetadataStreamingExportOverride;
}>;

export type AIOMetadataExportOverrideState = {
    widgets: Record<string, AIOMetadataSourceScopedOverrideMap>;
    items: Record<string, AIOMetadataSourceScopedOverrideMap>;
    catalogs: Record<string, AIOMetadataCatalogExportOverride>;
};

export type AIOMetadataMDBListEditableOccurrenceLike = {
    source: string;
};

export const EMPTY_AIOMETADATA_EXPORT_OVERRIDE_STATE: AIOMetadataExportOverrideState = {
    widgets: {},
    items: {},
    catalogs: {},
};

export const MDBLIST_SORT_OPTIONS: Array<{ value: AIOMetadataMDBListSort; label: string }> = [
    { value: "default", label: "Use Default Sorting" },
    { value: "rank", label: "Rank" },
    { value: "score", label: "Score" },
    { value: "usort", label: "User Sort" },
    { value: "score_average", label: "Score Average" },
    { value: "released", label: "Release Date" },
    { value: "releasedigital", label: "Digital Release" },
    { value: "imdbrating", label: "IMDb Rating" },
    { value: "imdbvotes", label: "IMDb Votes" },
    { value: "last_air_date", label: "Last Air Date" },
    { value: "imdbpopular", label: "IMDb Popular" },
    { value: "tmdbpopular", label: "TMDb Popular" },
    { value: "rogerbert", label: "Roger Ebert" },
    { value: "rtomatoes", label: "Rotten Tomatoes" },
    { value: "rtaudience", label: "RT Audience" },
    { value: "metacritic", label: "Metacritic" },
    { value: "myanimelist", label: "MyAnimeList" },
    { value: "letterrating", label: "Letterboxd Rating" },
    { value: "lettervotes", label: "Letterboxd Votes" },
    { value: "budget", label: "Budget" },
    { value: "revenue", label: "Revenue" },
    { value: "runtime", label: "Runtime" },
    { value: "title", label: "Title" },
    { value: "added", label: "Date Added" },
    { value: "random", label: "Random" },
];

export const TRAKT_SORT_OPTIONS: Array<{ value: AIOMetadataTraktSort; label: string }> = [
    { value: "default", label: "Use Default Sorting" },
    { value: "rank", label: "Rank" },
    { value: "added", label: "Date Added" },
    { value: "title", label: "Title" },
    { value: "released", label: "Release Date" },
    { value: "runtime", label: "Runtime" },
    { value: "popularity", label: "Popularity" },
    { value: "percentage", label: "Percentage" },
    { value: "imdb_rating", label: "IMDb Rating" },
    { value: "tmdb_rating", label: "TMDb Rating" },
    { value: "rt_tomatometer", label: "Rotten Tomatoes" },
    { value: "rt_audience", label: "RT Audience" },
    { value: "metascore", label: "Metascore" },
    { value: "votes", label: "Votes" },
    { value: "imdb_votes", label: "IMDb Votes" },
    { value: "collected", label: "Collected" },
    { value: "watched", label: "Watched" },
    { value: "my_rating", label: "My Rating" },
    { value: "tmdb_votes", label: "TMDb Votes" },
    { value: "random", label: "Random" },
];

export const STREAMING_SORT_OPTIONS: Array<{ value: AIOMetadataStreamingSort; label: string }> = [
    { value: "popularity", label: "Popularity" },
    { value: "release_date", label: "Release Date" },
    { value: "vote_average", label: "Vote Average" },
    { value: "revenue", label: "Revenue" },
];

export const CACHE_TTL_PRESET_OPTIONS: Array<{
    value: Exclude<AIOMetadataCacheTtlPreset, "inherit" | "custom"> | "custom";
    label: string;
    seconds?: number;
}> = [
    { value: "5m", label: "5 Minutes", seconds: 300 },
    { value: "15m", label: "15 Minutes", seconds: 900 },
    { value: "30m", label: "30 Minutes", seconds: 1800 },
    { value: "1h", label: "1 Hour", seconds: 3600 },
    { value: "2h", label: "2 Hours", seconds: 7200 },
    { value: "4h", label: "4 Hours", seconds: 14400 },
    { value: "6h", label: "6 Hours", seconds: 21600 },
    { value: "12h", label: "12 Hours", seconds: 43200 },
    { value: "24h", label: "24 Hours", seconds: 86400 },
    { value: "48h", label: "48 Hours", seconds: 172800 },
    { value: "72h", label: "72 Hours", seconds: 259200 },
    { value: "custom", label: "Custom" },
];

const CACHE_TTL_SECONDS_BY_PRESET = new Map(
    CACHE_TTL_PRESET_OPTIONS
        .filter((option) => typeof option.seconds === "number")
        .map((option) => [option.value, option.seconds] as const)
);

const CACHE_TTL_PRESET_BY_SECONDS = new Map(
    CACHE_TTL_PRESET_OPTIONS
        .filter((option) => typeof option.seconds === "number")
        .map((option) => [option.seconds, option.value] as const)
);

export const isMDBListEditableOccurrence = (
    occurrence: AIOMetadataMDBListEditableOccurrenceLike
) => occurrence.source === "mdblist";

export const cacheTtlSecondsFromPreset = (
    preset: AIOMetadataCacheTtlPreset
) => {
    if (preset === "inherit" || preset === "custom") return undefined;
    return CACHE_TTL_SECONDS_BY_PRESET.get(preset);
};

export const detectCacheTtlPreset = (
    seconds: number | undefined
): AIOMetadataCacheTtlPreset => {
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
        return "custom";
    }

    return CACHE_TTL_PRESET_BY_SECONDS.get(seconds) || "custom";
};

export type AIOMetadataTemplateApplyMode = "fill-unset" | "replace-matching";

type AIOMetadataTemplateGroupMatch = {
    widgetNames?: string[];
    namePrefixes?: string[];
};

type AIOMetadataTemplateCatalogMatch = {
    catalogIds?: string[];
    names?: string[];
    namePrefixes?: string[];
};

export type AIOMetadataTemplateTargetRule =
    | {
        kind: "mdblist-group";
        match: AIOMetadataTemplateGroupMatch;
        values: {
            sort: AIOMetadataMDBListSort;
            order: "asc" | "desc";
            cacheTTL: number;
        };
    }
    | {
        kind: "trakt-group";
        match: AIOMetadataTemplateGroupMatch;
        values: {
            sort: AIOMetadataTraktSort;
            sortDirection: "asc" | "desc";
            cacheTTL: number;
        };
    }
    | {
        kind: "streaming-group";
        match: AIOMetadataTemplateGroupMatch;
        values: {
            sort: AIOMetadataStreamingSort;
            sortDirection: "asc" | "desc";
        };
    }
    | {
        kind: "mdblist-catalog";
        match: AIOMetadataTemplateCatalogMatch;
        values: {
            sort: AIOMetadataMDBListSort;
            order: "asc" | "desc";
            cacheTTL: number;
        };
    }
    | {
        kind: "trakt-catalog";
        match: AIOMetadataTemplateCatalogMatch;
        values: {
            sort: AIOMetadataTraktSort;
            sortDirection: "asc" | "desc";
            cacheTTL: number;
        };
    }
    | {
        kind: "trakt-watchlist";
        match: {
            catalogIds: ["trakt.watchlist"];
            names?: ["[Discover] Watchlist"];
        };
        values: {
            sort: "added";
            sortDirection: "asc" | "desc";
            cacheTTL: number;
        };
    };

export type AIOMetadataExportTemplateDefinition = {
    id: "default-aiometadata-sorting";
    label: string;
    rules: AIOMetadataTemplateTargetRule[];
};

export const DEFAULT_AIOMETADATA_EXPORT_TEMPLATE: AIOMetadataExportTemplateDefinition = {
    id: "default-aiometadata-sorting",
    label: "UME Sorting",
    rules: [
        {
            kind: "mdblist-group",
            match: {
                widgetNames: [
                    "Streaming Services",
                    "Service",
                    "Services",
                    "Decades",
                    "Year",
                    "Years",
                    "Genre",
                    "Genres",
                    "Director",
                    "Directors",
                    "Actor",
                    "Actors",
                ],
                namePrefixes: ["[Service]", "[Year]", "[Genre]", "[Director]", "[Actor]"],
            },
            values: {
                sort: "tmdbpopular",
                order: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-group",
            match: {
                widgetNames: [
                    "Streaming Services",
                    "Service",
                    "Services",
                    "Decades",
                    "Year",
                    "Years",
                    "Genre",
                    "Genres",
                    "Director",
                    "Directors",
                    "Actor",
                    "Actors",
                ],
                namePrefixes: ["[Service]", "[Year]", "[Genre]", "[Director]", "[Actor]"],
            },
            values: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "streaming-group",
            match: {
                widgetNames: [
                    "Streaming Services",
                    "Service",
                    "Services",
                    "Decades",
                    "Year",
                    "Years",
                    "Genre",
                    "Genres",
                    "Director",
                    "Directors",
                    "Actor",
                    "Actors",
                ],
                namePrefixes: ["[Service]", "[Year]", "[Genre]", "[Director]", "[Actor]"],
            },
            values: {
                sort: "popularity",
                sortDirection: "desc",
            },
        },
        {
            kind: "mdblist-group",
            match: {
                widgetNames: ["Collection", "Collections"],
                namePrefixes: ["[Collection]"],
            },
            values: {
                sort: "released",
                order: "desc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-group",
            match: {
                widgetNames: ["Collection", "Collections"],
                namePrefixes: ["[Collection]"],
            },
            values: {
                sort: "released",
                sortDirection: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "streaming-group",
            match: {
                widgetNames: ["Collection", "Collections"],
                namePrefixes: ["[Collection]"],
            },
            values: {
                sort: "release_date",
                sortDirection: "desc",
            },
        },
        {
            kind: "mdblist-group",
            match: {
                widgetNames: ["Header"],
                namePrefixes: ["[Header]"],
            },
            values: {
                sort: "random",
                order: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-group",
            match: {
                widgetNames: ["Header"],
                namePrefixes: ["[Header]"],
            },
            values: {
                sort: "random",
                sortDirection: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "mdblist-catalog",
            match: {
                namePrefixes: [
                    "[Discover] Latest Movies (Movies)",
                    "[Discover] Latest Shows (Shows)",
                    "[Discover] Latest (Movies)",
                    "[Discover] Latest (Shows)",
                ],
            },
            values: {
                sort: "released",
                order: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-catalog",
            match: {
                namePrefixes: [
                    "[Discover] Latest Movies (Movies)",
                    "[Discover] Latest Shows (Shows)",
                    "[Discover] Latest (Movies)",
                    "[Discover] Latest (Shows)",
                ],
            },
            values: {
                sort: "released",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "mdblist-catalog",
            match: {
                namePrefixes: [
                    "[Discover] Trending Movies (Movies)",
                    "[Discover] Trending Shows (Shows)",
                    "[Discover] Trending (Movies)",
                    "[Discover] Trending (Shows)",
                ],
            },
            values: {
                sort: "imdbpopular",
                order: "asc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-catalog",
            match: {
                namePrefixes: [
                    "[Discover] Trending Movies (Movies)",
                    "[Discover] Trending Shows (Shows)",
                    "[Discover] Trending (Movies)",
                    "[Discover] Trending (Shows)",
                ],
            },
            values: {
                sort: "popularity",
                sortDirection: "desc",
                cacheTTL: 43200,
            },
        },
        {
            kind: "trakt-watchlist",
            match: {
                catalogIds: ["trakt.watchlist"],
                names: ["[Discover] Watchlist"],
            },
            values: {
                sort: "added",
                sortDirection: "asc",
                cacheTTL: 1800,
            },
        },
    ],
};

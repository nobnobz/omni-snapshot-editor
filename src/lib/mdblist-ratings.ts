type StringMap = Record<string, string>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const toUniqueStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];

    const normalized: string[] = [];
    value.forEach((entry) => {
        if (typeof entry !== "string" || normalized.includes(entry)) return;
        normalized.push(entry);
    });
    return normalized;
};

const pickUnknownStringEntries = (value: unknown, knownKeys: Set<string>): StringMap => {
    if (!isRecord(value)) return {};

    const entries: StringMap = {};
    Object.entries(value).forEach(([key, entry]) => {
        if (knownKeys.has(key) || typeof entry !== "string") return;
        entries[key] = entry;
    });
    return entries;
};

export const MDBLIST_RATING_DEFINITIONS = [
    { key: "trakt", label: "Trakt", defaultBadgeText: "🔥", defaultColorHex: "#ED1C2400" },
    { key: "imdb", label: "IMDb", defaultBadgeText: "⭐️", defaultColorHex: "#F5C51800" },
    { key: "tmdb", label: "TMDb", defaultBadgeText: "🎬", defaultColorHex: "#01B4E400" },
    { key: "letterboxd", label: "Letterboxd", defaultBadgeText: "🟢", defaultColorHex: "#00E05400" },
    { key: "tomatoes", label: "Rotten Tomatoes", defaultBadgeText: "🍅", defaultColorHex: "#FA320A00" },
    { key: "audience", label: "Audience Score", defaultBadgeText: "🍿", defaultColorHex: "#FFB00000" },
    { key: "metacritic", label: "Metacritic", defaultBadgeText: "🟨", defaultColorHex: "#FFCC3300" },
    { key: "score", label: "Score", defaultBadgeText: "💯", defaultColorHex: "#22C55E00" },
    { key: "score_average", label: "Average Score", defaultBadgeText: "💙", defaultColorHex: "#38BDF800" },
] as const;

export type MdblistRatingKey = typeof MDBLIST_RATING_DEFINITIONS[number]["key"];

export type MdblistRatingDefinition = typeof MDBLIST_RATING_DEFINITIONS[number];

export const MDBLIST_RATING_KEYS = MDBLIST_RATING_DEFINITIONS.map((definition) => definition.key) as MdblistRatingKey[];

const MDBLIST_RATING_KEY_SET = new Set<string>(MDBLIST_RATING_KEYS);

export const MDBLIST_SETTINGS_KEYS = [
    "mdblist_enabled_ratings",
    "mdblist_rating_order",
    "mdblist_badge_text_overrides",
    "mdblist_badge_color_hex_values",
] as const;

export const MDBLIST_DEFAULT_ENABLED_RATINGS: MdblistRatingKey[] = ["tomatoes", "imdb"];

export const MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES: Record<MdblistRatingKey, string> = Object.fromEntries(
    MDBLIST_RATING_DEFINITIONS.map((definition) => [definition.key, definition.defaultBadgeText])
) as Record<MdblistRatingKey, string>;

export const MDBLIST_DEFAULT_BADGE_COLOR_VALUES: Record<MdblistRatingKey, string> = Object.fromEntries(
    MDBLIST_RATING_DEFINITIONS.map((definition) => [definition.key, definition.defaultColorHex])
) as Record<MdblistRatingKey, string>;

export const isSupportedMdblistRatingKey = (value: string): value is MdblistRatingKey =>
    MDBLIST_RATING_KEY_SET.has(value);

export const normalizeMdblistEnabledRatings = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [...MDBLIST_DEFAULT_ENABLED_RATINGS];
    }

    const entries = toUniqueStringList(value);
    const supported = MDBLIST_RATING_KEYS.filter((key) => entries.includes(key));
    const unknown = entries.filter((entry) => !isSupportedMdblistRatingKey(entry));
    return [...supported, ...unknown];
};

export const normalizeMdblistRatingOrder = (value: unknown): string[] => {
    const entries = toUniqueStringList(value);
    const supportedInOrder = entries.filter(isSupportedMdblistRatingKey);
    const missingSupported = MDBLIST_RATING_KEYS.filter((key) => !supportedInOrder.includes(key));
    const unknown = entries.filter((entry) => !isSupportedMdblistRatingKey(entry));
    return [...supportedInOrder, ...missingSupported, ...unknown];
};

export const normalizeMdblistBadgeTextOverrides = (value: unknown): StringMap => {
    const unknownEntries = pickUnknownStringEntries(value, MDBLIST_RATING_KEY_SET);
    const normalized: StringMap = { ...unknownEntries };

    MDBLIST_RATING_KEYS.forEach((key) => {
        const importedValue = isRecord(value) ? value[key] : undefined;
        normalized[key] = typeof importedValue === "string" && importedValue.trim() !== ""
            ? importedValue
            : MDBLIST_DEFAULT_BADGE_TEXT_OVERRIDES[key];
    });

    return normalized;
};

export const normalizeMdblistBadgeColorValues = (value: unknown): StringMap => {
    const unknownEntries = pickUnknownStringEntries(value, MDBLIST_RATING_KEY_SET);
    const normalized: StringMap = { ...unknownEntries };

    MDBLIST_RATING_KEYS.forEach((key) => {
        const importedValue = isRecord(value) ? value[key] : undefined;
        normalized[key] = typeof importedValue === "string"
            ? importedValue
            : MDBLIST_DEFAULT_BADGE_COLOR_VALUES[key];
    });

    return normalized;
};

export const normalizeMdblistSettings = <T extends Record<string, unknown>>(values: T): T => ({
    ...values,
    mdblist_enabled_ratings: normalizeMdblistEnabledRatings(values.mdblist_enabled_ratings),
    mdblist_rating_order: normalizeMdblistRatingOrder(values.mdblist_rating_order),
    mdblist_badge_text_overrides: normalizeMdblistBadgeTextOverrides(values.mdblist_badge_text_overrides),
    mdblist_badge_color_hex_values: normalizeMdblistBadgeColorValues(values.mdblist_badge_color_hex_values),
});

import { produce } from "immer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Omni configs are user-defined dynamic JSON blobs.
type LooseAny = any;
type MutableState = Record<string, LooseAny>;

export const PATTERN_DICT_KEYS = [
    "regex_pattern_custom_names",
    "regex_pattern_image_urls",
    "pattern_image_color_indices",
    "pattern_border_radius_indices",
    "pattern_background_opacities",
    "pattern_border_thickness_indices",
    "pattern_color_indices",
    "pattern_color_hex_values",
] as const;

export const PATTERN_ARRAY_KEYS = [
    "pattern_tag_enabled_patterns",
    "pattern_default_filter_enabled_patterns",
    "auto_play_enabled_patterns",
    "auto_play_patterns",
] as const;

export const PATTERN_ALL_KEYS = [...PATTERN_DICT_KEYS, ...PATTERN_ARRAY_KEYS] as const;

export type PatternImportValues = Partial<Record<(typeof PATTERN_ALL_KEYS)[number], unknown>>;

export type ImportedPatternMetadata = {
    regex: string;
    orderIndex: number;
    presentInKeys: string[];
    isActive: boolean;
};

const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export const extractPatternImportValues = (decoded: Record<string, unknown>): PatternImportValues => {
    const extracted: PatternImportValues = {};
    PATTERN_ALL_KEYS.forEach((key) => {
        if (decoded[key] !== undefined) {
            extracted[key] = decoded[key];
        }
    });
    return extracted;
};

export const buildImportedPatternMetadata = (importedValues: PatternImportValues): ImportedPatternMetadata[] => {
    const orderedRegexes: string[] = [];
    const seenRegexes = new Set<string>();
    const pushRegex = (regex: unknown) => {
        if (typeof regex !== "string" || seenRegexes.has(regex)) return;
        seenRegexes.add(regex);
        orderedRegexes.push(regex);
    };

    toStringArray(importedValues.auto_play_patterns).forEach(pushRegex);

    PATTERN_DICT_KEYS.forEach((key) => {
        const dict = importedValues[key];
        if (!isRecord(dict)) return;
        Object.keys(dict).forEach(pushRegex);
    });

    PATTERN_ARRAY_KEYS
        .filter((key) => key !== "auto_play_patterns")
        .forEach((key) => {
            toStringArray(importedValues[key]).forEach(pushRegex);
        });

    return orderedRegexes.map((regex, orderIndex) => {
        const presentInKeys: string[] = [];

        PATTERN_ALL_KEYS.forEach((key) => {
            if (PATTERN_DICT_KEYS.includes(key as (typeof PATTERN_DICT_KEYS)[number])) {
                const dict = importedValues[key];
                if (isRecord(dict) && dict[regex] !== undefined) {
                    presentInKeys.push(key);
                }
                return;
            }

            if (toStringArray(importedValues[key]).includes(regex)) {
                presentInKeys.push(key);
            }
        });

        const isActive = toStringArray(importedValues.pattern_tag_enabled_patterns).includes(regex);

        return {
            regex,
            orderIndex,
            presentInKeys,
            isActive,
        };
    });
};

export const applyImportedPatternsToState = (
    state: MutableState,
    importedValues: PatternImportValues,
    orderedSelectedRegexes: string[]
): MutableState => {
    const selectedRegexSet = new Set(orderedSelectedRegexes);

    return produce(state, (draft) => {
        orderedSelectedRegexes.forEach((regex) => {
            PATTERN_DICT_KEYS.forEach((key) => {
                const importedDict = importedValues[key];
                if (!isRecord(importedDict)) return;
                const value = importedDict[regex];
                if (value === undefined) return;

                const targetDict = isRecord(draft[key]) ? draft[key] : {};
                targetDict[regex] = value;
                draft[key] = targetDict;
            });
        });

        PATTERN_ARRAY_KEYS.forEach((key) => {
            const importedArray = toStringArray(importedValues[key]);
            if (importedArray.length === 0) return;

            const importedSelectedOrdered = orderedSelectedRegexes.filter((regex) => importedArray.includes(regex));
            const currentArray = toStringArray(draft[key]);
            const preservedCurrent = currentArray.filter((regex) => !selectedRegexSet.has(regex));

            draft[key] = [...preservedCurrent, ...importedSelectedOrdered];
        });
    });
};

export const removePatternFromState = (state: MutableState, regex: string): MutableState =>
    produce(state, (draft) => {
        PATTERN_DICT_KEYS.forEach((key) => {
            const dict = draft[key];
            if (!isRecord(dict)) return;
            delete dict[regex];
        });

        PATTERN_ARRAY_KEYS.forEach((key) => {
            const list = toStringArray(draft[key]);
            if (list.length === 0) return;
            draft[key] = list.filter((entry) => entry !== regex);
        });
    });

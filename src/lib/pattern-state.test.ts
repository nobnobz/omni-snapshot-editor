import { describe, expect, it } from "vitest";
import {
    applyImportedPatternsToState,
    buildImportedPatternMetadata,
    removePatternFromState,
    type PatternImportValues,
} from "./pattern-state";

describe("pattern-state", () => {
    it("preserves imported regex order and active state arrays during import", () => {
        const currentState = {
            pattern_tag_enabled_patterns: ["existing-active", "old-selected"],
            pattern_default_filter_enabled_patterns: ["old-selected"],
            auto_play_enabled_patterns: ["old-selected"],
            auto_play_patterns: ["existing-active", "old-selected"],
            regex_pattern_custom_names: {
                "old-selected": "Old Name",
            },
        };

        const importedValues: PatternImportValues = {
            auto_play_patterns: ["new-later", "new-first", "old-selected"],
            pattern_tag_enabled_patterns: ["new-first"],
            pattern_default_filter_enabled_patterns: ["new-later", "new-first"],
            auto_play_enabled_patterns: ["new-first", "new-later"],
            regex_pattern_custom_names: {
                "new-first": "New First",
                "new-later": "New Later",
            },
        };

        const metadata = buildImportedPatternMetadata(importedValues);
        const orderedSelectedRegexes = metadata
            .map((entry) => entry.regex)
            .filter((regex) => regex === "new-later" || regex === "new-first");

        const nextState = applyImportedPatternsToState(currentState, importedValues, orderedSelectedRegexes);

        expect(nextState.auto_play_patterns).toEqual(["existing-active", "old-selected", "new-later", "new-first"]);
        expect(nextState.pattern_tag_enabled_patterns).toEqual(["existing-active", "old-selected", "new-first"]);
        expect(nextState.pattern_default_filter_enabled_patterns).toEqual(["old-selected", "new-later", "new-first"]);
        expect(nextState.auto_play_enabled_patterns).toEqual(["old-selected", "new-later", "new-first"]);
        expect(nextState.regex_pattern_custom_names["new-first"]).toBe("New First");
        expect(nextState.regex_pattern_custom_names["new-later"]).toBe("New Later");
    });

    it("removes pattern references from every pattern list and dictionary", () => {
        const currentState = {
            regex_pattern_custom_names: {
                "target-pattern": "Target",
                "keep-pattern": "Keep",
            },
            regex_pattern_image_urls: {
                "target-pattern": "https://example.com/target.png",
            },
            pattern_image_color_indices: {
                "target-pattern": 1,
            },
            pattern_border_radius_indices: {
                "target-pattern": 3,
            },
            pattern_background_opacities: {
                "target-pattern": 40,
            },
            pattern_border_thickness_indices: {
                "target-pattern": 2,
            },
            pattern_color_indices: {
                "target-pattern": 8,
            },
            pattern_color_hex_values: {
                "target-pattern": "#000000",
            },
            pattern_tag_enabled_patterns: ["target-pattern", "keep-pattern"],
            pattern_default_filter_enabled_patterns: ["target-pattern"],
            auto_play_enabled_patterns: ["target-pattern"],
            auto_play_patterns: ["keep-pattern", "target-pattern"],
        };

        const nextState = removePatternFromState(currentState, "target-pattern");

        expect(nextState.regex_pattern_custom_names["target-pattern"]).toBeUndefined();
        expect(nextState.regex_pattern_image_urls["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_image_color_indices["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_border_radius_indices["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_background_opacities["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_border_thickness_indices["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_color_indices["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_color_hex_values["target-pattern"]).toBeUndefined();
        expect(nextState.pattern_tag_enabled_patterns).toEqual(["keep-pattern"]);
        expect(nextState.pattern_default_filter_enabled_patterns).toEqual([]);
        expect(nextState.auto_play_enabled_patterns).toEqual([]);
        expect(nextState.auto_play_patterns).toEqual(["keep-pattern"]);
    });
});

"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search, Check } from "lucide-react";
import { ISO_639_2_LANGUAGES } from "@/lib/languages";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, resolveCatalogName } from "@/lib/utils";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";

// Helper to format snake_case keys to Title Case
const formatKeyToTitle = (key: string): string => {
    // Check if it's a known technical key that needs special formatting
    const specialMappings: Record<string, string> = {
        "isASSUseImageRender": "ASS Image Rendering",
        "isSRTUseImageRender": "SRT Image Rendering",
        "preferred_audio_language": "Preferred Audio Language",
        "preferred_subtitle_language": "Preferred Subtitle Language",
        "hide_external_playback_prompt": "External Playback Prompt",
        "enable_external_player_trakt_scrobbling": "External Player Trakt Scrobbling",
        "intro_skip_times": "Intro Skip Times",
        "default_players": "Default Players",
        "subtitle_font_size": "Subtitle Font Size",
        "subtitle_italic": "Subtitle Italic",
        "subtitle_bold": "Subtitle Bold",
        "mdblist_enabled_ratings": "MDBList Rating Icons",
        "top_row_item_limits": "Top Row Items",
        "custom_catalog_names": "Custom Catalog Names",
        "oled_mode_enabled": "OLED Mode"
    };

    if (specialMappings[key]) return specialMappings[key];

    return key
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Inline descriptions for settings — shown as subtle text under the title
const SETTING_DESCRIPTIONS: Record<string, string> = {
    "hide_external_playback_prompt": "Disable only if you use the internal player or Trakt tracking.",
    "hide_spoilers": "Blurs thumbnails and descriptions for new episodes of series.",
    "small_continue_watching_shelf": "Makes the continue watching shelf smaller on the home screen.",
    "mdblist_enabled_ratings": "Requires an MDBList API key set in Omni.",
    "oled_mode_enabled": "Enables true black backgrounds for OLED displays.",
    "hide_addon_info_in_catalog_names": "Removes the addon suffix from home screen catalogs.",
    "preferred_audio_language": "Sets the default audio language for your library.",
    "preferred_subtitle_language": "Sets the default subtitle language for your library.",
    "custom_catalog_names": "Maps catalog IDs to human-readable display names.",
};

interface GenericRendererProps {
    data: unknown;
    path: string[];
    searchQuery?: string;
}

export function GenericRenderer({ data, path, searchQuery = "" }: GenericRendererProps) {
    const { updateValue, toggleKey, disabledKeys, currentValues } = useConfig();

    const currentKey = path[path.length - 1];
    const pathString = path.join(".");
    const isDisabled = disabledKeys.has(pathString);
    const [catSearch, setCatSearch] = useState("");

    const isFilteredOut = !!(searchQuery && pathString && !pathString.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleToggle = (checked: boolean) => {
        toggleKey(path, checked);

        // Ensure the value exists in state when turning ON if it was missing
        if (checked && data === undefined) {
            if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf") {
                updateValue(path, true);
            } else if (currentKey === "hide_external_playback_prompt") {
                // Switch ON = prompt visible = value false
                updateValue(path, false);
            } else if (currentKey === "mdblist_enabled_ratings") {
                // Default array for ratings
                updateValue(path, ["tomatoes", "imdb"]);
            } else if (currentKey === "hidden_stream_button_elements") {
                updateValue(path, ["Metadata Tags", "Addon Name"]);
            } else if (currentKey === "oled_mode_enabled" || currentKey === "hide_addon_info_in_catalog_names") {
                updateValue(path, true);
            }
            return;
        }

        // Unified Logic for specific General Settings
        if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf" || currentKey === "oled_mode_enabled" || currentKey === "hide_addon_info_in_catalog_names") {
            updateValue(path, checked);
        } else if (currentKey === "hide_external_playback_prompt") {
            // Inverted logic: Switch ON = value false (don't hide), Switch OFF = value true (hide)
            updateValue(path, !checked);
        }
    };

    const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateValue(path, e.target.value);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            updateValue(path, val);
        }
    };

    const handleBooleanChange = (checked: boolean) => {
        updateValue(path, checked);
        // For unified settings, we sync the section toggle as well
        if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf" || currentKey === "hide_external_playback_prompt") {
            // For simplify, we just mirror the section state
            toggleKey(path, true); // Keep it "On" in editor if manually changed inside
        }
    };

    const handleArrayStringChange = (index: number, val: string) => {
        if (!Array.isArray(data)) return;
        const newArr = [...data];
        newArr[index] = val;
        updateValue(path, newArr);
    };

    const removeArrayItem = (index: number) => {
        if (!Array.isArray(data)) return;
        const newArr = [...data];
        newArr.splice(index, 1);
        updateValue(path, newArr);
    };

    const addArrayItem = () => {
        const newArr = Array.isArray(data) ? [...data] : [];
        newArr.push(""); // Assuming string array by default for simple lists
        updateValue(path, newArr);
    };

    // Specialized keys that hide their internal "Value" toggles to avoid UI duplication
    const UNIFIED_KEYS = ["hide_spoilers", "small_continue_watching_shelf", "hide_external_playback_prompt", "oled_mode_enabled", "hide_addon_info_in_catalog_names"];
    const ALWAYS_RENDER_KEYS = ["hide_spoilers", "small_continue_watching_shelf", "hide_external_playback_prompt", "oled_mode_enabled", "hide_addon_info_in_catalog_names"];

    const shouldSkipNullData =
        (data === null || data === undefined)
        && !ALWAYS_RENDER_KEYS.includes(currentKey)
        && !["preferred_audio_language", "preferred_subtitle_language"].includes(currentKey);

    // Determine custom checked state if unified logic applies
    let customChecked: boolean | undefined = undefined;
    if (currentKey === "hide_external_playback_prompt") {
        customChecked = data === undefined ? true : !data; // ON = true (default) or !hide
    } else if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf" || currentKey === "oled_mode_enabled" || currentKey === "hide_addon_info_in_catalog_names") {
        customChecked = !!data; // Switch ON = value true
    }

    // Shared field chrome to keep all controls visually consistent.
    const renderWrapper = (children?: React.ReactNode, hideToggle = false) => {
        if (!currentKey) return <>{children}</>; // Root level bypass

        const displayChecked = customChecked !== undefined ? customChecked : !isDisabled;
        const isFaded = !hideToggle && !displayChecked;
        const description = SETTING_DESCRIPTIONS[currentKey];

        const hasVisibleChildren = !isFaded && children;

        return (
            <div
                className={cn(
                    "p-4 sm:p-5 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out",
                    editorSurface.cardInteractive,
                    displayChecked
                        ? "border-slate-200/78 shadow-[0_8px_20px_rgba(15,23,42,0.045)] dark:border-white/8 dark:shadow-[0_6px_14px_rgba(2,6,23,0.08)]"
                        : "border-slate-200/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(241,245,249,0.34))] shadow-[0_6px_16px_rgba(15,23,42,0.03)] dark:border-white/6 dark:bg-[linear-gradient(180deg,rgba(19,22,28,0.78),rgba(18,21,27,0.76))] dark:shadow-[0_6px_14px_rgba(2,6,23,0.06)]"
                )}
            >
                <div className={`flex items-start justify-between gap-3 sm:items-center ${hasVisibleChildren ? "mb-4 pb-4 border-b border-border/40" : ""}`}>
                    <div className={`min-w-0 flex-1 flex flex-col gap-1 transition-opacity duration-300 ${isFaded ? "opacity-55" : "opacity-100"}`}>
                        <span className="text-base font-semibold tracking-tight text-foreground">
                            {formatKeyToTitle(currentKey)}
                        </span>
                        {description && (
                            <span className={cn("text-xs sm:text-sm leading-relaxed", isFaded ? "text-foreground/48 sm:text-foreground/52" : "text-foreground/60 sm:text-foreground/65")}>
                                {description}
                            </span>
                        )}
                    </div>
                    {!hideToggle && (
                        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                            <Label
                                htmlFor={`toggle-${pathString}`}
                                className={cn(
                                    "hidden text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors sm:inline-flex",
                                    displayChecked
                                        ? "text-foreground/76"
                                        : "text-muted-foreground/90 hover:text-muted-foreground"
                                )}
                            >
                                {displayChecked ? "On" : "Off"}
                            </Label>
                            <Switch
                                id={`toggle-${pathString}`}
                                checked={displayChecked}
                                onCheckedChange={handleToggle}
                                className="data-[state=checked]:bg-primary transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out"
                            />
                        </div>
                    )}
                </div>

                {hasVisibleChildren && (
                    <div>{children}</div>
                )}
            </div>
        );
    };

    const isCustomCatalogNames =
        currentKey === "custom_catalog_names"
        && typeof data === "object"
        && data !== null
        && !Array.isArray(data);

    const customCatalogEntries: Array<[string, string]> = isCustomCatalogNames
        ? Object.entries(data as Record<string, string>)
        : [];

    const usedCatalogIds = React.useMemo(() => {
        if (!isCustomCatalogNames) {
            return new Set<string>();
        }

        const ids = new Set<string>();
        const arrayKeys = [
            "catalog_ordering",
            "selected_catalogs",
            "pinned_catalogs",
            "small_catalogs",
            "top_row_catalogs",
            "starred_catalogs",
            "randomized_catalogs",
            "small_toprow_catalogs",
        ];

        arrayKeys.forEach(key => {
            const list = currentValues[key];
            if (Array.isArray(list)) {
                list.forEach(id => {
                    if (typeof id === "string") {
                        ids.add(id);
                    }
                });
            }
        });

        if (currentValues.catalog_groups && typeof currentValues.catalog_groups === "object") {
            Object.values(currentValues.catalog_groups).forEach(idList => {
                if (Array.isArray(idList)) {
                    idList.forEach(id => {
                        if (typeof id === "string") {
                            ids.add(id);
                        }
                    });
                }
            });
        }

        if (currentValues.top_row_item_limits && typeof currentValues.top_row_item_limits === "object") {
            Object.keys(currentValues.top_row_item_limits).forEach(id => ids.add(id));
        }

        return ids;
    }, [isCustomCatalogNames, currentValues]);

    if (isFilteredOut) {
        return null;
    }
    if (shouldSkipNullData) {
        return null;
    }

    // Specialized rendering for languages
    if (currentKey === "preferred_audio_language" || currentKey === "preferred_subtitle_language") {
        const selectedLanguage = typeof data === "string" ? data : "";
        return renderWrapper(
                <div className="space-y-1">
                    <Select value={selectedLanguage} onValueChange={(val) => updateValue(path, val)}>
                        <SelectTrigger className="bg-background/50 border-border text-foreground h-10 hover:border-border/80 hover:bg-background/70 transition-colors shadow-inner focus:ring-[3px] focus:ring-ring/50">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {Object.entries(ISO_639_2_LANGUAGES)
                                .sort((a, b) => a[1].localeCompare(b[1]))
                                .map(([code, name]) => (
                                    <SelectItem key={code} value={code} className="focus:bg-primary focus:text-primary-foreground cursor-pointer transition-colors">
                                        {name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>,
            true
        );
    }

    // Specialized rendering for Custom Catalog Names
    if (isCustomCatalogNames) {
        const filteredEntries = customCatalogEntries.filter(([id, name]) =>
            id.toLowerCase().includes(catSearch.toLowerCase()) ||
            name.toLowerCase().includes(catSearch.toLowerCase())
        ).sort((a, b) => a[1].localeCompare(b[1]));

        return renderWrapper(
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search names or IDs..."
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            className="h-10 bg-background/50 border-border text-sm pl-9 placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors shadow-inner"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredEntries.map(([id, name]) => {
                            const isInUse = usedCatalogIds.has(id);
                            return (
                                <div key={id} className={`flex items-center justify-between p-3 rounded-lg border transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out group ${isInUse ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-background/40 hover:bg-muted/30 hover:border-border/80'}`}>
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-medium text-foreground truncate" title={name}>
                                                {name}
                                            </span>
                                            {isInUse && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/20 shadow-sm">
                                                    <Check className="w-2.5 h-2.5" /> In Use
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground truncate mt-1" title={id}>
                                            {id}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateValue([...path, id], undefined)}
                                        className={cn(
                                            "h-8 w-8 shrink-0 rounded-md text-muted-foreground",
                                            editorHover.iconDanger,
                                            isInUse ? "opacity-20 hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                                        )}
                                        title={isInUse ? "This name is currently in use in a subgroup!" : "Delete custom name"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {customCatalogEntries.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-2">
                                <Search className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">No custom catalog names defined</p>
                            </div>
                        )}
                        {customCatalogEntries.length > 0 && filteredEntries.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-2">
                                <Search className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">No matches found for &quot;{catSearch}&quot;</p>
                            </div>
                        )}
                    </div>
                </div>
        );
    }

    // Specialized rendering for simple boolean or array-requirement toggles (merged & simplified)
    if (UNIFIED_KEYS.includes(currentKey)) {
        return renderWrapper();
    }

    if (typeof data === "string") {
        return renderWrapper(
                data.startsWith("#") && data.length === 7 ? (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg border border-border/50 shrink-0 shadow-inner ring-1 ring-black/20"
                            style={{ backgroundColor: data }}
                        />
                        <Input
                            type="text"
                            value={data}
                            onChange={handleStringChange}
                            className="bg-background/50 border-border hover:border-border/80 hover:bg-background/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 font-mono text-foreground transition-colors shadow-inner"
                        />
                    </div>
                ) : (
                    <Input
                        type="text"
                        value={data}
                        onChange={handleStringChange}
                        className="bg-background/50 border-border hover:border-border/80 hover:bg-background/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 text-foreground transition-colors shadow-inner w-full"
                    />
                )
        );
    }

    // Number rendering
    if (typeof data === "number") {
        return renderWrapper(
                <Input
                    type="number"
                    value={data}
                    onChange={handleNumberChange}
                    className="bg-background/50 border-border hover:border-border/80 hover:bg-background/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 font-mono text-foreground w-full max-w-[200px] transition-colors shadow-inner"
                />
        );
    }

    // Boolean rendering
    if (typeof data === "boolean" && !UNIFIED_KEYS.includes(currentKey)) {
        return renderWrapper(
                <div className="flex flex-row items-center justify-between rounded-xl border border-border/80 p-4 bg-background/40 shadow-inner">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">Value</Label>
                        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                            {data ? "True" : "False"}
                        </p>
                    </div>
                    <Switch
                        checked={data}
                        onCheckedChange={handleBooleanChange}
                        className="data-[state=checked]:bg-emerald-500 transition-colors shadow-sm"
                    />
                </div>
        );
    }

    // Array rendering
    if (Array.isArray(data)) {
        return renderWrapper(
                <div className="space-y-3">
                    {data.map((item, idx) => {
                        // Check if it's a primitive array (e.g. strings)
                        if (typeof item === "string" || typeof item === "number") {
                            return (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayStringChange(idx, e.target.value)}
                                            className="bg-background/50 border-border hover:border-border/80 hover:bg-background/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 text-sm h-10 w-full transition-colors shadow-inner"
                                        />
                                        {(typeof item === 'string' && currentValues.custom_catalog_names?.[item]) && (
                                            <p className="text-xs text-primary mt-1.5 ml-1 px-2 py-0.5 rounded-sm bg-primary/12 border-l-2 border-primary inline-block">
                                                Label: <span className="font-semibold">{resolveCatalogName(item, currentValues.custom_catalog_names)}</span>
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeArrayItem(idx)}
                                        className={cn("h-10 w-10 rounded-lg shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100", editorHover.iconDanger)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        } else {
                            return (
                                <div key={idx} className="border border-border/80 rounded-xl p-4 bg-background/40 relative group shadow-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-border/90 hover:bg-muted/28">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeArrayItem(idx)}
                                        className={cn("absolute top-3 right-3 h-8 w-8 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100", editorHover.iconDanger)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Item <span className="text-foreground">{idx}</span></span>
                                    <GenericRenderer data={item} path={[...path, String(idx)]} searchQuery={searchQuery} />
                                </div>
                            );
                        }
                    })}

                    <Button variant="outline" size="sm" onClick={addArrayItem} className="w-full border-border border-dashed bg-background/30 text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border/80 mt-3 h-10 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out rounded-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
        );
    }

    // Object rendering
    if (data && typeof data === "object") {
        const objectData = data as Record<string, unknown>;
        // Do not use a wrapper if it's the root to avoid double boxing
        if (!currentKey) {
            return (
                <div className="space-y-2">
                    {Object.entries(objectData).map(([key, val]) => (
                        <GenericRenderer key={key} data={val} path={[...path, key]} searchQuery={searchQuery} />
                    ))}
                </div>
            );
        }

        return renderWrapper(
                <Accordion type="single" collapsible className="w-full overflow-hidden border border-border/80 rounded-xl bg-background/40 shadow-sm transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-border/90 hover:bg-muted/30">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 text-sm font-medium text-foreground transition-colors">
                            <span className="flex items-center gap-3">
                                View Object Details
                                <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                    {Object.keys(objectData).length} keys
                                </span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="p-5 border-t border-border/50 space-y-5 bg-background/20">
                            {Object.entries(objectData).map(([key, val]) => (
                                <GenericRenderer key={key} data={val} path={[...path, key]} searchQuery={searchQuery} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
        );
    }

    return (
        <div className="text-red-500 text-xs">Unsupported type for {pathString}</div>
    );
}

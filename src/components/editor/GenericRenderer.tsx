"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronRight, ChevronDown, AlertCircle, Search, Check } from "lucide-react";
import { ISO_639_2_LANGUAGES } from "@/lib/languages";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDisplayName, resolveCatalogName } from "@/lib/utils";
import { getAllCatalogIds } from "@/lib/mutations";

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
        "oled_mode_enabled": "OLED Mode",
        "hidden_stream_button_elements": "Hide Elements From The Stream Selection"
    };

    if (specialMappings[key]) return specialMappings[key];

    return key
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

interface GenericRendererProps {
    data: any;
    path: string[];
    searchQuery?: string;
}

export function GenericRenderer({ data, path, searchQuery = "" }: GenericRendererProps) {
    const { updateValue, toggleKey, disabledKeys, originalConfig, currentValues } = useConfig();

    const currentKey = path[path.length - 1];
    const pathString = path.join(".");
    const isDisabled = disabledKeys.has(pathString);

    // If there's a search query, only render if the key matches or if a descendant matches
    // A simplistic filter check: does the path include the search term?
    if (searchQuery && pathString) {
        if (!pathString.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
        }
    }

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
        const newArr = [...data];
        newArr[index] = val;
        updateValue(path, newArr);
    };

    const removeArrayItem = (index: number) => {
        const newArr = [...data];
        newArr.splice(index, 1);
        updateValue(path, newArr);
    };

    const addArrayItem = () => {
        const newArr = [...(data || [])];
        newArr.push(""); // Assuming string array by default for simple lists
        updateValue(path, newArr);
    };

    // Specialized keys that hide their internal "Value" toggles to avoid UI duplication
    const UNIFIED_KEYS = ["hide_spoilers", "small_continue_watching_shelf", "hide_external_playback_prompt", "oled_mode_enabled", "hide_addon_info_in_catalog_names", "hidden_stream_button_elements"];
    const ALWAYS_RENDER_KEYS = ["hide_spoilers", "small_continue_watching_shelf", "hide_external_playback_prompt", "oled_mode_enabled", "hide_addon_info_in_catalog_names", "hidden_stream_button_elements"];

    if ((data === null || data === undefined) && !ALWAYS_RENDER_KEYS.includes(currentKey) && !["preferred_audio_language", "preferred_subtitle_language"].includes(currentKey)) {
        return null; // Skip rendering nulls, or render a baseline
    }

    // Determine custom checked state if unified logic applies
    let customChecked = undefined;
    if (currentKey === "hide_external_playback_prompt") {
        customChecked = data === undefined ? true : !data; // ON = true (default) or !hide
    } else if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf" || currentKey === "oled_mode_enabled" || currentKey === "hide_addon_info_in_catalog_names") {
        customChecked = !!data; // Switch ON = value true
    } else if (currentKey === "hidden_stream_button_elements") {
        customChecked = data !== undefined; // Switch ON if array exists
    }

    // Header/Wrapper for the field
    const Wrapper = ({ children, isPrimitive = false, info, hideToggle = false }: { children?: React.ReactNode, isPrimitive?: boolean, info?: React.ReactNode, hideToggle?: boolean }) => {
        if (!currentKey) return <>{children}</>; // Root level bypass

        const displayChecked = customChecked !== undefined ? customChecked : !isDisabled;
        const isFaded = !hideToggle && !displayChecked;

        return (
            <div className={`p-4 sm:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm transition-all duration-300 ${isFaded ? "opacity-50 grayscale-[0.3]" : "opacity-100 hover:bg-card/80 hover:border-border/80 hover:shadow-md"}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-tight text-foreground">
                            {formatKeyToTitle(currentKey)}
                        </span>
                    </div>
                    {!hideToggle && (
                        <div className="flex items-center gap-3 shrink-0">
                            <Label htmlFor={`toggle-${pathString}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none transition-colors hover:text-muted-foreground">
                                {displayChecked ? "On" : "Off"}
                            </Label>
                            <Switch
                                id={`toggle-${pathString}`}
                                checked={displayChecked}
                                onCheckedChange={handleToggle}
                                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-accent scale-90 sm:scale-100 transition-all origin-right"
                            />
                        </div>
                    )}
                </div>

                {!isFaded && children && (
                    <div className={`transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${isPrimitive ? "" : "mt-4 pt-4 border-t border-border/50"}`}>
                        {children}
                    </div>
                )}

                {info && (
                    <div className={`mt-3 ${isFaded ? "opacity-100" : ""}`}>
                        {info}
                    </div>
                )}
            </div>
        );
    };

    // Specialized rendering for languages
    if (currentKey === "preferred_audio_language" || currentKey === "preferred_subtitle_language") {
        return (
            <Wrapper isPrimitive hideToggle={true}>
                <div className="space-y-1">
                    <Select value={data} onValueChange={(val) => updateValue(path, val)}>
                        <SelectTrigger className="bg-background/50 border-border text-foreground h-10 hover:border-border transition-colors shadow-inner focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground max-h-[300px] shadow-xl backdrop-blur-xl">
                            {Object.entries(ISO_639_2_LANGUAGES)
                                .sort((a, b) => a[1].localeCompare(b[1]))
                                .map(([code, name]) => (
                                    <SelectItem key={code} value={code} className="focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">
                                        {name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </Wrapper>
        );
    }

    // Specialized rendering for Custom Catalog Names
    if (currentKey === "custom_catalog_names" && typeof data === "object" && data !== null) {
        const [catSearch, setCatSearch] = useState("");
        const entries = Object.entries(data as Record<string, string>);

        // Find all used IDs with a precise approach to avoid false positives
        const usedCatalogIds = React.useMemo(() => {
            const ids = new Set<string>();

            // 1. Array-based lists
            const arrayKeys = [
                "catalog_ordering", "selected_catalogs", "pinned_catalogs",
                "small_catalogs", "top_row_catalogs", "starred_catalogs",
                "randomized_catalogs", "small_toprow_catalogs"
            ];
            arrayKeys.forEach(key => {
                const list = currentValues[key];
                if (Array.isArray(list)) {
                    list.forEach(id => { if (typeof id === 'string') ids.add(id); });
                }
            });

            // 2. Subgroups
            if (currentValues.catalog_groups && typeof currentValues.catalog_groups === 'object') {
                Object.values(currentValues.catalog_groups).forEach((idList: any) => {
                    if (Array.isArray(idList)) {
                        idList.forEach(id => { if (typeof id === 'string') ids.add(id); });
                    }
                });
            }

            // 3. Top Row Limits
            if (currentValues.top_row_item_limits && typeof currentValues.top_row_item_limits === 'object') {
                Object.keys(currentValues.top_row_item_limits).forEach(id => ids.add(id));
            }

            return ids;
        }, [currentValues]);

        const filteredEntries = entries.filter(([id, name]) =>
            id.toLowerCase().includes(catSearch.toLowerCase()) ||
            name.toLowerCase().includes(catSearch.toLowerCase())
        ).sort((a, b) => a[1].localeCompare(b[1]));

        return (
            <Wrapper>
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search names or IDs..."
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            className="h-10 bg-background/50 border-border text-sm pl-9 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-inner"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredEntries.map(([id, name]) => {
                            const isInUse = usedCatalogIds.has(id);
                            return (
                                <div key={id} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 group ${isInUse ? 'border-blue-500/30 bg-blue-500/5' : 'border-border/60 bg-background/40 hover:bg-card/60 hover:border-border/60'}`}>
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate" title={name}>
                                                {name}
                                            </span>
                                            {isInUse && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-sm">
                                                    <Check className="w-2.5 h-2.5" /> In Use
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground truncate mt-1" title={id}>
                                            {id}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateValue([...path, id], undefined)}
                                        className={`h-8 w-8 shrink-0 transition-all rounded-md ${isInUse ? 'text-muted-foreground opacity-20 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10' : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10'}`}
                                        title={isInUse ? "This name is currently in use in a subgroup!" : "Delete custom name"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {entries.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-2">
                                <Search className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">No custom catalog names defined</p>
                            </div>
                        )}
                        {entries.length > 0 && filteredEntries.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-2">
                                <Search className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">No matches found for "{catSearch}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        );
    }

    // Specialized rendering for simple boolean or array-requirement toggles (merged & simplified)
    if (UNIFIED_KEYS.includes(currentKey)) {
        const info = (
            <div className="space-y-2">
                {currentKey === "hide_external_playback_prompt" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Disable only if you use the internal player or Trakt tracking.</p>
                    </div>
                )}
                {currentKey === "hide_spoilers" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>This blurs thumbnails and descriptions for new episodes of series.</p>
                    </div>
                )}
                {currentKey === "small_continue_watching_shelf" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Makes the continue watching shelf smaller on the home screen.</p>
                    </div>
                )}
                {currentKey === "mdblist_enabled_ratings" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>This requires an MDBList API key to be set in Omni.</p>
                    </div>
                )}
                {currentKey === "hide_addon_info_in_catalog_names" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Removes the addon suffix from home screen catalogs.</p>
                    </div>
                )}
                {currentKey === "hidden_stream_button_elements" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Choose which elements are displayed on the stream selection screen. If you use my template it is recommended to hide metadata tags and addon names.</p>
                    </div>
                )}
            </div>
        );

        if (currentKey === "hidden_stream_button_elements") {
            const options = ["Title", "Metadata Tags", "Pattern Tags", "Addon Name"];
            const currentSelection = (data as string[]) || [];

            const handleCheckboxChange = (opt: string, checked: boolean) => {
                if (checked) {
                    updateValue(path, [...currentSelection, opt]);
                } else {
                    updateValue(path, currentSelection.filter(x => x !== opt));
                }
            };

            return (
                <Wrapper info={info} hideToggle={true}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {options.map((opt) => {
                            const isChecked = currentSelection.includes(opt);
                            return (
                                <div key={opt} className={"flex items-center space-x-3 p-3 h-[60px] rounded-lg border transition-colors cursor-pointer select-none shadow-sm " + (isChecked ? "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20" : "border-border/80 bg-card/50 hover:border-border/80 hover:bg-card")} onClick={() => handleCheckboxChange(opt, !isChecked)}>
                                    <Checkbox id={`checkbox-${opt}`} checked={isChecked} onCheckedChange={(val: boolean | string) => handleCheckboxChange(opt, !!val)} className="pointer-events-none" />
                                    <div className="flex flex-col flex-1 pointer-events-none">
                                        <Label htmlFor={`checkbox-${opt}`} className="text-sm font-medium text-foreground">{opt}</Label>
                                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Hide {opt.toLowerCase()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Wrapper>
            );
        }

        return <Wrapper isPrimitive info={info} />;
    }

    if (typeof data === "string") {
        return (
            <Wrapper isPrimitive>
                {/* Attempt to detect colors for specialized input */}
                {data.startsWith("#") && data.length === 7 ? (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg border border-border/50 shrink-0 shadow-inner ring-1 ring-black/20"
                            style={{ backgroundColor: data }}
                        />
                        <Input
                            type="text"
                            value={data}
                            onChange={handleStringChange}
                            className="bg-background/50 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 font-mono text-foreground transition-colors shadow-inner"
                        />
                    </div>
                ) : (
                    <Input
                        type="text"
                        value={data}
                        onChange={handleStringChange}
                        className="bg-background/50 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground transition-colors shadow-inner w-full"
                    />
                )}
            </Wrapper>
        );
    }

    // Number rendering
    if (typeof data === "number") {
        return (
            <Wrapper isPrimitive>
                <Input
                    type="number"
                    value={data}
                    onChange={handleNumberChange}
                    className="bg-background/50 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 font-mono text-foreground w-full max-w-[200px] transition-colors shadow-inner"
                />
            </Wrapper>
        );
    }

    // Boolean rendering
    if (typeof data === "boolean" && !UNIFIED_KEYS.includes(currentKey)) {
        return (
            <Wrapper isPrimitive>
                <div className="flex flex-row items-center justify-between rounded-xl border border-border/80 p-4 bg-background/40 shadow-inner">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">Value</Label>
                        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                            {data ? "True" : "False"}
                        </p>
                    </div>
                    <Switch
                        checked={data}
                        onCheckedChange={handleBooleanChange}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-accent transition-colors shadow-sm"
                    />
                </div>
            </Wrapper>
        );
    }

    // Array rendering
    if (Array.isArray(data)) {
        return (
            <Wrapper>
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
                                            className="bg-background/50 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 text-sm h-10 w-full transition-colors shadow-inner"
                                        />
                                        {(typeof item === 'string' && currentValues.custom_catalog_names?.[item]) && (
                                            <p className="text-[10px] text-blue-400 mt-1.5 ml-1 px-2 py-0.5 rounded-sm bg-blue-950/30 border-l-2 border-blue-500 inline-block">
                                                Label: <span className="font-semibold">{resolveCatalogName(item, currentValues.custom_catalog_names)}</span>
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem(idx)} className="h-10 w-10 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        } else {
                            return (
                                <div key={idx} className="border border-border/80 rounded-xl p-4 bg-background/40 relative group shadow-sm transition-all hover:border-border/80">
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem(idx)} className="absolute top-3 right-3 h-8 w-8 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Item <span className="text-foreground">{idx}</span></span>
                                    <GenericRenderer data={item} path={[...path, String(idx)]} searchQuery={searchQuery} />
                                </div>
                            );
                        }
                    })}

                    <Button variant="outline" size="sm" onClick={addArrayItem} className="w-full border-border border-dashed bg-background/30 text-muted-foreground hover:text-foreground hover:bg-card hover:border-border mt-3 h-10 transition-all rounded-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </Wrapper>
        );
    }

    // Object rendering
    if (typeof data === "object") {
        // Do not use a wrapper if it's the root to avoid double boxing
        if (!currentKey) {
            return (
                <div className="space-y-4">
                    {Object.entries(data).map(([key, val]) => (
                        <GenericRenderer key={key} data={val} path={[...path, key]} searchQuery={searchQuery} />
                    ))}
                </div>
            );
        }

        return (
            <Wrapper>
                <Accordion type="single" collapsible className="w-full overflow-hidden border border-border/80 rounded-xl bg-background/40 shadow-sm transition-all hover:border-border/80">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-card/50 text-sm font-medium text-foreground transition-colors">
                            <span className="flex items-center gap-3">
                                View Object Details
                                <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                    {Object.keys(data).length} keys
                                </span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="p-5 border-t border-border/50 space-y-5 bg-background/20">
                            {Object.entries(data).map(([key, val]) => (
                                <GenericRenderer key={key} data={val} path={[...path, key]} searchQuery={searchQuery} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Wrapper>
        );
    }

    return (
        <div className="text-red-500 text-xs">Unsupported type for {pathString}</div>
    );
}

"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Switch } from "@/components/ui/switch";
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
        "custom_catalog_names": "Custom Catalog Names"
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

    if (data === null || data === undefined) {
        return null; // Skip rendering nulls, or render a baseline
    }

    // Header/Wrapper for the field
    const Wrapper = ({ children, isPrimitive = false }: { children: React.ReactNode, isPrimitive?: boolean }) => {
        if (!currentKey) return <>{children}</>; // Root level bypass

        return (
            <div className={`p-4 rounded-lg bg-neutral-900 border border-neutral-800 transition-opacity ${isDisabled ? "opacity-50" : "opacity-100"}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-200">
                            {formatKeyToTitle(currentKey)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${pathString}`} className="text-xs text-neutral-500 cursor-pointer">
                            {isDisabled ? "Disabled" : "Enabled"}
                        </Label>
                        <Switch
                            id={`toggle-${pathString}`}
                            checked={!isDisabled}
                            onCheckedChange={handleToggle}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </div>

                {!isDisabled && (
                    <div className={isPrimitive ? "" : "mt-4"}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Specialized rendering for languages
    if (currentKey === "preferred_audio_language" || currentKey === "preferred_subtitle_language") {
        return (
            <Wrapper isPrimitive>
                <div className="space-y-1">
                    <Select value={data} onValueChange={(val) => updateValue(path, val)}>
                        <SelectTrigger className="bg-neutral-950 border-neutral-800 text-neutral-200 h-10">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200 max-h-[200px]">
                            {Object.entries(ISO_639_2_LANGUAGES)
                                .sort((a, b) => a[1].localeCompare(b[1]))
                                .map(([code, name]) => (
                                    <SelectItem key={code} value={code} className="focus:bg-neutral-800 focus:text-white">
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
                            className="h-9 bg-neutral-950 border-neutral-800 text-xs pl-8 placeholder:text-neutral-600"
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredEntries.map(([id, name]) => {
                            const isInUse = usedCatalogIds.has(id);
                            return (
                                <div key={id} className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${isInUse ? 'border-blue-500/30 bg-blue-500/5' : 'border-neutral-800 bg-neutral-950/50 hover:bg-neutral-900/50'}`}>
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-neutral-200 truncate" title={name}>
                                                {name}
                                            </span>
                                            {isInUse && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight bg-blue-500/20 text-blue-400 border border-blue-500/20">
                                                    <Check className="w-2.5 h-2.5" /> In Use
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono text-neutral-500 truncate mt-0.5" title={id}>
                                            {id}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => updateValue([...path, id], undefined)}
                                        className={`h-8 w-8 shrink-0 transition-all ${isInUse ? 'text-neutral-600 opacity-20 hover:opacity-100 hover:text-red-400 hover:bg-neutral-800' : 'text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-neutral-800'}`}
                                        title={isInUse ? "This name is currently in use in a subgroup!" : "Delete custom name"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}

                        {entries.length === 0 && (
                            <div className="text-center py-6 border border-dashed border-neutral-800 rounded-lg bg-neutral-950/30">
                                <p className="text-xs text-neutral-500 italic">No custom catalog names defined</p>
                            </div>
                        )}
                        {entries.length > 0 && filteredEntries.length === 0 && (
                            <div className="text-center py-6 border border-dashed border-neutral-800 rounded-lg bg-neutral-950/30">
                                <p className="text-xs text-neutral-500 italic">No matches found for "{catSearch}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        );
    }

    // Specialized rendering for MDBList Rating
    if (currentKey === "mdblist_enabled_ratings") {
        return (
            <Wrapper isPrimitive>
                <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p>This requires an MDBList API key to be set in Omni.</p>
                </div>
            </Wrapper>
        );
    }

    // Specialized rendering for simple boolean toggles (merged)
    if (currentKey === "hide_spoilers" || currentKey === "small_continue_watching_shelf" || currentKey === "hide_external_playback_prompt") {
        return (
            <Wrapper isPrimitive>
                {currentKey === "hide_external_playback_prompt" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>Disable only if you use the internal player or Trakt tracking.</p>
                    </div>
                )}
                {currentKey === "hide_spoilers" && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p>This blurs thumbnails and descriptions for new episodes of series.</p>
                    </div>
                )}
            </Wrapper>
        );
    }

    if (typeof data === "string") {
        return (
            <Wrapper isPrimitive>
                {/* Attempt to detect colors for specialized input */}
                {data.startsWith("#") && data.length === 7 ? (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-md border border-neutral-700 shrink-0 shadow-inner"
                            style={{ backgroundColor: data }}
                        />
                        <Input
                            type="text"
                            value={data}
                            onChange={handleStringChange}
                            className="bg-neutral-950 border-neutral-800 font-mono text-neutral-200"
                        />
                    </div>
                ) : (
                    <Input
                        type="text"
                        value={data}
                        onChange={handleStringChange}
                        className="bg-neutral-950 border-neutral-800 text-neutral-200"
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
                    className="bg-neutral-950 border-neutral-800 font-mono text-neutral-200 w-full max-w-xs"
                />
            </Wrapper>
        );
    }

    // Boolean rendering
    if (typeof data === "boolean") {
        return (
            <Wrapper isPrimitive>
                <div className="flex flex-row items-center justify-between rounded-lg border border-neutral-800 p-3 bg-neutral-950">
                    <div className="space-y-0.5">
                        <Label className="text-sm">Value</Label>
                        <p className="text-xs text-neutral-500 text-muted-foreground">
                            {data ? "True" : "False"}
                        </p>
                    </div>
                    <Switch
                        checked={data}
                        onCheckedChange={handleBooleanChange}
                        className="data-[state=checked]:bg-green-600"
                    />
                </div>
            </Wrapper>
        );
    }

    // Array rendering
    if (Array.isArray(data)) {
        return (
            <Wrapper>
                <div className="space-y-2">
                    {data.map((item, idx) => {
                        // Check if it's a primitive array (e.g. strings)
                        if (typeof item === "string" || typeof item === "number") {
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayStringChange(idx, e.target.value)}
                                            className="bg-neutral-950 border-neutral-800 text-sm h-9 w-full"
                                        />
                                        {(typeof item === 'string' && currentValues.custom_catalog_names?.[item]) && (
                                            <p className="text-[10px] text-blue-400 mt-1 ml-1 px-1 border-l border-blue-900/50">
                                                Label: {resolveCatalogName(item, currentValues.custom_catalog_names)}
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem(idx)} className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-400/10 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        } else {
                            return (
                                <div key={idx} className="border border-neutral-800 rounded-md p-3 bg-neutral-950 relative group">
                                    <Button variant="ghost" size="icon" onClick={() => removeArrayItem(idx)} className="absolute top-2 right-2 h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs text-neutral-500 mb-2 block">Item [{idx}]</span>
                                    <GenericRenderer data={item} path={[...path, String(idx)]} searchQuery={searchQuery} />
                                </div>
                            );
                        }
                    })}

                    <Button variant="outline" size="sm" onClick={addArrayItem} className="w-full border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 border-dashed mt-2">
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
                <Accordion type="single" collapsible className="w-full border border-neutral-800 rounded-md bg-neutral-950">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-neutral-800/50 rounded-md text-sm text-neutral-300">
                            <span className="flex items-center gap-2">
                                View Object Details <span className="text-xs text-neutral-500 font-mono">({Object.keys(data).length} keys)</span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t border-neutral-800 space-y-4">
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

"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Type, Image as ImageIcon, CheckCircle, Palette, Hexagon, Maximize, WandSparkles, ChevronRight, Pencil, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PATTERN_DICTS = [
    { key: "regex_pattern_custom_names", label: "Custom Name", type: "string", icon: <Type className="w-4 h-4 text-neutral-500" /> },
    { key: "pattern_tag_enabled_patterns", label: "Tag Enabled", type: "boolean", icon: <CheckCircle className="w-4 h-4 text-neutral-500" /> },
    { key: "regex_pattern_image_urls", label: "Image URL", type: "string", icon: <ImageIcon className="w-4 h-4 text-neutral-500" /> },
    { key: "pattern_image_color_indices", label: "Image Color", type: "imageColor", icon: <Palette className="w-4 h-4 text-neutral-500" /> },
    { key: "pattern_border_radius_indices", label: "Corner Radius", type: "borderRadius", icon: <Maximize className="w-4 h-4 text-neutral-500" /> },
    { key: "pattern_color_hex_values", label: "Color Hex", type: "color", icon: <Hexagon className="w-4 h-4 text-neutral-500" /> },
];

// Image color index → label mapping (Omni uses 1=Black, 2=White, 3=Color)
const IMAGE_COLOR_OPTIONS = [
    { value: 1, label: "Black" },
    { value: 2, label: "White" },
    { value: 3, label: "Color" },
];

// Corner radius: Omni stores an index, displayed px = index × 2
// Observed: index 3 = 6px, 4 = 8px, 6 = 12px → all fit index * 2
const BORDER_RADIUS_OPTIONS = Array.from({ length: 13 }, (_, i) => ({ index: i, px: i * 2 }));

function PatternNode({ regex, onDelete, onRename }: { regex: string, onDelete: (r: string) => void, onRename: (oldRegex: string, newRegex: string) => void }) {
    const { currentValues, updateValue, originalConfig } = useConfig();
    const [editingRegex, setEditingRegex] = useState(false);
    const [regexDraft, setRegexDraft] = useState(regex);

    const customName = currentValues["regex_pattern_custom_names"]?.[regex];
    const imageUrl = currentValues["regex_pattern_image_urls"]?.[regex];

    const isTagEnabled = Array.isArray(currentValues["pattern_tag_enabled_patterns"])
        ? currentValues["pattern_tag_enabled_patterns"].includes(regex)
        : false;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(regex);
    };

    const handleStartEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRegexDraft(regex);
        setEditingRegex(true);
    };

    const handleConfirmEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const trimmed = regexDraft.trim();
        if (trimmed && trimmed !== regex) {
            onRename(regex, trimmed);
        }
        setEditingRegex(false);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRegexDraft(regex);
        setEditingRegex(false);
    };

    return (
        <AccordionItem
            value={regex}
            className={`border-neutral-800 bg-neutral-900 rounded-lg overflow-hidden mb-4 border relative group transition-all
                ${!isTagEnabled ? "opacity-60 grayscale bg-neutral-900/40" : ""}`}
        >
            <div className={`flex items-center transition-colors ${!isTagEnabled ? "bg-neutral-950/20" : "bg-neutral-900 hover:bg-neutral-800/50"} [&>h3]:flex-1`}>
                <AccordionTrigger className="px-4 py-3 flex-1 hover:no-underline flex items-center justify-between [&>svg]:hidden">
                    <div className="flex items-center gap-3">
                        <ChevronRight className="w-4 h-4 shrink-0 text-neutral-500 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        <span className={`font-semibold transition-colors text-left ${!isTagEnabled ? "text-neutral-500" : "text-neutral-200"}`}>
                            {customName || <span className={`font-mono text-sm inline-block break-all ${!isTagEnabled ? "text-neutral-600" : "text-blue-400"}`}>{regex}</span>}
                        </span>
                    </div>
                </AccordionTrigger>
                <div className="pr-4 flex items-center gap-4">
                    {imageUrl && (
                        <div className={`h-6 shrink-0 overflow-hidden rounded border border-neutral-700 bg-neutral-950 flex items-center justify-center transition-opacity ${!isTagEnabled ? "opacity-30" : ""}`}>
                            <img src={imageUrl} alt={customName || regex} className="h-full w-auto object-contain max-w-[160px]" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteClick}
                        className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                        title="Delete Pattern"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <AccordionContent className="p-4 pt-2 border-t border-neutral-800 bg-neutral-950">
                {/* Regex Editor */}
                <div className="mb-4">
                    <Label className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 block">Pattern Regex</Label>
                    {editingRegex ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={regexDraft}
                                onChange={(e) => setRegexDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmEdit(e as any);
                                    if (e.key === 'Escape') handleCancelEdit(e as any);
                                }}
                                autoFocus
                                className="h-8 text-xs font-mono bg-neutral-900 border-blue-500/50 text-blue-300 flex-1"
                            />
                            <Button size="icon" variant="ghost" onClick={handleConfirmEdit} className="h-8 w-8 text-green-400 hover:bg-green-400/10">
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 text-neutral-400 hover:bg-neutral-800">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-2 rounded border border-neutral-800 bg-neutral-900/50 group/regex">
                            <code className="text-xs font-mono text-blue-400 flex-1 break-all">{regex}</code>
                            <Button size="icon" variant="ghost" onClick={handleStartEdit} className="h-7 w-7 text-neutral-600 hover:text-blue-400 hover:bg-neutral-800 opacity-0 group-hover/regex:opacity-100 transition-opacity shrink-0">
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PATTERN_DICTS.map((dictDef) => {
                        const dict = currentValues[dictDef.key];
                        const origVal = originalConfig?.values?.[dictDef.key];
                        const isArrayDict = Array.isArray(dict) || Array.isArray(origVal);

                        let val: any = undefined;
                        if (isArrayDict) {
                            val = Array.isArray(dict) ? dict.includes(regex) : false;
                        } else if (dict && typeof dict === "object") {
                            val = dict[regex];
                        }

                        // Infer original type if it doesn't currently exist
                        let inferredType = dictDef.type;
                        if (isArrayDict) {
                            inferredType = "boolean";
                        } else if (val === undefined) {
                            const origValItem = origVal?.[regex];
                            if (typeof origValItem === "boolean") inferredType = "boolean";
                            else if (typeof origValItem === "number") inferredType = "number";
                        } else {
                            if (typeof val === "boolean") inferredType = "boolean";
                            else if (typeof val === "number") inferredType = "number";
                        }

                        // Determine default empty value for uncontrolled components
                        const defaultVal = inferredType === "boolean" ? false : inferredType === "number" ? "" : "";
                        const displayVal = val !== undefined ? val : defaultVal;

                        const handleChange = (newVal: any) => {
                            if (isArrayDict) {
                                const currentArr = Array.isArray(dict) ? dict : [];
                                if (newVal) {
                                    if (!currentArr.includes(regex)) updateValue([dictDef.key], [...currentArr, regex]);
                                } else {
                                    updateValue([dictDef.key], currentArr.filter((r: string) => r !== regex));
                                }
                            } else {
                                if (newVal === "") {
                                    updateValue([dictDef.key, regex], undefined);
                                } else {
                                    updateValue([dictDef.key, regex], newVal);
                                }
                            }
                        };

                        return (
                            <div key={dictDef.key} className="flex flex-col gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-md">
                                <Label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
                                    {dictDef.icon}
                                    {dictDef.label}
                                </Label>

                                {inferredType === "boolean" ? (
                                    <Switch
                                        checked={!!displayVal}
                                        onCheckedChange={(c) => updateValue([dictDef.key, regex], c)}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                ) : dictDef.type === "imageColor" ? (
                                    <Select
                                        value={displayVal !== "" ? String(displayVal) : ""}
                                        onValueChange={(v) => handleChange(Number(v))}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-neutral-950 border-neutral-700 w-full">
                                            <SelectValue placeholder="Select color..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                                            {IMAGE_COLOR_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : dictDef.type === "borderRadius" ? (
                                    <Select
                                        value={displayVal !== "" ? String(displayVal) : ""}
                                        onValueChange={(v) => handleChange(Number(v))}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-neutral-950 border-neutral-700 w-full">
                                            <SelectValue placeholder="Select radius..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                                            {BORDER_RADIUS_OPTIONS.map(r => (
                                                <SelectItem key={r.index} value={String(r.index)} className="text-xs">
                                                    {r.px}px
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : inferredType === "number" ? (
                                    <Input
                                        type="number"
                                        value={displayVal}
                                        onChange={(e) => handleChange(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="h-8 text-xs bg-neutral-950 border-neutral-700"
                                    />
                                ) : inferredType === "color" ? (
                                    <div className="flex gap-2">
                                        <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden border border-neutral-700 bg-neutral-950">
                                            <input
                                                type="color"
                                                value={displayVal || "#000000"}
                                                onChange={(e) => handleChange(e.target.value)}
                                                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            type="text"
                                            value={displayVal}
                                            onChange={(e) => handleChange(e.target.value)}
                                            placeholder="#FFFFFF"
                                            className="h-8 text-xs font-mono bg-neutral-950 border-neutral-700 uppercase"
                                        />
                                    </div>
                                ) : (
                                    <Input
                                        type="text"
                                        value={displayVal}
                                        onChange={(e) => handleChange(e.target.value)}
                                        placeholder={`Enter ${dictDef.label}...`}
                                        className="h-8 text-xs bg-neutral-950 border-neutral-700"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export function UnifiedPatternEditor() {
    const { currentValues, updateValue } = useConfig();
    const [newPattern, setNewPattern] = useState("");

    // Gather all unique regex strings from all dicts
    const allRegexSet = new Set<string>();
    PATTERN_DICTS.forEach(d => {
        const dict = currentValues[d.key];
        if (Array.isArray(dict)) {
            dict.forEach((k: string) => allRegexSet.add(k));
        } else if (dict && typeof dict === "object") {
            Object.keys(dict).forEach(k => allRegexSet.add(k));
        }
    });

    // Also include from auto_play_patterns (for ordering)
    const autoPlayOrder: string[] = Array.isArray(currentValues["auto_play_patterns"])
        ? currentValues["auto_play_patterns"]
        : [];

    // Sort: first those in auto_play_patterns (in order), then the rest alphabetically
    const orderedKeys = [
        ...autoPlayOrder.filter(k => allRegexSet.has(k)),
        ...Array.from(allRegexSet).filter(k => !autoPlayOrder.includes(k)).sort()
    ];

    const handleAddPattern = () => {
        const p = newPattern.trim();
        if (!p || allRegexSet.has(p)) return;

        // Initialize with just the string key to make it visible
        updateValue(["regex_pattern_custom_names", p], "New Pattern");
        setNewPattern("");
    };

    const handleDeletePattern = (regex: string) => {
        if (confirm(`Are you sure you want to delete all settings for pattern "${regex}"?`)) {
            PATTERN_DICTS.forEach(d => {
                const dict = currentValues[d.key];
                if (Array.isArray(dict)) {
                    if (dict.includes(regex)) {
                        updateValue([d.key], dict.filter((r: string) => r !== regex));
                    }
                } else if (dict && typeof dict === "object" && dict[regex] !== undefined) {
                    updateValue([d.key, regex], undefined);
                }
            });
        }
    };

    const handleRenamePattern = (oldRegex: string, newRegex: string) => {
        if (!newRegex || newRegex === oldRegex) return;
        PATTERN_DICTS.forEach(d => {
            const dict = currentValues[d.key];
            if (Array.isArray(dict)) {
                // Array dicts: replace item in list
                if (dict.includes(oldRegex)) {
                    updateValue([d.key], dict.map((r: string) => r === oldRegex ? newRegex : r));
                }
            } else if (dict && typeof dict === "object") {
                if (dict[oldRegex] !== undefined) {
                    // Copy value to new key, remove old key
                    updateValue([d.key, newRegex], dict[oldRegex]);
                    updateValue([d.key, oldRegex], undefined);
                }
            }
        });
        // Also rename in auto_play_patterns order array
        const autoPlay = currentValues["auto_play_patterns"];
        if (Array.isArray(autoPlay) && autoPlay.includes(oldRegex)) {
            updateValue(["auto_play_patterns"], autoPlay.map((r: string) => r === oldRegex ? newRegex : r));
        }
        const autoPlayEnabled = currentValues["auto_play_enabled_patterns"];
        if (Array.isArray(autoPlayEnabled) && autoPlayEnabled.includes(oldRegex)) {
            updateValue(["auto_play_enabled_patterns"], autoPlayEnabled.map((r: string) => r === oldRegex ? newRegex : r));
        }
    };

    if (orderedKeys.length === 0) {
        return (
            <div className="p-4 text-sm text-neutral-400 italic">No Patterns found. Add one to begin.</div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="patterns-root" className="border-neutral-800 bg-neutral-900 rounded-lg overflow-hidden border">
                <AccordionTrigger className="px-4 py-3 hover:bg-neutral-800/50 hover:no-underline font-semibold text-neutral-200">
                    Click to Manage Pattern & Regex Settings
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-4 border-t border-neutral-800 bg-neutral-950">
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-6 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                            <Input
                                value={newPattern}
                                onChange={e => setNewPattern(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddPattern()}
                                placeholder="Enter new Regex string (e.g. (?i)uhd|4k)"
                                className="h-9 text-sm font-mono bg-neutral-950 border-neutral-700"
                            />
                            <Button onClick={handleAddPattern} className="h-9 bg-blue-600 hover:bg-blue-700 shrink-0">
                                <Plus className="w-4 h-4 mr-2" /> Add Pattern
                            </Button>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {orderedKeys.map((regex: string) => (
                                <PatternNode key={regex} regex={regex} onDelete={handleDeletePattern} onRename={handleRenamePattern} />
                            ))}
                        </Accordion>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

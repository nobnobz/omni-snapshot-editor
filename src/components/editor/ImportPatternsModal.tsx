"use client";

import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { UploadCloud, AlertTriangle, FileJson, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { decodeConfig } from "@/lib/config-utils";
import { Badge } from "@/components/ui/badge";

interface ImportPatternsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Dict-type keys: { "regex_pattern": value }
const DICT_KEYS = [
    "regex_pattern_custom_names",
    "regex_pattern_image_urls",
    "pattern_image_color_indices",
    "pattern_border_radius_indices",
    "pattern_background_opacities",
    "pattern_border_thickness_indices",
    "pattern_color_indices",
    "pattern_color_hex_values",
];

// Array-type keys: ["regex_pattern", ...]
const ARRAY_KEYS = [
    "pattern_tag_enabled_patterns",
    "pattern_default_filter_enabled_patterns",
    "auto_play_enabled_patterns",
    "auto_play_patterns",
];

const ALL_PATTERN_KEYS = [...DICT_KEYS, ...ARRAY_KEYS];

interface ParsedPattern {
    regex: string;
    customName: string;
    presentInKeys: string[];
    existsInCurrent: boolean;
    hasChanges: boolean;
}

export function ImportPatternsModal({ isOpen, onClose }: ImportPatternsModalProps) {
    const { currentValues, updateValue } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const templates = [
        {
            label: "v1.7.1",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        },
    ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);
    const [templateLoading, setTemplateLoading] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    // Full parsed values from the imported file (only pattern keys)
    const [importedValues, setImportedValues] = useState<Record<string, any>>({});
    // List of individual patterns found
    const [parsedPatterns, setParsedPatterns] = useState<ParsedPattern[]>([]);
    // Selected pattern regexes to import
    const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());

    const resetState = () => {
        setStep(1);
        setFileName("");
        setError("");
        setSearchFilter("");
        setImportedValues({});
        setParsedPatterns([]);
        setSelectedPatterns(new Set());
        setTemplateLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // Check if a pattern's imported data differs from its current data
    const checkPatternHasChanges = (regex: string, extracted: Record<string, any>): boolean => {
        for (const key of DICT_KEYS) {
            const importedVal = extracted[key]?.[regex];
            const currentVal = currentValues[key]?.[regex];
            if (importedVal !== undefined && JSON.stringify(importedVal) !== JSON.stringify(currentVal)) return true;
        }
        for (const key of ARRAY_KEYS) {
            const inImported = Array.isArray(extracted[key]) && extracted[key].includes(regex);
            const inCurrent = Array.isArray(currentValues[key]) && currentValues[key].includes(regex);
            if (inImported !== inCurrent) return true;
        }
        return false;
    };

    const processUploadedJson = (jsonString: string) => {
        try {
            const rawData = JSON.parse(jsonString);
            let decoded: Record<string, any> = {};

            if (rawData.values) {
                for (const [key, val] of Object.entries(rawData.values)) {
                    decoded[key] = decodeConfig(val as any);
                }
            } else if (rawData.config) {
                for (const [key, val] of Object.entries(rawData.config)) {
                    decoded[key] = decodeConfig(val as any);
                }
            } else {
                decoded = rawData;
            }

            // Extract only pattern-related keys
            const extracted: Record<string, any> = {};
            for (const key of ALL_PATTERN_KEYS) {
                if (decoded[key] !== undefined) {
                    extracted[key] = decoded[key];
                }
            }

            // Collect all unique regex patterns from the imported data
            const allRegexSet = new Set<string>();
            for (const key of DICT_KEYS) {
                const dict = extracted[key];
                if (dict && typeof dict === "object" && !Array.isArray(dict)) {
                    Object.keys(dict).forEach(k => allRegexSet.add(k));
                }
            }
            for (const key of ARRAY_KEYS) {
                const arr = extracted[key];
                if (Array.isArray(arr)) {
                    arr.forEach((k: string) => allRegexSet.add(k));
                }
            }

            if (allRegexSet.size === 0) {
                throw new Error("No pattern data found in this file.");
            }

            const customNames = extracted["regex_pattern_custom_names"] || {};

            // Build parsed pattern list with change detection
            const patterns: ParsedPattern[] = Array.from(allRegexSet).map(regex => {
                const presentInKeys: string[] = [];
                for (const key of DICT_KEYS) {
                    if (extracted[key]?.[regex] !== undefined) presentInKeys.push(key);
                }
                for (const key of ARRAY_KEYS) {
                    if (Array.isArray(extracted[key]) && extracted[key].includes(regex)) presentInKeys.push(key);
                }

                // Check if this regex exists anywhere in the current config
                let existsInCurrent = false;
                for (const key of DICT_KEYS) {
                    if (currentValues[key]?.[regex] !== undefined) { existsInCurrent = true; break; }
                }
                if (!existsInCurrent) {
                    for (const key of ARRAY_KEYS) {
                        if (Array.isArray(currentValues[key]) && currentValues[key].includes(regex)) { existsInCurrent = true; break; }
                    }
                }

                const hasChanges = !existsInCurrent || checkPatternHasChanges(regex, extracted);

                return {
                    regex,
                    customName: customNames[regex] || regex,
                    presentInKeys,
                    existsInCurrent,
                    hasChanges,
                };
            });

            // Sort: new first, then existing with changes, then unchanged at bottom
            const sortWeight = (p: ParsedPattern) => {
                if (!p.existsInCurrent) return 0; // new
                if (p.hasChanges) return 1;        // has updates
                return 2;                          // no changes
            };
            patterns.sort((a, b) => {
                const wa = sortWeight(a), wb = sortWeight(b);
                if (wa !== wb) return wa - wb;
                return a.customName.localeCompare(b.customName);
            });

            setImportedValues(extracted);
            setParsedPatterns(patterns);

            // Pre-select all patterns that have changes (new + updated)
            const preSelected = new Set(patterns.filter(p => p.hasChanges).map(p => p.regex));
            setSelectedPatterns(preSelected);

            setStep(2);
            setError("");
        } catch (err: any) {
            console.error("Parse error:", err);
            setError(err.message || "Failed to parse JSON file.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            processUploadedJson(content);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        // For each selected pattern, merge its data into the current config
        for (const key of DICT_KEYS) {
            const importedDict = importedValues[key];
            if (!importedDict || typeof importedDict !== "object") continue;

            const currentDict = { ...(currentValues[key] || {}) };
            let changed = false;
            for (const regex of selectedPatterns) {
                if (importedDict[regex] !== undefined) {
                    currentDict[regex] = importedDict[regex];
                    changed = true;
                }
            }
            if (changed) {
                updateValue([key], currentDict);
            }
        }

        for (const key of ARRAY_KEYS) {
            const importedArr = importedValues[key];
            if (!Array.isArray(importedArr)) continue;

            const currentArr: string[] = Array.isArray(currentValues[key]) ? [...currentValues[key]] : [];
            let changed = false;
            for (const regex of selectedPatterns) {
                if (importedArr.includes(regex) && !currentArr.includes(regex)) {
                    currentArr.push(regex);
                    changed = true;
                }
            }
            if (changed) {
                updateValue([key], currentArr);
            }
        }

        handleClose();
    };

    const togglePattern = (regex: string) => {
        // Don't allow toggling unchanged patterns
        const pattern = parsedPatterns.find(p => p.regex === regex);
        if (pattern && !pattern.hasChanges) return;
        const next = new Set(selectedPatterns);
        if (next.has(regex)) {
            next.delete(regex);
        } else {
            next.add(regex);
        }
        setSelectedPatterns(next);
    };

    const selectAllNew = () => {
        setSelectedPatterns(new Set(parsedPatterns.filter(p => !p.existsInCurrent).map(p => p.regex)));
    };
    const selectAllChanged = () => {
        setSelectedPatterns(new Set(parsedPatterns.filter(p => p.hasChanges).map(p => p.regex)));
    };
    const deselectAll = () => setSelectedPatterns(new Set());

    const filteredPatterns = searchFilter.trim()
        ? parsedPatterns.filter(p =>
            p.customName.toLowerCase().includes(searchFilter.toLowerCase()) ||
            p.regex.toLowerCase().includes(searchFilter.toLowerCase())
        )
        : parsedPatterns;

    const newPatterns = filteredPatterns.filter(p => !p.existsInCurrent);
    const updatedPatterns = filteredPatterns.filter(p => p.existsInCurrent && p.hasChanges);
    const unchangedPatterns = filteredPatterns.filter(p => p.existsInCurrent && !p.hasChanges);

    const renderPatternRow = (p: ParsedPattern) => {
        const isDisabled = !p.hasChanges;
        const isSelected = selectedPatterns.has(p.regex);
        const showRegex = p.customName !== p.regex;

        return (
            <div
                key={p.regex}
                className={`flex items-start gap-3 p-3 px-4 transition-colors border-b border-border/50 cursor-pointer w-full overflow-hidden ${isDisabled ? 'opacity-40 !cursor-not-allowed bg-muted/40' :
                    isSelected ? (p.existsInCurrent ? 'bg-amber-500/10' : 'bg-blue-500/10') :
                        'hover:bg-muted/50'
                    }`}
                onClick={isDisabled ? undefined : () => togglePattern(p.regex)}
            >
                <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => togglePattern(p.regex)}
                    className="shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold line-clamp-1 break-all w-full leading-tight" title={p.customName}>
                        {p.customName}
                    </p>
                    {showRegex && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono line-clamp-1 break-all w-full leading-tight" title={p.regex}>
                            {p.regex}
                        </p>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                        {!p.existsInCurrent && (
                            <Badge variant="outline" className="bg-emerald-600/10 text-emerald-400 border-emerald-500/30 text-[9px] uppercase shrink-0">New</Badge>
                        )}
                        {p.existsInCurrent && p.hasChanges && (
                            <Badge variant="outline" className="bg-amber-600/10 text-amber-500 border-amber-500/30 text-[9px] uppercase shrink-0">Updated</Badge>
                        )}
                        {isDisabled && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[9px] uppercase shrink-0">No Changes</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground shrink-0">{p.presentInKeys.length} settings</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-lg bg-background border-border text-foreground overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Import Patterns & Regex</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 1 ? "Load a template or upload a config to import patterns." : `Select patterns to import from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4">
                        {/* Template Loader */}
                        <div className="p-5 border border-border rounded-lg bg-muted/50">
                            <h3 className="font-semibold text-sm text-foreground mb-3">Load from Template</h3>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                    className="flex-1 h-10 rounded-md border border-border bg-background/50 px-3 text-xs text-foreground font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {templates.map(t => (
                                        <option key={t.label} value={t.label}>{t.label}</option>
                                    ))}
                                </select>
                                <Button
                                    onClick={async () => {
                                        const t = templates.find(t => t.label === selectedVersion);
                                        if (!t) return;
                                        setTemplateLoading(true);
                                        setError("");
                                        try {
                                            const res = await fetch(t.url);
                                            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                                            const buffer = await res.arrayBuffer();
                                            const text = new TextDecoder("utf-8").decode(buffer);
                                            setFileName(`Template ${t.label}`);
                                            processUploadedJson(text);
                                        } catch (err: any) {
                                            setError(err.message || "Failed to load template.");
                                        } finally {
                                            setTemplateLoading(false);
                                        }
                                    }}
                                    disabled={templateLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5"
                                >
                                    {templateLoading ? "Loading..." : "Load"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border"></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or upload file</span>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center">
                            <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                            <h3 className="font-medium text-sm text-foreground mb-1">Upload configuration file</h3>
                            <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                                Select an <code>omni-config.json</code> to extract pattern data.
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-muted border-border hover:bg-muted/80 text-foreground text-xs font-semibold">
                                Select File
                            </Button>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-3 min-w-0 overflow-hidden flex flex-col">
                        <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded text-xs text-blue-300 leading-relaxed whitespace-normal break-words">
                            Select patterns by name. All settings for each selected pattern (name, image, colors, opacities, etc.) will be imported together.
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search patterns..."
                                className="pl-9 h-9 bg-background/50 border-border text-xs"
                            />
                        </div>

                        <div className="border border-border rounded-md bg-background overflow-hidden">
                            <div className="p-2 bg-muted/50 border-b border-border flex flex-wrap gap-2">
                                <Button variant="secondary" size="sm" onClick={selectAllChanged} className="h-7 text-xs bg-muted hover:bg-muted/80 text-foreground">Select All</Button>
                                <Button variant="secondary" size="sm" onClick={selectAllNew} className="h-7 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30">New Only</Button>
                                <Button variant="ghost" size="sm" onClick={deselectAll} className="h-7 text-xs text-muted-foreground hover:text-foreground">Deselect All</Button>
                            </div>

                            <ScrollArea className="h-[35vh]">
                                <div className="flex flex-col w-full overflow-hidden">
                                    {newPatterns.length > 0 && (
                                        <>
                                            <div className="p-2 bg-muted font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky top-0 z-10 border-b border-border">
                                                New ({newPatterns.length})
                                            </div>
                                            {newPatterns.map(renderPatternRow)}
                                        </>
                                    )}

                                    {updatedPatterns.length > 0 && (
                                        <>
                                            <div className="p-2 bg-muted font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky top-0 z-10 border-y border-border">
                                                Updates Available ({updatedPatterns.length})
                                            </div>
                                            {updatedPatterns.map(renderPatternRow)}
                                        </>
                                    )}

                                    {unchangedPatterns.length > 0 && (
                                        <>
                                            <div className="p-2 bg-muted font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky top-0 z-10 border-y border-border">
                                                No Changes ({unchangedPatterns.length})
                                            </div>
                                            {unchangedPatterns.map(renderPatternRow)}
                                        </>
                                    )}

                                    {filteredPatterns.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm italic">
                                            {searchFilter ? "No patterns match your search." : "No patterns found."}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleImport}
                            disabled={selectedPatterns.size === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            <FileJson className="w-4 h-4 mr-2" />
                            Import Selected ({selectedPatterns.size})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

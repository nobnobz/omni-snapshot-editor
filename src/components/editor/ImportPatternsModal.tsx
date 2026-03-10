"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImportPatternsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

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
    const { currentValues, updateValue, manifest, fetchManifest } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchManifest();
        }
    }, [isOpen]);

    const templates: { label: string; url: string }[] = [];
    if (manifest) {
        const omni = manifest.templates.find(t => t.id === 'ume-main');
        const aiometadata = manifest.templates.find(t => t.id === 'aiometadata');
        const aiostreams = manifest.templates.find(t => t.id === 'aiostreams');

        if (omni) templates.push({ label: omni.name, url: omni.url });
        if (aiometadata) templates.push({ label: aiometadata.name, url: aiometadata.url });
        if (aiostreams) templates.push({ label: aiostreams.name, url: aiostreams.url });
    }

    if (templates.length === 0) {
        templates.push({
            label: "UME Omni Template",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        });
    }

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);

    useEffect(() => {
        if (manifest && templates.length > 0) {
            setSelectedVersion(templates[0].label);
        }
    }, [manifest]);

    const [templateLoading, setTemplateLoading] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    const [importedValues, setImportedValues] = useState<Record<string, any>>({});
    const [parsedPatterns, setParsedPatterns] = useState<ParsedPattern[]>([]);
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

            const extracted: Record<string, any> = {};
            for (const key of ALL_PATTERN_KEYS) {
                if (decoded[key] !== undefined) {
                    extracted[key] = decoded[key];
                }
            }

            const allRegexes = new Set<string>();
            for (const key of DICT_KEYS) {
                if (extracted[key] && typeof extracted[key] === 'object') {
                    Object.keys(extracted[key]).forEach(r => allRegexes.add(r));
                }
            }
            for (const key of ARRAY_KEYS) {
                if (Array.isArray(extracted[key])) {
                    extracted[key].forEach((r: string) => allRegexes.add(r));
                }
            }

            const finalParsed: ParsedPattern[] = Array.from(allRegexes).map(regex => {
                const presentIn: string[] = [];
                ALL_PATTERN_KEYS.forEach(k => {
                    if (DICT_KEYS.includes(k)) {
                        if (extracted[k]?.[regex] !== undefined) presentIn.push(k);
                    } else {
                        if (Array.isArray(extracted[k]) && extracted[k].includes(regex)) presentIn.push(k);
                    }
                });

                const customName = extracted["regex_pattern_custom_names"]?.[regex] || regex;
                const exists = ALL_PATTERN_KEYS.some(k => {
                    const currentVal = currentValues[k];
                    if (DICT_KEYS.includes(k)) {
                        return currentVal && typeof currentVal === 'object' && currentVal[regex] !== undefined;
                    } else {
                        return Array.isArray(currentVal) && currentVal.includes(regex);
                    }
                });

                return {
                    regex,
                    customName,
                    presentInKeys: presentIn,
                    existsInCurrent: exists,
                    hasChanges: checkPatternHasChanges(regex, extracted)
                };
            });

            setImportedValues(extracted);
            setParsedPatterns(finalParsed);
            setStep(2);
        } catch (e: any) {
            setError("Invalid JSON format or corrupted file.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => processUploadedJson(ev.target?.result as string);
        reader.readAsText(file);
    };

    const handleImport = () => {
        selectedPatterns.forEach(regex => {
            for (const key of DICT_KEYS) {
                const val = importedValues[key]?.[regex];
                if (val !== undefined) {
                    updateValue([key, regex], val);
                }
            }
            for (const key of ARRAY_KEYS) {
                if (Array.isArray(importedValues[key]) && importedValues[key].includes(regex)) {
                    const currentArray = Array.isArray(currentValues[key]) ? [...currentValues[key]] : [];
                    if (!currentArray.includes(regex)) {
                        updateValue([key], [...currentArray, regex]);
                    }
                }
            }
        });
        handleClose();
    };

    const filteredPatterns = parsedPatterns.filter(p =>
        p.regex.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.customName.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const newPatterns = filteredPatterns.filter(p => !p.existsInCurrent);
    const updatedPatterns = filteredPatterns.filter(p => p.existsInCurrent && p.hasChanges);
    const unchangedPatterns = filteredPatterns.filter(p => p.existsInCurrent && !p.hasChanges);

    const selectAllChanged = () => setSelectedPatterns(new Set([...newPatterns, ...updatedPatterns].map(p => p.regex)));
    const selectAllNew = () => setSelectedPatterns(new Set(newPatterns.map(p => p.regex)));
    const deselectAll = () => setSelectedPatterns(new Set());

    const renderPatternRow = (p: ParsedPattern) => {
        const isSynced = p.existsInCurrent && !p.hasChanges;
        const isUpdate = p.existsInCurrent && p.hasChanges;

        return (
            <div key={p.regex} className={`flex items-start gap-3 p-3 border-b border-border/40 transition-colors group/row ${isSynced ? 'opacity-40 bg-muted/5' : 'hover:bg-muted/30'}`}>
                <Checkbox
                    id={`pattern-${p.regex}`}
                    checked={selectedPatterns.has(p.regex)}
                    disabled={isSynced}
                    onCheckedChange={(checked) => {
                        const next = new Set(selectedPatterns);
                        if (checked) next.add(p.regex);
                        else next.delete(p.regex);
                        setSelectedPatterns(next);
                    }}
                    className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                    <label 
                        htmlFor={`pattern-${p.regex}`} 
                        className={`text-sm font-medium block truncate ${isSynced ? 'text-foreground/60 cursor-default' : 'text-foreground cursor-pointer'}`}
                    >
                        {p.customName}
                    </label>
                    <p
                        className={`text-[10px] font-mono mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap max-w-full ${isSynced ? 'text-foreground/30' : 'text-foreground/50'}`}
                        title={p.regex}
                    >
                        {p.regex}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap text-[9px]">
                        {p.existsInCurrent ? (
                            p.hasChanges ? (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-1.5 py-0">Update</Badge>
                            ) : (
                                <Badge variant="outline" className="bg-muted/50 text-foreground/40 border-border/50 px-1.5 py-0">Synced</Badge>
                            )
                        ) : (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-1.5 py-0">New</Badge>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-lg bg-background border-border text-foreground overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Import Patterns & Regex</DialogTitle>
                    <DialogDescription className="text-foreground/60">
                        {step === 1 ? "Load a template or upload a config to import patterns." : `Select patterns to import from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    {step === 1 ? (
                        <div className="space-y-6 pt-2 overflow-y-auto flex-1">
                            <div className="p-5 border border-border rounded-xl bg-card/50 space-y-4">
                                <h3 className="font-semibold text-sm text-foreground/90">Load from Template</h3>
                                <div className="flex flex-col gap-3">
                                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                                        <SelectTrigger className="w-full bg-background border-input text-xs font-mono">
                                            <SelectValue placeholder="Select version" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {templates.map(t => (
                                                <SelectItem key={t.label} value={t.label} className="text-xs font-mono cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={async () => {
                                            const t = templates.find(t => t.label === selectedVersion);
                                            if (!t) return;
                                            setTemplateLoading(true);
                                            setError("");
                                            try {
                                                const res = await fetch(t.url);
                                                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 transition-all"
                                    >
                                        {templateLoading ? "Loading..." : "Fetch Template"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border/40"></div>
                                <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">or upload manually</span>
                                <div className="flex-1 h-px bg-border/40"></div>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center cursor-pointer group"
                            >
                                <UploadCloud className="w-12 h-12 text-foreground/40 mb-3 group-hover:text-blue-500/70 transition-colors" />
                                <h3 className="font-semibold text-sm text-foreground/90 mb-1">Configuration File</h3>
                                <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                                    Extract pattern data from an existing <code>omni-config.json</code> file.
                                </p>
                                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col min-h-0 flex-1 gap-3 overflow-hidden">
                            {/* Search bar: always visible at the top */}
                            <div className="relative flex-shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                <Input
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Search patterns..."
                                    className="pl-9 h-10 bg-muted/20 border-border text-sm"
                                />
                            </div>

                            {/* Pattern list with pinned action bar */}
                            <div className="flex-1 flex flex-col min-h-0 border border-border rounded-xl bg-card/30 overflow-hidden">
                                {/* Action bar: always visible, never scrolls */}
                                <div className="flex-shrink-0 px-3 py-2 bg-card border-b border-border flex items-center justify-between sticky top-0 z-20">
                                    <div className="flex gap-1">
                                        <button onClick={selectAllChanged} className="text-[11px] font-semibold text-foreground/60 hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                                            Select All
                                        </button>
                                        <button onClick={selectAllNew} className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-500/10 transition-colors">
                                            New Only
                                        </button>
                                    </div>
                                    <button onClick={deselectAll} className="text-[11px] font-semibold text-foreground/40 hover:text-foreground/70 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                                        Clear
                                    </button>
                                </div>

                                {/* Scrollable pattern list */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    {newPatterns.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 bg-card text-[10px] font-bold text-foreground/50 uppercase tracking-widest border-b border-border/30 sticky top-0 z-10">
                                                New ({newPatterns.length})
                                            </div>
                                            {newPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {updatedPatterns.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 bg-card text-[10px] font-bold text-foreground/50 uppercase tracking-widest border-y border-border/30 sticky top-0 z-10">
                                                Updates ({updatedPatterns.length})
                                            </div>
                                            {updatedPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {unchangedPatterns.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 bg-card text-[10px] font-bold text-foreground/50 uppercase tracking-widest border-y border-border/30 sticky top-0 z-10">
                                                Synced ({unchangedPatterns.length})
                                            </div>
                                            {unchangedPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {filteredPatterns.length === 0 && (
                                        <div className="p-12 text-center text-foreground/40 text-sm italic">
                                            No matches found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <DialogFooter className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <Button variant="outline" onClick={handleClose} className="bg-muted/50 border-border text-foreground hover:bg-muted font-bold">
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleImport}
                            disabled={selectedPatterns.size === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                        >
                            Import Selected ({selectedPatterns.size})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

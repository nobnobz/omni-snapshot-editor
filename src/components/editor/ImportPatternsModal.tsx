"use client";

import React, { startTransition, useDeferredValue, useState, useRef, useEffect, useMemo } from "react";
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
import { UploadCloud, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { decodeConfig } from "@/lib/config-utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { editorAction, editorLayout, editorSurface, editorToneBadge } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";
import { FALLBACK_TEMPLATE_URLS, findTemplateByKind, isTemplateOfKind } from "@/lib/template-manifest";
import { fetchTextWithLimits } from "@/lib/remote-fetch";
import {
    applyImportedPatternsToState,
    buildImportedPatternMetadata,
    extractPatternImportValues,
    PATTERN_ARRAY_KEYS,
    PATTERN_DICT_KEYS,
    type PatternImportValues,
} from "@/lib/pattern-state";

interface ImportPatternsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DICT_KEYS = [...PATTERN_DICT_KEYS];
const ARRAY_KEYS = [...PATTERN_ARRAY_KEYS];
const ALL_PATTERN_KEYS = [...DICT_KEYS, ...ARRAY_KEYS];
const DICT_KEY_SET = new Set<string>(DICT_KEYS);

interface ParsedPattern {
    regex: string;
    customName: string;
    presentInKeys: string[];
    existsInCurrent: boolean;
    hasChanges: boolean;
    orderIndex: number;
    isActive: boolean;
}

const normalizeForCompare = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(normalizeForCompare);
    }
    if (value && typeof value === "object") {
        return Object.keys(value)
            .sort()
            .reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = normalizeForCompare((value as Record<string, unknown>)[key]);
                return acc;
            }, {});
    }
    return value;
};

const areEqual = (a: unknown, b: unknown): boolean =>
    JSON.stringify(normalizeForCompare(a)) === JSON.stringify(normalizeForCompare(b));

export function ImportPatternsModal({ isOpen, onClose }: ImportPatternsModalProps) {
    const { currentValues, updateValue, manifest, fetchManifest } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchManifest();
        }
    }, [isOpen, fetchManifest]);

    useEffect(() => {
        if (!isOpen) return;

        const preventNavigationOnDrop: EventListener = (event) => {
            const dragEvent = event as DragEvent;
            if (!dragEvent.dataTransfer) return;
            dragEvent.preventDefault();
            dragEvent.dataTransfer.dropEffect = "copy";
        };

        const targets: EventTarget[] = [window, document, document.documentElement, document.body];
        targets.forEach((target) => {
            target.addEventListener("dragenter", preventNavigationOnDrop, true);
            target.addEventListener("dragover", preventNavigationOnDrop, true);
            target.addEventListener("drop", preventNavigationOnDrop, true);
        });

        return () => {
            targets.forEach((target) => {
                target.removeEventListener("dragenter", preventNavigationOnDrop, true);
                target.removeEventListener("dragover", preventNavigationOnDrop, true);
                target.removeEventListener("drop", preventNavigationOnDrop, true);
            });
        };
    }, [isOpen]);

    const templates: { label: string; url: string }[] = useMemo(() => (
        manifest?.templates?.length
            ? manifest.templates
                .filter((template) => isTemplateOfKind(template, "omni") && !!template.url)
                .map((template) => ({ label: template.name, url: template.url }))
            : [
                {
                    label: "UME Omni Template v2.0.3",
                    url: FALLBACK_TEMPLATE_URLS.omni,
                },
            ]
    ), [manifest]);

    const [selectedVersion, setSelectedVersion] = useState("");

    useEffect(() => {
        if (templates.length === 0) {
            setSelectedVersion("");
            return;
        }

        const defaultTemplate = manifest?.templates?.find((template) => template.isDefault && isTemplateOfKind(template, "omni"))
            || findTemplateByKind(manifest?.templates, "omni");

        if (defaultTemplate?.name && defaultTemplate.url) {
            setSelectedVersion((current) => (current === defaultTemplate.name ? current : defaultTemplate.name));
            return;
        }

        setSelectedVersion((current) => (
            current && templates.some(template => template.label === current)
                ? current
                : templates[0]?.label ?? ""
        ));
    }, [manifest, templates]);

    const [templateLoading, setTemplateLoading] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const deferredSearchFilter = useDeferredValue(searchFilter);
    const [isFileDropActive, setIsFileDropActive] = useState(false);

    const [importedValues, setImportedValues] = useState<PatternImportValues>({});
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
        setIsFileDropActive(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const checkPatternHasChanges = (regex: string, extracted: PatternImportValues): boolean => {
        for (const key of DICT_KEYS) {
            const extractedDict = extracted[key];
            const importedVal = extractedDict && typeof extractedDict === "object"
                ? (extractedDict as Record<string, unknown>)[regex]
                : undefined;

            const currentDict = currentValues[key];
            const currentVal = currentDict && typeof currentDict === "object"
                ? (currentDict as Record<string, unknown>)[regex]
                : undefined;
            // Dict values are imported only when present for this regex.
            if (importedVal !== undefined && !areEqual(importedVal, currentVal)) return true;
        }
        for (const key of ARRAY_KEYS) {
            // Arrays are additive in handleImport (we only add when present in import),
            // so a "missing in import, present in current" state is not an import change.
            if (!Array.isArray(extracted[key])) continue;
            const inImported = Array.isArray(extracted[key]) && extracted[key].includes(regex);
            const inCurrent = Array.isArray(currentValues[key]) && currentValues[key].includes(regex);
            if (inImported && !inCurrent) return true;
        }
        return false;
    };

    const processUploadedJson = (jsonString: string) => {
        try {
            const rawData = JSON.parse(jsonString);
            let decoded: Record<string, unknown> = {};

            if (rawData.values) {
                for (const [key, val] of Object.entries(rawData.values)) {
                    decoded[key] = decodeConfig(val);
                }
            } else if (rawData.config) {
                for (const [key, val] of Object.entries(rawData.config)) {
                    decoded[key] = decodeConfig(val);
                }
            } else {
                decoded = rawData;
            }

            const extracted = extractPatternImportValues(decoded);
            const importedMetadata = buildImportedPatternMetadata(extracted);

            const finalParsed: ParsedPattern[] = importedMetadata.map(({ regex, orderIndex, presentInKeys, isActive }) => {
                const customNameDict = extracted["regex_pattern_custom_names"];
                const customName = customNameDict && typeof customNameDict === "object"
                    ? ((customNameDict as Record<string, unknown>)[regex] as string | undefined) || regex
                    : regex;
                const exists = ALL_PATTERN_KEYS.some(k => {
                    const currentVal = currentValues[k];
                    if (DICT_KEY_SET.has(k)) {
                        return currentVal && typeof currentVal === 'object' && currentVal[regex] !== undefined;
                    } else {
                        return Array.isArray(currentVal) && currentVal.includes(regex);
                    }
                });

                return {
                    regex,
                    customName,
                    presentInKeys,
                    existsInCurrent: exists,
                    hasChanges: checkPatternHasChanges(regex, extracted),
                    orderIndex,
                    isActive,
                };
            });

            setImportedValues(extracted);
            setParsedPatterns(finalParsed);
            setStep(2);
        } catch {
            setError("Invalid JSON format or corrupted file.");
        }
    };

    const processFile = (file: File | undefined) => {
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => processUploadedJson(ev.target?.result as string);
        reader.readAsText(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFile(e.target.files?.[0]);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDropActive(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const handleImport = () => {
        const orderedSelectedRegexes = parsedPatterns
            .filter((pattern) => selectedPatterns.has(pattern.regex))
            .map((pattern) => pattern.regex);

        const nextValues = applyImportedPatternsToState(currentValues, importedValues, orderedSelectedRegexes);
        updateValue([], nextValues);

        handleClose();
    };

    const filteredPatterns = parsedPatterns.filter(p =>
        p.regex.toLowerCase().includes(deferredSearchFilter.toLowerCase()) ||
        p.customName.toLowerCase().includes(deferredSearchFilter.toLowerCase())
    );

    const newPatterns = filteredPatterns.filter(p => !p.existsInCurrent);
    const updatedPatterns = filteredPatterns.filter(p => p.existsInCurrent && p.hasChanges);
    const unchangedPatterns = filteredPatterns.filter(p => p.existsInCurrent && !p.hasChanges);

    const selectAllChanged = () => setSelectedPatterns(new Set([...newPatterns, ...updatedPatterns].map(p => p.regex)));
    const selectAllNew = () => setSelectedPatterns(new Set(newPatterns.map(p => p.regex)));
    const deselectAll = () => setSelectedPatterns(new Set());

    const sortedPatterns = useMemo(() => {
        const sortByOrder = (a: ParsedPattern, b: ParsedPattern) => a.orderIndex - b.orderIndex;
        return {
            newPatterns: [...newPatterns].sort(sortByOrder),
            updatedPatterns: [...updatedPatterns].sort(sortByOrder),
            unchangedPatterns: [...unchangedPatterns].sort(sortByOrder),
            filteredPatterns: [...filteredPatterns].sort(sortByOrder),
        };
    }, [filteredPatterns, newPatterns, unchangedPatterns, updatedPatterns]);

    const renderPatternRow = (p: ParsedPattern) => {
        const isSynced = p.existsInCurrent && !p.hasChanges;
        const isSelected = selectedPatterns.has(p.regex);

        return (
            <div
                key={p.regex}
                className={`group/row flex items-start gap-3 border-b border-border/35 p-3 transition-colors ${isSynced
                    ? "bg-muted/[0.04] opacity-55"
                    : isSelected
                        ? "bg-primary/8 hover:bg-primary/12 dark:bg-primary/10 dark:hover:bg-primary/18"
                        : "hover:bg-primary/10 dark:hover:bg-primary/16"
                    }`}
            >
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
                    className="mt-0.5 border-border data-[state=unchecked]:hover:border-primary/70 data-[state=unchecked]:hover:bg-primary/10 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor={`pattern-${p.regex}`}
                        className={`block truncate text-sm font-medium ${isSynced ? "cursor-default text-foreground/62" : isSelected ? "cursor-pointer text-primary" : "cursor-pointer text-foreground"}`}
                    >
                        {p.customName}
                    </label>
                    <p
                        className={`mt-0.5 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs ${isSynced ? "text-foreground/34" : isSelected ? "text-primary/72 dark:text-primary/70" : "text-foreground/48"}`}
                        title={p.regex}
                    >
                        {p.regex}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap text-xs">
                        {p.existsInCurrent ? (
                            p.hasChanges ? (
                                <Badge variant="outline" className={cn("px-1.5 py-0", editorToneBadge.info)}>Update</Badge>
                            ) : (
                                <Badge variant="outline" className={cn("px-1.5 py-0", editorToneBadge.neutral)}>Synced</Badge>
                            )
                        ) : (
                            <Badge variant="outline" className={cn("px-1.5 py-0", editorToneBadge.info)}>New</Badge>
                        )}
                        <Badge variant="outline" className={cn("px-1.5 py-0", p.isActive ? editorToneBadge.success : editorToneBadge.neutral)}>
                            {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(editorLayout.dialogContent, "sm:max-w-2xl")}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>Import Patterns & Regex</DialogTitle>
                    <DialogDescription className="text-foreground/70">
                        {step === 1 ? "Load a template or upload a config to import patterns." : `Select patterns to import from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 mt-4">
                    {step === 1 ? (
                        <div className="space-y-6 pt-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
                            <div className={cn(editorSurface.panel, "space-y-4 p-5")}>
                                <h3 className="font-semibold text-sm text-foreground/90">Load from Template</h3>
                                <div className="flex flex-col gap-3">
                                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                                        <SelectTrigger
                                            className={cn(editorSurface.field, "h-10 w-full text-base font-mono sm:h-9 sm:text-sm")}
                                            title={selectedVersion || "Select version"}
                                            disabled={templates.length === 0}
                                        >
                                            <SelectValue placeholder="Select version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(t => (
                                                <SelectItem key={t.label} value={t.label} className="text-sm sm:text-xs font-mono cursor-pointer focus:bg-accent focus:text-accent-foreground">
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
                                                const text = await fetchTextWithLimits(t.url, {
                                                    timeoutMs: 12000,
                                                    maxBytes: 5_000_000,
                                                });
                                                setFileName(`Template ${t.label}`);
                                                processUploadedJson(text);
                                            } catch (err: unknown) {
                                                setError(err instanceof Error ? err.message : "Failed to load template.");
                                            } finally {
                                                setTemplateLoading(false);
                                            }
                                        }}
                                        disabled={templateLoading || templates.length === 0 || !selectedVersion}
                                        className={cn(editorAction.primary, "h-10 w-full font-bold sm:h-9")}
                                    >
                                        {templateLoading ? "Loading..." : "Fetch Template"}
                                    </Button>
                                    {templates.length === 0 && (
                                        <p className="text-xs text-foreground/60">
                                            No UME templates are available right now. You can still upload a local config file below.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-border/40"></div>
                                <span className="text-xs text-foreground/40 uppercase font-bold tracking-widest">or upload manually</span>
                                <div className="flex-1 h-px bg-border/40"></div>
                            </div>

                            <div
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsFileDropActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsFileDropActive(true);
                                    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                                    setIsFileDropActive(false);
                                }}
                                onDrop={handleFileDrop}
                                className={cn(
                                    editorSurface.dropzone,
                                    "flex flex-col items-center justify-center rounded-xl border-2 p-8 text-center transition-[border-color,background-color,box-shadow]",
                                    isFileDropActive
                                        ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
                                        : "hover:border-primary/30 hover:bg-primary/[0.035]"
                                )}
                            >
                                <UploadCloud className={cn("mb-3 h-10 w-10 transition-colors", isFileDropActive ? "text-primary" : "text-foreground/65")} />
                                <h3 className="mb-4 text-sm font-medium text-foreground">Upload JSON file</h3>
                                <div className={cn("mb-4 text-xs font-semibold transition-colors", isFileDropActive ? "text-primary" : "text-foreground/60")}>
                                    Drop file here
                                </div>
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-muted border-border hover:bg-muted/80 text-foreground text-xs font-semibold">
                                    Select file
                                </Button>
                                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col min-h-0 flex-1 gap-3 overflow-hidden">
                            <div className="relative flex-shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                <Input
                                    value={searchFilter}
                                    onChange={(e) => startTransition(() => setSearchFilter(e.target.value))}
                                    placeholder="Search patterns..."
                                    className={cn(editorSurface.field, "h-10 pl-9 text-sm")}
                                />
                            </div>

                            <div className={cn(editorSurface.inset, "flex min-h-0 flex-1 flex-col overflow-hidden")}>
                                <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(239,246,255,0.5))] px-3 py-2 dark:border-primary/14 dark:bg-[linear-gradient(180deg,rgba(18,24,35,0.95),rgba(14,20,31,0.92))]">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllChanged}
                                            className="h-7 px-2 text-xs font-semibold text-foreground/72 hover:bg-primary/10 hover:text-foreground"
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllNew}
                                            className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            New Only
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={deselectAll}
                                        className="h-7 px-2 text-xs font-semibold text-foreground/52 hover:bg-primary/10 hover:text-foreground/72"
                                    >
                                        Clear
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                                    {sortedPatterns.newPatterns.length > 0 && (
                                        <>
                                            <div className={cn(editorSurface.sticky, "sticky top-0 z-10 border-b border-border/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground/52")}>
                                                New ({sortedPatterns.newPatterns.length})
                                            </div>
                                            {sortedPatterns.newPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {sortedPatterns.updatedPatterns.length > 0 && (
                                        <>
                                            <div className={cn(editorSurface.sticky, "sticky top-0 z-10 border-y border-border/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground/52")}>
                                                Updates ({sortedPatterns.updatedPatterns.length})
                                            </div>
                                            {sortedPatterns.updatedPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {sortedPatterns.unchangedPatterns.length > 0 && (
                                        <>
                                            <div className={cn(editorSurface.sticky, "sticky top-0 z-10 border-y border-border/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground/52")}>
                                                Synced ({sortedPatterns.unchangedPatterns.length})
                                            </div>
                                            {sortedPatterns.unchangedPatterns.map(renderPatternRow)}
                                        </>
                                    )}
                                    {sortedPatterns.filteredPatterns.length === 0 && (
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
                    <EditorNotice tone="danger" alignCenter className="mt-3 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                        <p>{error}</p>
                    </EditorNotice>
                )}

                <DialogFooter className="mt-4 shrink-0 border-t border-border/50 pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex-row justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} className={cn(editorAction.secondary, editorSurface.field, "h-10 font-bold")}>
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleImport}
                            disabled={selectedPatterns.size === 0}
                            className={cn(editorAction.primary, "px-6 font-bold")}
                        >
                            Import ({selectedPatterns.size})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

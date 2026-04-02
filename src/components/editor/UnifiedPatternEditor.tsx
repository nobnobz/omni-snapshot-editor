"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Type, Image as ImageIcon, CheckCircle, Palette, Hexagon, Maximize, WandSparkles, ChevronRight, Pencil, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { editorAction, editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { LockedUrlInput } from "@/components/editor/LockedUrlInput";
import { cn } from "@/lib/utils";
import { shallowEqualObject } from "@/lib/equality";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

const PATTERN_DICTS = [
    { key: "pattern_tag_enabled_patterns", label: "Tag Enabled", type: "boolean", icon: <CheckCircle className="w-4 h-4 text-foreground/70" /> },
    { key: "regex_pattern_custom_names", label: "Custom Name", type: "string", icon: <Type className="w-4 h-4 text-foreground/70" /> },
    { key: "regex_pattern_image_urls", label: "Image URL", type: "string", icon: <ImageIcon className="w-4 h-4 text-foreground/70" /> },
    { key: "pattern_image_color_indices", label: "Image Color", type: "imageColor", icon: <Palette className="w-4 h-4 text-foreground/70" /> },
    { key: "pattern_border_radius_indices", label: "Corner Radius", type: "borderRadius", icon: <Maximize className="w-4 h-4 text-foreground/70" /> },
    { key: "pattern_background_opacities", label: "Background Opacity", type: "backgroundOpacity", icon: <Palette className="w-4 h-4 text-foreground/70" /> },
    { key: "pattern_border_thickness_indices", label: "Border Thickness", type: "borderThickness", icon: <Hexagon className="w-4 h-4 text-foreground/70" /> },
    { key: "pattern_color_hex_values", label: "Color Hex", type: "color", icon: <Hexagon className="w-4 h-4 text-foreground/70" /> },
];

// Image color index → label mapping (Omni uses 1=Black, 2=White, 3=Color)
const IMAGE_COLOR_OPTIONS = [
    { value: 1, label: "Black" },
    { value: 2, label: "White" },
    { value: 3, label: "Color" },
];

// Corner radius: Omni stores an index, displayed px = index × 2
// Observed: index 3 = 6px, 4 = 8px, 6 = 12px → all fit index * 2
const BORDER_RADIUS_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ index: i, px: i * 2 }));
const BORDER_THICKNESS_OPTIONS = [
    { value: 0, label: "None" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
];
type PatternScalar = string | number | boolean;
type PatternInputValue = PatternScalar | "";

const normalizePatternSelectNumber = (value: unknown): string => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return "";
        const parsed = Number(trimmed.replace(/%$/, ""));
        if (Number.isFinite(parsed)) {
            return String(parsed);
        }
    }

    return "";
};

const getPatternDefaultValue = (type: string): PatternInputValue => {
    if (type === "boolean") return false;
    if (type === "backgroundOpacity") return 1;
    if (type === "borderThickness") return 0;
    return "";
};

const formatBackgroundOpacityValue = (value: number) => {
    if (value <= 1) return "None";
    return `${value}%`;
};

const patternFieldSurface =
    "!border-slate-200/88 !bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] dark:!border-white/[0.11] dark:!bg-[linear-gradient(180deg,rgba(18,22,30,0.96),rgba(14,18,25,0.94))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

const patternCardHeaderSurface =
    "!border-slate-200/72 dark:!border-white/[0.07] !bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(248,250,252,0.5))] dark:!bg-[linear-gradient(180deg,rgba(17,20,26,0.9),rgba(13,16,22,0.88))]";

const patternRegexFrameSurface =
    "!rounded-xl !border !border-slate-300/60 dark:!border-white/[0.14] !bg-none !bg-[var(--editor-list-surface)] !shadow-none";

const patternSelectControlClass =
    "h-10 sm:h-9 text-base sm:text-sm w-full select-none focus:ring-[3px] focus:ring-ring/50 transition-colors";

const patternInputControlClass =
    "h-10 sm:h-9 text-base sm:text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors";

const PatternImageUrlInput = React.memo(function PatternImageUrlInput({
    value,
    onCommit,
}: {
    value?: string;
    onCommit: (nextUrl: string | undefined) => void;
}) {
    return (
        <LockedUrlInput
            value={value}
            onCommit={onCommit}
            placeholder="Enter Image URL..."
            inputClassName={cn(editorSurface.field, patternFieldSurface, patternInputControlClass)}
            iconButtonClassName="h-8 w-8 shrink-0 rounded-md text-foreground/56 sm:h-7 sm:w-7"
            copyTitle="Copy image URL"
            clearTitle="Delete image URL"
        />
    );
});

const PatternNode = React.memo(function PatternNode({ regex, onDelete, onRename }: { regex: string, onDelete: (r: string) => void, onRename: (oldRegex: string, newRegex: string) => void }) {
    const { currentValues, originalConfig } = useConfigSelector((state) => ({
        currentValues: state.currentValues,
        originalConfig: state.originalConfig,
    }), shallowEqualObject);
    const { updateValue } = useConfigActions();
    const [editingRegex, setEditingRegex] = useState(false);
    const [regexDraft, setRegexDraft] = useState(regex);

    const isTagEnabled = Array.isArray(currentValues["pattern_tag_enabled_patterns"])
        ? currentValues["pattern_tag_enabled_patterns"].includes(regex)
        : false;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: regex, disabled: false });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as const,
    };

    const customName = currentValues["regex_pattern_custom_names"]?.[regex];
    const imageUrl = currentValues["regex_pattern_image_urls"]?.[regex];

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(regex);
    };

    const handleStartEdit = (e?: React.SyntheticEvent) => {
        e?.stopPropagation();
        setRegexDraft(regex);
        setEditingRegex(true);
    };

    const handleConfirmEdit = (event?: { stopPropagation: () => void }) => {
        event?.stopPropagation();
        const trimmed = regexDraft.trim();
        if (trimmed && trimmed !== regex) {
            onRename(regex, trimmed);
        }
        setEditingRegex(false);
    };

    const handleCancelEdit = (event?: { stopPropagation: () => void }) => {
        event?.stopPropagation();
        setRegexDraft(regex);
        setEditingRegex(false);
    };

    return (
        <AccordionItem
            ref={setNodeRef}
            style={style}
            value={regex}
            className={cn(
                "mb-2 overflow-hidden rounded-xl group/item touch-drag-surface transition-[border-color,background-color,box-shadow,transform]",
                editorSurface.card,
                !isTagEnabled && "opacity-65",
                isDragging && "border-primary shadow-xl scale-[1.01]"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between pl-2 pr-1 transition-colors",
                    editorSurface.toolbar,
                    patternCardHeaderSurface,
                    "rounded-none border-x-0 border-t-0",
                    "hover:!border-slate-300/72 dark:hover:!border-white/[0.09] hover:!bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(248,250,252,0.53))] dark:hover:!bg-[linear-gradient(180deg,rgba(18,22,29,0.9),rgba(14,18,25,0.88))]",
                    !isTagEnabled && "opacity-85"
                )}
            >
                <div className="flex items-center flex-1 gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className={cn(
                            "touch-drag-handle cursor-grab shrink-0 p-4 -ml-2 rounded-md transition-colors",
                            isTagEnabled
                                ? "text-foreground/65 hover:text-foreground hover:bg-muted/38 dark:hover:bg-muted/24"
                                : "text-foreground/40 hover:text-foreground/70 hover:bg-muted/22 dark:hover:bg-muted/14"
                        )}
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>
                    <AccordionTrigger className="pr-4 py-4 flex-1 flex items-center justify-between !rounded-none hover:bg-transparent dark:hover:bg-transparent [&>svg]:hidden">
                        <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 shrink-0 text-foreground/70 transition-transform duration-200 group-data-[state=open]/item:rotate-90" />
                            <span className={`font-bold text-sm tracking-tight transition-colors text-left flex items-center flex-wrap gap-2 ${!isTagEnabled ? "text-foreground/50 line-through decoration-foreground/30" : "text-foreground"}`}>
                                {customName || (
                                    <span className={cn(
                                        "font-mono text-xs inline-block break-all px-2 py-0.5 rounded border",
                                        editorSurface.field,
                                        patternFieldSurface,
                                        !isTagEnabled ? "text-foreground/50 line-through decoration-foreground/30" : "text-primary"
                                    )}>
                                        {regex}
                                    </span>
                                )}
                            </span>
                        </div>
                    </AccordionTrigger>
                </div>
                <div className="pr-2 shrink-0 flex items-center gap-4">
                    {imageUrl && (
                        <div 
                            className={cn(
                                "h-10 w-auto min-w-[28px] max-w-24 shrink-0 overflow-hidden rounded-md flex items-center justify-center transition-opacity border border-white/10 p-0.5",
                                !isTagEnabled && "opacity-30"
                            )}
                            style={{ backgroundColor: '#020617' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element -- Pattern preview accepts dynamic remote URLs and must stay lightweight. */}
                            <img src={imageUrl} alt={customName || regex} className="h-full w-auto object-contain" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteClick}
                        className={`h-8 w-8 rounded-md opacity-80 hover:opacity-100 shrink-0 ${editorHover.iconDanger}`}
                        title="Delete Pattern"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <AccordionContent className="border-t border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(248,250,252,0.1))] p-5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                {/* Regex Editor */}
                <div className="mb-6">
                    <Label className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2 block">Pattern Regex</Label>
                    {editingRegex ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                autoFocus
                                onFocus={(e) => {
                                    const len = e.currentTarget.value.length;
                                    e.currentTarget.setSelectionRange(len, len);
                                }}
                                value={regexDraft}
                                onChange={(e) => setRegexDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleConfirmEdit(e);
                                    }
                                    if (e.key === 'Escape') handleCancelEdit(e);
                                }}
                                rows={1}
                                className={cn(editorSurface.field, patternFieldSurface, patternRegexFrameSurface, "min-h-[unset] py-2 text-base sm:text-sm font-mono border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 text-primary flex-1 resize-none")}
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={handleConfirmEdit} className="h-8 px-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-md transition-colors flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold uppercase font-sans">Save</span>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 px-3 bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground rounded-md transition-colors flex items-center gap-2">
                                    <X className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold uppercase font-sans">Cancel</span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={handleStartEdit}
                            className={cn(editorSurface.field, patternFieldSurface, patternRegexFrameSurface, "flex min-w-0 items-center gap-3 p-2.5 group/regex cursor-text hover:border-primary/50 transition-colors")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleStartEdit(e);
                                }
                            }}
                        >
                            <code className="min-w-0 flex-1 truncate overflow-hidden whitespace-nowrap text-xs sm:text-sm font-mono text-primary tracking-tight">
                                {regex}
                            </code>
                            <Button tabIndex={-1} size="icon" variant="ghost" className="h-7 w-7 text-foreground/70 group-hover/regex:text-primary group-hover/regex:bg-primary/10 rounded-md opacity-100 sm:opacity-0 sm:group-hover/regex:opacity-100 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out shrink-0">
                                <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PATTERN_DICTS.map((dictDef) => {
                        const dict = currentValues[dictDef.key];
                        const origVal = originalConfig?.values?.[dictDef.key];
                        const isArrayDict = Array.isArray(dict) || Array.isArray(origVal);

                        let val: PatternScalar | undefined = undefined;
                        if (isArrayDict) {
                            val = Array.isArray(dict) ? dict.includes(regex) : false;
                        } else if (dict && typeof dict === "object") {
                            const dictValue = (dict as Record<string, unknown>)[regex];
                            if (typeof dictValue === "string" || typeof dictValue === "number" || typeof dictValue === "boolean") {
                                val = dictValue;
                            }
                        }

                        // Infer original type if it doesn't currently exist
                        let inferredType = dictDef.type;
                        if (isArrayDict) {
                            inferredType = "boolean";
                        } else if (val === undefined) {
                            const origDict = origVal && typeof origVal === "object"
                                ? (origVal as Record<string, unknown>)
                                : undefined;
                            const origValItem = origDict?.[regex];
                            if (typeof origValItem === "boolean") inferredType = "boolean";
                            else if (typeof origValItem === "number") inferredType = "number";
                        } else {
                            if (typeof val === "boolean") inferredType = "boolean";
                            else if (typeof val === "number") inferredType = "number";
                        }

                        // Determine default empty value for uncontrolled components
                        const defaultVal: PatternInputValue = getPatternDefaultValue(inferredType);
                        const displayVal = val !== undefined ? val : defaultVal;

                        const handleChange = (newVal: PatternInputValue) => {
                            if (isArrayDict) {
                                const currentArr = Array.isArray(dict) ? dict : [];
                                if (newVal === true) {
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
                            <div key={dictDef.key} className={cn(editorSurface.panel, "flex flex-col justify-start gap-2.5 p-4")}>
                                <Label className="flex items-center justify-between gap-3 text-xs font-semibold tracking-tight text-foreground">
                                    <span className="flex items-center gap-2">
                                        <span className={cn(editorSurface.field, "p-1 rounded text-foreground/70")}>
                                            {dictDef.icon}
                                        </span>
                                        {dictDef.label}
                                    </span>
                                    {dictDef.type === "backgroundOpacity" ? (
                                        <span className={cn(editorSurface.field, patternFieldSurface, "select-none rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-foreground")}>
                                            {formatBackgroundOpacityValue(Number(normalizePatternSelectNumber(displayVal) || 1))}
                                        </span>
                                    ) : null}
                                </Label>

                                {inferredType === "boolean" ? (
                                    <div className="flex h-10 sm:h-9 items-center">
                                        <Switch
                                            checked={!!displayVal}
                                            onCheckedChange={(c) => handleChange(c)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                ) : dictDef.type === "imageColor" ? (
                                    <Select
                                        value={displayVal !== "" ? String(displayVal) : ""}
                                        onValueChange={(v) => handleChange(Number(v))}
                                    >
                                        <SelectTrigger className={cn(editorSurface.field, patternFieldSurface, patternSelectControlClass)}>
                                            <SelectValue placeholder="Select color..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {IMAGE_COLOR_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={String(opt.value)} className="text-base sm:text-sm focus:bg-primary focus:text-primary-foreground cursor-pointer transition-colors">
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
                                        <SelectTrigger className={cn(editorSurface.field, patternFieldSurface, patternSelectControlClass)}>
                                            <SelectValue placeholder="Select radius..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[250px]">
                                            {BORDER_RADIUS_OPTIONS.map(r => (
                                                <SelectItem key={r.index} value={String(r.index)} className="text-base sm:text-sm focus:bg-primary focus:text-primary-foreground cursor-pointer transition-colors">
                                                    {r.px}px
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : dictDef.type === "backgroundOpacity" ? (
                                    <div className="space-y-1.5">
                                        <div className={cn(editorSurface.field, patternFieldSurface, "flex h-10 sm:h-9 select-none items-center rounded-md border px-3")}>
                                            <input
                                                type="range"
                                                min={1}
                                                max={100}
                                                step={1}
                                                value={Number(normalizePatternSelectNumber(displayVal) || 1)}
                                                onChange={(e) => handleChange(Number(e.target.value))}
                                                className="h-1.5 w-full cursor-pointer accent-primary"
                                                aria-label="Background opacity"
                                            />
                                        </div>
                                        <div className="flex h-3 select-none items-center justify-between px-1 text-[10px] font-medium leading-none text-foreground/52">
                                            <span>None</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                ) : dictDef.type === "borderThickness" ? (
                                    <Select
                                        value={normalizePatternSelectNumber(displayVal)}
                                        onValueChange={(v) => handleChange(Number(v))}
                                    >
                                        <SelectTrigger className={cn(editorSurface.field, patternFieldSurface, patternSelectControlClass)}>
                                            <SelectValue placeholder="Select thickness..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[250px]">
                                            {BORDER_THICKNESS_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={String(opt.value)} className="text-base sm:text-sm focus:bg-primary focus:text-primary-foreground cursor-pointer transition-colors">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : inferredType === "number" ? (
                                    <Input
                                        type="number"
                                        value={typeof displayVal === "number" ? displayVal : ""}
                                        onChange={(e) => handleChange(e.target.value === "" ? "" : Number(e.target.value))}
                                        className={cn(editorSurface.field, patternFieldSurface, patternInputControlClass, "font-mono w-full")}
                                    />
                                ) : inferredType === "color" ? (
                                    <div className="flex gap-2">
                                        <div className={cn(editorSurface.field, patternFieldSurface, "relative w-9 h-9 rounded-md shrink-0 overflow-hidden ring-1 ring-black/20")}>
                                            <input
                                                type="color"
                                                value={typeof displayVal === "string" && displayVal ? displayVal : "#000000"}
                                                onChange={(e) => handleChange(e.target.value)}
                                                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            type="text"
                                            value={typeof displayVal === "string" ? displayVal : ""}
                                            onChange={(e) => handleChange(e.target.value)}
                                            placeholder="#FFFFFF"
                                            className={cn(editorSurface.field, patternFieldSurface, patternInputControlClass, "font-mono uppercase")}
                                        />
                                    </div>
                                ) : dictDef.key === "regex_pattern_image_urls" ? (
                                    <PatternImageUrlInput
                                        value={typeof displayVal === "string" ? displayVal : undefined}
                                        onCommit={(nextUrl) => updateValue([dictDef.key, regex], nextUrl)}
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        value={typeof displayVal === "string" || typeof displayVal === "number" ? displayVal : ""}
                                        onChange={(e) => handleChange(e.target.value)}
                                        placeholder={`Enter ${dictDef.label}...`}
                                        className={cn(editorSurface.field, patternFieldSurface, patternInputControlClass)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
});

export function UnifiedPatternEditor() {
    const currentValues = useConfigSelector((state) => state.currentValues);
    const { updateValue, clearPatterns } = useConfigActions();
    const [newPattern, setNewPattern] = useState("");
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
    const [patternNameDraft, setPatternNameDraft] = useState("");
    const [patternToDelete, setPatternToDelete] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

    // Gather all unique regex strings from all dicts
    const allRegexSet = React.useMemo(() => {
        const set = new Set<string>();
        PATTERN_DICTS.forEach(d => {
            const dict = currentValues[d.key];
            if (Array.isArray(dict)) {
                dict.forEach((k: string) => set.add(k));
            } else if (dict && typeof dict === "object") {
                Object.keys(dict).forEach(k => set.add(k));
            }
        });
        return set;
    }, [currentValues]);

    // Sort: first those in auto_play_patterns (in order), then the rest alphabetically
    const orderedKeys = React.useMemo(() => {
        const autoPlayOrder: string[] = Array.isArray(currentValues["auto_play_patterns"])
            ? currentValues["auto_play_patterns"]
            : [];
            
        return [
            ...autoPlayOrder.filter(k => allRegexSet.has(k)),
            ...Array.from(allRegexSet).filter(k => !autoPlayOrder.includes(k)).sort()
        ];
    }, [currentValues, allRegexSet]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const oldIndex = orderedKeys.indexOf(active.id as string);
        const newIndex = orderedKeys.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
            const nextOrder = arrayMove(orderedKeys, oldIndex, newIndex);
            // Persist the entire sequence in auto_play_patterns so the order is saved
            updateValue(["auto_play_patterns"], nextOrder);
        }
    };

    const handleAddPattern = () => {
        const p = newPattern.trim();
        if (!p || allRegexSet.has(p)) return;
        setPatternNameDraft("New Pattern");
        setIsNameDialogOpen(true);
    };

    const handleConfirmAddPattern = () => {
        const p = newPattern.trim();
        const name = patternNameDraft.trim() || "New Pattern";

        // Initialize with the provided name
        updateValue(["regex_pattern_custom_names", p], name);

        // Automatically enable it
        const currentEnabled = Array.isArray(currentValues["pattern_tag_enabled_patterns"])
            ? currentValues["pattern_tag_enabled_patterns"]
            : [];
        if (!currentEnabled.includes(p)) {
            updateValue(["pattern_tag_enabled_patterns"], [...currentEnabled, p]);
        }

        // Initialize other dictionaries with safe defaults if they don't exist
        if (!currentValues.regex_pattern_image_urls?.[p]) {
            updateValue(["regex_pattern_image_urls", p], "");
        }
        if (currentValues.pattern_image_color_indices?.[p] === undefined) {
            updateValue(["pattern_image_color_indices", p], 1); // Default to White
        }
        if (currentValues.pattern_border_radius_indices?.[p] === undefined) {
            updateValue(["pattern_border_radius_indices", p], 3); // Default standard radius
        }
        if (currentValues.pattern_background_opacities?.[p] === undefined) {
            updateValue(["pattern_background_opacities", p], 1);
        }
        if (currentValues.pattern_border_thickness_indices?.[p] === undefined) {
            updateValue(["pattern_border_thickness_indices", p], 0);
        }
        if (currentValues.pattern_color_hex_values?.[p] === undefined) {
            updateValue(["pattern_color_hex_values", p], "#FFFFFF");
        }

        setNewPattern("");
        setIsNameDialogOpen(false);
    };

    const handleDeletePattern = (regex: string) => {
        setPatternToDelete(regex);
    };

    const confirmDeletePattern = () => {
        if (!patternToDelete) return;
        const regex = patternToDelete;
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
        setPatternToDelete(null);
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

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="patterns-root" className={`!border-b-0 ${editorSurface.card} ring-1 ring-inset ring-white/5 dark:ring-white/[0.06]`}>
                <AccordionTrigger indicator="right-down" className="px-5 py-4 flex justify-between items-center group transition-colors !rounded-none hover:bg-transparent dark:hover:bg-transparent">
                    <div className="flex items-center gap-3">
                        <WandSparkles className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
                        <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                            Pattern & Regex Settings
                            <Badge variant="outline" className="text-xs uppercase tracking-widest bg-primary/12 text-primary border-primary/35 font-bold ml-2">
                                {orderedKeys.length} Patterns
                            </Badge>
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="rounded-b-xl border-t border-border/30 p-5 pb-6 pt-5">
                    <div className="space-y-6">
                        <div className={`${editorSurface.panel} flex flex-col gap-3 p-4`}>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                                <Textarea
                                    value={newPattern}
                                    onChange={e => setNewPattern(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddPattern();
                                        }
                                    }}
                                    placeholder="Enter new Regex string (e.g. (?i)uhd|4k)"
                                    rows={3}
                                    className={cn(
                                        editorSurface.field,
                                        patternFieldSurface,
                                        "min-h-[5.75rem] w-full min-w-0 flex-1 rounded-xl px-4 py-3 text-[15px] leading-[1.4] font-medium transition-colors resize-y sm:min-h-[6.25rem] sm:px-5 sm:py-3.5 sm:text-base lg:min-h-[5.25rem] lg:px-4 lg:py-3 lg:text-sm"
                                    )}
                                />
                                <div className="flex items-center gap-2 lg:shrink-0">
                                    <Button
                                        onClick={handleAddPattern}
                                        className={cn(editorAction.premium, "h-12 px-4 sm:px-6 lg:h-10")}
                                    >
                                        <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> Add Pattern
                                    </Button>
                                    {!confirmDeleteAll && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setConfirmDeleteAll(true)}
                                            className={cn(
                                                "h-12 w-12 shrink-0 rounded-[1.15rem] border border-transparent px-0",
                                                "lg:h-10 lg:w-10",
                                                editorHover.iconDanger
                                            )}
                                            aria-label="Delete all patterns"
                                            title="Delete All"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                                {confirmDeleteAll ? (
                                    <div className="flex flex-col gap-3 rounded-xl border border-red-500/14 bg-red-500/[0.025] p-3 animate-in fade-in slide-in-from-right-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2">
                                            <Trash2 className="h-4 w-4 shrink-0 text-red-500/90" />
                                            <span className="text-sm font-medium text-foreground sm:text-xs">
                                                Are you sure you want to delete all patterns?
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:justify-end">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    clearPatterns();
                                                    setConfirmDeleteAll(false);
                                                }}
                                                className="h-9 flex-1 rounded-lg px-3 text-xs sm:flex-none"
                                            >
                                                Yes, Delete All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setConfirmDeleteAll(false)}
                                                className="h-9 flex-1 rounded-lg px-3 text-xs sm:flex-none"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragStart={handleDragStart}
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={orderedKeys} strategy={verticalListSortingStrategy}>
                                <Accordion type="single" collapsible className="w-full pb-1">
                                    {orderedKeys.map((regex: string) => (
                                        <PatternNode key={regex} regex={regex} onDelete={handleDeletePattern} onRename={handleRenamePattern} />
                                    ))}
                                </Accordion>
                            </SortableContext>
                            {activeId && typeof document !== 'undefined' ? createPortal(
                                <DragOverlay
                                    dropAnimation={{
                                        sideEffects: defaultDropAnimationSideEffects({
                                            styles: {
                                                active: {
                                                    opacity: "0.15",
                                                },
                                            },
                                        }),
                                    }}
                                >
                                    <div className={cn(
                                        "flex items-center justify-between pl-2 pr-4 py-4 rounded-xl border border-primary/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] shadow-2xl opacity-95 dark:bg-[linear-gradient(180deg,rgba(20,23,30,0.96),rgba(13,16,21,0.94))]",
                                        "ring-1 ring-primary/20"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="h-5 w-5 text-primary" />
                                            <span className="font-bold text-sm tracking-tight text-foreground truncate max-w-[200px]">
                                                {currentValues["regex_pattern_custom_names"]?.[activeId] || activeId}
                                            </span>
                                        </div>
                                        {currentValues["regex_pattern_image_urls"]?.[activeId] && (
                                            <div 
                                                className="h-8 w-8 shrink-0 overflow-hidden rounded-md flex items-center justify-center border border-white/10 p-1"
                                                style={{ backgroundColor: '#020617' }}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic pattern preview. */}
                                                <img src={currentValues["regex_pattern_image_urls"]?.[activeId]} alt="Preview" className="h-full w-auto object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </DragOverlay>,
                                document.body
                            ) : null}
                        </DndContext>
                        {orderedKeys.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-border/80 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
                                    <WandSparkles className="w-8 h-8 text-primary/60" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">No Patterns Found</p>
                                    <p className="text-xs text-foreground/70 max-w-[280px] leading-relaxed mx-auto">
                                        No patterns defined for this snapshot. Import from template or add one.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            Pattern Name
                        </DialogTitle>
                        <DialogDescription className="text-foreground/70 text-sm">
                            Give your new regex pattern a descriptive name for better organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pattern-name" className="text-xs font-bold uppercase tracking-widest text-foreground/70 ml-1">
                                Display Name
                            </Label>
                            <Input
                                id="pattern-name"
                                value={patternNameDraft}
                                onChange={(e) => setPatternNameDraft(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddPattern()}
                                placeholder="e.g. 4K Movies, TrueHD, etc."
                                className="h-11 text-base sm:text-sm bg-background/50 border-border focus:ring-ring/50 focus:border-ring text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsNameDialogOpen(false)}
                            className={cn("h-10 px-6", editorHover.softAction)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAddPattern}
                            className="h-10 bg-primary hover:bg-primary/92 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out"
                        >
                            Save Pattern
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!patternToDelete} onOpenChange={(open) => !open && setPatternToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Delete Pattern
                        </DialogTitle>
                        <DialogDescription className="text-foreground/70 text-sm leading-relaxed mt-2 pt-2">
                            Are you sure you want to delete all settings for the pattern{" "}
                            <span className="font-mono text-xs inline-block break-all bg-background/50 px-2 py-0.5 rounded border border-border text-foreground">
                                {patternToDelete}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setPatternToDelete(null)}
                            className={cn("h-10 px-6", editorHover.softAction)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDeletePattern}
                            className="h-10 bg-red-600 hover:bg-red-500 text-white font-bold px-8 shadow-lg shadow-red-900/20 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Accordion>
    );
}

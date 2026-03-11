"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
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
} from '@dnd-kit/core';
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

const PatternNode = React.memo(function PatternNode({ regex, onDelete, onRename }: { regex: string, onDelete: (r: string) => void, onRename: (oldRegex: string, newRegex: string) => void }) {
    const { currentValues, updateValue, originalConfig } = useConfig();
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
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as const,
    };

    const customName = currentValues["regex_pattern_custom_names"]?.[regex];
    const imageUrl = currentValues["regex_pattern_image_urls"]?.[regex];

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
            ref={setNodeRef}
            style={style}
            value={regex}
            className={`border rounded-lg overflow-hidden bg-card transition-all mb-2 group/item
                ${!isTagEnabled ? "opacity-60 grayscale-[0.3]" : "hover:border-border/80"}
                ${isDragging ? "opacity-50 border-blue-500 shadow-xl" : "border-border"}`}
        >
            <div className={`flex items-center justify-between transition-colors ${!isTagEnabled ? "bg-card/60" : "bg-card hover:bg-muted/50"} pl-2 pr-1`}>
                <div className="flex items-center flex-1 gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className={`cursor-grab shrink-0 p-2 ml-0.5 rounded-md transition-colors ${isTagEnabled ? "text-foreground/70 hover:text-foreground hover:bg-muted" : "text-foreground/40 pointer-events-none"}`}
                        style={{ touchAction: 'none' }}
                    >
                        <GripVertical className="h-5 w-5" />
                    </button>
                    <AccordionTrigger className="pr-4 py-4 flex-1 hover:no-underline flex items-center justify-between [&>svg]:hidden">
                        <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 shrink-0 text-foreground/70 transition-transform duration-200 group-data-[state=open]/item:rotate-90" />
                            <span className={`font-bold text-sm tracking-tight transition-colors text-left ${!isTagEnabled ? "text-foreground/70" : "text-foreground"}`}>
                                {customName || <span className={`font-mono text-[11px] inline-block break-all bg-background/50 px-2 py-0.5 rounded border border-border ${!isTagEnabled ? "text-foreground/70" : "text-blue-400"}`}>{regex}</span>}
                            </span>
                        </div>
                    </AccordionTrigger>
                </div>
                <div className="pr-2 shrink-0 flex items-center gap-4">
                    {imageUrl && (
                        <div className={`h-8 w-auto max-w-24 shrink-0 overflow-hidden rounded-md border border-border/50 bg-neutral-900 flex items-center justify-center shadow-inner transition-opacity ${!isTagEnabled ? "opacity-30" : ""}`}>
                            <img src={imageUrl} alt={customName || regex} className="h-full w-auto object-contain" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteClick}
                        className="h-8 w-8 text-foreground/70 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-transparent hover:border-red-500/30 transition-all opacity-80 hover:opacity-100 shrink-0"
                        title="Delete Pattern"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <AccordionContent className="p-5 border-t border-border/50 bg-background/20">
                {/* Regex Editor */}
                <div className="mb-6">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 mb-2 block">Pattern Regex</Label>
                    {editingRegex ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                value={regexDraft}
                                onChange={(e) => setRegexDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleConfirmEdit(e as any);
                                    }
                                    if (e.key === 'Escape') handleCancelEdit(e as any);
                                }}
                                autoFocus
                                rows={1}
                                className="min-h-[unset] py-2 text-base sm:text-xs font-mono bg-background/80 border-blue-500/50 focus-visible:ring-1 focus-visible:ring-blue-500 text-blue-300 flex-1 shadow-inner resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={handleConfirmEdit} className="h-8 px-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-md transition-colors flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase font-sans">Save</span>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 px-3 bg-muted/50 text-foreground/70 hover:bg-muted hover:text-white rounded-md transition-colors flex items-center gap-2">
                                    <X className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase font-sans">Cancel</span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/80 bg-background/50 shadow-inner group/regex transition-colors hover:border-border/80">
                            <code className="text-[11px] sm:text-xs font-mono text-blue-400 flex-1 break-all tracking-tight">{regex}</code>
                            <Button size="icon" variant="ghost" onClick={handleStartEdit} className="h-7 w-7 text-foreground/70 hover:text-blue-400 hover:bg-blue-500/10 rounded-md opacity-100 sm:opacity-0 sm:group-hover/regex:opacity-100 transition-all shrink-0">
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
                            <div key={dictDef.key} className="flex flex-col justify-center gap-2.5 p-4 bg-background/40 border border-border/80 shadow-sm rounded-lg transition-colors hover:border-border/80 hover:bg-card/40">
                                <Label className="flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground">
                                    <span className="p-1 rounded bg-card text-foreground/70 border border-border">
                                        {dictDef.icon}
                                    </span>
                                    {dictDef.label}
                                </Label>

                                {inferredType === "boolean" ? (
                                    <Switch
                                        checked={!!displayVal}
                                        onCheckedChange={(c) => handleChange(c)}
                                        className="data-[state=checked]:bg-blue-500 mt-1"
                                    />
                                ) : dictDef.type === "imageColor" ? (
                                    <Select
                                        value={displayVal !== "" ? String(displayVal) : ""}
                                        onValueChange={(v) => handleChange(Number(v))}
                                    >
                                        <SelectTrigger className="h-10 sm:h-9 text-base sm:text-xs bg-background/80 border-border w-full hover:border-border focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner">
                                            <SelectValue placeholder="Select color..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/95 backdrop-blur-xl border-border text-foreground shadow-xl">
                                            {IMAGE_COLOR_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={String(opt.value)} className="text-base sm:text-xs focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">
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
                                        <SelectTrigger className="h-10 sm:h-9 text-base sm:text-xs bg-background/80 border-border w-full hover:border-border focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner">
                                            <SelectValue placeholder="Select radius..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/95 backdrop-blur-xl border-border text-foreground shadow-xl max-h-[250px]">
                                            {BORDER_RADIUS_OPTIONS.map(r => (
                                                <SelectItem key={r.index} value={String(r.index)} className="text-base sm:text-xs focus:bg-blue-600 focus:text-white cursor-pointer transition-colors">
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
                                        className="h-10 sm:h-9 text-base sm:text-xs bg-background/80 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner font-mono transition-colors w-full"
                                    />
                                ) : inferredType === "color" ? (
                                    <div className="flex gap-2">
                                        <div className="relative w-9 h-9 rounded-md shrink-0 overflow-hidden border border-border/80 bg-background shadow-inner ring-1 ring-black/20">
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
                                            className="h-10 sm:h-9 text-base sm:text-xs font-mono bg-background/80 border-border uppercase focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner transition-colors"
                                        />
                                    </div>
                                ) : (
                                    <Input
                                        type="text"
                                        value={displayVal}
                                        onChange={(e) => handleChange(e.target.value)}
                                        placeholder={`Enter ${dictDef.label}...`}
                                        className="h-10 sm:h-9 text-base sm:text-xs bg-background/80 border-border hover:border-border focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner transition-colors"
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
    const { currentValues, updateValue, clearPatterns } = useConfig();
    const [newPattern, setNewPattern] = useState("");
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
    const [patternNameDraft, setPatternNameDraft] = useState("");
    const [patternToDelete, setPatternToDelete] = useState<string | null>(null);
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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
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
            <AccordionItem value="patterns-root" className="bg-card/60 backdrop-blur-md border border-white/[0.08] shadow-[0_4px_20px_rgb(0,0,0,0.1)] rounded-xl overflow-hidden transition-all hover:bg-card/80">
                <AccordionTrigger className="px-5 py-4 hover:no-underline flex justify-between items-center group transition-colors">
                    <div className="flex items-center gap-3">
                        <WandSparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                            Pattern & Regex Settings
                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold ml-2">
                                {orderedKeys.length} Patterns
                            </Badge>
                        </span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-5 pt-5 border-t border-border/20 bg-card/10">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3 bg-background/60 p-4 rounded-xl border border-border/80 shadow-inner">
                            <div className="flex sm:flex-row flex-col gap-3">
                                <Input
                                    value={newPattern}
                                    onChange={e => setNewPattern(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddPattern()}
                                    placeholder="Enter new Regex string (e.g. (?i)uhd|4k)"
                                    className="h-10 text-base sm:text-sm font-mono bg-background/40 border-border/40 focus-visible:ring-1 focus-visible:ring-purple-500 shadow-inner transition-colors flex-1"
                                />
                                <Button onClick={handleAddPattern} className="h-10 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 transition-all font-semibold px-6 w-full sm:w-auto">
                                    <Plus className="w-4 h-4 mr-2" /> Add Pattern
                                </Button>
                            </div>

                            <div className="flex items-center justify-end pt-2 border-t border-border/20 mt-1">
                                {confirmDeleteAll ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                        <span className="text-[11px] font-medium text-red-500">Are you sure you want to delete all?</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                clearPatterns();
                                                setConfirmDeleteAll(false);
                                            }}
                                            className="h-8 px-3 text-[11px]"
                                        >
                                            Yes, Delete All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setConfirmDeleteAll(false)}
                                            className="h-8 px-3 text-[11px]"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmDeleteAll(true)}
                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3 border border-transparent text-[11px]"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                        Delete All Patterns
                                    </Button>
                                )}
                            </div>
                        </div>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={orderedKeys} strategy={verticalListSortingStrategy}>
                                <Accordion type="single" collapsible className="w-full">
                                    {orderedKeys.map((regex: string) => (
                                        <PatternNode key={regex} regex={regex} onDelete={handleDeletePattern} onRename={handleRenamePattern} />
                                    ))}
                                </Accordion>
                            </SortableContext>
                        </DndContext>
                        {orderedKeys.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-border/80 rounded-xl bg-background/20 flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                                    <WandSparkles className="w-8 h-8 text-blue-500/60" />
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
                <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px] shadow-2xl backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-purple-400" />
                            Pattern Name
                        </DialogTitle>
                        <DialogDescription className="text-foreground/70 text-sm">
                            Give your new regex pattern a descriptive name for better organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pattern-name" className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 ml-1">
                                Display Name
                            </Label>
                            <Input
                                id="pattern-name"
                                value={patternNameDraft}
                                onChange={(e) => setPatternNameDraft(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddPattern()}
                                placeholder="e.g. 4K Movies, TrueHD, etc."
                                className="h-11 text-base sm:text-sm bg-background/50 border-border focus:ring-purple-500 focus:border-purple-500 text-foreground"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsNameDialogOpen(false)}
                            className="text-foreground/70 hover:text-foreground hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAddPattern}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 shadow-lg shadow-blue-900/20 transition-all"
                        >
                            Save Pattern
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!patternToDelete} onOpenChange={(open) => !open && setPatternToDelete(null)}>
                <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px] shadow-2xl backdrop-blur-xl">
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
                            className="text-foreground/70 hover:text-foreground hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDeletePattern}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 shadow-lg shadow-red-900/20 transition-all"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Accordion>
    );
}

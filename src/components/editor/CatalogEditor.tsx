"use client";

import React, { useState, useMemo, useRef } from "react";
import { useConfig } from "@/context/ConfigContext";
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
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CATALOG_FALLBACKS, CatalogFallback } from "@/lib/catalog-fallbacks";
import { resolveCatalogName, cn, ensureCatalogPrefix } from "@/lib/utils";
import { GripVertical, Eye, EyeOff, Trash2, ArrowDownAZ, ArrowUpZA, Search, Settings2, Shuffle, LayoutGrid, Star, ChevronDown, ChevronUp, Plus, Maximize, Pencil, ListX, Pin } from "lucide-react";
import { editorAction, editorHover, editorLayout, editorSurface, editorToneBadge } from "@/components/editor/ui/style-contract";

// ─── Types ──────────────────────────────────────────────────────────────────
interface ManifestCatalog {
    id: string;
    name: string;
    type?: string;
    enabled?: boolean;
    showInHome?: boolean;
    source?: string;
    displayType?: string;
    randomizePerPage?: boolean;
    metadata?: { itemCount?: number;[k: string]: unknown };
    _synthetic?: boolean;
    [key: string]: unknown;
}

const stripCatalogCategoryPrefix = (name: string) =>
    name.replace(/^(\[[^\]]+\]\s*)+/, "").trim();

const stripCatalogTypePrefix = (id: string) =>
    id.replace(/^(movie:|series:|anime:|all:)/, "");

const catalogIdsMatch = (left: string, right: string) =>
    stripCatalogTypePrefix(left) === stripCatalogTypePrefix(right);

const catalogListHasId = (list: string[], catalogId: string) =>
    list.some(id => catalogIdsMatch(id, catalogId));

const updateCatalogFlagList = (list: string[], catalogId: string, isEnabled: boolean) => {
    const next = list.filter(id => !catalogIdsMatch(id, catalogId));
    if (isEnabled) next.push(catalogId);
    return next;
};

const catalogManagerBadgeTone = {
    blue: "bg-primary/10 text-primary dark:text-primary border-primary/30",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/25",
} as const;

const focusSearchInput = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus({ preventScroll: true });
    const cursorPosition = input.value.length;
    try {
        input.setSelectionRange(cursorPosition, cursorPosition);
    } catch {
        // Some browsers may reject selection updates for specific input modes.
    }
};

// ─── Sortable Item ───────────────────────────────────────────────────────────
function SortableCatalogItem({
    catalog,
    isLandscape,
    isSmall,
    isSmallTopRow,
    isRandom,
    isPinned,
    isEditingName,
    onStartEditingName,
    onStopEditingName,
    onUpdateField,
    onUpdateLandscape,
    onUpdateSmall,
    onUpdateSmallTopRow,
    onUpdateRandom,
    onUpdatePinned,
    onRemove,
    currentValues,
}: {
    catalog: ManifestCatalog;
    isLandscape: boolean;
    isSmall: boolean;
    isSmallTopRow: boolean;
    isRandom: boolean;
    isPinned: boolean;
    isEditingName: boolean;
    onStartEditingName: () => void;
    onStopEditingName: () => void;
    onUpdateField: (patch: Partial<ManifestCatalog>) => void;
    onUpdateLandscape: (v: boolean) => void;
    onUpdateSmall: (v: boolean) => void;
    onUpdateSmallTopRow: (v: boolean) => void;
    onUpdateRandom: (v: boolean) => void;
    onUpdatePinned: (v: boolean) => void;
    onRemove: () => void;
    currentValues: Record<string, unknown>;
}) {
    const isActive = catalog.enabled !== false || catalog.showInHome === true || isPinned;

    const {
        attributes, listeners, setNodeRef,
        transform, transition, isDragging,
    } = useSortable({ id: catalog.id, disabled: !isActive });

    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : 1 };

    const [editName, setEditName] = useState(catalog.name || catalog.id);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsTouchStartRef = useRef<{ x: number; y: number } | null>(null);
    const settingsTouchMovedRef = useRef(false);
    const settingsIgnoreClickRef = useRef(false);

    const startNameEdit = () => {
        setEditName(catalog.name || catalog.id);
        onStartEditingName();
    };

    const submitName = () => {
        onStopEditingName();
        const t = editName.trim();
        if (t && t !== catalog.name) onUpdateField({ name: t });
        else setEditName(catalog.name || catalog.id);
    };

    const cancelNameEdit = () => {
        setEditName(catalog.name || catalog.id);
        onStopEditingName();
    };

    const itemCount = catalog.metadata?.itemCount;
    const customCatalogNames = (currentValues["custom_catalog_names"] ?? {}) as Record<string, string>;

    const handleSettingsPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        // Radix opens dropdowns on pointer-down; block that path for touch so scroll gestures don't open it.
        if (e.pointerType === "touch") {
            e.preventDefault();
        }
    };

    const handleSettingsTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
        const t = e.touches[0];
        settingsTouchStartRef.current = { x: t.clientX, y: t.clientY };
        settingsTouchMovedRef.current = false;
    };

    const handleSettingsTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
        const start = settingsTouchStartRef.current;
        if (!start) return;
        const t = e.touches[0];
        const movedX = Math.abs(t.clientX - start.x);
        const movedY = Math.abs(t.clientY - start.y);
        if (movedX > 8 || movedY > 8) {
            settingsTouchMovedRef.current = true;
        }
    };

    const handleSettingsTouchEnd = () => {
        settingsIgnoreClickRef.current = true;
        if (!settingsTouchMovedRef.current) {
            setIsSettingsOpen(true);
        }
        settingsTouchStartRef.current = null;
        settingsTouchMovedRef.current = false;
    };

    const handleSettingsTouchCancel = () => {
        settingsIgnoreClickRef.current = true;
        settingsTouchStartRef.current = null;
        settingsTouchMovedRef.current = false;
    };

    const handleSettingsClick = () => {
        // Touch opens via touch-end handler above; ignore synthetic click that follows touch events.
        if (settingsIgnoreClickRef.current) {
            settingsIgnoreClickRef.current = false;
            return;
        }
        setIsSettingsOpen(true);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 rounded-lg mb-2 ${editorHover.transition} ${editorSurface.cardInteractive}
                ${isDragging ? "opacity-50 border-primary shadow-xl" : ""}
                ${!isActive ? "opacity-60 border-dashed border-slate-200/60 bg-white/42 dark:border-white/8 dark:bg-white/[0.025]" : ""}
            `}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab shrink-0 p-2 rounded-md transition-colors ${isActive ? editorHover.softAction : "text-foreground pointer-events-none"}`}
                style={{ touchAction: 'none' }}
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* Name + ID and Badges wrapper */}
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Name + ID */}
                <div className="flex-1 min-w-0">
                    {isEditingName ? (
                        <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={submitName}
                            onKeyDown={e => {
                                if (e.key === 'Enter') submitName();
                                if (e.key === 'Escape') cancelNameEdit();
                            }}
                            autoFocus
                            className="h-10 sm:h-9 text-base sm:text-sm bg-background border-ring font-bold"
                        />
                    ) : (
                        <div className="flex flex-col min-w-0">
                            <h4
                                className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors max-w-full group/name ${isActive ? "text-foreground group-hover/name:text-primary" : "text-foreground/70"}`}
                                onClick={startNameEdit}
                            >
                                <span className="truncate">
                                    {catalog.name && catalog.name !== catalog.id 
                                        ? catalog.name 
                                        : resolveCatalogName(catalog.id, customCatalogNames)}
                                </span>
                                {catalog.showInHome && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                                <Pencil className="w-3 h-3 text-foreground/45 opacity-0 group-hover/name:opacity-90 transition-opacity shrink-0" />
                            </h4>
                            <p className="text-xs text-foreground/70 truncate font-mono mt-0.5">{catalog.id}</p>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 shrink-0 flex-wrap sm:justify-end">
                    {!catalog.enabled && (
                        <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", editorToneBadge.neutral)}>Hidden</Badge>
                    )}
                    {isPinned && (
                        <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", catalogManagerBadgeTone.emerald)}>Header</Badge>
                    )}
                    {catalog.isOrphaned && (
                        <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", catalogManagerBadgeTone.violet)}>Orphaned</Badge>
                    )}
                    
                    {/* Top Row Group */}
                    <div className="flex items-center gap-1">
                        {isSmall && (
                            <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", catalogManagerBadgeTone.blue)}>Small</Badge>
                        )}
                        {catalog.showInHome && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-md",
                                    catalogManagerBadgeTone.amber
                                )}
                            >
                                {isSmallTopRow ? 'Top Row (small)' : 'Top Row'}
                            </Badge>
                        )}
                        {itemCount && catalog.showInHome && (
                            <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">{itemCount}</Badge>
                        )}
                    </div>

                    {/* Shelf Specifics */}
                    {isLandscape && (
                        <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", catalogManagerBadgeTone.orange)}>Wide</Badge>
                    )}
                    {isRandom && (
                        <Badge variant="outline" className={cn("text-xs font-bold px-2 py-0.5 rounded-md", catalogManagerBadgeTone.violet)}>Rand</Badge>
                    )}
                </div>
            </div>

            {/* Settings */}
            <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 shrink-0 ${editorHover.iconAction}`}
                        onPointerDown={handleSettingsPointerDown}
                        onTouchStart={handleSettingsTouchStart}
                        onTouchMove={handleSettingsTouchMove}
                        onTouchEnd={handleSettingsTouchEnd}
                        onTouchCancel={handleSettingsTouchCancel}
                        onClick={handleSettingsClick}
                    >
                        <Settings2 className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">

                    <DropdownMenuLabel className="text-xs uppercase text-foreground/70 font-bold">Visibility</DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={catalog.enabled}
                        onCheckedChange={v => onUpdateField({ enabled: v })}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        {catalog.enabled ? <Eye className="w-3.5 h-3.5 mr-2 text-primary" /> : <EyeOff className="w-3.5 h-3.5 mr-2 text-foreground/70" />}
                        {catalog.enabled ? "Shown in Shelf" : "Hidden in Shelf"}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={catalog.showInHome}
                        onCheckedChange={v => {
                            if (v && !itemCount) {
                                onUpdateField({ showInHome: v, metadata: { ...(catalog.metadata || {}), itemCount: 10 } });
                            } else {
                                onUpdateField({ showInHome: v });
                            }
                        }}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Star className="w-3.5 h-3.5 mr-2 text-amber-500" />
                        Show in Top Row
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={isPinned}
                        onCheckedChange={onUpdatePinned}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Pin className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                        Header
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator className="bg-muted" />
                    <DropdownMenuLabel className="text-xs uppercase text-foreground/70 font-bold">Layout</DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={isLandscape}
                        onCheckedChange={onUpdateLandscape}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Maximize className="w-3.5 h-3.5 mr-2 text-foreground/70" />
                        Landscape
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={isSmall}
                        onCheckedChange={onUpdateSmall}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <LayoutGrid className="w-3.5 h-3.5 mr-2 text-foreground/70" />
                        Small Posters
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={isRandom}
                        onCheckedChange={onUpdateRandom}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Shuffle className="w-3.5 h-3.5 mr-2 text-foreground/70" />
                        Randomize Order
                    </DropdownMenuCheckboxItem>

                    {catalog.showInHome && (
                        <>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuLabel className="text-xs uppercase text-foreground/70 font-bold">Top Row Options</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={isSmallTopRow}
                                onCheckedChange={onUpdateSmallTopRow}
                                onSelect={(e) => e.preventDefault()}
                                className="text-xs"
                            >
                                <LayoutGrid className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                Small Top Row
                            </DropdownMenuCheckboxItem>
                            <div className="px-2 py-1.5 flex items-center justify-between">
                                <span className="text-xs text-foreground/70 font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500" /> Top Row Limit
                                </span>
                                <Select
                                    value={itemCount ? String(itemCount) : ""}
                                    onValueChange={val => onUpdateField({ metadata: { ...(catalog.metadata || {}), itemCount: parseInt(val, 10) } })}
                                >
                                    <SelectTrigger className="h-6 w-16 text-xs bg-background border-border focus:ring-0 px-1">
                                        <SelectValue placeholder="–" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 20, 30, 50].map(opt => (
                                            <SelectItem key={opt} value={String(opt)} className="text-xs focus:bg-accent">{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Hard Delete */}
            <Button
                variant="ghost" size="icon"
                onClick={onRemove}
                className={cn("h-8 w-8 shrink-0", editorHover.iconDanger)}
                title="Disable catalog"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export function CatalogEditor() {
    const {
        catalogs,
        currentValues,
        updateValue,
        updateCatalogField,
        removeManifestCatalog,
        reorderManifestCatalogs,
        addManifestCatalog,
        customFallbacks,
    } = useConfig();

    // Local state for UI
    const [showDisabled, setShowDisabled] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [addSearch, setAddSearch] = useState("");
    const [pendingAddSelections, setPendingAddSelections] = useState<Set<string>>(new Set());
    const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
    const addSearchInputRef = useRef<HTMLInputElement>(null);

    const activeEditingCatalogId = useMemo(() => {
        if (!editingCatalogId) return null;
        return catalogs.some(c => c.id === editingCatalogId) ? editingCatalogId : null;
    }, [catalogs, editingCatalogId]);

    // Landscape is stored in currentValues.landscape_catalogs (side-array)
    const landscapeList: string[] = useMemo(() => currentValues["landscape_catalogs"] || [], [currentValues]);
    const handleUpdateLandscape = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["landscape_catalogs"]) ? currentValues["landscape_catalogs"] : [];
        const next = updateCatalogFlagList(current, catalogId, v);
        updateValue(["landscape_catalogs"], next);
    };

    // Small posters stored in currentValues.small_catalogs (side-array)
    const smallList: string[] = useMemo(() => currentValues["small_catalogs"] || [], [currentValues]);
    const handleUpdateSmall = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["small_catalogs"]) ? currentValues["small_catalogs"] : [];
        const next = updateCatalogFlagList(current, catalogId, v);
        updateValue(["small_catalogs"], next);
    };

    // Small Top Row stored in currentValues.small_toprow_catalogs (NOTE: no underscore after small)
    const smallTopRowList: string[] = useMemo(() => currentValues["small_toprow_catalogs"] || [], [currentValues]);
    const handleUpdateSmallTopRow = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["small_toprow_catalogs"]) ? currentValues["small_toprow_catalogs"] : [];
        const next = updateCatalogFlagList(current, catalogId, v);
        updateValue(["small_toprow_catalogs"], next);
    };

    const randomizedList: string[] = useMemo(() => currentValues["randomized_catalogs"] || [], [currentValues]);
    const handleUpdateRandomize = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["randomized_catalogs"]) ? currentValues["randomized_catalogs"] : [];
        const next = updateCatalogFlagList(current, catalogId, v);
        updateValue(["randomized_catalogs"], next);
    };

    // Pinned (Header) stored in currentValues.starred_catalogs
    const pinnedList: string[] = useMemo(() => currentValues["starred_catalogs"] || [], [currentValues]);
    const handleUpdatePinned = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["starred_catalogs"]) ? currentValues["starred_catalogs"] : [];
        const next = updateCatalogFlagList(current, catalogId, v);
        updateValue(["starred_catalogs"], next);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Split catalogs: active if enabled in shelf OR shown in home OR pinned (header)
    const enabledCatalogs = useMemo(
        () => catalogs.filter(c => (c.enabled !== false || c.showInHome === true || catalogListHasId(pinnedList, c.id)) && !c.isOrphaned),
        [catalogs, pinnedList]
    );
    const disabledCatalogs = useMemo(
        () => catalogs.filter(c => c.enabled === false && c.showInHome !== true && !catalogListHasId(pinnedList, c.id) || c.isOrphaned),
        [catalogs, pinnedList]
    );



    const enabledIds = useMemo(() => enabledCatalogs.map(c => c.id), [enabledCatalogs]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = enabledCatalogs.findIndex(c => c.id === active.id);
        const ni = enabledCatalogs.findIndex(c => c.id === over.id);
        if (oi === -1 || ni === -1) return;
        reorderManifestCatalogs([...arrayMove(enabledCatalogs, oi, ni), ...disabledCatalogs]);
    };

    const handleSortAZ = () => reorderManifestCatalogs([
        ...[...enabledCatalogs].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id)),
        ...disabledCatalogs
    ]);
    const handleSortZA = () => reorderManifestCatalogs([
        ...[...enabledCatalogs].sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id)),
        ...disabledCatalogs
    ]);

    // "Add Catalog" candidates: disabled catalog IDs + CATALOG_FALLBACKS IDs not already in list
    const existingIds = useMemo(() => new Set(catalogs.map(c => c.id)), [catalogs]);
    const customNames: Record<string, string> = useMemo(() => currentValues["custom_catalog_names"] || {}, [currentValues]);

    const addCandidates = useMemo(() => {
        // 1. Disabled catalogs (re-enable)
        const fromDisabled = disabledCatalogs.map(c => ({
            id: c.id,
            name: resolveCatalogName(c.id, customNames) || c.name || c.id,
            action: 'reenable' as const,
            catalog: c,
            originalCatalog: c, // Stash original catalog for re-enabling
        }));

        // 2. Entirely new catalogs from CATALOG_FALLBACKS not already present
        // Strip out 'movie:' or 'series:' from existing IDs for accurate duplicate checking
        const existingBaseIds = new Set(Array.from(existingIds).map(stripCatalogTypePrefix));

        const allFallbacks: Record<string, string | CatalogFallback> = { ...CATALOG_FALLBACKS, ...customFallbacks as Record<string, string | CatalogFallback> };
        const fromFallbacks = Object.entries(allFallbacks)
            .filter(([id]) => !existingBaseIds.has(stripCatalogTypePrefix(id)))
            .map(([id, fallback]) => {
                const name = typeof fallback === 'string' ? fallback : fallback.name;
                const displayName = customNames[id] || name;

                let finalId = id;
                // Prepend "movie:", "series:" or "all:" since Omni format requires it
                if (!id.includes(':')) {
                    const explicitType = (fallback && typeof fallback !== 'string') ? fallback.type : undefined;
                    finalId = ensureCatalogPrefix(id, displayName, explicitType);
                }

                return {
                    id: finalId,
                    name: displayName,
                    action: 'add' as const,
                    catalog: null,
                };
            });

        return [...fromDisabled, ...fromFallbacks];
    }, [disabledCatalogs, existingIds, customNames, customFallbacks]);

    const filteredAddCandidates = useMemo(() => {
        if (!addSearch) return addCandidates;
        const q = addSearch.toLowerCase();
        return addCandidates.filter(c =>
            c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
    }, [addCandidates, addSearch]);

    const groupedAddCandidates = useMemo(() => {
        const groups: Record<string, typeof filteredAddCandidates> = {
            "Other": [],
        };
        filteredAddCandidates.forEach(c => {
            const match = c.name.match(/^\[(.*?)\]\s*(.*)$/);
            if (match) {
                const category = match[1];
                const cleanName = match[2];
                if (!groups[category]) groups[category] = [];
                groups[category].push({ ...c, name: cleanName });
            } else {
                groups["Other"].push(c);
            }
        });

        const sortedCategories = Object.keys(groups)
            .filter(k => k !== "Other")
            .sort((a, b) => a.localeCompare(b));
        if (groups["Other"].length > 0) {
            sortedCategories.push("Other");
        }

        return sortedCategories.map(category => ({
            category,
            items: groups[category],
        }));
    }, [filteredAddCandidates]);

    const addCandidatesById = useMemo(() => {
        return new Map(addCandidates.map(candidate => [candidate.id, candidate]));
    }, [addCandidates]);

    const resetAddSelectionUi = () => {
        setAddSearch("");
        setPendingAddSelections(new Set());
    };

    const togglePendingSelection = (candidateId: string) => {
        setPendingAddSelections(prev => {
            const next = new Set(prev);
            if (next.has(candidateId)) {
                next.delete(candidateId);
            } else {
                next.add(candidateId);
            }
            return next;
        });
    };

    const handleAddCatalog = (cat: (typeof addCandidates)[number]) => {
        const cleanName = stripCatalogCategoryPrefix(cat.name || "");

        if (cat.action === 'reenable') {
            const patch: Partial<ManifestCatalog> = {
                enabled: true,
                showInHome: true,
                // Restore any original metadata if we stashed it
                metadata: { ...(cat.originalCatalog?.metadata || {}) }
            };

            if (cleanName && cleanName !== (cat.originalCatalog?.name || cat.name)) {
                patch.name = cleanName;
            }

            updateCatalogField(cat.id, patch);
        } else {
            addManifestCatalog({ id: cat.id, name: cleanName || cat.name, enabled: true });
        }

        if (cleanName && cleanName !== cat.id) {
            updateValue(["custom_catalog_names", cat.id], cleanName);
        }
    };

    const handleDeleteAllDisabled = () => {
        const disabledIds = new Set(disabledCatalogs.map(c => c.id));
        reorderManifestCatalogs(catalogs.filter(c => !disabledIds.has(c.id)));
        setShowDisabled(false);
    };

    const handleBatchImport = () => {
        if (pendingAddSelections.size === 0) return;

        pendingAddSelections.forEach(candidateId => {
            const candidate = addCandidatesById.get(candidateId);
            if (!candidate) return;
            handleAddCatalog(candidate);
        });

        setIsAddDialogOpen(false);
        resetAddSelectionUi();
    };

    return (
        <div className="space-y-4 max-w-full overflow-x-hidden">
            <div className={cn(editorSurface.card, "overflow-hidden")}>
                {/* Unified Toolbar */}
                <div className={cn(editorSurface.toolbar, "sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-none border-x-0 border-t-0 p-3")}>
                    {/* Add Catalog */}
                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={(open) => {
                            setIsAddDialogOpen(open);
                            if (!open) resetAddSelectionUi();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="h-9 px-3 font-bold bg-primary hover:bg-primary/92 text-primary-foreground shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Add Catalog
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            onOpenAutoFocus={(e) => {
                                e.preventDefault();
                                focusSearchInput(addSearchInputRef.current);
                                window.setTimeout(() => focusSearchInput(addSearchInputRef.current), 50);
                            }}
                            className={cn(editorLayout.dialogContent, "p-0 sm:max-w-[520px] sm:max-h-[90dvh]")}
                        >
                            <DialogHeader className="shrink-0 border-b border-border/60 p-4 pb-3">
                                <DialogTitle>Add Catalog</DialogTitle>
                                <DialogDescription className="text-sm text-foreground/60">
                                    Select one or more catalogs to import.
                                </DialogDescription>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/70" />
                                    <Input
                                        ref={addSearchInputRef}
                                        placeholder="Search by name or ID..."
                                        value={addSearch}
                                        onChange={e => setAddSearch(e.target.value)}
                                        className={cn(editorSurface.field, "pl-8 h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-ring/50")}
                                    />
                                </div>
                            </DialogHeader>

                            <div className={cn(editorSurface.overlayList, "flex-1 overflow-y-auto rounded-md border-y border-border/50 px-4 pb-4 min-h-[180px]")}>
                                {groupedAddCandidates.length === 0 ? (
                                    <p className="text-sm text-foreground/70 italic p-4">No catalogs found.</p>
                                ) : (
                                    <div className="space-y-1 pb-2 pt-4">
                                        {groupedAddCandidates.map(group => (
                                            <div key={group.category}>
                                                <div className={cn(editorSurface.sticky, "sticky top-0 py-2.5 z-20 mb-2 ml-[-1rem] w-[calc(100%+2rem)] px-4")}>
                                                    <h5 className="text-xs font-bold text-foreground/50 uppercase tracking-[0.2em]">{group.category}</h5>
                                                </div>
                                                {group.items.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-start gap-2.5 pl-2 py-2 sm:py-1.5 hover:bg-primary/10 dark:hover:bg-primary/16 rounded-sm transition-colors group/candidate"
                                                    >
                                                        <Checkbox
                                                            id={`add-cat-${c.id}`}
                                                            checked={pendingAddSelections.has(c.id)}
                                                            onCheckedChange={() => togglePendingSelection(c.id)}
                                                            className="mt-0.5 border-border data-[state=unchecked]:hover:border-primary/70 data-[state=unchecked]:hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4 shrink-0"
                                                        />
                                                        <label
                                                            htmlFor={`add-cat-${c.id}`}
                                                            className="flex-1 min-w-0 cursor-pointer select-none flex flex-col gap-0.5 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(120px,34%)] sm:items-center sm:gap-2.5"
                                                        >
                                                            <p className={`text-sm leading-snug transition-colors truncate min-w-0 ${pendingAddSelections.has(c.id) ? "text-primary dark:text-primary font-semibold" : "text-foreground"}`}>
                                                                {c.name}
                                                            </p>
                                                            <p className={`text-[11px] sm:text-xs font-mono font-normal tracking-tight truncate text-left sm:text-right min-w-0 ${pendingAddSelections.has(c.id) ? "text-primary/70 dark:text-primary/70" : "text-foreground/45 sm:text-foreground/24"}`}>
                                                                {c.id}
                                                            </p>
                                                        </label>
                                                        {c.action === 'reenable' && (
                                                            <Badge variant="outline" className="text-xs h-5 px-1.5 border-border text-foreground/70 shrink-0 self-center">
                                                                disabled
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="mt-0 shrink-0 flex flex-col gap-3 border-t border-border/50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-foreground/70 sm:order-1">
                                    {pendingAddSelections.size} selected
                                </p>
                                <div className="flex w-full sm:w-auto gap-2 sm:order-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            resetAddSelectionUi();
                                        }}
                                        className={cn("flex-1 sm:flex-none", editorAction.secondary)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleBatchImport}
                                        disabled={pendingAddSelections.size === 0}
                                        className={cn("flex-1 sm:flex-none", editorAction.primary)}
                                    >
                                        Import ({pendingAddSelections.size})
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="w-px h-5 bg-border mx-1" />
                    <Button variant="outline" size="sm" onClick={handleSortAZ} className="h-8 text-xs border-border hover:bg-muted/80 text-foreground/80 hover:text-foreground">
                        <ArrowDownAZ className="w-4 h-4 mr-1" /> A-Z
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSortZA} className="h-8 text-xs border-border hover:bg-muted/80 text-foreground/80 hover:text-foreground">
                        <ArrowUpZA className="w-4 h-4 mr-1" /> Z-A
                    </Button>
                </div>

                <div className="p-3">
                    {/* Sortable list */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={() => setEditingCatalogId(null)}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={enabledIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-1 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                                {enabledCatalogs.length === 0 ? (
                                    <div className={cn(editorSurface.inset, "text-center py-10 border-dashed flex flex-col items-center justify-center gap-3")}>
                                        <div className="p-4 rounded-full border border-white/10 bg-white/[0.04] dark:bg-white/[0.04]">
                                            <ListX className="w-8 h-8 text-foreground/45" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-foreground">No Enabled Catalogs</p>
                                            <p className="text-xs text-foreground/70 max-w-[280px] leading-relaxed mx-auto">
                                                Add a catalog using the button above or enable existing ones.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    enabledCatalogs.map(cat => (
                                        <SortableCatalogItem
                                            key={cat.id}
                                            catalog={cat}
                                            currentValues={currentValues}
                                            isLandscape={catalogListHasId(landscapeList, cat.id)}
                                            isSmall={catalogListHasId(smallList, cat.id)}
                                            isSmallTopRow={catalogListHasId(smallTopRowList, cat.id)}
                                            isRandom={catalogListHasId(randomizedList, cat.id)}
                                            isPinned={catalogListHasId(pinnedList, cat.id)}
                                            isEditingName={activeEditingCatalogId === cat.id}
                                            onStartEditingName={() => setEditingCatalogId(cat.id)}
                                            onStopEditingName={() => setEditingCatalogId(prev => (prev === cat.id ? null : prev))}
                                            onUpdateField={patch => updateCatalogField(cat.id, patch)}
                                            onUpdateLandscape={v => handleUpdateLandscape(cat.id, v)}
                                            onUpdateSmall={v => handleUpdateSmall(cat.id, v)}
                                            onUpdateSmallTopRow={v => handleUpdateSmallTopRow(cat.id, v)}
                                            onUpdateRandom={v => handleUpdateRandomize(cat.id, v)}
                                            onUpdatePinned={v => handleUpdatePinned(cat.id, v)}
                                            onRemove={() => removeManifestCatalog(cat.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Disabled section */}
            {disabledCatalogs.length > 0 && (
                <div className={cn(editorSurface.card, "rounded-lg overflow-hidden")}>
                    <div className="flex items-center w-full px-4 py-1.5 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group/header">
                        <button
                            className="flex-1 flex items-center justify-between text-xs text-foreground/70 py-1"
                            onClick={() => setShowDisabled(p => !p)}
                        >
                            <span className="font-semibold uppercase tracking-wider">Disabled Catalogs ({disabledCatalogs.length})</span>
                            {showDisabled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-2" />
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-7 px-2 text-[10px] font-bold uppercase tracking-wider", editorHover.iconDanger)}
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete All
                                </Button>
                            </DialogTrigger>
                            <DialogContent className={cn(editorSurface.card, "max-w-[400px] border-none shadow-2xl p-0 overflow-hidden")}>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-bold text-foreground">Delete All Disabled</DialogTitle>
                                            <DialogDescription className="text-xs text-foreground/60">This action cannot be undone.</DialogDescription>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-foreground/80 leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/5">
                                        Are you sure you want to permanently remove all <span className="font-bold text-red-400">{disabledCatalogs.length}</span> disabled and orphaned catalogs from your configuration?
                                    </p>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsDeleteDialogOpen(false)}
                                            className={cn("flex-1 h-10 text-xs font-semibold border-border hover:bg-muted", editorAction.secondary)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => {
                                                handleDeleteAllDisabled();
                                                setIsDeleteDialogOpen(false);
                                            }}
                                            className={cn("flex-1 h-10 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white hover:bg-red-600 border border-red-500/10 hover:border-red-600", editorAction.danger)}
                                        >
                                            Delete All
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {showDisabled && (
                        <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {disabledCatalogs.map(cat => (
                                <div key={cat.id} className={cn(editorSurface.inset, "flex items-center gap-3 p-2.5 border-dashed rounded-lg")}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground/70 truncate">{cat.name || cat.id}</p>
                                        <p className="text-xs text-foreground font-mono truncate">{cat.id}</p>
                                    </div>
                                    <Button
                                        variant="outline" size="sm"
                                        className="h-7 text-xs border-border text-foreground/80 hover:bg-muted shrink-0"
                                        onClick={() => updateCatalogField(cat.id, { enabled: true })}
                                    >
                                        Enable
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className={cn("h-7 w-7 shrink-0", editorHover.iconDanger)}
                                        title="Remove permanently from config"
                                        onClick={() => reorderManifestCatalogs(catalogs.filter(c => c.id !== cat.id))}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

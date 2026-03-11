"use client";

import React, { useState, useMemo, useEffect } from "react";
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
    DropdownMenuItem,
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
import { CATALOG_FALLBACKS } from "@/lib/catalog-fallbacks";
import { resolveCatalogName } from "@/lib/utils";
import { GripVertical, Eye, EyeOff, Trash2, ArrowDownAZ, ArrowUpZA, Search, Settings2, Image, Monitor, Shuffle, LayoutGrid, Star, ChevronDown, ChevronUp, Plus, Maximize, Pencil, ListX, Pin } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface ManifestCatalog {
    id: string;
    name: string;
    type?: string;
    enabled: boolean;
    showInHome: boolean;
    source?: string;
    displayType?: string;
    randomizePerPage?: boolean;
    metadata?: { itemCount?: number;[k: string]: any };
    _synthetic?: boolean;
    [key: string]: any;
}

// ─── Sortable Item ───────────────────────────────────────────────────────────
function SortableCatalogItem({
    catalog,
    isLandscape,
    isSmall,
    isSmallTopRow,
    isRandom,
    isPinned,
    onUpdateField,
    onUpdateLandscape,
    onUpdateSmall,
    onUpdateSmallTopRow,
    onUpdateRandom,
    onUpdatePinned,
    onRemove,
}: {
    catalog: ManifestCatalog;
    isLandscape: boolean;
    isSmall: boolean;
    isSmallTopRow: boolean;
    isRandom: boolean;
    isPinned: boolean;
    onUpdateField: (patch: Record<string, any>) => void;
    onUpdateLandscape: (v: boolean) => void;
    onUpdateSmall: (v: boolean) => void;
    onUpdateSmallTopRow: (v: boolean) => void;
    onUpdateRandom: (v: boolean) => void;
    onUpdatePinned: (v: boolean) => void;
    onRemove: () => void;
}) {
    const isActive = catalog.enabled !== false || catalog.showInHome === true || isPinned;

    const {
        attributes, listeners, setNodeRef,
        transform, transition, isDragging,
    } = useSortable({ id: catalog.id, disabled: !isActive });

    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : 1 };

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(catalog.name || catalog.id);

    const submitName = () => {
        setIsEditingName(false);
        const t = editName.trim();
        if (t && t !== catalog.name) onUpdateField({ name: t });
        else setEditName(catalog.name || catalog.id);
    };

    const itemCount = catalog.metadata?.itemCount;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-colors
                ${isDragging ? "opacity-50 border-blue-500 shadow-xl" : "border-border hover:border-border/80"}
                ${!isActive ? "opacity-60 border-dashed border-border/50 bg-card/60" : ""}
            `}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab shrink-0 p-2 rounded-md transition-colors ${isActive ? "text-foreground/70 hover:text-foreground hover:bg-muted" : "text-foreground pointer-events-none"}`}
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
                            onKeyDown={e => e.key === 'Enter' && submitName()}
                            className="h-10 sm:h-8 text-base sm:text-sm bg-background border-blue-500 font-bold"
                        />
                    ) : (
                        <div className="flex flex-col min-w-0">
                            <h4
                                className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:underline underline-offset-4 decoration-blue-500/40 max-w-full group/name ${isActive ? "text-foreground" : "text-foreground/70"}`}
                                onClick={() => setIsEditingName(true)}
                            >
                                <span className="truncate">{catalog.name || catalog.id}</span>
                                {catalog.showInHome && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                                <Pencil className="w-3 h-3 text-blue-400 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                            </h4>
                            <p className="text-[11px] text-foreground/70 truncate font-mono mt-0.5">{catalog.id}</p>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 shrink-0 flex-wrap sm:justify-end">
                    {!catalog.enabled && (
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background text-foreground/70 border-border">Hidden</Badge>
                    )}
                    {!isActive && (
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background text-foreground/70 border-border border-dashed">Disabled</Badge>
                    )}
                    {isPinned && (
                        <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">Header</Badge>
                    )}
                    
                    {/* Top Row Group */}
                    <div className="flex items-center gap-1">
                        {isSmall && (
                            <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">Small</Badge>
                        )}
                        {catalog.showInHome && (
                            <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isSmallTopRow ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'}`}>
                                {isSmallTopRow ? 'Top Row (small)' : 'Top Row'}
                            </Badge>
                        )}
                        {itemCount && catalog.showInHome && (
                            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground/70 border-none">{itemCount}</Badge>
                        )}
                    </div>

                    {/* Shelf Specifics */}
                    {isLandscape && (
                        <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">Wide</Badge>
                    )}
                    {isRandom && (
                        <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground/70 border-none">Rand</Badge>
                    )}
                </div>
            </div>

            {/* Settings */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-muted shrink-0">
                        <Settings2 className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-popover border-border text-popover-foreground shadow-2xl">

                    <DropdownMenuLabel className="text-[10px] uppercase text-foreground/70 font-bold">Visibility</DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={catalog.enabled}
                        onCheckedChange={v => onUpdateField({ enabled: v })}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        {catalog.enabled ? <Eye className="w-3.5 h-3.5 mr-2 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 mr-2 text-foreground/70" />}
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
                        <Star className="w-3.5 h-3.5 mr-2 text-amber-400" />
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
                    <DropdownMenuLabel className="text-[10px] uppercase text-foreground/70 font-bold">Layout</DropdownMenuLabel>

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
                            <DropdownMenuLabel className="text-[10px] uppercase text-foreground/70 font-bold">Top Row Options</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={isSmallTopRow}
                                onCheckedChange={onUpdateSmallTopRow}
                                onSelect={(e) => e.preventDefault()}
                                className="text-xs"
                            >
                                <LayoutGrid className="w-3.5 h-3.5 mr-2 text-amber-500" />
                                Small Top Row
                            </DropdownMenuCheckboxItem>
                            <div className="px-2 py-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-foreground/70 font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400" /> Top Row Limit
                                </span>
                                <Select
                                    value={itemCount ? String(itemCount) : ""}
                                    onValueChange={val => onUpdateField({ metadata: { ...(catalog.metadata || {}), itemCount: parseInt(val, 10) } })}
                                >
                                    <SelectTrigger className="h-6 w-16 text-[10px] bg-background border-border focus:ring-0 px-1">
                                        <SelectValue placeholder="–" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                        {[10, 20, 30, 50].map(opt => (
                                            <SelectItem key={opt} value={String(opt)} className="text-[10px] focus:bg-accent">{opt}</SelectItem>
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
                className="h-8 w-8 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 shrink-0"
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
        originalConfig,
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
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [addSearch, setAddSearch] = useState("");
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 639px)");
        const handleMediaChange = () => setIsMobileView(media.matches);
        handleMediaChange();
        if (typeof media.addEventListener === "function") {
            media.addEventListener("change", handleMediaChange);
            return () => media.removeEventListener("change", handleMediaChange);
        }
        media.addListener(handleMediaChange);
        return () => media.removeListener(handleMediaChange);
    }, []);

    // Landscape is stored in currentValues.landscape_catalogs (side-array)
    const landscapeList: string[] = useMemo(() => currentValues["landscape_catalogs"] || [], [currentValues]);
    const handleUpdateLandscape = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["landscape_catalogs"]) ? currentValues["landscape_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
        updateValue(["landscape_catalogs"], next);
    };

    // Small posters stored in currentValues.small_catalogs (side-array)
    const smallList: string[] = useMemo(() => currentValues["small_catalogs"] || [], [currentValues]);
    const handleUpdateSmall = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["small_catalogs"]) ? currentValues["small_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
        updateValue(["small_catalogs"], next);
    };

    // Small Top Row stored in currentValues.small_toprow_catalogs (NOTE: no underscore after small)
    const smallTopRowList: string[] = useMemo(() => currentValues["small_toprow_catalogs"] || [], [currentValues]);
    const handleUpdateSmallTopRow = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["small_toprow_catalogs"]) ? currentValues["small_toprow_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
        updateValue(["small_toprow_catalogs"], next);
    };

    const randomizedList: string[] = useMemo(() => currentValues["randomized_catalogs"] || [], [currentValues]);
    const handleUpdateRandomize = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["randomized_catalogs"]) ? currentValues["randomized_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
        updateValue(["randomized_catalogs"], next);
    };

    // Pinned (Header) stored in currentValues.starred_catalogs
    const pinnedList: string[] = useMemo(() => currentValues["starred_catalogs"] || [], [currentValues]);
    const handleUpdatePinned = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["starred_catalogs"]) ? currentValues["starred_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
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
    const enabledCatalogs = useMemo(() => catalogs.filter(c => c.enabled !== false || c.showInHome === true || pinnedList.includes(c.id)), [catalogs, pinnedList]);
    const disabledCatalogs = useMemo(() => catalogs.filter(c => c.enabled === false && c.showInHome !== true && !pinnedList.includes(c.id)), [catalogs, pinnedList]);



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
        const existingBaseIds = new Set(Array.from(existingIds).map(id => id.replace(/^(movie:|series:)/, '')));

        const allFallbacks = { ...CATALOG_FALLBACKS, ...customFallbacks };

        const fromFallbacks = Object.entries(allFallbacks)
            .filter(([id]) => !existingBaseIds.has(id.replace(/^(movie:|series:)/, '')))
            .map(([id, name]) => {
                const displayName = customNames[id] || name;

                let finalId = id;
                // Prepend "movie:" or "series:" since Omni format requires it
                if (!id.includes(':')) {
                    const lowerName = displayName.toLowerCase();
                    let typePrefix = "movie:"; // default
                    if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
                        typePrefix = "series:";
                    }
                    finalId = `${typePrefix}${id}`;
                }

                return {
                    id: finalId,
                    name: displayName,
                    action: 'add' as const,
                    catalog: null,
                };
            });

        return [...fromDisabled, ...fromFallbacks];
    }, [disabledCatalogs, existingIds, customNames, catalogs, customFallbacks]);

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

    const handleAddCatalog = (cat: typeof addCandidates[0]) => {
        if (cat.action === 'reenable') {
            updateCatalogField(cat.id, {
                enabled: true,
                showInHome: true,
                // Restore any original metadata if we stashed it
                metadata: { ...(cat.originalCatalog?.metadata || {}) }
            });
        } else {
            addManifestCatalog({ id: cat.id, name: cat.name, enabled: true });
        }
    };

    return (
        <div className="space-y-4 max-w-full overflow-x-hidden">
            <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
                {/* Unified Toolbar */}
                <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-card/95 backdrop-blur-md p-3 border-b border-border/80 shadow-sm">
                    {/* Add Catalog */}
                    <DropdownMenu open={isAddMenuOpen} onOpenChange={open => {
                        setIsAddMenuOpen(open);
                        if (!open) setAddSearch("");
                    }}>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 px-3 shadow-lg shadow-blue-500/20">
                                <Plus className="w-4 h-4 mr-1.5" /> Add Catalog
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[min(92vw,28rem)] sm:w-80 bg-popover border-border text-popover-foreground shadow-2xl p-0 flex flex-col overflow-hidden"
                            style={{
                                maxHeight: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 5rem)",
                            }}
                        >
                            <div className="p-3 border-b border-border bg-card space-y-2 shrink-0">
                                <h4 className="text-[10px] uppercase font-bold text-foreground/70 flex justify-between">
                                    <span>Add Catalog</span>
                                    <span className="text-foreground/70/80">{filteredAddCandidates.length} available</span>
                                </h4>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/70" />
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={addSearch}
                                        onChange={e => setAddSearch(e.target.value)}
                                        className="h-9 sm:h-7 text-base sm:text-[11px] pl-7 bg-background border-border focus-visible:ring-blue-600"
                                        onKeyDown={e => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain pb-[calc(1rem+env(safe-area-inset-bottom))]">
                                {filteredAddCandidates.length === 0 ? (
                                    <p className="text-[10px] text-foreground/70 p-4 text-center">No catalogs found.</p>
                                ) : (
                                    (() => {
                                        const groups: Record<string, typeof filteredAddCandidates> = {
                                            "Other": []
                                        };
                                        filteredAddCandidates.forEach(c => {
                                            const match = c.name.match(/^\[(.*?)\]\s*(.*)$/);
                                            if (match) {
                                                const category = match[1];
                                                const cleanName = match[2];
                                                if (!groups[category]) groups[category] = [];
                                                // Provide the cleaned name for display
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

                                        return sortedCategories.map(category => (
                                            <div key={category} className="mb-2 last:mb-0">
                                                 <div className="sticky top-0 bg-popover/95 backdrop-blur-sm py-1.5 px-3 z-[60] border-b border-border/80 mb-1 -mx-0">
                                                     <h5 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{category}</h5>
                                                 </div>
                                                <div className="flex flex-col gap-0.5 px-1">
                                                    {groups[category].map(c => (
                                                        <DropdownMenuItem
                                                            key={c.id}
                                                            onSelect={() => handleAddCatalog(c)}
                                                            className="flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{c.name}</p>
                                                                <p className="text-[9px] text-foreground/70 font-mono truncate">{c.id}</p>
                                                            </div>
                                                            {c.action === 'reenable' && (
                                                                <Badge variant="outline" className="text-[8px] h-4 px-1 border-border text-foreground/70 shrink-0 self-center">disabled</Badge>
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-5 bg-border mx-1" />
                    <Button variant="outline" size="sm" onClick={handleSortAZ} className="h-8 text-xs border-border hover:bg-muted text-foreground/70 hover:text-foreground">
                        <ArrowDownAZ className="w-4 h-4 mr-1" /> A-Z
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSortZA} className="h-8 text-xs border-border hover:bg-muted text-foreground/70 hover:text-foreground">
                        <ArrowUpZA className="w-4 h-4 mr-1" /> Z-A
                    </Button>
                </div>

                <div className="p-3">
                    {/* Sortable list */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={enabledIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-1 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                                {enabledCatalogs.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-border/80 rounded-2xl bg-background/20 flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                                            <ListX className="w-8 h-8 text-blue-500/60" />
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
                                            isLandscape={landscapeList.includes(cat.id)}
                                            isSmall={smallList.includes(cat.id)}
                                            isSmallTopRow={smallTopRowList.includes(cat.id)}
                                            isRandom={randomizedList.includes(cat.id)}
                                            isPinned={pinnedList.includes(cat.id)}
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
                <div className="border border-border rounded-lg overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-foreground/70 hover:bg-muted/50 transition-colors"
                        onClick={() => setShowDisabled(p => !p)}
                    >
                        <span className="font-semibold uppercase tracking-wider">Disabled Catalogs ({disabledCatalogs.length})</span>
                        {showDisabled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showDisabled && (
                        <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {disabledCatalogs.map(cat => (
                                <div key={cat.id} className="flex items-center gap-3 p-2.5 bg-card/50 border border-border border-dashed rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground/70 truncate">{cat.name || cat.id}</p>
                                        <p className="text-[11px] text-foreground font-mono truncate">{cat.id}</p>
                                    </div>
                                    <Button
                                        variant="outline" size="sm"
                                        className="h-7 text-xs border-border text-foreground/70 hover:bg-muted shrink-0"
                                        onClick={() => updateCatalogField(cat.id, { enabled: true })}
                                    >
                                        Enable
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 shrink-0"
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

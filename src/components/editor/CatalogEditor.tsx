"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
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
import { GripVertical, Eye, EyeOff, Trash2, ArrowDownAZ, ArrowUpZA, Search, Settings2, Image, Monitor, Shuffle, LayoutGrid, Star, ChevronDown, ChevronUp, Plus, Maximize, Pencil } from "lucide-react";

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
    onUpdateField,
    onUpdateLandscape,
    onUpdateSmall,
    onUpdateSmallTopRow,
    onUpdateRandom,
    onRemove,
}: {
    catalog: ManifestCatalog;
    isLandscape: boolean;
    isSmall: boolean;
    isSmallTopRow: boolean;
    isRandom: boolean;
    onUpdateField: (patch: Record<string, any>) => void;
    onUpdateLandscape: (v: boolean) => void;
    onUpdateSmall: (v: boolean) => void;
    onUpdateSmallTopRow: (v: boolean) => void;
    onUpdateRandom: (v: boolean) => void;
    onRemove: () => void;
}) {
    const isActive = catalog.enabled !== false || catalog.showInHome === true;

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
                className={`cursor-grab shrink-0 ${isActive ? "text-muted-foreground hover:text-white" : "text-foreground pointer-events-none"}`}
            >
                <GripVertical className="h-4 w-4" />
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
                            autoFocus
                            className="h-8 text-sm bg-background border-blue-500"
                        />
                    ) : (
                        <div className="flex flex-col min-w-0">
                            <h4
                                className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:underline underline-offset-4 decoration-blue-500/40 w-fit max-w-full group/name ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                                onClick={() => setIsEditingName(true)}
                            >
                                <span className="truncate">{catalog.name || catalog.id}</span>
                                {catalog.showInHome && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                                <Pencil className="w-3 h-3 text-blue-400 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5 w-fit">{catalog.id}</p>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1 shrink-0 flex-wrap sm:justify-end">
                    {!catalog.enabled && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background text-muted-foreground border-border">Hidden</Badge>
                    )}
                    {!isActive && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background text-muted-foreground border-border border-dashed">Disabled</Badge>
                    )}
                    {catalog.showInHome && (
                        <Badge className={`text-[9px] h-4 px-1 border ${isSmallTopRow ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'}`}>
                            {isSmallTopRow ? 'Top Row (small)' : 'Top Row'}
                        </Badge>
                    )}
                    {isLandscape && (
                        <Badge className="text-[9px] h-4 px-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">Wide</Badge>
                    )}
                    {isSmall && (
                        <Badge className="text-[9px] h-4 px-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">Small</Badge>
                    )}
                    {isRandom && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-muted text-muted-foreground border-none">Rand</Badge>
                    )}
                    {itemCount && catalog.showInHome && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-muted text-muted-foreground border-none">{itemCount}</Badge>
                    )}
                </div>
            </div>

            {/* Settings */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0">
                        <Settings2 className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-popover border-border text-popover-foreground shadow-2xl">

                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold">Visibility</DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={catalog.enabled}
                        onCheckedChange={v => onUpdateField({ enabled: v })}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        {catalog.enabled ? <Eye className="w-3.5 h-3.5 mr-2 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 mr-2 text-muted-foreground" />}
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

                    <DropdownMenuSeparator className="bg-muted" />
                    <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold">Layout</DropdownMenuLabel>

                    <DropdownMenuCheckboxItem
                        checked={isLandscape}
                        onCheckedChange={onUpdateLandscape}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Maximize className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                        Landscape
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={isSmall}
                        onCheckedChange={onUpdateSmall}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <LayoutGrid className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                        Small Posters
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        checked={isRandom}
                        onCheckedChange={onUpdateRandom}
                        onSelect={(e) => e.preventDefault()}
                        className="text-xs"
                    >
                        <Shuffle className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                        Randomize Order
                    </DropdownMenuCheckboxItem>

                    {catalog.showInHome && (
                        <>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold">Top Row Options</DropdownMenuLabel>
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
                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
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
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
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
    const [addSearch, setAddSearch] = useState("");

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

    // Randomize stored in currentValues.randomized_catalogs (side-array — NOT randomizePerPage field)
    const randomizedList: string[] = useMemo(() => currentValues["randomized_catalogs"] || [], [currentValues]);
    const handleUpdateRandomize = (catalogId: string, v: boolean) => {
        const current: string[] = Array.isArray(currentValues["randomized_catalogs"]) ? currentValues["randomized_catalogs"] : [];
        const next = v ? [...new Set([...current, catalogId])] : current.filter(id => id !== catalogId);
        updateValue(["randomized_catalogs"], next);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Split catalogs: active if enabled in shelf OR shown in home
    const enabledCatalogs = useMemo(() => catalogs.filter(c => c.enabled !== false || c.showInHome === true), [catalogs]);
    const disabledCatalogs = useMemo(() => catalogs.filter(c => c.enabled === false && c.showInHome !== true), [catalogs]);



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

    const handleAddCatalog = (e: Event, cat: typeof addCandidates[0]) => {
        e.preventDefault(); // Prevent dropdown from closing

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
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border">
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleSortAZ} className="h-8 text-xs border-border hover:bg-muted text-muted-foreground hover:text-foreground">
                    <ArrowDownAZ className="w-4 h-4 mr-1" /> A-Z
                </Button>
                <Button variant="outline" size="sm" onClick={handleSortZA} className="h-8 text-xs border-border hover:bg-muted text-muted-foreground hover:text-foreground">
                    <ArrowUpZA className="w-4 h-4 mr-1" /> Z-A
                </Button>
                <div className="w-px h-5 bg-border" />

                {/* Add Catalog */}
                <DropdownMenu open={isAddMenuOpen} onOpenChange={open => {
                    setIsAddMenuOpen(open);
                    if (!open) setAddSearch("");
                }}>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white border-none shadow shadow-blue-500/20">
                            <Plus className="w-4 h-4 mr-1" /> Add Catalog
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-popover border-border text-popover-foreground shadow-2xl p-0">
                        <div className="p-3 border-b border-border bg-card space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                                <span>Add Catalog</span>
                                <span className="text-muted-foreground/80">{filteredAddCandidates.length} available</span>
                            </h4>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or ID..."
                                    value={addSearch}
                                    onChange={e => setAddSearch(e.target.value)}
                                    className="h-7 text-[11px] pl-7 bg-background border-border focus-visible:ring-blue-600"
                                    autoFocus
                                    onKeyDown={e => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto p-1 pt-0 custom-scrollbar">
                            {filteredAddCandidates.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground p-4 text-center">No catalogs found.</p>
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
                                            <div className="sticky top-0 bg-popover py-1.5 px-3 z-[60] border-b border-border/80 mb-1 -mx-1">
                                                <h5 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{category}</h5>
                                            </div>
                                            <div className="flex flex-col gap-0.5 px-1">
                                                {groups[category].map(c => (
                                                    <DropdownMenuItem
                                                        key={c.id}
                                                        onSelect={(e) => handleAddCatalog(e, c)}
                                                        className="flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{c.name}</p>
                                                            <p className="text-[9px] text-muted-foreground font-mono truncate">{c.id}</p>
                                                        </div>
                                                        {c.action === 'reenable' && (
                                                            <Badge variant="outline" className="text-[8px] h-4 px-1 border-border text-muted-foreground shrink-0 self-center">disabled</Badge>
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
            </div>

            {/* Stats */}
            <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span>
                    <span className="text-foreground font-medium">{enabledCatalogs.length}</span> shown
                </span>
                <span>·</span>
                <span><span className="text-foreground font-medium">{enabledCatalogs.filter(c => c.showInHome).length}</span> in Top Row</span>
                <span>·</span>
                <span><span className="text-foreground">{landscapeList.length}</span> landscape</span>
                <span>·</span>
                <span>{disabledCatalogs.length} disabled</span>
            </div>

            {/* Sortable list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={enabledIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                        {enabledCatalogs.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-8 text-center">No enabled catalogs.</p>
                        ) : (
                            enabledCatalogs.map(cat => (
                                <SortableCatalogItem
                                    key={cat.id}
                                    catalog={cat}
                                    isLandscape={landscapeList.includes(cat.id)}
                                    isSmall={smallList.includes(cat.id)}
                                    isSmallTopRow={smallTopRowList.includes(cat.id)}
                                    isRandom={randomizedList.includes(cat.id)}
                                    onUpdateField={patch => updateCatalogField(cat.id, patch)}
                                    onUpdateLandscape={v => handleUpdateLandscape(cat.id, v)}
                                    onUpdateSmall={v => handleUpdateSmall(cat.id, v)}
                                    onUpdateSmallTopRow={v => handleUpdateSmallTopRow(cat.id, v)}
                                    onUpdateRandom={v => handleUpdateRandomize(cat.id, v)}
                                    onRemove={() => removeManifestCatalog(cat.id)}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Disabled section */}
            {disabledCatalogs.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
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
                                        <p className="text-sm text-muted-foreground truncate">{cat.name || cat.id}</p>
                                        <p className="text-[10px] text-foreground font-mono truncate">{cat.id}</p>
                                    </div>
                                    <Button
                                        variant="outline" size="sm"
                                        className="h-7 text-xs border-border text-muted-foreground hover:bg-muted shrink-0"
                                        onClick={() => updateCatalogField(cat.id, { enabled: true })}
                                    >
                                        Enable
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
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

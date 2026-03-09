"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, ArrowDownAZ, ArrowUpZA, ImageIcon, LinkIcon, ChevronRight, ChevronDown, RotateCcw, Search, Pin, PinOff, CheckSquare, Square, Layout } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { RenameGroupModal } from "./RenameGroupModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddToGroupModal } from "./AddToGroupModal";
import { ImportSetupModal } from "./ImportSetupModal";
import { TrashBin } from "./TrashBin";
import { formatDisplayName, resolveCatalogName, ensureCatalogPrefix } from "@/lib/utils";
import { CATALOG_FALLBACKS } from "@/lib/catalog-fallbacks";

import { Trash2, Plus, FolderPlus, UploadCloud, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";

// ----------------------------------------------------------------------
// 1. Sortable Catalog Node (Inside a Subgroup)
// ----------------------------------------------------------------------
function SortableCatalogNode({ id, onRemove }: { id: string, onRemove?: () => void }) {
    const { currentValues, updateValue } = useConfig();

    // Construct effective custom names (Config Custom Names > AIOMetadata > Default)
    const configCustomNames = currentValues["custom_catalog_names"] || {};
    let aioFallbacks: Record<string, string> = {};
    if (typeof window !== "undefined") {
        try {
            aioFallbacks = JSON.parse(localStorage.getItem("omni_custom_fallbacks") || "{}");
        } catch (e) { }
    }

    // Some IDs have prefixes like 'movie:mdblist.12306', AIOMetadata uses 'mdblist.12306'
    let baseId = id;
    if (id.includes(":")) {
        const parts = id.split(":");
        if (parts.length === 2 && ["movie", "series", "anime"].includes(parts[0])) {
            baseId = parts[1];
        } else if (id.startsWith("movie:trakt-list") || id.startsWith("series:trakt-list")) {
            // keep it if complex, or try to extract
        } else {
            // Fallback for generic prefix stripping if it matches common AIO formats
            baseId = parts.slice(1).join(":");
        }
    }
    // Specific match for AIO Trakt format if necessary (this is a best effort)
    const strippedTraktId = id.replace(/^(movie|series|anime):/, "");

    const customNameFromConfig = configCustomNames[id] || configCustomNames[baseId];
    const customNameFromAIO = aioFallbacks[id] || aioFallbacks[baseId] || aioFallbacks[strippedTraktId];

    let displayName = "";
    if (customNameFromConfig && customNameFromConfig.trim() !== "" && customNameFromConfig !== id) {
        displayName = formatDisplayName(customNameFromConfig);
    } else if (customNameFromAIO && customNameFromAIO.trim() !== "" && customNameFromAIO !== id) {
        displayName = formatDisplayName(customNameFromAIO);
    } else {
        // use standard resolveCatalogName mapped values or Fallbacks
        displayName = resolveCatalogName(id, {});
    }


    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-2.5 bg-background border border-border/60 rounded-lg mb-2 group/cat transition-all duration-200 hover:border-border hover:bg-muted shadow-sm ${isDragging ? "opacity-50 border-blue-500 z-50 shadow-2xl scale-[1.02]" : ""}`}
        >
            <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-md hover:bg-muted/80 transition-colors">
                <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                <p className="text-[12px] truncate font-semibold tracking-tight text-foreground">
                    {displayName}
                </p>
                {displayName !== id && (
                    <span className="hidden sm:inline-block text-[9px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-sm border border-border opacity-0 group-hover/cat:opacity-100 transition-opacity truncate max-w-[120px]">
                        {id}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. Sortable Subgroup Node containing Catalogs & URL
// ----------------------------------------------------------------------
function SortableSubgroupNode({ subgroupName, parentUUID, onUnassign, isExpanded: propIsExpanded, onToggle }: { subgroupName: string, parentUUID: string, onUnassign?: (name: string, parentId: string) => void, isExpanded?: boolean, onToggle?: () => void }) {
    const { originalConfig, currentValues, updateValue, renameCatalogGroup, removeCatalogGroup, unassignCatalogGroup, catalogs, customFallbacks, addManifestCatalog } = useConfig();

    // Sortable Hook for the subgroup itself
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subgroupName });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
    };

    // Subgroup state
    const catalogsList = currentValues.catalog_groups?.[subgroupName] || [];
    const imageUrl = currentValues.catalog_group_image_urls?.[subgroupName] || "";

    const [subgroupCatalogs, setSubgroupCatalogs] = useState<string[]>(catalogsList);
    const [urlInput, setUrlInput] = useState(imageUrl);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState("");

    const customNames: Record<string, string> = React.useMemo(() => currentValues["custom_catalog_names"] || {}, [currentValues]);
    const catalogOptions = React.useMemo(() => {
        const options: { id: string, name: string }[] = [];

        // 1. All existing catalogs not already in subgroupCatalogs
        const existingBaseIds = new Set<string>();
        for (const c of catalogs) {
            existingBaseIds.add(c.id.replace(/^(movie:|series:)/, ''));
            if (!subgroupCatalogs.includes(c.id)) {
                options.push({
                    id: c.id,
                    name: resolveCatalogName(c.id, customNames) || c.name || c.id
                });
            }
        }

        // 2. Fallbacks not already in subgroupCatalogs
        const allFallbacks = { ...CATALOG_FALLBACKS, ...customFallbacks };
        Object.entries(allFallbacks).forEach(([id, name]) => {
            if (!existingBaseIds.has(id.replace(/^(movie:|series:)/, ''))) {
                const displayName = customNames[id] || name;
                let finalId = id;
                if (!id.includes(':')) {
                    const lowerName = displayName.toLowerCase();
                    let typePrefix = "movie:"; // default
                    if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
                        typePrefix = "series:";
                    }
                    finalId = `${typePrefix}${id}`;
                }
                if (!subgroupCatalogs.includes(finalId)) {
                    options.push({
                        id: finalId,
                        name: displayName
                    });
                }
            }
        });

        // Sort options
        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [catalogs, customFallbacks, customNames, subgroupCatalogs]);

    const filteredCatalogs = React.useMemo(() => {
        if (!catalogSearch) return catalogOptions;
        const q = catalogSearch.toLowerCase();
        return catalogOptions.filter(c =>
            c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
    }, [catalogOptions, catalogSearch]);


    // Support controlled or uncontrolled expansion
    const [localExpanded, setLocalExpanded] = useState(false);
    const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localExpanded;
    const toggleExpanded = onToggle || (() => setLocalExpanded(!localExpanded));

    const parentName = currentValues.main_catalog_groups?.[parentUUID]?.name || "";
    const isLandscape = ["discover", "streaming services", "decades", "collection", "collections"].includes(parentName.toLowerCase());

    React.useEffect(() => {
        setSubgroupCatalogs(catalogsList);
        setUrlInput(imageUrl);
    }, [JSON.stringify(catalogsList), imageUrl]);

    const handleUrlBlur = () => {
        if (urlInput !== imageUrl) {
            updateValue(["catalog_group_image_urls", subgroupName], urlInput);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleCatalogDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroupCatalogs.indexOf(active.id as string);
            const newIndex = subgroupCatalogs.indexOf(over.id as string);
            const newArray = arrayMove(subgroupCatalogs, oldIndex, newIndex);
            setSubgroupCatalogs(newArray);
            updateValue(["catalog_groups", subgroupName], newArray);
        }
    };

    const handleAddCatalog = (e: any, catalogId: string) => {
        e.preventDefault();
        if (!catalogId.trim()) return;
        const name = resolveCatalogName(catalogId.trim(), currentValues.custom_catalog_names || {});
        const normalizedId = ensureCatalogPrefix(catalogId.trim(), name);

        const updated = [...subgroupCatalogs, normalizedId];
        setSubgroupCatalogs(updated);
        updateValue(["catalog_groups", subgroupName], updated);
    };

    return (
        <div ref={setNodeRef} style={style} className={`border border-border shadow-sm hover:shadow-md rounded-xl overflow-hidden mb-3 bg-card/40 backdrop-blur-sm transition-all hover:border-blue-500/30 group/subgroup ${isDragging ? "opacity-50 border-blue-500 scale-[1.01] shadow-2xl" : ""}`}>
            {/* Header: Drag Handle + Subgroup Name */}
            <div className={`flex items-center gap-3 p-3 bg-muted/40 backdrop-blur-sm border-border/40 ${isExpanded ? "border-b border-border/50" : ""}`}>
                <button {...attributes} {...listeners} className="cursor-grab hover:text-foreground text-muted-foreground p-1 rounded-md hover:bg-muted transition-colors">
                    <GripVertical className="h-4 w-4" />
                </button>
                <div
                    className="flex-1 font-semibold text-sm text-foreground cursor-pointer flex items-center select-none tracking-tight"
                    onClick={toggleExpanded}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />}
                    {formatDisplayName(subgroupName)}
                </div>
                <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setIsRenaming(true)} className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-md border border-transparent hover:border-border/50">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                        unassignCatalogGroup(subgroupName);
                        if (onUnassign) onUnassign(subgroupName, parentUUID);
                    }} className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <RenameGroupModal
                isOpen={isRenaming}
                onClose={() => setIsRenaming(false)}
                oldName={subgroupName}
                isMainGroup={false}
                onRename={(oldN, newN) => {
                    setIsRenaming(false);
                    renameCatalogGroup(oldN, newN);
                }}
            />

            {isExpanded && (
                <div className="p-4 space-y-5">
                    {/* Image URL Input */}
                    <div className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-border/60 shadow-inner">
                        {urlInput && urlInput.startsWith("http") ? (
                            <div className={`${isLandscape ? "h-10 w-16" : "h-14 w-10"} rounded-md shrink-0 overflow-hidden bg-muted border border-border/50 shadow-sm flex items-center justify-center`}>
                                <img
                                    src={urlInput}
                                    alt="Thumb"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Poster Image URL</Label>
                            <Input
                                placeholder="https://..."
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                                onBlur={handleUrlBlur}
                                className="h-8 text-xs bg-background border-border focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner transition-colors font-mono"
                            />
                        </div>
                    </div>

                    {/* Inner Sortable Catalogs */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Linked Catalogs</h5>
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">{subgroupCatalogs.length}</span>
                        </div>

                        {subgroupCatalogs.length === 0 ? (
                            <div className="text-center py-6 border border-dashed border-border/60 rounded-lg bg-background/30">
                                <p className="text-xs text-muted-foreground font-medium">No catalogs in this subgroup yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatalogDragEnd}>
                                    <SortableContext items={subgroupCatalogs} strategy={verticalListSortingStrategy}>
                                        {subgroupCatalogs.map(catId => (
                                            <SortableCatalogNode
                                                key={catId}
                                                id={catId}
                                                onRemove={() => {
                                                    const updated = subgroupCatalogs.filter(id => id !== catId);
                                                    setSubgroupCatalogs(updated);
                                                    updateValue(["catalog_groups", subgroupName], updated);
                                                }}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}

                        {/* Add New Catalog Dropdown Menu */}
                        <div className="mt-3">
                            <DropdownMenu open={isAddMenuOpen} onOpenChange={open => {
                                setIsAddMenuOpen(open);
                                if (!open) setCatalogSearch("");
                            }}>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="w-full justify-start text-xs border border-dashed border-border/60 bg-background/30 text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border transition-colors">
                                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Catalog...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 bg-popover border-border text-popover-foreground shadow-2xl p-0">
                                    <div className="p-3 border-b border-border bg-card space-y-2">
                                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                                            <span>Select Catalog</span>
                                            <span className="text-muted-foreground">{filteredCatalogs.length} available</span>
                                        </h4>
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name or ID..."
                                                value={catalogSearch}
                                                onChange={e => setCatalogSearch(e.target.value)}
                                                className="h-7 text-[11px] pl-7 bg-card border-border focus-visible:ring-blue-600"
                                                autoFocus
                                                onKeyDown={e => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto p-1 pt-0 custom-scrollbar">
                                        {filteredCatalogs.length === 0 ? (
                                            <p className="text-[10px] text-muted-foreground p-4 text-center">No catalogs found.</p>
                                        ) : (
                                            (() => {
                                                const groups: Record<string, typeof filteredCatalogs> = {
                                                    "Other": []
                                                };
                                                filteredCatalogs.forEach(c => {
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

                                                return sortedCategories.map(category => (
                                                    <div key={category} className="mb-2 last:mb-0">
                                                        <div className="sticky top-0 bg-card py-1.5 px-3 z-[60] border-b border-border/80 mb-1 -mx-1">
                                                            <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{category}</h5>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 px-1">
                                                            {groups[category].map(c => (
                                                                <DropdownMenuItem
                                                                    key={c.id}
                                                                    onSelect={(e) => handleAddCatalog(e, c.id)}
                                                                    className="flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                                                        <p className="text-[9px] text-muted-foreground font-mono truncate">{c.id}</p>
                                                                    </div>
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
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. Main Group View (Outer)
// ----------------------------------------------------------------------
function MainGroupNode({ uuid, name, subgroupNames, onUnassignSubgroup, onAddSubgroup }: { uuid: string, name: string, subgroupNames: string[], onUnassignSubgroup?: (name: string, parentId: string) => void, onAddSubgroup?: (uuid: string) => void }) {
    const { initialValues, currentValues, updateValue, renameMainCatalogGroup, removeMainCatalogGroup } = useConfig();
    const [isRenaming, setIsRenaming] = useState(false);

    const mainGroupData = currentValues.main_catalog_groups?.[uuid] || {};
    const posterType = mainGroupData.posterType || "Poster";
    const posterSize = mainGroupData.posterSize || "Default";

    // Sortable Hook for the Main Group itself
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: uuid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30 : 1,
    };

    // We maintain local subgroup ordering state
    const [subgroups, setSubgroups] = useState(subgroupNames);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [expandedSubgroup, setExpandedSubgroup] = useState<string | null>(null);

    React.useEffect(() => {
        setSubgroups(subgroupNames);
    }, [JSON.stringify(subgroupNames)]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSubgroupDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroups.indexOf(active.id as string);
            const newIndex = subgroups.indexOf(over.id as string);
            const newArray = arrayMove(subgroups, oldIndex, newIndex);

            setSubgroups(newArray);

            // We need to update both subgroup_order and main_catalog_groups.subgroupNames
            updateValue(["subgroup_order", uuid], newArray);
            updateValue(["main_catalog_groups", uuid, "subgroupNames"], newArray);
        }
    };

    const toggleSort = () => {
        const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [...subgroups].sort((a, b) => {
            return nextDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        });
        setSubgroups(sorted);
        setSortDirection(nextDir);
        updateValue(["subgroup_order", uuid], sorted);
        updateValue(["main_catalog_groups", uuid, "subgroupNames"], sorted);
    };

    const restoreOrder = () => {
        const orig = initialValues?.subgroup_order?.[uuid];
        if (orig && Array.isArray(orig)) {
            setSubgroups(orig);
            setSortDirection('asc'); // Reset direction indicator
            updateValue(["subgroup_order", uuid], orig);
            updateValue(["main_catalog_groups", uuid, "subgroupNames"], orig);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className={`border border-border/60 rounded-xl overflow-hidden bg-card/80 shadow-sm transition-all hover:border-border hover:shadow-md group/main ${isDragging ? "opacity-50 border-blue-500 scale-[1.01] shadow-2xl" : ""}`}>
            <AccordionItem value={uuid} className="border-none">
                <AccordionTrigger className="w-full justify-between items-center p-4 hover:bg-muted/40 hover:no-underline flex text-sm transition-colors group">
                    <div className="flex flex-1 items-center gap-4 text-left">
                        <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                                {formatDisplayName(name)}
                                {posterSize !== "Default" && (
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                                        {posterSize}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                                <span>{subgroupNames.length} Subgroups</span>
                            </div>
                        </div>
                    </div>
                    {/* Exclude from accordion Trigger's default chevron logic by wrapping in standard div layout */}
                </AccordionTrigger>

                <AccordionContent className="p-5 border-t border-border/50 bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-2 bg-background/50 border border-border rounded-lg p-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted font-medium tracking-tight">
                                        Layout: <span className="text-foreground ml-1 font-bold">{posterType} / {posterSize}</span> <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Poster Shape</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Poster")} className={`text-xs ${posterType === "Poster" ? "bg-blue-500/20 text-blue-400" : ""}`}>
                                        Poster {posterType === "Poster" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Square")} className={`text-xs ${posterType === "Square" ? "bg-blue-500/20 text-blue-400" : ""}`}>
                                        Square {posterType === "Square" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Landscape")} className={`text-xs ${posterType === "Landscape" ? "bg-blue-500/20 text-blue-400" : ""}`}>
                                        Landscape {posterType === "Landscape" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Poster Size</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterSize"], "Default")}
                                        className={`text-xs ${posterSize === "Default" ? "bg-blue-500/20 text-blue-400" : ""}`}
                                    >
                                        Default {posterSize === "Default" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterSize"], "Small")}
                                        className={`text-xs ${posterSize === "Small" ? "bg-blue-500/20 text-blue-400" : ""}`}
                                    >
                                        Small {posterSize === "Small" && "✓"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsRenaming(true)}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted font-medium tracking-tight"
                            >
                                Rename
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium tracking-tight ml-auto sm:ml-0"
                                    >
                                        Disable
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-popover border-border text-popover-foreground">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Disable Main Group?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will hide the group <span className="text-foreground font-bold">"{formatDisplayName(name)}"</span> and all its subgroups. You can restore them anytime from the Recycle Bin at the bottom.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => removeMainCatalogGroup(uuid)}
                                            className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                        >
                                            Disable Group
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="w-px h-4 bg-border mx-1" />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onAddSubgroup?.(uuid)}
                                className="h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center gap-1.5 px-3 rounded-lg font-semibold shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Subgroup
                            </Button>
                        </div>
                    </div>

                    <RenameGroupModal
                        isOpen={isRenaming}
                        onClose={() => setIsRenaming(false)}
                        oldName={name}
                        isMainGroup={true}
                        onRename={(oldN, newN) => {
                            setIsRenaming(false);
                            renameMainCatalogGroup(uuid, newN);
                        }}
                    />

                    {subgroups.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border/80 rounded-xl bg-background/30 flex flex-col items-center justify-center gap-2">
                            <FolderPlus className="w-8 h-8 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">No subgroups exist here.</p>
                            <p className="text-xs text-muted-foreground/80">Add subgroups by clicking "Add to Group" at the top.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubgroupDragEnd}>
                                <SortableContext items={subgroups} strategy={verticalListSortingStrategy}>
                                    {subgroups.map(sg => (
                                        <SortableSubgroupNode
                                            key={sg}
                                            subgroupName={sg}
                                            parentUUID={uuid}
                                            onUnassign={onUnassignSubgroup}
                                            isExpanded={expandedSubgroup === sg}
                                            onToggle={() => setExpandedSubgroup(expandedSubgroup === sg ? null : sg)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. Global Subgroup Library (List of all catalog_groups)
// ----------------------------------------------------------------------

function UnassignedSubgroupRow({
    groupName,
    catalogs: subgroupCatalogsProp,
    onRestore,
    restoreParentName
}: {
    groupName: string,
    catalogs: string[],
    onRestore?: () => void,
    restoreParentName?: string
}) {
    const { updateValue, currentValues, assignCatalogGroup, addManifestCatalog, removeCatalogGroup, catalogs: fullCatalogs, customFallbacks } = useConfig();
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrder = currentValues["main_group_order"] || [];
    const [isExpanded, setIsExpanded] = useState(false);

    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState("");

    const customNames: Record<string, string> = React.useMemo(() => currentValues["custom_catalog_names"] || {}, [currentValues]);
    const catalogOptions = React.useMemo(() => {
        const options: { id: string, name: string }[] = [];

        const existingBaseIds = new Set<string>();
        for (const c of fullCatalogs) {
            existingBaseIds.add(c.id.replace(/^(movie:|series:)/, ''));
            if (!subgroupCatalogsProp.includes(c.id)) {
                options.push({
                    id: c.id,
                    name: resolveCatalogName(c.id, customNames) || c.name || c.id
                });
            }
        }

        const allFallbacks = { ...CATALOG_FALLBACKS, ...customFallbacks };
        Object.entries(allFallbacks).forEach(([id, name]) => {
            if (!existingBaseIds.has(id.replace(/^(movie:|series:)/, ''))) {
                const displayName = customNames[id] || name;
                let finalId = id;
                if (!id.includes(':')) {
                    const lowerName = displayName.toLowerCase();
                    let typePrefix = "movie:"; // default
                    if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
                        typePrefix = "series:";
                    }
                    finalId = `${typePrefix}${id}`;
                }
                if (!subgroupCatalogsProp.includes(finalId)) {
                    options.push({
                        id: finalId,
                        name: displayName
                    });
                }
            }
        });

        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [fullCatalogs, customFallbacks, customNames, subgroupCatalogsProp]);

    const filteredCatalogs = React.useMemo(() => {
        if (!catalogSearch) return catalogOptions;
        const q = catalogSearch.toLowerCase();
        return catalogOptions.filter(c =>
            c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
    }, [catalogOptions, catalogSearch]);

    const handleAddCatalog = (e: Event, catalogId: string) => {
        e.preventDefault();
        if (!catalogId.trim()) return;
        const name = resolveCatalogName(catalogId.trim(), currentValues.custom_catalog_names || {});
        const normalizedId = ensureCatalogPrefix(catalogId.trim(), name);

        const updated = [...subgroupCatalogsProp, normalizedId];
        updateValue(["catalog_groups", groupName], updated);
    };

    const handleRemoveCatalog = (catalogId: string) => {
        const updated = subgroupCatalogsProp.filter(id => id !== catalogId);
        updateValue(["catalog_groups", groupName], updated);
    };

    const handleReorderCatalogs = (newOrder: string[]) => {
        updateValue(["catalog_groups", groupName], newOrder);
    };

    const catalogSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleInternalDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = subgroupCatalogsProp.indexOf(active.id as string);
            const newIndex = subgroupCatalogsProp.indexOf(over.id as string);
            handleReorderCatalogs(arrayMove(subgroupCatalogsProp, oldIndex, newIndex));
        }
    };

    return (
        <div className="flex flex-col bg-muted/40 border border-border rounded-lg overflow-hidden transition-all hover:border-border/80 w-full mb-3">
            <div className="flex items-center justify-between p-3 gap-4">
                {/* Left: Name */}
                <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-foreground text-sm truncate block" title={formatDisplayName(groupName)}>
                        {formatDisplayName(groupName)}
                    </span>
                </div>

                {/* Middle: Removed to give Name full space */}

                {/* Right: Actions */}
                <div className="flex items-center gap-2 justify-end shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] font-semibold uppercase tracking-tight text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                                Assign To... <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover border-border text-popover-foreground min-w-[200px]">
                            {onRestore && restoreParentName && (
                                <>
                                    <DropdownMenuItem
                                        onClick={onRestore}
                                        className="text-xs focus:bg-amber-500/20 focus:text-amber-400 cursor-pointer text-amber-500 font-semibold"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                        Restore to {formatDisplayName(restoreParentName)}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                </>
                            )}
                            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold">Select Main Group</DropdownMenuLabel>
                            {mainGroupOrder.length === 0 ? (
                                <DropdownMenuItem disabled className="text-xs text-muted-foreground/50">No Main Groups</DropdownMenuItem>
                            ) : (
                                mainGroupOrder.map((uuid: string) => {
                                    const name = mainCatalogGroups[uuid]?.name || "Unnamed Group";
                                    return (
                                        <DropdownMenuItem
                                            key={uuid}
                                            onClick={() => assignCatalogGroup(groupName, uuid)}
                                            className="text-xs focus:bg-blue-500/20 focus:text-blue-400 cursor-pointer"
                                        >
                                            {formatDisplayName(name)}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`h-7 px-2 text-[10px] font-semibold uppercase tracking-tight flex items-center gap-1 rounded-md transition-colors ${isExpanded ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    >
                        <Layout className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Edit</span>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 p-0 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md border border-transparent hover:border-red-500/30">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-popover border-border text-popover-foreground">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subgroup?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    This will completely delete <span className="text-foreground font-bold">"{groupName}"</span> from the configuration. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => removeCatalogGroup(groupName)}
                                    className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                >
                                    Delete Subgroup
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-border bg-background">
                    <div className="space-y-1 mb-4">
                        <DndContext sensors={catalogSensors} collisionDetection={closestCenter} onDragEnd={handleInternalDragEnd}>
                            <SortableContext items={subgroupCatalogsProp} strategy={verticalListSortingStrategy}>
                                {subgroupCatalogsProp.map(catId => (
                                    <SortableCatalogNode
                                        key={catId}
                                        id={catId}
                                        onRemove={() => handleRemoveCatalog(catId)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Add New Catalog Dropdown Menu */}
                    <div className="mt-3">
                        <DropdownMenu open={isAddMenuOpen} onOpenChange={open => {
                            setIsAddMenuOpen(open);
                            if (!open) setCatalogSearch("");
                        }}>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="w-full justify-start text-xs border border-dashed border-border/60 bg-background/30 text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border transition-colors">
                                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Catalog...
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 bg-popover border-border text-popover-foreground shadow-2xl p-0">
                                <div className="p-3 border-b border-border bg-card space-y-2">
                                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground flex justify-between">
                                        <span>Select Catalog</span>
                                        <span className="text-muted-foreground/80">{filteredCatalogs.length} available</span>
                                    </h4>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or ID..."
                                            value={catalogSearch}
                                            onChange={e => setCatalogSearch(e.target.value)}
                                            className="h-7 text-[11px] pl-7 bg-background border-border focus-visible:ring-blue-600"
                                            autoFocus
                                            onKeyDown={e => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto p-1 pt-0 custom-scrollbar">
                                    {filteredCatalogs.length === 0 ? (
                                        <p className="text-[10px] text-muted-foreground p-4 text-center">No catalogs found.</p>
                                    ) : (
                                        (() => {
                                            const groups: Record<string, typeof filteredCatalogs> = {
                                                "Other": []
                                            };
                                            filteredCatalogs.forEach(c => {
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

                                            return sortedCategories.map(category => (
                                                <div key={category} className="mb-2 last:mb-0">
                                                    <div className="sticky top-0 bg-popover py-1.5 px-3 z-[60] border-b border-border/80 mb-1 -mx-1">
                                                        <h5 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{category}</h5>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 px-1">
                                                        {groups[category].map(c => (
                                                            <DropdownMenuItem
                                                                key={c.id}
                                                                onSelect={(e) => handleAddCatalog(e, c.id)}
                                                                className="flex items-start gap-2 p-2 rounded cursor-pointer focus:bg-blue-500/10 focus:text-blue-400"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{c.name}</p>
                                                                    <p className="text-[9px] text-muted-foreground font-mono truncate">{c.id}</p>
                                                                </div>
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

                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// Unified App Entry Point
// ----------------------------------------------------------------------
export function UnifiedSubgroupEditor() {
    const { currentValues, updateValue, assignCatalogGroup, catalogs: manifestCatalogs, addManifestCatalog } = useConfig();
    const subgroupOrder = currentValues["subgroup_order"] || {};
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrderFromConfig = currentValues["main_group_order"] || [];
    const [mainGroupOrder, setMainGroupOrder] = useState<string[]>(mainGroupOrderFromConfig);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createParentUUID, setCreateParentUUID] = useState<string | undefined>();
    const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [recentUnassigns, setRecentUnassigns] = useState<Record<string, string>>({}); // subgroupName -> parentUuid

    const handleUnassignSubgroup = (subgroupName: string, parentUuid: string) => {
        setRecentUnassigns(prev => ({ ...prev, [subgroupName]: parentUuid }));
    };

    React.useEffect(() => {
        setMainGroupOrder(mainGroupOrderFromConfig);
    }, [JSON.stringify(mainGroupOrderFromConfig)]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleMainDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = mainGroupOrder.indexOf(active.id as string);
            const newIndex = mainGroupOrder.indexOf(over.id as string);
            const newArray = arrayMove(mainGroupOrder, oldIndex, newIndex);

            setMainGroupOrder(newArray);
            updateValue(["main_group_order"], newArray);
        }
    };

    // Filter unassigned subgroups
    const catalogGroups = currentValues.catalog_groups || {};
    const assignedGroups = new Set<string>();

    // Check subgroup_order (uuid → string[])
    Object.values(subgroupOrder).forEach((arr: any) => {
        if (Array.isArray(arr)) arr.forEach((name: string) => assignedGroups.add(name));
    });

    // Also check main_catalog_groups[uuid].subgroupNames
    Object.values(mainCatalogGroups).forEach((group: any) => {
        if (Array.isArray(group?.subgroupNames)) {
            group.subgroupNames.forEach((name: string) => assignedGroups.add(name));
        }
    });

    // Exclude: already assigned, OR name looks like a [Placeholder], or contains exclamation mark emojis
    const isPlaceholder = (name: string) => {
        const n = name.trim();
        return n.includes("❗️") || n.includes("❗") || /\[.+\]/.test(n);
    };

    const unassignedGroups = Object.keys(catalogGroups).filter(
        name => !assignedGroups.has(name) && !isPlaceholder(name)
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Group
                    </Button>
                    <Button
                        onClick={() => setIsAddToGroupModalOpen(true)}
                        className="bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm"
                    >
                        <FolderPlus className="w-5 h-5 mr-2" />
                        Add to Group
                    </Button>
                    <Button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm"
                    >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        Update from Template
                    </Button>
                </div>
            </div>


            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setCreateParentUUID(undefined);
                }}
                initialParentUUID={createParentUUID}
            />
            <AddToGroupModal isOpen={isAddToGroupModalOpen} onClose={() => setIsAddToGroupModalOpen(false)} />
            <ImportSetupModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

            {mainGroupOrder.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border/80 rounded-2xl bg-background/20 flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <FolderPlus className="w-8 h-8 text-blue-500/60" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">No Main Groups Found</p>
                        <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed mx-auto">
                            Start by creating a new group or add existing subgroups from the library below.
                        </p>
                    </div>
                </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMainDragEnd}>
                <SortableContext items={mainGroupOrder} strategy={verticalListSortingStrategy}>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {mainGroupOrder.map(uuid => {
                            const name = mainCatalogGroups[uuid]?.name || `Group ${uuid.slice(0, 4)}`;
                            const subgroupNames = subgroupOrder[uuid] || [];
                            return (
                                <MainGroupNode
                                    key={uuid}
                                    uuid={uuid}
                                    name={name}
                                    subgroupNames={subgroupNames}
                                    onUnassignSubgroup={handleUnassignSubgroup}
                                    onAddSubgroup={(id) => {
                                        setCreateParentUUID(id);
                                        setIsCreateModalOpen(true);
                                    }}
                                />
                            );
                        })}
                    </Accordion>
                </SortableContext>
            </DndContext>

            {unassignedGroups.length > 0 && (
                <div className="mt-12 border-t border-border pt-8 pb-4">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-amber-500">Unassigned Subgroups</h3>
                        <p className="text-sm text-muted-foreground">Subgroups that are defined but not yet linked to any main group.</p>
                    </div>
                    <div className="flex flex-col">
                        {unassignedGroups.map(name => {
                            const restoreParentUuid = recentUnassigns[name];
                            const restoreParentName = restoreParentUuid ? (mainCatalogGroups[restoreParentUuid]?.name || "Original Group") : undefined;

                            return (
                                <UnassignedSubgroupRow
                                    key={name}
                                    groupName={name}
                                    catalogs={catalogGroups[name] || []}
                                    onRestore={restoreParentUuid ? () => {
                                        assignCatalogGroup(name, restoreParentUuid);
                                        setRecentUnassigns(prev => {
                                            const next = { ...prev };
                                            delete next[name];
                                            return next;
                                        });
                                    } : undefined}
                                    restoreParentName={restoreParentName}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            <TrashBin />
        </div>
    );
}

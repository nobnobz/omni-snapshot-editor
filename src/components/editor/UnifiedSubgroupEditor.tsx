"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragEndEvent,
    type DragStartEvent,
    type Modifier,
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
import { GripVertical, ImageIcon, LinkIcon, ChevronRight, ChevronDown, RotateCcw, Search, Layout, Plus, Pencil, Trash2, FolderPlus, UploadCloud, AlertTriangle } from "lucide-react";
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
import { cn, formatDisplayName, resolveCatalogName, ensureCatalogPrefix } from "@/lib/utils";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { CATALOG_FALLBACKS } from "@/lib/catalog-fallbacks";
import { Label } from "@/components/ui/label";

const stringArraysEqual = (a: string[], b: string[]) => (
    a.length === b.length && a.every((item, idx) => item === b[idx])
);
const EMPTY_STRING_ARRAY: string[] = [];
type ThumbnailAspect = "portrait" | "landscape" | "square";

// Catalog reorder is vertical-only; locking X prevents visible sideways jumps while dragging.
const restrictVerticalDrag: Modifier = ({ transform }) => ({
    ...transform,
    x: 0,
});

const subgroupCountBadgeClass =
    "ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full border border-slate-200/70 bg-slate-100/75 px-1.5 text-[10px] font-semibold tabular-nums leading-none text-foreground/62 shadow-sm transition-colors dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/58";

const subgroupCountInlineClass =
    "inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full border border-slate-200/65 bg-slate-100/70 px-1.5 text-[10px] font-semibold tabular-nums leading-none text-foreground/58 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/56";

const buildSubgroupAnchorId = (parentUUID: string, subgroupName: string) =>
    `subgroup-node-${parentUUID}-${subgroupName.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;

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

// ----------------------------------------------------------------------
// 1. Sortable Catalog Node (Inside a Subgroup)
// ----------------------------------------------------------------------
function SortableCatalogNode({ id, onRemove }: { id: string, onRemove?: () => void }) {
    const { currentValues } = useConfig();

    // Construct effective custom names (Config Custom Names > AIOMetadata > Default)
    const configCustomNames = currentValues["custom_catalog_names"] || {};
    let aioFallbacks: Record<string, string> = {};
    if (typeof window !== "undefined") {
        try {
            aioFallbacks = JSON.parse(localStorage.getItem("omni_custom_fallbacks") || "{}");
        } catch { }
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
        transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
        transition,
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-2.5 border rounded-xl mb-2 group/cat transition-[background-color,border-color,opacity,box-shadow] duration-150
                ${isDragging ? "opacity-15 border-border/70 bg-muted/45 border-dashed shadow-none" : `${editorSurface.field} hover:border-slate-300/85 dark:hover:border-white/12 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_22px_rgba(2,6,23,0.18)]`}`}
        >
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab shrink-0 p-2 rounded-lg transition-colors select-none ${isDragging ? "text-foreground/75" : "text-foreground/55 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"}`}
                style={{ touchAction: 'none' }}
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                <p className="text-sm min-w-0 flex-1 truncate font-semibold tracking-tight text-foreground">
                    {displayName}
                </p>
                {displayName !== id && (
                    <span
                        title={id}
                        className="hidden sm:inline-block text-xs text-foreground/60 font-mono bg-white/55 dark:bg-white/[0.045] px-1.5 py-0.5 rounded-md border border-border/70 opacity-0 group-hover/cat:opacity-100 transition-opacity truncate max-w-[min(42vw,24rem)]"
                    >
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
                        className={`h-9 w-9 ${editorHover.iconDanger} rounded-md`}
                        aria-label="Remove catalog from subgroup"
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
function SortableSubgroupNode({ subgroupName, parentUUID, onUnassign, isExpanded: propIsExpanded, onToggle, rowAnchorId }: { subgroupName: string, parentUUID: string, onUnassign?: (name: string, parentId: string) => void, isExpanded?: boolean, onToggle?: () => void, rowAnchorId?: string }) {
    const { currentValues, updateValue, renameCatalogGroup, unassignCatalogGroup, catalogs, customFallbacks } = useConfig();

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
    const rawCatalogsList = currentValues.catalog_groups?.[subgroupName];
    const catalogsList: string[] = Array.isArray(rawCatalogsList) ? rawCatalogsList : EMPTY_STRING_ARRAY;
    const rawImageUrl = currentValues.catalog_group_image_urls?.[subgroupName];
    const imageUrl: string = typeof rawImageUrl === "string" ? rawImageUrl : "";

    const [subgroupCatalogs, setSubgroupCatalogs] = useState<string[]>(catalogsList);
    const [urlInput, setUrlInput] = useState(imageUrl);
    const [thumbAspect, setThumbAspect] = useState<ThumbnailAspect>("square");
    const [thumbLoadError, setThumbLoadError] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
    const addCatalogSearchInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isAddMenuOpen) return;
        const focusSearch = () => focusSearchInput(addCatalogSearchInputRef.current);
        const rafId = requestAnimationFrame(focusSearch);
        const timeoutId = window.setTimeout(focusSearch, 60);
        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(timeoutId);
        };
    }, [isAddMenuOpen]);

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

    React.useEffect(() => {
        setSubgroupCatalogs(prev => (stringArraysEqual(prev, catalogsList) ? prev : catalogsList));
        setUrlInput(prev => (prev === imageUrl ? prev : imageUrl));
    }, [catalogsList, imageUrl]);

    React.useEffect(() => {
        setThumbAspect("square");
        setThumbLoadError(false);
    }, [urlInput]);

    const handleUrlBlur = () => {
        if (urlInput !== imageUrl) {
            updateValue(["catalog_group_image_urls", subgroupName], urlInput);
        }
    };

    const hasThumbPreview = /^https?:\/\//i.test(urlInput.trim()) && !thumbLoadError;
    const thumbFrameClass = thumbAspect === "landscape"
        ? "h-10 w-16"
        : thumbAspect === "portrait"
            ? "h-14 w-10"
            : "h-10 w-10";

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleCatalogDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCatalogId(null);
        if (over && active.id !== over.id) {
            const oldIndex = subgroupCatalogs.indexOf(active.id as string);
            const newIndex = subgroupCatalogs.indexOf(over.id as string);
            const newArray = arrayMove(subgroupCatalogs, oldIndex, newIndex);
            setSubgroupCatalogs(newArray);
            updateValue(["catalog_groups", subgroupName], newArray);
        }
    };

    const handleCatalogDragStart = (event: DragStartEvent) => {
        setActiveCatalogId(String(event.active.id));
    };

    const activeCatalogName = activeCatalogId
        ? resolveCatalogName(activeCatalogId, currentValues.custom_catalog_names || {})
        : "";

    const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-subgroup-no-toggle='true']")) return;
        toggleExpanded();
    };

    const handleAddCatalog = (e: Event, catalogId: string) => {
        e.preventDefault();
        if (!catalogId.trim()) return;
        const name = resolveCatalogName(catalogId.trim(), currentValues.custom_catalog_names || {});
        const normalizedId = ensureCatalogPrefix(catalogId.trim(), name);

        const updated = [...subgroupCatalogs, normalizedId];
        setSubgroupCatalogs(updated);
        updateValue(["catalog_groups", subgroupName], updated);
    };

    return (
        <div id={rowAnchorId} ref={setNodeRef} style={style} className={`${editorSurface.card} rounded-xl overflow-hidden mb-3 ${isDragging ? "opacity-50 border-primary scale-[1.01] shadow-2xl" : ""}`}>
            {/* Header: Drag Handle + Subgroup Name */}
            <div
                onClick={handleHeaderClick}
                className={`group/subgroup flex items-stretch gap-3 p-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(248,250,252,0.14))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] backdrop-blur-sm ${isExpanded ? "border-b border-slate-200/75 dark:border-white/8" : ""}`}
            >
                <button
                    {...attributes}
                    {...listeners}
                    data-subgroup-no-toggle="true"
                    onClick={(e) => e.stopPropagation()}
                    className={`cursor-grab text-foreground/65 p-1.5 rounded-lg transition-colors select-none ${editorHover.softAction}`}
                    style={{ touchAction: 'none' }}
                >
                    <GripVertical className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    data-subgroup-no-toggle="true"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded();
                    }}
                    className="flex flex-1 min-w-0 self-stretch items-center gap-0 rounded-md px-1 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-expanded={isExpanded}
                    aria-label={`Toggle subgroup ${formatDisplayName(subgroupName)}`}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4 mr-2 text-foreground/70 group-hover:text-foreground shrink-0 transition-colors" /> : <ChevronRight className="w-4 h-4 mr-2 text-foreground/70 group-hover:text-foreground shrink-0 transition-colors" />}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <span className="truncate font-bold text-sm text-foreground transition-colors group-hover/subgroup:text-primary dark:group-hover/subgroup:text-primary">{formatDisplayName(subgroupName)}</span>
                        <Badge
                            variant="outline"
                            className={cn(subgroupCountBadgeClass, "ml-0 sm:ml-2")}
                        >
                            {subgroupCatalogs.length}
                        </Badge>
                    </div>
                </button>

                {/* Action Buttons: Desktop Header, Mobile hidden here (moved to layout section below) */}
                <div data-subgroup-no-toggle="true" className="hidden sm:flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsRenaming(true);
                        }}
                        className={`h-9 w-9 rounded-lg transition-colors ${editorHover.iconAction}`}
                        title="Rename"
                        aria-label="Rename subgroup"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            unassignCatalogGroup(subgroupName);
                            if (onUnassign) onUnassign(subgroupName, parentUUID);
                        }}
                        className={`h-9 w-9 rounded-lg ${editorHover.iconDanger}`}
                        title="Delete"
                        aria-label="Delete subgroup"
                    >
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
                <div className="space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(248,250,252,0.1))] p-4 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                    {/* Image URL Input */}
                    <div className="space-y-2">
                        <div className={`${editorSurface.panel} flex items-center gap-3 p-3`}>
                            <div 
                                className={`${thumbFrameClass} rounded-md shrink-0 overflow-hidden shadow-sm flex items-center justify-center transition-[width,height] duration-200 border border-white/10 p-1`}
                                style={{ backgroundColor: '#020617' }}
                            >
                                {hasThumbPreview ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic subgroup thumbnail preview from user-provided URL. */}
                                        <img
                                            src={urlInput}
                                            alt="Thumb"
                                            className="h-full w-full object-contain"
                                            onLoad={(e) => {
                                                const { naturalWidth, naturalHeight } = e.currentTarget;
                                                if (!naturalWidth || !naturalHeight) {
                                                    setThumbAspect("square");
                                                    return;
                                                }
                                                const ratio = naturalWidth / naturalHeight;
                                                if (ratio > 1.2) setThumbAspect("landscape");
                                                else if (ratio < 0.82) setThumbAspect("portrait");
                                                else setThumbAspect("square");
                                            }}
                                            onError={() => {
                                                setThumbLoadError(true);
                                            }}
                                        />
                                    </>
                                ) : (
                                    <ImageIcon className="w-4 h-4 text-foreground/70" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs uppercase font-bold tracking-widest text-foreground/70">Poster Image URL</Label>
                                <Input
                                    placeholder="https://..."
                                    value={urlInput}
                                    onChange={e => setUrlInput(e.target.value)}
                                    onBlur={handleUrlBlur}
                                    className={`${editorSurface.field} h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors font-mono`}
                                />
                            </div>
                        </div>

                        {/* Mobile Action Buttons: Move here under layout */}
                        <div className="sm:hidden flex items-center gap-2 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRenaming(true)}
                                className={`${editorSurface.field} flex-1 h-9 text-xs text-foreground/70 hover:text-foreground`}
                            >
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Rename
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    unassignCatalogGroup(subgroupName);
                                    if (onUnassign) onUnassign(subgroupName, parentUUID);
                                }}
                                className={`${editorSurface.field} flex-1 h-9 text-xs text-red-400 hover:text-red-300`}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </Button>
                        </div>
                    </div>

                    {/* Inner Sortable Catalogs */}
                    <div className={`${editorSurface.panel} p-3 sm:p-3.5`}>
                        <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(248,250,252,0.2))] px-3 py-2 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                            <h5 className="inline-flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
                                <LinkIcon className="h-3.5 w-3.5 text-foreground/60" />
                                Linked Catalogs
                            </h5>
                            <span className={subgroupCountInlineClass}>{subgroupCatalogs.length}</span>
                        </div>

                        {subgroupCatalogs.length === 0 ? (
                            <div className={`${editorSurface.field} text-center py-6 border-dashed rounded-lg`}>
                                <p className="text-xs text-foreground/65 font-medium">No linked catalogs in this subgroup yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <DndContext 
                                    sensors={sensors} 
                                    collisionDetection={closestCenter} 
                                    modifiers={[restrictVerticalDrag]}
                                    onDragStart={handleCatalogDragStart}
                                    onDragCancel={() => setActiveCatalogId(null)}
                                    onDragEnd={handleCatalogDragEnd}
                                >
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
                                    {activeCatalogId && typeof document !== 'undefined' ? createPortal(
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
                                            <div className="flex items-center gap-3 rounded-lg border border-primary/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] px-3 py-2.5 shadow-2xl opacity-95 dark:bg-[linear-gradient(180deg,rgba(20,23,30,0.96),rgba(13,16,21,0.94))]">
                                                <GripVertical className="h-4 w-4 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                                                        {activeCatalogName}
                                                    </p>
                                                    {activeCatalogName !== activeCatalogId ? (
                                                        <p className="truncate text-xs font-mono text-foreground/45">
                                                            {activeCatalogId}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </DragOverlay>,
                                        document.body
                                    ) : null}
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
                                    <Button size="sm" variant="outline" className={`${editorSurface.dropzone} w-full justify-start text-xs text-foreground/70 hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.035]`}>
                                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Catalog...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={cn(editorSurface.overlay, "w-[30rem] max-w-[92vw] p-0 overflow-hidden")}>
                                    <div className={cn(editorSurface.overlaySection, "space-y-2 border-b border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(239,246,255,0.5))] p-3 dark:border-primary/14 dark:bg-[linear-gradient(180deg,rgba(18,24,35,0.95),rgba(14,20,31,0.92))]")}>
                                        <h4 className="flex justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/58">
                                            <span>Select Catalog</span>
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/78 dark:text-primary/70">{filteredCatalogs.length} available</span>
                                        </h4>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/60" />
                                            <Input
                                                ref={addCatalogSearchInputRef}
                                                autoFocus
                                                placeholder="Search by name or ID..."
                                                value={catalogSearch}
                                                onChange={e => setCatalogSearch(e.target.value)}
                                                className={cn(editorSurface.field, "h-10 sm:h-9 text-base sm:text-sm pl-8 focus-visible:ring-ring/50")}
                                                onKeyDown={e => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className={cn(editorSurface.overlayList, "max-h-[340px] overflow-y-auto p-2 pt-0 custom-scrollbar")}>
                                        {filteredCatalogs.length === 0 ? (
                                            <p className="text-xs text-foreground/70 p-4 text-center">No catalogs found.</p>
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
                                                        <div className={`${editorSurface.sticky} sticky top-0 py-2 px-2.5 z-[60] mb-1`}>
                                                            <h5 className="text-xs font-bold text-foreground/52 uppercase tracking-[0.18em]">{category}</h5>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            {groups[category].map(c => (
                                                                <DropdownMenuItem
                                                                    key={c.id}
                                                                    onSelect={(e) => handleAddCatalog(e, c.id)}
                                                                    className="group flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-2.5 py-2 hover:bg-primary/10 hover:text-foreground data-[highlighted]:border-primary/20 data-[highlighted]:bg-primary/12 data-[highlighted]:text-foreground dark:hover:bg-primary/16 dark:data-[highlighted]:border-primary/22 dark:data-[highlighted]:bg-primary/20"
                                                                >
                                                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground transition-colors group-data-[highlighted]:text-primary">
                                                                        {c.name}
                                                                    </p>
                                                                    <p className="max-w-[40%] shrink-0 truncate text-right text-xs font-mono text-foreground/42 transition-colors dark:text-foreground/50 group-data-[highlighted]:text-primary/72 dark:group-data-[highlighted]:text-primary/70" title={c.id}>
                                                                        {c.id}
                                                                    </p>
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
    const { currentValues, updateValue, renameMainCatalogGroup, removeMainCatalogGroup } = useConfig();
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
    const [activeSubgroupId, setActiveSubgroupId] = useState<string | null>(null);
    const [expandedSubgroup, setExpandedSubgroup] = useState<string | null>(null);

    React.useEffect(() => {
        setSubgroups(prev => (stringArraysEqual(prev, subgroupNames) ? prev : subgroupNames));
    }, [subgroupNames]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSubgroupDragStart = (event: DragStartEvent) => {
        setActiveSubgroupId(String(event.active.id));
    };

    const handleSubgroupDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveSubgroupId(null);
        if (over && active.id !== over.id) {
            const activeId = String(active.id);
            const overId = String(over.id);
            const oldIndex = subgroups.indexOf(activeId);
            const newIndex = subgroups.indexOf(overId);
            const newArray = arrayMove(subgroups, oldIndex, newIndex);

            setSubgroups(newArray);

            // We need to update both subgroup_order and main_catalog_groups.subgroupNames
            updateValue(["subgroup_order", uuid], newArray);
            updateValue(["main_catalog_groups", uuid, "subgroupNames"], newArray);
        }
    };

    const handleToggleSubgroup = (subgroupName: string) => {
        const nextExpanded = expandedSubgroup === subgroupName ? null : subgroupName;
        setExpandedSubgroup(nextExpanded);

        if (!nextExpanded) return;

        const targetId = buildSubgroupAnchorId(uuid, subgroupName);
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                const target = document.getElementById(targetId);
                target?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            });
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${editorSurface.card} mb-2 overflow-hidden backdrop-blur-[10px] transition-[border-color,background-color,box-shadow] ${isDragging ? "opacity-50 border-primary shadow-xl scale-[1.01] z-50" : ""} group/main`}
        >
            <AccordionItem value={uuid} className="border-none">
                <div className="flex items-center">
                    {/* Consistent Drag Handle outside trigger to avoid collapse on drag start */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-foreground/40 hover:text-foreground/80 shrink-0 p-3 transition-colors select-none"
                        style={{ touchAction: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    <AccordionTrigger className={`flex-1 text-foreground px-4 py-4 transition-colors group/trigger ${editorHover.rowSubtle}`}>
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Name + Subgroup Count */}
                            <div className="flex flex-col min-w-0 gap-1.5">
                                <span className="min-w-0 truncate font-bold text-base text-foreground group-hover/trigger:text-primary transition-colors">
                                    {formatDisplayName(name)}
                                </span>
                                <div className="text-xs text-foreground/50 font-medium leading-none flex items-center gap-2">
                                    <span>{subgroupNames.length} Subgroups</span>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-1 shrink-0 flex-wrap sm:justify-end">
                                {posterSize !== "Default" && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded-md",
                                            posterSize === "Small"
                                                ? "bg-primary/10 text-primary dark:text-primary border-primary/30"
                                                : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
                                        )}
                                    >
                                        {posterSize}
                                    </Badge>
                                )}
                                {posterType === "Poster" && (
                                    <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25">Poster</Badge>
                                )}
                                {posterType === "Square" && (
                                    <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Square</Badge>
                                )}
                                {posterType === "Landscape" && (
                                    <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">Landscape</Badge>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                </div>

                <AccordionContent className="border-t border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(248,250,252,0.11))] p-5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div className={`${editorSurface.toolbar} flex w-full sm:w-auto items-center gap-1.5 sm:gap-2 p-1.5 sm:p-1`}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 min-w-0 max-w-[48vw] sm:max-w-none text-xs sm:text-sm text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40 font-medium tracking-tight px-2">
                                        <span className="hidden sm:inline">Layout:</span>
                                        <span className="text-foreground sm:ml-1 font-bold min-w-0 truncate">
                                            <span className="hidden sm:inline">{posterType} / {posterSize}</span>
                                            <span className="sm:hidden">{posterType} · {posterSize}</span>
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={cn(editorSurface.overlay, "min-w-[13rem]")}>
                                    <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/55 font-semibold">Poster Shape</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Poster")} className={`text-xs ${posterType === "Poster" ? "bg-primary/20 text-primary" : ""}`}>
                                        Poster {posterType === "Poster" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Square")} className={`text-xs ${posterType === "Square" ? "bg-primary/20 text-primary" : ""}`}>
                                        Square {posterType === "Square" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Landscape")} className={`text-xs ${posterType === "Landscape" ? "bg-primary/20 text-primary" : ""}`}>
                                        Landscape {posterType === "Landscape" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/55 font-semibold">Poster Size</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterSize"], "Default")}
                                        className={`text-xs ${posterSize === "Default" ? "bg-primary/20 text-primary" : ""}`}
                                    >
                                        Default {posterSize === "Default" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterSize"], "Small")}
                                        className={`text-xs ${posterSize === "Small" ? "bg-primary/20 text-primary" : ""}`}
                                    >
                                        Small {posterSize === "Small" && "✓"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="hidden sm:block w-px h-4 bg-border mx-1 shrink-0" />

                            <div className="ml-auto flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsRenaming(true)}
                                    className="h-8 shrink-0 text-xs sm:text-sm text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40 font-medium tracking-tight px-2"
                                >
                                    <Pencil className="w-3.5 h-3.5 sm:hidden" />
                                    <span className="hidden sm:inline">Rename</span>
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 shrink-0 text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium tracking-tight px-2"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 sm:hidden" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Main Group?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-foreground/70">
                                                This will remove the group <span className="text-foreground font-bold">&quot;{formatDisplayName(name)}&quot;</span> and all its subgroups. You can restore them anytime from the Recycle Bin at the bottom.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-muted border-border text-foreground/70 hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeMainCatalogGroup(uuid)}
                                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                            >
                                                Delete Group
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <div className="hidden sm:block w-px h-4 bg-border mx-1 shrink-0" />

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAddSubgroup?.(uuid)}
                                    className="h-8 shrink-0 text-xs sm:text-sm text-primary hover:text-primary hover:bg-primary/10 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out flex items-center gap-1.5 px-2.5 rounded-lg font-bold"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Subgroup</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <RenameGroupModal
                        isOpen={isRenaming}
                        onClose={() => setIsRenaming(false)}
                        oldName={name}
                        isMainGroup={true}
                        onRename={(oldN: string, newN: string) => {
                            setIsRenaming(false);
                            renameMainCatalogGroup(uuid, newN);
                        }}
                    />

                    {subgroups.length === 0 ? (
                        <div className={`${editorSurface.inset} text-center py-8 border-dashed flex flex-col items-center justify-center gap-2`}>
                            <FolderPlus className="w-8 h-8 text-foreground/70" />
                            <p className="text-sm font-medium text-foreground/70">No subgroups exist here.</p>
                            <p className="text-xs text-foreground/70/80">Add subgroups by clicking &quot;Add to Group&quot; at the top.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <DndContext 
                                sensors={sensors} 
                                collisionDetection={closestCenter} 
                                modifiers={[restrictVerticalDrag]}
                                onDragStart={handleSubgroupDragStart}
                                onDragEnd={handleSubgroupDragEnd}
                            >
                                <SortableContext items={subgroups} strategy={verticalListSortingStrategy}>
                                    {subgroups.map(sg => (
                                        <SortableSubgroupNode
                                            key={sg}
                                            subgroupName={sg}
                                            parentUUID={uuid}
                                            onUnassign={onUnassignSubgroup}
                                            rowAnchorId={buildSubgroupAnchorId(uuid, sg)}
                                            isExpanded={expandedSubgroup === sg}
                                            onToggle={() => handleToggleSubgroup(sg)}
                                        />
                                    ))}
                                </SortableContext>
                                {activeSubgroupId && typeof document !== 'undefined' ? createPortal(
                                    <DragOverlay dropAnimation={{
                                        sideEffects: defaultDropAnimationSideEffects({
                                            styles: {
                                                active: {
                                                    opacity: '0.4',
                                                },
                                            },
                                        }),
                                    }}>
                                        <div className="border border-primary/65 rounded-xl overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] dark:bg-[linear-gradient(180deg,rgba(20,20,24,0.96),rgba(10,10,14,0.98))] shadow-2xl scale-[1.02] opacity-90 p-4 flex items-center gap-4">
                                            <GripVertical className="h-4 w-4 text-primary" />
                                            <div className="font-semibold text-sm text-foreground">
                                                {formatDisplayName(activeSubgroupId)}
                                            </div>
                                        </div>
                                    </DragOverlay>,
                                    document.body
                                ) : null}
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
    const { updateValue, currentValues, assignCatalogGroup, removeCatalogGroup, catalogs: fullCatalogs, customFallbacks } = useConfig();
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrder = currentValues["main_group_order"] || [];
    const [isExpanded, setIsExpanded] = useState(false);

    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
    const addCatalogSearchInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isAddMenuOpen) return;
        const focusSearch = () => focusSearchInput(addCatalogSearchInputRef.current);
        const rafId = requestAnimationFrame(focusSearch);
        const timeoutId = window.setTimeout(focusSearch, 60);
        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(timeoutId);
        };
    }, [isAddMenuOpen]);

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleInternalDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCatalogId(null);
        if (over && active.id !== over.id) {
            const activeId = String(active.id);
            const overId = String(over.id);
            const oldIndex = subgroupCatalogsProp.indexOf(activeId);
            const newIndex = subgroupCatalogsProp.indexOf(overId);
            handleReorderCatalogs(arrayMove(subgroupCatalogsProp, oldIndex, newIndex));
        }
    };

    const handleInternalDragStart = (event: DragStartEvent) => {
        setActiveCatalogId(String(event.active.id));
    };

    const activeCatalogName = activeCatalogId
        ? resolveCatalogName(activeCatalogId, currentValues.custom_catalog_names || {})
        : "";

    return (
        <div className={`${editorSurface.cardInteractive} flex flex-col rounded-xl overflow-hidden transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-border/80 w-full mb-3`}>
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
                                className="h-7 px-2 text-xs font-semibold uppercase tracking-tight text-foreground/70 border-border/50 hover:bg-muted/60 dark:hover:bg-muted/40 hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                                Assign To... <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={cn(editorSurface.overlay, "min-w-[200px]")}>
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
                            <DropdownMenuLabel className="text-xs uppercase text-foreground/70 font-bold">Select Main Group</DropdownMenuLabel>
                            {mainGroupOrder.length === 0 ? (
                                <DropdownMenuItem disabled className="text-xs text-foreground/70/50">No Main Groups</DropdownMenuItem>
                            ) : (
                                mainGroupOrder.map((uuid: string) => {
                                    const name = mainCatalogGroups[uuid]?.name || "Unnamed Group";
                                    return (
                                        <DropdownMenuItem
                                            key={uuid}
                                            onClick={() => assignCatalogGroup(groupName, uuid)}
                                            className="text-xs focus:bg-primary/20 focus:text-primary cursor-pointer"
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
                        className={`h-7 px-2 text-xs font-semibold uppercase tracking-tight flex items-center gap-1 rounded-md transition-colors ${isExpanded ? 'bg-white/60 dark:bg-white/[0.05] text-foreground' : 'text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40'}`}
                    >
                        <Layout className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Edit</span>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className={`h-9 w-9 p-0 flex items-center justify-center rounded-md ${editorHover.iconDanger}`} aria-label="Delete subgroup">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className={cn(editorSurface.overlay, "text-popover-foreground")}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subgroup?</AlertDialogTitle>
                                <AlertDialogDescription className="text-foreground/70">
                                    This will completely delete <span className="text-foreground font-bold">&quot;{groupName}&quot;</span> from the configuration. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-muted border-border text-foreground/70 hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
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
                <div className="border-t border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(248,250,252,0.1))] p-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                    <div className={`${editorSurface.panel} mb-4 p-3 sm:p-3.5`}>
                        <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(248,250,252,0.2))] px-3 py-2 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                            <h5 className="inline-flex items-center gap-2 text-xs font-bold text-foreground/80 uppercase tracking-widest">
                                <LinkIcon className="h-3.5 w-3.5 text-foreground/60" />
                                Linked Catalogs
                            </h5>
                            <span className={subgroupCountInlineClass}>{subgroupCatalogsProp.length}</span>
                        </div>
                        <div className="space-y-1 mb-0">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                modifiers={[restrictVerticalDrag]}
                                onDragStart={handleInternalDragStart}
                                onDragCancel={() => setActiveCatalogId(null)}
                                onDragEnd={handleInternalDragEnd}
                            >
                                <SortableContext items={subgroupCatalogsProp} strategy={verticalListSortingStrategy}>
                                    {subgroupCatalogsProp.map(catId => (
                                        <SortableCatalogNode
                                            key={catId}
                                            id={catId}
                                            onRemove={() => handleRemoveCatalog(catId)}
                                        />
                                    ))}
                                </SortableContext>
                                {activeCatalogId && typeof document !== 'undefined' ? createPortal(
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
                                        <div className="flex items-center gap-3 rounded-lg border border-primary/70 bg-card px-3 py-2.5 shadow-2xl opacity-95">
                                            <GripVertical className="h-4 w-4 text-primary" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                                                    {activeCatalogName}
                                                </p>
                                                {activeCatalogName !== activeCatalogId ? (
                                                    <p className="truncate text-xs font-mono text-foreground/45">
                                                        {activeCatalogId}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </DragOverlay>,
                                    document.body
                                ) : null}
                            </DndContext>
                        </div>

                        {/* Add New Catalog Dropdown Menu */}
                        <div className="mt-3">
                            <DropdownMenu open={isAddMenuOpen} onOpenChange={open => {
                                setIsAddMenuOpen(open);
                                if (!open) setCatalogSearch("");
                            }}>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className={`${editorSurface.dropzone} w-full justify-start text-xs text-foreground/70 hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.035]`}>
                                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Catalog...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={cn(editorSurface.overlay, "w-[30rem] max-w-[92vw] p-0 overflow-hidden")}>
                                    <div className={cn(editorSurface.overlaySection, "space-y-2 border-b border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(239,246,255,0.5))] p-3 dark:border-primary/14 dark:bg-[linear-gradient(180deg,rgba(18,24,35,0.95),rgba(14,20,31,0.92))]")}>
                                        <h4 className="flex justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/58">
                                            <span>Select Catalog</span>
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/78 dark:text-primary/70">{filteredCatalogs.length} available</span>
                                        </h4>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/60" />
                                            <Input
                                                ref={addCatalogSearchInputRef}
                                                autoFocus
                                                placeholder="Search by name or ID..."
                                                value={catalogSearch}
                                                onChange={e => setCatalogSearch(e.target.value)}
                                                className={cn(editorSurface.field, "h-10 sm:h-9 text-base sm:text-sm pl-8 focus-visible:ring-ring/50")}
                                                onKeyDown={e => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className={cn(editorSurface.overlayList, "max-h-[340px] overflow-y-auto p-2 pt-0 custom-scrollbar")}>
                                        {filteredCatalogs.length === 0 ? (
                                            <p className="text-xs text-foreground/70 p-4 text-center">No catalogs found.</p>
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
                                                        <div className={`${editorSurface.sticky} sticky top-0 py-2 px-2.5 z-[60] mb-1`}>
                                                            <h5 className="text-xs font-bold text-foreground/52 uppercase tracking-[0.18em]">{category}</h5>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            {groups[category].map(c => (
                                                                <DropdownMenuItem
                                                                    key={c.id}
                                                                    onSelect={(e) => handleAddCatalog(e, c.id)}
                                                                    className="group flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-2.5 py-2 hover:bg-primary/10 hover:text-foreground data-[highlighted]:border-primary/20 data-[highlighted]:bg-primary/12 data-[highlighted]:text-foreground dark:hover:bg-primary/16 dark:data-[highlighted]:border-primary/22 dark:data-[highlighted]:bg-primary/20"
                                                                >
                                                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground transition-colors group-data-[highlighted]:text-primary">
                                                                        {c.name}
                                                                    </p>
                                                                    <p className="max-w-[40%] shrink-0 truncate text-right text-xs font-mono text-foreground/42 transition-colors dark:text-foreground/50 group-data-[highlighted]:text-primary/72 dark:group-data-[highlighted]:text-primary/70" title={c.id}>
                                                                        {c.id}
                                                                    </p>
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
// Unified App Entry Point
// ----------------------------------------------------------------------
export function UnifiedSubgroupEditor() {
    const { currentValues, updateValue, assignCatalogGroup } = useConfig();
    const subgroupOrder = currentValues["subgroup_order"] || {};
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrderFromConfig = Array.isArray(currentValues["main_group_order"])
        ? (currentValues["main_group_order"] as string[])
        : EMPTY_STRING_ARRAY;
    const [mainGroupOrder, setMainGroupOrder] = useState<string[]>(mainGroupOrderFromConfig);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createParentUUID, setCreateParentUUID] = useState<string | undefined>();
    const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeMainGroupId, setActiveMainGroupId] = useState<string | null>(null);
    const [recentUnassigns, setRecentUnassigns] = useState<Record<string, string>>({}); // subgroupName -> parentUuid

    const handleUnassignSubgroup = (subgroupName: string, parentUuid: string) => {
        setRecentUnassigns(prev => ({ ...prev, [subgroupName]: parentUuid }));
    };

    React.useEffect(() => {
        setMainGroupOrder(prev => (stringArraysEqual(prev, mainGroupOrderFromConfig) ? prev : mainGroupOrderFromConfig));
    }, [mainGroupOrderFromConfig]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleMainDragStart = (event: DragStartEvent) => {
        setActiveMainGroupId(String(event.active.id));
    };

    const handleMainDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveMainGroupId(null);
        if (over && active.id !== over.id) {
            const activeId = String(active.id);
            const overId = String(over.id);
            const oldIndex = mainGroupOrder.indexOf(activeId);
            const newIndex = mainGroupOrder.indexOf(overId);
            const newArray = arrayMove(mainGroupOrder, oldIndex, newIndex);

            setMainGroupOrder(newArray);
            updateValue(["main_group_order"], newArray);
        }
    };

    // Filter unassigned subgroups
    const catalogGroups = currentValues.catalog_groups || {};
    const assignedGroups = new Set<string>();

    // Check subgroup_order (uuid → string[])
    Object.values(subgroupOrder as Record<string, unknown>).forEach((arr) => {
        if (Array.isArray(arr)) {
            arr.forEach((name) => {
                if (typeof name === "string") assignedGroups.add(name);
            });
        }
    });

    // Also check main_catalog_groups[uuid].subgroupNames
    Object.values(mainCatalogGroups as Record<string, unknown>).forEach((group) => {
        if (group && typeof group === "object") {
            const subgroupNames = (group as { subgroupNames?: unknown }).subgroupNames;
            if (Array.isArray(subgroupNames)) {
                subgroupNames.forEach((name) => {
                    if (typeof name === "string") assignedGroups.add(name);
                });
            }
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
            <div className={cn(editorSurface.card, "overflow-hidden")}>
                {/* Unified Sticky Toolbar */}
                <div className={cn(editorSurface.toolbar, "sticky top-0 z-30 grid grid-cols-2 items-center gap-2 rounded-none border-x-0 border-t-0 p-3 sm:flex sm:flex-wrap")}>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                        className="col-span-2 sm:col-auto bg-primary hover:bg-primary/92 text-primary-foreground font-bold h-9 sm:h-8 px-3 shadow-lg shadow-primary/20 whitespace-nowrap justify-center sm:justify-start"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Create New Group
                    </Button>
                    <Button
                        onClick={() => setIsAddToGroupModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-9 sm:h-8 text-sm sm:text-sm border-border/60 hover:bg-muted/60 dark:hover:bg-muted/40 text-foreground/70 hover:text-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out px-3 font-medium whitespace-nowrap justify-center sm:justify-start"
                    >
                        <FolderPlus className="w-4 h-4 mr-1.5" /> Add to Group
                    </Button>
                    <Button
                        onClick={() => setIsImportModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-9 sm:h-8 text-sm sm:text-sm border-border/60 hover:bg-muted/60 dark:hover:bg-muted/40 text-foreground/70 hover:text-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out px-3 font-medium whitespace-nowrap justify-center sm:justify-start"
                    >
                        <UploadCloud className="w-4 h-4 mr-1.5" />
                        <span className="sm:hidden">Update</span>
                        <span className="hidden sm:inline">Update from Template</span>
                    </Button>
                </div>

                <div className="p-4 bg-transparent">
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        modifiers={[restrictVerticalDrag]}
                        onDragStart={handleMainDragStart}
                        onDragEnd={handleMainDragEnd}
                    >
                        <SortableContext items={mainGroupOrder} strategy={verticalListSortingStrategy}>
                            <Accordion type="single" collapsible className="w-full space-y-0">
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

                        {activeMainGroupId && typeof document !== 'undefined' ? createPortal(
                            <DragOverlay dropAnimation={{
                                sideEffects: defaultDropAnimationSideEffects({
                                    styles: {
                                        active: {
                                            opacity: '0.4',
                                        },
                                    },
                                }),
                            }}>
                                <div className="border border-primary rounded-xl overflow-hidden bg-card shadow-2xl scale-[1.02] opacity-95 p-4 flex items-center gap-4">
                                    <GripVertical className="h-5 w-5 text-primary" />
                                    <div className="font-bold text-lg tracking-tight text-foreground">
                                        {formatDisplayName(mainCatalogGroups[activeMainGroupId]?.name || "Moving Group...")}
                                    </div>
                                </div>
                            </DragOverlay>,
                            document.body
                        ) : null}
                    </DndContext>
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
                    <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
                        <FolderPlus className="w-8 h-8 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">No Main Groups Found</p>
                        <p className="text-xs text-foreground/70 max-w-[280px] leading-relaxed mx-auto">
                            Start by creating a new group or add existing subgroups from the library below.
                        </p>
                    </div>
                </div>
            )}

            {unassignedGroups.length > 0 && (
                <div className="mt-8 border border-border rounded-xl bg-card/20 overflow-hidden shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 sm:p-5 bg-muted/5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/25">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Unassigned Subgroups</h3>
                                    <p className="text-sm text-foreground/70">Subgroups that are defined but not linked to any main group yet.</p>
                                </div>
                            </div>
                            <span className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-semibold text-foreground/70">
                                {unassignedGroups.length}
                            </span>
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
                </div>
            )}

            <TrashBin />
        </div>
    );
}

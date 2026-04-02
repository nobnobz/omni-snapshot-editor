"use client";

import React, { useDeferredValue, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
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
import { GripVertical, ImageIcon, LinkIcon, ChevronRight, ChevronDown, RotateCcw, Search, X, Plus, Pencil, Trash2, FolderPlus, FolderInput, UploadCloud, AlertTriangle, Check, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RenameGroupModal } from "./RenameGroupModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddToGroupModal } from "./AddToGroupModal";
import { ImportSetupModal } from "./ImportSetupModal";
import { LockedUrlInput } from "./LockedUrlInput";
import { TrashBin } from "./TrashBin";
import { hasAIOMetadataCatalogMatch, type AIOMetadataMismatchAnalysis } from "@/lib/aiometadata-mismatch";
import { cn, formatDisplayName, resolveCatalogName, ensureCatalogPrefix } from "@/lib/utils";
import { editorCompactBadge, editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { CATALOG_FALLBACKS, CatalogFallback } from "@/lib/catalog-fallbacks";
import { Label } from "@/components/ui/label";
import { normalizeSubgroupNames } from "@/lib/main-group-utils";
import { shallowEqualObject } from "@/lib/equality";

const stringArraysEqual = (a: string[], b: string[]) => (
    a.length === b.length && a.every((item, idx) => item === b[idx])
);
const reconcileOrderedNames = (snapshot: string[], currentNames: string[]) => {
    const currentNameSet = new Set(currentNames);
    const preserved = snapshot.filter((name) => currentNameSet.has(name));
    const preservedSet = new Set(preserved);
    const appended = currentNames.filter((name) => !preservedSet.has(name));
    return [...preserved, ...appended];
};
const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_RECORD: Record<string, never> = {};
type ThumbnailAspect = "portrait" | "landscape" | "square";
type CatalogOption = { id: string; name: string };

// Catalog reorder is vertical-only; locking X prevents visible sideways jumps while dragging.
const restrictVerticalDrag: Modifier = ({ transform }) => ({
    ...transform,
    x: 0,
});

const subgroupCountBadgeClass =
    "ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full border border-slate-200/70 bg-slate-100/75 px-1.5 text-[10px] font-semibold tabular-nums leading-none text-foreground/62 shadow-sm transition-colors dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/58";

const subgroupCountInlineClass =
    "inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full border border-slate-200/65 bg-slate-100/70 px-1.5 text-[10px] font-semibold tabular-nums leading-none text-foreground/58 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/56";

const aiomMismatchBadgeClass =
    "inline-flex h-5 items-center justify-center gap-1 rounded-full border border-amber-300/45 bg-amber-500/12 px-1.5 text-[10px] font-semibold leading-none text-amber-700 shadow-sm dark:border-amber-400/25 dark:bg-amber-400/12 dark:text-amber-200";

const buildSubgroupAnchorId = (parentUUID: string, subgroupName: string) =>
    `subgroup-node-${parentUUID}-${subgroupName.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;

const PosterUrlEditor = React.memo(function PosterUrlEditor({
    imageUrl,
    onCommit,
}: {
    imageUrl: string;
    onCommit: (nextUrl: string) => void;
}) {
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const [thumbAspect, setThumbAspect] = useState<ThumbnailAspect>("square");
    const [thumbLoadError, setThumbLoadError] = useState(false);

    React.useEffect(() => {
        setPreviewUrl(prev => (prev === imageUrl ? prev : imageUrl));
    }, [imageUrl]);

    React.useEffect(() => {
        setThumbAspect("square");
        setThumbLoadError(false);
    }, [previewUrl]);

    const commitUrl = (nextUrl: string) => {
        setPreviewUrl(prev => (prev === nextUrl ? prev : nextUrl));
        if (nextUrl !== imageUrl) {
            onCommit(nextUrl);
        }
    };

    const hasThumbPreview = /^https?:\/\//i.test(previewUrl.trim()) && !thumbLoadError;
    const thumbFrameClass = thumbAspect === "landscape"
        ? "aspect-[16/9] w-full max-w-[15rem] sm:h-20 sm:w-32 sm:aspect-auto"
        : thumbAspect === "portrait"
            ? "aspect-[2/3] w-28 sm:h-28 sm:w-20 sm:aspect-auto"
            : "aspect-square w-28 sm:h-20 sm:w-20 sm:aspect-auto";

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:gap-6 sm:rounded-lg sm:border sm:p-5",
                    "sm:border-slate-200/80 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,249,0.46))] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:backdrop-blur-sm",
                    "dark:sm:border-white/8 dark:sm:bg-[linear-gradient(180deg,rgba(20,23,29,0.9),rgba(18,21,27,0.88))] dark:sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                )}
            >
                <div className="flex flex-col items-center gap-2 sm:block">
                    <Label className="self-start text-[10px] uppercase font-bold tracking-[0.16em] text-foreground/50 sm:hidden">
                        Poster Image URL
                    </Label>
                    <div
                        className={cn(
                            thumbFrameClass,
                            "mx-auto rounded-md shrink-0 overflow-hidden shadow-sm flex items-center justify-center transition-[width,height] duration-200 border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(241,245,249,0.56))] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(22,27,36,0.94),rgba(15,19,27,0.92))]"
                        )}
                    >
                        {hasThumbPreview ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic subgroup thumbnail preview from user-provided URL. */}
                                <img
                                    src={previewUrl}
                                    alt="Thumb"
                                    className="h-full w-full object-cover"
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
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                    <Label className="hidden sm:block text-xs uppercase font-bold tracking-widest text-foreground/70">Poster Image URL</Label>
                    <LockedUrlInput
                        value={imageUrl}
                        onCommit={(nextUrl) => commitUrl(nextUrl ?? "")}
                        placeholder="https://..."
                        stopPropagation
                        inputClassName={`${editorSurface.field} h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-colors`}
                        iconButtonClassName="h-8 w-8 shrink-0 rounded-md text-foreground/56 sm:h-7 sm:w-7"
                        copyTitle="Copy image URL"
                        clearTitle="Delete image URL"
                    />
                </div>
            </div>
        </div>
    );
});

function AIOMismatchBadge({
    count,
    className,
}: {
    count: number;
    className?: string;
}) {
    if (count <= 0) return null;

    return (
        <Badge
            variant="outline"
            className={cn(aiomMismatchBadgeClass, className)}
            title={`${count} attention item${count === 1 ? "" : "s"} in this section.`}
        >
            <AlertTriangle className="h-3 w-3" />
            <span>{count}</span>
        </Badge>
    );
}

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

const groupCatalogOptions = (options: CatalogOption[]) => {
    const groups: Record<string, CatalogOption[]> = { Other: [] };

    options.forEach((catalog) => {
        const match = catalog.name.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
            const category = match[1];
            const cleanName = match[2];
            if (!groups[category]) groups[category] = [];
            groups[category].push({ ...catalog, name: cleanName });
            return;
        }

        groups.Other.push(catalog);
    });

    const sortedCategories = Object.keys(groups)
        .filter((category) => category !== "Other")
        .sort((a, b) => a.localeCompare(b));

    if (groups.Other.length > 0) {
        sortedCategories.push("Other");
    }

    return sortedCategories.map((category) => ({
        category,
        options: groups[category],
    }));
};

const SubgroupCatalogPickerDialog = React.memo(function SubgroupCatalogPickerDialog({
    open,
    onOpenChange,
    catalogSearch,
    onCatalogSearchChange,
    filteredCatalogs,
    inputRef,
    onSelectCatalog,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogSearch: string;
    onCatalogSearchChange: (value: string) => void;
    filteredCatalogs: CatalogOption[];
    inputRef: React.RefObject<HTMLInputElement | null>;
    onSelectCatalog: (catalogId: string) => void;
}) {
    const groupedCatalogs = React.useMemo(
        () => groupCatalogOptions(filteredCatalogs),
        [filteredCatalogs]
    );

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) onCatalogSearchChange("");
            }}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(editorSurface.dropzone, "w-full justify-start text-xs text-foreground/75 hover:text-foreground hover:border-primary/45 hover:bg-primary/5 transition-all active:scale-[0.995]")}
                >
                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Catalog...
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(editorSurface.card, "w-[min(92vw,32rem)] gap-0 overflow-hidden border p-0")}
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                }}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                }}
            >
                <DialogHeader className={cn(editorSurface.overlaySection, "space-y-2 border-b border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(239,246,255,0.5))] p-4 dark:border-primary/14 dark:bg-[linear-gradient(180deg,rgba(18,24,35,0.95),rgba(14,20,31,0.92))]")}>
                    <div className="pr-8">
                        <DialogTitle className="text-sm font-semibold tracking-tight">Select Catalog</DialogTitle>
                        <DialogDescription className="mt-1 text-xs text-foreground/62">
                            Add another catalog to this subgroup.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/58">
                            Catalogs
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/78 dark:text-primary/70">
                            {filteredCatalogs.length} available
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/60" />
                        <Input
                            ref={inputRef}
                            placeholder="Search by name or ID..."
                            value={catalogSearch}
                            onChange={(event) => onCatalogSearchChange(event.target.value)}
                            className={cn(editorSurface.field, "h-10 sm:h-9 pl-8 text-base sm:text-sm focus-visible:ring-ring/50")}
                        />
                    </div>
                </DialogHeader>
                <div className={cn(editorSurface.overlayList, "max-h-[min(60vh,22rem)] overflow-y-auto p-2 custom-scrollbar")}>
                    {filteredCatalogs.length === 0 ? (
                        <p className="p-4 text-center text-xs text-foreground/70">No catalogs found.</p>
                    ) : (
                        groupedCatalogs.map(({ category, options }) => (
                            <div key={category} className="mb-2 last:mb-0">
                                <div className={cn(editorSurface.sticky, "sticky top-0 z-[60] mb-1 px-2.5 py-2")}>
                                    <h5 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/52">{category}</h5>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    {options.map((catalog) => (
                                        <button
                                            key={catalog.id}
                                            type="button"
                                            onClick={() => {
                                                onSelectCatalog(catalog.id);
                                                onOpenChange(false);
                                            }}
                                            className="group flex items-center gap-3 rounded-md border border-transparent px-2.5 py-2 text-left transition-colors hover:border-primary/20 hover:bg-primary/10 dark:hover:border-primary/22 dark:hover:bg-primary/20"
                                        >
                                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                                                {catalog.name}
                                            </p>
                                            <p
                                                className="max-w-[40%] shrink-0 truncate text-right text-xs font-mono text-foreground/42 transition-colors dark:text-foreground/50 group-hover:text-primary/72 dark:group-hover:text-primary/70"
                                                title={catalog.id}
                                            >
                                                {catalog.id}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});

// ----------------------------------------------------------------------
// 1. Sortable Catalog Node (Inside a Subgroup)
// ----------------------------------------------------------------------
const SortableCatalogNode = React.memo(function SortableCatalogNode({ id, onRemove }: { id: string, onRemove?: () => void }) {
    const { configCustomNames, customFallbacks } = useConfigSelector((state) => ({
        configCustomNames: state.currentValues["custom_catalog_names"] || {},
        customFallbacks: state.customFallbacks,
    }), shallowEqualObject);

    // Construct effective custom names (Config Custom Names > AIOMetadata > Default)
    const aioFallbacks = customFallbacks as Record<string, string | CatalogFallback>;

    const getCustomName = (value: unknown) => {
        if (typeof value === "string") {
            return value.trim() !== "" ? value : undefined;
        }

        if (value && typeof value === "object" && "name" in value) {
            const name = value.name;
            if (typeof name === "string" && name.trim() !== "") {
                return name;
            }
        }

        return undefined;
    };

    // Some IDs have prefixes like 'movie:mdblist.12306', AIOMetadata uses 'mdblist.12306'
    let baseId = id;
    if (id.includes(":")) {
        const parts = id.split(":");
        if (parts.length === 2 && ["movie", "series", "anime", "all"].includes(parts[0])) {
            baseId = parts[1];
        } else if (id.startsWith("movie:trakt-list") || id.startsWith("series:trakt-list")) {
            // keep it if complex, or try to extract
        } else {
            // Fallback for generic prefix stripping if it matches common AIO formats
            baseId = parts.slice(1).join(":");
        }
    }
    // Specific match for AIO Trakt format if necessary (this is a best effort)
    const strippedTraktId = id.replace(/^(movie|series|anime|all):/, "");

    const customNameFromConfig = getCustomName(configCustomNames[id] || configCustomNames[baseId]);
    const customNameFromAIO = getCustomName(aioFallbacks[id] || aioFallbacks[baseId] || aioFallbacks[strippedTraktId]);

    let displayName = "";
    if (customNameFromConfig && customNameFromConfig !== id) {
        displayName = formatDisplayName(customNameFromConfig);
    } else if (customNameFromAIO && customNameFromAIO !== id) {
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
    const showAioCatalogMismatch = Object.keys(aioFallbacks).length > 0 && !hasAIOMetadataCatalogMatch(id, aioFallbacks);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 sm:gap-4 sm:p-3.5 border rounded-xl mb-2.5 group/cat transition-[background-color,border-color,opacity,box-shadow] duration-150
                ${isDragging ? "opacity-15 border-border/70 bg-muted/45 border-dashed shadow-none" : `${editorSurface.field} hover:border-slate-300/85 dark:hover:border-white/12 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_22px_rgba(2,6,23,0.18)]`}`}
        >
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab shrink-0 p-1.5 sm:p-2 rounded-lg transition-colors select-none ${isDragging ? "text-foreground/75" : "text-foreground/55 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"}`}
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
                {showAioCatalogMismatch && (
                    <span
                        title="Not found in synced AIOMetadata catalogs"
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-300/45 bg-amber-500/10 p-1 text-amber-700 shadow-sm dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200"
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                )}
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className={`h-8 w-8 sm:h-9 sm:w-9 ${editorHover.iconDanger} rounded-md`}
                        aria-label="Remove catalog from subgroup"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
});

// ----------------------------------------------------------------------
// 2. Sortable Subgroup Node containing Catalogs & URL
// ----------------------------------------------------------------------
function SortableSubgroupNode({ subgroupName, parentUUID, onUnassign, isExpanded: propIsExpanded, onToggle, rowAnchorId, mismatchCount = 0 }: { subgroupName: string, parentUUID: string, onUnassign?: (name: string, parentId: string) => void, isExpanded?: boolean, onToggle?: () => void, rowAnchorId?: string, mismatchCount?: number }) {
    const {
        rawCatalogsList,
        imageUrl,
        rawCustomNames,
        mainCatalogGroups,
        catalogs,
        customFallbacks,
    } = useConfigSelector((state) => ({
        rawCatalogsList: state.currentValues.catalog_groups?.[subgroupName],
        imageUrl: typeof state.currentValues.catalog_group_image_urls?.[subgroupName] === "string"
            ? state.currentValues.catalog_group_image_urls[subgroupName]
            : "",
        rawCustomNames: state.currentValues["custom_catalog_names"],
        mainCatalogGroups: state.currentValues.main_catalog_groups || {},
        catalogs: state.catalogs,
        customFallbacks: state.customFallbacks,
    }), shallowEqualObject);
    const { updateValue, renameCatalogGroup, unassignCatalogGroup, assignCatalogGroup } = useConfigActions();

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
    const catalogsList: string[] = Array.isArray(rawCatalogsList) ? rawCatalogsList : EMPTY_STRING_ARRAY;

    const [subgroupCatalogs, setSubgroupCatalogs] = useState<string[]>(catalogsList);
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

    const customNames: Record<string, string> = React.useMemo(() => rawCustomNames || {}, [rawCustomNames]);
    const catalogOptions = React.useMemo<CatalogOption[]>(() => {
        if (!isAddMenuOpen) return [];

        const options: CatalogOption[] = [];

        // 1. All existing catalogs not already in subgroupCatalogs
        const existingBaseIds = new Set<string>();
        for (const c of catalogs) {
            existingBaseIds.add(c.id.replace(/^(movie:|series:|all:)/, ''));
            if (!subgroupCatalogs.includes(c.id)) {
                options.push({
                    id: c.id,
                    name: resolveCatalogName(c.id, customNames) || c.name || c.id
                });
            }
        }

        // 2. Fallbacks not already in subgroupCatalogs
        const allFallbacks: Record<string, string | CatalogFallback> = { ...CATALOG_FALLBACKS, ...customFallbacks as Record<string, string | CatalogFallback> };
        Object.entries(allFallbacks).forEach(([id, fallback]) => {
            const name = typeof fallback === 'string' ? fallback : fallback.name;
            if (!existingBaseIds.has(id.replace(/^(movie:|series:|all:)/, ''))) {
                const displayName = customNames[id] || name;
                let finalId = id;
                if (!id.includes(':')) {
                    const explicitType = (fallback && typeof fallback !== 'string') ? fallback.type : undefined;
                    finalId = ensureCatalogPrefix(id, displayName, explicitType);
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
    }, [catalogs, customFallbacks, customNames, subgroupCatalogs, isAddMenuOpen]);

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
    }, [catalogsList]);

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
        ? resolveCatalogName(activeCatalogId, customNames)
        : "";

    const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-subgroup-no-toggle='true']")) return;
        toggleExpanded();
    };

    const handleAddCatalog = (catalogId: string) => {
        if (!catalogId.trim()) return;
        const name = resolveCatalogName(catalogId.trim(), customNames);
        const normalizedId = ensureCatalogPrefix(catalogId.trim(), name);

        const updated = [...subgroupCatalogs, normalizedId];
        setSubgroupCatalogs(updated);
        updateValue(["catalog_groups", subgroupName], updated);
        setIsAddMenuOpen(false);
    };

    return (
        <div id={rowAnchorId} ref={setNodeRef} style={style} className={`${editorSurface.card} rounded-xl overflow-hidden mb-3 ${isDragging ? "opacity-50 border-primary scale-[1.01] shadow-2xl" : ""}`}>
            {/* Header: Drag Handle + Subgroup Name */}
            <div
                onClick={handleHeaderClick}
                className={`group/subgroup flex items-stretch gap-4 p-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(248,250,252,0.14))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.012))] backdrop-blur-sm ${isExpanded ? "border-b border-slate-200/75 dark:border-white/8" : ""}`}
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
                    <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
                        <span className="truncate font-bold text-sm text-foreground transition-colors group-hover/subgroup:text-primary dark:group-hover/subgroup:text-primary">{formatDisplayName(subgroupName)}</span>
                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                            <AIOMismatchBadge count={mismatchCount} />
                            <Badge
                                variant="outline"
                                className={cn(subgroupCountBadgeClass, "shrink-0")}
                            >
                                {subgroupCatalogs.length}
                            </Badge>
                        </div>
                    </div>
                </button>

                {/* Action Buttons: Desktop Header, Mobile hidden here (moved to layout section below) */}
                <div data-subgroup-no-toggle="true" className="hidden sm:flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-lg transition-colors ${editorHover.iconAction}`}
                                title="Move to another group"
                                aria-label="Move subgroup"
                            >
                                <FolderInput className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn(editorSurface.overlay, "w-56")}>
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Move to group</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-primary/10" />
                            {(Object.entries(mainCatalogGroups) as [string, { name: string }][]).map(([uuid, mg]) => (
                                <DropdownMenuItem
                                    key={uuid}
                                    disabled={uuid === parentUUID}
                                    onSelect={() => assignCatalogGroup(subgroupName, uuid)}
                                    className="cursor-pointer"
                                >
                                    <span className={cn("flex-1 truncate", uuid === parentUUID && "text-primary font-bold")}>
                                        {formatDisplayName(mg.name)}
                                    </span>
                                    {uuid === parentUUID && <Check className="ml-2 h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                <div className="space-y-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(248,250,252,0.1))] p-6 sm:p-8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                    {/* Image URL Input */}
                    <div className="space-y-2">
                        <PosterUrlEditor
                            imageUrl={imageUrl}
                            onCommit={(nextUrl) => updateValue(["catalog_group_image_urls", subgroupName], nextUrl)}
                        />

                        {/* Mobile Action Buttons: Move here under layout */}
                        <div className="sm:hidden grid grid-cols-3 gap-2 pt-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm" aria-label="Move subgroup"
                                        className={`${editorSurface.field} h-9 text-xs text-foreground/70 hover:text-foreground flex items-center justify-center`}
                                    >
                                        <FolderInput className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                        <span className="hidden sm:inline">Move</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" sideOffset={8} className={cn(editorSurface.overlay, "w-64 max-w-[calc(100vw-2rem)]")}>
                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Move to group</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-primary/10" />
                                    {(Object.entries(mainCatalogGroups) as [string, { name: string }][]).map(([uuid, mg]) => (
                                        <DropdownMenuItem
                                            key={uuid}
                                            disabled={uuid === parentUUID}
                                            onSelect={() => assignCatalogGroup(subgroupName, uuid)}
                                            className="cursor-pointer py-3"
                                        >
                                            <span className={cn("flex-1 truncate", uuid === parentUUID && "text-primary font-bold")}>
                                                {formatDisplayName(mg.name)}
                                            </span>
                                            {uuid === parentUUID && <Check className="ml-2 h-4 w-4 text-primary" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Rename subgroup"
                                className={`${editorSurface.field} h-9 text-xs text-foreground/70 hover:text-foreground flex items-center justify-center`}
                            >
                                <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                <span className="hidden sm:inline">Rename</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    unassignCatalogGroup(subgroupName);
                                    if (onUnassign) onUnassign(subgroupName, parentUUID);
                                }}
                                aria-label="Delete subgroup"
                                className={cn(editorSurface.field, "h-9 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/30 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/15 flex items-center justify-center")}
                            >
                                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        </div>
                    </div>

                    {/* Inner Sortable Catalogs */}
                    <div
                        className={cn(
                            "space-y-3 sm:rounded-lg sm:border sm:p-6",
                            "sm:border-slate-200/80 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,249,0.46))] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:backdrop-blur-sm",
                            "dark:sm:border-white/8 dark:sm:bg-[linear-gradient(180deg,rgba(20,23,29,0.9),rgba(18,21,27,0.88))] dark:sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
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

                        {/* Add New Catalog Dialog */}
                        <div className="pt-1 sm:pt-0">
                            <SubgroupCatalogPickerDialog
                                open={isAddMenuOpen}
                                onOpenChange={setIsAddMenuOpen}
                                catalogSearch={catalogSearch}
                                onCatalogSearchChange={setCatalogSearch}
                                filteredCatalogs={filteredCatalogs}
                                inputRef={addCatalogSearchInputRef}
                                onSelectCatalog={handleAddCatalog}
                            />
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
const MainGroupNode = React.memo(function MainGroupNode({
    uuid,
    name,
    subgroupNames,
    onUnassignSubgroup,
    onAddSubgroup,
    searchTerm,
    mismatchCount = 0,
    subgroupMismatchCounts = {},
    manualSubgroupOrderSnapshot,
    onManualSubgroupOrderSnapshotChange,
}: {
    uuid: string,
    name: string,
    subgroupNames: string[],
    onUnassignSubgroup?: (name: string, parentId: string) => void,
    onAddSubgroup?: (uuid: string) => void,
    searchTerm: string,
    mismatchCount?: number,
    subgroupMismatchCounts?: Record<string, number>,
    manualSubgroupOrderSnapshot?: string[],
    onManualSubgroupOrderSnapshotChange?: (uuid: string, order: string[]) => void,
}) {
    const { mainGroupData } = useConfigSelector((state) => ({
        mainGroupData: state.currentValues.main_catalog_groups?.[uuid] || {},
    }), shallowEqualObject);
    const { updateValue, renameMainCatalogGroup, removeMainCatalogGroup } = useConfigActions();
    const [isRenaming, setIsRenaming] = useState(false);

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
    const filteredSubgroups = React.useMemo(() => {
        if (!searchTerm) return subgroupNames;
        const q = searchTerm.toLowerCase();
        return subgroupNames.filter(sg => sg.toLowerCase().includes(q));
    }, [subgroupNames, searchTerm]);

    const [subgroups, setSubgroups] = useState(filteredSubgroups);
    const [activeSubgroupId, setActiveSubgroupId] = useState<string | null>(null);
    const [expandedSubgroup, setExpandedSubgroup] = useState<string | null>(null);
    const [subgroupSortMode, setSubgroupSortMode] = useState<"manual" | "asc" | "desc">("manual");
    const effectiveManualSubgroupOrder = React.useMemo(
        () => reconcileOrderedNames(manualSubgroupOrderSnapshot ?? subgroupNames, subgroupNames),
        [manualSubgroupOrderSnapshot, subgroupNames]
    );

    React.useEffect(() => {
        setSubgroups(prev => (stringArraysEqual(prev, filteredSubgroups) ? prev : filteredSubgroups));
    }, [filteredSubgroups]);

    React.useEffect(() => {
        if (subgroupSortMode !== "manual") return;
        if (stringArraysEqual(effectiveManualSubgroupOrder, subgroupNames)) return;
        onManualSubgroupOrderSnapshotChange?.(uuid, subgroupNames);
    }, [effectiveManualSubgroupOrder, onManualSubgroupOrderSnapshotChange, subgroupNames, subgroupSortMode, uuid]);

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
            onManualSubgroupOrderSnapshotChange?.(uuid, newArray);
            setSubgroupSortMode("manual");

            // We need to update both subgroup_order and main_catalog_groups.subgroupNames
            updateValue(["subgroup_order", uuid], newArray);
            updateValue(["main_catalog_groups", uuid, "subgroupNames"], newArray);
        }
    };

    const commitSubgroupOrder = (nextOrder: string[]) => {
        setSubgroups(searchTerm
            ? nextOrder.filter((subgroupName) => subgroupName.toLowerCase().includes(searchTerm.toLowerCase()))
            : nextOrder
        );
        updateValue(["subgroup_order", uuid], nextOrder);
        updateValue(["main_catalog_groups", uuid, "subgroupNames"], nextOrder);
    };

    const handleSortSubgroups = (direction: "asc" | "desc") => {
        const sorted = [...subgroupNames].sort((left, right) => {
            const comparison = left.localeCompare(right, undefined, { sensitivity: "base" });
            return direction === "asc" ? comparison : -comparison;
        });

        commitSubgroupOrder(sorted);
        setSubgroupSortMode(direction);
    };

    const handleRestoreManualSubgroupOrder = () => {
        commitSubgroupOrder(effectiveManualSubgroupOrder);
        setSubgroupSortMode("manual");
    };

    const handleToggleSubgroup = (subgroupName: string) => {
        const nextExpanded = expandedSubgroup === subgroupName ? null : subgroupName;
        setExpandedSubgroup(nextExpanded);
    };

    return (
        <div
            id={`main-group-${uuid}`}
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

                    <AccordionTrigger indicator="right-down" className={`flex-1 items-center text-foreground px-4 py-4 transition-colors group/trigger ${editorHover.rowSubtle}`}>
                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="min-w-0 basis-full truncate font-bold text-base text-foreground group-hover/trigger:text-primary transition-colors sm:basis-auto sm:flex-1">
                                {formatDisplayName(name)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-center gap-1">
                                {posterSize !== "Default" && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            editorCompactBadge.base,
                                            posterSize === "Small"
                                                ? editorCompactBadge.primary
                                                : editorCompactBadge.neutral
                                        )}
                                    >
                                        {posterSize}
                                    </Badge>
                                )}
                                {posterType === "Poster" && (
                                    <Badge variant="outline" className={cn(editorCompactBadge.base, editorCompactBadge.cyan)}>Poster</Badge>
                                )}
                                {posterType === "Square" && (
                                    <Badge variant="outline" className={cn(editorCompactBadge.base, editorCompactBadge.emerald)}>Square</Badge>
                                )}
                                {posterType === "Landscape" && (
                                    <Badge variant="outline" className={cn(editorCompactBadge.base, editorCompactBadge.orange)}>Landscape</Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        editorCompactBadge.base,
                                        editorCompactBadge.neutral
                                    )}
                                >
                                    {subgroupNames.length} {subgroupNames.length === 1 ? "Group" : "Groups"}
                                </Badge>
                                <AIOMismatchBadge count={mismatchCount} />
                                {subgroupNames.length === 0 && (
                                    <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider">Empty Group</span>
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

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
                                        title="Sort subgroups"
                                        aria-label="Sort subgroups"
                                    >
                                        {subgroupSortMode === "desc" ? (
                                            <ArrowDownAZ className="w-4 h-4" />
                                        ) : (
                                            <ArrowUpAZ className="w-4 h-4" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={cn(editorSurface.overlay, "min-w-[11rem]")}>
                                    <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground/55 font-semibold">
                                        Sort Subgroups
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleSortSubgroups("asc")} className="text-xs">
                                        <ArrowUpAZ className="mr-2 h-3.5 w-3.5" />
                                        A-Z{subgroupSortMode === "asc" ? " ✓" : ""}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSortSubgroups("desc")} className="text-xs">
                                        <ArrowDownAZ className="mr-2 h-3.5 w-3.5" />
                                        Z-A{subgroupSortMode === "desc" ? " ✓" : ""}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem
                                        onClick={handleRestoreManualSubgroupOrder}
                                        className="text-xs"
                                        disabled={subgroupSortMode === "manual"}
                                    >
                                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                        Default{subgroupSortMode === "manual" ? " ✓" : ""}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="hidden sm:block w-px h-4 bg-border mx-1 shrink-0" />

                            <div className="ml-auto flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsRenaming(true)}
                                    className="h-8 w-8 shrink-0 text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
                                    title="Rename Group"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            title="Delete Group"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent size="sm">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Main Group?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-foreground/70">
                                                This will remove the group <span className="text-foreground font-bold">&quot;{formatDisplayName(name)}&quot;</span> and all its subgroups. You can restore them anytime from the Recycle Bin at the bottom.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-2 sm:mt-3">
                                            <AlertDialogCancel className="bg-muted border-border text-foreground/70 hover:bg-accent hover:text-accent-foreground sm:min-w-[9rem]">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeMainCatalogGroup(uuid)}
                                                className="bg-red-600 text-white hover:bg-red-700 font-bold sm:min-w-[11rem]"
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
                                    <span className="hidden sm:inline">New</span>
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
                                            mismatchCount={subgroupMismatchCounts[sg] || 0}
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
});

// ----------------------------------------------------------------------
// 3. Global Subgroup Library (List of all catalog_groups)
// ----------------------------------------------------------------------

const UnassignedSubgroupRow = React.memo(function UnassignedSubgroupRow({
    groupName,
    catalogs: subgroupCatalogsProp,
    onRestore,
    restoreParentName,
    isExpanded: propIsExpanded,
    onToggle,
    mismatchCount = 0,
}: {
    groupName: string,
    catalogs: string[],
    onRestore?: () => void,
    restoreParentName?: string,
    isExpanded?: boolean,
    onToggle?: () => void,
    mismatchCount?: number,
}) {
    const {
        mainCatalogGroups,
        mainGroupOrder,
        imageUrl,
        rawCustomNames,
        fullCatalogs,
        customFallbacks,
    } = useConfigSelector((state) => ({
        mainCatalogGroups: (state.currentValues["main_catalog_groups"] as Record<string, { name?: string; subgroupNames?: string[] }> | undefined) ?? EMPTY_RECORD,
        mainGroupOrder: (state.currentValues["main_group_order"] as string[] | undefined) ?? EMPTY_STRING_ARRAY,
        imageUrl: typeof state.currentValues.catalog_group_image_urls?.[groupName] === "string"
            ? state.currentValues.catalog_group_image_urls[groupName]
            : "",
        rawCustomNames: state.currentValues["custom_catalog_names"],
        fullCatalogs: state.catalogs,
        customFallbacks: state.customFallbacks,
    }), shallowEqualObject);
    const { updateValue, assignCatalogGroup, removeCatalogGroup, renameCatalogGroup } = useConfigActions();

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

    const customNames: Record<string, string> = React.useMemo(() => rawCustomNames || {}, [rawCustomNames]);
    const catalogOptions = React.useMemo<CatalogOption[]>(() => {
        if (!isAddMenuOpen) return [];

        const options: CatalogOption[] = [];

        const existingBaseIds = new Set<string>();
        for (const c of fullCatalogs) {
            existingBaseIds.add(c.id.replace(/^(movie:|series:|all:)/, ''));
            if (!subgroupCatalogsProp.includes(c.id)) {
                options.push({
                    id: c.id,
                    name: resolveCatalogName(c.id, customNames) || c.name || c.id
                });
            }
        }

        const allFallbacks: Record<string, string | CatalogFallback> = { ...CATALOG_FALLBACKS, ...customFallbacks as Record<string, string | CatalogFallback> };
        Object.entries(allFallbacks).forEach(([id, fallback]) => {
            const name = typeof fallback === 'string' ? fallback : fallback.name;
            if (!existingBaseIds.has(id.replace(/^(movie:|series:|all:)/, ''))) {
                const displayName = customNames[id] || name;
                const explicitType = (fallback && typeof fallback !== 'string') ? fallback.type : undefined;
                const finalId = ensureCatalogPrefix(id, displayName, explicitType);

                if (!subgroupCatalogsProp.includes(finalId)) {
                    options.push({
                        id: finalId,
                        name: displayName
                    });
                }
            }
        });

        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [fullCatalogs, customFallbacks, customNames, subgroupCatalogsProp, isAddMenuOpen]);

    const filteredCatalogs = React.useMemo(() => {
        if (!catalogSearch) return catalogOptions;
        const q = catalogSearch.toLowerCase();
        return catalogOptions.filter(c =>
            c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
    }, [catalogOptions, catalogSearch]);

    const handleAddCatalog = (catalogId: string) => {
        if (!catalogId.trim()) return;
        const name = resolveCatalogName(catalogId.trim(), customNames);
        const normalizedId = ensureCatalogPrefix(catalogId.trim(), name);

        const updated = [...subgroupCatalogsProp, normalizedId];
        updateValue(["catalog_groups", groupName], updated);
        setIsAddMenuOpen(false);
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
        ? resolveCatalogName(activeCatalogId, customNames)
        : "";

    const [localExpanded, setLocalExpanded] = useState(false);
    const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localExpanded;
    const toggleExpanded = onToggle || (() => setLocalExpanded(prev => !prev));

    return (
        <div className={`${editorSurface.cardInteractive} flex flex-col rounded-xl overflow-hidden transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-border/80 w-full mb-3`}>
            <div className="group/unassigned flex items-center justify-between p-3 gap-4">
                <button
                    type="button"
                    onClick={toggleExpanded}
                    className="flex flex-1 min-w-0 items-center gap-2 rounded-md px-1 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-expanded={isExpanded}
                    aria-label={`Toggle subgroup ${formatDisplayName(groupName)}`}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-foreground/70 transition-colors group-hover/unassigned:text-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-foreground/70 transition-colors group-hover/unassigned:text-foreground" />
                    )}
                    <span
                        className="truncate font-medium text-foreground text-sm transition-colors group-hover/unassigned:text-primary dark:group-hover/unassigned:text-primary"
                        title={formatDisplayName(groupName)}
                    >
                        {formatDisplayName(groupName)}
                    </span>
                    <AIOMismatchBadge count={mismatchCount} className="ml-1 shrink-0" />
                </button>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 justify-end shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn("h-7 px-2 text-xs font-semibold text-foreground/70 transition-all gap-1.5 z-10 shrink-0 border border-transparent", editorHover.iconAction)}
                            >
                                Assign to... <ChevronDown className="w-3 h-3" />
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
                        size="icon"
                        onClick={() => setIsRenaming(true)}
                        className={`hidden sm:inline-flex h-9 w-9 p-0 items-center justify-center rounded-md ${editorHover.iconAction}`}
                        aria-label="Rename subgroup"
                        title="Rename subgroup"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCatalogGroup(groupName)}
                        className={`h-9 w-9 p-0 flex items-center justify-center rounded-md ${editorHover.iconDanger}`}
                        aria-label="Delete subgroup"
                        title="Delete subgroup"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <RenameGroupModal
                isOpen={isRenaming}
                onClose={() => setIsRenaming(false)}
                oldName={groupName}
                isMainGroup={false}
                onRename={(oldN, newN) => {
                    setIsRenaming(false);
                    renameCatalogGroup(oldN, newN);
                }}
            />

            {isExpanded && (
                <div className="border-t border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(248,250,252,0.1))] p-4 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))]">
                    <div className="space-y-2 mb-4">
                        <PosterUrlEditor
                            imageUrl={imageUrl}
                            onCommit={(nextUrl) => updateValue(["catalog_group_image_urls", groupName], nextUrl)}
                        />

                        <div className="sm:hidden grid grid-cols-3 gap-2 pt-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm" aria-label="Move subgroup"
                                        className={`${editorSurface.field} h-9 text-xs text-foreground/70 hover:text-foreground flex items-center justify-center`}
                                    >
                                        <FolderInput className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                        <span className="hidden sm:inline">Move</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" sideOffset={8} className={cn(editorSurface.overlay, "w-64 max-w-[calc(100vw-2rem)]")}>
                                    {onRestore && restoreParentName && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={onRestore}
                                                className="cursor-pointer py-3 text-amber-500 focus:bg-amber-500/20 focus:text-amber-400 font-semibold"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                                Restore to {formatDisplayName(restoreParentName)}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                        </>
                                    )}
                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Move to group</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-primary/10" />
                                    {mainGroupOrder.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-xs text-foreground/70/50">
                                            No Main Groups
                                        </DropdownMenuItem>
                                    ) : (
                                        mainGroupOrder.map((uuid: string) => {
                                            const name = mainCatalogGroups[uuid]?.name || "Unnamed Group";
                                            return (
                                                <DropdownMenuItem
                                                    key={uuid}
                                                    onSelect={() => assignCatalogGroup(groupName, uuid)}
                                                    className="cursor-pointer py-3"
                                                >
                                                    {formatDisplayName(name)}
                                                </DropdownMenuItem>
                                            );
                                        })
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRenaming(true)}
                                aria-label="Rename subgroup"
                                className={`${editorSurface.field} h-9 text-xs text-foreground/70 hover:text-foreground flex items-center justify-center`}
                            >
                                <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                <span className="hidden sm:inline">Rename</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCatalogGroup(groupName)}
                                aria-label="Delete subgroup"
                                className={cn(editorSurface.field, "h-9 text-xs text-red-400 hover:text-red-300 flex items-center justify-center")}
                            >
                                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-2" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "mb-4 space-y-3 sm:rounded-lg sm:border sm:p-3.5",
                            "sm:border-slate-200/80 sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,249,0.46))] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:backdrop-blur-sm",
                            "dark:sm:border-white/8 dark:sm:bg-[linear-gradient(180deg,rgba(20,23,29,0.9),rgba(18,21,27,0.88))] dark:sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
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

                        {/* Add New Catalog Dialog */}
                        <div className="pt-1 sm:pt-0">
                            <SubgroupCatalogPickerDialog
                                open={isAddMenuOpen}
                                onOpenChange={setIsAddMenuOpen}
                                catalogSearch={catalogSearch}
                                onCatalogSearchChange={setCatalogSearch}
                                filteredCatalogs={filteredCatalogs}
                                inputRef={addCatalogSearchInputRef}
                                onSelectCatalog={handleAddCatalog}
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
});

// ----------------------------------------------------------------------
// Unified App Entry Point
// ----------------------------------------------------------------------
export function UnifiedSubgroupEditor({
    onOpenGuide,
    aiomMismatchSummary,
}: {
    onOpenGuide?: (guide: "install" | "update" | "use") => void;
    aiomMismatchSummary: AIOMetadataMismatchAnalysis;
}) {
    const {
        subgroupOrderRaw,
        mainCatalogGroups,
        mainGroupOrderRaw,
        catalogGroups,
    } = useConfigSelector((state) => ({
        subgroupOrderRaw: state.currentValues["subgroup_order"],
        mainCatalogGroups: (state.currentValues["main_catalog_groups"] as Record<string, { name?: string; subgroupNames?: string[] }> | undefined) ?? EMPTY_RECORD,
        mainGroupOrderRaw: state.currentValues["main_group_order"],
        catalogGroups: state.currentValues.catalog_groups || {},
    }), shallowEqualObject);
    const { updateValue, assignCatalogGroup, removeCatalogGroup } = useConfigActions();
    const subgroupOrder = React.useMemo(
        () => ((subgroupOrderRaw as Record<string, unknown> | undefined) ?? EMPTY_RECORD),
        [subgroupOrderRaw]
    );
    const subgroupMismatchCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};
        Object.entries(aiomMismatchSummary.affectedSubgroups).forEach(([subgroupName, subgroup]) => {
            counts[subgroupName] = subgroup.issueCount;
        });
        return counts;
    }, [aiomMismatchSummary.affectedSubgroups]);
    const mainGroupOrderFromConfig = Array.isArray(mainGroupOrderRaw)
        ? (mainGroupOrderRaw as string[])
        : EMPTY_STRING_ARRAY;
    const [mainGroupOrder, setMainGroupOrder] = useState<string[]>(mainGroupOrderFromConfig);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createParentUUID, setCreateParentUUID] = useState<string | undefined>();
    const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeMainGroupId, setActiveMainGroupId] = useState<string | null>(null);
    const [expandedMainGroup, setExpandedMainGroup] = useState<string | undefined>(undefined);
    const [manualSubgroupOrderSnapshots, setManualSubgroupOrderSnapshots] = useState<Record<string, string[]>>({});
    const [recentUnassigns, setRecentUnassigns] = useState<Record<string, string>>({}); // subgroupName -> parentUuid
    const [expandedUnassignedSubgroup, setExpandedUnassignedSubgroup] = useState<string | null>(null);
    const [isUnassignedSectionOpen, setIsUnassignedSectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleUnassignSubgroup = (subgroupName: string, parentUuid: string) => {
        setRecentUnassigns(prev => ({ ...prev, [subgroupName]: parentUuid }));
    };

    const handleManualSubgroupOrderSnapshotChange = (uuid: string, order: string[]) => {
        setManualSubgroupOrderSnapshots((current) => {
            const previous = current[uuid];
            if (previous && stringArraysEqual(previous, order)) return current;
            return { ...current, [uuid]: order };
        });
    };

    React.useEffect(() => {
        setMainGroupOrder(prev => (stringArraysEqual(prev, mainGroupOrderFromConfig) ? prev : mainGroupOrderFromConfig));
    }, [mainGroupOrderFromConfig]);

    React.useEffect(() => {
        setManualSubgroupOrderSnapshots((current) => {
            const next: Record<string, string[]> = {};
            let changed = false;

            mainGroupOrderFromConfig.forEach((uuid) => {
                const currentNames = normalizeSubgroupNames(mainCatalogGroups[uuid]?.subgroupNames, subgroupOrder[uuid]);
                const previousSnapshot = current[uuid];
                const nextSnapshot = previousSnapshot
                    ? reconcileOrderedNames(previousSnapshot, currentNames)
                    : currentNames;

                next[uuid] = nextSnapshot;
                if (!previousSnapshot || !stringArraysEqual(previousSnapshot, nextSnapshot)) {
                    changed = true;
                }
            });

            if (!changed && Object.keys(current).length === Object.keys(next).length) {
                return current;
            }

            return next;
        });
    }, [mainCatalogGroups, mainGroupOrderFromConfig, subgroupOrder]);

    const filteredMainGroupOrder = React.useMemo(() => {
        if (!deferredSearchTerm) return mainGroupOrder;
        const q = deferredSearchTerm.toLowerCase();
        return mainGroupOrder.filter(uuid => {
            const mg = mainCatalogGroups[uuid];
            if (!mg) return false;
            if (mg.name?.toLowerCase().includes(q)) return true;
            
            // Check if any of its subgroups match
            const sgs = normalizeSubgroupNames(mg.subgroupNames, subgroupOrder[uuid]);
            return sgs.some((sg: string) => sg.toLowerCase().includes(q));
        });
    }, [mainGroupOrder, mainCatalogGroups, deferredSearchTerm, subgroupOrder]);

    React.useEffect(() => {
        if (!expandedMainGroup) return;
        if (filteredMainGroupOrder.includes(expandedMainGroup)) return;
        setExpandedMainGroup(undefined);
    }, [expandedMainGroup, filteredMainGroupOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
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

    const unassignedGroups = Object.keys(catalogGroups)
        .filter(name => !assignedGroups.has(name) && !isPlaceholder(name))
        .sort((a, b) => a.localeCompare(b));

    return (
        <div className="space-y-4">
            <div className={cn(editorSurface.card, "overflow-hidden")}>
                {/* Unified Sticky Toolbar */}
                <div className={cn(editorSurface.toolbar, "sticky top-0 z-30 flex flex-col gap-2 rounded-none border-x-0 border-t-0 p-3 xl:flex-row xl:items-center xl:gap-3")}>
                    <div className="grid grid-cols-3 gap-2 xl:order-2 xl:ml-auto xl:flex xl:flex-none xl:flex-wrap xl:justify-end xl:gap-2">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-primary hover:bg-primary/92 text-primary-foreground font-semibold h-10 sm:h-9 text-base sm:text-sm px-2.5 rounded-lg min-w-0 justify-center xl:order-3 xl:px-5 xl:justify-start transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out active:scale-[0.985]"
                        >
                            <Plus className="w-4 h-4 shrink-0 xl:mr-1.5" />
                            <span className="sm:hidden">New</span>
                            <span className="hidden sm:inline xl:hidden">Create New</span>
                            <span className="hidden xl:inline">Create New Group</span>
                        </Button>
                        <Button
                            onClick={() => setIsAddToGroupModalOpen(true)}
                            variant="outline"
                            className="h-10 sm:h-9 text-base sm:text-sm border-border/60 hover:bg-muted/60 dark:hover:bg-muted/40 text-foreground/80 hover:text-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out px-2.5 rounded-lg font-medium min-w-0 justify-center xl:order-1 xl:px-5 xl:justify-start"
                        >
                            <FolderPlus className="w-4 h-4 shrink-0 xl:mr-1.5" />
                            <span className="sm:hidden">Add</span>
                            <span className="hidden sm:inline xl:hidden">Add to</span>
                            <span className="hidden xl:inline">Add to Group</span>
                        </Button>
                        <Button
                            onClick={() => setIsImportModalOpen(true)}
                            variant="outline"
                            className="h-10 sm:h-9 text-base sm:text-sm border-border/60 hover:bg-muted/60 dark:hover:bg-muted/40 text-foreground/80 hover:text-foreground transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out px-2.5 rounded-lg font-medium min-w-0 justify-center xl:order-2 xl:px-5 xl:justify-start"
                        >
                            <UploadCloud className="w-4 h-4 shrink-0 xl:mr-1.5" />
                            <span className="sm:hidden">Update</span>
                            <span className="hidden sm:inline xl:hidden">Update</span>
                            <span className="hidden xl:inline">Update from Template</span>
                        </Button>
                    </div>

                    <div className="relative w-full border-t border-border/50 pt-2 xl:order-1 xl:max-w-sm xl:flex-1 xl:border-t-0 xl:pt-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
                        <Input
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={(e) => React.startTransition(() => setSearchTerm(e.target.value))}
                            placeholder="Search..."
                            className="h-9 pl-9 pr-9 bg-background/50 border-border/50 focus-visible:ring-primary/30 xl:h-10"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm("");
                                    searchInputRef.current?.focus();
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-foreground/40 hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>

                </div>

                <div className="p-4 bg-transparent">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        modifiers={[restrictVerticalDrag]}
                        onDragStart={handleMainDragStart}
                        onDragEnd={handleMainDragEnd}
                    >
                        <div className="space-y-3">
                            {filteredMainGroupOrder.length === 0 && deferredSearchTerm ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                                        <Search className="w-8 h-8 text-foreground/30" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">No matches found</h3>
                                    <p className="text-sm text-foreground/50 max-w-xs">
                                        We couldn&apos;t find any groups or subgroups matching &quot;{deferredSearchTerm}&quot;.
                                    </p>
                                    <Button 
                                        variant="link" 
                                        className="mt-2 text-primary hover:text-primary/80 font-bold"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        Clear search
                                    </Button>
                                </div>
                            ) : (
                                <SortableContext items={filteredMainGroupOrder} strategy={verticalListSortingStrategy}>
                                    <Accordion 
                                        type="single"
                                        collapsible
                                        value={expandedMainGroup}
                                        onValueChange={(value) => setExpandedMainGroup(value || undefined)}
                                        className="w-full space-y-3"
                                    >
                                        {filteredMainGroupOrder.map(uuid => {
                                            const mg = mainCatalogGroups[uuid];
                                            if (!mg) return null;
                                            const resolvedSubgroupNames = normalizeSubgroupNames(
                                                mg.subgroupNames,
                                                subgroupOrder[uuid]
                                            );
                                            return (
                                                <MainGroupNode
                                                    key={uuid}
                                                    uuid={uuid}
                                                    name={mg.name || `Group ${uuid.slice(0, 4)}`}
                                                    subgroupNames={resolvedSubgroupNames}
                                                    mismatchCount={aiomMismatchSummary.affectedMainGroups[uuid]?.issueCount || 0}
                                                    subgroupMismatchCounts={subgroupMismatchCounts}
                                                    onUnassignSubgroup={handleUnassignSubgroup}
                                                    onAddSubgroup={(id) => {
                                                        setCreateParentUUID(id);
                                                        setIsCreateModalOpen(true);
                                                    }}
                                                    searchTerm={deferredSearchTerm}
                                                    manualSubgroupOrderSnapshot={manualSubgroupOrderSnapshots[uuid]}
                                                    onManualSubgroupOrderSnapshotChange={handleManualSubgroupOrderSnapshotChange}
                                                />
                                            );
                                        })}
                                    </Accordion>
                                </SortableContext>
                            )}
                        </div>

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
            <ImportSetupModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onOpenGuide={(guide) => {
                    if (onOpenGuide) onOpenGuide(guide);
                }}
            />

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
                <div className={cn(editorSurface.card, "mt-8 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300")}>
                    <div className="p-5 sm:p-6">
                        <button
                            type="button"
                            onClick={() => setIsUnassignedSectionOpen((prev) => !prev)}
                            className={cn("flex w-full items-center justify-between gap-3 rounded-xl text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30", isUnassignedSectionOpen && "mb-4")}
                            aria-expanded={isUnassignedSectionOpen}
                            aria-controls="unassigned-subgroups-panel"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/25">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Unassigned Subgroups</h3>
                                    <p className="text-sm text-foreground/70">Subgroups that are defined but not linked to any main group yet.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-semibold text-foreground/70">
                                    {unassignedGroups.length}
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/55">
                                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", !isUnassignedSectionOpen && "-rotate-90")} />
                                </span>
                            </div>
                        </button>
                        {isUnassignedSectionOpen && (
                            <div id="unassigned-subgroups-panel" className="flex flex-col">
                                {unassignedGroups.length > 0 && (
                                    <div className="mb-4 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => unassignedGroups.forEach(name => removeCatalogGroup(name))}
                                            className={cn("h-9 text-xs px-3 gap-2 border border-transparent", editorHover.iconDanger)}
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete All
                                        </Button>
                                    </div>
                                )}
                                {unassignedGroups.map(name => {
                                    const restoreParentUuid = recentUnassigns[name];
                                    const restoreParentName = restoreParentUuid ? (mainCatalogGroups[restoreParentUuid]?.name || "Original Group") : undefined;

                                    return (
                                        <UnassignedSubgroupRow
                                            key={name}
                                            groupName={name}
                                            catalogs={catalogGroups[name] || []}
                                            mismatchCount={subgroupMismatchCounts[name] || 0}
                                            isExpanded={expandedUnassignedSubgroup === name}
                                            onToggle={() => setExpandedUnassignedSubgroup(prev => prev === name ? null : name)}
                                            onRestore={restoreParentUuid ? () => {
                                                assignCatalogGroup(name, restoreParentUuid);
                                                setExpandedUnassignedSubgroup(prev => prev === name ? null : prev);
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
                        )}
                    </div>
                </div>
            )}

            <TrashBin />
        </div>
    );
}

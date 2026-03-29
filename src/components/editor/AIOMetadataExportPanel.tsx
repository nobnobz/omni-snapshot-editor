"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AIOMetadataExportTemplateDialog } from "@/components/editor/AIOMetadataExportTemplateDialog";
import { AIOMetadataExportSettingsDialog, type AIOMetadataExportSettingsDialogTarget } from "@/components/editor/AIOMetadataExportSettingsDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    getDefaultAIOMetadataExportOverrides,
    buildAIOMetadataCatalogExport,
    buildAIOMetadataExportInventory,
    filterAIOMetadataExportInventory,
    getCanonicalOccurrencesByComparisonKey,
    type AIOMetadataCatalogOccurrence,
    type AIOMetadataFilteredExportWidget,
    type AIOMetadataExportItem,
    type AIOMetadataExportWidget,
} from "@/lib/aiometadata-export";
import {
    DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
    EMPTY_AIOMETADATA_EXPORT_OVERRIDE_STATE,
    type AIOMetadataExportOverrideState,
} from "@/lib/aiometadata-export-settings";
import type {
    AIOMetadataFallbackMap,
    AIOMetadataNormalizedCatalog,
} from "@/lib/aiometadata-sync";
import { cn } from "@/lib/utils";
import { editorSurface } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";
import { Switch } from "@/components/ui/switch";
import {
    Check,
    Info,
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    Search,
    SlidersHorizontal,
    WandSparkles,
} from "lucide-react";

type AIOMetadataExportPanelProps = {
    currentValues: Record<string, unknown>;
    importedCatalogs?: AIOMetadataNormalizedCatalog[] | null;
    customFallbacks: AIOMetadataFallbackMap;
};

const sourceLabels = {
    mdblist: "MDBList",
    streaming: "Streaming",
    trakt: "Trakt",
} as const;

const triggerDownload = (jsonText: string, filename: string) => {
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

const getCheckboxState = (keys: string[], selectedKeys: Set<string>) => {
    if (keys.length === 0) return false;

    const selectedCount = keys.filter((key) => selectedKeys.has(key)).length;
    if (selectedCount === 0) return false;
    if (selectedCount === keys.length) return true;
    return "indeterminate" as const;
};

const buildExportFilename = (suffix: "new" | "full") => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `omni-aiometadata-${suffix}-catalogs-${timestamp}.json`;
};

const shouldIgnoreExpandToggle = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest("[data-prevent-expand='true']");

const filterVisibleWidgets = (
    widgets: AIOMetadataFilteredExportWidget[],
    exportMode: "all" | "new"
) => {
    if (exportMode === "all") {
        return widgets;
    }

    return widgets.flatMap((widget) => {
        const items = widget.items.flatMap((item) => {
            const occurrences = item.occurrences.filter((occurrence) => occurrence.isExportable);
            if (occurrences.length === 0) return [];

            return [{
                ...item,
                occurrences,
            }];
        });

        if (items.length === 0) return [];

        return [{
            ...widget,
            items,
        }];
    });
};

function ExportNote() {
    return (
        <EditorNotice tone="info" alignCenter>
            <p className="leading-relaxed text-balance">
                Paste exported catalogs into AIOMetadata under Catalogs &gt; Import Setup, then save your changes.
            </p>
        </EditorNotice>
    );
}

function CatalogRow({
    occurrence,
    isSelected,
    onToggle,
    onEditSettings,
}: {
    occurrence: AIOMetadataCatalogOccurrence;
    isSelected: boolean;
    onToggle: (occurrence: AIOMetadataCatalogOccurrence) => void;
    onEditSettings?: (occurrence: AIOMetadataCatalogOccurrence) => void;
}) {
    const isDisabled = !occurrence.isExportable;

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out",
                occurrence.isExportable
                    ? "border-slate-200/70 bg-slate-100/70 text-foreground dark:border-white/8 dark:bg-white/[0.02]"
                    : "border-slate-200/55 bg-slate-100/55 text-foreground/55 opacity-70 dark:border-white/6 dark:bg-white/[0.015] dark:text-foreground/46"
            )}
        >
            <Checkbox
                checked={isSelected}
                disabled={isDisabled}
                onCheckedChange={() => onToggle(occurrence)}
                className="shrink-0"
                aria-label={isSelected ? `Deselect ${occurrence.exportCatalog.name}` : `Select ${occurrence.exportCatalog.name}`}
            />
            <button
                type="button"
                onClick={() => onToggle(occurrence)}
                disabled={isDisabled}
                className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
            >
                <p className="truncate text-sm font-medium tracking-tight">{occurrence.exportCatalog.name}</p>
                <p className="truncate text-xs text-foreground/54 dark:text-foreground/44">
                    {occurrence.itemName}
                </p>
            </button>
            <div className="flex shrink-0 items-center gap-2">
                {onEditSettings && ["mdblist", "trakt", "streaming"].includes(occurrence.source) && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-lg text-foreground/55 hover:text-foreground"
                        onClick={() => onEditSettings(occurrence)}
                        data-prevent-expand="true"
                        aria-label={`Open AIOMetadata settings for ${occurrence.exportCatalog.name}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                )}
                <span className="rounded-full border border-slate-200/70 bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/58 dark:border-white/8 dark:bg-white/[0.04] dark:text-foreground/48">
                    {sourceLabels[occurrence.source]}
                </span>
                {occurrence.isSynced && (
                    <span className="rounded-full border border-slate-200/80 bg-slate-100/82 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48 dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground/42">
                        Already Synced
                    </span>
                )}
            </div>
        </div>
    );
}

function ItemRow({
    item,
    selectedKeys,
    openItemIds,
    toggleItemOpen,
    toggleItemSelection,
    toggleCatalogSelection,
    forceOpen,
    canEditSettings,
    onEditSettings,
    onEditCatalogSettings,
}: {
    item: AIOMetadataExportItem;
    selectedKeys: Set<string>;
    openItemIds: Set<string>;
    toggleItemOpen: (itemId: string) => void;
    toggleItemSelection: (item: AIOMetadataExportItem) => void;
    toggleCatalogSelection: (occurrence: AIOMetadataCatalogOccurrence) => void;
    forceOpen: boolean;
    canEditSettings: boolean;
    onEditSettings: (item: AIOMetadataExportItem) => void;
    onEditCatalogSettings: (occurrence: AIOMetadataCatalogOccurrence) => void;
}) {
    const exportableKeys = Array.from(
        new Set(
            item.occurrences
                .filter((occurrence) => occurrence.isExportable)
                .map((occurrence) => occurrence.comparisonKey)
        )
    );
    const isFullySynced = exportableKeys.length === 0 && item.syncedCount > 0;
    const isOpen = forceOpen || openItemIds.has(item.id);

    return (
        <div
            className={cn(
                editorSurface.panel,
                "overflow-hidden border-slate-200/72 dark:border-white/8",
                isFullySynced && "border-slate-200/50 bg-slate-100/40 text-foreground/56 dark:border-white/6 dark:bg-white/[0.015] dark:text-foreground/48"
            )}
        >
            <div
                className="flex items-center gap-2 px-3 py-2.5"
                onClick={(event) => {
                    if (shouldIgnoreExpandToggle(event.target)) return;
                    toggleItemOpen(item.id);
                }}
            >
                <Checkbox
                    checked={getCheckboxState(exportableKeys, selectedKeys)}
                    disabled={exportableKeys.length === 0}
                    onCheckedChange={() => toggleItemSelection(item)}
                    className="shrink-0"
                    data-prevent-expand="true"
                    aria-label={`Toggle item selection for ${item.name}`}
                />
                <div
                    className={cn(
                        "min-w-0 text-left disabled:cursor-not-allowed",
                        isFullySynced && "text-foreground/52 dark:text-foreground/42"
                    )}
                >
                    <p className={cn("truncate text-sm font-semibold tracking-tight text-foreground", isFullySynced && "text-foreground/58 dark:text-foreground/44")}>
                        {item.name}
                    </p>
                </div>
                <div
                    className={cn("min-h-7 flex-1 cursor-pointer", isFullySynced && "opacity-75")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleItemOpen(item.id);
                        }
                    }}
                    aria-label={`Toggle item ${item.name}`}
                />
                <span className={cn("shrink-0 cursor-pointer text-[11px] font-medium text-foreground/54 dark:text-foreground/44", isFullySynced && "text-foreground/42 dark:text-foreground/36")}>
                    {item.exportableCount} new
                    {item.syncedCount > 0 ? ` • ${item.syncedCount} synced` : ""}
                </span>
                {canEditSettings && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className={cn("h-8 w-8 rounded-lg text-foreground/60 hover:text-foreground", isFullySynced && "text-foreground/42 hover:text-foreground/66 dark:text-foreground/36 dark:hover:text-foreground/56")}
                        onClick={() => onEditSettings(item)}
                        data-prevent-expand="true"
                        aria-label={`Open AIOMetadata settings for subgroup ${item.name}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className={cn("h-8 w-8 rounded-lg text-foreground/60 hover:text-foreground", isFullySynced && "text-foreground/42 hover:text-foreground/66 dark:text-foreground/36 dark:hover:text-foreground/56")}
                    onClick={() => toggleItemOpen(item.id)}
                    data-prevent-expand="true"
                    aria-label={`Toggle item ${item.name}`}
                >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </div>
            {isOpen && (
                <div className="space-y-2 border-t border-slate-200/75 px-3 py-3 dark:border-white/8">
                    {item.occurrences.map((occurrence, index) => (
                        <CatalogRow
                            key={`${item.id}:${occurrence.comparisonKey}:${occurrence.type}:${index}`}
                            occurrence={occurrence}
                            isSelected={selectedKeys.has(occurrence.comparisonKey)}
                            onToggle={toggleCatalogSelection}
                            onEditSettings={onEditCatalogSettings}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function WidgetRow({
    widget,
    selectedKeys,
    openWidgetIds,
    openItemIds,
    toggleWidgetOpen,
    toggleItemOpen,
    toggleWidgetSelection,
    toggleItemSelection,
    toggleCatalogSelection,
    forceOpen,
    canEditSettings,
    canEditItemSettings,
    onEditSettings,
    onEditItemSettings,
    onEditCatalogSettings,
}: {
    widget: AIOMetadataExportWidget;
    selectedKeys: Set<string>;
    openWidgetIds: Set<string>;
    openItemIds: Set<string>;
    toggleWidgetOpen: (widgetId: string) => void;
    toggleItemOpen: (itemId: string) => void;
    toggleWidgetSelection: (widget: AIOMetadataExportWidget) => void;
    toggleItemSelection: (item: AIOMetadataExportItem) => void;
    toggleCatalogSelection: (occurrence: AIOMetadataCatalogOccurrence) => void;
    forceOpen: boolean;
    canEditSettings: boolean;
    canEditItemSettings: (itemId: string) => boolean;
    onEditSettings: (widget: AIOMetadataExportWidget) => void;
    onEditItemSettings: (item: AIOMetadataExportItem) => void;
    onEditCatalogSettings: (occurrence: AIOMetadataCatalogOccurrence) => void;
}) {
    const exportableKeys = Array.from(
        new Set(
            widget.items.flatMap((item) =>
                item.occurrences
                    .filter((occurrence) => occurrence.isExportable)
                    .map((occurrence) => occurrence.comparisonKey)
            )
        )
    );
    const isFullySynced = exportableKeys.length === 0 && widget.syncedCount > 0;
    const isOpen = forceOpen || openWidgetIds.has(widget.id);

    return (
        <div
            className={cn(
                editorSurface.card,
                "overflow-hidden",
                isFullySynced && "border-slate-200/55 bg-[linear-gradient(180deg,rgba(248,250,252,0.5),rgba(241,245,249,0.34))] text-foreground/56 dark:border-white/6 dark:bg-[linear-gradient(180deg,rgba(22,25,31,0.7),rgba(18,21,27,0.62))] dark:text-foreground/46"
            )}
        >
            <div
                className="flex items-center gap-2 px-4 py-3"
                onClick={(event) => {
                    if (shouldIgnoreExpandToggle(event.target)) return;
                    toggleWidgetOpen(widget.id);
                }}
            >
                <Checkbox
                    checked={getCheckboxState(exportableKeys, selectedKeys)}
                    disabled={exportableKeys.length === 0}
                    onCheckedChange={() => toggleWidgetSelection(widget)}
                    className="shrink-0"
                    data-prevent-expand="true"
                    aria-label={`Toggle widget selection for ${widget.name}`}
                />
                <div
                    className={cn(
                        "min-w-0 text-left disabled:cursor-not-allowed",
                        isFullySynced && "text-foreground/52 dark:text-foreground/42"
                    )}
                >
                    <p className={cn("truncate text-sm font-semibold tracking-tight text-foreground", isFullySynced && "text-foreground/58 dark:text-foreground/44")}>
                        {widget.name}
                    </p>
                </div>
                <div
                    className={cn("min-h-8 flex-1 cursor-pointer", isFullySynced && "opacity-75")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleWidgetOpen(widget.id);
                        }
                    }}
                    aria-label={`Toggle widget ${widget.name}`}
                />
                <span className={cn("shrink-0 cursor-pointer text-[11px] font-medium text-foreground/54 dark:text-foreground/44", isFullySynced && "text-foreground/42 dark:text-foreground/36")}>
                    {widget.exportableCount} new
                    {widget.syncedCount > 0 ? ` • ${widget.syncedCount} synced` : ""}
                </span>
                {canEditSettings && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className={cn("h-8 w-8 rounded-lg text-foreground/60 hover:text-foreground", isFullySynced && "text-foreground/42 hover:text-foreground/66 dark:text-foreground/36 dark:hover:text-foreground/56")}
                        onClick={() => onEditSettings(widget)}
                        data-prevent-expand="true"
                        aria-label={`Open AIOMetadata settings for main group ${widget.name}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className={cn("h-8 w-8 rounded-lg text-foreground/60 hover:text-foreground", isFullySynced && "text-foreground/42 hover:text-foreground/66 dark:text-foreground/36 dark:hover:text-foreground/56")}
                    onClick={() => toggleWidgetOpen(widget.id)}
                    data-prevent-expand="true"
                    aria-label={`Toggle widget ${widget.name}`}
                >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </div>
            {isOpen && (
                <div className="space-y-2 border-t border-slate-200/75 px-4 py-3 dark:border-white/8">
                    {widget.items.map((item) => {
                        return (
                            <ItemRow
                                key={item.id}
                                item={item}
                                selectedKeys={selectedKeys}
                                openItemIds={openItemIds}
                                toggleItemOpen={toggleItemOpen}
                                toggleItemSelection={toggleItemSelection}
                                toggleCatalogSelection={toggleCatalogSelection}
                                forceOpen={forceOpen}
                                canEditSettings={canEditItemSettings(item.id)}
                                onEditSettings={onEditItemSettings}
                                onEditCatalogSettings={onEditCatalogSettings}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function AIOMetadataExportPanel({
    currentValues,
    importedCatalogs,
    customFallbacks,
}: AIOMetadataExportPanelProps) {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [useUmeSorting, setUseUmeSorting] = useState(true);
    const [exportMode, setExportMode] = useState<"all" | "new">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedComparisonKeys, setSelectedComparisonKeys] = useState<Set<string>>(new Set());
    const [openWidgetIds, setOpenWidgetIds] = useState<Set<string>>(new Set());
    const [openItemIds, setOpenItemIds] = useState<Set<string>>(new Set());
    const [copiedAction, setCopiedAction] = useState<"selected" | "full" | null>(null);
    const [exportSettingsOverrides, setExportSettingsOverrides] = useState<AIOMetadataExportOverrideState>(
        EMPTY_AIOMETADATA_EXPORT_OVERRIDE_STATE
    );
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isTemplateInfoOpen, setIsTemplateInfoOpen] = useState(false);
    const [settingsDialogTarget, setSettingsDialogTarget] = useState<AIOMetadataExportSettingsDialogTarget | null>(null);
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const hasEditedSelectionRef = useRef(false);

    const inventory = useMemo(
        () =>
            buildAIOMetadataExportInventory({
                currentValues,
                importedCatalogs,
                customFallbacks,
            }),
        [currentValues, importedCatalogs, customFallbacks]
    );
    const filteredWidgets = useMemo(
        () => filterVisibleWidgets(
            filterAIOMetadataExportInventory(inventory, deferredSearchTerm),
            exportMode
        ),
        [inventory, deferredSearchTerm, exportMode]
    );
    const allCatalogCount = useMemo(
        () =>
            buildAIOMetadataCatalogExport({
                inventory,
                includeAll: true,
            }).catalogs.length,
        [inventory]
    );
    const exportableSignature = useMemo(
        () => inventory.exportableComparisonKeys.join("|"),
        [inventory.exportableComparisonKeys]
    );
    const selectedCount = selectedComparisonKeys.size;
    const canonicalOccurrences = useMemo(
        () => getCanonicalOccurrencesByComparisonKey(inventory),
        [inventory]
    );
    const sanitizedExportSettingsOverrides = useMemo(() => {
        const validWidgetIds = new Set(inventory.widgets.map((widget) => widget.id));
        const validItemIds = new Set(inventory.widgets.flatMap((widget) => widget.items.map((item) => item.id)));
        const validCatalogKeys = new Set(Array.from(canonicalOccurrences.keys()));

        const nextWidgets = Object.fromEntries(
            Object.entries(exportSettingsOverrides.widgets).filter(([key]) => validWidgetIds.has(key))
        );
        const nextItems = Object.fromEntries(
            Object.entries(exportSettingsOverrides.items).filter(([key]) => validItemIds.has(key))
        );
        const nextCatalogs = Object.fromEntries(
            Object.entries(exportSettingsOverrides.catalogs).filter(([key]) => validCatalogKeys.has(key))
        );

        if (
            Object.keys(nextWidgets).length === Object.keys(exportSettingsOverrides.widgets).length
            && Object.keys(nextItems).length === Object.keys(exportSettingsOverrides.items).length
            && Object.keys(nextCatalogs).length === Object.keys(exportSettingsOverrides.catalogs).length
        ) {
            return exportSettingsOverrides;
        }

        return {
            widgets: nextWidgets,
            items: nextItems,
            catalogs: nextCatalogs,
        };
    }, [canonicalOccurrences, exportSettingsOverrides, inventory.widgets]);
    const effectiveExportSettingsOverrides = useMemo(
        () => useUmeSorting
            ? getDefaultAIOMetadataExportOverrides({
                inventory,
                currentOverrides: sanitizedExportSettingsOverrides,
            })
            : sanitizedExportSettingsOverrides,
        [inventory, sanitizedExportSettingsOverrides, useUmeSorting]
    );
    const canonicalEditableWidgetIds = useMemo(
        () => new Set(
            Array.from(canonicalOccurrences.values())
                .filter((occurrence) => ["mdblist", "trakt", "streaming"].includes(occurrence.source))
                .map((occurrence) => occurrence.widgetId)
        ),
        [canonicalOccurrences]
    );
    const canonicalEditableItemIds = useMemo(
        () => new Set(
            Array.from(canonicalOccurrences.values())
                .filter((occurrence) => ["mdblist", "trakt", "streaming"].includes(occurrence.source))
                .map((occurrence) => occurrence.itemId)
        ),
        [canonicalOccurrences]
    );
    const hasEditableAIOMetadataCatalogs = canonicalEditableItemIds.size > 0;
    const hasNewCatalogs = inventory.exportableComparisonKeys.length > 0;

    useEffect(() => {
        const exportableKeys = new Set(inventory.exportableComparisonKeys);

        setSelectedComparisonKeys((previousKeys) => {
            if (!hasEditedSelectionRef.current) {
                return new Set(exportableKeys);
            }

            return new Set(Array.from(previousKeys).filter((key) => exportableKeys.has(key)));
        });
    }, [exportableSignature, inventory.exportableComparisonKeys]);

    useEffect(() => {
        if (!copiedAction) return undefined;

        const timeoutId = window.setTimeout(() => setCopiedAction(null), 1800);
        return () => window.clearTimeout(timeoutId);
    }, [copiedAction]);

    const setSelection = (updater: (currentKeys: Set<string>) => Set<string>) => {
        hasEditedSelectionRef.current = true;
        setSelectedComparisonKeys((currentKeys) => updater(new Set(currentKeys)));
    };

    const replaceSelection = (keys: string[]) => {
        setSelection(() => new Set(keys));
    };

    const toggleWidgetOpen = (widgetId: string) => {
        setOpenWidgetIds((currentIds) => {
            if (currentIds.has(widgetId)) {
                return new Set<string>();
            }

            return new Set([widgetId]);
        });
        setOpenItemIds(new Set());
    };

    const toggleItemOpen = (itemId: string) => {
        setOpenItemIds((currentIds) => {
            if (currentIds.has(itemId)) {
                return new Set<string>();
            }

            return new Set([itemId]);
        });
    };

    const toggleCatalogSelection = (occurrence: AIOMetadataCatalogOccurrence) => {
        if (!occurrence.isExportable) return;

        setSelection((currentKeys) => {
            if (currentKeys.has(occurrence.comparisonKey)) {
                currentKeys.delete(occurrence.comparisonKey);
            } else {
                currentKeys.add(occurrence.comparisonKey);
            }
            return currentKeys;
        });
    };

    const openSettingsDialog = (target: AIOMetadataExportSettingsDialogTarget) => {
        setSettingsDialogTarget(target);
        setIsSettingsDialogOpen(true);
    };

    const toggleItemSelection = (item: AIOMetadataExportItem) => {
        const exportableKeys = Array.from(
            new Set(
                item.occurrences
                    .filter((occurrence) => occurrence.isExportable)
                    .map((occurrence) => occurrence.comparisonKey)
            )
        );
        if (exportableKeys.length === 0) return;

        setSelection((currentKeys) => {
            const hasAllKeys = exportableKeys.every((key) => currentKeys.has(key));

            if (hasAllKeys) {
                exportableKeys.forEach((key) => currentKeys.delete(key));
            } else {
                exportableKeys.forEach((key) => currentKeys.add(key));
            }

            return currentKeys;
        });
    };

    const toggleWidgetSelection = (widget: AIOMetadataExportWidget) => {
        const exportableKeys = Array.from(
            new Set(
                widget.items.flatMap((item) =>
                    item.occurrences
                        .filter((occurrence) => occurrence.isExportable)
                        .map((occurrence) => occurrence.comparisonKey)
                )
            )
        );
        if (exportableKeys.length === 0) return;

        setSelection((currentKeys) => {
            const hasAllKeys = exportableKeys.every((key) => currentKeys.has(key));

            if (hasAllKeys) {
                exportableKeys.forEach((key) => currentKeys.delete(key));
            } else {
                exportableKeys.forEach((key) => currentKeys.add(key));
            }

            return currentKeys;
        });
    };

    const handleCopySelected = async () => {
        if (selectedComparisonKeys.size === 0) return;

        const payload = buildAIOMetadataCatalogExport({
            inventory,
            selectedComparisonKeys,
            exportSettingsOverrides: effectiveExportSettingsOverrides,
        });

        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopiedAction("selected");
    };

    const handleDownloadSelected = () => {
        if (selectedComparisonKeys.size === 0) return;

        const payload = buildAIOMetadataCatalogExport({
            inventory,
            selectedComparisonKeys,
            exportSettingsOverrides: effectiveExportSettingsOverrides,
        });

        triggerDownload(JSON.stringify(payload, null, 2), buildExportFilename("new"));
    };

    const handleCopyFull = async () => {
        const payload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: effectiveExportSettingsOverrides,
        });

        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopiedAction("full");
    };

    const handleDownloadFull = () => {
        const payload = buildAIOMetadataCatalogExport({
            inventory,
            includeAll: true,
            exportSettingsOverrides: effectiveExportSettingsOverrides,
        });

        triggerDownload(JSON.stringify(payload, null, 2), buildExportFilename("full"));
    };

    const hasLinkedCatalogs = inventory.occurrences.length > 0;

    return (
        <div className="space-y-4">
            <div className={cn(editorSurface.card, "overflow-hidden")}>
                <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
                    <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() => setIsExportOpen((current) => !current)}
                        aria-expanded={isExportOpen}
                        aria-label="Toggle Export Catalogs"
                    >
                        <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold tracking-tight text-foreground">Export Catalogs</h4>
                            <p className="mt-1 text-sm text-foreground/60">
                                {allCatalogCount} linked catalogs available
                                {inventory.exportableComparisonKeys.length > 0 ? ` • ${inventory.exportableComparisonKeys.length} new` : ""}
                            </p>
                        </div>
                        <span className="shrink-0 text-foreground/58">
                            {isExportOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                    </button>
                </div>

                {isExportOpen && (
                    <div className="space-y-4 border-t border-slate-200/75 px-4 py-4 sm:px-5 dark:border-white/8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className={cn(editorSurface.panel, "inline-flex w-full rounded-2xl p-1 sm:w-auto")}>
                                <Button
                                    type="button"
                                    variant={exportMode === "all" ? "default" : "ghost"}
                                    className={cn(
                                        "h-9 flex-1 rounded-xl px-4 sm:flex-none",
                                        exportMode === "all"
                                            ? "bg-primary font-bold text-primary-foreground hover:bg-primary/92"
                                            : "text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
                                    )}
                                    onClick={() => setExportMode("all")}
                                >
                                    All Catalogs
                                </Button>
                                <Button
                                    type="button"
                                    variant={exportMode === "new" ? "default" : "ghost"}
                                    className={cn(
                                        "h-9 flex-1 rounded-xl px-4 sm:flex-none",
                                        exportMode === "new"
                                            ? "bg-primary font-bold text-primary-foreground hover:bg-primary/92"
                                            : "text-foreground/70 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40"
                                    )}
                                    onClick={() => setExportMode("new")}
                                >
                                    New Catalogs
                                </Button>
                            </div>
                            <div className="grid w-full grid-cols-[minmax(0,1fr)_3.5rem] items-stretch gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center">
                                <div
                                    className={cn(
                                        editorSurface.panel,
                                        "flex h-11 min-w-0 cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 sm:w-auto sm:min-w-[14rem]"
                                    )}
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-1">
                                        <button
                                            type="button"
                                            className="flex min-w-0 items-center gap-2.5 text-left text-[0.98rem] font-medium text-foreground/80 sm:gap-2 sm:text-sm sm:text-foreground/78"
                                            onClick={() => setUseUmeSorting((current) => !current)}
                                            aria-label={`${useUmeSorting ? "Disable" : "Enable"} UME sorting`}
                                        >
                                            <WandSparkles className="h-[1.05rem] w-[1.05rem] shrink-0 sm:h-4 sm:w-4" />
                                            <span className="truncate">
                                                UME Sorting
                                            </span>
                                        </button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="h-8 w-8 shrink-0 rounded-lg text-foreground/64 hover:text-foreground sm:h-7 sm:w-7 sm:text-foreground/58"
                                            onClick={() => setIsTemplateInfoOpen(true)}
                                            aria-label="Show UME sorting details"
                                        >
                                            <Info className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Switch
                                        id="ume-sorting-toggle"
                                        checked={useUmeSorting}
                                        onCheckedChange={setUseUmeSorting}
                                        aria-label="Toggle UME sorting for exported catalogs"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className={cn(
                                        editorSurface.panel,
                                        "h-11 w-14 shrink-0 rounded-xl text-foreground/76 hover:text-foreground sm:w-11 sm:text-foreground/68"
                                    )}
                                    onClick={() => openSettingsDialog({ kind: "root" })}
                                    disabled={!hasEditableAIOMetadataCatalogs}
                                    aria-label="Open AIOMetadata settings"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ExportNote />
                        {exportMode === "all" ? (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end lg:flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 w-full rounded-xl border-border/60 bg-background/35 text-foreground/88 hover:bg-muted/55 sm:w-auto sm:min-w-[16rem] sm:flex-1 lg:min-w-[19rem] lg:flex-none"
                                        onClick={handleDownloadFull}
                                        disabled={!hasLinkedCatalogs}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download All Catalogs
                                    </Button>
                                    <Button
                                        type="button"
                                        className="h-10 w-full rounded-xl bg-primary font-bold text-primary-foreground sm:w-auto sm:min-w-[16rem] sm:flex-1 lg:min-w-[19rem] lg:flex-none"
                                        onClick={() => void handleCopyFull()}
                                        disabled={!hasLinkedCatalogs}
                                    >
                                        {copiedAction === "full" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copiedAction === "full" ? "Copied" : "Copy All Catalogs"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end lg:flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 w-full rounded-xl sm:w-auto sm:min-w-[16rem] sm:flex-1 lg:min-w-[19rem] lg:flex-none"
                                        onClick={handleDownloadSelected}
                                        disabled={selectedCount === 0}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Selected Catalogs
                                    </Button>
                                    <Button
                                        type="button"
                                        className="h-10 w-full rounded-xl bg-primary font-bold text-primary-foreground sm:w-auto sm:min-w-[16rem] sm:flex-1 lg:min-w-[19rem] lg:flex-none"
                                        onClick={() => void handleCopySelected()}
                                        disabled={selectedCount === 0}
                                    >
                                        {copiedAction === "selected" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copiedAction === "selected" ? "Copied" : "Copy Selected Catalogs"}
                                    </Button>
                                </div>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search catalogs, widgets, or items..."
                                        className={cn(editorSurface.field, "h-10 rounded-xl pl-9")}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => replaceSelection(inventory.exportableComparisonKeys)}
                                        disabled={inventory.exportableComparisonKeys.length === 0}
                                    >
                                        Select All
                                    </Button>
                                    {inventory.exportableSources.includes("trakt") && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => replaceSelection(
                                                Array.from(new Set(
                                                    inventory.occurrences
                                                        .filter((occurrence) => occurrence.isExportable && occurrence.source === "trakt")
                                                        .map((occurrence) => occurrence.comparisonKey)
                                                ))
                                            )}
                                        >
                                            Trakt
                                        </Button>
                                    )}
                                    {inventory.exportableSources.includes("mdblist") && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => replaceSelection(
                                                Array.from(new Set(
                                                    inventory.occurrences
                                                        .filter((occurrence) => occurrence.isExportable && occurrence.source === "mdblist")
                                                        .map((occurrence) => occurrence.comparisonKey)
                                                ))
                                            )}
                                        >
                                            MDBList
                                        </Button>
                                    )}
                                    {inventory.exportableSources.includes("streaming") && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => replaceSelection(
                                                Array.from(new Set(
                                                    inventory.occurrences
                                                        .filter((occurrence) => occurrence.isExportable && occurrence.source === "streaming")
                                                        .map((occurrence) => occurrence.comparisonKey)
                                                ))
                                            )}
                                        >
                                            Streaming
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => replaceSelection([])}
                                    >
                                        Clear
                                    </Button>
                                </div>

                                {!hasLinkedCatalogs ? (
                                    <div className={cn(editorSurface.panel, "rounded-xl border-dashed px-4 py-8 text-center text-sm text-foreground/58")}>
                                        No linked AIOMetadata catalogs were found in this Omni setup.
                                    </div>
                                ) : exportMode === "new" && !hasNewCatalogs ? (
                                    <div className={cn(editorSurface.panel, "rounded-xl border-dashed px-4 py-8 text-center text-sm text-foreground/58")}>
                                        All linked catalogs are already present in your imported AIOMetadata data.
                                    </div>
                                ) : filteredWidgets.length === 0 ? (
                                    <div className={cn(editorSurface.panel, "rounded-xl border-dashed px-4 py-8 text-center text-sm text-foreground/58")}>
                                        {exportMode === "new" ? "No new catalogs matched your search." : "No catalogs matched your search."}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredWidgets.map((filteredWidget) => {
                                            const widget = inventory.widgets.find((candidate) => candidate.id === filteredWidget.id);
                                            if (!widget) return null;
                                            const filteredItems = filteredWidget.items.map((filteredItem) => ({
                                                id: filteredItem.id,
                                                name: filteredItem.name,
                                                occurrences: filteredItem.occurrences,
                                                exportableCount: filteredItem.occurrences.filter((occurrence) => occurrence.isExportable).length,
                                                syncedCount: filteredItem.occurrences.filter((occurrence) => occurrence.isSynced).length,
                                            }));

                                            return (
                                                <WidgetRow
                                                    key={widget.id}
                                                    widget={{
                                                        ...widget,
                                                        exportableCount: filteredItems.reduce((total, item) => total + item.exportableCount, 0),
                                                        items: filteredItems,
                                                        syncedCount: filteredItems.reduce((total, item) => total + item.syncedCount, 0),
                                                    }}
                                                    selectedKeys={selectedComparisonKeys}
                                                    openWidgetIds={openWidgetIds}
                                                    openItemIds={openItemIds}
                                                    toggleWidgetOpen={toggleWidgetOpen}
                                                    toggleItemOpen={toggleItemOpen}
                                                    toggleWidgetSelection={toggleWidgetSelection}
                                                    toggleItemSelection={toggleItemSelection}
                                                    toggleCatalogSelection={toggleCatalogSelection}
                                                    forceOpen={!!deferredSearchTerm.trim()}
                                                    canEditSettings={canonicalEditableWidgetIds.has(widget.id)}
                                                    canEditItemSettings={(itemId) => canonicalEditableItemIds.has(itemId)}
                                                    onEditSettings={(targetWidget) => openSettingsDialog({ kind: "widget", widgetId: targetWidget.id })}
                                                    onEditItemSettings={(targetItem) => openSettingsDialog({ kind: "item", itemId: targetItem.id })}
                                                    onEditCatalogSettings={(occurrence) => openSettingsDialog({ kind: "catalog", comparisonKey: occurrence.comparisonKey })}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AIOMetadataExportSettingsDialog
                open={isSettingsDialogOpen}
                onOpenChange={setIsSettingsDialogOpen}
                target={settingsDialogTarget}
                inventory={inventory}
                overrides={sanitizedExportSettingsOverrides}
                useUmeSorting={useUmeSorting}
                onChange={setExportSettingsOverrides}
            />
            <AIOMetadataExportTemplateDialog
                open={isTemplateInfoOpen}
                onOpenChange={setIsTemplateInfoOpen}
                template={DEFAULT_AIOMETADATA_EXPORT_TEMPLATE}
                onApply={() => undefined}
                description=""
                dismissLabel="Close"
                showApplyButton={false}
            />
        </div>
    );
}

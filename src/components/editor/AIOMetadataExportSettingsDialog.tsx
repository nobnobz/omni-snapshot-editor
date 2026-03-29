"use client";

import React, { useMemo, useState } from "react";
import { AIOMetadataExportTemplateDialog } from "@/components/editor/AIOMetadataExportTemplateDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    applyAIOMetadataExportTemplate,
    applyExportOverrideToCatalog,
    getDefaultAIOMetadataExportOverrides,
    getCanonicalOccurrencesByComparisonKey,
    type AIOMetadataCanonicalOccurrence,
    type AIOMetadataExportInventory,
    type AIOMetadataResolvedMDBListExportFields,
    type AIOMetadataResolvedStreamingExportFields,
    type AIOMetadataResolvedTraktExportFields,
} from "@/lib/aiometadata-export";
import {
    CACHE_TTL_PRESET_OPTIONS,
    DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
    EMPTY_AIOMETADATA_EXPORT_OVERRIDE_STATE,
    STREAMING_SORT_OPTIONS,
    TRAKT_SORT_OPTIONS,
    detectCacheTtlPreset,
    MDBLIST_SORT_OPTIONS,
    cacheTtlSecondsFromPreset,
    type AIOMetadataCacheTtlPreset,
    type AIOMetadataCatalogExportOverride,
    type AIOMetadataExportOverrideState,
    type AIOMetadataMDBListExportOverride,
    type AIOMetadataMDBListSort,
    type AIOMetadataSourceScopedOverrideMap,
    type AIOMetadataStreamingExportOverride,
    type AIOMetadataStreamingSort,
    type AIOMetadataTraktExportOverride,
    type AIOMetadataTraktSort,
} from "@/lib/aiometadata-export-settings";
import type { AIOMetadataCatalogSource } from "@/lib/aiometadata-sync";
import { cn } from "@/lib/utils";
import { editorAction, editorHover, editorLayout, editorSurface } from "@/components/editor/ui/style-contract";
import { ChevronDown, ChevronRight, WandSparkles, X } from "lucide-react";

export type AIOMetadataExportSettingsDialogTarget =
    | { kind: "root" }
    | { kind: "widget"; widgetId: string }
    | { kind: "item"; itemId: string }
    | { kind: "catalog"; comparisonKey: string };

type EditableTreeItem = {
    id: string;
    name: string;
    occurrences: AIOMetadataCanonicalOccurrence[];
};

type EditableTreeWidget = {
    id: string;
    name: string;
    items: EditableTreeItem[];
};

type EditableScopePath = {
    widgetId: string;
    widgetName: string;
    itemId?: string;
    itemName?: string;
};

type ScopeSelectionKey = `widget:${string}` | `item:${string}` | `catalog:${string}`;
type EditableSource = Extract<AIOMetadataCatalogSource, "mdblist" | "trakt" | "streaming">;
type SourceCurrentValues = {
    mdblist: Partial<AIOMetadataResolvedMDBListExportFields>;
    trakt: Partial<AIOMetadataResolvedTraktExportFields>;
    streaming: Partial<AIOMetadataResolvedStreamingExportFields>;
};
type SourceOverrideBySource = {
    mdblist: AIOMetadataMDBListExportOverride;
    trakt: AIOMetadataTraktExportOverride;
    streaming: AIOMetadataStreamingExportOverride;
};
type MDBListSourceSection = {
    source: "mdblist";
    occurrences: AIOMetadataCanonicalOccurrence[];
    override?: AIOMetadataMDBListExportOverride;
    overridePresence: Partial<Record<keyof AIOMetadataMDBListExportOverride, boolean>>;
    currentValues: Partial<AIOMetadataResolvedMDBListExportFields>;
};
type DirectionalSourceSection = {
    source: "trakt" | "streaming";
    occurrences: AIOMetadataCanonicalOccurrence[];
    override?: AIOMetadataTraktExportOverride | AIOMetadataStreamingExportOverride;
    overridePresence: Partial<Record<"sort" | "sortDirection" | "cacheTTL", boolean>>;
    currentValues: Partial<AIOMetadataResolvedTraktExportFields> | Partial<AIOMetadataResolvedStreamingExportFields>;
};
type SourceSection = MDBListSourceSection | DirectionalSourceSection;

const EDITABLE_SOURCES: EditableSource[] = ["mdblist", "trakt", "streaming"];
const SOURCE_LABELS: Record<EditableSource, string> = {
    mdblist: "MDBList Catalogs",
    trakt: "Trakt Catalogs",
    streaming: "Streaming Catalogs",
};

const getScopeLabel = (target: AIOMetadataExportSettingsDialogTarget) => {
    if (target.kind === "root") return "AIOMetadata Settings";
    if (target.kind === "widget") return "Main Group Settings";
    if (target.kind === "item") return "Subgroup Settings";
    return "Catalog Settings";
};

const getScopeSelectionKey = (target: AIOMetadataExportSettingsDialogTarget): ScopeSelectionKey | null => {
    if (target.kind === "widget") return `widget:${target.widgetId}`;
    if (target.kind === "item") return `item:${target.itemId}`;
    if (target.kind === "catalog") return `catalog:${target.comparisonKey}`;
    return null;
};

const normalizeDialogTarget = (target: AIOMetadataExportSettingsDialogTarget | null) =>
    target?.kind === "root" ? null : target;

const buildDialogSessionKey = (
    open: boolean,
    target: AIOMetadataExportSettingsDialogTarget | null,
    overrides: AIOMetadataExportOverrideState
) => JSON.stringify({
    open,
    target,
    overrides,
});

const getInitialExpandedState = (
    target: AIOMetadataExportSettingsDialogTarget | null,
    scopePaths: {
        itemToWidget: Map<string, EditableScopePath>;
        catalogToPath: Map<string, EditableScopePath>;
    }
) => {
    const openWidgetIds = new Set<string>();
    const openItemIds = new Set<string>();
    const selectedScope = normalizeDialogTarget(target);

    if (!selectedScope) {
        return {
            selectedScope: null,
            openWidgetIds,
            openItemIds,
        };
    }

    if (selectedScope.kind === "widget") {
        openWidgetIds.add(selectedScope.widgetId);
        return {
            selectedScope,
            openWidgetIds,
            openItemIds,
        };
    }

    if (selectedScope.kind === "item") {
        const path = scopePaths.itemToWidget.get(selectedScope.itemId);
        if (path) {
            openWidgetIds.add(path.widgetId);
        }
        openItemIds.add(selectedScope.itemId);
        return {
            selectedScope,
            openWidgetIds,
            openItemIds,
        };
    }

    const path = scopePaths.catalogToPath.get(selectedScope.comparisonKey);
    if (path) {
        openWidgetIds.add(path.widgetId);
        if (path.itemId) {
            openItemIds.add(path.itemId);
        }
    }

    return {
        selectedScope,
        openWidgetIds,
        openItemIds,
    };
};

const getUniformValue = <T,>(values: T[]) => {
    if (values.length === 0) return undefined;
    return values.every((value) => value === values[0]) ? values[0] : undefined;
};

const hasNumericCacheTTL = (value: unknown): value is { cacheTTL: number } =>
    typeof value === "object" && value !== null && "cacheTTL" in value && typeof (value as { cacheTTL?: unknown }).cacheTTL === "number";

const cloneOverrides = (
    overrides: AIOMetadataExportOverrideState
): AIOMetadataExportOverrideState => ({
    widgets: Object.fromEntries(
        Object.entries(overrides.widgets).map(([key, value]) => [key, { ...value }])
    ),
    items: Object.fromEntries(
        Object.entries(overrides.items).map(([key, value]) => [key, { ...value }])
    ),
    catalogs: { ...overrides.catalogs },
});

const getSourceScopedOverride = <TOverride extends Record<string, unknown>>(
    overrideMap: AIOMetadataSourceScopedOverrideMap | undefined,
    source: EditableSource
) => overrideMap?.[source] as TOverride | undefined;

const getScopeCurrentValues = (
    occurrences: AIOMetadataCanonicalOccurrence[],
    overrides: AIOMetadataExportOverrideState
) => occurrences.reduce<SourceCurrentValues>((result, occurrence) => {
    const effectiveCatalog = applyExportOverrideToCatalog(occurrence, overrides);
    const effectiveCatalogRecord = effectiveCatalog as Record<string, unknown>;

    if (occurrence.source === "mdblist") {
        const current = result.mdblist;
        const nextSortValues = [...((current as { __sortValues?: string[] }).__sortValues || []), String(effectiveCatalog.sort)];
        const nextOrderValues = isSortDirectionValue(effectiveCatalogRecord.order)
            ? [...((current as { __orderValues?: Array<"asc" | "desc"> }).__orderValues || []), effectiveCatalogRecord.order]
            : ((current as { __orderValues?: Array<"asc" | "desc"> }).__orderValues || []);
        const nextCacheValues = hasNumericCacheTTL(effectiveCatalog)
            ? [...((current as { __cacheValues?: number[] }).__cacheValues || []), effectiveCatalog.cacheTTL]
            : ((current as { __cacheValues?: number[] }).__cacheValues || []);

        result.mdblist = {
            sort: getUniformValue(nextSortValues as AIOMetadataMDBListSort[]),
            order: getUniformValue(nextOrderValues),
            cacheTTL: getUniformValue(nextCacheValues),
            __sortValues: nextSortValues,
            __orderValues: nextOrderValues,
            __cacheValues: nextCacheValues,
        } as Partial<AIOMetadataResolvedMDBListExportFields>;
    }

    if (occurrence.source === "trakt") {
        const current = result.trakt;
        const nextSortValues = typeof effectiveCatalog.sort === "string"
            ? [...((current as { __sortValues?: string[] }).__sortValues || []), effectiveCatalog.sort]
            : ((current as { __sortValues?: string[] }).__sortValues || []);
        const nextDirectionValues = isSortDirectionValue(effectiveCatalogRecord.sortDirection)
            ? [...((current as { __directionValues?: Array<"asc" | "desc"> }).__directionValues || []), effectiveCatalogRecord.sortDirection]
            : ((current as { __directionValues?: Array<"asc" | "desc"> }).__directionValues || []);
        const nextCacheValues = hasNumericCacheTTL(effectiveCatalog)
            ? [...((current as { __cacheValues?: number[] }).__cacheValues || []), effectiveCatalog.cacheTTL]
            : ((current as { __cacheValues?: number[] }).__cacheValues || []);

        result.trakt = {
            sort: getUniformValue(nextSortValues as AIOMetadataTraktSort[]),
            sortDirection: getUniformValue(nextDirectionValues),
            cacheTTL: getUniformValue(nextCacheValues),
            __sortValues: nextSortValues,
            __directionValues: nextDirectionValues,
            __cacheValues: nextCacheValues,
        } as Partial<AIOMetadataResolvedTraktExportFields>;
    }

    if (occurrence.source === "streaming") {
        const current = result.streaming;
        const nextSortValues = typeof effectiveCatalog.sort === "string"
            ? [...((current as { __sortValues?: string[] }).__sortValues || []), effectiveCatalog.sort]
            : ((current as { __sortValues?: string[] }).__sortValues || []);
        const nextDirectionValues = isSortDirectionValue(effectiveCatalogRecord.sortDirection)
            ? [...((current as { __directionValues?: Array<"asc" | "desc"> }).__directionValues || []), effectiveCatalogRecord.sortDirection]
            : ((current as { __directionValues?: Array<"asc" | "desc"> }).__directionValues || []);

        result.streaming = {
            sort: getUniformValue(nextSortValues as AIOMetadataStreamingSort[]),
            sortDirection: getUniformValue(nextDirectionValues),
            __sortValues: nextSortValues,
            __directionValues: nextDirectionValues,
        } as Partial<AIOMetadataResolvedStreamingExportFields>;
    }

    return result;
}, {
    mdblist: {},
    trakt: {},
    streaming: {},
});

const isSortDirectionValue = (value: unknown): value is "asc" | "desc" =>
    value === "asc" || value === "desc";

const getTargetScopeOverride = <TOverride extends Record<string, unknown>>(
    target: AIOMetadataExportSettingsDialogTarget,
    overrides: AIOMetadataExportOverrideState,
    source: EditableSource
) => {
    if (target.kind === "widget") return getSourceScopedOverride<TOverride>(overrides.widgets[target.widgetId], source);
    if (target.kind === "item") return getSourceScopedOverride<TOverride>(overrides.items[target.itemId], source);
    if (target.kind === "catalog") return overrides.catalogs[target.comparisonKey] as TOverride | undefined;
    return undefined;
};

const getTargetDescription = (
    target: AIOMetadataExportSettingsDialogTarget,
    occurrenceCount: number
) => {
    if (target.kind === "widget") {
        return `Override defaults for ${occurrenceCount} canonical AIOMetadata catalog${occurrenceCount === 1 ? "" : "s"} in this main group.`;
    }

    if (target.kind === "item") {
        return `Override defaults for ${occurrenceCount} canonical AIOMetadata catalog${occurrenceCount === 1 ? "" : "s"} in this subgroup.`;
    }

    if (target.kind === "catalog") {
        return "Catalog overrides win over subgroup and main-group settings.";
    }

    return null;
};

const getTargetSummaryLabel = (
    scope: AIOMetadataExportSettingsDialogTarget,
    editableWidgets: EditableTreeWidget[],
    scopePaths: {
        itemToWidget: Map<string, EditableScopePath>;
        catalogToPath: Map<string, EditableScopePath>;
    },
    canonicalMap: Map<string, AIOMetadataCanonicalOccurrence>
) => {
    if (scope.kind === "widget") {
        return editableWidgets.find((widget) => widget.id === scope.widgetId)?.name || "Main Group";
    }
    if (scope.kind === "item") {
        return scopePaths.itemToWidget.get(scope.itemId)?.itemName || "Subgroup";
    }
    if (scope.kind === "catalog") {
        return canonicalMap.get(scope.comparisonKey)?.exportCatalog.name || "Catalog";
    }
    return getScopeLabel(scope);
};

const getTargetWidgetName = (
    scope: AIOMetadataExportSettingsDialogTarget,
    editableWidgets: EditableTreeWidget[],
    scopePaths: {
        itemToWidget: Map<string, EditableScopePath>;
        catalogToPath: Map<string, EditableScopePath>;
    }
) => {
    if (scope.kind === "widget") {
        return editableWidgets.find((widget) => widget.id === scope.widgetId)?.name || null;
    }
    if (scope.kind === "item") {
        return scopePaths.itemToWidget.get(scope.itemId)?.widgetName || null;
    }
    if (scope.kind === "catalog") {
        return scopePaths.catalogToPath.get(scope.comparisonKey)?.widgetName || null;
    }
    return null;
};

function OverrideFieldResetButton({
    visible,
    onClick,
}: {
    visible: boolean;
    onClick: () => void;
}) {
    if (!visible) return null;

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-foreground/65 hover:bg-muted/60 hover:text-foreground"
            onClick={onClick}
        >
            Reset
        </Button>
    );
}

function MDBListOverrideForm({
    override,
    overridePresence,
    currentValues,
    onChangeField,
}: {
    override?: AIOMetadataMDBListExportOverride;
    overridePresence: Partial<Record<keyof AIOMetadataMDBListExportOverride, boolean>>;
    currentValues: Partial<AIOMetadataResolvedMDBListExportFields>;
    onChangeField: <K extends keyof AIOMetadataMDBListExportOverride>(
        key: K,
        value: AIOMetadataMDBListExportOverride[K] | undefined
    ) => void;
}) {
    const sortValue = override?.sort ?? currentValues.sort;
    const orderValue = override?.order ?? currentValues.order;
    const effectiveCacheTTL = override?.cacheTTL ?? currentValues.cacheTTL;
    const cachePreset = typeof effectiveCacheTTL === "number"
        ? detectCacheTtlPreset(effectiveCacheTTL)
        : undefined;
    const cachePresetValue = cachePreset === "custom" ? undefined : cachePreset;
    const cachePlaceholder = typeof effectiveCacheTTL === "number"
        ? `${effectiveCacheTTL}s`
        : "Select cache TTL";

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground">Sort</Label>
                    <OverrideFieldResetButton
                        visible={overridePresence.sort === true}
                        onClick={() => onChangeField("sort", undefined)}
                    />
                </div>
                <Select
                    value={sortValue}
                    onValueChange={(value) => onChangeField(
                        "sort",
                        value as AIOMetadataMDBListSort
                    )}
                >
                    <SelectTrigger className={cn("w-full", editorSurface.field)}>
                        <SelectValue placeholder="Mixed values" />
                    </SelectTrigger>
                    <SelectContent className={cn(editorSurface.overlay, "max-h-[18rem]")}>
                        {MDBLIST_SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground">Order</Label>
                    <OverrideFieldResetButton
                        visible={overridePresence.order === true}
                        onClick={() => onChangeField("order", undefined)}
                    />
                </div>
                <Select
                    value={orderValue}
                    onValueChange={(value) => onChangeField(
                        "order",
                        value as "asc" | "desc"
                    )}
                >
                    <SelectTrigger className={cn("w-full", editorSurface.field)}>
                        <SelectValue placeholder="Mixed values" />
                    </SelectTrigger>
                    <SelectContent className={editorSurface.overlay}>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground">Cache TTL</Label>
                    <OverrideFieldResetButton
                        visible={overridePresence.cacheTTL === true}
                        onClick={() => onChangeField("cacheTTL", undefined)}
                    />
                </div>
                <Select
                    value={cachePresetValue}
                    onValueChange={(value) => {
                        const nextValue = value as AIOMetadataCacheTtlPreset;
                        onChangeField("cacheTTL", cacheTtlSecondsFromPreset(nextValue));
                    }}
                >
                    <SelectTrigger className={cn("w-full", editorSurface.field)}>
                        <SelectValue placeholder={cachePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className={editorSurface.overlay}>
                        {CACHE_TTL_PRESET_OPTIONS.filter((option) => option.value !== "custom").map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

        </div>
    );
}

function DirectionalOverrideForm<TSort extends string>({
    title,
    sortOptions,
    override,
    overridePresence,
    currentValues,
    supportsCacheTTL = true,
    onChangeField,
}: {
    title?: string;
    sortOptions: Array<{ value: TSort; label: string }>;
    override?: AIOMetadataTraktExportOverride | AIOMetadataStreamingExportOverride;
    overridePresence: Partial<Record<"sort" | "sortDirection" | "cacheTTL", boolean>>;
    currentValues: Partial<AIOMetadataResolvedTraktExportFields> | Partial<AIOMetadataResolvedStreamingExportFields>;
    supportsCacheTTL?: boolean;
    onChangeField: <K extends "sort" | "sortDirection" | "cacheTTL">(
        key: K,
        value: string | number | undefined
    ) => void;
}) {
    const sortValue = override?.sort ?? currentValues.sort;
    const directionValue = override?.sortDirection ?? currentValues.sortDirection;
    const effectiveCacheTTL = supportsCacheTTL && "cacheTTL" in currentValues
        ? (override as AIOMetadataTraktExportOverride | undefined)?.cacheTTL ?? currentValues.cacheTTL
        : undefined;
    const cachePreset = typeof effectiveCacheTTL === "number"
        ? detectCacheTtlPreset(effectiveCacheTTL)
        : undefined;
    const cachePresetValue = cachePreset === "custom" ? undefined : cachePreset;
    const cachePlaceholder = typeof effectiveCacheTTL === "number"
        ? `${effectiveCacheTTL}s`
        : "Select cache TTL";

    return (
        <div className="space-y-4">
            {title ? (
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
                </div>
            ) : null}

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground">Sort</Label>
                    <OverrideFieldResetButton
                        visible={overridePresence.sort === true}
                        onClick={() => onChangeField("sort", undefined)}
                    />
                </div>
                <Select
                    value={sortValue}
                    onValueChange={(value) => onChangeField("sort", value as TSort)}
                >
                    <SelectTrigger className={cn("w-full", editorSurface.field)}>
                        <SelectValue placeholder="Mixed values" />
                    </SelectTrigger>
                    <SelectContent className={cn(editorSurface.overlay, "max-h-[18rem]")}>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-foreground">Sort Direction</Label>
                    <OverrideFieldResetButton
                        visible={overridePresence.sortDirection === true}
                        onClick={() => onChangeField("sortDirection", undefined)}
                    />
                </div>
                <Select
                    value={directionValue}
                    onValueChange={(value) => onChangeField("sortDirection", value as "asc" | "desc")}
                >
                    <SelectTrigger className={cn("w-full", editorSurface.field)}>
                        <SelectValue placeholder="Mixed values" />
                    </SelectTrigger>
                    <SelectContent className={editorSurface.overlay}>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {supportsCacheTTL ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label className="text-foreground">Cache TTL</Label>
                        <OverrideFieldResetButton
                            visible={overridePresence.cacheTTL === true}
                            onClick={() => onChangeField("cacheTTL", undefined)}
                        />
                    </div>
                    <Select
                        value={cachePresetValue}
                        onValueChange={(value) => {
                            const nextValue = value as AIOMetadataCacheTtlPreset;
                            onChangeField("cacheTTL", cacheTtlSecondsFromPreset(nextValue));
                        }}
                    >
                        <SelectTrigger className={cn("w-full", editorSurface.field)}>
                            <SelectValue placeholder={cachePlaceholder} />
                        </SelectTrigger>
                        <SelectContent className={editorSurface.overlay}>
                            {CACHE_TTL_PRESET_OPTIONS.filter((option) => option.value !== "custom").map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : null}
        </div>
    );
}

function AIOMetadataExportSettingsDialogBody({
    target,
    inventory,
    initialOverrides,
    useUmeSorting,
    onCancel,
    onSave,
}: {
    target: AIOMetadataExportSettingsDialogTarget | null;
    inventory: AIOMetadataExportInventory;
    initialOverrides: AIOMetadataExportOverrideState;
    useUmeSorting: boolean;
    onCancel: () => void;
    onSave: (nextValue: AIOMetadataExportOverrideState) => void;
}) {
    const canonicalMap = useMemo(
        () => getCanonicalOccurrencesByComparisonKey(inventory),
        [inventory]
    );
    const editableOccurrences = useMemo(
        () => Array.from(canonicalMap.values()).filter((occurrence) =>
            EDITABLE_SOURCES.includes(occurrence.source as EditableSource)
        ),
        [canonicalMap]
    );
    const editableWidgets = useMemo<EditableTreeWidget[]>(() => {
        const widgets = new Map<string, EditableTreeWidget>();
        editableOccurrences.forEach((occurrence) => {
            if (target?.kind === "widget" && occurrence.widgetId !== target.widgetId) return;
            if (target?.kind === "item" && occurrence.itemId !== target.itemId) return;
            if (target?.kind === "catalog" && occurrence.comparisonKey !== target.comparisonKey) return;

            if (!widgets.has(occurrence.widgetId)) {
                widgets.set(occurrence.widgetId, {
                    id: occurrence.widgetId,
                    name: occurrence.widgetName,
                    items: [],
                });
            }

            const widget = widgets.get(occurrence.widgetId)!;
            let item = widget.items.find((candidate) => candidate.id === occurrence.itemId);
            if (!item) {
                item = {
                    id: occurrence.itemId,
                    name: occurrence.itemName,
                    occurrences: [],
                };
                widget.items.push(item);
            }

            item.occurrences.push(occurrence);
        });

        return Array.from(widgets.values()).map((widget) => ({
            ...widget,
            items: widget.items.map((item) => ({
                ...item,
                occurrences: [...item.occurrences].sort((left, right) =>
                    left.exportCatalog.name.localeCompare(right.exportCatalog.name, undefined, { sensitivity: "base" })
                ),
            })),
        }));
    }, [editableOccurrences, target]);
    const scopePaths = useMemo(() => {
        const itemToWidget = new Map<string, EditableScopePath>();
        const catalogToPath = new Map<string, EditableScopePath>();

        editableWidgets.forEach((widget) => {
            widget.items.forEach((item) => {
                itemToWidget.set(item.id, {
                    widgetId: widget.id,
                    widgetName: widget.name,
                    itemId: item.id,
                    itemName: item.name,
                });

                item.occurrences.forEach((occurrence) => {
                    catalogToPath.set(occurrence.comparisonKey, {
                        widgetId: widget.id,
                        widgetName: widget.name,
                        itemId: item.id,
                        itemName: item.name,
                    });
                });
            });
        });

        return { itemToWidget, catalogToPath };
    }, [editableWidgets]);
    const initialExpandedState = getInitialExpandedState(target, scopePaths);
    const [selectedScope, setSelectedScope] = useState<AIOMetadataExportSettingsDialogTarget | null>(
        initialExpandedState.selectedScope
    );
    const [openWidgetIds, setOpenWidgetIds] = useState<Set<string>>(initialExpandedState.openWidgetIds);
    const [openItemIds, setOpenItemIds] = useState<Set<string>>(initialExpandedState.openItemIds);
    const [browserQuery, setBrowserQuery] = useState("");
    const [isScopePickerOpen, setIsScopePickerOpen] = useState(false);
    const [checkedScopeKeys, setCheckedScopeKeys] = useState<Set<ScopeSelectionKey>>(new Set());
    const [draftOverrides, setDraftOverrides] = useState<AIOMetadataExportOverrideState>(
        cloneOverrides(initialOverrides)
    );
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isResetAllConfirmOpen, setIsResetAllConfirmOpen] = useState(false);
    const isSearching = browserQuery.trim().length > 0;

    const effectiveDraftOverrides = useMemo(
        () => useUmeSorting
            ? getDefaultAIOMetadataExportOverrides({
                inventory,
                currentOverrides: draftOverrides,
            })
            : draftOverrides,
        [draftOverrides, inventory, useUmeSorting]
    );

    const filteredEditableWidgets = useMemo(() => {
        const normalizedQuery = browserQuery.trim().toLocaleLowerCase();
        if (!normalizedQuery) return editableWidgets;

        return editableWidgets.flatMap((widget) => {
            const widgetMatches = widget.name.toLocaleLowerCase().includes(normalizedQuery);
            const items = widget.items.flatMap((item) => {
                const itemMatches = item.name.toLocaleLowerCase().includes(normalizedQuery);
                const occurrences = widgetMatches || itemMatches
                    ? item.occurrences
                    : item.occurrences.filter((occurrence) =>
                        occurrence.exportCatalog.name.toLocaleLowerCase().includes(normalizedQuery)
                    );

                if (!widgetMatches && !itemMatches && occurrences.length === 0) {
                    return [];
                }

                return [{
                    ...item,
                    occurrences,
                }];
            });

            if (!widgetMatches && items.length === 0) {
                return [];
            }

            return [{
                ...widget,
                items,
            }];
        });
    }, [browserQuery, editableWidgets]);
    const selectionKeyMap = useMemo(() => {
        const map = new Map<ScopeSelectionKey, AIOMetadataExportSettingsDialogTarget>();

        editableWidgets.forEach((widget) => {
            map.set(`widget:${widget.id}`, { kind: "widget", widgetId: widget.id });
            widget.items.forEach((item) => {
                map.set(`item:${item.id}`, { kind: "item", itemId: item.id });
                item.occurrences.forEach((occurrence) => {
                    map.set(`catalog:${occurrence.comparisonKey}`, {
                        kind: "catalog",
                        comparisonKey: occurrence.comparisonKey,
                    });
                });
            });
        });

        return map;
    }, [editableWidgets]);
    const widgetDescendantSelectionKeys = useMemo(() => {
        const map = new Map<string, ScopeSelectionKey[]>();

        editableWidgets.forEach((widget) => {
            map.set(
                widget.id,
                widget.items.flatMap((item) => [
                    `item:${item.id}` as ScopeSelectionKey,
                    ...item.occurrences.map(
                        (occurrence) => `catalog:${occurrence.comparisonKey}` as ScopeSelectionKey
                    ),
                ])
            );
        });

        return map;
    }, [editableWidgets]);
    const itemDescendantSelectionKeys = useMemo(() => {
        const map = new Map<string, ScopeSelectionKey[]>();

        editableWidgets.forEach((widget) => {
            widget.items.forEach((item) => {
                map.set(
                    item.id,
                    item.occurrences.map(
                        (occurrence) => `catalog:${occurrence.comparisonKey}` as ScopeSelectionKey
                    )
                );
            });
        });

        return map;
    }, [editableWidgets]);

    const toggleCheckedScope = (scope: AIOMetadataExportSettingsDialogTarget) => {
        const key = getScopeSelectionKey(scope);
        if (!key) return;
        setSelectedScope(scope);

        setCheckedScopeKeys((current) => {
            const next = new Set(current);

            if (scope.kind === "widget") {
                const descendantKeys = widgetDescendantSelectionKeys.get(scope.widgetId) || [];
                if (next.has(key)) {
                    next.delete(key);
                    descendantKeys.forEach((descendantKey) => next.delete(descendantKey));
                } else {
                    next.add(key);
                    descendantKeys.forEach((descendantKey) => next.add(descendantKey));
                }
                return next;
            }

            if (scope.kind === "item") {
                const descendantKeys = itemDescendantSelectionKeys.get(scope.itemId) || [];
                if (next.has(key)) {
                    next.delete(key);
                    descendantKeys.forEach((descendantKey) => next.delete(descendantKey));
                } else {
                    next.add(key);
                    descendantKeys.forEach((descendantKey) => next.add(descendantKey));
                }
                return next;
            }

            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const selectedTargets = useMemo(() => {
        const checkedTargets = Array.from(checkedScopeKeys)
            .map((key) => selectionKeyMap.get(key))
            .filter((value): value is AIOMetadataExportSettingsDialogTarget => Boolean(value));

        if (checkedTargets.length > 0) {
            const selectedWidgetIds = new Set(
                checkedTargets
                    .filter((scope): scope is Extract<AIOMetadataExportSettingsDialogTarget, { kind: "widget" }> => scope.kind === "widget")
                    .map((scope) => scope.widgetId)
            );
            const selectedItemIds = new Set(
                checkedTargets
                    .filter((scope): scope is Extract<AIOMetadataExportSettingsDialogTarget, { kind: "item" }> => scope.kind === "item")
                    .map((scope) => scope.itemId)
            );

            return checkedTargets.filter((scope) => {
                if (scope.kind === "widget") return true;
                if (scope.kind === "item") {
                    const path = scopePaths.itemToWidget.get(scope.itemId);
                    return path ? !selectedWidgetIds.has(path.widgetId) : true;
                }
                if (scope.kind !== "catalog") return false;

                const path = scopePaths.catalogToPath.get(scope.comparisonKey);
                if (!path) return true;
                if (selectedWidgetIds.has(path.widgetId)) return false;
                if (path.itemId && selectedItemIds.has(path.itemId)) return false;
                return true;
            });
        }

        return selectedScope ? [selectedScope] : [];
    }, [checkedScopeKeys, scopePaths.catalogToPath, scopePaths.itemToWidget, selectedScope, selectionKeyMap]);

    const getOccurrencesForTarget = (scope: AIOMetadataExportSettingsDialogTarget) => {
        if (scope.kind === "catalog") {
            const occurrence = canonicalMap.get(scope.comparisonKey);
            return occurrence ? [occurrence] : [];
        }

        if (scope.kind === "item") {
            const item = editableWidgets.flatMap((widget) => widget.items).find((candidate) => candidate.id === scope.itemId);
            return item?.occurrences || [];
        }

        if (scope.kind === "widget") {
            const widget = editableWidgets.find((candidate) => candidate.id === scope.widgetId);
            return widget ? widget.items.flatMap((item) => item.occurrences) : [];
        }

        return [];
    };

    const checkedCount = checkedScopeKeys.size;
    const displayTarget = checkedCount === 1 ? selectedTargets[0] : selectedScope;
    const selectedOccurrence = displayTarget?.kind === "catalog"
        ? canonicalMap.get(displayTarget.comparisonKey) || null
        : null;
    const selectedWidget = displayTarget?.kind === "widget"
        ? editableWidgets.find((widget) => widget.id === displayTarget.widgetId) || null
        : null;
    const selectedItem = displayTarget?.kind === "item"
        ? editableWidgets.flatMap((widget) => widget.items).find((item) => item.id === displayTarget.itemId) || null
        : null;
    const selectionSummaryLabel = (() => {
        if (selectedTargets.length === 0) return null;
        if (selectedTargets.length === 1) {
            return getTargetSummaryLabel(selectedTargets[0], editableWidgets, scopePaths, canonicalMap);
        }

        const widgetNames = Array.from(new Set(
            selectedTargets
                .map((scope) => getTargetWidgetName(scope, editableWidgets, scopePaths))
                .filter((value): value is string => Boolean(value))
        ));
        if (widgetNames.length === 1) {
            return `${widgetNames[0]} + ${selectedTargets.length - 1} more`;
        }

        return `${getTargetSummaryLabel(selectedTargets[0], editableWidgets, scopePaths, canonicalMap)} + ${selectedTargets.length - 1} more`;
    })();
    const selectedTargetOccurrences = Array.from(
        new Map(
            selectedTargets
                .flatMap((scope) => getOccurrencesForTarget(scope))
                .map((occurrence) => [occurrence.comparisonKey, occurrence] as const)
        ).values()
    );
    const selectedScopeCurrentValues = useMemo(
        () => (
            selectedTargetOccurrences.length > 0
                ? getScopeCurrentValues(selectedTargetOccurrences, effectiveDraftOverrides)
                : { mdblist: {}, trakt: {}, streaming: {} }
        ),
        [effectiveDraftOverrides, selectedTargetOccurrences]
    );
    const selectedScopeOccurrenceCount = selectedTargetOccurrences.length;
    const selectedSourceBuckets = useMemo(() => {
        const buckets = new Map<EditableSource, AIOMetadataCanonicalOccurrence[]>();

        selectedTargetOccurrences.forEach((occurrence) => {
            const source = occurrence.source as EditableSource;
            const current = buckets.get(source) || [];
            current.push(occurrence);
            buckets.set(source, current);
        });

        return buckets;
    }, [selectedTargetOccurrences]);
    const selectedSourceSections = useMemo<SourceSection[]>(() => EDITABLE_SOURCES.reduce<SourceSection[]>((sections, source) => {
        const occurrences = selectedSourceBuckets.get(source) || [];
        if (occurrences.length === 0) return sections;

        if (source === "mdblist") {
            const selectedOverridesForSource = selectedTargets.map((scope) =>
                getTargetScopeOverride<AIOMetadataMDBListExportOverride>(scope, draftOverrides, source)
            );
            const override = selectedTargets.length === 1
                ? selectedOverridesForSource[0]
                : {
                    sort: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.sort)
                            .filter((value): value is AIOMetadataMDBListSort => typeof value === "string")
                    ),
                    order: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.order)
                            .filter((value): value is "asc" | "desc" => value === "asc" || value === "desc")
                    ),
                    cacheTTL: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.cacheTTL)
                            .filter((value): value is number => typeof value === "number")
                    ),
                };

            sections.push({
                source,
                occurrences,
                override,
                overridePresence: {
                    sort: selectedOverridesForSource.some((entry) => entry?.sort !== undefined),
                    order: selectedOverridesForSource.some((entry) => entry?.order !== undefined),
                    cacheTTL: selectedOverridesForSource.some((entry) => entry?.cacheTTL !== undefined),
                },
                currentValues: selectedScopeCurrentValues.mdblist,
            });
            return sections;
        }

        const selectedOverridesForSource = selectedTargets.map((scope) =>
            getTargetScopeOverride<AIOMetadataTraktExportOverride | AIOMetadataStreamingExportOverride>(scope, draftOverrides, source)
        );
        const override = selectedTargets.length === 1
            ? selectedOverridesForSource[0]
            : source === "trakt"
                ? {
                    sort: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.sort)
                            .filter((value): value is AIOMetadataTraktSort => typeof value === "string")
                    ),
                    sortDirection: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.sortDirection)
                            .filter((value): value is "asc" | "desc" => value === "asc" || value === "desc")
                    ),
                    cacheTTL: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => hasNumericCacheTTL(entry) ? entry.cacheTTL : undefined)
                            .filter((value): value is number => typeof value === "number")
                    ),
                }
                : {
                    sort: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.sort)
                            .filter((value): value is AIOMetadataStreamingSort => typeof value === "string")
                    ),
                    sortDirection: getUniformValue(
                        selectedOverridesForSource
                            .map((entry) => entry?.sortDirection)
                            .filter((value): value is "asc" | "desc" => value === "asc" || value === "desc")
                    ),
                };

        sections.push({
            source,
            occurrences,
            override,
            overridePresence: {
                sort: selectedOverridesForSource.some((entry) => entry?.sort !== undefined),
                sortDirection: selectedOverridesForSource.some((entry) => entry?.sortDirection !== undefined),
                cacheTTL: source === "trakt" && selectedOverridesForSource.some((entry) => hasNumericCacheTTL(entry)),
            },
            currentValues: source === "trakt" ? selectedScopeCurrentValues.trakt : selectedScopeCurrentValues.streaming,
        });
        return sections;
    }, []), [draftOverrides, selectedScopeCurrentValues, selectedSourceBuckets, selectedTargets]);
    const hasAnyDraftOverrides = useMemo(
        () =>
            Object.keys(draftOverrides.widgets).length > 0
            || Object.keys(draftOverrides.items).length > 0
            || Object.keys(draftOverrides.catalogs).length > 0,
        [draftOverrides]
    );

    const handleScopeFieldChange = <
        TSource extends EditableSource,
        TKey extends keyof SourceOverrideBySource[TSource],
    >(
        source: TSource,
        key: TKey,
        value: SourceOverrideBySource[TSource][TKey] | undefined
    ) => {
        if (selectedTargets.length === 0) return;

        const nextOverrides = cloneOverrides(draftOverrides);

        selectedTargets.forEach((scope) => {
            if (scope.kind === "root") return;

            const scopeKey = scope.kind === "widget"
                ? scope.widgetId
                : scope.kind === "item"
                    ? scope.itemId
                    : scope.comparisonKey;
            const scopeName = scope.kind === "widget"
                ? "widgets"
                : scope.kind === "item"
                    ? "items"
                    : "catalogs";
            if (scopeName === "catalogs") {
                const currentScopeValue = (nextOverrides.catalogs[scopeKey] || {}) as AIOMetadataCatalogExportOverride;
                const nextScopeValue = {
                    ...currentScopeValue,
                    [key]: value,
                } as Record<string, unknown>;

                if (value === undefined) {
                    delete nextScopeValue[String(key)];
                }

                if (Object.keys(nextScopeValue).length === 0) {
                    delete nextOverrides.catalogs[scopeKey];
                } else {
                    nextOverrides.catalogs[scopeKey] = nextScopeValue as AIOMetadataCatalogExportOverride;
                }
                return;
            }

            const scopedOverrides = nextOverrides[scopeName][scopeKey] || {};
            const currentSourceValue = (scopedOverrides[source] || {}) as SourceOverrideBySource[TSource];
            const nextSourceValue = {
                ...currentSourceValue,
                [key]: value,
            } as SourceOverrideBySource[TSource];

            if (value === undefined) {
                delete nextSourceValue[key];
            }

            if (Object.keys(nextSourceValue).length === 0) {
                delete scopedOverrides[source];
            } else {
                scopedOverrides[source] = nextSourceValue;
            }

            if (Object.keys(scopedOverrides).length === 0) {
                delete nextOverrides[scopeName][scopeKey];
            } else {
                nextOverrides[scopeName][scopeKey] = scopedOverrides;
            }
        });

        setDraftOverrides(nextOverrides);
    };

    const handleResetScope = (source?: EditableSource) => {
        if (selectedTargets.length === 0) return;

        const sourcesToReset = source
            ? [source]
            : selectedSourceSections.map((section) => section.source);
        if (sourcesToReset.length === 0) return;

        const nextOverrides = cloneOverrides(draftOverrides);

        selectedTargets.forEach((scope) => {
            if (scope.kind === "root") return;

            const scopeKey = scope.kind === "widget"
                ? scope.widgetId
                : scope.kind === "item"
                    ? scope.itemId
                    : scope.comparisonKey;
            const scopeName = scope.kind === "widget"
                ? "widgets"
                : scope.kind === "item"
                    ? "items"
                    : "catalogs";
            sourcesToReset.forEach((currentSource) => {
                if (scopeName === "catalogs") {
                    const currentScopeValue = { ...(nextOverrides.catalogs[scopeKey] || {}) } as AIOMetadataCatalogExportOverride;
                    const keysToDelete = currentSource === "mdblist"
                        ? ["sort", "order", "cacheTTL"]
                        : currentSource === "trakt"
                            ? ["sort", "sortDirection", "cacheTTL"]
                            : ["sort", "sortDirection"];
                    keysToDelete.forEach((field) => {
                        delete currentScopeValue[field as keyof AIOMetadataCatalogExportOverride];
                    });

                    if (Object.keys(currentScopeValue).length === 0) {
                        delete nextOverrides.catalogs[scopeKey];
                    } else {
                        nextOverrides.catalogs[scopeKey] = currentScopeValue;
                    }
                    return;
                }

                const currentScopeValue = { ...(nextOverrides[scopeName][scopeKey] || {}) };
                delete currentScopeValue[currentSource];

                if (Object.keys(currentScopeValue).length === 0) {
                    delete nextOverrides[scopeName][scopeKey];
                } else {
                    nextOverrides[scopeName][scopeKey] = currentScopeValue;
                }
            });
        });

        setDraftOverrides(nextOverrides);
    };

    const handleResetAllOverrides = () => {
        setDraftOverrides(cloneOverrides(EMPTY_AIOMETADATA_EXPORT_OVERRIDE_STATE));
        setIsResetAllConfirmOpen(false);
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleSave = () => {
        onSave(cloneOverrides(draftOverrides));
    };

    const handleApplyUMESettings = () => {
        const result = applyAIOMetadataExportTemplate({
            inventory,
            currentOverrides: draftOverrides,
            template: DEFAULT_AIOMETADATA_EXPORT_TEMPLATE,
            mode: "replace-matching",
        });

        setDraftOverrides(result.nextOverrides);
        setIsTemplateDialogOpen(false);
    };

    const toggleWidgetOpen = (widgetId: string) => {
        setOpenWidgetIds((current) => {
            const next = new Set(current);
            if (next.has(widgetId)) next.delete(widgetId);
            else next.add(widgetId);
            return next;
        });
    };

    const toggleItemOpen = (itemId: string) => {
        setOpenItemIds((current) => {
            const next = new Set(current);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const selectedScopeLabel = selectionSummaryLabel
        || selectedWidget?.name
        || selectedItem?.name
        || selectedOccurrence?.exportCatalog.name
        || getScopeLabel(target || { kind: "root" });
    const selectedScopePath = displayTarget?.kind === "catalog"
        ? scopePaths.catalogToPath.get(displayTarget.comparisonKey)
        : displayTarget?.kind === "item"
            ? scopePaths.itemToWidget.get(displayTarget.itemId)
            : displayTarget?.kind === "widget"
                ? {
                    widgetId: displayTarget.widgetId,
                    widgetName: selectedWidget?.name || selectedScopeLabel,
                }
                : null;
    const isRootScope = !target || target.kind === "root";
    const selectedScopeMeta = selectedTargets.length > 1
        ? `${selectedScopeOccurrenceCount} catalogs across checked scopes`
        : !displayTarget
        ? isRootScope
            ? "Choose groups, subgroups, or catalogs to start editing overrides."
            : "No editable AIOMetadata scope available."
        : displayTarget.kind === "catalog"
            ? selectedScopePath?.itemName
                ? `${selectedScopePath.widgetName} / ${selectedScopePath.itemName}`
                : selectedScopePath?.widgetName || null
            : `${selectedScopeOccurrenceCount} catalog${selectedScopeOccurrenceCount === 1 ? "" : "s"}`;
    const scopePickerTitle = isRootScope ? "Select Catalogs" : "Limit Scope";
    const scopePickerHint = selectedTargets.length > 0
        ? selectionSummaryLabel || `${selectedTargets.length} selected`
        : isRootScope
            ? "Choose groups, subgroups, or catalogs"
            : "Optional: restrict this override to a subset";

    return (
        <>
            <DialogContent
                className={cn(
                    editorLayout.dialogContent,
                    "h-[min(88dvh,58rem)] w-[min(calc(100%-2rem),68rem)] max-w-[min(calc(100%-2rem),68rem)] overflow-hidden p-5 sm:w-[min(94vw,68rem)] sm:max-w-[min(94vw,68rem)] sm:p-6"
                )}
                showCloseButton={false}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-4 top-4 z-10 h-9 w-9 rounded-xl text-foreground/65 hover:text-foreground sm:right-5 sm:top-5"
                    onClick={handleCancel}
                    aria-label="Close AIOMetadata settings"
                >
                    <X className="h-4 w-4" />
                </Button>
                <DialogHeader className="pr-10">
                    <DialogTitle>{getScopeLabel(target || { kind: "root" })}</DialogTitle>
                    {getTargetDescription(target || { kind: "root" }, selectedScopeOccurrenceCount) && (
                        <DialogDescription>
                            {getTargetDescription(target || { kind: "root" }, selectedScopeOccurrenceCount)}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {target?.kind !== "catalog" && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 sm:h-9 rounded-lg text-base sm:text-sm"
                            onClick={() => setIsTemplateDialogOpen(true)}
                        >
                            <WandSparkles className="h-4 w-4" />
                            Apply UME Sorting
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 sm:h-9 rounded-lg text-base sm:text-sm"
                            onClick={() => {
                                if (isRootScope) {
                                    setIsResetAllConfirmOpen(true);
                                    return;
                                }
                                handleResetScope();
                            }}
                            disabled={isRootScope
                                ? !hasAnyDraftOverrides
                                : selectedTargets.length === 0 || selectedSourceSections.length === 0}
                        >
                            {isRootScope ? "Reset All" : "Reset"}
                        </Button>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-hidden">
                    <div className={cn(editorSurface.card, "flex min-h-0 h-full flex-col overflow-hidden")}>
                        <div className="border-b border-slate-200/70 px-4 py-3 dark:border-white/8">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold tracking-tight text-foreground">{selectedScopeLabel}</p>
                                {selectedScopeMeta && (
                                    <p className="mt-1 text-xs text-foreground/55">
                                        {selectedScopeMeta}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            <div className="space-y-4 p-4">
                                {isRootScope && (
                                    <div className="border-b border-slate-200/70 pb-4 dark:border-white/8">
                                        <button
                                            type="button"
                                            onClick={() => setIsScopePickerOpen((current) => !current)}
                                            className={cn(
                                                editorSurface.panel,
                                                editorHover.rowSubtle,
                                                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors"
                                            )}
                                        >
                                            <span className="min-w-0">
                                                <span className="block text-xs font-medium uppercase tracking-[0.14em] text-foreground/42">
                                                    {scopePickerTitle}
                                                </span>
                                                <span className="mt-1 block truncate text-sm font-medium text-foreground/70">
                                                    {scopePickerHint}
                                                </span>
                                            </span>
                                            {isScopePickerOpen ? (
                                                <ChevronDown className="h-4 w-4 text-foreground/56" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-foreground/56" />
                                            )}
                                        </button>
                                        {isScopePickerOpen && (
                                            <div className={cn(editorSurface.panel, "mt-3 overflow-hidden")}>
                                                <div className="border-b border-slate-200/70 px-3 py-3 dark:border-white/8">
                                                    <Input
                                                        value={browserQuery}
                                                        onChange={(event) => setBrowserQuery(event.target.value)}
                                                        placeholder="Search groups or catalogs"
                                                        className={cn(editorSurface.field, "h-10")}
                                                    />
                                                </div>
                                                <div className="h-[min(28dvh,15rem)] overflow-y-auto overscroll-contain lg:h-[min(32dvh,17rem)]">
                                                    <div className="divide-y divide-slate-200/65 px-2 dark:divide-white/8">
                                                        {filteredEditableWidgets.length === 0 && (
                                                            <div className="px-3 py-8 text-sm text-foreground/58">
                                                                No groups or catalogs match your search.
                                                            </div>
                                                        )}
                                                        {filteredEditableWidgets.map((widget) => {
                                                            const widgetOpen = isSearching || openWidgetIds.has(widget.id);
                                                            const widgetOccurrenceCount = widget.items.reduce((total, item) => total + item.occurrences.length, 0);
                                                            const widgetChecked = checkedScopeKeys.has(`widget:${widget.id}`);

                                                            return (
                                                                <div key={widget.id} className="py-1.5">
                                                                    <div className="grid grid-cols-[2rem_1rem_minmax(0,1fr)] items-center gap-x-1.5 rounded-xl px-1 py-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon-sm"
                                                                            className="h-8 w-8 justify-self-center rounded-lg text-foreground/60 hover:text-foreground"
                                                                            onClick={() => toggleWidgetOpen(widget.id)}
                                                                        >
                                                                            {widgetOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                        </Button>
                                                                        <Checkbox
                                                                            className="justify-self-center"
                                                                            checked={widgetChecked}
                                                                            onCheckedChange={() => toggleCheckedScope({ kind: "widget", widgetId: widget.id })}
                                                                            aria-label={widgetChecked ? `Deselect ${widget.name}` : `Select ${widget.name}`}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleCheckedScope({ kind: "widget", widgetId: widget.id })}
                                                                            className={cn(
                                                                                "min-w-0 rounded-lg px-2 py-2 text-left transition-colors",
                                                                                editorHover.rowSubtle
                                                                            )}
                                                                        >
                                                                            <p className="truncate text-sm font-semibold tracking-tight">{widget.name}</p>
                                                                            <p className="text-xs text-foreground/54">{widgetOccurrenceCount} catalogs</p>
                                                                        </button>
                                                                    </div>
                                                                    {widgetOpen && (
                                                                        <div className="ml-4 border-l border-slate-200/70 pl-3 dark:border-white/8">
                                                                            {widget.items.map((item) => {
                                                                                const itemOpen = isSearching || openItemIds.has(item.id);
                                                                                const itemChecked = checkedScopeKeys.has(`item:${item.id}`);

                                                                                return (
                                                                                    <div key={item.id} className="py-1">
                                                                                        <div className="grid grid-cols-[2rem_1rem_minmax(0,1fr)] items-center gap-x-1.5 rounded-xl px-1 py-1">
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="ghost"
                                                                                                size="icon-sm"
                                                                                                className="h-7 w-7 justify-self-center rounded-lg text-foreground/55 hover:text-foreground"
                                                                                                onClick={() => toggleItemOpen(item.id)}
                                                                                            >
                                                                                                {itemOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                                            </Button>
                                                                                            <Checkbox
                                                                                                className="justify-self-center"
                                                                                                checked={itemChecked}
                                                                                                onCheckedChange={() => toggleCheckedScope({ kind: "item", itemId: item.id })}
                                                                                                aria-label={itemChecked ? `Deselect ${item.name}` : `Select ${item.name}`}
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => toggleCheckedScope({ kind: "item", itemId: item.id })}
                                                                                                className={cn(
                                                                                                    "min-w-0 rounded-lg px-2 py-2 text-left transition-colors",
                                                                                                    editorHover.rowSubtle
                                                                                                )}
                                                                                            >
                                                                                                <p className="truncate text-sm font-medium">{item.name}</p>
                                                                                                <p className="text-xs text-foreground/52">{item.occurrences.length} catalogs</p>
                                                                                            </button>
                                                                                        </div>
                                                                                        {itemOpen && (
                                                                                            <div className="ml-4 space-y-1 pb-1 pl-3">
                                                                                                {item.occurrences.map((occurrence) => {
                                                                                                    const catalogChecked = checkedScopeKeys.has(`catalog:${occurrence.comparisonKey}`);
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={occurrence.comparisonKey}
                                                                                                            className={cn(
                                                                                                                "grid w-full grid-cols-[2rem_1rem_minmax(0,1fr)] items-center gap-x-1.5 rounded-lg border border-transparent px-1 py-2 text-left transition-colors",
                                                                                                                editorHover.rowSubtle
                                                                                                            )}
                                                                                                        >
                                                                                                            <span aria-hidden="true" className="block h-7 w-7 justify-self-center" />
                                                                                                            <Checkbox
                                                                                                                className="justify-self-center"
                                                                                                                checked={catalogChecked}
                                                                                                                onCheckedChange={() => toggleCheckedScope({ kind: "catalog", comparisonKey: occurrence.comparisonKey })}
                                                                                                                aria-label={catalogChecked ? `Deselect ${occurrence.exportCatalog.name}` : `Select ${occurrence.exportCatalog.name}`}
                                                                                                            />
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                onClick={() => toggleCheckedScope({ kind: "catalog", comparisonKey: occurrence.comparisonKey })}
                                                                                                                className="min-w-0 px-2 text-left"
                                                                                                            >
                                                                                                                <span className="block min-w-0 truncate text-sm font-medium">
                                                                                                                    {occurrence.exportCatalog.name}
                                                                                                                </span>
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedTargets.length === 0 ? (
                                    <div className={cn(editorSurface.panel, "rounded-xl border-dashed px-4 py-8 text-center text-sm text-foreground/58")}>
                                        {isRootScope
                                            ? "Choose groups, subgroups, or catalogs above to start editing AIOMetadata settings."
                                            : "No AIOMetadata catalogs are available for export settings in this scope."}
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "space-y-5",
                                            selectedSourceSections.length > 1 && "grid grid-cols-1 gap-5 space-y-0 xl:grid-cols-2"
                                        )}
                                    >
                                        {selectedSourceSections.map((section) => (
                                            <div
                                                key={section.source}
                                                className={cn(
                                                    "space-y-4",
                                                    selectedSourceSections.length > 1 && "rounded-xl border border-slate-200/70 p-4 dark:border-white/8"
                                                )}
                                            >
                                                {selectedSourceSections.length > 1 && section.source === "mdblist" ? (
                                                    <p className="text-sm font-semibold tracking-tight text-foreground">
                                                        {SOURCE_LABELS[section.source]}
                                                    </p>
                                                ) : null}
                                                {section.source === "mdblist" ? (
                                                    <MDBListOverrideForm
                                                        override={section.override as AIOMetadataMDBListExportOverride | undefined}
                                                        overridePresence={section.overridePresence as Partial<Record<keyof AIOMetadataMDBListExportOverride, boolean>>}
                                                        currentValues={section.currentValues as Partial<AIOMetadataResolvedMDBListExportFields>}
                                                        onChangeField={(key, value) => handleScopeFieldChange("mdblist", key, value)}
                                                    />
                                                ) : section.source === "trakt" ? (
                                                    <DirectionalOverrideForm
                                                        title={selectedSourceSections.length > 1 ? SOURCE_LABELS[section.source] : undefined}
                                                        sortOptions={TRAKT_SORT_OPTIONS}
                                                        override={section.override as AIOMetadataTraktExportOverride | undefined}
                                                        overridePresence={section.overridePresence}
                                                        currentValues={section.currentValues as Partial<AIOMetadataResolvedTraktExportFields>}
                                                        supportsCacheTTL
                                                        onChangeField={(key, value) => handleScopeFieldChange("trakt", key as keyof AIOMetadataTraktExportOverride, value as AIOMetadataTraktExportOverride[typeof key])}
                                                    />
                                                ) : (
                                                    <DirectionalOverrideForm
                                                        title={selectedSourceSections.length > 1 ? SOURCE_LABELS[section.source] : undefined}
                                                        sortOptions={STREAMING_SORT_OPTIONS}
                                                        override={section.override as AIOMetadataStreamingExportOverride | undefined}
                                                        overridePresence={section.overridePresence}
                                                        currentValues={section.currentValues as Partial<AIOMetadataResolvedStreamingExportFields>}
                                                        supportsCacheTTL={false}
                                                        onChangeField={(key, value) => handleScopeFieldChange("streaming", key as "sort" | "sortDirection", value as AIOMetadataStreamingSort | "asc" | "desc" | undefined)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-border/60 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className={editorAction.secondary}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className={editorAction.primary}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
            <AIOMetadataExportTemplateDialog
                open={isTemplateDialogOpen}
                onOpenChange={setIsTemplateDialogOpen}
                template={DEFAULT_AIOMETADATA_EXPORT_TEMPLATE}
                onApply={handleApplyUMESettings}
            />
            <AlertDialog open={isResetAllConfirmOpen} onOpenChange={setIsResetAllConfirmOpen}>
                <AlertDialogContent className={cn(editorSurface.overlay, "text-popover-foreground")}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset all AIOMetadata settings?</AlertDialogTitle>
                        <AlertDialogDescription className="text-foreground/70">
                            This removes all AIOMetadata export overrides, including changes from Apply UME Sorting.
                            Click Save afterwards to keep the reset.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted border-border text-foreground/70 hover:bg-accent hover:text-accent-foreground">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="border-destructive/40 bg-destructive text-white hover:bg-destructive/92"
                            onClick={handleResetAllOverrides}
                        >
                            Reset All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function AIOMetadataExportSettingsDialog({
    open,
    onOpenChange,
    target,
    inventory,
    overrides,
    useUmeSorting,
    onChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    target: AIOMetadataExportSettingsDialogTarget | null;
    inventory: AIOMetadataExportInventory;
    overrides: AIOMetadataExportOverrideState;
    useUmeSorting: boolean;
    onChange: (nextValue: AIOMetadataExportOverrideState) => void;
}) {
    const sessionKey = useMemo(
        () => JSON.stringify({
            sessionKey: buildDialogSessionKey(open, target, overrides),
            useUmeSorting,
        }),
        [open, overrides, target, useUmeSorting]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open ? (
                <AIOMetadataExportSettingsDialogBody
                    key={sessionKey}
                    target={target}
                    inventory={inventory}
                    initialOverrides={overrides}
                    useUmeSorting={useUmeSorting}
                    onCancel={() => onOpenChange(false)}
                    onSave={(nextValue) => {
                        onChange(nextValue);
                        onOpenChange(false);
                    }}
                />
            ) : null}
        </Dialog>
    );
}

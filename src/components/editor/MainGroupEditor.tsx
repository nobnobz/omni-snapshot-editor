"use client";

import React, { useState, useMemo } from "react";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
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
import { GripVertical, ArrowDownAZ, ArrowUpZA, Edit2, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RenameGroupModal } from "./RenameGroupModal";
import { normalizeMainGroupOrder } from "@/lib/main-group-utils";
import { resolveCatalogName } from "@/lib/utils";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { shallowEqualObject } from "@/lib/equality";

const EMPTY_STRING_ARRAY: string[] = [];
const stringArraysEqual = (a: string[], b: string[]) => (
    a.length === b.length && a.every((item, idx) => item === b[idx])
);

// Individual Sortable Subgroup Component
function SortableSubgroupItem({
    id,
    displayName,
    isEnabled,
    onToggle,
    onRename
}: {
    id: string,
    displayName: string,
    isEnabled: boolean,
    onToggle: (isEnabled: boolean) => void,
    onRename: (id: string, newName: string) => void
}) {
    const {
        smallCatalogList,
        landscapeList,
        smallTopRowList,
        catalogDataMap,
    } = useConfigSelector((state) => ({
        smallCatalogList: state.currentValues.small_catalog_list,
        landscapeList: state.currentValues.landscape_list,
        smallTopRowList: state.currentValues.small_top_row_list,
        catalogDataMap: state.currentValues.catalogs,
    }), shallowEqualObject);
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
        zIndex: isDragging ? 10 : 1,
    };

    const [isEditing, setIsEditing] = useState(false);

    const handleRenameSubmit = (oldName: string, newName: string) => {
        setIsEditing(false);
        onRename(id, newName);
    };

    const isSmall = Array.isArray(smallCatalogList) && smallCatalogList.includes(id);
    const isLandscape = Array.isArray(landscapeList) && landscapeList.includes(id);
    const isSmallTopRow = Array.isArray(smallTopRowList) && smallTopRowList.includes(id);
    const catalogData = (catalogDataMap as Record<string, { showInHome?: boolean; metadata?: { itemCount?: number } }> | undefined)?.[id];
    const showInHome = catalogData?.showInHome;
    const itemCount = catalogData?.metadata?.itemCount;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 ${editorHover.transition}
                ${isDragging ? "opacity-50 border-primary shadow-xl" : `border-border ${editorHover.row}`}
                ${!isEnabled ? "opacity-60 border-dashed border-border/50 bg-card/60" : ""}
            `}
        >
            <button 
                {...attributes} 
                {...listeners} 
                className={`cursor-grab shrink-0 p-2 rounded-md transition-colors ${isEnabled ? editorHover.softAction : "text-foreground pointer-events-none"}`}
                style={{ touchAction: 'none' }} 
                aria-label="Drag handle"
            >
                <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center h-10 sm:h-8">
                            <p className={`text-sm truncate font-bold text-foreground/70`}>{displayName}</p>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col min-w-0 cursor-pointer group/name"
                            onClick={() => setIsEditing(true)}
                            title="Click to rename"
                        >
                            <h4 className={`text-sm font-bold flex items-center gap-1.5 transition-colors truncate ${!isEnabled ? "text-foreground/70 line-through" : "text-foreground group-hover/name:text-primary"}`}>
                                {displayName}
                                {showInHome && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                                <Edit2 className="w-3 h-3 text-primary opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
                            </h4>
                            {displayName !== id && <p className="text-xs text-foreground/70 truncate font-mono mt-0.5">{id}</p>}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 flex-wrap sm:justify-end">
                    
                    {/* Top Row Group */}
                    <div className="flex items-center gap-1">
                        {isSmall && (
                            <Badge className="text-xs h-4 px-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">Small</Badge>
                        )}
                        {showInHome && (
                            <Badge className={`text-xs h-4 px-1 border ${isSmallTopRow ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'}`}>
                                {isSmallTopRow ? 'Top Row (small)' : 'Top Row'}
                            </Badge>
                        )}
                        {itemCount && showInHome && (
                            <Badge variant="outline" className="text-xs h-4 px-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">{itemCount}</Badge>
                        )}
                    </div>

                    {/* Shelf Specifics */}
                    {isLandscape && (
                        <Badge className="text-xs h-4 px-1 bg-primary/10 text-primary dark:text-primary border border-primary/20">Wide</Badge>
                    )}
                </div>
            </div>

            <RenameGroupModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                oldName={id}
                isMainGroup={false}
                onRename={handleRenameSubmit}
            />
            <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary shrink-0"
            />
        </div>
    );
}

// Editor for a single Main Group's subgroups
type MainGroupData = {
    name?: string;
    subgroupNames?: string[];
    [key: string]: unknown;
};

function SingleMainGroupEditor({
    groupId,
    groupData,
    customNames,
    disabledCatalogs,
    onUpdateSubgroups,
    onRenameCatalog,
    onToggleCatalog
}: {
    groupId: string,
    groupData: MainGroupData,
    customNames: Record<string, string>,
    disabledCatalogs: Set<string>,
    onUpdateSubgroups: (groupId: string, newSubgroups: string[]) => void,
    onRenameCatalog: (id: string, newName: string) => void,
    onToggleCatalog: (id: string, isEnabled: boolean) => void
}) {
    const subgroupNames = useMemo(
        () => Array.isArray(groupData.subgroupNames) ? groupData.subgroupNames : EMPTY_STRING_ARRAY,
        [groupData.subgroupNames]
    );

    // We keep a local state for sorting purely for UI reactivity, but sync it to context
    const [items, setItems] = useState(subgroupNames);

    React.useEffect(() => {
        setItems(prev => (stringArraysEqual(prev, subgroupNames) ? prev : subgroupNames));
    }, [subgroupNames]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId !== overId) {
            const oldIndex = items.indexOf(activeId);
            const newIndex = items.indexOf(overId);
            const newArray = arrayMove(items, oldIndex, newIndex);

            setItems(newArray);
            onUpdateSubgroups(groupId, newArray);
        }
    };

    const sortAZ = () => {
        const sorted = [...items].sort();
        setItems(sorted);
        onUpdateSubgroups(groupId, sorted);
    };

    const sortZA = () => {
        const sorted = [...items].sort().reverse();
        setItems(sorted);
        onUpdateSubgroups(groupId, sorted);
    };

    const enableAll = () => {
        items.forEach(id => onToggleCatalog(id, true));
    };

    const disableAll = () => {
        items.forEach(id => onToggleCatalog(id, false));
    };

    return (
        <div className="space-y-4 py-2">
            <div className={`${editorSurface.cardInteractive} overflow-hidden`}>
                {/* Unified Toolbar */}
                <div className={`${editorSurface.toolbar} sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-none border-x-0 border-t-0 p-3`}>
                    <Button variant="outline" size="sm" onClick={sortAZ} className="h-8 text-xs border-border hover:bg-muted/80 text-foreground/70 hover:text-foreground">
                        <ArrowDownAZ className="w-4 h-4 mr-1.5" /> A-Z
                    </Button>
                    <Button variant="outline" size="sm" onClick={sortZA} className="h-8 text-xs border-border hover:bg-muted/80 text-foreground/70 hover:text-foreground">
                        <ArrowUpZA className="w-4 h-4 mr-1.5" /> Z-A
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={enableAll} className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors">Enable All</Button>
                    <Button variant="ghost" size="sm" onClick={disableAll} className="h-8 text-xs text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors">Disable All</Button>
                </div>

                <div className="p-3">
                    <DndContext id={`inner-dnd-${groupId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items} strategy={verticalListSortingStrategy}>
                            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                                {items.map((id) => (
                                    <SortableSubgroupItem
                                        key={id}
                                        id={id}
                                        displayName={resolveCatalogName(id, customNames)} // Prioritize custom mapped name, fallback to catalog metadata or ID itself
                                        isEnabled={!disabledCatalogs.has(id)}
                                        onToggle={(active) => onToggleCatalog(id, active)}
                                        onRename={onRenameCatalog}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}

// Sortable Wrapper for Main Group Accordion Items
function SortableMainGroupItem({
    groupId,
    groupData,
    customNames,
    disabledCatalogs,
    onUpdateSubgroups,
    onRenameCatalog,
    onToggleCatalog
}: {
    groupId: string,
    groupData: MainGroupData,
    customNames: Record<string, string>,
    disabledCatalogs: Set<string>,
    onUpdateSubgroups: (groupId: string, newSubgroups: string[]) => void,
    onRenameCatalog: (id: string, newName: string) => void,
    onToggleCatalog: (id: string, isEnabled: boolean) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: groupId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <AccordionItem 
            ref={setNodeRef}
            style={style}
            value={groupId} 
            className={`${editorSurface.cardInteractive} transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out overflow-hidden group/accordion mb-2
                ${isDragging ? "opacity-50 border-primary shadow-2xl z-50 relative" : ""}
            `}
        >
                <div className="flex items-center">
                    {/* Consistent Drag Handle */}
                    <button 
                        {...attributes} 
                        {...listeners}
                        className={`p-3 cursor-grab active:cursor-grabbing shrink-0 transition-colors ${editorHover.softAction}`}
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    <AccordionTrigger indicator="right-down" className={`flex-1 text-foreground px-4 py-4 transition-colors ${editorHover.rowSubtle}`}>
                        <div className="flex flex-col items-start gap-1 min-w-0">
                            <span className="font-bold text-sm tracking-tight text-foreground group-hover/accordion:text-primary transition-colors uppercase">
                                {groupData.name || "Unnamed Group"}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-foreground/50 font-mono font-normal uppercase tracking-widest leading-none">{(groupData.subgroupNames || []).length} catalogs</span>
                                <div className="w-1 h-1 rounded-full bg-primary/30" />
                                <span className="text-xs text-foreground/40 font-mono font-normal truncate uppercase tracking-widest leading-none">{groupId}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                </div>
                <AccordionContent className="border-t border-slate-200/80 p-4 pt-2 bg-white/18 dark:border-white/8 dark:bg-white/[0.025]">
                    <SingleMainGroupEditor
                        groupId={groupId}
                        groupData={groupData}
                        customNames={customNames}
                        disabledCatalogs={disabledCatalogs}
                        onUpdateSubgroups={onUpdateSubgroups}
                        onRenameCatalog={onRenameCatalog}
                        onToggleCatalog={onToggleCatalog}
                    />
                </AccordionContent>
            </AccordionItem>
    );
}

export function MainGroupEditor() {
    const { currentValues, disabledCatalogs } = useConfigSelector((state) => ({
        currentValues: state.currentValues,
        disabledCatalogs: state.disabledCatalogs,
    }), shallowEqualObject);
    const { updateValue, toggleCatalog, renameCatalogGroup } = useConfigActions();
    
    // Controlled state for accordion to fix Radix UI double-click to close bugs
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    const mainGroupsKey = "main_catalog_groups";
    const mainGroupsValue = currentValues[mainGroupsKey];
    const hasMainGroups = !!mainGroupsValue && typeof mainGroupsValue === "object" && !Array.isArray(mainGroupsValue);
    const mainGroups = useMemo(
        () => (hasMainGroups ? mainGroupsValue : {}) as Record<string, { name?: string; subgroupNames?: string[] }>,
        [hasMainGroups, mainGroupsValue]
    );
    const customNames = (currentValues["custom_catalog_names"] || {}) as Record<string, string>;
    const mainGroupOrderValue = currentValues["main_group_order"];
    const orderedGroups = useMemo(
        () => normalizeMainGroupOrder(mainGroups, mainGroupOrderValue),
        [mainGroups, mainGroupOrderValue]
    );

    const handleUpdateSubgroups = (groupId: string, newSubgroups: string[]) => {
        const newGroupsMap = { ...mainGroups };
        newGroupsMap[groupId] = {
            ...newGroupsMap[groupId],
            subgroupNames: newSubgroups
        };
        updateValue([mainGroupsKey], newGroupsMap);
    };

    const handleRenameCatalog = (id: string, newName: string) => {
        renameCatalogGroup(id, newName);
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId !== overId) {
            const oldIndex = orderedGroups.indexOf(activeId);
            const newIndex = orderedGroups.indexOf(overId);
            const newOrder = arrayMove(orderedGroups, oldIndex, newIndex);
            updateValue(["main_group_order"], newOrder);
        }
    };

    if (!hasMainGroups) {
        return null;
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-foreground/70 mb-6 border-l-2 border-primary/40 pl-4 py-1">
                Manage and organize main catalogs groups. Drag headers to reorder top-level presentation.
            </p>

            <DndContext id="outer-dnd-maingroups" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedGroups} strategy={verticalListSortingStrategy}>
                    <Accordion 
                         type="multiple" 
                         value={openGroups} 
                         onValueChange={setOpenGroups} 
                         className="w-full space-y-0"
                    >
                        {orderedGroups.map((groupId) => (
                            <SortableMainGroupItem 
                                key={groupId}
                                groupId={groupId}
                                groupData={mainGroups[groupId]}
                                customNames={customNames}
                                disabledCatalogs={disabledCatalogs}
                                onUpdateSubgroups={handleUpdateSubgroups}
                                onRenameCatalog={handleRenameCatalog}
                                onToggleCatalog={toggleCatalog}
                            />
                        ))}
                    </Accordion>
                </SortableContext>
            </DndContext>
        </div>
    );
}

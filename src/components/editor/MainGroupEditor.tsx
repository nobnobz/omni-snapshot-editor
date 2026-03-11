"use client";

import React, { useState, useMemo } from "react";
import { useConfig } from "@/context/ConfigContext";
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
import { GripVertical, AlertCircle, ArrowDownAZ, ArrowUpZA, Edit2, RotateCcw, Star, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RenameGroupModal } from "./RenameGroupModal";
import { resolveCatalogName } from "@/lib/utils";

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
    const [editValue, setEditValue] = useState(displayName);

    const handleRenameSubmit = (oldName: string, newName: string) => {
        setIsEditing(false);
        onRename(id, newName);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (editValue.trim() !== "" && editValue !== displayName) {
                onRename(id, editValue.trim());
            } else {
                setEditValue(displayName);
            }
        }
        if (e.key === 'Escape') {
            setEditValue(displayName);
            setIsEditing(false);
        }
    };

    const { currentValues } = useConfig();
    const isSmall = currentValues.small_catalog_list?.includes(id);
    const isLandscape = currentValues.landscape_list?.includes(id);
    const isSmallTopRow = currentValues.small_top_row_list?.includes(id);
    const catalogData = currentValues.catalogs?.[id];
    const showInHome = catalogData?.showInHome;
    const itemCount = catalogData?.metadata?.itemCount;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 transition-colors
                ${isDragging ? "opacity-50 border-blue-500 shadow-xl" : "border-border hover:border-border/80"}
                ${!isEnabled ? "opacity-60 border-dashed border-border/50 bg-card/60" : ""}
            `}
        >
            <button 
                {...attributes} 
                {...listeners} 
                className={`cursor-grab shrink-0 p-2 rounded-md transition-colors ${isEnabled ? "text-foreground/70 hover:text-foreground hover:bg-muted" : "text-foreground pointer-events-none"}`}
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
                            <h4 className={`text-sm font-bold flex items-center gap-1.5 hover:underline underline-offset-4 decoration-blue-500/40 truncate ${!isEnabled ? "text-foreground/70 line-through" : "text-foreground"}`}>
                                {displayName}
                                {showInHome && <Star className="w-3 h-3 text-amber-500 shrink-0" />}
                                <Edit2 className="w-3 h-3 text-blue-400 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
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
                        <Badge className="text-xs h-4 px-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">Wide</Badge>
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
                className="data-[state=checked]:bg-blue-600 shrink-0"
            />
        </div>
    );
}

// Editor for a single Main Group's subgroups
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
    groupData: any,
    customNames: Record<string, string>,
    disabledCatalogs: Set<string>,
    onUpdateSubgroups: (groupId: string, newSubgroups: string[]) => void,
    onRenameCatalog: (id: string, newName: string) => void,
    onToggleCatalog: (id: string, isEnabled: boolean) => void
}) {
    const subgroupNames: string[] = groupData.subgroupNames || [];

    // We keep a local state for sorting purely for UI reactivity, but sync it to context
    const [items, setItems] = useState(subgroupNames);

    React.useEffect(() => {
        setItems(subgroupNames);
    }, [JSON.stringify(subgroupNames)]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
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
            <div className="border border-border rounded-xl bg-card/20 overflow-hidden">
                {/* Unified Toolbar */}
                <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-card/95 backdrop-blur-md p-3 border-b border-border/80 shadow-sm">
                    <Button variant="outline" size="sm" onClick={sortAZ} className="h-8 text-xs border-border hover:bg-muted text-foreground/70 hover:text-foreground transition-all">
                        <ArrowDownAZ className="w-4 h-4 mr-1.5" /> A-Z
                    </Button>
                    <Button variant="outline" size="sm" onClick={sortZA} className="h-8 text-xs border-border hover:bg-muted text-foreground/70 hover:text-foreground transition-all">
                        <ArrowUpZA className="w-4 h-4 mr-1.5" /> Z-A
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={enableAll} className="h-8 text-xs text-blue-400 hover:text-blue-300 transition-colors">Enable All</Button>
                    <Button variant="ghost" size="sm" onClick={disableAll} className="h-8 text-xs text-foreground/60 hover:text-foreground transition-colors">Disable All</Button>
                </div>

                <div className="p-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    groupData: any,
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
        <div ref={setNodeRef} style={style}>
            <AccordionItem 
                value={groupId} 
                className={`border border-border/60 rounded-xl bg-card shadow-sm hover:shadow-md transition-all overflow-hidden group/accordion mb-2
                    ${isDragging ? "opacity-50 border-blue-500 shadow-2xl z-50" : "bg-card/40"}
                `}
            >
                <div className="flex items-center">
                    {/* Consistent Drag Handle */}
                    <button 
                        {...attributes} 
                        {...listeners}
                        className="p-3 text-foreground/40 hover:text-foreground/80 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    <AccordionTrigger className="flex-1 hover:no-underline text-foreground px-4 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col items-start gap-1 min-w-0">
                            <span className="font-bold text-sm tracking-tight text-foreground group-hover/accordion:text-blue-400 transition-colors uppercase">
                                {groupData.name || "Unnamed Group"}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-foreground/50 font-mono font-normal uppercase tracking-widest leading-none">{(groupData.subgroupNames || []).length} catalogs</span>
                                <div className="w-1 h-1 rounded-full bg-blue-500/30" />
                                <span className="text-xs text-foreground/40 font-mono font-normal truncate uppercase tracking-widest leading-none">{groupId}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                </div>
                <AccordionContent className="border-t border-border/40 p-4 pt-2 bg-background/20">
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
        </div>
    );
}

export function MainGroupEditor() {
    const { currentValues, updateValue, disabledCatalogs, toggleCatalog, renameCatalogGroup } = useConfig();

    const mainGroupsKey = "main_catalog_groups";
    const mainGroups = currentValues[mainGroupsKey];

    // Fallback if missing
    if (!mainGroups || typeof mainGroups !== 'object') {
        return null;
    }

    const customNames = currentValues["custom_catalog_names"] || {};
    const mainGroupOrder = currentValues["main_group_order"] || Object.keys(mainGroups);

    // Sync order if new groups were added but not in order yet
    const orderedGroups = useMemo(() => {
        const orderSet = new Set(mainGroupOrder);
        const allKeys = Object.keys(mainGroups);
        const missing = allKeys.filter((k: string) => !orderSet.has(k));
        const filtered = mainGroupOrder.filter((k: string) => mainGroups[k]);
        return [...filtered, ...missing];
    }, [mainGroups, mainGroupOrder]);

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
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = orderedGroups.indexOf(active.id);
            const newIndex = orderedGroups.indexOf(over.id);
            const newOrder = arrayMove(orderedGroups, oldIndex, newIndex);
            updateValue(["main_group_order"], newOrder);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-foreground/70 mb-6 border-l-2 border-blue-500/40 pl-4 py-1">
                Manage and organize main catalogs groups. Drag headers to reorder top-level presentation.
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedGroups} strategy={verticalListSortingStrategy}>
                    <Accordion type="multiple" className="w-full space-y-0">
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

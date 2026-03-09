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
import { GripVertical, AlertCircle, ArrowDownAZ, ArrowUpZA, Edit2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 p-3 bg-card border border-border rounded-lg mb-2 ${isDragging ? "opacity-50 border-blue-500" : ""}`}
        >
            <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-muted-foreground" aria-label="Drag handle">
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="flex items-center h-8">
                        {/* We render nothing here natively since Modal takes over, but to keep height: */}
                        <p className={`text-sm truncate font-medium text-muted-foreground`}>{displayName}</p>
                    </div>
                ) : (
                    <div
                        className="flex-1 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded hover:bg-muted/80 transition-colors border border-transparent hover:border-border"
                        onClick={() => setIsEditing(true)}
                        title="Click to rename"
                    >
                        <p className={`text-sm truncate font-medium ${!isEnabled ? "text-muted-foreground line-through" : "text-foreground"}`}>{displayName}</p>
                        {displayName !== id && <p className="text-[10px] text-muted-foreground truncate font-mono">{id}</p>}
                    </div>
                )}
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
                className="data-[state=checked]:bg-blue-600"
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
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-card/50 p-2 rounded-lg border border-border">
                <Button variant="outline" size="sm" onClick={sortAZ} className="h-8 text-xs border-border hover:bg-muted">
                    <ArrowDownAZ className="w-4 h-4 mr-2" /> A-Z
                </Button>
                <Button variant="outline" size="sm" onClick={sortZA} className="h-8 text-xs border-border hover:bg-muted">
                    <ArrowUpZA className="w-4 h-4 mr-2" /> Z-A
                </Button>
                <div className="w-px h-5 bg-muted mx-2" />
                <Button variant="ghost" size="sm" onClick={enableAll} className="h-8 text-xs text-blue-400 hover:text-blue-300">Enable All</Button>
                <Button variant="ghost" size="sm" onClick={disableAll} className="h-8 text-xs text-muted-foreground hover:text-muted-foreground">Disable All</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

    const handleUpdateSubgroups = (groupId: string, newSubgroups: string[]) => {
        const newGroupsMap = { ...mainGroups };
        newGroupsMap[groupId] = {
            ...newGroupsMap[groupId],
            subgroupNames: newSubgroups
        };
        updateValue([mainGroupsKey], newGroupsMap);
    };

    const handleRenameCatalog = (id: string, newName: string) => {
        // These are actually subgroup names (Groups), so we apply the atomic group rename here
        renameCatalogGroup(id, newName);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
                Manage catalogs embedded within specific Main Groups.
            </p>

            <Accordion type="multiple" className="w-full space-y-2">
                {Object.entries(mainGroups).map(([groupId, groupData]: [string, any]) => (
                    <AccordionItem key={groupId} value={groupId} className="border border-border rounded-md bg-background px-2">
                        <AccordionTrigger className="hover:no-underline text-foreground">
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-semibold">{groupData.name || "Unnamed Group"}</span>
                                <span className="text-xs text-muted-foreground font-mono font-normal">{(groupData.subgroupNames || []).length} catalogs</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="border-t border-border pt-4">
                            <SingleMainGroupEditor
                                groupId={groupId}
                                groupData={groupData}
                                customNames={customNames}
                                disabledCatalogs={disabledCatalogs}
                                onUpdateSubgroups={handleUpdateSubgroups}
                                onRenameCatalog={handleRenameCatalog}
                                onToggleCatalog={toggleCatalog}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

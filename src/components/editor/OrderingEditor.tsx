"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
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
import { GripVertical, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RenameGroupModal } from "./RenameGroupModal";
import { cn, resolveCatalogName } from "@/lib/utils";
import { editorHover, editorSurface } from "@/components/editor/ui/style-contract";

const stringArraysEqual = (a: string[], b: string[]) => (
    a.length === b.length && a.every((item, idx) => item === b[idx])
);

function SortableItem({
    id,
    displayName,
    isEnabled,
    isGroup,
    isMainGroup,
    onToggle,
    onRename
}: {
    id: string,
    displayName: string,
    isEnabled: boolean,
    isGroup: boolean,
    isMainGroup: boolean,
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

    const submitInlineRename = () => {
        setIsEditing(false);
        if (editValue.trim() !== "" && editValue !== displayName) {
            onRename(id, editValue.trim());
        } else {
            setEditValue(displayName);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            submitInlineRename();
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
            className={`group flex items-center gap-3 p-3 rounded-lg mb-2 ${editorHover.transition} ${editorSurface.cardInteractive} ${isDragging ? "opacity-50 border-primary" : ""}`}
        >
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab select-none ${editorHover.softAction}`}
                style={{ touchAction: 'none' }}
                aria-label="Drag handle"
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
                {isEditing && !isGroup ? (
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={submitInlineRename}
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm bg-background border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                ) : (
                    <div
                        className="flex-1 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded hover:bg-muted/80 transition-colors border border-transparent hover:border-border/80"
                        onClick={() => setIsEditing(true)}
                        title="Click to rename"
                    >
                        <p className={`text-base truncate font-medium ${!isEnabled ? "text-foreground/70 line-through" : "text-foreground"}`}>{displayName}</p>
                        {displayName === id && <p className="text-xs text-foreground/70 truncate font-mono">{id}</p>}
                    </div>
                )}
            </div>

            {isGroup && (
                <RenameGroupModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    oldName={id}
                    isMainGroup={isMainGroup}
                    onRename={handleRenameSubmit}
                />
            )}
            <Switch
                checked={isEnabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    );
}

function SortableList({
    itemsList,
    customNames,
    disabledCatalogs,
    isGroup,
    isMainGroup,
    onUpdateOrder,
    onRenameCatalog,
    onToggleCatalog
}: {
    itemsList: string[],
    customNames: Record<string, string>,
    disabledCatalogs: Set<string>,
    isGroup: boolean,
    isMainGroup: boolean,
    onUpdateOrder: (newOrder: string[]) => void,
    onRenameCatalog: (id: string, newName: string) => void,
    onToggleCatalog: (id: string, isEnabled: boolean) => void
}) {
    const [items, setItems] = useState(itemsList);
    const [activeId, setActiveId] = useState<string | null>(null);

    React.useEffect(() => {
        setItems(prev => (stringArraysEqual(prev, itemsList) ? prev : itemsList));
    }, [itemsList]);

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (over && active.id !== over.id) {
            const activeId = String(active.id);
            const overId = String(over.id);
            const oldIndex = items.indexOf(activeId);
            const newIndex = items.indexOf(overId);
            const newArray = arrayMove(items, oldIndex, newIndex);

            setItems(newArray);
            onUpdateOrder(newArray);
        }
    };

    const sortAZ = () => {
        const sorted = [...items].sort();
        setItems(sorted);
        onUpdateOrder(sorted);
    };

    const sortZA = () => {
        const sorted = [...items].sort().reverse();
        setItems(sorted);
        onUpdateOrder(sorted);
    };

    const enableAll = () => {
        items.forEach(id => onToggleCatalog(id, true));
    };

    const disableAll = () => {
        items.forEach(id => onToggleCatalog(id, false));
    };

    return (
        <div className="space-y-4 py-2">
            <div className={cn(editorSurface.toolbar, "flex flex-wrap items-center gap-2 mb-4 p-2 rounded-lg")}>
                <Button variant="outline" size="sm" onClick={sortAZ} className="h-8 text-xs border-border hover:bg-muted/80">
                    <ArrowDownAZ className="w-4 h-4 mr-2" /> A-Z
                </Button>
                <Button variant="outline" size="sm" onClick={sortZA} className="h-8 text-xs border-border hover:bg-muted/80">
                    <ArrowUpZA className="w-4 h-4 mr-2" /> Z-A
                </Button>
                <div className="w-px h-5 bg-muted mx-2" />
                <Button variant="ghost" size="sm" onClick={enableAll} className="h-8 text-sm text-primary hover:text-primary hover:bg-primary/10">Enable All</Button>
                <Button variant="ghost" size="sm" onClick={disableAll} className="h-8 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/60">Disable All</Button>
            </div>

            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {items.map((id) => (
                            <SortableItem
                                key={id}
                                id={id}
                                displayName={resolveCatalogName(id, customNames)}
                                isEnabled={!disabledCatalogs.has(id)}
                                isGroup={isGroup}
                                isMainGroup={isMainGroup}
                                onToggle={(active) => onToggleCatalog(id, active)}
                                onRename={onRenameCatalog}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.4',
                            },
                        },
                    }),
                }}>
                    {activeId ? (
                        <div className="flex items-center gap-3 p-3 bg-muted border border-primary rounded-lg shadow-2xl scale-[1.02] opacity-90">
                            <GripVertical className="h-4 w-4 text-primary" />
                            <div className="flex-1 min-w-0">
                                <p className="text-base truncate font-medium text-foreground">
                                    {resolveCatalogName(activeId, customNames)}
                                </p>
                                {resolveCatalogName(activeId, customNames) === activeId && <p className="text-xs text-foreground/70 truncate font-mono">{activeId}</p>}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

export function OrderingEditor({ configKey }: { configKey: string }) {
    const { currentValues, updateValue, disabledCatalogs, toggleCatalog, renameCatalogGroup, renameMainCatalogGroup } = useConfig();

    const data = currentValues[configKey];
    if (!data) return null;

    const customNames = currentValues["custom_catalog_names"] || {};
    const mainGroups = currentValues["main_catalog_groups"] || {};

    const handleRenameCatalog = (id: string, newName: string) => {
        if (configKey === "catalog_group_order" || configKey === "subgroup_order") {
            renameCatalogGroup(id, newName);
        } else if (configKey === "main_group_order") {
            renameMainCatalogGroup(id, newName);
        } else {
            // It's a normal catalog id
            const newNamesMap = { ...customNames, [id]: newName };
            updateValue(["custom_catalog_names"], newNamesMap);
        }
    };

    // Helper to get display name with an additional fallback for main group IDs
    const getDisplayNameMap = () => {
        const nameMap: Record<string, string> = {};

        // For groups, we populate manually
        if (configKey === "main_group_order" || configKey === "subgroup_order" || configKey === "catalog_group_order") {
            // 1. Start with custom names (for groups these might be set manually)
            Object.assign(nameMap, customNames);

            // 2. For main groups, fallback to main_catalog_groups[id].name
            Object.entries(mainGroups as Record<string, unknown>).forEach(([id, groupObj]) => {
                const groupName = (
                    groupObj &&
                    typeof groupObj === "object" &&
                    "name" in groupObj &&
                    typeof (groupObj as { name?: unknown }).name === "string"
                ) ? (groupObj as { name: string }).name : undefined;

                if (!nameMap[id] && groupName) {
                    nameMap[id] = groupName;
                }
            });
        }

        // For catalogs, SortableList should ideally call resolveCatalogName directly
        // But since SortableList uses customNames[id], we can populate it, 
        // OR update SortableList.

        return nameMap;
    };

    const displayNames = getDisplayNameMap();

    const isGroup = configKey === "catalog_group_order" || configKey === "subgroup_order" || configKey === "main_group_order";
    const isMainGroup = configKey === "main_group_order";

    // 1. If it's a direct array of strings
    if (Array.isArray(data)) {
        return (
            <div className={cn(editorSurface.card, "p-5 mb-6")}>
                <h4 className="text-xl font-bold tracking-tight text-foreground mb-4">{configKey === 'catalog_ordering' ? 'Global Catalog Order' : configKey}</h4>
                <SortableList
                    itemsList={data}
                    customNames={displayNames}
                    disabledCatalogs={disabledCatalogs}
                    isGroup={isGroup}
                    isMainGroup={isMainGroup}
                    onUpdateOrder={(newOrder) => updateValue([configKey], newOrder)}
                    onRenameCatalog={handleRenameCatalog}
                    onToggleCatalog={toggleCatalog}
                />
            </div>
        );
    }

    // 2. If it's a Record<string, string[]> (like subgroup_order)
    if (typeof data === "object") {
        return (
            <div className={cn(editorSurface.card, "p-5 mb-6")}>
                <h4 className="text-xl font-bold tracking-tight text-foreground mb-4">{configKey}</h4>
                <Accordion type="multiple" className="w-full space-y-2 mt-4">
                    {Object.entries(data as Record<string, unknown>).map(([groupId, itemsList]) => {
                        if (!Array.isArray(itemsList)) return null;
                        const normalizedItems = itemsList.filter((item): item is string => typeof item === "string");
                        const groupName = displayNames[groupId] || groupId;

                        return (
                            <AccordionItem key={groupId} value={groupId} className={cn(editorSurface.inset, "rounded-md px-2")}>
                                <AccordionTrigger className=" text-foreground">
                                    <div className="flex flex-col items-start gap-1 py-1">
                                        <span className="font-semibold text-base">{groupName}</span>
                                        <span className="text-xs text-foreground/70 font-mono font-normal">{itemsList.length} items</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t border-border pt-4">
                                    <SortableList
                                        itemsList={normalizedItems}
                                        customNames={displayNames}
                                        disabledCatalogs={disabledCatalogs}
                                        isGroup={isGroup}
                                        isMainGroup={isMainGroup}
                                        onUpdateOrder={(newOrder) => {
                                            const updatedObj = { ...(data as Record<string, unknown>), [groupId]: newOrder };
                                            updateValue([configKey], updatedObj);
                                        }}
                                        onRenameCatalog={handleRenameCatalog}
                                        onToggleCatalog={toggleCatalog}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        );
    }

    return null;
}

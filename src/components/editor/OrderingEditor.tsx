"use client";

import React, { useState } from "react";
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
import { GripVertical, AlertCircle, ArrowDownAZ, ArrowUpZA, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RenameGroupModal } from "./RenameGroupModal";
import { formatDisplayName, resolveCatalogName } from "@/lib/utils";

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
            className={`group flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg mb-2 ${isDragging ? "opacity-50 border-blue-500" : ""}`}
        >
            <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-neutral-500" aria-label="Drag handle">
                <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
                {isEditing && !isGroup ? (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleKeyDown({ key: 'Enter' } as any)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="h-8 text-sm bg-neutral-950 border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                    />
                ) : (
                    <div
                        className="flex-1 min-w-0 cursor-pointer p-1.5 -ml-1.5 rounded hover:bg-neutral-800/80 transition-colors border border-transparent hover:border-neutral-700"
                        onClick={() => setIsEditing(true)}
                        title="Click to rename"
                    >
                        <p className={`text-sm truncate font-medium ${!isEnabled ? "text-neutral-500 line-through" : "text-neutral-200"}`}>{displayName}</p>
                        {displayName === id && <p className="text-[10px] text-neutral-500 truncate font-mono">{id}</p>}
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
                className="data-[state=checked]:bg-blue-600"
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

    React.useEffect(() => {
        setItems(itemsList);
    }, [JSON.stringify(itemsList)]);

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
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                <Button variant="outline" size="sm" onClick={sortAZ} className="h-8 text-xs border-neutral-700 hover:bg-neutral-800">
                    <ArrowDownAZ className="w-4 h-4 mr-2" /> A-Z
                </Button>
                <Button variant="outline" size="sm" onClick={sortZA} className="h-8 text-xs border-neutral-700 hover:bg-neutral-800">
                    <ArrowUpZA className="w-4 h-4 mr-2" /> Z-A
                </Button>
                <div className="w-px h-5 bg-neutral-800 mx-2" />
                <Button variant="ghost" size="sm" onClick={enableAll} className="h-8 text-xs text-blue-400 hover:text-blue-300">Enable All</Button>
                <Button variant="ghost" size="sm" onClick={disableAll} className="h-8 text-xs text-neutral-500 hover:text-neutral-400">Disable All</Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
            Object.entries(mainGroups).forEach(([id, groupObj]: [string, any]) => {
                if (!nameMap[id] && groupObj && groupObj.name) {
                    nameMap[id] = groupObj.name;
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
            <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-950/50 mb-6">
                <h4 className="text-lg font-medium text-neutral-300 mb-2">{configKey}</h4>
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
            <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-950/50 mb-6">
                <h4 className="text-lg font-medium text-neutral-300 mb-2">{configKey}</h4>
                <Accordion type="multiple" className="w-full space-y-2 mt-4">
                    {Object.entries(data).map(([groupId, itemsList]: [string, any]) => {
                        if (!Array.isArray(itemsList)) return null;
                        const groupName = displayNames[groupId] || groupId;

                        return (
                            <AccordionItem key={groupId} value={groupId} className="border border-neutral-800 rounded-md bg-neutral-950 px-2">
                                <AccordionTrigger className="hover:no-underline text-neutral-200">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-semibold">{groupName}</span>
                                        <span className="text-xs text-neutral-500 font-mono font-normal">{itemsList.length} items</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t border-neutral-800 pt-4">
                                    <SortableList
                                        itemsList={itemsList}
                                        customNames={displayNames}
                                        disabledCatalogs={disabledCatalogs}
                                        isGroup={isGroup}
                                        isMainGroup={isMainGroup}
                                        onUpdateOrder={(newOrder) => {
                                            const updatedObj = { ...data, [groupId]: newOrder };
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

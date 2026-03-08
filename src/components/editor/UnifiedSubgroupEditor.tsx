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
import { formatDisplayName, resolveCatalogName } from "@/lib/utils";

import { Trash2, Plus, FolderPlus, UploadCloud } from "lucide-react";

// ----------------------------------------------------------------------
// 1. Sortable Catalog Node (Inside a Subgroup)
// ----------------------------------------------------------------------
function SortableCatalogNode({ id, onRemove }: { id: string, onRemove?: () => void }) {
    const { currentValues, disabledCatalogs, toggleCatalog, updateValue } = useConfig();
    const isEnabled = !disabledCatalogs.has(id);
    const customNames = currentValues["custom_catalog_names"] || {};
    const displayName = resolveCatalogName(id, customNames);

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
            className={`flex items-center gap-3 p-2 bg-neutral-900 border border-neutral-800 rounded-md mb-1.5 group/cat ${isDragging ? "opacity-50 border-blue-500 z-50 shadow-xl" : ""}`}
        >
            <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-neutral-500 shrink-0">
                <GripVertical className="h-3.5 w-3.5" />
            </button>

            <div className="flex-1 min-w-0 pr-2">
                <p className={`text-[11px] truncate font-medium flex items-center gap-2 ${!isEnabled ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                    {displayName}
                    {displayName !== id && <span className="text-[9px] text-neutral-600 font-mono no-underline ml-auto opacity-0 group-hover/cat:opacity-100 transition-opacity whitespace-nowrap">{id}</span>}
                </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="h-6 w-6 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
                <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => toggleCatalog(id, checked)}
                    className="scale-[0.6] data-[state=checked]:bg-blue-600"
                />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. Sortable Subgroup Node containing Catalogs & URL
// ----------------------------------------------------------------------
function SortableSubgroupNode({ subgroupName, parentUUID, onUnassign }: { subgroupName: string, parentUUID: string, onUnassign?: (name: string, parentId: string) => void }) {
    const { originalConfig, currentValues, updateValue, renameCatalogGroup, removeCatalogGroup, unassignCatalogGroup } = useConfig();

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
    const catalogs = currentValues.catalog_groups?.[subgroupName] || [];
    const imageUrl = currentValues.catalog_group_image_urls?.[subgroupName] || "";

    const [subgroupCatalogs, setSubgroupCatalogs] = useState<string[]>(catalogs);
    const [urlInput, setUrlInput] = useState(imageUrl);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const parentName = currentValues.main_catalog_groups?.[parentUUID]?.name || "";
    const isLandscape = ["discover", "streaming services", "decades", "collection", "collections"].includes(parentName.toLowerCase());

    React.useEffect(() => {
        setSubgroupCatalogs(catalogs);
        setUrlInput(imageUrl);
    }, [JSON.stringify(catalogs), imageUrl]);

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

    return (
        <div ref={setNodeRef} style={style} className={`border border-neutral-800 rounded-lg overflow-hidden mb-4 bg-neutral-950 ${isDragging ? "opacity-50 border-blue-500" : ""}`}>
            {/* Header: Drag Handle + Subgroup Name */}
            <div className={`flex items-center gap-3 p-3 bg-neutral-900 border-neutral-800 ${isExpanded ? "border-b" : ""}`}>
                <button {...attributes} {...listeners} className="cursor-grab hover:text-white text-neutral-500">
                    <GripVertical className="h-5 w-5" />
                </button>
                <div
                    className="flex-1 font-medium text-sm text-neutral-200 cursor-pointer flex items-center select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4 mr-2 text-neutral-500" /> : <ChevronRight className="w-4 h-4 mr-2 text-neutral-500" />}
                    {formatDisplayName(subgroupName)}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsRenaming(true)} className="h-7 text-xs border-neutral-700">
                    Rename
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                    unassignCatalogGroup(subgroupName);
                    if (onUnassign) onUnassign(subgroupName, parentUUID);
                }} className="h-7 text-xs text-amber-500 hover:text-amber-400 hover:bg-neutral-800">
                    Unassign
                </Button>
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
                <div className="p-4 space-y-4">
                    {/* Image URL Input */}
                    <div className="flex items-center gap-3 bg-neutral-900/50 p-2 rounded-md border border-neutral-800">
                        {urlInput && urlInput.startsWith("http") ? (
                            <div className={`${isLandscape ? "h-8 w-14" : "h-14 w-10"} rounded-md shrink-0 overflow-hidden bg-neutral-900 border border-neutral-700 flex items-center justify-center`}>
                                <img
                                    src={urlInput}
                                    alt="Thumb"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                    }}
                                />
                            </div>
                        ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                        <Input
                            placeholder="https://... (e.g. postimg.cc)"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            onBlur={handleUrlBlur}
                            className="h-8 text-xs bg-neutral-950 border-neutral-700 flex-1"
                        />
                    </div>

                    {/* Inner Sortable Catalogs */}
                    <div>
                        <h5 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Catalogs</h5>
                        {subgroupCatalogs.length === 0 ? (
                            <p className="text-xs text-neutral-600 italic">No catalogs in this subgroup.</p>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatalogDragEnd}>
                                <SortableContext items={subgroupCatalogs} strategy={verticalListSortingStrategy}>
                                    {subgroupCatalogs.map(catId => (
                                        <SortableCatalogNode key={catId} id={catId} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. Main Group View (Outer)
// ----------------------------------------------------------------------
function MainGroupNode({ uuid, name, subgroupNames, onUnassignSubgroup }: { uuid: string, name: string, subgroupNames: string[], onUnassignSubgroup?: (name: string, parentId: string) => void }) {
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
        <div ref={setNodeRef} style={style} className="relative group">
            <AccordionItem value={uuid} className={`border-neutral-800 bg-neutral-900 rounded-lg overflow-hidden mb-4 border ${isDragging ? "opacity-50 border-blue-500" : ""}`}>
                <div className="flex items-center bg-neutral-900 hover:bg-neutral-800/50">
                    {/* Drag Handle for Main Group */}
                    <button {...attributes} {...listeners} className="px-3 cursor-grab hover:text-white text-neutral-500 flex-shrink-0 focus:outline-none">
                        <GripVertical className="h-5 w-5" />
                    </button>
                    {/* Accordion Trigger expanding remaining space */}
                    <AccordionTrigger className="pr-4 py-3 flex-1 flex items-center justify-between hover:no-underline -ml-2 [&>svg]:hidden group/trigger">
                        <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-neutral-500 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
                            <span className="font-semibold text-neutral-200">{formatDisplayName(name)}</span>
                        </div>
                    </AccordionTrigger>
                </div>
                <AccordionContent className="p-4 pt-2 border-t border-neutral-800 bg-neutral-950">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-neutral-900/30 p-2 rounded border border-neutral-800/50">
                        <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="sm" onClick={toggleSort} className="h-7 px-2 md:px-3 text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-800 shrink-0">
                                {sortDirection === 'asc' ? <ArrowDownAZ className="w-3.5 h-3.5 md:mr-1" /> : <ArrowUpZA className="w-3.5 h-3.5 md:mr-1" />}
                                <span className="hidden md:inline">{sortDirection === 'asc' ? 'A-Z' : 'Z-A'}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={restoreOrder} className="h-7 px-2 md:px-3 text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-800 shrink-0">
                                <RotateCcw className="w-3.5 h-3.5 md:mr-1" />
                                <span className="hidden md:inline">Restore</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 md:px-3 text-[10px] text-neutral-400 hover:text-white hover:bg-neutral-800 shrink-0">
                                        <Layout className="w-3.5 h-3.5 md:mr-1" />
                                        <span className="hidden md:inline">Poster</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-200 min-w-[140px]">
                                    <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 font-bold">Poster Type</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Poster")}
                                        className={`text-xs ${posterType === "Poster" ? "bg-blue-500/20 text-blue-400" : ""}`}
                                    >
                                        Poster {posterType === "Poster" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Landscape")}
                                        className={`text-xs ${posterType === "Landscape" ? "bg-blue-500/20 text-blue-400" : ""}`}
                                    >
                                        Landscape {posterType === "Landscape" && "✓"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => updateValue(["main_catalog_groups", uuid, "posterType"], "Square")}
                                        className={`text-xs ${posterType === "Square" ? "bg-blue-500/20 text-blue-400" : ""}`}
                                    >
                                        Square {posterType === "Square" && "✓"}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-neutral-800" />

                                    <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 font-bold">Poster Size</DropdownMenuLabel>
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
                            <div className="w-px h-4 bg-neutral-800 mx-1" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsRenaming(true)}
                                className="h-7 text-[10px] uppercase tracking-wider font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-700"
                            >
                                Rename
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-400 hover:bg-neutral-800"
                                    >
                                        Disable
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Disable Main Group?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-neutral-400">
                                            This will hide the group <span className="text-white font-bold">"{formatDisplayName(name)}"</span> and all its subgroups. You can restore them anytime from the Recycle Bin at the bottom.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => removeMainCatalogGroup(uuid)}
                                            className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                        >
                                            Disable Group
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubgroupDragEnd}>
                        <SortableContext items={subgroups} strategy={verticalListSortingStrategy}>
                            {subgroups.map(sg => (
                                <SortableSubgroupNode key={sg} subgroupName={sg} parentUUID={uuid} onUnassign={onUnassignSubgroup} />
                            ))}
                        </SortableContext>
                    </DndContext>
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
    catalogs,
    onRestore,
    restoreParentName
}: {
    groupName: string,
    catalogs: string[],
    onRestore?: () => void,
    restoreParentName?: string
}) {
    const { updateValue, currentValues, assignCatalogGroup, removeCatalogGroup } = useConfig();
    const mainCatalogGroups = currentValues["main_catalog_groups"] || {};
    const mainGroupOrder = currentValues["main_group_order"] || [];
    const [isExpanded, setIsExpanded] = useState(false);
    const [newCatalogId, setNewCatalogId] = useState("");

    const handleAddCatalog = () => {
        if (!newCatalogId.trim()) return;
        const updated = [...catalogs, newCatalogId.trim()];
        const catalogGroups = { ...currentValues.catalog_groups, [groupName]: updated };
        updateValue(["catalog_groups"], catalogGroups);
        setNewCatalogId("");
    };

    const handleRemoveCatalog = (catalogId: string) => {
        const updated = catalogs.filter(id => id !== catalogId);
        const catalogGroups = { ...currentValues.catalog_groups, [groupName]: updated };
        updateValue(["catalog_groups"], catalogGroups);
    };

    const handleReorderCatalogs = (newOrder: string[]) => {
        const catalogGroups = { ...currentValues.catalog_groups, [groupName]: newOrder };
        updateValue(["catalog_groups"], catalogGroups);
    };

    const catalogSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleInternalDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = catalogs.indexOf(active.id as string);
            const newIndex = catalogs.indexOf(over.id as string);
            handleReorderCatalogs(arrayMove(catalogs, oldIndex, newIndex));
        }
    };

    return (
        <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden transition-all hover:border-neutral-700 w-full mb-3">
            <div className="flex items-center justify-between p-3 gap-4">
                {/* Left: Name */}
                <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-neutral-200 text-sm truncate block" title={formatDisplayName(groupName)}>
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
                                className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300 flex items-center gap-1"
                            >
                                Assign To... <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-200 min-w-[200px]">
                            {onRestore && restoreParentName && (
                                <>
                                    <DropdownMenuItem
                                        onClick={onRestore}
                                        className="text-xs focus:bg-amber-500/20 focus:text-amber-400 cursor-pointer text-amber-500 font-semibold"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                        Restore to {formatDisplayName(restoreParentName)}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-neutral-800" />
                                </>
                            )}
                            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 font-bold">Select Main Group</DropdownMenuLabel>
                            {mainGroupOrder.length === 0 ? (
                                <DropdownMenuItem disabled className="text-xs text-neutral-600">No Main Groups</DropdownMenuItem>
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
                        className={`h-7 px-2 text-[10px] ${isExpanded ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <Layout className="w-3.5 h-3.5 md:mr-1" />
                        <span className="hidden md:inline">Edit Catalogs</span>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subgroup?</AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400">
                                    This will completely delete <span className="text-white font-bold">"{groupName}"</span> from the configuration. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">Cancel</AlertDialogCancel>
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
                <div className="p-4 border-t border-neutral-800 bg-neutral-950">
                    <div className="space-y-1 mb-4">
                        <DndContext sensors={catalogSensors} collisionDetection={closestCenter} onDragEnd={handleInternalDragEnd}>
                            <SortableContext items={catalogs} strategy={verticalListSortingStrategy}>
                                {catalogs.map(catId => (
                                    <SortableCatalogNode
                                        key={catId}
                                        id={catId}
                                        onRemove={() => handleRemoveCatalog(catId)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
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
    const mainGroupOrderFromConfig = currentValues["main_group_order"] || [];

    // Local state for main group ordering
    const [mainGroupOrder, setMainGroupOrder] = useState<string[]>(mainGroupOrderFromConfig);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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


    if (mainGroupOrder.length === 0 && unassignedGroups.length === 0) {
        return <div className="p-4 text-sm text-neutral-400 italic">No Groups or Subgroups found in the configuration.</div>;
    }

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
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shadow-sm"
                    >
                        <FolderPlus className="w-5 h-5 mr-2" />
                        Add to Group
                    </Button>
                    <Button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 shadow-sm"
                    >
                        <UploadCloud className="w-5 h-5 mr-2" />
                        Update from Template
                    </Button>
                </div>
            </div>


            <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <AddToGroupModal isOpen={isAddToGroupModalOpen} onClose={() => setIsAddToGroupModalOpen(false)} />
            <ImportSetupModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMainDragEnd}>
                <SortableContext items={mainGroupOrder} strategy={verticalListSortingStrategy}>
                    <Accordion type="multiple" className="w-full space-y-4">
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
                                />
                            );
                        })}
                    </Accordion>
                </SortableContext>
            </DndContext>

            {unassignedGroups.length > 0 && (
                <div className="mt-12 border-t border-neutral-800 pt-8 pb-4">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-amber-500">Unassigned Subgroups</h3>
                        <p className="text-sm text-neutral-500">Subgroups that are defined but not yet linked to any main group.</p>
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

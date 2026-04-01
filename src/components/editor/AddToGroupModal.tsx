import React, { useMemo, useState } from 'react';
import { useConfigActions, useConfigSelector } from '../../context/ConfigContext';
import { cn, formatDisplayName } from '@/lib/utils';
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Checkbox } from "../ui/checkbox";
import { Search } from 'lucide-react';
import { editorAction, editorLayout, editorSurface } from "./ui/style-contract";
import { shallowEqualObject } from "@/lib/equality";

export function AddToGroupModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const {
        catalogGroups: rawCatalogGroups,
        catalogGroupOrder,
        mainCatalogGroups,
        mainGroupOrder,
        subgroupOrder,
    } = useConfigSelector((state) => ({
        catalogGroups: state.currentValues.catalog_groups || {},
        catalogGroupOrder: state.currentValues.catalog_group_order,
        mainCatalogGroups: state.currentValues.main_catalog_groups || {},
        mainGroupOrder: state.currentValues.main_group_order,
        subgroupOrder: state.currentValues.subgroup_order || {},
    }), shallowEqualObject);
    const { assignCatalogGroup, unassignCatalogGroup } = useConfigActions();

    // State
    const [targetMainGroupUuid, setTargetMainGroupUuid] = useState("");
    const [selectedSubgroups, setSelectedSubgroups] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Lookups
    const catalogGroups = useMemo(
        () => rawCatalogGroups as Record<string, unknown>,
        [rawCatalogGroups]
    );
    const rawOrder: string[] = useMemo(
        () => Array.isArray(catalogGroupOrder)
            ? (catalogGroupOrder as string[])
            : Object.keys(catalogGroups),
        [catalogGroupOrder, catalogGroups]
    );
    const isPlaceholderSubgroup = (name: string) => {
        const normalized = name.trim();
        const hasAlertMarker = normalized.includes("❗️") || normalized.includes("❗");
        const hasBracketLabel = /\[.+\]/.test(normalized);
        return hasAlertMarker && hasBracketLabel;
    };
    const allSubgroupNames: string[] = rawOrder.filter(
        (name: string) => catalogGroups[name] !== undefined && !isPlaceholderSubgroup(name)
    );

    const typedMainCatalogGroups = useMemo(
        () => mainCatalogGroups as Record<string, { name?: string }>,
        [mainCatalogGroups]
    );
    const typedMainGroupOrder = useMemo(
        () => Array.isArray(mainGroupOrder) ? (mainGroupOrder as string[]) : [],
        [mainGroupOrder]
    );
    const typedSubgroupOrder = useMemo(
        () => subgroupOrder as Record<string, string[]>,
        [subgroupOrder]
    );
    const visibleSelectedCount = useMemo(
        () => Array.from(selectedSubgroups).filter((name) => allSubgroupNames.includes(name)).length,
        [allSubgroupNames, selectedSubgroups]
    );

    // Preselect first main group if available and not yet set
    React.useEffect(() => {
        if (isOpen && !targetMainGroupUuid && typedMainGroupOrder.length > 0) {
            const firstGroup = typedMainGroupOrder[0];
            setTargetMainGroupUuid(firstGroup);
        }
    }, [isOpen, typedMainGroupOrder, targetMainGroupUuid]);

    // Update selected subgroups whenever target main group changes
    React.useEffect(() => {
        if (isOpen && targetMainGroupUuid) {
            const existingSubgroups = typedSubgroupOrder[targetMainGroupUuid] || [];
            setSelectedSubgroups(new Set(existingSubgroups));
        }
    }, [isOpen, targetMainGroupUuid, typedSubgroupOrder]);

    const resetState = () => {
        setSelectedSubgroups(new Set());
        setSearchQuery("");
        setTargetMainGroupUuid(typedMainGroupOrder.length > 0 ? typedMainGroupOrder[0] : "");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleAssign = () => {
        if (!targetMainGroupUuid) return;

        // 1. Get the currently assigned subgroups for this main group BEFORE our changes
        const existingSubgroups = new Set<string>(typedSubgroupOrder[targetMainGroupUuid] || []);

        // 2. Add newly selected subgroups
        for (const sg of selectedSubgroups) {
            if (!existingSubgroups.has(sg)) {
                assignCatalogGroup(sg, targetMainGroupUuid);
            }
        }

        // 3. Remove deselected subgroups that were previously assigned
        for (const sg of existingSubgroups) {
            if (!selectedSubgroups.has(sg)) {
                unassignCatalogGroup(sg);
            }
        }

        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent 
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(editorLayout.dialogContent, "sm:max-w-[500px] sm:max-h-[90dvh]")}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>Add to Existing Group</DialogTitle>
                    <DialogDescription className="text-foreground/60">
                        Select multiple subgroups and assign them to a main group.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 mt-4 gap-4">
                    <div className="flex flex-col shrink-0 gap-2">
                        <Label htmlFor="target-main" className="text-foreground">Target Main Group</Label>
                        <Select value={targetMainGroupUuid} onValueChange={setTargetMainGroupUuid}>
                            <SelectTrigger className={cn("w-full h-10 text-base sm:text-sm text-foreground", editorSurface.field)}>
                                <SelectValue placeholder="Select a Main Group" />
                            </SelectTrigger>
                            <SelectContent className={cn(editorSurface.overlay, "max-h-[200px]")}>
                                {typedMainGroupOrder.length === 0 ? (
                                    <SelectItem value="none" disabled>No Main Groups available</SelectItem>
                                ) : (
                                    typedMainGroupOrder.map((uuid: string) => (
                                        <SelectItem key={uuid} value={uuid} className="focus:bg-accent focus:text-accent-foreground">
                                            {formatDisplayName(typedMainCatalogGroups[uuid]?.name || "Unnamed")}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 gap-2">
                        <Label className="text-foreground shrink-0">Select Subgroups to Add</Label>

                        <div className="relative shrink-0">
                            <Search className="absolute left-2 top-2 h-4 w-4 text-foreground/70" />
                            <Input
                                placeholder="Search subgroups..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={cn(editorSurface.field, "pl-8 h-10 sm:h-8 text-base sm:text-sm focus-visible:ring-ring/50 mb-2")}
                            />
                        </div>

                        <div className={cn(editorSurface.inset, editorSurface.listSurface, "flex-1 overflow-y-auto rounded-xl px-4 pb-4 min-h-[150px]")}>
                            {allSubgroupNames.length === 0 ? (
                                <p className="text-sm text-foreground/70 italic">No subgroups available.</p>
                            ) : (
                                (()=>{
                                    const query = searchQuery.toLowerCase();

                                    // Map each subgroup to its "Home" category (the name of the first Main Group it belongs to)
                                    const getCategory = (sgName: string) => {
                                        for (const [uuid, arr] of Object.entries(typedSubgroupOrder)) {
                                            if (Array.isArray(arr) && arr.includes(sgName)) {
                                                const mgName = typedMainCatalogGroups[uuid]?.name || "Unassigned";
                                                return formatDisplayName(mgName).replace(/[\[\]❗️❗]/g, '').trim();
                                            }
                                        }
                                        // Fallback: Parse category from bracket if unassigned to any main group
                                        const match = sgName.match(/^\[(.*?)\]/);
                                        if (match) return match[1].trim();
                                        return "Unassigned";
                                    };

                                    const categories = new Map<string, string[]>();

                                    for (const name of allSubgroupNames) {
                                        const isMatch = !query || name.toLowerCase().includes(query);
                                        const cat = getCategory(name);
                                        
                                        if (isMatch || (cat.toLowerCase().includes(query) && query)) {
                                            if (!categories.has(cat)) categories.set(cat, []);
                                            categories.get(cat)!.push(name);
                                        }
                                    }

                                    const categoryElements: React.ReactNode[] = [];
                                    // Process categories in a stable order
                                    for (const [cat, items] of categories.entries()) {
                                        if (items.length > 0) {
                                            categoryElements.push(
                                                <div key={`header-${cat}`} className={cn(editorSurface.insetSticky, "sticky top-0 py-2.5 z-20 mb-2 ml-[-1rem] w-[calc(100%+2rem)] px-4 mt-4 first:mt-0")}>
                                                    <h5 className="text-xs font-bold text-foreground/50 uppercase tracking-[0.2em]">{cat}</h5>
                                                </div>
                                            );

                                            for (const name of items) {
                                                const isAssigned = selectedSubgroups.has(name);
                                                categoryElements.push(
                                                    <div key={`sg-${name}`} className="flex items-center space-x-2 pl-2 py-1.5 hover:bg-primary/10 dark:hover:bg-primary/16 rounded-sm transition-colors group/sg">
                                                        <Checkbox
                                                            id={`add-sg-${name}`}
                                                            checked={isAssigned}
                                                            onCheckedChange={(checked) => {
                                                                const next = new Set(selectedSubgroups);
                                                                if (checked) next.add(name);
                                                                else next.delete(name);
                                                                setSelectedSubgroups(next);
                                                            }}
                                                            className="border-border data-[state=unchecked]:hover:border-primary/70 data-[state=unchecked]:hover:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4 shrink-0"
                                                        />
                                                        <label
                                                            htmlFor={`add-sg-${name}`}
                                                            className={`flex-1 text-sm font-medium leading-none cursor-pointer select-none transition-colors ${isAssigned ? "text-primary dark:text-primary font-bold" : "text-foreground group-hover/sg:text-foreground"}`}
                                                        >
                                                            {formatDisplayName(name)}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        }
                                    }

                                    if (categoryElements.length === 0) {
                                        return <p className="text-sm text-foreground/70 italic p-4">No subgroups found matching search.</p>;
                                    }

                                    return (
                                        <div className="space-y-1 pb-2 pt-4">
                                            {categoryElements}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 shrink-0 flex flex-col gap-3 border-t border-border/50 pt-3 pb-[max(0px,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-foreground/70 sm:order-1">
                        {visibleSelectedCount} subgroup(s) checked
                    </p>
                    <div className="flex w-full sm:w-auto gap-2 sm:order-2">
                        <Button variant="outline" onClick={handleClose} className={cn(editorAction.secondary, editorSurface.field, "flex-1 sm:flex-none bg-white/42")}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={!targetMainGroupUuid} className={cn("flex-1 sm:flex-none", editorAction.primary)}>Save Changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}

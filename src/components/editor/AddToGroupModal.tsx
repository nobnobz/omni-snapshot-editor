import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { formatDisplayName } from '@/lib/utils';
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Checkbox } from "../ui/checkbox";
import { Search } from 'lucide-react';

export function AddToGroupModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { currentValues, assignCatalogGroup, unassignCatalogGroup } = useConfig();

    // State
    const [targetMainGroupUuid, setTargetMainGroupUuid] = useState("");
    const [selectedSubgroups, setSelectedSubgroups] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Lookups
    const catalogGroups = currentValues.catalog_groups || {};
    const rawOrder: string[] = currentValues.catalog_group_order || Object.keys(catalogGroups);
    const allSubgroupNames: string[] = rawOrder.filter((name: string) => catalogGroups[name] !== undefined);

    const mainCatalogGroups = currentValues.main_catalog_groups || {};
    const mainGroupOrder = currentValues.main_group_order || [];
    const subgroupOrder = currentValues.subgroup_order || {};

    // Preselect first main group if available and not yet set
    React.useEffect(() => {
        if (isOpen && !targetMainGroupUuid && mainGroupOrder.length > 0) {
            const firstGroup = mainGroupOrder[0];
            setTargetMainGroupUuid(firstGroup);
        }
    }, [isOpen, mainGroupOrder, targetMainGroupUuid]);

    // Update selected subgroups whenever target main group changes
    React.useEffect(() => {
        if (isOpen && targetMainGroupUuid) {
            const existingSubgroups = subgroupOrder[targetMainGroupUuid] || [];
            setSelectedSubgroups(new Set(existingSubgroups));
        }
    }, [isOpen, targetMainGroupUuid, currentValues]);

    const resetState = () => {
        setSelectedSubgroups(new Set());
        setSearchQuery("");
        setTargetMainGroupUuid(mainGroupOrder.length > 0 ? mainGroupOrder[0] : "");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleAssign = () => {
        if (!targetMainGroupUuid) return;

        // 1. Get the currently assigned subgroups for this main group BEFORE our changes
        const existingSubgroups = new Set<string>(subgroupOrder[targetMainGroupUuid] || []);

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
            <DialogContent className="w-[96vw] max-w-[calc(100%-1rem)] sm:max-w-[425px] bg-background border-border text-foreground flex flex-col max-h-[90dvh] p-4 sm:p-6 sm:rounded-2xl top-[45%]">
                <DialogHeader>
                    <DialogTitle>Add to Existing Group</DialogTitle>
                    <DialogDescription className="text-foreground/60">
                        Select multiple subgroups and assign them to a main group.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 mt-4 gap-4">
                    <div className="flex flex-col shrink-0 gap-2">
                        <Label htmlFor="target-main" className="text-foreground">Target Main Group</Label>
                        <Select value={targetMainGroupUuid} onValueChange={setTargetMainGroupUuid}>
                            <SelectTrigger className="w-full bg-background border-input text-foreground">
                                <SelectValue placeholder="Select a Main Group" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground max-h-[200px]">
                                {mainGroupOrder.length === 0 ? (
                                    <SelectItem value="none" disabled>No Main Groups available</SelectItem>
                                ) : (
                                    mainGroupOrder.map((uuid: string) => (
                                        <SelectItem key={uuid} value={uuid} className="focus:bg-accent focus:text-accent-foreground">
                                            {formatDisplayName(mainCatalogGroups[uuid]?.name || "Unnamed")}
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
                                className="pl-8 h-8 text-xs bg-background border-input focus-visible:ring-blue-500 mb-2"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-md border border-border bg-transparent px-4 pb-4 min-h-[150px]">
                            {allSubgroupNames.length === 0 ? (
                                <p className="text-sm text-foreground/70 italic">No subgroups available.</p>
                            ) : (
                                (()=>{
                                    const query = searchQuery.toLowerCase();

                                    // Map each subgroup to its "Home" category (the name of the first Main Group it belongs to)
                                    const getCategory = (sgName: string) => {
                                        for (const [uuid, arr] of Object.entries(subgroupOrder)) {
                                            if (Array.isArray(arr) && arr.includes(sgName) && uuid !== targetMainGroupUuid) {
                                                const mgName = mainCatalogGroups[uuid]?.name || "General";
                                                return formatDisplayName(mgName).replace(/[\[\]❗️❗]/g, '').trim();
                                            }
                                        }
                                        return "Unassigned";
                                    };

                                    const categories = new Map<string, string[]>();
                                    const assignedNames: string[] = [];

                                    for (const name of allSubgroupNames) {
                                        // If it is assigned to the CURRENT target, it goes to the "Assigned" list
                                        if (selectedSubgroups.has(name)) {
                                            if (!query || name.toLowerCase().includes(query)) {
                                                assignedNames.push(name);
                                            }
                                            continue;
                                        }

                                        // Otherwise, group it by its "Home" category
                                        const cat = getCategory(name);
                                        if (!query || name.toLowerCase().includes(query) || cat.toLowerCase().includes(query)) {
                                            if (!categories.has(cat)) categories.set(cat, []);
                                            categories.get(cat)!.push(name);
                                        }
                                    }

                                    const assignedNodes: React.ReactNode[] = [];
                                    for (const name of assignedNames) {
                                        assignedNodes.push(
                                            <div key={`assigned-${name}`} className="flex items-center space-x-2 pl-2 py-1.5 hover:bg-muted/50 rounded-sm group/sg">
                                                <Checkbox
                                                    id={`add-assigned-${name}`}
                                                    checked={selectedSubgroups.has(name)}
                                                    onCheckedChange={(checked) => {
                                                        const next = new Set(selectedSubgroups);
                                                        if (checked) next.add(name);
                                                        else next.delete(name);
                                                        setSelectedSubgroups(next);
                                                    }}
                                                    className="border-border data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4 shrink-0"
                                                />
                                                <label
                                                    htmlFor={`add-assigned-${name}`}
                                                    className="flex-1 text-sm font-medium leading-none cursor-pointer select-none transition-colors text-blue-300"
                                                >
                                                    {formatDisplayName(name)}
                                                </label>
                                            </div>
                                        );
                                    }

                                    const unassignedElements: React.ReactNode[] = [];
                                    // Process categories in a stable order
                                    for (const [cat, items] of categories.entries()) {
                                        if (items.length > 0) {
                                            unassignedElements.push(
                                                <div key={`header-${cat}`} className="sticky top-0 bg-background py-2.5 z-20 mb-2 border-b border-border/40">
                                                    <h5 className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em]">{cat}</h5>
                                                </div>
                                            );

                                            for (const name of items) {
                                                unassignedElements.push(
                                                    <div key={`unassigned-${name}`} className="flex items-center space-x-2 pl-2 py-1.5 hover:bg-muted/50 rounded-sm group/sg">
                                                        <Checkbox
                                                            id={`add-unassigned-${name}`}
                                                            checked={selectedSubgroups.has(name)}
                                                            onCheckedChange={(checked) => {
                                                                const next = new Set(selectedSubgroups);
                                                                if (checked) next.add(name);
                                                                else next.delete(name);
                                                                setSelectedSubgroups(next);
                                                            }}
                                                            className="border-border data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4 shrink-0"
                                                        />
                                                        <label
                                                            htmlFor={`add-unassigned-${name}`}
                                                            className="flex-1 text-sm font-medium leading-none cursor-pointer select-none transition-colors text-foreground group-hover/sg:text-foreground"
                                                        >
                                                            {formatDisplayName(name)}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        }
                                    }

                                    if (assignedNodes.length === 0 && unassignedElements.length === 0) {
                                        return <p className="text-sm text-foreground/70 italic p-4">No subgroups found matching search.</p>;
                                    }

                                    return (
                                        <div className="space-y-1 pr-3 pb-2 pt-4">
                                            {assignedNodes.length > 0 && (
                                                <div className="mb-6 space-y-1">
                                                    <div className="sticky top-0 bg-background py-2.5 z-20 mb-2 border-b border-border/40">
                                                        <h5 className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.2em]">Assigned</h5>
                                                    </div>
                                                    {assignedNodes}
                                                </div>
                                            )}
                                            {unassignedElements.length > 0 && (
                                                <div className="space-y-1">
                                                    {assignedNodes.length > 0 && (
                                                        <div className="sticky top-0 bg-background py-2.5 z-20 mb-2 border-b border-border/40 mt-4">
                                                            <h5 className="text-[11px] font-bold text-foreground/50 uppercase tracking-[0.2em]">Unassigned</h5>
                                                        </div>
                                                    )}
                                                    {unassignedElements}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 shrink-0 flex items-center justify-between">
                    <p className="text-xs text-foreground/70">
                        {selectedSubgroups.size} subgroup(s) checked
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} className="bg-muted border-border text-foreground hover:bg-accent hover:text-white">Cancel</Button>
                        <Button onClick={handleAssign} disabled={!targetMainGroupUuid} className="bg-blue-600 text-white hover:bg-blue-700">Save Changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}

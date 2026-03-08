import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { formatDisplayName } from '@/lib/utils';
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
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
            <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add to Existing Group</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Select multiple subgroups and assign them to a main group.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 flex flex-col min-h-0 mt-4">
                    <div className="space-y-2 shrink-0">
                        <Label htmlFor="target-main" className="text-neutral-300">Target Main Group</Label>
                        <Select value={targetMainGroupUuid} onValueChange={setTargetMainGroupUuid}>
                            <SelectTrigger className="w-full bg-neutral-950 border-neutral-700 text-neutral-200">
                                <SelectValue placeholder="Select a Main Group" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 max-h-[200px]">
                                {mainGroupOrder.length === 0 ? (
                                    <SelectItem value="none" disabled>No Main Groups available</SelectItem>
                                ) : (
                                    mainGroupOrder.map((uuid: string) => (
                                        <SelectItem key={uuid} value={uuid} className="focus:bg-neutral-800 focus:text-white">
                                            {formatDisplayName(mainCatalogGroups[uuid]?.name || "Unnamed")}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                        <Label className="text-neutral-300">Select Subgroups to Add</Label>

                        <div className="relative shrink-0">
                            <Search className="absolute left-2 top-2 h-4 w-4 text-neutral-500" />
                            <Input
                                placeholder="Search subgroups..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs bg-neutral-950 border-neutral-700 focus-visible:ring-blue-500 mb-2"
                            />
                        </div>

                        <ScrollArea className="h-[350px] rounded-md border border-neutral-800 bg-neutral-950/50 p-4 shrink-0">
                            {allSubgroupNames.length === 0 ? (
                                <p className="text-sm text-neutral-500 italic">No subgroups available.</p>
                            ) : (
                                (() => {
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
                                            <div key={`assigned-${name}`} className="flex items-center space-x-2 pl-2 py-1.5 hover:bg-neutral-800/50 rounded-sm group/sg">
                                                <Checkbox
                                                    id={`add-assigned-${name}`}
                                                    checked={selectedSubgroups.has(name)}
                                                    onCheckedChange={(checked) => {
                                                        const next = new Set(selectedSubgroups);
                                                        if (checked) next.add(name);
                                                        else next.delete(name);
                                                        setSelectedSubgroups(next);
                                                    }}
                                                    className="border-neutral-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
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
                                    // Process categories in a stable order (e.g., appearance order in allSubgroupNames, which the Map preserves)
                                    for (const [cat, items] of categories.entries()) {
                                        if (items.length > 0) {
                                            unassignedElements.push(
                                                <div key={`header-${cat}`} className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-5 mb-2 pl-1 border-b border-neutral-800/60 pb-1">
                                                    {cat}
                                                </div>
                                            );

                                            for (const name of items) {
                                                unassignedElements.push(
                                                    <div key={`unassigned-${name}`} className="flex items-center space-x-2 pl-2 py-1.5 hover:bg-neutral-800/50 rounded-sm group/sg">
                                                        <Checkbox
                                                            id={`add-unassigned-${name}`}
                                                            checked={selectedSubgroups.has(name)}
                                                            onCheckedChange={(checked) => {
                                                                const next = new Set(selectedSubgroups);
                                                                if (checked) next.add(name);
                                                                else next.delete(name);
                                                                setSelectedSubgroups(next);
                                                            }}
                                                            className="border-neutral-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                                                        />
                                                        <label
                                                            htmlFor={`add-unassigned-${name}`}
                                                            className="flex-1 text-sm font-medium leading-none cursor-pointer select-none transition-colors text-neutral-300 group-hover/sg:text-neutral-200"
                                                        >
                                                            {formatDisplayName(name)}
                                                        </label>
                                                    </div>
                                                );
                                            }
                                        }
                                    }

                                    if (assignedNodes.length === 0 && unassignedElements.length === 0) {
                                        return <p className="text-sm text-neutral-500 italic p-4">No subgroups found matching search.</p>;
                                    }

                                    return (
                                        <div className="space-y-1 pr-3 pb-2 pt-1">
                                            {assignedNodes.length > 0 && (
                                                <div className="mb-6 space-y-1">
                                                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 border-b border-neutral-800 pb-1">Assigned</div>
                                                    {assignedNodes}
                                                </div>
                                            )}
                                            {unassignedElements.length > 0 && (
                                                <div className="space-y-1">
                                                    {assignedNodes.length > 0 && <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 border-b border-neutral-800 pb-1 mt-6">Unassigned</div>}
                                                    {unassignedElements}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="mt-6 shrink-0 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        {selectedSubgroups.size} subgroup(s) checked
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white">Cancel</Button>
                        <Button onClick={handleAssign} disabled={!targetMainGroupUuid} className="bg-blue-600 text-white hover:bg-blue-700">Save Changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}

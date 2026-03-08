"use client";

import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { formatDisplayName } from "@/lib/utils";
import { UploadCloud, CheckCircle2, AlertTriangle, FileJson, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { decodeConfig } from "@/lib/config-utils";
import { OmniConfig } from "@/lib/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ImportSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ParsedMainGroup {
    originalUuid: string;
    name: string;
    subgroupNames: string[];
    posterType: string;
    posterSize: string;
    isDuplicate: boolean;
}

interface ParsedSubgroup {
    name: string;
    catalogs: string[];
    imageUrl?: string;
    isDuplicate: boolean;
    hasNewImage?: boolean;
    hasNewCatalogs?: boolean;
}

export function ImportSetupModal({ isOpen, onClose }: ImportSetupModalProps) {
    const { currentValues, importGroups } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");

    // Parsed Data
    const [parsedMainGroups, setParsedMainGroups] = useState<ParsedMainGroup[]>([]);
    const [parsedSubgroups, setParsedSubgroups] = useState<ParsedSubgroup[]>([]);

    // Selections
    const [selectedMainGroupUuids, setSelectedMainGroupUuids] = useState<Set<string>>(new Set());
    const [selectedStandaloneSubgroups, setSelectedStandaloneSubgroups] = useState<Set<string>>(new Set());

    // assignments: subgroupName -> targetMainGroupUuid (from the CURRENT setup, not the parsed one)
    const [standaloneAssignments, setStandaloneAssignments] = useState<Record<string, string>>({});

    const resetState = () => {
        setStep(1);
        setFileName("");
        setError("");
        setParsedMainGroups([]);
        setParsedSubgroups([]);
        setSelectedMainGroupUuids(new Set());
        setSelectedStandaloneSubgroups(new Set());
        setStandaloneAssignments({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const processUploadedJson = (jsonString: string) => {
        try {
            const rawData = JSON.parse(jsonString);
            let importedValues: Record<string, any> = {};

            // Check if it's an OmniConfig (with `.values`) or a raw decoded JSON
            if (rawData.values) {
                // Decode it like we do in ConfigContext
                for (const [key, val] of Object.entries(rawData.values)) {
                    importedValues[key] = decodeConfig(val as any);
                }
            } else if (rawData.main_catalog_groups || rawData.catalog_groups) {
                // Already raw decoded
                importedValues = rawData;
            } else {
                throw new Error("Invalid format. Could not find configuration data.");
            }

            // Current state for duplicate checking
            const currentMainGroupNames = new Set(
                Object.values(currentValues.main_catalog_groups || {}).map((g: any) => g.name)
            );
            const currentSubgroupNames = new Set(
                Object.keys(currentValues.catalog_groups || {})
            );

            // Parse Main Groups
            const inMainGroups = importedValues.main_catalog_groups || {};
            const inMainGroupOrder = importedValues.main_group_order || Object.keys(inMainGroups);
            const inCatalogsGroups = importedValues.catalog_groups || {};

            const isPlaceholderSg = (name: string, catalogs: any) => {
                const cats = Array.isArray(catalogs) ? catalogs : [];
                if (cats.length > 0) return false;
                const placeholders = ["[Decades]", "[Actors]", "[Awards]", "[Discover]", "[Collections]", "[Streaming Services]", "[Directors]", "[Genres]"];
                return placeholders.some(p => name.includes(p));
            };

            const parsedMGs: ParsedMainGroup[] = [];
            for (const uuid of inMainGroupOrder) {
                const group = inMainGroups[uuid];
                if (!group) continue;
                parsedMGs.push({
                    originalUuid: uuid,
                    name: group.name || "Unnamed Group",
                    subgroupNames: (importedValues.subgroup_order?.[uuid] || group.subgroupNames || []).filter((sg: string) => !isPlaceholderSg(sg, inCatalogsGroups[sg])),
                    posterType: group.posterType || "Poster",
                    posterSize: group.posterSize || "Default",
                    isDuplicate: currentMainGroupNames.has(group.name)
                });
            }

            // Parse Subgroups
            const inImageUrls = importedValues.catalog_group_image_urls || {};
            const inCatalogGroupOrder = importedValues.catalog_group_order || Object.keys(inCatalogsGroups);
            const parsedSGs: ParsedSubgroup[] = [];

            for (const sgName of inCatalogGroupOrder) {
                if (!inCatalogsGroups[sgName]) continue;
                if (isPlaceholderSg(sgName, inCatalogsGroups[sgName])) continue;
                const newImage = inImageUrls[sgName];
                const existingImage = currentValues.catalog_group_image_urls?.[sgName];
                const isDup = currentSubgroupNames.has(sgName);
                const parsedCats = Array.isArray(inCatalogsGroups[sgName]) ? inCatalogsGroups[sgName] : [];
                const existCats = currentValues.catalog_groups?.[sgName] || [];

                // Compare arrays for exact match to know if an update is actually needed
                const isCatsDiff = parsedCats.length !== existCats.length || parsedCats.some((c: string, i: number) => c !== existCats[i]);
                const hasNewCats = isDup && isCatsDiff;

                parsedSGs.push({
                    name: sgName,
                    catalogs: parsedCats,
                    imageUrl: newImage,
                    isDuplicate: isDup,
                    hasNewImage: isDup && !!newImage && newImage !== existingImage,
                    hasNewCatalogs: hasNewCats
                });
            }

            const getSgWeight = (sg: ParsedSubgroup) => sg.isDuplicate ? ((sg.hasNewCatalogs || sg.hasNewImage) ? 1 : 2) : 0;

            parsedMGs.sort((a, b) => Number(a.isDuplicate) - Number(b.isDuplicate));
            parsedSGs.sort((a, b) => getSgWeight(a) - getSgWeight(b));

            setParsedMainGroups(parsedMGs);
            setParsedSubgroups(parsedSGs);
            setStep(2);
            setError("");

        } catch (err: any) {
            console.error("Parse error:", err);
            setError(err.message || "Failed to parse JSON file.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            processUploadedJson(content);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        const payloadMainGroups: Record<string, any> = {};
        const payloadSubgroups: Record<string, { catalogs: string[], imageUrl?: string }> = {};

        // 1. Gather Selected Main Groups and their nested subgroups
        const subgroupsIncludedViaMainGroups = new Set<string>();

        parsedMainGroups.forEach(mg => {
            if (selectedMainGroupUuids.has(mg.originalUuid)) {
                payloadMainGroups[mg.originalUuid] = {
                    name: mg.name,
                    subgroupNames: mg.subgroupNames,
                    posterType: mg.posterType,
                    posterSize: mg.posterSize
                };

                mg.subgroupNames.forEach(sgName => {
                    subgroupsIncludedViaMainGroups.add(sgName);
                    // Add the actual subgroup data to payload
                    const parsedSg = parsedSubgroups.find(s => s.name === sgName);
                    if (parsedSg) {
                        payloadSubgroups[sgName] = {
                            catalogs: parsedSg.catalogs,
                            imageUrl: parsedSg.imageUrl
                        };
                    }
                });
            }
        });

        // 2. Gather Standalone Subgroups
        parsedSubgroups.forEach(sg => {
            if (selectedStandaloneSubgroups.has(sg.name) && !subgroupsIncludedViaMainGroups.has(sg.name)) {
                payloadSubgroups[sg.name] = {
                    catalogs: sg.catalogs,
                    imageUrl: sg.imageUrl
                };
            }
        });

        // Current Main Groups for context-aware assignments
        const currentMainGroups = currentValues.main_catalog_groups || {};

        importGroups({
            mainGroups: payloadMainGroups,
            subgroups: payloadSubgroups,
            standaloneAssignments: standaloneAssignments
        });

        handleClose();
    };

    // Toggle Main Group Selection
    const toggleMainGroup = (uuid: string, isDuplicate: boolean) => {
        if (isDuplicate) return;
        const next = new Set(selectedMainGroupUuids);
        if (next.has(uuid)) {
            next.delete(uuid);
        } else {
            next.add(uuid);
        }
        setSelectedMainGroupUuids(next);
    };

    // Toggle Standalone Subgroup Selection
    const toggleSubgroup = (name: string, isDuplicate: boolean) => {
        if (isDuplicate) return;
        const next = new Set(selectedStandaloneSubgroups);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setSelectedStandaloneSubgroups(next);
    };
    // Bulk Actions Main Groups
    const selectAllMain = () => {
        const next = new Set<string>();
        parsedMainGroups.forEach(mg => {
            if (!mg.isDuplicate) next.add(mg.originalUuid);
        });
        setSelectedMainGroupUuids(next);
    };

    const deselectAllMain = () => {
        setSelectedMainGroupUuids(new Set());
    };

    // Bulk Actions Subgroups
    const selectAllSubgroups = () => {
        const next = new Set<string>();
        parsedSubgroups.forEach(sg => {
            const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage;
            const includedInMain = parsedMainGroups.some(mg => selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (!isFullyExisting && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };

    const deselectAllSubgroups = () => {
        setSelectedStandaloneSubgroups(new Set());
    };

    const selectCatalogUpdates = () => {
        const next = new Set<string>();
        parsedSubgroups.forEach(sg => {
            const includedInMain = parsedMainGroups.some(mg => selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (sg.isDuplicate && sg.hasNewCatalogs && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };

    const selectImageUpdates = () => {
        const next = new Set<string>();
        parsedSubgroups.forEach(sg => {
            const includedInMain = parsedMainGroups.some(mg => selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
            if (sg.isDuplicate && sg.hasNewImage && !includedInMain) {
                next.add(sg.name);
            }
        });
        setSelectedStandaloneSubgroups(next);
    };

    const currentMainGroups = currentValues.main_catalog_groups || {};
    const currentMainGroupOrder = currentValues.main_group_order || [];

    const totalSelectedToImport = selectedMainGroupUuids.size + selectedStandaloneSubgroups.size;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-2xl bg-neutral-950 border-neutral-800 text-neutral-200">
                <DialogHeader>
                    <DialogTitle>Add From Existing Setup</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        {step === 1 ? "Upload a valid .json configuration to extract groups." : `Review and select groups from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-neutral-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center">
                        <UploadCloud className="w-12 h-12 text-neutral-500 mb-4" />
                        <h3 className="font-medium text-lg text-neutral-300 mb-2">Upload configuration file</h3>
                        <p className="text-sm text-neutral-500 mb-6 max-w-sm">
                            Select an <code>omni-config.json</code> file to import Main Groups and Subgroups.
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold">
                            Select File
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        {error && (
                            <div className="mt-6 flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <Tabs defaultValue="subgroups" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border border-neutral-800">
                            <TabsTrigger value="subgroups" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                                Standalone Subgroups ({parsedSubgroups.length})
                            </TabsTrigger>
                            <TabsTrigger value="main" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                                Main Groups ({parsedMainGroups.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 border border-neutral-800 rounded-md bg-neutral-950">
                            <ScrollArea className="h-[40vh]">
                                <TabsContent value="main" className="p-0 m-0">
                                    {parsedMainGroups.length === 0 ? (
                                        <div className="p-8 text-center text-neutral-500 italic">No Main Groups found in this file.</div>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-neutral-800/50">
                                            <div className="p-2 bg-neutral-900/50 border-b border-neutral-800 flex gap-2">
                                                <Button variant="secondary" size="sm" onClick={selectAllMain} className="h-7 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200">Select All New</Button>
                                                <Button variant="ghost" size="sm" onClick={deselectAllMain} className="h-7 text-xs text-neutral-400 hover:text-white">Deselect All</Button>
                                            </div>
                                            {parsedMainGroups.map(mg => (
                                                <div
                                                    key={mg.originalUuid}
                                                    className={`flex items-start p-4 transition-colors ${mg.isDuplicate ? 'opacity-50 bg-neutral-900/40 cursor-not-allowed' : 'hover:bg-neutral-900/50'}`}
                                                >
                                                    <Checkbox
                                                        id={`mg-${mg.originalUuid}`}
                                                        checked={selectedMainGroupUuids.has(mg.originalUuid) || mg.isDuplicate}
                                                        disabled={mg.isDuplicate}
                                                        onCheckedChange={() => toggleMainGroup(mg.originalUuid, mg.isDuplicate)}
                                                        className="mt-1"
                                                    />
                                                    <div className="ml-3 flex-1 min-w-0">
                                                        <label htmlFor={`mg-${mg.originalUuid}`} className={`font-semibold block ${mg.isDuplicate ? '' : 'cursor-pointer'}`}>
                                                            {formatDisplayName(mg.name)}
                                                            {mg.isDuplicate && <Badge variant="outline" className="ml-2 bg-neutral-900 border-neutral-700 text-neutral-500 text-[9px] uppercase">Exists</Badge>}
                                                        </label>

                                                        {mg.subgroupNames.length > 0 && (
                                                            <div className="mt-2 pl-3 border-l-2 border-neutral-800 space-y-1">
                                                                {mg.subgroupNames.map(sg => {
                                                                    const parsedSg = parsedSubgroups.find(p => p.name === sg);
                                                                    const isSgDup = parsedSg?.isDuplicate;
                                                                    return (
                                                                        <div key={sg} className="flex items-center text-xs text-neutral-400">
                                                                            <span className={`truncate ${isSgDup ? 'line-through opacity-70' : ''}`}>{formatDisplayName(sg)}</span>
                                                                            {isSgDup && <span className="ml-2 text-[10px] text-neutral-600">(Will use existing)</span>}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="subgroups" className="p-0 m-0">
                                    {parsedSubgroups.length === 0 ? (
                                        <div className="p-8 text-center text-neutral-500 italic">No Subgroups found in this file.</div>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-neutral-800/50">
                                            <div className="p-3 bg-blue-900/10 border-b border-neutral-800 text-xs text-blue-300 px-4">
                                                Select subgroups you want to import independent of Main Groups. You can assign them to your <strong>existing</strong> main groups below.
                                            </div>
                                            <div className="p-2 bg-neutral-900/50 border-b border-neutral-800 flex flex-wrap gap-2">
                                                <Button variant="secondary" size="sm" onClick={selectAllSubgroups} className="h-7 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200">Select All</Button>
                                                <Button variant="secondary" size="sm" onClick={selectCatalogUpdates} className="h-7 text-xs bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border border-amber-500/30">Update Catalogs</Button>
                                                <Button variant="secondary" size="sm" onClick={selectImageUpdates} className="h-7 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30">Update Images</Button>
                                                <Button variant="ghost" size="sm" onClick={deselectAllSubgroups} className="h-7 text-xs text-neutral-400 hover:text-white mb-1">Deselect All</Button>
                                            </div>
                                            {(() => {
                                                const newSgs = parsedSubgroups.filter(sg => !sg.isDuplicate);
                                                const mergeSgs = parsedSubgroups.filter(sg => sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage));
                                                const existingSgs = parsedSubgroups.filter(sg => sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage);

                                                const renderSubgroupRow = (sg: ParsedSubgroup) => {
                                                    const isSelected = selectedStandaloneSubgroups.has(sg.name);
                                                    const includedInMain = parsedMainGroups.some(mg => selectedMainGroupUuids.has(mg.originalUuid) && mg.subgroupNames.includes(sg.name));
                                                    const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage;
                                                    const isDisabled = includedInMain || isFullyExisting;

                                                    return (
                                                        <div
                                                            key={sg.name}
                                                            className={`flex items-center p-4 transition-colors ${isDisabled ? 'opacity-50 bg-neutral-900/40' : 'hover:bg-neutral-900/50'}`}
                                                        >
                                                            <Checkbox
                                                                id={`sg-${sg.name}`}
                                                                checked={isSelected || includedInMain}
                                                                disabled={isDisabled}
                                                                onCheckedChange={() => toggleSubgroup(sg.name, isDisabled)}
                                                            />
                                                            <div className="ml-3 flex-1 min-w-0 pr-4">
                                                                <label htmlFor={`sg-${sg.name}`} className={`font-semibold text-sm block truncate ${isDisabled ? '' : 'cursor-pointer'}`}>
                                                                    {formatDisplayName(sg.name)}
                                                                    {sg.isDuplicate && sg.hasNewCatalogs && <Badge variant="default" className="ml-2 bg-amber-600/20 text-amber-500 border border-amber-500/30 text-[9px] uppercase hover:bg-amber-600/30">Replace Catalogs</Badge>}
                                                                    {sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage && <Badge variant="outline" className="ml-2 bg-neutral-900 border-neutral-700 text-neutral-500 text-[9px] uppercase">Existing</Badge>}
                                                                    {sg.hasNewImage && <Badge variant="default" className="ml-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] uppercase hover:bg-purple-600/30">Update Image</Badge>}
                                                                    {includedInMain && !sg.isDuplicate && <Badge className="ml-2 bg-blue-900/40 text-blue-400 border-blue-900 text-[9px] uppercase">Included w/ Main</Badge>}
                                                                </label>
                                                                <div className="text-[10px] text-neutral-500 mt-0.5">{sg.catalogs.length} {sg.catalogs.length === 1 ? 'Catalog' : 'Catalogs'}</div>
                                                            </div>

                                                            {isSelected && !isDisabled && !sg.isDuplicate && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs bg-neutral-900 border-neutral-700 shrink-0 min-w-[140px] justify-between">
                                                                            <span className="truncate max-w-[100px]">
                                                                                {standaloneAssignments[sg.name] ? formatDisplayName(currentMainGroups[standaloneAssignments[sg.name]]?.name || "Unassigned") : "Unassigned"}
                                                                            </span>
                                                                            <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                                                                        <DropdownMenuItem
                                                                            onClick={() => setStandaloneAssignments(prev => { const n = { ...prev }; delete n[sg.name]; return n; })}
                                                                            className="text-xs focus:bg-amber-500/20 focus:text-amber-400 font-semibold"
                                                                        >
                                                                            None (Unassigned)
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 font-bold mt-2">Assign to Current Match</DropdownMenuLabel>
                                                                        {currentMainGroupOrder.map((uuid: string) => (
                                                                            <DropdownMenuItem
                                                                                key={uuid}
                                                                                onClick={() => setStandaloneAssignments(prev => ({ ...prev, [sg.name]: uuid }))}
                                                                                className="text-xs focus:bg-blue-500/20 focus:text-blue-400"
                                                                            >
                                                                                {formatDisplayName(currentMainGroups[uuid]?.name || "Unnamed")}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <div className="flex flex-col">
                                                        {mergeSgs.length > 0 && (
                                                            <>
                                                                <div className="p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-b border-y-neutral-800">
                                                                    Updates ({mergeSgs.length})
                                                                </div>
                                                                {mergeSgs.map(renderSubgroupRow)}
                                                            </>
                                                        )}
                                                        {newSgs.length > 0 && (
                                                            <>
                                                                <div className="p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-y border-y-neutral-800">
                                                                    New Subgroups ({newSgs.length})
                                                                </div>
                                                                {newSgs.map(renderSubgroupRow)}
                                                            </>
                                                        )}
                                                        {existingSgs.length > 0 && (
                                                            <>
                                                                <div className="p-2 bg-neutral-900 font-semibold text-xs text-neutral-400 uppercase tracking-wider sticky top-0 z-10 border-y border-y-neutral-800">
                                                                    Existing ({existingSgs.length})
                                                                </div>
                                                                {existingSgs.map(renderSubgroupRow)}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={handleClose} className="text-neutral-400 hover:text-white">
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleImport}
                            disabled={totalSelectedToImport === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            <FileJson className="w-4 h-4 mr-2" />
                            Import Selected ({totalSelectedToImport})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

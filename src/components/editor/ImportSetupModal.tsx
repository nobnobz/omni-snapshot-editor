"use client";

import React, { useState, useRef, useEffect } from "react";
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
    hasChanges?: boolean;
}

interface ParsedSubgroup {
    name: string;
    catalogs: string[];
    imageUrl?: string;
    isDuplicate: boolean;
    hasNewImage?: boolean;
    hasNewCatalogs?: boolean;
    category?: string;
}

const isPlaceholderSg = (name: string, catalogs: any) => {
    const cats = Array.isArray(catalogs) ? catalogs : [];
    if (cats.length > 0) return false;
    const placeholders = ["[Decades]", "[Actors]", "[Awards]", "[Discover]", "[Collections]", "[Streaming Services]", "[Directors]", "[Genres]"];
    return placeholders.some(p => name.includes(p));
};

const getSubgroupCategory = (name: string) => {
    if (name.includes("[Actors]")) return "Actors";
    if (name.includes("[Directors]")) return "Directors";
    if (name.includes("[Genres]")) return "Genres";
    if (name.includes("[Decades]")) return "Decades";
    if (name.includes("[Awards]")) return "Awards";
    if (name.includes("[Discover]")) return "Discover";
    if (name.includes("[Collections]")) return "Collections";
    if (name.includes("[Streaming Services]")) return "Streaming Services";
    return "Other";
};

export function ImportSetupModal({ isOpen, onClose }: ImportSetupModalProps) {
    const { currentValues, importGroups, manifest, fetchManifest } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchManifest();
        }
    }, [isOpen, fetchManifest]);

    const omniTemplate = manifest?.templates.find(t => t.id === 'ume-main');

    const templates: { label: string; url: string }[] = omniTemplate ? [
        {
            label: omniTemplate.name,
            url: omniTemplate.url
        }
    ] : [
        {
            label: "UME Omni Template",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        },
    ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);

    useEffect(() => {
        if (omniTemplate) {
            setSelectedVersion(omniTemplate.name);
        }
    }, [omniTemplate]);

    const [templateLoading, setTemplateLoading] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");

    // State for all imported values (needed for metadata extraction)
    const [importedValues, setImportedValues] = useState<Record<string, any>>({});
    const [selectedGlobalKeys, setSelectedGlobalKeys] = useState<Set<string>>(new Set());

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
        setImportedValues({});
        setSelectedGlobalKeys(new Set());
        setTemplateLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const processUploadedJson = (jsonString: string) => {
        try {
            const rawData = JSON.parse(jsonString);
            let imported: Record<string, any> = {};

            // Check if it's an OmniConfig (with `.values`) or a raw decoded JSON
            if (rawData.values) {
                // Decode it like we do in ConfigContext
                for (const [key, val] of Object.entries(rawData.values)) {
                    imported[key] = decodeConfig(val as any);
                }
            } else if (rawData.main_catalog_groups || rawData.catalog_groups) {
                // Already raw decoded
                imported = rawData;
            } else {
                throw new Error("Invalid format. Could not find configuration data.");
            }

            setImportedValues(imported);

            // Current state for duplicate checking
            const currentMainGroupNames = new Set(
                Object.values(currentValues.main_catalog_groups || {}).map((g: any) => g.name)
            );
            const currentSubgroupNames = new Set(
                Object.keys(currentValues.catalog_groups || {})
            );

            // Parse Main Groups
            const inMainGroups = imported.main_catalog_groups || {};
            const inMainGroupOrder = imported.main_group_order || Object.keys(inMainGroups);
            const inCatalogsGroups = imported.catalog_groups || {};

            const parsedMGs: ParsedMainGroup[] = [];
            for (const uuid of inMainGroupOrder) {
                const group = inMainGroups[uuid];
                if (!group) continue;
                parsedMGs.push({
                    originalUuid: uuid,
                    name: group.name || "Unnamed Group",
                    subgroupNames: (imported.subgroup_order?.[uuid] || group.subgroupNames || []).filter((sg: string) => !isPlaceholderSg(sg, inCatalogsGroups[sg])),
                    posterType: group.posterType || "Poster",
                    posterSize: group.posterSize || "Default",
                    isDuplicate: currentMainGroupNames.has(group.name)
                });
            }

            // Create a mapping from subgroup name to its parent main group category
            const sgCategoryMap: Record<string, string> = {};
            parsedMGs.forEach(mg => {
                mg.subgroupNames.forEach(sgName => {
                    if (!sgCategoryMap[sgName]) {
                        sgCategoryMap[sgName] = mg.name;
                    }
                });
            });

            // Parse Subgroups
            const inImageUrls = imported.catalog_group_image_urls || {};
            const inCatalogGroupOrder = imported.catalog_group_order || Object.keys(inCatalogsGroups);
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
                    hasNewCatalogs: hasNewCats,
                    category: sgCategoryMap[sgName] || getSubgroupCategory(sgName)
                });
            }

            const currentMgByName: Record<string, string> = {};
            Object.entries(currentValues.main_catalog_groups || {}).forEach(([uid, mg]: [string, any]) => {
                if (mg?.name) currentMgByName[mg.name] = uid;
            });

            parsedMGs.forEach(mg => {
                if (!mg.isDuplicate) {
                    mg.hasChanges = true;
                    return;
                }

                const existingUuid = currentMgByName[mg.name];
                const existingSubgroups = currentValues.subgroup_order?.[existingUuid] || [];

                let linksChanged = false;
                if (existingSubgroups.length !== mg.subgroupNames.length) {
                    linksChanged = true;
                } else {
                    for (let i = 0; i < mg.subgroupNames.length; i++) {
                        if (existingSubgroups[i] !== mg.subgroupNames[i]) {
                            linksChanged = true;
                            break;
                        }
                    }
                }

                if (linksChanged) {
                    mg.hasChanges = true;
                    return;
                }

                const hasSgChanges = mg.subgroupNames.some(sgName => {
                    const sg = parsedSGs.find(s => s.name === sgName);
                    if (!sg) return false;
                    return !sg.isDuplicate || sg.hasNewCatalogs || sg.hasNewImage;
                });

                mg.hasChanges = hasSgChanges;
            });

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
        const associatedMetadata: Record<string, any> = {};

        // 1. Mark which catalogs we're importing to fetch their metadata later
        const importedCatalogIds = new Set<string>();

        // 2. Gather Selected Main Groups and their nested subgroups
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
                    // Add the actual subgroup data to payload.
                    // IMPORTANT: Only write catalog contents if the user ALSO explicitly selected
                    // this subgroup in the Subgroups tab. Otherwise, write an empty list to preserve
                    // the group structure without activating unwanted addon catalogs in Omni.
                    const parsedSg = parsedSubgroups.find(s => s.name === sgName);
                    if (parsedSg) {
                        const userExplicitlySelectedCatalogs = selectedStandaloneSubgroups.has(sgName);
                        const catalogsToImport = userExplicitlySelectedCatalogs ? parsedSg.catalogs : [];
                        payloadSubgroups[sgName] = {
                            catalogs: catalogsToImport,
                            imageUrl: parsedSg.imageUrl
                        };
                        catalogsToImport.forEach(cId => importedCatalogIds.add(cId));
                    }
                });
            }
        });

        // 3. Gather Standalone Subgroups
        parsedSubgroups.forEach(sg => {
            if (selectedStandaloneSubgroups.has(sg.name) && !subgroupsIncludedViaMainGroups.has(sg.name)) {
                payloadSubgroups[sg.name] = {
                    catalogs: sg.catalogs,
                    imageUrl: sg.imageUrl
                };
                sg.catalogs.forEach(cId => importedCatalogIds.add(cId));
            }
        });

        // 4. Capture Associated Metadata (Custom Names, Images, Patterns)
        if (importedCatalogIds.size > 0) {
            associatedMetadata.custom_catalog_names = {};
            associatedMetadata.regex_pattern_image_urls = {};
            associatedMetadata.enabled_patterns = new Set<string>();

            const inCustomNames = importedValues.custom_catalog_names || {};
            const inImageUrls = importedValues.regex_pattern_image_urls || {};
            const inAutoPlay = importedValues.auto_play_enabled_patterns || [];
            const inTagEnabled = importedValues.pattern_tag_enabled_patterns || [];

            importedCatalogIds.forEach(id => {
                if (inCustomNames[id]) associatedMetadata.custom_catalog_names[id] = inCustomNames[id];
                if (inImageUrls[id]) associatedMetadata.regex_pattern_image_urls[id] = inImageUrls[id];

                // Regex patterns usually target catalog IDs either directly or via substring in their rules
                // But for simplicity and safety, we also look for patterns named like the catalogs
                // and check the enabled lists
                if (inAutoPlay.includes(id)) associatedMetadata.enabled_patterns.add(id);
                if (inTagEnabled.includes(id)) associatedMetadata.enabled_patterns.add(id);
            });

            // Convert set to array for payload
            associatedMetadata.enabled_patterns = Array.from(associatedMetadata.enabled_patterns);
        }

        // 5. Global Settings
        const globalSettings: Record<string, any> = {};
        selectedGlobalKeys.forEach(key => {
            if (importedValues[key] !== undefined) {
                globalSettings[key] = importedValues[key];
            }
        });

        console.log('[IMPORT DEBUG] payload:', {
            mainGroups: payloadMainGroups,
            subgroups: Object.keys(payloadSubgroups),
            subgroupCount: Object.keys(payloadSubgroups).length,
            standaloneAssignments: standaloneAssignments,
        });

        importGroups({
            mainGroups: payloadMainGroups,
            subgroups: payloadSubgroups,
            standaloneAssignments: standaloneAssignments,
            metadata: associatedMetadata,
            globalSettings: globalSettings
        });

        handleClose();
    };

    // Toggle Main Group Selection
    const toggleMainGroup = (uuid: string) => {
        const mg = parsedMainGroups.find(m => m.originalUuid === uuid);
        if (mg && mg.isDuplicate && !mg.hasChanges) return;

        const next = new Set(selectedMainGroupUuids);
        const isNowSelected = !next.has(uuid);

        if (!isNowSelected) {
            next.delete(uuid);
        } else {
            next.add(uuid);
        }
        setSelectedMainGroupUuids(next);

        // Auto-select linked subgroups (including existing ones, for re-linking purposes)
        if (mg) {
            const nextStandalone = new Set(selectedStandaloneSubgroups);
            mg.subgroupNames.forEach(sgName => {
                const sg = parsedSubgroups.find(s => s.name === sgName);
                if (sg) {
                    // Include even duplicates - needed to re-link existing subgroups
                    if (isNowSelected) nextStandalone.add(sgName);
                    else nextStandalone.delete(sgName);
                }
            });
            setSelectedStandaloneSubgroups(nextStandalone);
        }
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
            if (!mg.isDuplicate || mg.hasChanges) {
                next.add(mg.originalUuid);
            }
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
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-2xl bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Add From Existing Setup</DialogTitle>
                    <DialogDescription className="text-foreground/70">
                        {step === 1 ? "Upload a Omni .json configuration to extract groups." : `Review and select groups from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4">
                        {/* Template Loader */}
                        <div className="p-5 border border-border rounded-lg bg-muted/50">
                            <h3 className="font-semibold text-sm text-foreground mb-3">Load Unified Media Experience Template</h3>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                    className="flex-1 h-10 rounded-md border border-border bg-background/50 px-3 text-xs text-foreground font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                >
                                    {templates.map(t => (
                                        <option key={t.label} value={t.label}>{t.label}</option>
                                    ))}
                                </select>
                                <Button
                                    onClick={async () => {
                                        const t = templates.find(t => t.label === selectedVersion);
                                        if (!t) return;
                                        setTemplateLoading(true);
                                        setError("");
                                        try {
                                            const res = await fetch(t.url);
                                            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                                            const buffer = await res.arrayBuffer();
                                            const text = new TextDecoder("utf-8").decode(buffer);
                                            setFileName(`Template ${t.label}`);
                                            processUploadedJson(text);
                                        } catch (err: any) {
                                            setError(err.message || "Failed to load template.");
                                        } finally {
                                            setTemplateLoading(false);
                                        }
                                    }}
                                    disabled={templateLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5"
                                >
                                    {templateLoading ? "Loading..." : "Load"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border"></div>
                            <span className="text-[10px] text-foreground/70 uppercase font-bold tracking-wider">or upload file</span>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-center">
                            <UploadCloud className="w-10 h-10 text-foreground/70 mb-3" />
                            <h3 className="font-medium text-sm text-foreground mb-1">Upload configuration file</h3>
                            <p className="text-xs text-foreground/70 mb-4 max-w-sm">
                                Paste your AIOMetadata <strong>Share Setup</strong> JSON or drop the exported <code>.json</code> file below.
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-muted border-border hover:bg-muted/80 text-foreground text-xs font-semibold">
                                Select File
                            </Button>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <Tabs defaultValue="subgroups" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-11 rounded-xl border border-border/40">
                            <TabsTrigger
                                value="subgroups"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 text-xs font-medium"
                            >
                                Subgroups ({parsedSubgroups.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="main"
                                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 text-xs font-medium"
                            >
                                Main Groups ({parsedMainGroups.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 border border-border rounded-md bg-background">
                            <ScrollArea className="h-[40vh]">
                                <TabsContent value="main" className="p-0 m-0">
                                    {parsedMainGroups.length === 0 ? (
                                        <div className="p-8 text-center text-foreground/70 italic">No Main Groups found in this file.</div>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-border/50">
                                            <div className="p-2 bg-muted/50 border-b border-border flex gap-2">
                                                <Button variant="secondary" size="sm" onClick={selectAllMain} className="h-7 text-xs bg-muted hover:bg-muted/80 text-foreground">Select All New</Button>
                                                <Button variant="ghost" size="sm" onClick={deselectAllMain} className="h-7 text-xs text-foreground/70 hover:text-foreground">Deselect All</Button>
                                            </div>
                                            {parsedMainGroups.map(mg => {
                                                const isFullyImported = mg.isDuplicate && !mg.hasChanges;
                                                return (
                                                    <div
                                                        key={mg.originalUuid}
                                                        className={`flex items-start p-4 transition-colors ${isFullyImported ? 'opacity-50 bg-muted/40 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'}`}
                                                        onClick={() => !isFullyImported && toggleMainGroup(mg.originalUuid)}
                                                    >
                                                        <Checkbox
                                                            id={`mg-${mg.originalUuid}`}
                                                            checked={selectedMainGroupUuids.has(mg.originalUuid) || isFullyImported}
                                                            disabled={isFullyImported}
                                                            onCheckedChange={() => !isFullyImported && toggleMainGroup(mg.originalUuid)}
                                                            className="mt-1"
                                                        />
                                                        <div className="ml-3 flex-1 min-w-0">
                                                            <label htmlFor={`mg-${mg.originalUuid}`} className={`font-semibold block ${isFullyImported ? '' : 'cursor-pointer'}`}>
                                                                {formatDisplayName(mg.name)}
                                                                {isFullyImported ? (
                                                                    <Badge variant="outline" className="ml-2 bg-muted border-border text-foreground/70 text-[9px] uppercase">Imported</Badge>
                                                                ) : mg.isDuplicate ? (
                                                                    <Badge variant="outline" className="ml-2 bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] uppercase">Update Links</Badge>
                                                                ) : null}
                                                            </label>

                                                            {mg.subgroupNames.length > 0 && (
                                                                <div className="mt-2 pl-3 border-l-2 border-border space-y-1">
                                                                    {mg.subgroupNames.map(sg => {
                                                                        const parsedSg = parsedSubgroups.find(p => p.name === sg);
                                                                        const isSgDup = parsedSg?.isDuplicate;
                                                                        return (
                                                                            <div key={sg} className="flex items-center text-xs text-foreground/70">
                                                                                <span className={`truncate ${isSgDup ? 'line-through opacity-70' : ''}`}>{formatDisplayName(sg)}</span>
                                                                                {isSgDup && <span className="ml-2 text-[10px] text-foreground/70/70">(Will use existing)</span>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="subgroups" className="p-0 m-0">
                                    {parsedSubgroups.length === 0 ? (
                                        <div className="p-8 text-center text-foreground/70 italic">No Subgroups found in this file.</div>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-border/50">
                                            <div className="p-3 bg-blue-900/10 border-b border-border text-xs text-blue-300 px-4">
                                                Select subgroups you want to import independent of Main Groups. You can assign them to your <strong>existing</strong> main groups below.
                                            </div>
                                            <div className="p-2 bg-muted/50 border-b border-border flex flex-wrap gap-2">
                                                <Button variant="secondary" size="sm" onClick={selectAllSubgroups} className="h-7 text-xs bg-muted hover:bg-muted/80 text-foreground">Select All</Button>
                                                <Button variant="secondary" size="sm" onClick={selectCatalogUpdates} className="h-7 text-xs bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border border-amber-500/30">Update Catalogs</Button>
                                                <Button variant="secondary" size="sm" onClick={selectImageUpdates} className="h-7 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30">Update Images</Button>
                                                <Button variant="ghost" size="sm" onClick={deselectAllSubgroups} className="h-7 text-xs text-foreground/70 hover:text-foreground mb-1">Deselect All</Button>
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
                                                            className={`flex items-center p-4 transition-colors ${isDisabled ? 'opacity-50 bg-muted/40' : 'hover:bg-muted/50'}`}
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
                                                                    {sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage && <Badge variant="outline" className="ml-2 bg-muted border-border text-foreground/70 text-[9px] uppercase">Existing</Badge>}
                                                                    {sg.hasNewImage && <Badge variant="default" className="ml-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] uppercase hover:bg-purple-600/30">Update Image</Badge>}
                                                                    {includedInMain && !sg.isDuplicate && <Badge className="ml-2 bg-blue-900/40 text-blue-400 border-blue-900 text-[9px] uppercase">Included w/ Main</Badge>}
                                                                </label>
                                                                <div className="text-[10px] text-foreground/70 mt-0.5">{sg.catalogs.length} {sg.catalogs.length === 1 ? 'Catalog' : 'Catalogs'}</div>
                                                            </div>

                                                            {isSelected && !isDisabled && !sg.isDuplicate && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs bg-muted border-border shrink-0 min-w-[140px] justify-between">
                                                                            <span className="truncate max-w-[100px]">
                                                                                {standaloneAssignments[sg.name] ? formatDisplayName(currentMainGroups[standaloneAssignments[sg.name]]?.name || "Unassigned") : "Unassigned"}
                                                                            </span>
                                                                            <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                                                                        <DropdownMenuItem
                                                                            onClick={() => setStandaloneAssignments(prev => { const n = { ...prev }; delete n[sg.name]; return n; })}
                                                                            className="text-xs focus:bg-amber-500/20 focus:text-amber-400 font-semibold"
                                                                        >
                                                                            None (Unassigned)
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuLabel className="text-[10px] uppercase text-foreground/70 font-bold mt-2">Assign to Current Match</DropdownMenuLabel>
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
                                                                <div className="p-2 bg-muted font-semibold text-xs text-foreground/70 uppercase tracking-wider sticky top-0 z-10 border-y border-y-border">
                                                                    Updates ({mergeSgs.length})
                                                                </div>
                                                                {mergeSgs.map(renderSubgroupRow)}
                                                            </>
                                                        )}
                                                        {newSgs.length > 0 && (
                                                            <>
                                                                <div className="p-2 bg-muted font-semibold text-xs text-foreground/70 uppercase tracking-wider sticky top-0 z-10 border-y border-y-border">
                                                                    New Subgroups ({newSgs.length})
                                                                </div>
                                                                {(() => {
                                                                    // Get unique categories present in newSgs
                                                                    const presentCategories = Array.from(new Set(newSgs.map(sg => sg.category || "Other")));

                                                                    // Sort categories: predefined ones first, then others alphabetically
                                                                    const predefinedOrder = ["Actors", "Directors", "Genres", "Decades", "Awards", "Discover", "Collections", "Streaming Services", "Other"];
                                                                    presentCategories.sort((a, b) => {
                                                                        const idxA = predefinedOrder.indexOf(a);
                                                                        const idxB = predefinedOrder.indexOf(b);
                                                                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                                                        if (idxA !== -1) return -1;
                                                                        if (idxB !== -1) return 1;
                                                                        return a.localeCompare(b);
                                                                    });

                                                                    return presentCategories.map(cat => {
                                                                        const catSgs = newSgs.filter(sg => (sg.category || "Other") === cat);
                                                                        if (catSgs.length === 0) return null;
                                                                        return (
                                                                            <React.Fragment key={cat}>
                                                                                <div className="px-4 py-1.5 bg-background/80 text-[10px] font-bold text-foreground/70 uppercase tracking-widest border-b border-border flex items-center gap-2">
                                                                                    <div className="w-1 h-3 bg-blue-500/50 rounded-full" />
                                                                                    {cat}
                                                                                </div>
                                                                                {catSgs.map(renderSubgroupRow)}
                                                                            </React.Fragment>
                                                                        );
                                                                    });
                                                                })()}
                                                            </>
                                                        )}
                                                        {existingSgs.length > 0 && (
                                                            <>
                                                                <div className="p-2 bg-muted font-semibold text-xs text-foreground/70 uppercase tracking-wider sticky top-0 z-10 border-y border-y-border">
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
                    <Button variant="ghost" onClick={handleClose} className="text-foreground/70 hover:text-foreground">
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

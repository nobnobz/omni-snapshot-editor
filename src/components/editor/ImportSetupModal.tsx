"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/context/ConfigContext";
import { formatDisplayName, cn } from "@/lib/utils";
import { UploadCloud, AlertTriangle, ChevronDown, BookOpen, Search, RefreshCw, Image as ImageIcon, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { decodeConfig } from "@/lib/config-utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editorAction, editorLayout, editorSurface, editorToneBadge, editorNoticeTone } from "@/components/editor/ui/style-contract";
import { FALLBACK_TEMPLATE_URLS, findTemplateByKind, isTemplateOfKind } from "@/lib/template-manifest";

interface ImportSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGuide?: (guide: "install" | "update" | "use") => void;
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

const isPlaceholderSg = (name: string, catalogs: unknown) => {
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

const importSetupTone = {
    warningAction: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/16 hover:border-orange-500/35",
    infoAction: "border-primary/30 bg-primary/10 text-primary dark:text-primary hover:bg-primary/16 hover:border-primary/45",
    warningBadge: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    infoBadge: "border-primary/30 bg-primary/10 text-primary dark:text-primary",
} as const;

const importSetupChipBase =
    "h-7 rounded-full border px-3 text-[11px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 shadow-sm";
const importSetupChipIdle =
    "border-border/80 bg-background/45 text-foreground/78 hover:text-foreground hover:bg-muted/78 hover:border-border/95 hover:shadow-md";
const importSetupChipSelected =
    "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_18px_rgba(0,0,0,0.12)]";
const importSetupStickySurface =
    "border-slate-200/85 bg-white dark:border-white/8 dark:bg-[rgb(23,26,33)]";

export function ImportSetupModal({ isOpen, onClose, onOpenGuide }: ImportSetupModalProps) {
    const { currentValues, importGroups, manifest, fetchManifest } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const subgroupReviewContainerRef = useRef<HTMLDivElement>(null);
    const updateSectionRef = useRef<HTMLElement>(null);
    const newSectionRef = useRef<HTMLElement>(null);
    const existingSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchManifest();
        }
    }, [isOpen, fetchManifest]);

    useEffect(() => {
        if (!isOpen) return;

        const preventNavigationOnDrop: EventListener = (event) => {
            const dragEvent = event as DragEvent;
            if (!dragEvent.dataTransfer) return;
            dragEvent.preventDefault();
            dragEvent.dataTransfer.dropEffect = "copy";
        };

        const targets: EventTarget[] = [window, document, document.documentElement, document.body];
        targets.forEach((target) => {
            target.addEventListener("dragenter", preventNavigationOnDrop, true);
            target.addEventListener("dragover", preventNavigationOnDrop, true);
            target.addEventListener("drop", preventNavigationOnDrop, true);
        });

        return () => {
            targets.forEach((target) => {
                target.removeEventListener("dragenter", preventNavigationOnDrop, true);
                target.removeEventListener("dragover", preventNavigationOnDrop, true);
                target.removeEventListener("drop", preventNavigationOnDrop, true);
            });
        };
    }, [isOpen]);

    const templates: { label: string; url: string }[] = useMemo(() => (
        manifest?.templates?.length
            ? manifest.templates
                .filter((template) => isTemplateOfKind(template, "omni") && !!template.url)
                .map((template) => ({ label: template.name, url: template.url }))
            : [
                {
                    label: "UME Omni Template v2.0.3",
                    url: FALLBACK_TEMPLATE_URLS.omni,
                },
            ]
    ), [manifest]);

    const [selectedVersion, setSelectedVersion] = useState("");

    useEffect(() => {
        if (templates.length === 0) {
            setSelectedVersion("");
            return;
        }

        const defaultTemplate = manifest?.templates?.find((template) => template.isDefault && isTemplateOfKind(template, "omni"))
            || findTemplateByKind(manifest?.templates, "omni");

        if (defaultTemplate?.name && defaultTemplate.url) {
            setSelectedVersion((current) => (current === defaultTemplate.name ? current : defaultTemplate.name));
            return;
        }

        setSelectedVersion((current) => (
            current && templates.some(template => template.label === current)
                ? current
                : templates[0]?.label ?? ""
        ));
    }, [manifest, templates]);

    const [templateLoading, setTemplateLoading] = useState(false);
    const [isFileDropActive, setIsFileDropActive] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState("");

    // State for all imported values (needed for metadata extraction)
    const [importedValues, setImportedValues] = useState<Record<string, unknown>>({});
    const [selectedGlobalKeys, setSelectedGlobalKeys] = useState<Set<string>>(new Set());

    // Parsed Data
    const [parsedMainGroups, setParsedMainGroups] = useState<ParsedMainGroup[]>([]);
    const [parsedSubgroups, setParsedSubgroups] = useState<ParsedSubgroup[]>([]);

    // Selections
    const [selectedMainGroupUuids, setSelectedMainGroupUuids] = useState<Set<string>>(new Set());
    const [selectedMainGroupSubgroups, setSelectedMainGroupSubgroups] = useState<Record<string, string[]>>({});
    const [selectedStandaloneSubgroups, setSelectedStandaloneSubgroups] = useState<Set<string>>(new Set());
    const [selectedCatalogUpdateSubgroups, setSelectedCatalogUpdateSubgroups] = useState<Set<string>>(new Set());
    const [selectedImageUpdateSubgroups, setSelectedImageUpdateSubgroups] = useState<Set<string>>(new Set());
    const [activeReviewTab, setActiveReviewTab] = useState<"subgroups" | "main">("subgroups");
    const [reviewSearch, setReviewSearch] = useState("");

    // assignments: subgroupName -> targetMainGroupUuid (from the CURRENT setup, not the parsed one)
    const [standaloneAssignments, setStandaloneAssignments] = useState<Record<string, string>>({});

    const resetState = () => {
        setStep(1);
        setFileName("");
        setError("");
        setParsedMainGroups([]);
        setParsedSubgroups([]);
        setSelectedMainGroupUuids(new Set());
        setSelectedMainGroupSubgroups({});
        setSelectedStandaloneSubgroups(new Set());
        setSelectedCatalogUpdateSubgroups(new Set());
        setSelectedImageUpdateSubgroups(new Set());
        setActiveReviewTab("subgroups");
        setReviewSearch("");
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
            let imported: Record<string, unknown> = {};

            // Check if it's an OmniConfig (with `.values`) or a raw decoded JSON
            if (rawData.values) {
                // Decode it like we do in ConfigContext
                for (const [key, val] of Object.entries(rawData.values)) {
                    imported[key] = decodeConfig(val);
                }
            } else if (rawData.config) {
                for (const [key, val] of Object.entries(rawData.config)) {
                    imported[key] = decodeConfig(val);
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
                Object.values(currentValues.main_catalog_groups || {})
                    .map((group) => {
                        if (!group || typeof group !== "object") return undefined;
                        const maybeName = (group as { name?: unknown }).name;
                        return typeof maybeName === "string" ? maybeName : undefined;
                    })
                    .filter((name): name is string => !!name)
            );
            const currentSubgroupNames = new Set(
                Object.keys(currentValues.catalog_groups || {})
            );

            // Parse Main Groups
            const inMainGroups = (imported.main_catalog_groups || {}) as Record<string, {
                name?: string;
                subgroupNames?: string[];
                posterType?: string;
                posterSize?: string;
            }>;
            const inMainGroupOrder = (imported.main_group_order as string[] | undefined) || Object.keys(inMainGroups);
            const inCatalogsGroups = (imported.catalog_groups || {}) as Record<string, string[]>;
            const subgroupOrder = (imported.subgroup_order || {}) as Record<string, string[]>;

            const parsedMGs: ParsedMainGroup[] = [];
            for (const uuid of inMainGroupOrder) {
                const group = inMainGroups[uuid];
                if (!group) continue;
                const groupName = group.name || "Unnamed Group";
                parsedMGs.push({
                    originalUuid: uuid,
                    name: groupName,
                    subgroupNames: (subgroupOrder[uuid] || group.subgroupNames || []).filter((sg: string) => !isPlaceholderSg(sg, inCatalogsGroups[sg])),
                    posterType: group.posterType || "Poster",
                    posterSize: group.posterSize || "Default",
                    isDuplicate: currentMainGroupNames.has(groupName)
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
            const inImageUrls = (imported.catalog_group_image_urls || {}) as Record<string, string>;
            const inCatalogGroupOrder = (imported.catalog_group_order as string[] | undefined) || Object.keys(inCatalogsGroups);
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
            Object.entries(currentValues.main_catalog_groups || {}).forEach(([uid, mg]) => {
                if (!mg || typeof mg !== "object") return;
                const maybeName = (mg as { name?: unknown }).name;
                if (typeof maybeName === "string" && maybeName) currentMgByName[maybeName] = uid;
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

        } catch (err: unknown) {
            console.error("Parse error:", err);
            setError(err instanceof Error ? err.message : "Failed to parse JSON file.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isJsonFile(file)) {
            setError("Please drop a valid JSON file.");
            e.target.value = "";
            return;
        }

        processFile(file);
        e.target.value = "";
    };

    const isJsonFile = (file: File) => file.name.toLowerCase().endsWith(".json") || file.type === "application/json";

    const processFile = (file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            processUploadedJson(content);
        };
        reader.readAsText(file);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDropActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (!isJsonFile(file)) {
            setError("Please drop a valid JSON file.");
            return;
        }

        processFile(file);
    };

    const handleImport = () => {
        const payloadMainGroups: Record<string, { name: string; subgroupNames: string[]; posterType: string; posterSize: string }> = {};
        const payloadSubgroups: Record<string, { catalogs?: string[]; imageUrl?: string; overwriteCatalogs?: boolean; overwriteImage?: boolean }> = {};
        const associatedMetadata: {
            custom_catalog_names?: Record<string, string>;
            regex_pattern_image_urls?: Record<string, string>;
            enabled_patterns?: string[];
        } = {};

        // 1. Mark which catalogs we're importing to fetch their metadata later
        const importedCatalogIds = new Set<string>();

        // 2. Gather Selected Main Groups and their nested subgroups
        const subgroupsIncludedViaMainGroups = new Set<string>();

        parsedMainGroups.forEach(mg => {
            if (selectedMainGroupUuids.has(mg.originalUuid)) {
                const selectedSubgroups = selectedMainGroupSubgroups[mg.originalUuid] || mg.subgroupNames;
                if (selectedSubgroups.length === 0) return;

                payloadMainGroups[mg.originalUuid] = {
                    name: mg.name,
                    subgroupNames: selectedSubgroups,
                    posterType: mg.posterType,
                    posterSize: mg.posterSize
                };

                selectedSubgroups.forEach(sgName => {
                    subgroupsIncludedViaMainGroups.add(sgName);
                    const parsedSg = parsedSubgroups.find(s => s.name === sgName);
                    if (parsedSg) {
                        const shouldOverwriteCatalogs = !parsedSg.isDuplicate || selectedCatalogUpdateSubgroups.has(sgName);
                        const shouldOverwriteImage = !parsedSg.isDuplicate
                            ? !!parsedSg.imageUrl
                            : selectedImageUpdateSubgroups.has(sgName);
                        const catalogsToImport = shouldOverwriteCatalogs ? parsedSg.catalogs : undefined;
                        const imageToImport = shouldOverwriteImage ? parsedSg.imageUrl : undefined;

                        if (!parsedSg.isDuplicate || shouldOverwriteCatalogs || shouldOverwriteImage) {
                            payloadSubgroups[sgName] = {
                                catalogs: catalogsToImport,
                                imageUrl: imageToImport,
                                overwriteCatalogs: shouldOverwriteCatalogs,
                                overwriteImage: shouldOverwriteImage
                            };
                        }

                        if (shouldOverwriteCatalogs) {
                            catalogsToImport?.forEach(cId => importedCatalogIds.add(cId));
                        }
                    }
                });
            }
        });

        // 3. Gather Standalone Subgroups
        parsedSubgroups.forEach(sg => {
            const shouldOverwriteCatalogs = sg.isDuplicate
                ? selectedCatalogUpdateSubgroups.has(sg.name)
                : selectedStandaloneSubgroups.has(sg.name);
            const shouldOverwriteImage = sg.isDuplicate
                ? selectedImageUpdateSubgroups.has(sg.name)
                : selectedStandaloneSubgroups.has(sg.name) && !!sg.imageUrl;

            if ((shouldOverwriteCatalogs || shouldOverwriteImage) && !subgroupsIncludedViaMainGroups.has(sg.name)) {
                payloadSubgroups[sg.name] = {
                    catalogs: shouldOverwriteCatalogs ? sg.catalogs : undefined,
                    imageUrl: shouldOverwriteImage ? sg.imageUrl : undefined,
                    overwriteCatalogs: shouldOverwriteCatalogs,
                    overwriteImage: shouldOverwriteImage
                };
                if (shouldOverwriteCatalogs) {
                    sg.catalogs.forEach(cId => importedCatalogIds.add(cId));
                }
            }
        });

        // 4. Capture Associated Metadata (Custom Names, Images, Patterns)
        if (importedCatalogIds.size > 0) {
            const customCatalogNames: Record<string, string> = {};
            const regexPatternImageUrls: Record<string, string> = {};
            const enabledPatterns = new Set<string>();

            const inCustomNames = (importedValues.custom_catalog_names || {}) as Record<string, string>;
            const inImageUrls = (importedValues.regex_pattern_image_urls || {}) as Record<string, string>;
            const inAutoPlay = Array.isArray(importedValues.auto_play_enabled_patterns)
                ? (importedValues.auto_play_enabled_patterns as string[])
                : [];
            const inTagEnabled = Array.isArray(importedValues.pattern_tag_enabled_patterns)
                ? (importedValues.pattern_tag_enabled_patterns as string[])
                : [];

            importedCatalogIds.forEach(id => {
                if (inCustomNames[id]) customCatalogNames[id] = inCustomNames[id];
                if (inImageUrls[id]) regexPatternImageUrls[id] = inImageUrls[id];

                // Regex patterns usually target catalog IDs either directly or via substring in their rules
                // But for simplicity and safety, we also look for patterns named like the catalogs
                // and check the enabled lists
                if (inAutoPlay.includes(id)) enabledPatterns.add(id);
                if (inTagEnabled.includes(id)) enabledPatterns.add(id);
            });

            // Convert set to array for payload
            associatedMetadata.custom_catalog_names = customCatalogNames;
            associatedMetadata.regex_pattern_image_urls = regexPatternImageUrls;
            associatedMetadata.enabled_patterns = Array.from(enabledPatterns);
        }

        // 5. Global Settings
        const globalSettings: Record<string, unknown> = {};
        selectedGlobalKeys.forEach(key => {
            if (importedValues[key] !== undefined) {
                globalSettings[key] = importedValues[key];
            }
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
            setSelectedMainGroupSubgroups(prev => {
                const nextSubgroups = { ...prev };
                delete nextSubgroups[uuid];
                return nextSubgroups;
            });
        } else {
            next.add(uuid);
            if (mg) {
                setSelectedMainGroupSubgroups(prev => ({
                    ...prev,
                    [uuid]: [...mg.subgroupNames]
                }));
            }
        }
        setSelectedMainGroupUuids(next);
    };

    const toggleMainGroupSubgroup = (uuid: string, subgroupName: string) => {
        const mg = parsedMainGroups.find(group => group.originalUuid === uuid);
        if (!mg) return;

        const isMainSelected = selectedMainGroupUuids.has(uuid);
        const currentSelection = selectedMainGroupSubgroups[uuid] || mg.subgroupNames;

        if (!isMainSelected) {
            setSelectedMainGroupUuids(prev => new Set(prev).add(uuid));
            setSelectedMainGroupSubgroups(prev => ({
                ...prev,
                [uuid]: [subgroupName]
            }));
            return;
        }

        const nextSelection = currentSelection.includes(subgroupName)
            ? currentSelection.filter(name => name !== subgroupName)
            : [...currentSelection, subgroupName];

        if (nextSelection.length === 0) {
            setSelectedMainGroupUuids(prev => {
                const next = new Set(prev);
                next.delete(uuid);
                return next;
            });
            setSelectedMainGroupSubgroups(prev => {
                const next = { ...prev };
                delete next[uuid];
                return next;
            });
            return;
        }

        setSelectedMainGroupSubgroups(prev => ({
            ...prev,
            [uuid]: nextSelection
        }));
    };

    const toggleStandaloneSubgroup = (name: string, isDisabled: boolean) => {
        if (isDisabled) return;
        const next = new Set(selectedStandaloneSubgroups);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setSelectedStandaloneSubgroups(next);
    };

    const toggleCatalogUpdate = (name: string) => {
        const next = new Set(selectedCatalogUpdateSubgroups);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setSelectedCatalogUpdateSubgroups(next);
    };

    const toggleImageUpdate = (name: string) => {
        const next = new Set(selectedImageUpdateSubgroups);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setSelectedImageUpdateSubgroups(next);
    };

    // Bulk Actions Main Groups
    const selectAllMain = () => {
        const next = new Set<string>();
        const nextSubgroups: Record<string, string[]> = {};
        parsedMainGroups.forEach(mg => {
            if (!mg.isDuplicate || mg.hasChanges) {
                next.add(mg.originalUuid);
                nextSubgroups[mg.originalUuid] = [...mg.subgroupNames];
            }
        });
        setSelectedMainGroupUuids(next);
        setSelectedMainGroupSubgroups(nextSubgroups);
    };

    const deselectAllMain = () => {
        setSelectedMainGroupUuids(new Set());
        setSelectedMainGroupSubgroups({});
    };

    // Bulk Actions Subgroups
    const selectAllUpdates = () => {
        const nextCatalogs = new Set<string>();
        const nextImages = new Set<string>();
        parsedSubgroups.forEach(sg => {
            if (!sg.isDuplicate) return;

            if (sg.hasNewCatalogs) nextCatalogs.add(sg.name);
            if (sg.hasNewImage) nextImages.add(sg.name);
        });
        setSelectedCatalogUpdateSubgroups(nextCatalogs);
        setSelectedImageUpdateSubgroups(nextImages);
    };

    const clearUpdateSelection = () => {
        setSelectedCatalogUpdateSubgroups(new Set());
        setSelectedImageUpdateSubgroups(new Set());
    };

    const selectAllNewSubgroups = () => {
        setSelectedStandaloneSubgroups(prev => {
            const next = new Set(prev);
            parsedSubgroups.forEach(sg => {
                if (sg.isDuplicate) return;
                if (isSubgroupIncludedViaSelectedMainGroup(sg.name)) return;
                next.add(sg.name);
            });
            return next;
        });
    };

    const deselectAllNewSubgroups = () => {
        setSelectedStandaloneSubgroups(prev => {
            const next = new Set(prev);
            parsedSubgroups.forEach(sg => {
                if (!sg.isDuplicate) {
                    next.delete(sg.name);
                }
            });
            return next;
        });
    };

    const selectCatalogUpdates = () => {
        const next = new Set(selectedCatalogUpdateSubgroups);
        parsedSubgroups.forEach(sg => {
            if (sg.isDuplicate && sg.hasNewCatalogs) {
                next.add(sg.name);
            }
        });
        setSelectedCatalogUpdateSubgroups(next);
    };

    const selectImageUpdates = () => {
        const next = new Set(selectedImageUpdateSubgroups);
        parsedSubgroups.forEach(sg => {
            if (sg.isDuplicate && sg.hasNewImage) {
                next.add(sg.name);
            }
        });
        setSelectedImageUpdateSubgroups(next);
    };

    const currentMainGroups = currentValues.main_catalog_groups || {};
    const currentMainGroupOrder = currentValues.main_group_order || [];
    const isSubgroupIncludedViaSelectedMainGroup = (name: string) =>
        parsedMainGroups.some(mg => {
            if (!selectedMainGroupUuids.has(mg.originalUuid)) return false;
            const selectedSubgroups = selectedMainGroupSubgroups[mg.originalUuid] || mg.subgroupNames;
            return selectedSubgroups.includes(name);
        });

    const normalizedReviewSearch = reviewSearch.trim().toLowerCase();
    const matchesReviewSearch = (...values: Array<string | undefined>) => {
        if (!normalizedReviewSearch) return true;
        return values.some(value => value?.toLowerCase().includes(normalizedReviewSearch));
    };

    const filteredMainGroups = parsedMainGroups.filter(mg =>
        matchesReviewSearch(
            mg.name,
            ...mg.subgroupNames,
        )
    );

    const filteredSubgroups = parsedSubgroups.filter(sg =>
        matchesReviewSearch(
            sg.name,
            sg.category,
            ...sg.catalogs,
        )
    );

    const filteredNewSubgroups = useMemo(
        () => filteredSubgroups.filter((sg) => !sg.isDuplicate),
        [filteredSubgroups]
    );
    const filteredUpdatedSubgroups = useMemo(
        () => filteredSubgroups.filter((sg) => sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage)),
        [filteredSubgroups]
    );
    const filteredExistingSubgroups = useMemo(
        () => filteredSubgroups.filter((sg) => sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage),
        [filteredSubgroups]
    );

    const scrollToSubgroupReviewSection = (section: "updates" | "new" | "existing") => {
        const container = subgroupReviewContainerRef.current;
        const target = section === "updates"
            ? updateSectionRef.current
            : section === "new"
                ? newSectionRef.current
                : existingSectionRef.current;

        if (!container || !target) return;

        const nextTop = Math.max(target.offsetTop - 8, 0);
        container.scrollTo({ top: nextTop, behavior: "smooth" });
    };

    const totalSelectedSubgroups = new Set([
        ...selectedStandaloneSubgroups,
        ...selectedCatalogUpdateSubgroups,
        ...selectedImageUpdateSubgroups,
    ]).size;
    const totalSelectedToImport = selectedMainGroupUuids.size + totalSelectedSubgroups;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(editorLayout.dialogContent, "sm:max-w-2xl sm:max-h-[85vh]")}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>Update From Existing Setup</DialogTitle>
                    <DialogDescription className="text-foreground/70">
                        {step === 1 ? "Upload a Omni .json configuration to extract groups." : `Review and select groups from ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                        {/* Hint Box */}
                        <div className={cn("rounded-xl p-4 text-sm flex gap-4 items-start shadow-sm border mb-2", editorNoticeTone.warning)}>
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                            <div className="flex flex-col items-start gap-y-1 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 w-full">
                                <p className="leading-relaxed font-semibold">
                                    Updating your setup for the first time?
                                </p>
                                {onOpenGuide && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenGuide("update")}
                                        className="h-8 px-3 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 -ml-2 sm:ml-0"
                                    >
                                        <BookOpen className="w-3.5 h-3.5 mr-2" />
                                        How to Update
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Template Loader */}
                        <div className={cn(editorSurface.card, "p-5")}>
                            <h3 className="font-semibold text-sm text-foreground mb-3">Load Unified Media Experience Template</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <div className="min-w-0 flex-1">
                                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                                        <SelectTrigger
                                            className={cn("w-full h-10 sm:h-9 rounded-md px-2.5 sm:px-3 text-sm text-foreground font-medium overflow-hidden", editorSurface.field)}
                                            title={selectedVersion || "Select template version"}
                                            disabled={templates.length === 0}
                                        >
                                            <SelectValue className="truncate" placeholder="Select template version" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map(t => (
                                                <SelectItem key={t.label} value={t.label} className="text-xs font-mono focus:bg-accent focus:text-accent-foreground">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                        } catch (err: unknown) {
                                            setError(err instanceof Error ? err.message : "Failed to load template.");
                                        } finally {
                                            setTemplateLoading(false);
                                        }
                                    }}
                                    disabled={templateLoading || templates.length === 0 || !selectedVersion}
                                    className="h-10 sm:h-9 w-full sm:w-auto px-4 sm:px-5 bg-primary hover:bg-primary/92 text-primary-foreground"
                                >
                                    {templateLoading ? "Loading..." : "Load"}
                                </Button>
                            </div>
                            {templates.length === 0 && (
                                <p className="mt-3 text-xs text-foreground/60">
                                    No UME templates are available right now. You can still upload a local config file below.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border"></div>
                            <span className="text-xs text-foreground/70 uppercase font-bold tracking-wider">or upload file</span>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>

                        {/* File Upload */}
                        <div
                            onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsFileDropActive(true);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsFileDropActive(true);
                                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                                setIsFileDropActive(false);
                            }}
                            onDrop={handleFileDrop}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 border-2 rounded-lg transition-[border-color,background-color,box-shadow] text-center",
                                editorSurface.dropzone,
                                isFileDropActive
                                    ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
                                    : "hover:border-primary/30 hover:bg-primary/[0.035]"
                            )}
                        >
                            <UploadCloud className={cn("w-10 h-10 mb-3 transition-colors", isFileDropActive ? "text-primary" : "text-foreground/65")} />
                            <h3 className="font-medium text-sm text-foreground mb-4">Upload JSON file</h3>
                            <div className={cn("mb-4 text-xs font-semibold transition-colors", isFileDropActive ? "text-primary" : "text-foreground/60")}>
                                Drop file here
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-muted border-border hover:bg-muted/80 text-foreground text-xs font-semibold">
                                Select file
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
                            <div className={cn("flex items-center border text-sm px-3 py-2 rounded", editorNoticeTone.danger)}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <Tabs value={activeReviewTab} onValueChange={(value) => setActiveReviewTab(value as "subgroups" | "main")} className="w-full flex-1 min-h-0 flex flex-col">
                        <TabsList className={cn(editorSurface.toolbar, "grid w-full grid-cols-2 p-1 h-11 rounded-xl shrink-0")}>
                            <TabsTrigger
                                value="subgroups"
                                className="rounded-lg border border-transparent text-xs font-medium transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out data-[state=active]:border-primary/24 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:border-primary/24 dark:data-[state=active]:bg-primary/18"
                            >
                                Subgroups ({parsedSubgroups.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="main"
                                className="rounded-lg border border-transparent text-xs font-medium transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out data-[state=active]:border-primary/24 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:border-primary/24 dark:data-[state=active]:bg-primary/18"
                            >
                                Main Groups ({parsedMainGroups.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 relative shrink-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                            <Input
                                value={reviewSearch}
                                onChange={(e) => setReviewSearch(e.target.value)}
                                placeholder={activeReviewTab === "subgroups" ? "Search subgroups, categories or catalog IDs..." : "Search main groups or linked subgroups..."}
                                className={cn(editorSurface.field, "h-10 pl-9")}
                            />
                        </div>

                        {activeReviewTab === "subgroups" && [filteredUpdatedSubgroups.length, filteredNewSubgroups.length, filteredExistingSubgroups.length].filter(Boolean).length > 1 ? (
                            <div className={cn(editorSurface.cardInteractive, "mt-3 flex shrink-0 items-center gap-2 rounded-xl px-3 py-2")}>
                                {filteredUpdatedSubgroups.length > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => scrollToSubgroupReviewSection("updates")}
                                        className={cn(importSetupChipBase, importSetupChipIdle, "px-2.5")}
                                    >
                                        Updates ({filteredUpdatedSubgroups.length})
                                    </Button>
                                ) : null}
                                {filteredNewSubgroups.length > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => scrollToSubgroupReviewSection("new")}
                                        className={cn(importSetupChipBase, importSetupChipIdle, "px-2.5")}
                                    >
                                        New ({filteredNewSubgroups.length})
                                    </Button>
                                ) : null}
                                {filteredExistingSubgroups.length > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => scrollToSubgroupReviewSection("existing")}
                                        className={cn(importSetupChipBase, importSetupChipIdle, "px-2.5")}
                                    >
                                        Existing ({filteredExistingSubgroups.length})
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}

                        <div
                            ref={activeReviewTab === "subgroups" ? subgroupReviewContainerRef : undefined}
                            className={cn(editorSurface.card, "relative mt-4 flex-1 min-h-0 overflow-x-hidden overflow-y-auto custom-scrollbar")}
                        >
                            <div className="h-full">
                                <TabsContent value="main" className="p-0 m-0">
                                    {parsedMainGroups.length === 0 ? (
                                        <div className="p-8 text-center text-foreground/70 italic">No Main Groups found in this file.</div>
                                    ) : filteredMainGroups.length === 0 ? (
                                        <div className="p-8 text-center text-foreground/70 italic">No main groups match your search.</div>
                                    ) : (
                                        <div className="flex flex-col divide-y divide-border/50">
                                            <div className={cn(importSetupStickySurface, "rounded-none border-x-0 border-t-0 shadow-none flex items-center justify-end gap-2 px-4 py-3")}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={selectAllMain}
                                                    className={cn(importSetupChipBase, importSetupChipIdle, "px-2.5")}
                                                >
                                                    All
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={deselectAllMain}
                                                    className={cn(importSetupChipBase, importSetupChipIdle, "px-2.5")}
                                                >
                                                    None
                                                </Button>
                                            </div>
                                            {filteredMainGroups.map(mg => {
                                                const isFullyImported = mg.isDuplicate && !mg.hasChanges;
                                                const isSelected = selectedMainGroupUuids.has(mg.originalUuid);
                                                const selectedSubgroups = isSelected
                                                    ? (selectedMainGroupSubgroups[mg.originalUuid] || mg.subgroupNames)
                                                    : [];
                                                return (
                                                    <div
                                                        key={mg.originalUuid}
                                                        className={cn(
                                                            "flex items-start p-4 transition-colors",
                                                            isSelected
                                                                ? "bg-primary/10 dark:bg-primary/16"
                                                                : isFullyImported
                                                                    ? "opacity-55 bg-muted/[0.04]"
                                                                    : "hover:bg-primary/6 dark:hover:bg-primary/10"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`mg-${mg.originalUuid}`}
                                                            checked={isSelected || isFullyImported}
                                                            disabled={isFullyImported}
                                                            onCheckedChange={() => !isFullyImported && toggleMainGroup(mg.originalUuid)}
                                                            className="mt-1"
                                                        />
                                                        <div className="ml-3 flex-1 min-w-0">
                                                            <label htmlFor={`mg-${mg.originalUuid}`} className={`font-semibold block ${isFullyImported ? '' : 'cursor-pointer'}`}>
                                                                {formatDisplayName(mg.name)}
                                                                {isFullyImported ? (
                                                                    <Badge variant="outline" className={cn("ml-2 text-xs uppercase", editorToneBadge.neutral)}>Imported</Badge>
                                                                ) : mg.isDuplicate ? (
                                                                    <Badge variant="outline" className={cn("ml-2 text-xs uppercase", importSetupTone.warningBadge)}>Update</Badge>
                                                                ) : null}
                                                            </label>
                                                            {mg.subgroupNames.length > 0 && (
                                                                <div className="mt-1 text-xs text-foreground/60">
                                                                    {selectedSubgroups.length} of {mg.subgroupNames.length} subgroups selected
                                                                </div>
                                                            )}

                                                            {mg.subgroupNames.length > 0 && (
                                                                <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
                                                                    {mg.subgroupNames.map(sg => {
                                                                        const parsedSg = parsedSubgroups.find(p => p.name === sg);
                                                                        const isSgDup = parsedSg?.isDuplicate;
                                                                        const hasSgCatalogUpdate = !!parsedSg?.hasNewCatalogs;
                                                                        const hasSgImageUpdate = !!parsedSg?.hasNewImage;
                                                                        const hasSgUpdate = hasSgCatalogUpdate || hasSgImageUpdate;
                                                                        const isSgSelected = isSelected && selectedSubgroups.includes(sg);
                                                                        return (
                                                                            <div key={sg} className="flex items-start gap-2 text-xs">
                                                                                <Checkbox
                                                                                    checked={isSgSelected}
                                                                                    disabled={isFullyImported}
                                                                                    onCheckedChange={() => !isFullyImported && toggleMainGroupSubgroup(mg.originalUuid, sg)}
                                                                                    className="mt-0.5"
                                                                                />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className={cn("truncate text-foreground/80", !isSgSelected && "text-foreground/55")}>
                                                                                        {formatDisplayName(sg)}
                                                                                    </div>
                                                                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground/55">
                                                                                        {isSgDup && !hasSgUpdate && <span>Use existing subgroup</span>}
                                                                                        {isSgDup && hasSgCatalogUpdate && <span className="text-orange-400/90">Catalog changes</span>}
                                                                                        {isSgDup && hasSgImageUpdate && <span className="text-primary/90">Image changes</span>}
                                                                                        {!isSgDup && <span>New subgroup</span>}
                                                                                    </div>
                                                                                </div>
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
                                    ) : filteredSubgroups.length === 0 ? (
                                        <div className="p-8 text-center text-foreground/70 italic">No subgroups match your search.</div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {(() => {
                                                const newSgs = filteredNewSubgroups;
                                                const mergeSgs = filteredUpdatedSubgroups;
                                                const existingSgs = filteredExistingSubgroups;

                                                const renderSubgroupRow = (sg: ParsedSubgroup) => {
                                                    const isStandaloneSelected = selectedStandaloneSubgroups.has(sg.name);
                                                    const isCatalogUpdateSelected = selectedCatalogUpdateSubgroups.has(sg.name);
                                                    const isImageUpdateSelected = selectedImageUpdateSubgroups.has(sg.name);
                                                    const includedInMain = isSubgroupIncludedViaSelectedMainGroup(sg.name);
                                                    const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage;
                                                    const isUpdateRow = sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage);
                                                    const isIncludedWithMain = includedInMain && !sg.isDuplicate;
                                                    const hasAnyDuplicateUpdateSelection = isCatalogUpdateSelected || isImageUpdateSelected;
                                                    const isCheckboxDisabled = isFullyExisting || isIncludedWithMain;
                                                    const isChecked = includedInMain ? true : isStandaloneSelected;
                                                    const isSelected = isUpdateRow ? hasAnyDuplicateUpdateSelection : isChecked;
                                                    const showCheckbox = !sg.isDuplicate;
                                                    const metaBits = [
                                                        `${sg.catalogs.length} ${sg.catalogs.length === 1 ? "catalog" : "catalogs"}`,
                                                        sg.category,
                                                    ].filter(Boolean);

                                                    if (isUpdateRow) {
                                                        const selectedUpdateCount = Number(isCatalogUpdateSelected) + Number(isImageUpdateSelected);
                                                        const selectionSummary = selectedUpdateCount === 0
                                                            ? "Choose updates"
                                                            : selectedUpdateCount === 1
                                                                ? "1 update selected"
                                                                : "2 updates selected";

                                                        return (
                                                            <div
                                                                key={sg.name}
                                                                className={cn(
                                                                    "px-4 py-3 transition-[background-color,box-shadow] duration-150",
                                                                    isSelected
                                                                        ? "bg-primary/[0.035] shadow-[inset_3px_0_0_rgba(59,130,246,0.34)]"
                                                                        : "hover:bg-primary/6 dark:hover:bg-primary/10"
                                                                )}
                                                            >
                                                                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-sm font-semibold text-foreground">
                                                                            {formatDisplayName(sg.name)}
                                                                        </div>
                                                                        <div className="mt-0.5 text-xs text-foreground/65">
                                                                            {[...metaBits, selectionSummary].join(" • ")}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                                        {sg.hasNewCatalogs && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => toggleCatalogUpdate(sg.name)}
                                                                                className={cn(
                                                                                    importSetupChipBase,
                                                                                    isCatalogUpdateSelected
                                                                                        ? importSetupTone.warningAction
                                                                                        : importSetupChipIdle,
                                                                                    isCatalogUpdateSelected && importSetupChipSelected
                                                                                )}
                                                                                aria-pressed={isCatalogUpdateSelected}
                                                                            >
                                                                                <RefreshCw className="mr-1.5 h-3 w-3" />
                                                                                Catalogs
                                                                            </Button>
                                                                        )}
                                                                        {sg.hasNewImage && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => toggleImageUpdate(sg.name)}
                                                                                className={cn(
                                                                                    importSetupChipBase,
                                                                                    isImageUpdateSelected
                                                                                        ? importSetupTone.infoAction
                                                                                        : importSetupChipIdle,
                                                                                    isImageUpdateSelected && importSetupChipSelected
                                                                                )}
                                                                                aria-pressed={isImageUpdateSelected}
                                                                            >
                                                                                <ImageIcon className="mr-1.5 h-3 w-3" />
                                                                                Image
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={sg.name}
                                                            className={cn(
                                                                "flex items-start p-4 transition-colors",
                                                                isSelected
                                                                    ? "bg-primary/[0.055] ring-1 ring-inset ring-primary/15"
                                                                    : isCheckboxDisabled
                                                                        ? "opacity-55 bg-muted/[0.04]"
                                                                        : "hover:bg-primary/6 dark:hover:bg-primary/10"
                                                            )}
                                                        >
                                                            {showCheckbox ? (
                                                                <Checkbox
                                                                    id={`sg-${sg.name}`}
                                                                    checked={isChecked}
                                                                    disabled={isCheckboxDisabled}
                                                                    onCheckedChange={() => toggleStandaloneSubgroup(sg.name, isCheckboxDisabled)}
                                                                    className="mt-1"
                                                                />
                                                            ) : null}
                                                            <div className={cn("flex-1 min-w-0 pr-4", showCheckbox ? "ml-3" : "")}>
                                                                <label htmlFor={`sg-${sg.name}`} className={`font-semibold text-sm block truncate ${isCheckboxDisabled ? '' : 'cursor-pointer'}`}>
                                                                    {formatDisplayName(sg.name)}
                                                                    {includedInMain && !sg.isDuplicate && <Badge variant="outline" className={cn("ml-2 text-xs uppercase", importSetupTone.infoBadge)}>Included w/ Main</Badge>}
                                                                </label>
                                                                <div className="mt-0.5 text-xs text-foreground/65">
                                                                    {metaBits.join(" • ")}
                                                                </div>

                                                            </div>

                                                            {isStandaloneSelected && !isCheckboxDisabled && !sg.isDuplicate && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="h-7 text-xs bg-muted border-border shrink-0 min-w-[140px] justify-between">
                                                                            <span className="truncate max-w-[100px]">
                                                                                {standaloneAssignments[sg.name] ? formatDisplayName(currentMainGroups[standaloneAssignments[sg.name]]?.name || "Unassigned") : "Unassigned"}
                                                                            </span>
                                                                            <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem
                                                                            onClick={() => setStandaloneAssignments(prev => { const n = { ...prev }; delete n[sg.name]; return n; })}
                                                                            className="text-xs focus:bg-amber-500/20 focus:text-amber-400 font-semibold"
                                                                        >
                                                                            None (Unassigned)
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuLabel className="text-xs uppercase text-foreground/70 font-bold mt-2">Assign to Current Match</DropdownMenuLabel>
                                                                        {currentMainGroupOrder.map((uuid: string) => (
                                                                            <DropdownMenuItem
                                                                                key={uuid}
                                                                                onClick={() => setStandaloneAssignments(prev => ({ ...prev, [sg.name]: uuid }))}
                                                                                className="text-xs focus:bg-primary/20 focus:text-primary"
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
                                                            <section ref={updateSectionRef} className="flex flex-col">
                                                                <div className={cn(importSetupStickySurface, "sticky top-0 z-30 -mx-px rounded-none border-x-0 border-t-0 flex items-center justify-between gap-3 px-4 py-3 shadow-none")}>
                                                                    <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                                                                        Updates ({mergeSgs.length})
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className={cn(importSetupChipBase, importSetupChipIdle, "h-7 px-2.5 text-[11px] font-medium")}
                                                                            >
                                                                                Bulk actions
                                                                                <ChevronDown className="ml-1.5 h-3 w-3 opacity-60" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-44">
                                                                            <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-foreground/55">
                                                                                Update selection
                                                                            </DropdownMenuLabel>
                                                                            <DropdownMenuItem onClick={selectAllUpdates} className="text-sm">
                                                                                <Check className="mr-2 h-3.5 w-3.5" />
                                                                                Select all updates
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={selectCatalogUpdates} className="text-sm">
                                                                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                                                                Add catalog updates
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={selectImageUpdates} className="text-sm">
                                                                                <ImageIcon className="mr-2 h-3.5 w-3.5" />
                                                                                Add image updates
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={clearUpdateSelection} className="text-sm">
                                                                                <X className="mr-2 h-3.5 w-3.5" />
                                                                                Clear selection
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="divide-y divide-border/50">
                                                                    {mergeSgs.map(renderSubgroupRow)}
                                                                </div>
                                                            </section>
                                                        )}
                                                        {newSgs.length > 0 && (
                                                            <section ref={newSectionRef} className="flex flex-col">
                                                                <div className={cn(importSetupStickySurface, "sticky top-0 z-20 -mx-px rounded-none border-x-0 border-t-0 flex items-center justify-between gap-3 px-4 py-2 shadow-none")}>
                                                                    <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                                                                        New Subgroups ({newSgs.length})
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={selectAllNewSubgroups}
                                                                            className={cn(importSetupChipBase, importSetupChipIdle, "h-7 px-2.5 text-[11px] font-medium")}
                                                                        >
                                                                            All
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={deselectAllNewSubgroups}
                                                                            className={cn(importSetupChipBase, importSetupChipIdle, "h-7 px-2.5 text-[11px] font-medium")}
                                                                        >
                                                                            None
                                                                        </Button>
                                                                    </div>
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
                                                                                <div className={cn(importSetupStickySurface, "-mx-px rounded-none border-x-0 border-t-0 flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground/70 shadow-none")}>
                                                                                    <div className="w-1 h-3 bg-primary/50 rounded-full" />
                                                                                    {cat}
                                                                                </div>
                                                                                {catSgs.map(renderSubgroupRow)}
                                                                            </React.Fragment>
                                                                        );
                                                                    });
                                                                })()}
                                                            </section>
                                                        )}
                                                        {existingSgs.length > 0 && (
                                                            <section ref={existingSectionRef} className="flex flex-col">
                                                                <div className={cn(importSetupStickySurface, "sticky top-0 z-20 -mx-px rounded-none border-x-0 border-t-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/70 shadow-none")}>
                                                                    Existing ({existingSgs.length})
                                                                </div>
                                                                <div className="divide-y divide-border/50">
                                                                    {existingSgs.map(renderSubgroupRow)}
                                                                </div>
                                                            </section>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </TabsContent>

                            </div>
                        </div>
                    </Tabs>
                )}

                <DialogFooter className="mt-4 shrink-0 border-t border-border/50 pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex-row justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} className={cn(editorAction.secondary, editorSurface.field, "h-10")}>
                        Cancel
                    </Button>
                    {step === 2 && (
                        <Button
                            onClick={handleImport}
                            disabled={totalSelectedToImport === 0}
                            className={cn(editorAction.primary, "font-bold bg-primary hover:bg-primary/92 text-primary-foreground shadow-lg shadow-primary/20")}
                        >
                            Import ({totalSelectedToImport})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

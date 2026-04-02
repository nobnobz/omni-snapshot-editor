"use client";

import React, { startTransition, useDeferredValue, useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { UploadCloud, ChevronDown, BookOpen, Search, Check } from "lucide-react";
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
import { editorAction, editorLayout, editorSurface, editorToneBadge } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";
import { FALLBACK_TEMPLATE_URLS, findTemplateByKind, isTemplateOfKind } from "@/lib/template-manifest";
import {
    classifyImportSetupMainGroupSubgroups,
    hasImportSetupCatalogsChanged,
    hasImportSetupImageChanged,
    normalizeImportSetupImageUrl,
} from "@/lib/import-setup-diff";
import { normalizeMainGroupOrder } from "@/lib/main-group-utils";
import { fetchTextWithLimits } from "@/lib/remote-fetch";

interface ImportSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGuide?: (guide: "install" | "update" | "use") => void;
}

interface ParsedMainGroup {
    originalUuid: string;
    name: string;
    subgroupNames: string[];
    basicNewSubgroupNames: string[];
    basicUpdatedSubgroupNames: string[];
    posterType: string;
    posterSize: string;
    isDuplicate: boolean;
    basicNewSubgroupCount: number;
    basicUpdatedSubgroupCount: number;
    hasChanges?: boolean;
}

interface ParsedSubgroup {
    name: string;
    catalogs: string[];
    imageUrl?: string;
    isDuplicate: boolean;
    basicIsExisting: boolean;
    matchedExistingName?: string;
    hasRename?: boolean;
    hasNewImage?: boolean;
    hasNewCatalogs?: boolean;
    parentGroupNames?: string[];
    category?: string;
}

const isPlaceholderSg = (name: string, catalogs: unknown) => {
    if (isIgnoredUpdateManagerSubgroup(name)) return true;
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

const getSubgroupContextLabel = (subgroup: ParsedSubgroup) => {
    if (subgroup.parentGroupNames && subgroup.parentGroupNames.length > 0) {
        const [firstGroupName, ...remainingGroupNames] = subgroup.parentGroupNames;
        return remainingGroupNames.length > 0
            ? `${formatDisplayName(firstGroupName)} +${remainingGroupNames.length}`
            : formatDisplayName(firstGroupName);
    }

    if (subgroup.category && subgroup.category !== "Other") {
        return subgroup.category;
    }

    return undefined;
};

const normalizeUpdateManagerSubgroupName = (name: string) =>
    name.replace(/\uFE0F/g, "").trim();

const isIgnoredUpdateManagerSubgroup = (name: string) =>
    /^\s*[!❗]\s*\[[^\]]+\]\s*$/u.test(normalizeUpdateManagerSubgroupName(name));

const buildCatalogSignature = (catalogs: string[]) =>
    JSON.stringify([...catalogs].sort((a, b) => a.localeCompare(b)));

const secondaryFilterRailClass =
    "inline-flex items-center gap-1.5 self-start rounded-full border border-border/60 bg-background/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-white/[0.035] dark:border-white/10";

const secondaryFilterButtonClass =
    "h-8 rounded-full px-3 text-[11px] font-semibold tracking-tight transition-colors";

type ImportedMainGroupSelection = {
    name: string;
    subgroupNames: string[];
    posterType: string;
    posterSize: string;
};

type ImportedSubgroupSelection = {
    catalogs: string[];
    imageUrl?: string;
    renameFrom?: string;
    overwriteCatalogs?: boolean;
    overwriteImage?: boolean;
};

export function ImportSetupModal({ isOpen, onClose, onOpenGuide }: ImportSetupModalProps) {
    const { currentValues, importGroups, manifest, fetchManifest } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragDepthRef = useRef(0);

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

    // Parsed Data
    const [parsedMainGroups, setParsedMainGroups] = useState<ParsedMainGroup[]>([]);
    const [parsedSubgroups, setParsedSubgroups] = useState<ParsedSubgroup[]>([]);

    // Selections
    const [selectedMainGroupUuids, setSelectedMainGroupUuids] = useState<Set<string>>(new Set());
    const [selectedMainGroupSubgroups, setSelectedMainGroupSubgroups] = useState<Record<string, string[]>>({});
    const [selectedStandaloneSubgroups, setSelectedStandaloneSubgroups] = useState<Set<string>>(new Set());
    const [selectedCatalogUpdateSubgroups, setSelectedCatalogUpdateSubgroups] = useState<Set<string>>(new Set());
    const [selectedImageUpdateSubgroups, setSelectedImageUpdateSubgroups] = useState<Set<string>>(new Set());
    const [selectedRenameUpdateSubgroups, setSelectedRenameUpdateSubgroups] = useState<Set<string>>(new Set());
    const [activeReviewTab, setActiveReviewTab] = useState<"subgroups" | "main">("main");
    const [activeMainFilter, setActiveMainFilter] = useState<"updates" | "new">("new");
    const [reviewSearch, setReviewSearch] = useState("");
    const deferredReviewSearch = useDeferredValue(reviewSearch);

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
        setSelectedRenameUpdateSubgroups(new Set());
        setActiveReviewTab("main");
        setActiveMainFilter("new");
        setReviewSearch("");
        setTemplateLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        dragDepthRef.current = 0;
        setIsFileDropActive(false);
        onClose();
    };

    const processUploadedJson = (jsonString: string) => {
        try {
            const rawData = JSON.parse(jsonString);
            let imported: Record<string, unknown> = {};

            if (rawData.values) {
                for (const [key, val] of Object.entries(rawData.values)) {
                    imported[key] = decodeConfig(val);
                }
            } else if (rawData.config) {
                for (const [key, val] of Object.entries(rawData.config)) {
                    imported[key] = decodeConfig(val);
                }
            } else if (rawData.main_catalog_groups || rawData.catalog_groups) {
                imported = rawData;
            } else {
                throw new Error("Invalid format. Could not find configuration data.");
            }

            const currentMainGroupNames = new Set(
                Object.values(currentValues.main_catalog_groups || {})
                    .map((group) => {
                        if (!group || typeof group !== "object") return undefined;
                        const maybeName = (group as { name?: unknown }).name;
                        return typeof maybeName === "string" ? maybeName : undefined;
                    })
                    .filter((name): name is string => !!name)
            );
            const currentMainGroupsByName = new Map(
                Object.entries(currentValues.main_catalog_groups || {}).flatMap(([uuid, group]) => {
                    if (!group || typeof group !== "object") return [];
                    const maybeName = (group as { name?: unknown }).name;
                    const subgroupNames = (group as { subgroupNames?: unknown }).subgroupNames;
                    if (typeof maybeName !== "string" || !maybeName) return [];

                    return [[maybeName, {
                        uuid,
                        subgroupNames: Array.isArray(subgroupNames)
                            ? subgroupNames.filter((entry): entry is string => typeof entry === "string")
                            : [],
                    }]];
                })
            );
            const currentCatalogGroups = (currentValues.catalog_groups || {}) as Record<string, string[]>;
            const currentCatalogGroupImageUrls = (currentValues.catalog_group_image_urls || {}) as Record<string, unknown>;
            const currentSubgroupsBySignature: Record<string, string[]> = {};
            Object.entries(currentCatalogGroups).forEach(([name, catalogs]) => {
                if (isIgnoredUpdateManagerSubgroup(name)) return;
                const signature = buildCatalogSignature(Array.isArray(catalogs) ? catalogs : []);
                if (!currentSubgroupsBySignature[signature]) {
                    currentSubgroupsBySignature[signature] = [];
                }
                currentSubgroupsBySignature[signature].push(name);
            });

            const inMainGroups = (imported.main_catalog_groups || {}) as Record<string, {
                name?: string;
                subgroupNames?: string[];
                posterType?: string;
                posterSize?: string;
            }>;
            const inMainGroupOrder = normalizeMainGroupOrder(inMainGroups, imported.main_group_order);
            const inCatalogsGroups = (imported.catalog_groups || {}) as Record<string, string[]>;
            const importedCatalogGroupImageUrls = (imported.catalog_group_image_urls || {}) as Record<string, unknown>;
            const subgroupOrder = (imported.subgroup_order || {}) as Record<string, string[]>;
            const subgroupParentGroupNames = new Map<string, Set<string>>();

            const parsedMGs: ParsedMainGroup[] = [];
            for (const uuid of inMainGroupOrder) {
                const group = inMainGroups[uuid];
                if (!group) continue;
                const groupName = group.name || "Unnamed Group";
                const subgroupNames = (subgroupOrder[uuid] || group.subgroupNames || []).filter((sg: string) => !isPlaceholderSg(sg, inCatalogsGroups[sg]));
                subgroupNames.forEach((subgroupName) => {
                    if (!subgroupParentGroupNames.has(subgroupName)) {
                        subgroupParentGroupNames.set(subgroupName, new Set());
                    }
                    subgroupParentGroupNames.get(subgroupName)?.add(groupName);
                });
                const existingMainGroup = currentMainGroupsByName.get(groupName);
                const {
                    newSubgroupNames: basicNewSubgroupNames,
                    updatedSubgroupNames: basicUpdatedSubgroupNames,
                } = classifyImportSetupMainGroupSubgroups({
                    currentCatalogGroups,
                    currentMainGroupSubgroupNames: existingMainGroup?.subgroupNames,
                    importedSubgroupNames: subgroupNames,
                });
                const basicUpdatedSubgroupCount = basicUpdatedSubgroupNames.length;
                const basicNewSubgroupCount = basicNewSubgroupNames.length;
                parsedMGs.push({
                    originalUuid: uuid,
                    name: groupName,
                    subgroupNames,
                    basicNewSubgroupNames,
                    basicUpdatedSubgroupNames,
                    posterType: group.posterType || "movie",
                    posterSize: group.posterSize || "normal",
                    isDuplicate: currentMainGroupNames.has(groupName),
                    basicNewSubgroupCount,
                    basicUpdatedSubgroupCount,
                    hasChanges: basicNewSubgroupCount > 0 || basicUpdatedSubgroupCount > 0,
                });
            }

            const parsedSgs: ParsedSubgroup[] = [];
            Object.entries(inCatalogsGroups).forEach(([name, catalogs]) => {
                const cats = Array.isArray(catalogs) ? catalogs : [];
                if (isPlaceholderSg(name, cats) || isIgnoredUpdateManagerSubgroup(name)) return;

                const signature = buildCatalogSignature(cats);
                const matchedNames = currentSubgroupsBySignature[signature] || [];
                const exactNameMatch = currentCatalogGroups[name] && !isIgnoredUpdateManagerSubgroup(name) ? name : undefined;
                const hasMatchBySignature = matchedNames.length > 0;

                const isDuplicate = !!exactNameMatch || hasMatchBySignature;
                let hasRename = false;
                let matchedExistingName: string | undefined;

                if (!exactNameMatch && hasMatchBySignature) {
                    hasRename = true;
                    matchedExistingName = matchedNames[0];
                }

                const currentMatchName = exactNameMatch || matchedExistingName;
                const importedImageUrl = normalizeImportSetupImageUrl(importedCatalogGroupImageUrls[name]);
                const hasCatalogChanges = isDuplicate
                    ? hasImportSetupCatalogsChanged(currentMatchName ? currentCatalogGroups[currentMatchName] : [], cats)
                    : cats.length > 0;
                const hasImageChanges = isDuplicate
                    ? hasImportSetupImageChanged(
                        currentMatchName ? currentCatalogGroupImageUrls[currentMatchName] : undefined,
                        importedImageUrl
                    )
                    : importedImageUrl.length > 0;

                parsedSgs.push({
                    name,
                    catalogs: cats,
                    imageUrl: importedImageUrl || undefined,
                    isDuplicate,
                    basicIsExisting: !!exactNameMatch,
                    hasRename,
                    matchedExistingName,
                    hasNewCatalogs: hasCatalogChanges,
                    hasNewImage: hasImageChanges,
                    parentGroupNames: subgroupParentGroupNames.has(name)
                        ? Array.from(subgroupParentGroupNames.get(name) || [])
                        : undefined,
                    category: getSubgroupCategory(name),
                });
            });

            setParsedMainGroups(parsedMGs);
            setParsedSubgroups(parsedSgs);
            setActiveMainFilter(parsedMGs.some((group) => group.basicNewSubgroupCount > 0) ? "new" : "updates");
            setStep(2);
            setError("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to parse file.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        dragDepthRef.current = 0;
        setIsFileDropActive(false);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            processUploadedJson(event.target?.result as string);
        };
        reader.readAsText(file);
    };

    const handleDroppedFile = (file: File | null | undefined) => {
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".json")) {
            setError("Please drop a JSON configuration file.");
            return;
        }

        dragDepthRef.current = 0;
        setIsFileDropActive(false);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            processUploadedJson(event.target?.result as string);
        };
        reader.readAsText(file);
    };

    const toggleMainGroupSubgroup = (mgUuid: string, subgroupName: string) => {
        const group = parsedMainGroups.find((mainGroup) => mainGroup.originalUuid === mgUuid);
        if (!group) return;

        const isGroupSelected = selectedMainGroupUuids.has(mgUuid);
        const currentSelection = isGroupSelected
            ? (selectedMainGroupSubgroups[mgUuid] || group.subgroupNames)
            : [];
        const updatedSelection = currentSelection.includes(subgroupName)
            ? currentSelection.filter((name) => name !== subgroupName)
            : [...currentSelection, subgroupName];

        setSelectedMainGroupSubgroups((previous) => {
            const next = { ...previous };
            if (updatedSelection.length === 0 || updatedSelection.length === group.subgroupNames.length) {
                delete next[mgUuid];
            } else {
                next[mgUuid] = updatedSelection;
            }
            return next;
        });

        setSelectedMainGroupUuids((previous) => {
            const next = new Set(previous);
            if (updatedSelection.length === 0) {
                next.delete(mgUuid);
            } else {
                next.add(mgUuid);
            }
            return next;
        });
    };

    const toggleStandaloneSubgroup = (name: string, isDisabled: boolean) => {
        if (isDisabled) return;
        setSelectedStandaloneSubgroups((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleCatalogUpdate = (name: string) => {
        setSelectedCatalogUpdateSubgroups((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleImageUpdate = (name: string) => {
        setSelectedImageUpdateSubgroups((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleRenameUpdate = (name: string) => {
        setSelectedRenameUpdateSubgroups((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const isSubgroupIncludedViaSelectedMainGroup = (name: string) => {
        return Array.from(selectedMainGroupUuids).some(uuid => {
            const group = parsedMainGroups.find(mg => mg.originalUuid === uuid);
            if (!group) return false;
            const subgroups = selectedMainGroupSubgroups[uuid] || group.subgroupNames;
            return subgroups.includes(name);
        });
    };

    const filteredMainGroups = useMemo(() => {
        if (!deferredReviewSearch) return parsedMainGroups;
        const low = deferredReviewSearch.toLowerCase();
        return parsedMainGroups.filter(mg =>
            mg.name.toLowerCase().includes(low) ||
            mg.subgroupNames.some(s => s.toLowerCase().includes(low))
        );
    }, [parsedMainGroups, deferredReviewSearch]);

    const filteredSubgroups = useMemo(() => {
        if (!deferredReviewSearch) return parsedSubgroups;
        const low = deferredReviewSearch.toLowerCase();
        return parsedSubgroups.filter(sg =>
            sg.name.toLowerCase().includes(low) ||
            sg.category?.toLowerCase().includes(low) ||
            sg.catalogs.some(c => c.toLowerCase().includes(low))
        );
    }, [parsedSubgroups, deferredReviewSearch]);

    const getBasicVisibleSubgroups = useCallback(
        (group: ParsedMainGroup, filter: "new" | "updates" = activeMainFilter) =>
            filter === "new" ? group.basicNewSubgroupNames : group.basicUpdatedSubgroupNames,
        [activeMainFilter]
    );

    const filteredNewMainGroups = useMemo(
        () => filteredMainGroups.filter((mg) => getBasicVisibleSubgroups(mg, "new").length > 0),
        [filteredMainGroups, getBasicVisibleSubgroups]
    );
    const filteredUpdatedMainGroups = useMemo(
        () => filteredMainGroups.filter((mg) => getBasicVisibleSubgroups(mg, "updates").length > 0),
        [filteredMainGroups, getBasicVisibleSubgroups]
    );
    const filteredUpdatedSubgroups = useMemo(() => filteredSubgroups.filter(sg => sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage || sg.hasRename)), [filteredSubgroups]);
    const visibleMainGroups = activeMainFilter === "new" ? filteredNewMainGroups : filteredUpdatedMainGroups;
    const visibleCatalogUpdateNames = useMemo(
        () => filteredUpdatedSubgroups.filter((sg) => sg.hasNewCatalogs).map((sg) => sg.name),
        [filteredUpdatedSubgroups]
    );
    const visibleRenameUpdateNames = useMemo(
        () => filteredUpdatedSubgroups.filter((sg) => sg.hasRename).map((sg) => sg.name),
        [filteredUpdatedSubgroups]
    );
    const visibleImageUpdateNames = useMemo(
        () => filteredUpdatedSubgroups.filter((sg) => sg.hasNewImage).map((sg) => sg.name),
        [filteredUpdatedSubgroups]
    );
    const filteredNewMainSubgroupCount = useMemo(
        () => filteredNewMainGroups.reduce((total, group) => total + getBasicVisibleSubgroups(group, "new").length, 0),
        [filteredNewMainGroups, getBasicVisibleSubgroups]
    );
    const filteredUpdatedMainSubgroupCount = useMemo(
        () => filteredUpdatedMainGroups.reduce((total, group) => total + getBasicVisibleSubgroups(group, "updates").length, 0),
        [filteredUpdatedMainGroups, getBasicVisibleSubgroups]
    );

    const toggleVisibleMainGroup = (group: ParsedMainGroup) => {
        const visibleSubgroups = getBasicVisibleSubgroups(group);
        if (visibleSubgroups.length === 0) return;

        const currentSelected = selectedMainGroupUuids.has(group.originalUuid)
            ? (selectedMainGroupSubgroups[group.originalUuid] || group.subgroupNames)
            : [];
        const allVisibleSelected = visibleSubgroups.every((subgroupName) => currentSelected.includes(subgroupName));
        const nextSelected = allVisibleSelected
            ? currentSelected.filter((subgroupName) => !visibleSubgroups.includes(subgroupName))
            : Array.from(new Set([...currentSelected, ...visibleSubgroups]));

        setSelectedMainGroupSubgroups((previous) => {
            const next = { ...previous };
            if (nextSelected.length === 0 || nextSelected.length === group.subgroupNames.length) {
                delete next[group.originalUuid];
            } else {
                next[group.originalUuid] = nextSelected;
            }
            return next;
        });
        setSelectedMainGroupUuids((previous) => {
            const next = new Set(previous);
            if (nextSelected.length === 0) {
                next.delete(group.originalUuid);
            } else {
                next.add(group.originalUuid);
            }
            return next;
        });
    };

    const selectVisibleMainGroups = () => {
        const nextMainGroups = new Set(selectedMainGroupUuids);
        const nextSubgroupSelections = { ...selectedMainGroupSubgroups };

        visibleMainGroups.forEach((group) => {
            const visibleSubgroups = getBasicVisibleSubgroups(group);
            if (visibleSubgroups.length === 0) return;

            const currentSelected = nextMainGroups.has(group.originalUuid)
                ? (nextSubgroupSelections[group.originalUuid] || group.subgroupNames)
                : [];
            const mergedSelection = Array.from(new Set([...currentSelected, ...visibleSubgroups]));

            nextMainGroups.add(group.originalUuid);
            if (mergedSelection.length === group.subgroupNames.length) {
                delete nextSubgroupSelections[group.originalUuid];
            } else {
                nextSubgroupSelections[group.originalUuid] = mergedSelection;
            }
        });

        setSelectedMainGroupSubgroups(nextSubgroupSelections);
        setSelectedMainGroupUuids(nextMainGroups);
    };
    const deselectVisibleMainGroups = () => {
        const nextMainGroups = new Set(selectedMainGroupUuids);
        const nextSubgroupSelections = { ...selectedMainGroupSubgroups };

        visibleMainGroups.forEach((group) => {
            const visibleSubgroups = getBasicVisibleSubgroups(group);
            if (visibleSubgroups.length === 0) return;

            const currentSelected = nextMainGroups.has(group.originalUuid)
                ? (nextSubgroupSelections[group.originalUuid] || group.subgroupNames)
                : [];
            const remainingSelection = currentSelected.filter((subgroupName) => !visibleSubgroups.includes(subgroupName));

            if (remainingSelection.length === 0) {
                nextMainGroups.delete(group.originalUuid);
                delete nextSubgroupSelections[group.originalUuid];
            } else {
                nextMainGroups.add(group.originalUuid);
                if (remainingSelection.length === group.subgroupNames.length) {
                    delete nextSubgroupSelections[group.originalUuid];
                } else {
                    nextSubgroupSelections[group.originalUuid] = remainingSelection;
                }
            }
        });

        setSelectedMainGroupSubgroups(nextSubgroupSelections);
        setSelectedMainGroupUuids(nextMainGroups);
    };
    const toggleBulkUpdateSelection = (
        names: string[],
        selectedNames: Set<string>,
        setSelectedNames: React.Dispatch<React.SetStateAction<Set<string>>>
    ) => {
        if (names.length === 0) return;

        const allSelected = names.every((name) => selectedNames.has(name));
        const next = new Set(selectedNames);
        names.forEach((name) => {
            if (allSelected) {
                next.delete(name);
            } else {
                next.add(name);
            }
        });
        setSelectedNames(next);
    };

    const selectAllUpdates = () => {
        const nextCatalogs = new Set(selectedCatalogUpdateSubgroups);
        const nextImages = new Set(selectedImageUpdateSubgroups);
        const nextRenames = new Set(selectedRenameUpdateSubgroups);
        filteredUpdatedSubgroups.forEach((sg) => {
            if (sg.hasNewCatalogs) nextCatalogs.add(sg.name);
            if (sg.hasNewImage) nextImages.add(sg.name);
            if (sg.hasRename) nextRenames.add(sg.name);
        });
        setSelectedCatalogUpdateSubgroups(nextCatalogs);
        setSelectedImageUpdateSubgroups(nextImages);
        setSelectedRenameUpdateSubgroups(nextRenames);
    };
    const clearUpdateSelection = () => {
        const nextCatalogs = new Set(selectedCatalogUpdateSubgroups);
        const nextImages = new Set(selectedImageUpdateSubgroups);
        const nextRenames = new Set(selectedRenameUpdateSubgroups);
        filteredUpdatedSubgroups.forEach((sg) => {
            nextCatalogs.delete(sg.name);
            nextImages.delete(sg.name);
            nextRenames.delete(sg.name);
        });
        setSelectedCatalogUpdateSubgroups(nextCatalogs);
        setSelectedImageUpdateSubgroups(nextImages);
        setSelectedRenameUpdateSubgroups(nextRenames);
    };

    const selectCatalogUpdates = () => {
        toggleBulkUpdateSelection(visibleCatalogUpdateNames, selectedCatalogUpdateSubgroups, setSelectedCatalogUpdateSubgroups);
    };
    const selectRenameUpdates = () => {
        toggleBulkUpdateSelection(visibleRenameUpdateNames, selectedRenameUpdateSubgroups, setSelectedRenameUpdateSubgroups);
    };
    const selectImageUpdates = () => {
        toggleBulkUpdateSelection(visibleImageUpdateNames, selectedImageUpdateSubgroups, setSelectedImageUpdateSubgroups);
    };

    const areAllCatalogUpdatesSelected = useMemo(() => {
        return visibleCatalogUpdateNames.length > 0 && visibleCatalogUpdateNames.every((name) => selectedCatalogUpdateSubgroups.has(name));
    }, [selectedCatalogUpdateSubgroups, visibleCatalogUpdateNames]);
    const areAllImageUpdatesSelected = useMemo(() => {
        return visibleImageUpdateNames.length > 0 && visibleImageUpdateNames.every((name) => selectedImageUpdateSubgroups.has(name));
    }, [selectedImageUpdateSubgroups, visibleImageUpdateNames]);
    const areAllRenameUpdatesSelected = useMemo(() => {
        return visibleRenameUpdateNames.length > 0 && visibleRenameUpdateNames.every((name) => selectedRenameUpdateSubgroups.has(name));
    }, [selectedRenameUpdateSubgroups, visibleRenameUpdateNames]);

    const handleImport = () => {
        const finalMainGroups: Record<string, ImportedMainGroupSelection> = {};
        const finalSubgroups: Record<string, ImportedSubgroupSelection> = {};

        selectedMainGroupUuids.forEach(uuid => {
            const mg = parsedMainGroups.find(m => m.originalUuid === uuid);
            if (!mg) return;
            const selectedSubgroupNames = selectedMainGroupSubgroups[uuid] || mg.subgroupNames;
            finalMainGroups[uuid] = {
                name: mg.name,
                subgroupNames: selectedSubgroupNames,
                posterType: mg.posterType,
                posterSize: mg.posterSize,
            };

            selectedSubgroupNames.forEach((name) => {
                const sg = parsedSubgroups.find((subgroup) => subgroup.name === name);
                if (!sg || finalSubgroups[name]) return;
                finalSubgroups[name] = {
                    catalogs: sg.catalogs,
                    imageUrl: sg.imageUrl,
                    overwriteCatalogs: !sg.basicIsExisting,
                    overwriteImage: !sg.basicIsExisting && !!sg.imageUrl,
                };
            });
        });

        const subgroupsToProcess = new Set([
            ...selectedStandaloneSubgroups,
            ...selectedCatalogUpdateSubgroups,
            ...selectedImageUpdateSubgroups,
            ...selectedRenameUpdateSubgroups,
        ]);

        subgroupsToProcess.forEach(name => {
            const sg = parsedSubgroups.find(s => s.name === name);
            if (!sg) return;
            finalSubgroups[name] = {
                catalogs: sg.catalogs,
                imageUrl: sg.imageUrl,
                renameFrom: selectedRenameUpdateSubgroups.has(name) ? sg.matchedExistingName : undefined,
                overwriteCatalogs: selectedCatalogUpdateSubgroups.has(name),
                overwriteImage: selectedImageUpdateSubgroups.has(name),
            };
        });

        importGroups({
            mainGroups: finalMainGroups,
            subgroups: finalSubgroups,
            standaloneAssignments: {},
        });

        handleClose();
    };

    const totalSelectedBasicImportSubgroups = new Set(
        Array.from(selectedMainGroupUuids).flatMap((uuid) => {
            const group = parsedMainGroups.find((mainGroup) => mainGroup.originalUuid === uuid);
            if (!group) return [];
            return selectedMainGroupSubgroups[uuid] || group.subgroupNames;
        })
    ).size;
    const totalSelectedSubgroups = new Set([
        ...selectedStandaloneSubgroups,
        ...selectedCatalogUpdateSubgroups,
        ...selectedImageUpdateSubgroups,
        ...selectedRenameUpdateSubgroups,
    ]).size;
    const totalSelectedToImport = totalSelectedBasicImportSubgroups + totalSelectedSubgroups;

    const renderSubgroupRow = (sg: ParsedSubgroup) => {
        const isStandaloneSelected = selectedStandaloneSubgroups.has(sg.name);
        const isCatalogUpdateSelected = selectedCatalogUpdateSubgroups.has(sg.name);
        const isImageUpdateSelected = selectedImageUpdateSubgroups.has(sg.name);
        const isRenameUpdateSelected = selectedRenameUpdateSubgroups.has(sg.name);
        const includedInMain = isSubgroupIncludedViaSelectedMainGroup(sg.name);
        const isFullyExisting = sg.isDuplicate && !sg.hasNewCatalogs && !sg.hasNewImage && !sg.hasRename;
        const isUpdateRow = sg.isDuplicate && (sg.hasNewCatalogs || sg.hasNewImage || sg.hasRename);
        const isIncludedWithMain = includedInMain && !sg.isDuplicate;
        const hasAnyDuplicateUpdateSelection = isCatalogUpdateSelected || isImageUpdateSelected || isRenameUpdateSelected;
        const isCheckboxDisabled = isFullyExisting || isIncludedWithMain;
        const isChecked = includedInMain ? true : isStandaloneSelected;
        const isSelected = isUpdateRow ? hasAnyDuplicateUpdateSelection : isChecked;

        if (isUpdateRow) {
            const selectedUpdateCount = Number(isCatalogUpdateSelected) + Number(isImageUpdateSelected) + Number(isRenameUpdateSelected);
            const selectionSummary = selectedUpdateCount === 1 ? "1 update selected" : `${selectedUpdateCount} updates selected`;
            const catalogLabel = sg.catalogs.length === 1 ? "Catalog" : "Catalogs";
            const subgroupContextLabel = getSubgroupContextLabel(sg);

            return (
                <div
                    key={sg.name}
                    onClick={() => {
                        const nextValue = !isSelected;
                        if (sg.hasNewCatalogs && isCatalogUpdateSelected !== nextValue) toggleCatalogUpdate(sg.name);
                        if (sg.hasNewImage && isImageUpdateSelected !== nextValue) toggleImageUpdate(sg.name);
                        if (sg.hasRename && isRenameUpdateSelected !== nextValue) toggleRenameUpdate(sg.name);
                    }}
                    className={cn(
                        "mx-4 my-1 rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer",
                        isSelected
                            ? "border-primary/40 bg-primary/[0.04] shadow-[0_4px_16px_rgba(59,130,246,0.08)]"
                            : "border-border/50 bg-card/40 hover:border-border hover:bg-card/60"
                    )}
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[15px] font-bold tracking-tight text-foreground/90">
                                    {formatDisplayName(sg.name)}
                                </div>
                                {sg.hasRename && sg.matchedExistingName && (
                                    <div className="mt-0.5 text-[12px] font-medium text-sky-600/90 dark:text-sky-400/80">
                                        Rename from {formatDisplayName(sg.matchedExistingName)}
                                    </div>
                                )}
                            </div>
                            <div className="flex max-w-[42%] shrink-0 flex-wrap justify-end gap-1.5">
                                {sg.hasNewCatalogs && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); toggleCatalogUpdate(sg.name); }}
                                        className={cn("h-7 px-2.5 rounded-lg cursor-pointer text-[11px] font-black uppercase tracking-wider transition-all", isCatalogUpdateSelected ? "bg-violet-500/15 text-violet-700 border-violet-500/40 shadow-sm" : "text-foreground/40 hover:bg-violet-500/5 hover:text-violet-600")}
                                    >
                                        Catalogs
                                    </Badge>
                                )}
                                {sg.hasNewImage && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); toggleImageUpdate(sg.name); }}
                                        className={cn("h-7 px-2.5 rounded-lg cursor-pointer text-[11px] font-black uppercase tracking-wider transition-all", isImageUpdateSelected ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 shadow-sm" : "text-foreground/40 hover:bg-emerald-500/5 hover:text-emerald-600")}
                                    >
                                        Image
                                    </Badge>
                                )}
                                {sg.hasRename && (
                                    <Badge
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); toggleRenameUpdate(sg.name); }}
                                        className={cn("h-7 px-2.5 rounded-lg cursor-pointer text-[11px] font-black uppercase tracking-wider transition-all", isRenameUpdateSelected ? "bg-sky-500/15 text-sky-700 border-sky-500/40 shadow-sm" : "text-foreground/40 hover:bg-sky-500/5 hover:text-sky-600")}
                                    >
                                        Name
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                            <span>{sg.catalogs.length} {catalogLabel}</span>
                            {subgroupContextLabel ? (
                                <>
                                    <span className="h-1 w-1 rounded-full bg-foreground/15" />
                                    <span>{subgroupContextLabel}</span>
                                </>
                            ) : null}
                        </div>

                        {selectedUpdateCount > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-primary/26 bg-primary/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
                                    {selectionSummary}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            );
        }

        return (
            <div
                key={sg.name}
                onClick={() => !isCheckboxDisabled && toggleStandaloneSubgroup(sg.name, isCheckboxDisabled)}
                className={cn(
                    "flex items-center gap-4 p-4 transition-all duration-200",
                    isCheckboxDisabled ? "" : "cursor-pointer hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04]",
                    isSelected ? "bg-primary/[0.03] dark:bg-primary/[0.06]" : isCheckboxDisabled ? "opacity-50" : ""
                )}
            >
                <Checkbox
                    id={`standalone-${sg.name}`}
                    disabled={isCheckboxDisabled}
                    checked={isSelected}
                    onCheckedChange={() => !isCheckboxDisabled && toggleStandaloneSubgroup(sg.name, isCheckboxDisabled)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-5 rounded-md"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <label htmlFor={`standalone-${sg.name}`} className={cn("truncate text-[15px] font-bold tracking-tight", isCheckboxDisabled ? "text-foreground/40" : "cursor-pointer text-foreground/90")}>
                            {formatDisplayName(sg.name)}
                        </label>
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                            <span>{sg.catalogs.length} {sg.catalogs.length === 1 ? "Catalog" : "Catalogs"}</span>
                            {getSubgroupContextLabel(sg) ? (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-foreground/15" />
                                    <span>{getSubgroupContextLabel(sg)}</span>
                                </>
                            ) : null}
                            {isIncludedWithMain && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-foreground/15" />
                                    <span className="text-primary/70">Linked to Basic Import</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(editorLayout.dialogContent, "sm:max-w-3xl sm:max-h-[92vh] sm:h-auto flex flex-col")}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>Update From Existing Setup</DialogTitle>
                    <DialogDescription className="text-foreground/70">
                        {step === 1 ? "Upload a configuration file to proceed." : `Reviewing ${fileName}`}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <EditorNotice tone="warning" className="w-full">
                            <div className="flex w-full flex-col items-start gap-2 text-left">
                                <p className="font-semibold opacity-90">First time updating?</p>
                                {onOpenGuide && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onOpenGuide("update")}
                                        className="h-9 self-start justify-start rounded-lg border-amber-500/18 bg-white/30 px-2.5 text-xs font-semibold text-amber-700 shadow-none hover:bg-white/55 hover:text-amber-800 dark:border-amber-400/16 dark:bg-white/[0.025] dark:text-amber-300 dark:hover:bg-white/[0.05] dark:hover:text-amber-200"
                                    >
                                        <BookOpen className="w-3.5 h-3.5 mr-2" />
                                        How to Update
                                    </Button>
                                )}
                            </div>
                        </EditorNotice>

                        <div className={cn(editorSurface.card, "p-5")}>
                            <h3 className="font-semibold text-sm mb-3">Load Template</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                                    <SelectTrigger className={cn("w-full h-10 rounded-md", editorSurface.field)}>
                                        <SelectValue placeholder="Select version" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map(t => <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={async () => {
                                        setTemplateLoading(true);
                                        const t = templates.find(temp => temp.label === selectedVersion);
                                        if (t) {
                                            const txt = await fetchTextWithLimits(t.url, { timeoutMs: 15000, maxBytes: 15 * 1024 * 1024 });
                                            processUploadedJson(txt);
                                        }
                                        setTemplateLoading(false);
                                    }}
                                    disabled={!selectedVersion || templateLoading}
                                    className={cn(editorAction.primary, "h-10 px-6 rounded-xl")}
                                >
                                    {templateLoading ? "Loading..." : "Load Template"}
                                </Button>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-all text-center",
                                isFileDropActive ? "border-primary bg-primary/[0.04]" : "border-border/60 bg-muted/[0.04] hover:bg-muted/[0.08]"
                            )}
                            onDragEnter={(event) => {
                                event.preventDefault();
                                dragDepthRef.current += 1;
                                setIsFileDropActive(true);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                if (event.dataTransfer) {
                                    event.dataTransfer.dropEffect = "copy";
                                }
                                if (!isFileDropActive) {
                                    setIsFileDropActive(true);
                                }
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
                                if (dragDepthRef.current === 0) {
                                    setIsFileDropActive(false);
                                }
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                dragDepthRef.current = 0;
                                setIsFileDropActive(false);
                                const file = event.dataTransfer?.files?.[0];
                                handleDroppedFile(file);
                            }}
                        >
                            <UploadCloud className="w-10 h-10 mb-4 text-primary/40 group-hover:text-primary/60 transition-colors" />
                            <h3 className="font-medium text-sm mb-4">Or upload your own JSON</h3>
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-background">Select File</Button>
                            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        </div>
                        {error && <EditorNotice tone="danger">{error}</EditorNotice>}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                        <Tabs value={activeReviewTab} onValueChange={(v) => {
                            const tab = v as "subgroups" | "main";
                            setActiveReviewTab(tab);
                            if (tab === "main") {
                                const hasNew = parsedMainGroups.some((group) => group.basicNewSubgroupCount > 0);
                                setActiveMainFilter(hasNew ? "new" : "updates");
                            }
                        }}>
                            <div className={cn(editorSurface.card, "relative flex flex-col overflow-hidden")}>
                                <div className="sticky top-0 z-30 bg-white/80 dark:bg-[rgb(13,16,22)]/80 backdrop-blur-md border-b border-border/40 shadow-sm p-4 space-y-3.5">
                                    <TabsList className="h-11 p-1 bg-slate-100/50 dark:bg-white/10 rounded-xl grid grid-cols-2 gap-1 border-none">
                                        <TabsTrigger value="main" className="rounded-lg font-bold data-[state=active]:bg-background shadow-sm">Basic Import</TabsTrigger>
                                        <TabsTrigger value="subgroups" className="rounded-lg font-bold data-[state=active]:bg-background shadow-sm">Advanced Update</TabsTrigger>
                                    </TabsList>

                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <Input
                                            value={reviewSearch}
                                            onChange={(e) => startTransition(() => setReviewSearch(e.target.value))}
                                            placeholder={activeReviewTab === "subgroups" ? "Search Advanced Update..." : "Search Basic Import..."}
                                            className={cn(editorSurface.field, "h-11 pl-10 rounded-xl")}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                                        {activeReviewTab === "main" ? (
                                            <div className={cn(secondaryFilterRailClass, "w-full sm:w-auto")}>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-pressed={activeMainFilter === "new"}
                                                    onClick={() => setActiveMainFilter("new")}
                                                    className={cn(
                                                        secondaryFilterButtonClass,
                                                        activeMainFilter === "new"
                                                            ? "bg-foreground text-background shadow-sm hover:bg-foreground/92 hover:text-background dark:bg-background dark:text-foreground dark:hover:bg-background/92"
                                                            : "text-foreground/66 shadow-none hover:bg-background hover:text-foreground dark:hover:bg-white/[0.06]"
                                                    )}
                                                >
                                                    <span>New</span>
                                                    <span className={cn(
                                                        "inline-flex h-5 min-w-[1.35rem] items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold leading-none",
                                                        activeMainFilter === "new"
                                                            ? "border-black/10 bg-black/10 text-inherit dark:border-white/10 dark:bg-white/10"
                                                            : "border-border/60 bg-background/80 text-foreground/58 dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/54"
                                                    )}>
                                                        {filteredNewMainSubgroupCount}
                                                    </span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-pressed={activeMainFilter === "updates"}
                                                    onClick={() => setActiveMainFilter("updates")}
                                                    className={cn(
                                                        secondaryFilterButtonClass,
                                                        activeMainFilter === "updates"
                                                            ? "bg-foreground text-background shadow-sm hover:bg-foreground/92 hover:text-background dark:bg-background dark:text-foreground dark:hover:bg-background/92"
                                                            : "text-foreground/66 shadow-none hover:bg-background hover:text-foreground dark:hover:bg-white/[0.06]"
                                                    )}
                                                >
                                                    <span>Updates</span>
                                                    <span className={cn(
                                                        "inline-flex h-5 min-w-[1.35rem] items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold leading-none",
                                                        activeMainFilter === "updates"
                                                            ? "border-black/10 bg-black/10 text-inherit dark:border-white/10 dark:bg-white/10"
                                                            : "border-border/60 bg-background/80 text-foreground/58 dark:border-white/10 dark:bg-white/[0.045] dark:text-foreground/54"
                                                    )}>
                                                        {filteredUpdatedMainSubgroupCount}
                                                    </span>
                                                </Button>
                                            </div>
                                        ) : activeReviewTab === "subgroups" ? (
                                            <div className={secondaryFilterRailClass}>
                                                <div className="inline-flex h-8 items-center gap-2 rounded-full bg-foreground px-3 text-[11px] font-semibold tracking-tight text-background shadow-sm dark:bg-background dark:text-foreground">
                                                    <span>Updates</span>
                                                    <span className="inline-flex h-5 min-w-[1.35rem] items-center justify-center rounded-full border border-black/10 bg-black/10 px-1.5 text-[10px] font-semibold leading-none text-inherit dark:border-white/10 dark:bg-white/10">
                                                        {filteredUpdatedSubgroups.length}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : <div></div>}

                                        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                                            <div className="inline-flex h-9 w-auto items-center self-start rounded-xl bg-slate-100/40 p-1 dark:bg-white/5 sm:flex-none">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={activeReviewTab === "main" ? selectVisibleMainGroups : selectAllUpdates}
                                                    className="h-7 rounded-lg px-2.5 text-[11px] font-bold text-foreground/72 shadow-none hover:bg-background hover:text-foreground sm:px-3"
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={activeReviewTab === "main" ? deselectVisibleMainGroups : clearUpdateSelection}
                                                    className="h-7 rounded-lg px-2.5 text-[11px] font-bold text-foreground/62 shadow-none hover:bg-background hover:text-foreground sm:px-3"
                                                >
                                                    None
                                                </Button>
                                                {activeReviewTab === "subgroups" && (visibleCatalogUpdateNames.length > 0 || visibleRenameUpdateNames.length > 0 || visibleImageUpdateNames.length > 0) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 rounded-lg px-3 text-[11px] font-bold text-foreground/68 shadow-none hover:bg-background hover:text-foreground"
                                                            >
                                                                Bulk
                                                                <ChevronDown className="ml-1 w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[min(15rem,calc(100vw-1.75rem))] sm:w-48">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-foreground/50">Bulk Update</DropdownMenuLabel>
                                                            {visibleCatalogUpdateNames.length > 0 && (
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={selectCatalogUpdates} className="flex justify-between">Catalogs {areAllCatalogUpdatesSelected && <Check className="w-3.5 h-3.5" />}</DropdownMenuItem>
                                                            )}
                                                            {visibleRenameUpdateNames.length > 0 && (
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={selectRenameUpdates} className="flex justify-between">Names {areAllRenameUpdatesSelected && <Check className="w-3.5 h-3.5" />}</DropdownMenuItem>
                                                            )}
                                                            {visibleImageUpdateNames.length > 0 && (
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={selectImageUpdates} className="flex justify-between">Images {areAllImageUpdatesSelected && <Check className="w-3.5 h-3.5" />}</DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <TabsContent value="main" className="m-0 border-none">
                                        <div className="divide-y divide-border/50">
                                            {visibleMainGroups.map(mg => {
                                                const isFullyImported = mg.isDuplicate && !mg.hasChanges;
                                                const visibleSubgroups = getBasicVisibleSubgroups(mg);
                                                const isSelected = selectedMainGroupUuids.has(mg.originalUuid);
                                                const selectedSubgroups = isSelected ? (selectedMainGroupSubgroups[mg.originalUuid] || mg.subgroupNames) : [];
                                                const selectedVisibleSubgroups = visibleSubgroups.filter((subgroupName) => selectedSubgroups.includes(subgroupName));
                                                const checkboxChecked = visibleSubgroups.length > 0
                                                    ? selectedVisibleSubgroups.length === visibleSubgroups.length
                                                        ? true
                                                        : selectedVisibleSubgroups.length > 0
                                                            ? "indeterminate"
                                                            : false
                                                    : false;

                                                return (
                                                    <div key={mg.originalUuid} className={cn("flex items-start p-4 transition-colors", isSelected ? "bg-primary/[0.02]" : isFullyImported ? "opacity-50" : "")}>
                                                        <Checkbox checked={isFullyImported ? true : checkboxChecked} disabled={isFullyImported || visibleSubgroups.length === 0} onCheckedChange={() => !isFullyImported && toggleVisibleMainGroup(mg)} className="mt-1" />
                                                        <div className="ml-3 flex-1 min-w-0">
                                                            <div className="font-semibold flex items-center gap-2">
                                                                {formatDisplayName(mg.name)}
                                                                {activeMainFilter === "new" ? (
                                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">NEW</Badge>
                                                                ) : activeMainFilter === "updates" ? (
                                                                    <Badge variant="outline" className={editorToneBadge.info}>Update</Badge>
                                                                ) : isFullyImported ? (
                                                                    <Badge variant="outline" className="text-[10px] bg-muted/20">Imported</Badge>
                                                                ) : null}
                                                            </div>
                                                            {visibleSubgroups.length > 0 && (
                                                                <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
                                                                    {visibleSubgroups.map(sg => {
                                                                        const parsedSg = parsedSubgroups.find(p => p.name === sg);
                                                                        const isSgSelected = isSelected && selectedSubgroups.includes(sg);
                                                                        const subgroupStatusLabel = activeMainFilter === "updates"
                                                                            ? "Update"
                                                                            : parsedSg?.basicIsExisting
                                                                                ? "Update"
                                                                                : "New";
                                                                        return (
                                                                            <div key={sg} className="flex items-start gap-2 text-xs">
                                                                                <Checkbox checked={isSgSelected} onCheckedChange={() => toggleMainGroupSubgroup(mg.originalUuid, sg)} className="mt-0.5" />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-foreground/80">{sg} <span className="ml-2 text-[10px] text-primary/70 font-bold uppercase">{subgroupStatusLabel}</span></div>
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
                                    </TabsContent>

                                    <TabsContent value="subgroups" className="m-0 border-none">
                                        <div className="flex flex-col divide-y divide-border/40">
                                            {filteredUpdatedSubgroups.map(renderSubgroupRow)}
                                        </div>
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                )}

                <DialogFooter className="mt-4 border-t border-border/40 pt-5 flex-row justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={handleClose} className="h-11 px-6 rounded-xl font-bold">Cancel</Button>
                    {step === 2 && (
                        <Button onClick={handleImport} disabled={totalSelectedToImport === 0} className={cn(editorAction.primary, "h-11 px-8 rounded-xl font-black")}>
                            Import ({totalSelectedToImport})
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

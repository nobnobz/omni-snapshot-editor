"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { OmniConfig } from "../lib/types";
import { resolveCatalogName, ensureCatalogPrefix } from '@/lib/utils';
import { decodeConfig, encodeConfig, pruneDisabledCatalogs, pruneDisabledKeys } from "../lib/config-utils";
import { renameGroup, renameMainGroup, disableGroup, disableMainGroup, disableCatalog, validateAndFix, countGroupReferences, countMainGroupReferences, unassignSubgroup, assignSubgroup, createMainGroup, createSubgroup, importGroups } from "../lib/mutations";

export interface TemplateManifest {
    version: string;
    lastUpdated: string;
    templates: Array<{
        id: string;
        name: string;
        url: string;
        version?: string;
        description?: string;
        isDefault?: boolean;
    }>;
}

interface ConfigContextType {
    originalConfig: OmniConfig | null;
    initialValues: Record<string, any>;
    currentValues: Record<string, any>;
    disabledKeys: Set<string>;
    disabledCatalogs: Set<string>;
    deletedSubgroups: any[];
    deletedMainGroups: any[];
    catalogs: any[];
    fileName: string;
    isLoaded: boolean;
    loadConfig: (config: OmniConfig, fileName?: string) => void;
    updateValue: (keyPath: string[], value: any) => void;
    toggleKey: (keyPath: string[], isEnabled: boolean) => void;
    toggleCatalog: (catalogId: string, isEnabled: boolean) => void;
    updateCatalogsOrder: (newOrder: any[]) => void;
    // Manifest catalog mutations (direct operations on config.catalogs[])
    updateCatalogField: (id: string, patch: Record<string, any>) => void;
    addManifestCatalog: (catalog: any) => void;
    removeManifestCatalog: (id: string) => void;
    reorderManifestCatalogs: (newCatalogs: any[]) => void;
    renameCatalogGroup: (oldName: string, newName: string) => void;
    renameMainCatalogGroup: (uuid: string, newName: string) => void;
    removeMainCatalogGroup: (uuid: string) => void;
    removeCatalogGroup: (name: string) => void;
    unassignCatalogGroup: (name: string) => void;
    assignCatalogGroup: (name: string, targetMainGroupUuid: string) => void;
    addMainCatalogGroup: (name: string, assignedSubgroups: string[]) => void;
    addCatalogGroup: (name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs?: string[]) => void;
    importGroups: (payload: { mainGroups: Record<string, any>; subgroups: Record<string, { catalogs: string[], imageUrl?: string }>; standaloneAssignments: Record<string, string>; metadata?: { custom_catalog_names?: Record<string, string>; regex_pattern_image_urls?: Record<string, string>; enabled_patterns?: string[] }; globalSettings?: Record<string, any> }) => void;
    removeCatalog: (id: string) => void;
    countReferences: (name: string, isMainGroup?: boolean) => number;
    restoreSubgroup: (subgroup: any) => void;
    restoreMainGroup: (mainGroup: any) => void;
    clearDeletedSubgroups: () => void;
    cleanupOrphans: () => void;
    resetAll: () => void;
    unloadConfig: () => void;
    exportConfig: () => OmniConfig | null;
    exportPartialConfig: (sectionKeys: string[]) => OmniConfig | null;

    customFallbacks: Record<string, string>;
    setCustomFallbacks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    clearPatterns: () => void;

    // GitHub Manifest
    manifest: TemplateManifest | null;
    manifestStatus: 'idle' | 'loading' | 'success' | 'error';
    fetchManifest: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [originalConfig, setOriginalConfig] = useState<OmniConfig | null>(null);
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [currentValues, setCurrentValues] = useState<Record<string, any>>({});
    const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());
    const [disabledCatalogs, setDisabledCatalogs] = useState<Set<string>>(new Set());
    const [deletedSubgroups, setDeletedSubgroups] = useState<any[]>([]);
    const [deletedMainGroups, setDeletedMainGroups] = useState<any[]>([]);
    const [catalogs, setCatalogs] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string>("omni-config.json");
    const [isSyntheticSession, setIsSyntheticSession] = useState(false);

    // Custom fallbacks from localStorage
    const [customFallbacks, setCustomFallbacks] = useState<Record<string, string>>({});

    // GitHub Manifest State
    const [manifest, setManifest] = useState<TemplateManifest | null>(null);
    const [manifestStatus, setManifestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const fetchManifest = async () => {
        if (manifestStatus === 'loading' || manifestStatus === 'success') return;

        setManifestStatus('loading');
        try {
            // Add cache-busting to bypass GitHub Raw cache (5 min)
            const cacheBuster = `?t=${Date.now()}`;
            const url = 'https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/manifest.json' + cacheBuster;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch manifest");

            // Fetch as text first to handle potential parsing issues more gracefully
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                setManifest(data);
                setManifestStatus('success');
            } catch (parseErr) {
                console.error("Manifest JSON parse failed:", parseErr, text);
                throw new Error("Invalid JSON format in manifest.json");
            }
        } catch (err) {
            console.error("Manifest fetch failed:", err);
            setManifestStatus('error');
        }
    };

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("omni_custom_fallbacks");
                if (stored) setCustomFallbacks(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load custom fallbacks", e);
            }
        }
    }, []);

    const loadConfig = (config: any, fn = "omni-config.json") => {
        setOriginalConfig(config);
        setFileName(fn);

        // Map config.values OR config.config to internal values state
        const rawValues = config.values || config.config || {};
        const decodedValues: Record<string, any> = {};

        // Decode fields if they use the base64 wrapper format (_data)
        for (const [key, val] of Object.entries(rawValues)) {
            // Remove mdblist setting for imported setups (keep only for clean template)
            if (fn !== "clear-config.json" && key === "mdblist_enabled_ratings") {
                continue;
            }
            decodedValues[key] = decodeConfig(val);
        }

        // Force-inject new settings that might be missing from older configs
        if (decodedValues.hide_addon_info_in_catalog_names === undefined) {
            decodedValues.hide_addon_info_in_catalog_names = true;
        }

        // Extract catalogs if it's a manifest format (config.catalogs[])
        let extractedCatalogs: any[] = [];
        if (Array.isArray(config.config?.catalogs)) {
            extractedCatalogs = config.config.catalogs;
        } else if (Array.isArray(config.catalogs)) {
            extractedCatalogs = config.catalogs;
        }

        // FALLBACK: If no manifest catalogs found, synthesize minimal objects from state-format selected_catalogs
        if (extractedCatalogs.length === 0) {
            const decodedCatalogOrdering: string[] = decodedValues.catalog_ordering || decodedValues.selected_catalogs || [];
            const topRowList: string[] = decodedValues.top_row_catalogs || [];
            const customNames: Record<string, string> = decodedValues.custom_catalog_names || {};
            const topRowLimits: Record<string, number> = decodedValues.top_row_item_limits || {};

            // All IDs in scope
            const allIds = new Set([...decodedCatalogOrdering, ...topRowList]);
            extractedCatalogs = Array.from(allIds).map(id => {
                const name = customNames[id] || id;
                const finalId = ensureCatalogPrefix(id, name);
                return {
                    id: finalId,
                    name: name,
                    enabled: decodedCatalogOrdering.length > 0 ? decodedCatalogOrdering.includes(id) : true,
                    showInHome: topRowList.includes(id),
                    metadata: topRowLimits[id] ? { itemCount: topRowLimits[id] } : undefined,
                    _synthetic: true, // Mark as synthetic so export knows to write back to state arrays
                };
            });
            setIsSyntheticSession(true);
        } else {
            setIsSyntheticSession(false);
        }
        setCatalogs(extractedCatalogs);

        setCurrentValues(decodedValues);
        setInitialValues(JSON.parse(JSON.stringify(decodedValues))); // Deep clone for safety

        // Populate disabledKeys from includedKeys if present
        const newDisabledKeys = new Set<string>();
        const includedKeys = (config.includedKeys as string[]) || [];
        if (includedKeys.length > 0) {
            // Check top-level keys in values
            Object.keys(rawValues).forEach(k => {
                // Never disable certain new keys if they are just missing from an old config's includedKeys
                if (!includedKeys.includes(k) && k !== "hide_addon_info_in_catalog_names") {
                    newDisabledKeys.add(k);
                }
            });
        }
        setDisabledKeys(newDisabledKeys);

        setDisabledCatalogs(new Set());
        setDeletedSubgroups([]);
        setDeletedMainGroups([]);
    };

    const updateValuePath = (obj: any, path: string[], value: any): any => {
        if (path.length === 0) return value;
        if (path.length === 1) {
            if (value === undefined) {
                const newObj = { ...obj };
                delete newObj[path[0]];
                return newObj;
            }
            return { ...obj, [path[0]]: value };
        }
        const [head, ...rest] = path;
        const innerObj = obj ? obj[head] : {};
        return { ...obj, [head]: updateValuePath(innerObj, rest, value) };
    };

    const getValuePath = (obj: any, path: string[]): any => {
        return path.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    };

    const updateValue = (keyPath: string[], value: any) => {
        setCurrentValues(prev => updateValuePath(prev, keyPath, value));
    };

    const toggleKey = (keyPath: string[], isEnabled: boolean) => {
        const keyString = keyPath.join(".");
        setDisabledKeys(prev => {
            const next = new Set(prev);
            if (isEnabled) {
                next.delete(keyString);
            } else {
                next.add(keyString);
            }
            return next;
        });

        if (isEnabled && originalConfig?.values) {
            // Only restore if it is NOT in currentValues (preserving session-level deletions/changes)
            const currentVal = getValuePath(currentValues, keyPath);
            if (currentVal === undefined) {
                const origVal = getValuePath(originalConfig.values, keyPath);
                if (origVal !== undefined) {
                    // Need to decode it just in case it was a base64 originally
                    updateValue(keyPath, decodeConfig(origVal));
                }
            }
        }
    };

    const toggleCatalog = (catalogId: string, isEnabled: boolean) => {
        setDisabledCatalogs(prev => {
            const next = new Set(prev);
            if (isEnabled) next.delete(catalogId);
            else next.add(catalogId);
            return next;
        });
    };

    const updateCatalogsOrder = (_newOrder: any[]) => {
        // Specifically for catalogs
    };

    const renameCatalogGroup = (oldName: string, newName: string) => {
        setCurrentValues(prev => renameGroup(oldName, newName, prev));
    };

    const renameMainCatalogGroup = (uuid: string, newName: string) => {
        setCurrentValues(prev => renameMainGroup(uuid, newName, prev));
    };

    const removeMainCatalogGroup = (uuid: string) => {
        // Archive for Recycle Bin
        const group = currentValues.main_catalog_groups?.[uuid];
        const subgroupNames = currentValues.subgroup_order?.[uuid] || group?.subgroupNames || [];

        setDeletedMainGroups(prev => [
            { uuid, name: group?.name || "Group", subgroupNames, deletedAt: new Date().toISOString() },
            ...prev
        ]);

        setCurrentValues(prev => disableMainGroup(uuid, prev));
    };

    const restoreMainGroup = (item: any) => {
        setCurrentValues(prev => {
            const draft = JSON.parse(JSON.stringify(prev));

            // 1. Restore the main group entry
            if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
            draft.main_catalog_groups[item.uuid] = {
                name: item.name,
                subgroupNames: item.subgroupNames
            };

            // 2. Restore the subgroup order array
            if (!draft.subgroup_order) draft.subgroup_order = {};
            draft.subgroup_order[item.uuid] = item.subgroupNames;

            // 3. Add back to main_group_order if missing
            if (!draft.main_group_order) draft.main_group_order = [];
            if (!draft.main_group_order.includes(item.uuid)) {
                draft.main_group_order.push(item.uuid);
            }

            return draft;
        });

        setDeletedMainGroups(prev => prev.filter(i => i.uuid !== item.uuid || i.deletedAt !== item.deletedAt));
    };

    const removeCatalogGroup = (name: string) => {
        // Archive data before deletion for Recycle Bin
        const catalogs = currentValues.catalog_groups?.[name] || [];
        const imageUrl = currentValues.catalog_group_image_urls?.[name] || "";

        // Find parent UUID
        let parentUUID = "";
        if (currentValues.subgroup_order) {
            parentUUID = Object.keys(currentValues.subgroup_order).find(uuid =>
                Array.isArray(currentValues.subgroup_order[uuid]) &&
                currentValues.subgroup_order[uuid].includes(name)
            ) || "";
        }

        const parentName = parentUUID ? (currentValues.main_catalog_groups?.[parentUUID]?.name || "General") : "General";

        setDeletedSubgroups(prev => [
            { name, catalogs, imageUrl, parentUUID, parentName, deletedAt: new Date().toISOString() },
            ...prev
        ]);

        setCurrentValues(prev => disableGroup(name, prev));
    };

    const unassignCatalogGroup = (name: string) => {
        setCurrentValues(prev => unassignSubgroup(name, prev));
    };

    const assignCatalogGroup = (name: string, targetMainGroupUuid: string) => {
        setCurrentValues(prev => assignSubgroup(name, targetMainGroupUuid, prev));
    };

    const addMainCatalogGroup = (name: string, assignedSubgroups: string[]) => {
        setCurrentValues(prev => createMainGroup(name, assignedSubgroups, prev));
    };

    const addCatalogGroup = (name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs: string[] = []) => {
        // Normalize IDs on addition to subgroup
        const normalized = initialCatalogs.map(id => ensureCatalogPrefix(id, resolveCatalogName(id, currentValues.custom_catalog_names || {})));

        setCurrentValues(prev => createSubgroup(name, targetMainGroupUuid, imageUrl, normalized, prev));
    };

    const importGroupsToState = (payload: { mainGroups: Record<string, any>; subgroups: Record<string, { catalogs: string[], imageUrl?: string }>; standaloneAssignments: Record<string, string>; metadata?: { custom_catalog_names?: Record<string, string>; regex_pattern_image_urls?: Record<string, string>; enabled_patterns?: string[] }; globalSettings?: Record<string, any> }) => {
        setCurrentValues(prev => importGroups(payload, prev));
    };

    const restoreSubgroup = (item: any) => {
        setCurrentValues(prev => {
            const draft = JSON.parse(JSON.stringify(prev));

            // 1. Restore core data
            if (!draft.catalog_groups) draft.catalog_groups = {};
            draft.catalog_groups[item.name] = item.catalogs;

            if (item.imageUrl) {
                if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
                draft.catalog_group_image_urls[item.name] = item.imageUrl;
            }

            // 2. Restore ordering references
            const targetUUID = item.parentUUID || Object.keys(draft.main_catalog_groups || {})[0];
            if (targetUUID) {
                if (!draft.subgroup_order) draft.subgroup_order = {};
                if (!Array.isArray(draft.subgroup_order[targetUUID])) draft.subgroup_order[targetUUID] = [];
                if (!draft.subgroup_order[targetUUID].includes(item.name)) {
                    draft.subgroup_order[targetUUID].push(item.name);
                }

                if (draft.main_catalog_groups?.[targetUUID]) {
                    if (!Array.isArray(draft.main_catalog_groups[targetUUID].subgroupNames)) {
                        draft.main_catalog_groups[targetUUID].subgroupNames = [];
                    }
                    if (!draft.main_catalog_groups[targetUUID].subgroupNames.includes(item.name)) {
                        draft.main_catalog_groups[targetUUID].subgroupNames.push(item.name);
                    }
                }
            }

            return draft;
        });

        setDeletedSubgroups(prev => prev.filter(i => i.name !== item.name || i.deletedAt !== item.deletedAt));
    };

    const clearDeletedSubgroups = () => {
        setDeletedSubgroups([]);
        setDeletedMainGroups([]);
    };

    // --- Manifest Catalog Mutations ---
    // These directly mutate the config.catalogs[] array

    const updateCatalogField = (id: string, patch: Record<string, any>) => {
        setCatalogs(prev => {
            return prev.map(c => {
                if (c.id !== id) return c;
                const updated = { ...c };
                for (const [key, val] of Object.entries(patch)) {
                    if (key === 'metadata') {
                        updated.metadata = { ...c.metadata, ...val };
                    } else {
                        updated[key] = val;
                    }
                }
                return updated;
            });
        });
    };

    const addManifestCatalog = (catalog: { id: string; name: string; enabled?: boolean; showInHome?: boolean }) => {
        const finalId = ensureCatalogPrefix(catalog.id, catalog.name);
        setCatalogs(prev => {
            if (prev.find(c => c.id === finalId)) return prev; // No duplicates
            const newCat = {
                enabled: catalog.enabled ?? true, // Default to true if called from Catalog Manager
                showInHome: catalog.showInHome ?? false,
                ...catalog,
                id: finalId
            };
            if (isSyntheticSession) {
                (newCat as any)._synthetic = true;
            }
            return [...prev, newCat];
        });
    };

    const removeManifestCatalog = (id: string) => {
        // Soft delete: set enabled=false and showInHome=false
        setCatalogs(prev => prev.map(c => c.id === id ? { ...c, enabled: false, showInHome: false } : c));
        // Also sweep from all side arrays (including starred_catalogs) so it properly moves to DisabledCatalogs
        setCurrentValues(prev => disableCatalog(id, prev));
    };

    const reorderManifestCatalogs = (newCatalogs: any[]) => {
        setCatalogs(newCatalogs);
    };

    const removeCatalog = (id: string) => {
        setCurrentValues(prev => disableCatalog(id, prev));
    };

    const countReferences = (name: string, isMainGroup: boolean = false): number => {
        return isMainGroup
            ? countMainGroupReferences(name, currentValues)
            : countGroupReferences(name, currentValues);
    };

    const cleanupOrphans = () => {
        setCurrentValues(prev => validateAndFix(prev));
    };

    const resetAll = () => {
        if (originalConfig) {
            loadConfig(originalConfig, fileName);
        }
    };

    const unloadConfig = () => {
        setOriginalConfig(null);
        setCurrentValues({});
        setInitialValues({});
        setCatalogs([]);
        setFileName("omni-config.json");
    };

    const exportConfig = (): OmniConfig | null => {
        if (!originalConfig) return null;

        // 1. Start with deep clone of current decoded values
        let clonedValues = JSON.parse(JSON.stringify(currentValues));

        // 2. Prune explicitly disabled keys (from GenericRenderer toggles)
        clonedValues = pruneDisabledKeys(clonedValues, disabledKeys);

        // 3. Prune disabled catalogs (remove from arrays and entries)
        // Only prune if it's completely inactive (shelf, top row, and Header all disabled)
        const starred = new Set(clonedValues.starred_catalogs || []);
        const deadCatalogs = new Set(
            catalogs.filter(c => c.enabled === false && c.showInHome !== true && !starred.has(c.id)).map(c => c.id)
        );
        clonedValues = pruneDisabledCatalogs(clonedValues, deadCatalogs);

        // 4. Validate, Fix and Reorder keys
        // This also MUST happen while decoded
        const validatedValues = validateAndFix(clonedValues);

        // 5a. If manifest mode (config.catalogs[]) — real objects, not synthetic
        const finalResult: any = { ...originalConfig };
        const isSynthetic = isSyntheticSession;

        if (originalConfig.config && !isSynthetic && catalogs.length > 0) {
            // Manifest format: write catalogs back into config.catalogs[]
            const cleanCatalogs = catalogs.map(c => { const out = { ...c }; delete out._synthetic; return out; });

            // Also merge any side-array changes from currentValues (e.g. landscape_catalogs added by editor)
            // These live in currentValues but aren't catalog objects
            const sideArrayKeys = ['landscape_catalogs', 'small_catalogs', 'small_top_row_catalogs', 'pinned_catalogs', 'starred_catalogs', 'custom_catalog_names', 'top_row_item_limits'];
            const mergedConfig: any = { ...(originalConfig.config || {}) };
            for (const key of sideArrayKeys) {
                if (currentValues[key] !== undefined) {
                    mergedConfig[key] = currentValues[key];
                }
            }

            finalResult.config = { ...mergedConfig, catalogs: cleanCatalogs };
            return finalResult;
        }

        // 5b. State format (or synthetic): encode values with updated state arrays
        // Sync the synthetic catalog state back to currentValues arrays before encoding
        const valuesToExport = { ...validatedValues };
        if (isSynthetic) {
            const activeIds = catalogs.map(c => c.id);
            const enabledIds = catalogs.filter(c => c.enabled !== false).map(c => c.id);
            const topRowIds = catalogs.filter(c => c.showInHome).map(c => c.id);
            const customNamesOut: Record<string, string> = {};
            const limitsOut: Record<string, number> = {};
            catalogs.forEach(c => {
                if (c.name && c.name !== c.id) customNamesOut[c.id] = c.name;
                if (c.metadata?.itemCount) limitsOut[c.id] = c.metadata.itemCount;
            });

            // Ensure selected_catalogs is always updated as it's the main reading source
            let finalEnabledIds = enabledIds;
            if (finalEnabledIds.length > 1 && finalEnabledIds.includes("omni_empty_setup_placeholder")) {
                finalEnabledIds = finalEnabledIds.filter(id => id !== "omni_empty_setup_placeholder");
            }
            valuesToExport.selected_catalogs = finalEnabledIds;
            // Also update catalog_ordering if the original config used it. It MUST contain all active catalogs (including hidden ones for top row)
            if (valuesToExport.catalog_ordering !== undefined) {
                valuesToExport.catalog_ordering = activeIds;
            }
            valuesToExport.top_row_catalogs = topRowIds;
            if (Object.keys(customNamesOut).length) valuesToExport.custom_catalog_names = { ...(valuesToExport.custom_catalog_names || {}), ...customNamesOut };
            if (Object.keys(limitsOut).length) valuesToExport.top_row_item_limits = limitsOut;
        }

        const originalValues = originalConfig.values || originalConfig.config || {};
        const encodedValues = encodeConfig(valuesToExport, originalValues, disabledKeys);

        if (originalConfig.values) {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        } else if (originalConfig.config) {
            finalResult.config = encodedValues;
        } else {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        }

        return finalResult;
    };

    const exportPartialConfig = (sectionKeys: string[]): OmniConfig | null => {
        if (!originalConfig) return null;

        // Build a filtered values map containing only the specified section keys
        const filteredValues: Record<string, any> = {};
        for (const key of sectionKeys) {
            if (currentValues[key] !== undefined) {
                filteredValues[key] = JSON.parse(JSON.stringify(currentValues[key]));
            }
        }

        // Also include main_group_order if exporting group keys
        if (sectionKeys.includes('main_catalog_groups') && currentValues.main_group_order) {
            filteredValues.main_group_order = JSON.parse(JSON.stringify(currentValues.main_group_order));
        }

        // Validate & fix the filtered subset
        const validatedValues = validateAndFix(filteredValues);

        // Encode using the original values for format detection
        const originalValues = originalConfig.values || originalConfig.config || {};
        const encodedValues = encodeConfig(validatedValues, originalValues, disabledKeys);

        // Build the full config shell
        const finalResult: any = { ...originalConfig };
        if (originalConfig.values) {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        } else if (originalConfig.config) {
            // Preserve config structure but only with partial values
            finalResult.config = encodedValues;
        } else {
            finalResult.values = encodedValues;
            finalResult.includedKeys = Object.keys(encodedValues);
        }

        return finalResult;
    };

    const clearPatterns = () => {
        const patternKeys = [
            "pattern_tag_enabled_patterns",
            "regex_pattern_custom_names",
            "regex_pattern_image_urls",
            "pattern_default_filter_enabled_patterns",
            "pattern_image_color_indices",
            "pattern_border_radius_indices",
            "pattern_background_opacities",
            "pattern_border_thickness_indices",
            "pattern_color_indices",
            "pattern_color_hex_values",
            "auto_play_enabled_patterns",
            "auto_play_patterns"
        ];

        setCurrentValues(prev => {
            const draft = { ...prev };
            patternKeys.forEach(key => {
                if (Array.isArray(prev[key])) {
                    draft[key] = [];
                } else if (typeof prev[key] === "object" && prev[key] !== null) {
                    draft[key] = {};
                } else {
                    delete draft[key];
                }
            });
            return draft;
        });
    };

    return (
        <ConfigContext.Provider value={{
            originalConfig,
            initialValues,
            currentValues,
            disabledKeys,
            disabledCatalogs,
            deletedSubgroups,
            deletedMainGroups,
            catalogs,
            fileName,
            isLoaded: !!originalConfig,
            loadConfig,
            updateValue,
            toggleKey,
            toggleCatalog,
            updateCatalogsOrder,
            updateCatalogField,
            addManifestCatalog,
            removeManifestCatalog,
            reorderManifestCatalogs,
            renameCatalogGroup,
            renameMainCatalogGroup,
            removeMainCatalogGroup,
            removeCatalogGroup,
            unassignCatalogGroup,
            assignCatalogGroup,
            addMainCatalogGroup,
            addCatalogGroup,
            importGroups: importGroupsToState,
            removeCatalog,
            countReferences,
            restoreSubgroup,
            restoreMainGroup,
            clearDeletedSubgroups,
            cleanupOrphans,
            resetAll,
            unloadConfig,
            exportConfig,
            exportPartialConfig,
            customFallbacks,
            setCustomFallbacks,
            clearPatterns,
            manifest,
            manifestStatus,
            fetchManifest,
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error("useConfig must be used within ConfigProvider");
    return context;
};

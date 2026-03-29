"use client";

import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, ReactNode } from "react";
import { produce } from "immer";
import { OmniConfig } from "../lib/types";
import { resolveCatalogName, ensureCatalogPrefix } from '@/lib/utils';
import { CatalogFallback } from "@/lib/catalog-fallbacks";
import { decodeConfig } from "../lib/config-utils";
import { renameGroup, renameMainGroup, disableGroup, disableMainGroup, disableCatalog, pruneCatalogFromManager, validateAndFix, countGroupReferences, countMainGroupReferences, unassignSubgroup, assignSubgroup, createMainGroup, createSubgroup, importGroups } from "../lib/mutations";
import { MDBLIST_SETTINGS_KEYS, normalizeMdblistSettings } from "../lib/mdblist-ratings";
import { buildExportConfig, buildPartialExportConfig } from "../lib/export-config";
import { fetchGithubTemplates } from "../lib/github-fetch";
import { APP_VERSION } from "@/lib/constants";
import { referenceOrShallowEqual } from "@/lib/equality";
import { measureSync } from "@/lib/perf";
import { updateValueAtPath } from "@/lib/state-update";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Omni configs are user-defined dynamic JSON blobs.
type LooseAny = any;
type ConfigValues = Record<string, LooseAny>;

type ManifestCatalog = {
    id: string;
    name: string;
    enabled?: boolean;
    showInHome?: boolean;
    metadata?: Record<string, LooseAny> & { itemCount?: number };
    _synthetic?: boolean;
    [key: string]: LooseAny;
};

type DeletedSubgroup = {
    name: string;
    catalogs?: string[];
    imageUrl?: string;
    parentUUID?: string;
    parentName?: string;
    deletedAt: string;
};

type DeletedMainGroup = {
    uuid: string;
    name: string;
    subgroupNames?: string[];
    deletedAt: string;
};

type ImportGroupsPayload = {
    mainGroups: Record<string, LooseAny>;
    subgroups: Record<string, { catalogs?: string[]; imageUrl?: string; renameFrom?: string; overwriteCatalogs?: boolean; overwriteImage?: boolean }>;
    standaloneAssignments: Record<string, string>;
    metadata?: {
        custom_catalog_names?: Record<string, string>;
        regex_pattern_image_urls?: Record<string, string>;
        enabled_patterns?: string[];
    };
    globalSettings?: Record<string, LooseAny>;
};

type ExportableConfig = OmniConfig & {
    values?: ConfigValues;
    config?: ConfigValues;
    includedKeys?: string[];
    catalogs?: ManifestCatalog[];
};

type StaticSessionData = {
    originalConfig: OmniConfig;
    initialValues: ConfigValues;
    fileName: string;
    savedAt: string;
};

type DraftSessionData = {
    currentValues: ConfigValues;
    disabledKeys: string[];
    disabledCatalogs: string[];
    deletedSubgroups: DeletedSubgroup[];
    deletedMainGroups: DeletedMainGroup[];
    catalogs: ManifestCatalog[];
    savedAt: string;
};

export type SessionSaveResult = {
    status: "saved" | "skipped_unchanged" | "skipped_too_large" | "failed";
    scope: "static" | "draft";
    bytes: number;
    savedAt: string;
    reason?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

type IdleWindow = Window & typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
};

const runWhenBrowserIsIdle = (callback: () => void) => {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    const idleWindow = window as IdleWindow;
    if (typeof idleWindow.requestIdleCallback === "function") {
        const idleId = idleWindow.requestIdleCallback(callback, { timeout: 1200 });
        return () => {
            if (typeof idleWindow.cancelIdleCallback === "function") {
                idleWindow.cancelIdleCallback(idleId);
            }
        };
    }

    const timeoutId = window.setTimeout(callback, 0);
    return () => window.clearTimeout(timeoutId);
};

const CATALOG_ID_LIST_KEYS = [
    "catalog_ordering",
    "landscape_catalogs",
    "pinned_catalogs",
    "randomized_catalogs",
    "selected_catalogs",
    "small_catalogs",
    "small_toprow_catalogs",
    "starred_catalogs",
    "top_row_catalogs",
] as const;

const normalizeCatalogIdValue = (id: string, customNames: Record<string, string>) =>
    ensureCatalogPrefix(id, resolveCatalogName(id, customNames));

const normalizeCatalogIdList = (value: unknown, customNames: Record<string, string>): string[] | undefined => {
    if (!Array.isArray(value)) return undefined;

    const normalized: string[] = [];
    value.forEach((entry) => {
        if (typeof entry !== "string") return;
        const catalogId = normalizeCatalogIdValue(entry, customNames);
        if (!normalized.includes(catalogId)) {
            normalized.push(catalogId);
        }
    });
    return normalized;
};

const normalizeCatalogRecordKeys = <T,>(value: unknown, customNames: Record<string, string>): Record<string, T> | undefined => {
    if (!isRecord(value)) return undefined;

    const normalized: Record<string, T> = {};
    Object.entries(value).forEach(([key, entry]) => {
        const targetKey = key.startsWith("_") ? key : normalizeCatalogIdValue(key, customNames);
        normalized[targetKey] = entry as T;
    });
    return normalized;
};

const getSerializedByteSize = (value: string) =>
    typeof TextEncoder !== "undefined" ? new TextEncoder().encode(value).length : value.length;

const STATIC_SESSION_MAX_BYTES = 2_000_000;
const DRAFT_SESSION_MAX_BYTES = 2_500_000;

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

export interface ConfigStoreState {
    originalConfig: OmniConfig | null;
    initialValues: ConfigValues;
    currentValues: ConfigValues;
    disabledKeys: Set<string>;
    disabledCatalogs: Set<string>;
    deletedSubgroups: DeletedSubgroup[];
    deletedMainGroups: DeletedMainGroup[];
    catalogs: ManifestCatalog[];
    fileName: string;
    isLoaded: boolean;
    customFallbacks: Record<string, string | CatalogFallback>;
    manifest: TemplateManifest | null;
    manifestStatus: 'idle' | 'loading' | 'success' | 'error';
    sessionSaveStatus: SessionSaveResult | null;
}

export interface ConfigActions {
    loadConfig: (config: OmniConfig, fileName?: string) => void;
    updateValue: (keyPath: string[], value: LooseAny) => void;
    toggleKey: (keyPath: string[], isEnabled: boolean) => void;
    toggleCatalog: (catalogId: string, isEnabled: boolean) => void;
    toggleShelf: (shelfName: string, isEnabled: boolean) => void;
    reorderShelves: (newOrder: string[]) => void;
    toggleStreamElement: (elementName: string, isVisible: boolean) => void;
    reorderStreamElements: (newOrder: string[]) => void;
    updateCatalogsOrder: (newOrder: LooseAny[]) => void;
    // Manifest catalog mutations (direct operations on config.catalogs[])
    updateCatalogField: (id: string, patch: Record<string, LooseAny>) => void;
    addManifestCatalog: (catalog: { id: string; name: string; enabled?: boolean; showInHome?: boolean }) => void;
    removeManifestCatalog: (id: string) => void;
    reorderManifestCatalogs: (newCatalogs: ManifestCatalog[]) => void;
    bulkRemoveManifestCatalogs: (ids: string[]) => void;
    renameCatalogGroup: (oldName: string, newName: string) => void;
    renameMainCatalogGroup: (uuid: string, newName: string) => void;
    removeMainCatalogGroup: (uuid: string) => void;
    removeCatalogGroup: (name: string) => void;
    unassignCatalogGroup: (name: string) => void;
    assignCatalogGroup: (name: string, targetMainGroupUuid: string) => void;
    addMainCatalogGroup: (name: string, assignedSubgroups: string[]) => void;
    addCatalogGroup: (name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs?: string[]) => void;
    importGroups: (payload: ImportGroupsPayload) => void;
    removeCatalog: (id: string) => void;
    countReferences: (name: string, isMainGroup?: boolean) => number;
    restoreSubgroup: (subgroup: DeletedSubgroup) => void;
    restoreMainGroup: (mainGroup: DeletedMainGroup) => void;
    clearDeletedSubgroups: () => void;
    cleanupOrphans: () => void;
    resetAll: () => void;
    unloadConfig: () => void;
    exportConfig: () => OmniConfig | null;
    exportPartialConfig: (sectionKeys: string[]) => OmniConfig | null;
    setCustomFallbacks: React.Dispatch<React.SetStateAction<Record<string, string | CatalogFallback>>>;
    clearPatterns: () => void;

    fetchManifest: () => Promise<void>;
    discardSession: () => void;
}

type ConfigStoreApi = {
    getSnapshot: () => ConfigStoreState;
    subscribe: (listener: () => void) => () => void;
};

type ConfigContextType = ConfigStoreState & ConfigActions;

const ConfigStoreContext = createContext<ConfigStoreApi | undefined>(undefined);
const ConfigActionsContext = createContext<ConfigActions | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [originalConfig, setOriginalConfig] = useState<OmniConfig | null>(null);
    const [initialValues, setInitialValues] = useState<ConfigValues>({});
    const [currentValues, setCurrentValues] = useState<ConfigValues>({});
    const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());
    const [disabledCatalogs, setDisabledCatalogs] = useState<Set<string>>(new Set());
    const [deletedSubgroups, setDeletedSubgroups] = useState<DeletedSubgroup[]>([]);
    const [deletedMainGroups, setDeletedMainGroups] = useState<DeletedMainGroup[]>([]);
    const [catalogs, setCatalogs] = useState<ManifestCatalog[]>([]);
    const [fileName, setFileName] = useState<string>("omni-config.json");
    const [isSyntheticSession, setIsSyntheticSession] = useState(false);
    const [sessionSaveStatus, setSessionSaveStatus] = useState<SessionSaveResult | null>(null);
    const lastStaticSessionSignatureRef = useRef<string>("");
    const lastDraftSessionSignatureRef = useRef<string>("");
    const storeListenersRef = useRef(new Set<() => void>());

    // Custom fallbacks from localStorage
    const [customFallbacks, setCustomFallbacks] = useState<Record<string, string | CatalogFallback>>({});

    // Session Persistence Key
    const SESSION_KEY = "omni_editor_session_v1";
    const SESSION_STATIC_KEY = "omni_editor_session_static_v2";
    const SESSION_DRAFT_KEY = "omni_editor_session_draft_v2";

    const restoreSessionState = (session: {
        originalConfig?: OmniConfig | null;
        currentValues?: ConfigValues;
        initialValues?: ConfigValues;
        disabledKeys?: string[];
        disabledCatalogs?: string[];
        deletedSubgroups?: DeletedSubgroup[];
        deletedMainGroups?: DeletedMainGroup[];
        catalogs?: ManifestCatalog[];
        fileName?: string;
    }) => {
        if (!session.originalConfig) return;

        setOriginalConfig(session.originalConfig);
        setCurrentValues(session.currentValues || {});
        setInitialValues(session.initialValues || {});
        setDisabledKeys(new Set(
            (session.disabledKeys || []).filter(
                (key: string) => !MDBLIST_SETTINGS_KEYS.includes(key as typeof MDBLIST_SETTINGS_KEYS[number])
            )
        ));
        setDisabledCatalogs(new Set(session.disabledCatalogs || []));
        setDeletedSubgroups(session.deletedSubgroups || []);
        setDeletedMainGroups(session.deletedMainGroups || []);
        setCatalogs(session.catalogs || []);
        setFileName(session.fileName || "omni-config.json");
    };

    const persistStaticSessionData = (sessionData: StaticSessionData): SessionSaveResult => {
        const serialized = JSON.stringify(sessionData);
        const bytes = getSerializedByteSize(serialized);

        if (serialized === lastStaticSessionSignatureRef.current) {
            const result: SessionSaveResult = {
                status: "skipped_unchanged",
                scope: "static",
                bytes,
                savedAt: new Date().toISOString(),
            };
            setSessionSaveStatus(result);
            return result;
        }

        if (bytes > STATIC_SESSION_MAX_BYTES) {
            const result: SessionSaveResult = {
                status: "skipped_too_large",
                scope: "static",
                bytes,
                savedAt: new Date().toISOString(),
                reason: "Static session payload exceeded the configured limit.",
            };
            setSessionSaveStatus(result);
            return result;
        }

        try {
            localStorage.setItem(SESSION_STATIC_KEY, serialized);
            lastStaticSessionSignatureRef.current = serialized;
            const result: SessionSaveResult = {
                status: "saved",
                scope: "static",
                bytes,
                savedAt: sessionData.savedAt,
            };
            setSessionSaveStatus(result);
            return result;
        } catch (e) {
            console.error("Failed to save static session data", e);
            const result: SessionSaveResult = {
                status: "failed",
                scope: "static",
                bytes,
                savedAt: new Date().toISOString(),
                reason: e instanceof Error ? e.message : "Unknown localStorage write failure.",
            };
            setSessionSaveStatus(result);
            return result;
        }
    };

    const persistDraftSessionData = (sessionData: DraftSessionData): SessionSaveResult => {
        const serialized = JSON.stringify(sessionData);
        const bytes = getSerializedByteSize(serialized);

        if (serialized === lastDraftSessionSignatureRef.current) {
            const result: SessionSaveResult = {
                status: "skipped_unchanged",
                scope: "draft",
                bytes,
                savedAt: new Date().toISOString(),
            };
            setSessionSaveStatus(result);
            return result;
        }

        if (bytes > DRAFT_SESSION_MAX_BYTES) {
            const result: SessionSaveResult = {
                status: "skipped_too_large",
                scope: "draft",
                bytes,
                savedAt: new Date().toISOString(),
                reason: "Draft session payload exceeded the configured limit.",
            };
            setSessionSaveStatus(result);
            return result;
        }

        try {
            localStorage.setItem(SESSION_DRAFT_KEY, serialized);
            lastDraftSessionSignatureRef.current = serialized;
            const result: SessionSaveResult = {
                status: "saved",
                scope: "draft",
                bytes,
                savedAt: sessionData.savedAt,
            };
            setSessionSaveStatus(result);
            return result;
        } catch (e) {
            console.error("Failed to save draft session data", e);
            const result: SessionSaveResult = {
                status: "failed",
                scope: "draft",
                bytes,
                savedAt: new Date().toISOString(),
                reason: e instanceof Error ? e.message : "Unknown localStorage write failure.",
            };
            setSessionSaveStatus(result);
            return result;
        }
    };

    // Auto-Recovery on Mount
    React.useEffect(() => {
        if (typeof window === "undefined") return;

        // 1. Load Custom Fallbacks (Existing logic)
        try {
            const storedFallbacks = localStorage.getItem("omni_custom_fallbacks");
            if (storedFallbacks) setCustomFallbacks(JSON.parse(storedFallbacks));
        } catch (e) {
            console.error("Failed to load custom fallbacks", e);
        }

        // 2. Load Session Draft
        try {
            const storedStaticSession = localStorage.getItem(SESSION_STATIC_KEY);
            const storedDraftSession = localStorage.getItem(SESSION_DRAFT_KEY);

            if (storedStaticSession && storedDraftSession) {
                const staticSession = JSON.parse(storedStaticSession);
                const draftSession = JSON.parse(storedDraftSession);
                lastStaticSessionSignatureRef.current = storedStaticSession;
                lastDraftSessionSignatureRef.current = storedDraftSession;
                restoreSessionState({ ...staticSession, ...draftSession });
                return;
            }

            const storedSession = localStorage.getItem(SESSION_KEY);
            if (storedSession) {
                restoreSessionState(JSON.parse(storedSession));
            }
        } catch (e) {
            console.error("Failed to restore session", e);
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_STATIC_KEY);
            localStorage.removeItem(SESSION_DRAFT_KEY);
        }
    }, []);

    // Persist static session metadata separately so frequent draft saves stay small.
    React.useEffect(() => {
        if (!originalConfig || typeof window === "undefined") return;

        let cancelIdle: () => void = () => {};
        const timer = setTimeout(() => {
            cancelIdle = runWhenBrowserIsIdle(() => {
                persistStaticSessionData({
                    originalConfig,
                    initialValues,
                    fileName,
                    savedAt: new Date().toISOString(),
                });
            });
        }, 800);

        return () => {
            clearTimeout(timer);
            cancelIdle();
        };
    }, [originalConfig, initialValues, fileName]);

    React.useEffect(() => {
        if (!originalConfig || typeof window === "undefined") return;

        let cancelIdle: () => void = () => {};
        const timer = setTimeout(() => {
            cancelIdle = runWhenBrowserIsIdle(() => {
                persistDraftSessionData({
                    currentValues,
                    disabledKeys: Array.from(disabledKeys),
                    disabledCatalogs: Array.from(disabledCatalogs),
                    deletedSubgroups,
                    deletedMainGroups,
                    catalogs,
                    savedAt: new Date().toISOString(),
                });
            });
        }, 1200);

        return () => {
            clearTimeout(timer);
            cancelIdle();
        };
    }, [originalConfig, currentValues, disabledKeys, disabledCatalogs, deletedSubgroups, deletedMainGroups, catalogs]);

    const discardSession = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_STATIC_KEY);
            localStorage.removeItem(SESSION_DRAFT_KEY);
        }
        lastStaticSessionSignatureRef.current = "";
        lastDraftSessionSignatureRef.current = "";
        setSessionSaveStatus(null);
        unloadConfig();
    };

    // GitHub Manifest State
    const [manifest, setManifest] = useState<TemplateManifest | null>(null);
    const [manifestStatus, setManifestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const manifestStatusRef = useRef<'idle' | 'loading' | 'success' | 'error'>('idle');
    const latestStateRef = useRef<ConfigStoreState | null>(null);
    const getLatestState = () => latestStateRef.current;

    const fetchManifest = useCallback(async () => {
        if (manifestStatusRef.current === 'loading' || manifestStatusRef.current === 'success') return;

        manifestStatusRef.current = 'loading';
        setManifestStatus('loading');
        try {
            const templates = await fetchGithubTemplates();
            
            if (templates.length === 0) throw new Error("No templates found on GitHub");

            const data: TemplateManifest = {
                version: APP_VERSION,
                lastUpdated: new Date().toISOString(),
                templates: templates
            };

            setManifest(data);
            manifestStatusRef.current = 'success';
            setManifestStatus('success');
        } catch (err) {
            console.error("Manifest fetch failed:", err);
            manifestStatusRef.current = 'error';
            setManifestStatus('error');
        }
    }, []);

    const loadConfig = (config: OmniConfig, fn = "omni-config.json") => {
        measureSync("loadConfig", () => {
            setOriginalConfig(config);
            setFileName(fn);

            // Map config.values OR config.config to internal values state
            const rawValues = (config.values || config.config || {}) as ConfigValues;
            const decodedValues: ConfigValues = {};

            // Decode fields if they use the base64 wrapper format (_data)
            for (const [key, val] of Object.entries(rawValues)) {
                decodedValues[key] = decodeConfig(val);
            }

        // Force-inject new settings that might be missing from older configs
        if (decodedValues.hide_addon_info_in_catalog_names === undefined) {
            decodedValues.hide_addon_info_in_catalog_names = true;
        }

        const rawCustomNames = isRecord(decodedValues.custom_catalog_names)
            ? (decodedValues.custom_catalog_names as Record<string, string>)
            : {};

        CATALOG_ID_LIST_KEYS.forEach((key) => {
            if (!Array.isArray(decodedValues[key])) return;
            const normalized: string[] = [];
            decodedValues[key].forEach((entry: string) => {
                if (typeof entry !== "string") return;
                const name = resolveCatalogName(entry, rawCustomNames);
                const explicitFallback = customFallbacks[entry] || customFallbacks[entry.replace(/^(movie:|series:|all:|anime:)/, '')];
                const explicitType = (explicitFallback && typeof explicitFallback !== 'string') ? explicitFallback.type : undefined;
                const catalogId = ensureCatalogPrefix(entry, name, explicitType);
                if (!normalized.includes(catalogId)) normalized.push(catalogId);
            });
            decodedValues[key] = normalized;
        });

        if (isRecord(decodedValues.catalog_groups)) {
            const normalizedGroups: Record<string, string[]> = {};
            Object.entries(decodedValues.catalog_groups).forEach(([groupName, catalogIds]) => {
                normalizedGroups[groupName] = normalizeCatalogIdList(catalogIds, rawCustomNames) || [];
            });
            decodedValues.catalog_groups = normalizedGroups;
        }

        const normalizedCustomNames = normalizeCatalogRecordKeys<string>(decodedValues.custom_catalog_names, rawCustomNames);
        if (normalizedCustomNames) {
            decodedValues.custom_catalog_names = normalizedCustomNames;
        }

        const normalizedTopRowLimits = normalizeCatalogRecordKeys<number>(decodedValues.top_row_item_limits, rawCustomNames);
        if (normalizedTopRowLimits) {
            decodedValues.top_row_item_limits = normalizedTopRowLimits;
        }

        // Extract catalogs if it's a manifest format (config.catalogs[])
        let extractedCatalogs: ManifestCatalog[] = [];
        const configCatalogs = (config.config as ConfigValues | undefined)?.catalogs;
        const rootCatalogs = (config as ExportableConfig).catalogs;

        if (Array.isArray(configCatalogs)) {
            extractedCatalogs = configCatalogs as ManifestCatalog[];
        } else if (Array.isArray(rootCatalogs)) {
            extractedCatalogs = rootCatalogs;
        }

        // FALLBACK: If no manifest catalogs found, synthesize minimal objects from state-format selected_catalogs
        if (extractedCatalogs.length === 0) {
            const selectedList: string[] = decodedValues.selected_catalogs || [];
            const decodedCatalogOrdering: string[] = decodedValues.catalog_ordering || selectedList;
            const topRowList: string[] = decodedValues.top_row_catalogs || [];
            const smallTopRowList: string[] = decodedValues.small_toprow_catalogs || [];
            const customNames: Record<string, string> = decodedValues.custom_catalog_names || {};
            const topRowLimits: Record<string, number> = decodedValues.top_row_item_limits || {};

            // Collect IDs from all other side-arrays
            const landscapeList: string[] = decodedValues.landscape_catalogs || [];
            const smallList: string[] = decodedValues.small_catalogs || [];
            const randomList: string[] = decodedValues.randomized_catalogs || [];
            const pinnedList: string[] = decodedValues.pinned_catalogs || [];
            const starredList: string[] = decodedValues.starred_catalogs || [];

            // Main config paths that represent "active" visibility or ordering
            const mainConfigIds = new Set([
                ...decodedCatalogOrdering,
                ...selectedList,
                ...topRowList,
                ...smallTopRowList,
                ...pinnedList,
                ...starredList,
            ]);

            // All IDs in scope (ordering, selected, top row, and ALL side-arrays)
            const allIds = new Set([
                ...mainConfigIds,
                ...landscapeList,
                ...smallList,
                ...randomList,
                ...pinnedList,
                ...starredList,
                ...(decodedValues.starred_catalogs || []),
                ...(decodedValues.pinned_catalogs || [])
            ]);

            extractedCatalogs = Array.from(allIds).map(id => {
                const name = resolveCatalogName(id, customNames);
                const explicitFallback = customFallbacks[id] || customFallbacks[id.replace(/^(movie:|series:|all:|anime:)/, '')];
                const explicitType = (explicitFallback && typeof explicitFallback !== 'string') ? explicitFallback.type : undefined;
                const finalId = id.includes(":") ? id : ensureCatalogPrefix(id, name, explicitType);
                
                // ENABLED status: Primary source is selected_catalogs (the shelf list). 
                const isEnabled = selectedList.includes(id);
                
                // ORPHANED status: Found in side-arrays but NOT in main config paths
                const isOrphaned = !mainConfigIds.has(id);

                return {
                    id: finalId,
                    name: name === id ? id : name,
                    enabled: isEnabled,
                    showInHome: topRowList.includes(id) || smallTopRowList.includes(id),
                    metadata: topRowLimits[id] ? { itemCount: topRowLimits[id] } : undefined,
                    isOrphaned,
                    _synthetic: true,
                };
            });
            setIsSyntheticSession(true);
        } else {
            setIsSyntheticSession(false);
        }
        // Ensure shelf_order and disabled_shelves are present
        if (!Array.isArray(decodedValues.shelf_order)) {
            decodedValues.shelf_order = ["Continue Watching", "Top Row", "Catalog Groups", "Catalog", "Live TV", "AI Recommendations"];
        }
        if (!Array.isArray(decodedValues.disabled_shelves)) {
            decodedValues.disabled_shelves = [];
        }
        if (!Array.isArray(decodedValues.stream_button_elements_order) || decodedValues.stream_button_elements_order.length === 0) {
            decodedValues.stream_button_elements_order = ["Title", "Metadata Tags", "Pattern Tags", "Addon Name"];
        }
        if (!Array.isArray(decodedValues.hidden_stream_button_elements)) {
            decodedValues.hidden_stream_button_elements = [];
        }

        Object.assign(decodedValues, normalizeMdblistSettings(decodedValues));

        setCatalogs(extractedCatalogs);

        const finalizedValues = validateAndFix(decodedValues as ConfigValues);
        setCurrentValues(finalizedValues);
        setInitialValues(produce(finalizedValues, () => {}));

        // Populate disabledKeys from includedKeys if present
        const newDisabledKeys = new Set<string>();
        const includedKeys = (config.includedKeys as string[]) || [];
        if (includedKeys.length > 0) {
            // Check top-level keys in values
            Object.keys(rawValues).forEach(k => {
                // Never disable certain new keys if they are just missing from an old config's includedKeys
                if (
                    !includedKeys.includes(k)
                    && k !== "hide_addon_info_in_catalog_names"
                    && !MDBLIST_SETTINGS_KEYS.includes(k as typeof MDBLIST_SETTINGS_KEYS[number])
                ) {
                    newDisabledKeys.add(k);
                }
            });
        }
        setDisabledKeys(newDisabledKeys);

        setDisabledCatalogs(new Set());
        setDeletedSubgroups([]);
            setDeletedMainGroups([]);
        }, {
            fileName: fn,
            rawKeyCount: Object.keys((config.values || config.config || {}) as ConfigValues).length,
        });
    };

    const getValuePath = (obj: LooseAny, path: string[]): LooseAny => {
        return path.reduce<LooseAny>((acc, part) => {
            if (isRecord(acc) && acc[part] !== undefined) {
                return acc[part];
            }
            return undefined;
        }, obj);
    };

    const updateValue = (keyPath: string[], value: LooseAny) => {
        measureSync("updateValue", () => {
            setCurrentValues(prev => updateValueAtPath(prev, keyPath, value));
        }, { keyPath: keyPath.join(".") });
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

        const originalValues = (originalConfig?.values || originalConfig?.config) as ConfigValues | undefined;

        if (isEnabled && originalValues) {
            // Only restore if it is NOT in currentValues (preserving session-level deletions/changes)
            const currentVal = getValuePath(currentValues, keyPath);
            if (currentVal === undefined) {
                const origVal = getValuePath(originalValues, keyPath);
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

    const toggleShelf = (shelfName: string, isEnabled: boolean) => {
        setCurrentValues(prev => {
            const next = { ...prev };
            const disabled = new Set(next.disabled_shelves || []);
            if (isEnabled) disabled.delete(shelfName);
            else disabled.add(shelfName);
            next.disabled_shelves = Array.from(disabled);
            return next;
        });
    };

    const reorderShelves = (newOrder: string[]) => {
        setCurrentValues(prev => ({
            ...prev,
            shelf_order: newOrder
        }));
    };

    const toggleStreamElement = (elementName: string, isVisible: boolean) => {
        setCurrentValues(prev => {
            const next = { ...prev };
            const hidden = new Set(next.hidden_stream_button_elements || []);
            if (isVisible) hidden.delete(elementName);
            else hidden.add(elementName);
            next.hidden_stream_button_elements = Array.from(hidden);
            return next;
        });
    };

    const reorderStreamElements = (newOrder: string[]) => {
        setCurrentValues(prev => ({
            ...prev,
            stream_button_elements_order: newOrder
        }));
    };

    const updateCatalogsOrder = (newOrder: LooseAny[]) => {
        void newOrder;
        // Specifically for catalogs
    };

    const renameCatalogGroup = (oldName: string, newName: string) => {
        measureSync("renameGroup", () => {
            setCurrentValues(prev => renameGroup(oldName, newName, prev));
        }, { oldName, newName });
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

    const restoreMainGroup = (item: DeletedMainGroup) => {
        measureSync("restoreMainGroup", () => {
            setCurrentValues(prev => produce(prev, (draft) => {
                if (!draft.main_catalog_groups) draft.main_catalog_groups = {};
                draft.main_catalog_groups[item.uuid] = {
                    name: item.name,
                    subgroupNames: item.subgroupNames,
                };

                if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
                    draft.subgroup_order = {};
                }
                draft.subgroup_order[item.uuid] = item.subgroupNames;

                if (!Array.isArray(draft.main_group_order)) {
                    draft.main_group_order = [];
                }
                if (!draft.main_group_order.includes(item.uuid)) {
                    draft.main_group_order.push(item.uuid);
                }
            }));
        }, { uuid: item.uuid });

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

        const parentName = parentUUID ? (currentValues.main_catalog_groups?.[parentUUID]?.name || "Unassigned") : "Unassigned";

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
        measureSync("assignSubgroup", () => {
            setCurrentValues(prev => assignSubgroup(name, targetMainGroupUuid, prev));
        }, { name, targetMainGroupUuid });
    };

    const addMainCatalogGroup = (name: string, assignedSubgroups: string[]) => {
        setCurrentValues(prev => createMainGroup(name, assignedSubgroups, prev));
    };

    const addCatalogGroup = (name: string, targetMainGroupUuid: string, imageUrl: string, initialCatalogs: string[] = []) => {
        // Normalize IDs on addition to subgroup
        const normalized = initialCatalogs.map(id => ensureCatalogPrefix(id, resolveCatalogName(id, currentValues.custom_catalog_names || {})));

        setCurrentValues(prev => createSubgroup(name, targetMainGroupUuid, imageUrl, normalized, prev));
    };

    const importGroupsToState = (payload: ImportGroupsPayload) => {
        measureSync("importGroups", () => {
            setCurrentValues(prev => importGroups(payload, prev));
        }, {
            mainGroupCount: Object.keys(payload.mainGroups).length,
            subgroupCount: Object.keys(payload.subgroups).length,
        });
    };

    const restoreSubgroup = (item: DeletedSubgroup) => {
        measureSync("restoreSubgroup", () => {
            setCurrentValues(prev => produce(prev, (draft) => {
                if (!draft.catalog_groups) draft.catalog_groups = {};
                draft.catalog_groups[item.name] = item.catalogs;

                if (item.imageUrl) {
                    if (!draft.catalog_group_image_urls) draft.catalog_group_image_urls = {};
                    draft.catalog_group_image_urls[item.name] = item.imageUrl;
                }

                const targetUUID = item.parentUUID || Object.keys(draft.main_catalog_groups || {})[0];
                if (!targetUUID) return;

                if (!draft.subgroup_order || Array.isArray(draft.subgroup_order)) {
                    draft.subgroup_order = {};
                }
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
            }));
        }, { name: item.name });

        setDeletedSubgroups(prev => prev.filter(i => i.name !== item.name || i.deletedAt !== item.deletedAt));
    };

    const clearDeletedSubgroups = () => {
        setDeletedSubgroups([]);
        setDeletedMainGroups([]);
    };

    // --- Manifest Catalog Mutations ---
    // These directly mutate the config.catalogs[] array

    const updateCatalogField = (id: string, patch: Record<string, LooseAny>) => {
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

        // Sync side-arrays in currentValues for legacy bot compatibility
        setCurrentValues(prev => {
            return produce(prev, (draft) => {
                if (patch.enabled !== undefined) {
                    const list = Array.isArray(draft.selected_catalogs) ? [...draft.selected_catalogs] : [];
                    if (patch.enabled) {
                        if (!list.includes(id)) list.push(id);
                    } else {
                        const idx = list.indexOf(id);
                        if (idx !== -1) list.splice(idx, 1);
                    }
                    draft.selected_catalogs = list;
                }

                if (patch.showInHome !== undefined) {
                    const list = Array.isArray(draft.top_row_catalogs) ? [...draft.top_row_catalogs] : [];
                    if (patch.showInHome) {
                        if (!list.includes(id)) list.push(id);
                    } else {
                        const idx = list.indexOf(id);
                        if (idx !== -1) list.splice(idx, 1);
                    }
                    draft.top_row_catalogs = list;
                }

                if (patch.metadata?.itemCount !== undefined) {
                    const limits = { ...(draft.top_row_item_limits || {}) };
                    limits[id] = patch.metadata.itemCount;
                    draft.top_row_item_limits = limits;
                }
            });
        });
    };

    const addManifestCatalog = (catalog: { id: string; name: string; enabled?: boolean; showInHome?: boolean }) => {
        const finalId = ensureCatalogPrefix(catalog.id, catalog.name);
        setCatalogs(prev => {
            if (prev.find(c => c.id === finalId)) return prev; // No duplicates
            const newCat: ManifestCatalog = {
                enabled: catalog.enabled ?? true, // Default to true if called from Catalog Manager
                showInHome: catalog.showInHome ?? false,
                ...catalog,
                id: finalId
            };
            if (isSyntheticSession) {
                newCat._synthetic = true;
            }
            return [...prev, newCat];
        });
    };

    const removeManifestCatalog = (id: string) => {
        // Soft delete: set enabled=false and showInHome=false
        setCatalogs(prev => prev.map(c => c.id === id ? { ...c, enabled: false, showInHome: false } : c));
        // Catalog manager deletes must not mutate group-manager subgroup links.
        setCurrentValues(prev => pruneCatalogFromManager(id, prev));
    };

    const reorderManifestCatalogs = (newCatalogs: ManifestCatalog[]) => {
        setCatalogs(newCatalogs);
    };

    const bulkRemoveManifestCatalogs = (ids: string[]) => {
        const idSet = new Set(ids);
        setCatalogs(prev => prev.filter(c => !idSet.has(c.id)));
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
        return measureSync("buildExportConfig", () => buildExportConfig({
            originalConfig,
            currentValues,
            initialValues,
            disabledKeys,
            catalogs,
            isSyntheticSession,
        }), {
            manifestCatalogCount: catalogs.length,
        });
    };

    const exportPartialConfig = (sectionKeys: string[]): OmniConfig | null => {
        if (!originalConfig) return null;
        return measureSync("buildPartialExportConfig", () => buildPartialExportConfig({
            originalConfig,
            currentValues,
            disabledKeys,
            sectionKeys,
            catalogs,
        }), {
            sectionCount: sectionKeys.length,
            manifestCatalogCount: catalogs.length,
        });
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
            return produce(prev, (draft) => {
                patternKeys.forEach(key => {
                    if (Array.isArray(prev[key])) {
                        draft[key] = [];
                    } else if (typeof prev[key] === "object" && prev[key] !== null) {
                        draft[key] = {};
                    } else {
                        delete draft[key];
                    }
                });
            });
        });
    };

    const storeState = useMemo<ConfigStoreState>(() => ({
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
        customFallbacks,
        manifest,
        manifestStatus,
        sessionSaveStatus,
    }), [
        originalConfig,
        initialValues,
        currentValues,
        disabledKeys,
        disabledCatalogs,
        deletedSubgroups,
        deletedMainGroups,
        catalogs,
        fileName,
        customFallbacks,
        manifest,
        manifestStatus,
        sessionSaveStatus,
    ]);

    latestStateRef.current = storeState;

    const actionImplRef = useRef<ConfigActions | null>(null);
    actionImplRef.current = {
        loadConfig,
        updateValue,
        toggleKey,
        toggleCatalog,
        toggleShelf,
        reorderShelves,
        toggleStreamElement,
        reorderStreamElements,
        updateCatalogsOrder,
        updateCatalogField,
        addManifestCatalog,
        removeManifestCatalog,
        reorderManifestCatalogs,
        bulkRemoveManifestCatalogs,
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
        setCustomFallbacks,
        clearPatterns,
        fetchManifest,
        discardSession,
    };

    const actions = useMemo<ConfigActions>(() => ({
        loadConfig: (...args) => actionImplRef.current!.loadConfig(...args),
        updateValue: (...args) => actionImplRef.current!.updateValue(...args),
        toggleKey: (...args) => actionImplRef.current!.toggleKey(...args),
        toggleCatalog: (...args) => actionImplRef.current!.toggleCatalog(...args),
        toggleShelf: (...args) => actionImplRef.current!.toggleShelf(...args),
        reorderShelves: (...args) => actionImplRef.current!.reorderShelves(...args),
        toggleStreamElement: (...args) => actionImplRef.current!.toggleStreamElement(...args),
        reorderStreamElements: (...args) => actionImplRef.current!.reorderStreamElements(...args),
        updateCatalogsOrder: (...args) => actionImplRef.current!.updateCatalogsOrder(...args),
        updateCatalogField: (...args) => actionImplRef.current!.updateCatalogField(...args),
        addManifestCatalog: (...args) => actionImplRef.current!.addManifestCatalog(...args),
        removeManifestCatalog: (...args) => actionImplRef.current!.removeManifestCatalog(...args),
        reorderManifestCatalogs: (...args) => actionImplRef.current!.reorderManifestCatalogs(...args),
        bulkRemoveManifestCatalogs: (...args) => actionImplRef.current!.bulkRemoveManifestCatalogs(...args),
        renameCatalogGroup: (...args) => actionImplRef.current!.renameCatalogGroup(...args),
        renameMainCatalogGroup: (...args) => actionImplRef.current!.renameMainCatalogGroup(...args),
        removeMainCatalogGroup: (...args) => actionImplRef.current!.removeMainCatalogGroup(...args),
        removeCatalogGroup: (...args) => actionImplRef.current!.removeCatalogGroup(...args),
        unassignCatalogGroup: (...args) => actionImplRef.current!.unassignCatalogGroup(...args),
        assignCatalogGroup: (...args) => actionImplRef.current!.assignCatalogGroup(...args),
        addMainCatalogGroup: (...args) => actionImplRef.current!.addMainCatalogGroup(...args),
        addCatalogGroup: (...args) => actionImplRef.current!.addCatalogGroup(...args),
        importGroups: (...args) => actionImplRef.current!.importGroups(...args),
        removeCatalog: (...args) => actionImplRef.current!.removeCatalog(...args),
        countReferences: (...args) => actionImplRef.current!.countReferences(...args),
        restoreSubgroup: (...args) => actionImplRef.current!.restoreSubgroup(...args),
        restoreMainGroup: (...args) => actionImplRef.current!.restoreMainGroup(...args),
        clearDeletedSubgroups: (...args) => actionImplRef.current!.clearDeletedSubgroups(...args),
        cleanupOrphans: (...args) => actionImplRef.current!.cleanupOrphans(...args),
        resetAll: (...args) => actionImplRef.current!.resetAll(...args),
        unloadConfig: (...args) => actionImplRef.current!.unloadConfig(...args),
        exportConfig: (...args) => actionImplRef.current!.exportConfig(...args),
        exportPartialConfig: (...args) => actionImplRef.current!.exportPartialConfig(...args),
        setCustomFallbacks: (...args) => actionImplRef.current!.setCustomFallbacks(...args),
        clearPatterns: (...args) => actionImplRef.current!.clearPatterns(...args),
        fetchManifest: (...args) => actionImplRef.current!.fetchManifest(...args),
        discardSession: (...args) => actionImplRef.current!.discardSession(...args),
    }), []);

    const storeApi = useMemo<ConfigStoreApi>(() => ({
        getSnapshot: () => {
            const state = getLatestState();
            if (!state) {
                throw new Error("Config store snapshot is not initialized.");
            }
            return state;
        },
        subscribe: (listener) => {
            storeListenersRef.current.add(listener);
            return () => {
                storeListenersRef.current.delete(listener);
            };
        },
    }), []);

    useLayoutEffect(() => {
        storeListenersRef.current.forEach((listener) => listener());
    }, [storeState]);

    return (
        <ConfigStoreContext.Provider value={storeApi}>
            <ConfigActionsContext.Provider value={actions}>
                {children}
            </ConfigActionsContext.Provider>
        </ConfigStoreContext.Provider>
    );
};

const useConfigStore = () => {
    const context = useContext(ConfigStoreContext);
    if (!context) throw new Error("Config store is not available outside ConfigProvider.");
    return context;
};

export const useConfigActions = () => {
    const context = useContext(ConfigActionsContext);
    if (!context) throw new Error("Config actions are not available outside ConfigProvider.");
    return context;
};

export const useConfigSelector = <T,>(
    selector: (state: ConfigStoreState) => T,
    equalityFn: (left: T, right: T) => boolean = Object.is,
) => {
    const store = useConfigStore();
    const selectorRef = useRef(selector);
    const equalityRef = useRef(equalityFn);
    const hasSelectionRef = useRef(false);
    const selectionRef = useRef<T | undefined>(undefined);
    const snapshotRef = useRef<ConfigStoreState | undefined>(undefined);

    useLayoutEffect(() => {
        selectorRef.current = selector;
        equalityRef.current = equalityFn;
    }, [selector, equalityFn]);

    return useSyncExternalStore(
        store.subscribe,
        () => {
            const snapshot = store.getSnapshot();

            if (hasSelectionRef.current && snapshotRef.current === snapshot) {
                return selectionRef.current as T;
            }

            const nextSelection = selectorRef.current(snapshot);

            if (
                hasSelectionRef.current &&
                snapshotRef.current !== undefined &&
                equalityRef.current(selectionRef.current as T, nextSelection)
            ) {
                snapshotRef.current = snapshot;
                return selectionRef.current as T;
            }

            hasSelectionRef.current = true;
            snapshotRef.current = snapshot;
            selectionRef.current = nextSelection;
            return nextSelection;
        },
        () => selector(store.getSnapshot()),
    );
};

export const useConfig = (): ConfigContextType => {
    const state = useConfigSelector((snapshot) => snapshot);
    const actions = useConfigActions();
    return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

export const useConfigStoreState = () => useConfigSelector((state) => state, referenceOrShallowEqual);

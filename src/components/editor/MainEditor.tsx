"use client";

import { useId, useState, useEffect, useRef, Fragment, useMemo, useCallback } from "react";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericRenderer } from "@/components/editor/GenericRenderer";
import { CatalogEditor } from "@/components/editor/CatalogEditor";
import { MdblistRatingsEditor } from "@/components/editor/MdblistRatingsEditor";
import { ShelfOrderingEditor } from "@/components/editor/ShelfOrderingEditor";
import { StreamElementOrderingEditor } from "@/components/editor/StreamElementOrderingEditor";
import { UnifiedSubgroupEditor } from "@/components/editor/UnifiedSubgroupEditor";
import { UnifiedPatternEditor } from "@/components/editor/UnifiedPatternEditor";
import { ImportPatternsModal } from "@/components/editor/ImportPatternsModal";
import { AIOMetadataExportPanel } from "@/components/editor/AIOMetadataExportPanel";
import { LockedUrlInput } from "@/components/editor/LockedUrlInput";
import { ThemeToggle } from "@/components/theme-toggle";
import { Textarea } from "@/components/ui/textarea";
import { Documentation } from "@/components/editor/Documentation";
import { TemplateGuide } from "@/components/editor/TemplateGuide";
import { UpdateGuide } from "@/components/editor/UpdateGuide";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Download,
    Copy,
    RotateCcw,
    ChevronDown,
    Sun,
    Moon,
    Check,
    UploadCloud,
    BookOpen,
    Menu,
    FileJson,
    Trash2,
    Heart,
    LogOut,
    AlertTriangle,
    Pencil,
    MoreHorizontal,
    Monitor,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { analyzeAIOMetadataCatalogMismatches } from "@/lib/aiometadata-mismatch";
import { deriveAIOMetadataConfigLoadUrl, pickRicherAIOMetadataPayload } from "@/lib/aiometadata-source";
import {
    mergeAIOMetadataCatalogs,
    parseAIOMetadataFallbacks,
    type AIOMetadataNormalizedCatalog,
} from "@/lib/aiometadata-sync";
import { cn, isIos } from "@/lib/utils";
import { useTheme } from "next-themes";
import { editorAction, editorHover, editorSurface } from "@/components/editor/ui/style-contract";
import { EditorNotice } from "@/components/editor/ui/EditorNotice";
import { AppMeta } from "@/components/editor/AppMeta";
import { EditorPerfDebugPanel } from "@/components/editor/EditorPerfDebugPanel";
import { measureAsync, measureSync } from "@/lib/perf";
import { shallowEqualObject } from "@/lib/equality";
import { fetchTextWithLimits } from "@/lib/remote-fetch";

type UiNotice = {
    tone: "success" | "error" | "info";
    message: string;
    placement?: "global" | "aiometadata" | "aiometadata-editor";
};

type AIOMetadataSyncState = {
    sourceType: "url" | "json" | "file";
    sourceLabel: string;
    sourceValue?: string;
    syncedAt?: string;
    catalogs?: AIOMetadataNormalizedCatalog[];
};

type ScrollSnapshot = {
    sectionId: string;
    offsetWithinSection: number;
    scrollPercent: number;
};

type ProcessAIOMetadataOptions = {
    showSuccessNotice?: boolean;
};

type SyncAIOMetadataFromUrlOptions = {
    showSuccessNotice?: boolean;
    preserveScroll?: boolean;
    errorPlacement?: UiNotice["placement"];
    errorMessage?: string;
};

const EDITOR_SECTIONS = [
    { id: "aiometadata", title: "AIOMetadata Integration", keys: [] },
    { id: "groups", title: "Group Manager", keys: ["subgroup_order", "main_catalog_groups", "catalog_group_image_urls", "catalog_groups"] },
    { id: "catalogs", title: "Catalog Manager", keys: ["selected_catalogs", "pinned_catalogs", "small_catalogs", "top_row_catalogs", "starred_catalogs", "randomized_catalogs", "small_toprow_catalogs", "catalog_ordering", "custom_catalog_names", "landscape_catalogs", "top_row_item_limits"] },
    { id: "settings", title: "General Settings", keys: ["shelf_order", "disabled_shelves", "hide_external_playback_prompt", "hide_spoilers", "small_continue_watching_shelf", "hidden_stream_button_elements", "oled_mode_enabled", "preferred_audio_language", "preferred_subtitle_language"] },
    { id: "patterns", title: "Patterns & Regex", keys: ["pattern_tag_enabled_patterns", "regex_pattern_custom_names", "regex_pattern_image_urls", "pattern_default_filter_enabled_patterns", "pattern_image_color_indices", "pattern_border_radius_indices", "pattern_background_opacities", "pattern_border_thickness_indices", "pattern_color_indices", "pattern_color_hex_values", "auto_play_enabled_patterns", "auto_play_patterns"] },
];

const AIOMETADATA_SYNC_STORAGE_KEY = "omni_aiometadata_sync_v1";

export function MainEditor() {
    const {
        originalConfig,
        currentValues,
        catalogs,
        fileName,
        customFallbacks,
        sessionSaveStatus,
    } = useConfigSelector((state) => ({
        originalConfig: state.originalConfig,
        currentValues: state.currentValues,
        catalogs: state.catalogs,
        fileName: state.fileName,
        customFallbacks: state.customFallbacks,
        sessionSaveStatus: state.sessionSaveStatus,
    }), shallowEqualObject);
    const {
        exportConfig,
        exportPartialConfig,
        setCustomFallbacks,
        discardSession,
    } = useConfigActions();
    const searchTerm = "";
    const exportSetupNameId = useId();
    const fallbackFileInputRef = useRef<HTMLInputElement>(null);
    const aiomUrlInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [isImportPatternsOpen, setIsImportPatternsOpen] = useState(false);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const [activeGuide, setActiveGuide] = useState<"install" | "update" | "use">("use");
    const [isSectionsOpen, setIsSectionsOpen] = useState(false);
    const [isDesktopDocsMenuOpen, setIsDesktopDocsMenuOpen] = useState(false);
    const [isMobileDocsMenuOpen, setIsMobileDocsMenuOpen] = useState(false);
    const [aioManifestUrlInput, setAioManifestUrlInput] = useState("");
    const [aioManifestUrlDraft, setAioManifestUrlDraft] = useState("");
    const [aioJsonInput, setAioJsonInput] = useState("");
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [isImportingUrl, setIsImportingUrl] = useState(false);
    const [aioSyncState, setAioSyncState] = useState<AIOMetadataSyncState | null>(null);
    const [isAioImportEditorOpen, setIsAioImportEditorOpen] = useState(true);

    const [activeSectionId, setActiveSectionId] = useState("aiometadata");
    const [isCopied, setIsCopied] = useState(false);
    const [uiNotice, setUiNotice] = useState<UiNotice | null>(null);
    const [isFallbackDropActive, setIsFallbackDropActive] = useState(false);
    const [isIosDevice, setIsIosDevice] = useState(false);
    const activeAioImportRequestRef = useRef<Promise<void> | null>(null);
    const hasAutoResyncedAioRef = useRef(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setIsIosDevice(isIos());
    }, []);
    const scrollContainerRef = useRef<HTMLElement>(null);
    const scrollSnapshotRef = useRef<ScrollSnapshot | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const storedSyncState = localStorage.getItem(AIOMETADATA_SYNC_STORAGE_KEY);
            if (storedSyncState) {
                const parsed = JSON.parse(storedSyncState) as Partial<AIOMetadataSyncState>;
                if (
                    parsed &&
                    (parsed.sourceType === "url" || parsed.sourceType === "json" || parsed.sourceType === "file") &&
                    typeof parsed.sourceLabel === "string"
                ) {
                    setAioSyncState({
                        sourceType: parsed.sourceType,
                        sourceLabel: parsed.sourceLabel,
                        sourceValue: typeof parsed.sourceValue === "string" ? parsed.sourceValue : undefined,
                        syncedAt: typeof parsed.syncedAt === "string" ? parsed.syncedAt : undefined,
                        catalogs: Array.isArray(parsed.catalogs) ? parsed.catalogs as AIOMetadataNormalizedCatalog[] : undefined,
                    });

                    if (parsed.sourceType === "url" && typeof parsed.sourceValue === "string") {
                        setAioManifestUrlInput(parsed.sourceValue);
                        setAioManifestUrlDraft(parsed.sourceValue);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to restore AIOMetadata sync state", error);
        }

        try {
            const storedFallbacks = localStorage.getItem("omni_custom_fallbacks");
            if (!storedFallbacks) return;
            const parsedFallbacks = JSON.parse(storedFallbacks);
            if (parsedFallbacks && typeof parsedFallbacks === "object" && Object.keys(parsedFallbacks).length > 0) {
                setIsAioImportEditorOpen(false);
            }
        } catch (error) {
            console.error("Failed to detect stored AIOMetadata fallbacks", error);
        }
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        const sectionElements = EDITOR_SECTIONS
            .map((section) => document.getElementById(section.id))
            .filter((element): element is HTMLElement => element instanceof HTMLElement);

        if (sectionElements.length === 0) return;

        let frameId = 0;

        const getScrollMetrics = (target: HTMLElement | Window | null) => {
            if (target === window) {
                const scrollRoot = document.documentElement;
                const scrollHeight = Math.max(
                    scrollRoot.scrollHeight,
                    document.body?.scrollHeight ?? 0
                );

                return {
                    scroll: window.scrollY,
                    scrollHeight,
                    clientHeight: window.innerHeight,
                };
            }

            const element = target as HTMLElement | null;

            return {
                scroll: element?.scrollTop ?? 0,
                scrollHeight: element?.scrollHeight ?? 0,
                clientHeight: element?.clientHeight ?? 0,
            };
        };

        const getSectionTopInScrollRoot = (sectionElement: HTMLElement, target: HTMLElement | Window | null) => {
            if (target === window || !target) {
                return sectionElement.getBoundingClientRect().top + window.scrollY;
            }

            const element = target as HTMLElement;
            const targetTop = element.getBoundingClientRect().top;
            return sectionElement.getBoundingClientRect().top - targetTop + element.scrollTop;
        };

        const captureScrollSnapshot = (target: HTMLElement | Window | null) => {
            if (!target) return null;

            const isDesktopTarget = target !== window;
            const activationOffset = isDesktopTarget ? 170 : 132;
            const { scroll, scrollHeight, clientHeight } = getScrollMetrics(target);
            const maxScrollable = Math.max(0, scrollHeight - clientHeight);

            let anchorSection = sectionElements[0];

            for (const sectionElement of sectionElements) {
                const sectionTop = getSectionTopInScrollRoot(sectionElement, target);
                if (sectionTop <= scroll + activationOffset) {
                    anchorSection = sectionElement;
                } else {
                    break;
                }
            }

            const anchorTop = getSectionTopInScrollRoot(anchorSection, target);
            const snapshot: ScrollSnapshot = {
                sectionId: anchorSection.id,
                offsetWithinSection: Math.max(0, scroll - anchorTop),
                scrollPercent: maxScrollable <= 0 ? 0 : scroll / maxScrollable,
            };

            scrollSnapshotRef.current = snapshot;
            return snapshot;
        };

        const updateActiveSection = () => {
            const isDesktopViewport = window.innerWidth >= 1024;
            const scrollRoot = isDesktopViewport ? scrollContainerRef.current : null;
            const currentScrollTarget = isDesktopViewport ? scrollRoot : window;
            const activationOffset = isDesktopViewport ? 170 : 132;
            const viewportTop = isDesktopViewport
                ? scrollRoot?.getBoundingClientRect().top ?? 0
                : 0;

            captureScrollSnapshot(currentScrollTarget);

            const lastSection = sectionElements[sectionElements.length - 1];

            if (isDesktopViewport && scrollRoot) {
                const remainingScroll =
                    scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight;
                if (remainingScroll <= 12) {
                    setActiveSectionId((current) => (current === lastSection.id ? current : lastSection.id));
                    return;
                }
            } else {
                const remainingScroll =
                    document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
                if (remainingScroll <= 12) {
                    setActiveSectionId((current) => (current === lastSection.id ? current : lastSection.id));
                    return;
                }
            }

            let nextSectionId = sectionElements[0].id;

            for (const sectionElement of sectionElements) {
                const sectionTop = sectionElement.getBoundingClientRect().top - viewportTop;
                if (sectionTop <= activationOffset) {
                    nextSectionId = sectionElement.id;
                } else {
                    break;
                }
            }

            setActiveSectionId((current) => (current === nextSectionId ? current : nextSectionId));
        };

        const requestUpdate = () => {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updateActiveSection);
        };

        const bindScrollTarget = () => (window.innerWidth >= 1024 ? scrollContainerRef.current : window);

        const handleResize = () => {
            const nextScrollTarget = bindScrollTarget();
            if (nextScrollTarget === scrollTarget) return;

            // --- Scroll Sync Logic ---
            const oldTarget = scrollTarget;
            const isOldWindow = oldTarget === window;
            const isNewWindow = nextScrollTarget === window;
            const snapshot = scrollSnapshotRef.current ?? captureScrollSnapshot(oldTarget);

            const oldScroll = isOldWindow ? window.scrollY : (oldTarget as HTMLElement)?.scrollTop ?? 0;
            const oldHeight = isOldWindow ? document.documentElement.scrollHeight : (oldTarget as HTMLElement)?.scrollHeight ?? 0;
            const oldClientHeight = isOldWindow ? window.innerHeight : (oldTarget as HTMLElement)?.clientHeight ?? 0;

            const scrollPercent = (oldHeight - oldClientHeight) <= 0 ? 0 : oldScroll / (oldHeight - oldClientHeight);
            // ------------------------

            scrollTarget?.removeEventListener("scroll", requestUpdate);
            scrollTarget = nextScrollTarget;
            scrollTarget?.addEventListener("scroll", requestUpdate, { passive: true });

            const syncScrollPosition = () => {
                const { scrollHeight: newHeight, clientHeight: newClientHeight } = getScrollMetrics(nextScrollTarget);
                const maxScroll = Math.max(0, newHeight - newClientHeight);

                let newScroll = Math.min(maxScroll, Math.max(0, scrollPercent * maxScroll));
                const anchorSection = snapshot?.sectionId ? document.getElementById(snapshot.sectionId) : null;
                const offsetWithinSection = snapshot?.offsetWithinSection ?? 0;

                if (anchorSection instanceof HTMLElement) {
                    const anchorTop = getSectionTopInScrollRoot(anchorSection, nextScrollTarget);
                    newScroll = Math.min(
                        maxScroll,
                        Math.max(0, anchorTop + offsetWithinSection)
                    );
                }

                if (isNewWindow) {
                    window.scrollTo({ top: newScroll, behavior: "auto" });
                } else if (nextScrollTarget) {
                    (nextScrollTarget as HTMLElement).scrollTop = newScroll;
                }
            };

            // Apply sync more than once because the scroll root and layout both change at the breakpoint.
            requestAnimationFrame(() => {
                syncScrollPosition();
                requestAnimationFrame(syncScrollPosition);
                window.setTimeout(syncScrollPosition, 120);
            });

            requestUpdate();
        };

        let scrollTarget: HTMLElement | Window | null = bindScrollTarget();
        scrollTarget?.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
        window.addEventListener("resize", handleResize);

        requestUpdate();

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
            scrollTarget?.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestUpdate);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const ignoredKeys = new Set([
        "stream_button_elements_order",
        "subtitle_font_size",
        "subtitle_italic",
        "isASSUseImageRender",
        "isSRTUseImageRender",
        "subtitle_bold",
        "subtitle_background_color",
        "subtitle_color",
        "enable_external_player_trakt_scrobbling",
        "image_cache_duration",
        "mdblist_enabled_ratings",
        "mdblist_badge_color_hex_values",
        "mdblist_badge_text_overrides",
        "disabled_shelves",
        "show_metadata_provider",
        "pattern_default_filter_enabled_patterns",
        "show_only_first_regex_tag",
        "shelf_order",
        "always_show_titles",
        "stream_button_elements_order",
        "hidden_stream_button_elements",
        "auto_play_patterns",
        "catalog_cache_duration",
        "default_metadata_provider",
        "bottom_align_logo",
        "high_contrast_focus",
        "show_metadata_tags",
        "recommendation_cache_duration",
        "metadata_cache_duration",
        "auto_play_enabled_patterns",
        "landscape_catalogs",
        "main_group_order",
        "catalog_group_order",
        "catalog_ordering",
        "mdblist_rating_order",
        "auto_play_enabled",
        "auto_play_pattern_value",
        "default_filter_enabled",
        "auto_play_enabled_patterns",
        "auto_play_patterns",
        "pattern_default_filter_enabled_patterns",
        "top_row_item_limits"
    ]);

    const sections = EDITOR_SECTIONS;

    const showNotice = useCallback((
        tone: UiNotice["tone"],
        message: string,
        placement: UiNotice["placement"] = "global"
    ) => {
        setUiNotice({ tone, message, placement });
    }, []);

    useEffect(() => {
        if (uiNotice?.tone === "success") {
            const timer = setTimeout(() => {
                setUiNotice(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [uiNotice]);

    const renderNotice = (notice: UiNotice) => (
        <EditorNotice
            tone={notice.tone === "error" ? "danger" : notice.tone === "success" ? "success" : "info"}
            className="animate-in fade-in slide-in-from-top-2 duration-300 mb-4"
            alignCenter
        >
            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                <span className="font-medium tracking-tight truncate">{notice.message}</span>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-current/60 hover:text-current hover:bg-current/10 rounded-full flex items-center justify-center p-0 h-6 w-6"
                    onClick={() => setUiNotice(null)}
                    aria-label="Dismiss notice"
                >
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>
        </EditorNotice>
    );

    const persistAIOMetadataSyncState = useCallback((nextState: AIOMetadataSyncState) => {
        setAioSyncState(nextState);
        if (typeof window !== "undefined") {
            localStorage.setItem(AIOMETADATA_SYNC_STORAGE_KEY, JSON.stringify(nextState));
        }
    }, []);

    const clearAIOMetadataSyncState = () => {
        setAioSyncState(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(AIOMETADATA_SYNC_STORAGE_KEY);
        }
    };

    const formatAIOMetadataSyncTime = (value?: string) => {
        if (!value) return "";

        try {
            return new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date(value));
        } catch {
            return value;
        }
    };

    const preserveScrollPosition = useCallback((work: () => void) => {
        const isMobileViewport = window.innerWidth < 1024;
        const desktopContainer = scrollContainerRef.current;
        const previousY = isMobileViewport ? window.scrollY : desktopContainer?.scrollTop ?? 0;

        work();

        const restore = () => {
            if (isMobileViewport) {
                window.scrollTo({ top: previousY, behavior: "auto" });
                return;
            }
            if (desktopContainer) {
                desktopContainer.scrollTop = previousY;
            }
        };

        requestAnimationFrame(() => {
            restore();
            requestAnimationFrame(restore);
            setTimeout(restore, 120);
        });
    }, []);

    const handleDownloadClick = () => {
        setSetupName(originalConfig?.name || "");
        setIsExportModalOpen(true);
    };

    const confirmDownload = () => {
        const config = exportConfig();
        if (!config) return;

        // Inject new timestamp and name
        const now = new Date();
        config.date = now.toISOString();
        if (setupName.trim()) {
            config.name = setupName.trim();
        } else {
            delete config.name;
            // Optionally, we could provide a fallback name if empty
        }

        const timestampStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 16);
        const newFileName = `omni-config-${timestampStr}.json`;

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json;charset=utf-8" });

        // Always use direct download for a consistent experience across all platforms
        triggerDownload(blob, newFileName);
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportModalOpen(false);
    };

    const handleBackToStart = () => {
        setIsExitConfirmOpen(true);
    };

    const confirmBackToStart = () => {
        discardSession();
        setIsExitConfirmOpen(false);
    };

    const handleSectionExport = (_sectionId: string, sectionTitle: string, keys: string[]) => {
        const config = exportPartialConfig(keys);
        if (!config) return;

        const now = new Date();
        config.date = now.toISOString();
        config.name = `${sectionTitle} Export`;

        const timestampStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 16);
        const sanitizedTitle = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newFileName = `omni-${sanitizedTitle}-${timestampStr}.json`;

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = async () => {
        const config = exportConfig();
        if (!config) return;
        try {
            if (!navigator?.clipboard?.writeText) {
                throw new Error("Clipboard API unavailable");
            }
            await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err: unknown) {
            console.error(err);
            showNotice("error", "Copy failed. Please use download export instead.");
        }
    };


    const processAIOMetadata = useCallback((
        jsonText: string,
        syncSource: Omit<AIOMetadataSyncState, "syncedAt"> = {
            sourceType: "json",
            sourceLabel: "Pasted JSON",
        },
        options: ProcessAIOMetadataOptions = {}
    ) => {
        try {
            const { fallbacks, addedCount, normalizedCatalogs } = parseAIOMetadataFallbacks(jsonText);
            const shouldShowSuccessNotice = options.showSuccessNotice ?? true;
            const mergedCatalogs = mergeAIOMetadataCatalogs(aioSyncState?.catalogs, normalizedCatalogs);

            setCustomFallbacks(fallbacks);
            localStorage.setItem("omni_custom_fallbacks", JSON.stringify(fallbacks));
            persistAIOMetadataSyncState({
                ...syncSource,
                catalogs: mergedCatalogs,
                syncedAt: new Date().toISOString(),
            });
            setIsAioImportEditorOpen(false);
            if (shouldShowSuccessNotice) {
                showNotice("success", `Imported ${addedCount} catalogs from AIOMetadata.`, "aiometadata");
            }
            if (syncSource.sourceType === "url" && syncSource.sourceValue) {
                setAioManifestUrlInput(syncSource.sourceValue);
                setAioManifestUrlDraft(syncSource.sourceValue);
                setAioJsonInput("");
            } else {
                setAioManifestUrlInput("");
                setAioManifestUrlDraft("");
                setAioJsonInput("");
            }
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error && err.message === "Invalid AIOMetadata format. Could not find catalogs array."
                ? err.message
                : "Failed to parse JSON. Please ensure it is valid JSON.";
            showNotice("error", message, "aiometadata");
        }
    }, [aioSyncState?.catalogs, persistAIOMetadataSyncState, setCustomFallbacks, showNotice]);

    const syncAIOMetadataFromUrl = useCallback(async (
        sourceValue: string,
        options: SyncAIOMetadataFromUrlOptions = {}
    ) => {
        if (activeAioImportRequestRef.current) {
            await activeAioImportRequestRef.current;
            return;
        }

        const shouldPreserveScroll = options.preserveScroll ?? true;
        const shouldShowSuccessNotice = options.showSuccessNotice ?? true;

        setIsImportingUrl(true);
        const request = measureAsync("aiometadataImportUrl", async () => {
            try {
                const manifestText = await fetchTextWithLimits(sourceValue, {
                    timeoutMs: 12000,
                    maxBytes: 5_000_000,
                });
                let importText = manifestText;
                const configLoadUrl = deriveAIOMetadataConfigLoadUrl(sourceValue);

                if (configLoadUrl) {
                    try {
                        const response = await fetch(configLoadUrl, {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            body: "{}",
                        });

                        if (response.ok) {
                            const configText = await response.text();
                            importText = pickRicherAIOMetadataPayload(manifestText, configText);
                        }
                    } catch (configLoadError) {
                        console.warn("Failed to load richer AIOMetadata config payload, falling back to manifest.", configLoadError);
                    }
                }

                const importWork = () => {
                    processAIOMetadata(importText, {
                        sourceType: "url",
                        sourceLabel: "Manifest URL",
                        sourceValue,
                    }, {
                        showSuccessNotice: shouldShowSuccessNotice,
                    });
                };

                if (shouldPreserveScroll) {
                    preserveScrollPosition(importWork);
                } else {
                    importWork();
                }
            } catch (err: unknown) {
                console.error(err);
                showNotice(
                    "error",
                    options.errorMessage ?? (err instanceof Error ? err.message : "Failed to fetch AIOMetadata manifest."),
                    options.errorPlacement ?? "aiometadata"
                );
            } finally {
                setIsImportingUrl(false);
                activeAioImportRequestRef.current = null;
            }
        }, { sourceType: "url" });

        activeAioImportRequestRef.current = request;
        await request;
    }, [preserveScrollPosition, processAIOMetadata, showNotice]);

    const isJsonFile = (file: File) => file.name.toLowerCase().endsWith(".json") || file.type === "application/json";

    const processFallbackFile = (file: File) => {
        if (!isJsonFile(file)) {
            showNotice("error", "Please drop a valid JSON file.", "aiometadata");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            preserveScrollPosition(() => {
                processAIOMetadata(event.target?.result as string, {
                    sourceType: "file",
                    sourceLabel: file.name,
                });
            });
        };
        reader.readAsText(file);
    };

    const handleUploadFallbacks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        processFallbackFile(file);
        e.target.value = '';
    };

    const handleFallbackDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFallbackDropActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        processFallbackFile(file);
    };

    const handleSyncAIOMetadataUrl = async () => {
        const sourceValue = aioManifestUrlDraft.trim();
        if (!sourceValue) return;

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setAioManifestUrlInput(sourceValue);
        setAioManifestUrlDraft(sourceValue);
        await syncAIOMetadataFromUrl(sourceValue, {
            showSuccessNotice: true,
            preserveScroll: true,
            errorPlacement: "aiometadata",
        });
    };

    const handleImportAIOMetadataJson = async () => {
        const input = aioJsonInput.trim();
        if (!input) return;

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        await measureAsync("aiometadataImportJson", async () => {
            preserveScrollPosition(() => {
                processAIOMetadata(input, {
                    sourceType: "json",
                    sourceLabel: "Pasted JSON",
                });
            });
        }, { sourceType: "json" });
    };

    const handleResyncAIOMetadata = async () => {
        if (aioSyncState?.sourceType === "url" && aioSyncState.sourceValue) {
            setAioManifestUrlInput(aioSyncState.sourceValue);
            setAioManifestUrlDraft(aioSyncState.sourceValue);
            await syncAIOMetadataFromUrl(aioSyncState.sourceValue, {
                showSuccessNotice: true,
                preserveScroll: true,
                errorPlacement: "aiometadata",
            });
            return;
        }

        setIsAioImportEditorOpen(true);
    };

    const handleEditAIOMetadataSource = () => {
        if (aioSyncState?.sourceType === "url" && aioSyncState.sourceValue) {
            setAioManifestUrlInput(aioSyncState.sourceValue);
            setAioManifestUrlDraft(aioSyncState.sourceValue);
        }
        setIsAioImportEditorOpen(true);
    };

    const handleResetCatalogNames = () => {
        setIsResetConfirmOpen(true);
    };

    const confirmResetCatalogNames = () => {
        setCustomFallbacks({});
        localStorage.removeItem("omni_custom_fallbacks");
        clearAIOMetadataSyncState();
        setIsAioImportEditorOpen(true);
        setAioManifestUrlInput("");
        setAioManifestUrlDraft("");
        setAioJsonInput("");
        showNotice("info", "Imported AIOMetadata names were cleared.", "aiometadata-editor");
        setIsResetConfirmOpen(false);
    };

    const handleMobileSectionSelect = (sectionId: string) => {
        setActiveSectionId(sectionId);
        setIsSectionsOpen(false);
        requestAnimationFrame(() => {
            document.getElementById(sectionId)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    const openGuide = (guide: "install" | "update" | "use") => {
        setActiveGuide(guide);
        setIsGuideDialogOpen(true);
    };

    const activeAIOMetadataSync =
        aioSyncState ||
        (Object.keys(customFallbacks).length > 0
            ? {
                sourceType: "json" as const,
                sourceLabel: "Imported data stored locally in this browser",
            }
            : null);
    const showAioSyncedState = !!activeAIOMetadataSync && !isAioImportEditorOpen;
    const aiomMismatchSummary = useMemo(() => measureSync("analyzeAIOMetadataCatalogMismatches", () => analyzeAIOMetadataCatalogMismatches({
        catalogs,
        catalogGroups: currentValues.catalog_groups || {},
        mainCatalogGroups: currentValues.main_catalog_groups || {},
        fallbacks: customFallbacks,
    }), {
        manifestCatalogCount: catalogs.length,
        subgroupCount: Object.keys(currentValues.catalog_groups || {}).length,
    }), [catalogs, currentValues.catalog_groups, currentValues.main_catalog_groups, customFallbacks]);
    const aiomIssueSummaryText = useMemo(() => {
        if (!aiomMismatchSummary.hasIssues) {
            return "";
        }

        return "One or more groups have missing or empty linked catalogs. Add the missing catalogs to AIOMetadata using Export New Catalogs, or update the linked catalogs in the affected groups.";
    }, [aiomMismatchSummary.hasIssues]);

    useEffect(() => {
        if (hasAutoResyncedAioRef.current) return;
        if (aioSyncState?.sourceType !== "url" || !aioSyncState.sourceValue) return;

        hasAutoResyncedAioRef.current = true;
        void syncAIOMetadataFromUrl(aioSyncState.sourceValue, {
            showSuccessNotice: false,
            preserveScroll: false,
            errorPlacement: "aiometadata",
            errorMessage: "Failed to refresh synced AIOMetadata from the saved manifest URL.",
        });
    }, [aioSyncState, syncAIOMetadataFromUrl]);

    return (
        <div className="relative flex min-h-screen lg:h-[100dvh] w-full max-w-[100vw] overflow-x-hidden lg:overflow-y-hidden bg-transparent text-foreground font-sans">

            <aside className="hidden lg:flex lg:static inset-y-0 left-0 z-50 w-72 lg:w-[17.5rem] bg-transparent flex-col">
                <div className="px-4 py-5">
                    <div className="flex h-[calc(100dvh-2.5rem)] flex-col rounded-lg border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(248,250,252,0.44))] shadow-[0_18px_38px_rgba(15,23,42,0.065)] backdrop-blur-md dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(21,24,31,0.92),rgba(13,16,22,0.9))] dark:shadow-[0_18px_38px_rgba(2,6,23,0.14)]">
                        <div className="px-5 pt-5 pb-4">
                            <h1 className="text-base font-black flex items-center gap-2 text-primary-foreground tracking-tight">
                                <div className="relative flex shrink-0 items-center justify-center group" style={{ width: '56px', height: '46px' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element -- Static local logo. */}
                                    <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="relative z-10 h-full w-full object-contain scale-[1.28]" />
                                </div>
                                <div className="flex flex-col justify-center leading-none">
                                    <span className="text-foreground">Omni Snapshot</span>
                                    <span className="mt-[0.2rem] text-xs font-bold uppercase tracking-[0.24em] text-primary dark:text-primary">Manager</span>
                                </div>
                            </h1>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 pb-4">
                            <div className="border-t border-slate-200/80 pt-4 dark:border-white/6">
                                <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/34">
                                    Sections
                                </div>
                                <div className="space-y-0.5">
                                    {sections.map(section => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className={cn(
                                                `block rounded-lg px-3 py-2 text-[14px] font-medium tracking-tight ${editorHover.transition}`,
                                                activeSectionId === section.id
                                                    ? "bg-primary/10 text-foreground border border-primary/20"
                                                    : "text-foreground/66 hover:text-foreground hover:bg-muted/30"
                                            )}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span
                                                    className={cn(
                                                        "h-1.5 w-1.5 rounded-full transition-colors",
                                                        activeSectionId === section.id ? "bg-primary" : "bg-white/12"
                                                    )}
                                                />
                                                {section.title}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 border-t border-slate-200/80 pt-4 space-y-1.5 dark:border-white/6">
                                <DropdownMenu open={isDesktopDocsMenuOpen} onOpenChange={setIsDesktopDocsMenuOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-between gap-3 h-10 rounded-lg px-3 text-sm text-primary dark:text-primary hover:text-primary dark:hover:text-primary hover:bg-primary/10 font-medium"
                                        >
                                            <span className="flex items-center gap-3">
                                                <BookOpen className="w-4 h-4" />
                                                <span>Documentation</span>
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    "h-3.5 w-3.5 shrink-0 text-current/72 transition-transform duration-200",
                                                    isDesktopDocsMenuOpen && "rotate-180"
                                                )}
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" sideOffset={8} className="w-52">
                                        <DropdownMenuItem
                                            onClick={() => openGuide("install")}
                                            className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                <UploadCloud className="w-4 h-4 text-current" />
                                            </span>
                                            How to Install
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => openGuide("update")}
                                            className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                <RotateCcw className="w-4 h-4 text-current" />
                                            </span>
                                            How to Update
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => openGuide("use")}
                                            className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                <BookOpen className="w-4 h-4 text-current" />
                                            </span>
                                            How to Use
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full justify-start gap-3 h-10 rounded-lg px-3 text-sm text-pink-600 dark:text-pink-500 hover:text-pink-700 dark:hover:text-pink-400 hover:bg-pink-500/10 font-medium"
                                >
                                    <a href="https://ko-fi.com/botbidraiser" target="_blank" rel="noopener noreferrer">
                                        <Heart className="w-4 h-4" />
                                        <span>Support My Work</span>
                                    </a>
                                </Button>
                            </div>
                        </nav>

                        <div className="mt-auto border-t border-slate-200/80 px-4 py-4 dark:border-white/6">
                            <div className="rounded-lg border border-slate-200/80 bg-white/42 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/8 dark:bg-background/26 dark:shadow-none">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/44 flex items-center gap-1.5 leading-none">
                                        <FileJson className="w-3 h-3 text-primary/80" />
                                        Selected File
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full text-foreground/66 hover:text-primary hover:bg-primary/10 -mr-1 -mt-1 group/back"
                                        onClick={handleBackToStart}
                                        title="Back to Start"
                                        aria-label="Back to start"
                                    >
                                        <LogOut className="w-3.5 h-3.5 transition-transform group-hover/back:-translate-x-1" />
                                    </Button>
                                </div>
                                <p className="text-[11px] text-foreground/62 font-mono truncate">{fileName}</p>
                            </div>

                            <div className="hidden lg:flex items-center gap-2.5 mt-3">
                                <Button
                                    onClick={handleDownloadClick}
                                    className="flex-1 font-bold h-11 rounded-lg bg-primary hover:bg-primary/92 text-primary-foreground shadow-[0_10px_24px_rgba(2,6,23,0.18)]"
                                >
                                    <Download className="w-4 h-4 mr-2.5" />
                                    Download
                                </Button>
                                <Button
                                    onClick={handleCopy}
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        `h-11 w-11 shrink-0 rounded-lg border border-slate-200/80 bg-white/42 dark:border-white/8 dark:bg-background/30 ${editorHover.transition} ${editorHover.iconAction}`,
                                        isCopied ? "border-emerald-500/35 text-emerald-400 bg-emerald-500/8" : ""
                                    )}
                                    title={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
                                    aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>


                            <div className="mt-4 border-t border-slate-200/80 pt-3 pb-1 dark:border-white/6">
                                <AppMeta
                                    align="start"
                                    mode="stacked"
                                    showGitHub
                                    trailing={
                                        <div className="scale-[0.80] origin-right -my-1">
                                            <ThemeToggle />
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent 
                    className="max-w-md"
                    onOpenAutoFocus={(e) => {
                        if (isIosDevice) {
                            e.preventDefault();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Export Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label htmlFor={exportSetupNameId} className="text-sm text-foreground/70">Setup Name</label>
                            <Input
                                id={exportSetupNameId}
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                placeholder="E.g., My Awesome Setup"
                                className="h-10 sm:h-9 text-base sm:text-sm bg-background border-border focus-visible:ring-ring/50"
                            />
                            <p className="text-xs text-foreground/70">
                                The export will include a new timestamp automatically.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)} className={editorAction.secondary}>
                            Cancel
                        </Button>
                        <Button onClick={confirmDownload} className={editorAction.primary}>
                            Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-hidden lg:overflow-y-auto scroll-smooth relative z-10 pb-32 lg:pb-40"
            >
                <div className="mx-auto max-w-5xl px-4 py-8 pb-[calc(12rem+env(safe-area-inset-bottom))] sm:px-10 sm:pt-10 lg:max-w-6xl lg:px-8 xl:max-w-[76rem] xl:px-6 space-y-10">
                    <div className="hidden lg:flex justify-end p-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToStart}
                            className="h-10 text-[11px] font-bold uppercase tracking-wider text-foreground/45 hover:text-rose-500 transition-colors flex items-center gap-1.5 px-4"
                        >
                            <LogOut className="w-3 h-3" />
                            Back
                        </Button>
                    </div>
                    <section className="lg:hidden pt-[calc(0.35rem+env(safe-area-inset-top))]">
                        <div className="rounded-lg border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(248,250,252,0.44))] p-3.5 shadow-[0_18px_38px_rgba(15,23,42,0.065)] backdrop-blur-md dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(21,24,31,0.92),rgba(13,16,22,0.9))] dark:shadow-[0_18px_38px_rgba(2,6,23,0.14)]">
                            <div className="flex items-start gap-2.5">
                                <h1 className="min-w-0 flex flex-1 items-center gap-2 text-base font-black tracking-tight text-primary-foreground">
                                    <div className="relative flex shrink-0 items-center justify-center group" style={{ width: '44px', height: '36px' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element -- Static local logo. */}
                                        <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="relative z-10 h-full w-full object-contain scale-[1.24]" />
                                    </div>
                                    <div className="flex min-w-0 flex-col justify-center leading-none">
                                        <span className="truncate text-foreground">Omni Snapshot</span>
                                        <span className="mt-[0.18rem] text-xs font-bold uppercase tracking-[0.22em] text-primary dark:text-primary">Manager</span>
                                    </div>
                                </h1>

                                <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsSectionsOpen(true)}
                                        className="h-7 rounded-full px-2 text-[11px] font-medium text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                                    >
                                        <Menu className="h-3.5 w-3.5 text-primary" />
                                        <span className="ml-1 hidden min-[430px]:inline">Sections</span>
                                    </Button>
                                    <DropdownMenu open={isMobileDocsMenuOpen} onOpenChange={setIsMobileDocsMenuOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-7 rounded-full px-2 text-[11px] font-medium text-foreground/70 hover:bg-primary/10 hover:text-foreground"
                                            >
                                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                                                <span className="ml-1 hidden min-[430px]:inline">Docs</span>
                                                <ChevronDown
                                                    className={cn(
                                                        "ml-1 h-3 w-3 text-primary/80 transition-transform duration-200",
                                                        isMobileDocsMenuOpen && "rotate-180"
                                                    )}
                                                />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                                            <DropdownMenuItem
                                                onClick={() => openGuide("install")}
                                                className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                    <UploadCloud className="w-4 h-4 text-current" />
                                                </span>
                                                How to Install
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openGuide("update")}
                                                className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                    <RotateCcw className="w-4 h-4 text-current" />
                                                </span>
                                                How to Update
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openGuide("use")}
                                                className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors data-[highlighted]:bg-primary/10"
                                            >
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/28 bg-primary/10 text-primary dark:border-primary/26 dark:bg-primary/12">
                                                    <BookOpen className="w-4 h-4 text-current" />
                                                </span>
                                                How to Use
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/42 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/8 dark:bg-background/26 dark:shadow-none">
                                <FileJson className="h-3.5 w-3.5 shrink-0 text-primary/78" />
                                <span className="min-w-0 flex-1 truncate text-[11px] font-mono text-foreground/58">{fileName}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleBackToStart}
                                    className="h-8 w-8 shrink-0 rounded-full text-foreground/62 hover:bg-muted/30 hover:text-foreground"
                                    title="Back to start"
                                    aria-label="Back to start"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    {uiNotice && !["aiometadata", "aiometadata-editor"].includes(uiNotice.placement ?? "global") && renderNotice(uiNotice)}
                    {sessionSaveStatus?.status === "skipped_too_large" && (
                        <EditorNotice tone="warning" className="mb-4">
                            Session backup is temporarily limited because the editor state is very large. Your current editing session continues normally.
                        </EditorNotice>
                    )}

                    {sections.map(section => {
                        // For predefined sections, show all specified keys
                        // For other sections, filter keys that exist in current config
                        let sectionKeys = section.keys;
                        if (!["settings", "groups", "catalogs", "patterns"].includes(section.id)) {
                            sectionKeys = section.keys.filter(k => currentValues[k] !== undefined);
                        }

                        // For settings section, get all assigned keys plus all keys not in other sections
                        let keysToRender = sectionKeys;

                        // Filter out ignored keys entirely from ANY section UI
                        keysToRender = keysToRender.filter(k => !ignoredKeys.has(k));

                        if (keysToRender.length === 0 && !["aiometadata", "catalogs", "groups", "patterns"].includes(section.id)) return null;

                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-8 pb-8 border-b border-border/20 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">{section.title}</h3>
                                    {["groups", "catalogs", "patterns"].includes(section.id) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-foreground/70 hover:text-foreground h-8 px-3 text-xs hover:bg-muted transition-colors gap-1.5"
                                            onClick={() => handleSectionExport(section.id, section.title, section.keys)}
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Export
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {section.id === "aiometadata" ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1.5 px-1">
                                                <EditorNotice tone="info" className="mt-4" alignCenter>
                                                    <p className="font-medium text-inherit">
                                                        <span className="font-bold">Note:</span> You can sync your AIOMetadata manifest URL to always keep your catalogs up to date. Imported catalog names are stored locally in your browser.
                                                    </p>
                                                </EditorNotice>
                                                {Object.keys(customFallbacks).length > 0 && !showAioSyncedState && (
                                                    <div className="mt-2 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleResetCatalogNames}
                                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3 text-xs"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                            Reset Imported Data
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            {uiNotice && uiNotice.placement === "aiometadata" && renderNotice(uiNotice)}
                                            {showAioSyncedState ? (
                                                <div className="space-y-3">
                                                    <EditorNotice tone="success" className="shadow-[0_8px_20px_rgba(34,197,94,0.06)] py-3 px-3.5" alignCenter>
                                                        <div className="flex items-center justify-between gap-3 w-full min-w-0">
                                                            <div className="min-w-0 flex flex-col justify-center">
                                                                <p className="text-sm font-semibold text-inherit md:whitespace-nowrap">
                                                                    AIOMetadata synced
                                                                </p>
                                                                {activeAIOMetadataSync.syncedAt && (
                                                                    <p className="mt-0.5 text-xs text-inherit opacity-80">
                                                                        Last synced: {formatAIOMetadataSyncTime(activeAIOMetadataSync.syncedAt)}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                                                {activeAIOMetadataSync.sourceType === "url" && activeAIOMetadataSync.sourceValue && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon-sm"
                                                                        className="size-8 rounded-xl border-emerald-500/18 bg-emerald-500/[0.06] text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-emerald-500/28 hover:bg-emerald-500/[0.1] hover:text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-400 md:size-9"
                                                                        onClick={() => void handleResyncAIOMetadata()}
                                                                        disabled={isImportingUrl}
                                                                        aria-label={isImportingUrl ? "Syncing AIOMetadata" : "Sync AIOMetadata again"}
                                                                        title={isImportingUrl ? "Syncing..." : "Sync Again"}
                                                                    >
                                                                        <RotateCcw className={cn("w-4 h-4", isImportingUrl && "animate-spin")} />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon-sm"
                                                                    className="size-8 rounded-xl border-emerald-500/14 bg-emerald-500/[0.04] text-emerald-700/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-emerald-500/24 hover:bg-emerald-500/[0.08] hover:text-emerald-700 dark:bg-emerald-500/[0.06] dark:text-emerald-400/90 md:size-9"
                                                                    onClick={handleEditAIOMetadataSource}
                                                                    aria-label="Change AIOMetadata source"
                                                                    title="Change Source"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                {Object.keys(customFallbacks).length > 0 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon-sm"
                                                                        className="size-8 rounded-xl border-red-500/14 bg-red-500/[0.03] text-red-600/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-red-500/24 hover:bg-red-500/[0.08] hover:text-red-600 dark:bg-red-500/[0.05] dark:text-red-400/90 md:size-9"
                                                                        onClick={handleResetCatalogNames}
                                                                        aria-label="Reset imported AIOMetadata data"
                                                                        title="Reset Imported Data"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </EditorNotice>

                                                    {aiomMismatchSummary.unmatchedLinkedCatalogIds.length > 0 && aiomIssueSummaryText && (
                                                        <EditorNotice tone="warning" className="py-3 px-3.5 shadow-[0_6px_14px_rgba(245,158,11,0.06)]" alignCenter>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-inherit">
                                                                    {aiomIssueSummaryText}
                                                                </p>
                                                            </div>
                                                        </EditorNotice>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        editorSurface.card,
                                                        "p-5 relative overflow-hidden transition-all duration-300",
                                                        isFallbackDropActive && "ring-2 ring-primary bg-primary/5 shadow-2xl"
                                                    )}
                                                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsFallbackDropActive(true); }}
                                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsFallbackDropActive(true); }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                                                        setIsFallbackDropActive(false);
                                                    }}
                                                    onDrop={(e) => { setIsFallbackDropActive(false); handleFallbackDrop(e); }}
                                                >
                                                    {isFallbackDropActive && (
                                                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-[2px] pointer-events-none animate-in fade-in duration-200">
                                                            <div className="bg-primary text-primary-foreground p-4 rounded-3xl shadow-2xl scale-110">
                                                                <UploadCloud className="w-10 h-10 animate-bounce" />
                                                            </div>
                                                            <p className="mt-4 text-primary font-bold text-lg">Drop JSON file to import</p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-4 mb-5 relative z-10">
                                                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                                                            <UploadCloud className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-foreground">Import AIOMetadata Catalogs</h4>
                                                            <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
                                                                Sync a manifest URL, import raw catalogs JSON, or drop a <code className="text-xs bg-white/5 border border-white/10 px-1 py-0.5 rounded text-foreground">.json</code> file.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-4 relative z-10">
                                                        {activeAIOMetadataSync && (
                                                            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-xs text-foreground/60">
                                                                Updating the source will replace the currently synced AIOMetadata data.
                                                            </div>
                                                        )}
                                                        {uiNotice && uiNotice.placement === "aiometadata-editor" && renderNotice(uiNotice)}
                                                        <div className="grid gap-4 xl:grid-cols-2">
                                                            <div className={cn(editorSurface.panel, "flex h-full flex-col gap-3 rounded-xl p-4")}>
                                                                <p className="text-sm font-semibold tracking-tight text-foreground">Sync AIOMetadata Manifest URL</p>
                                                                <LockedUrlInput
                                                                    ref={aiomUrlInputRef}
                                                                    value={aioManifestUrlInput}
                                                                    onCommit={(nextUrl) => {
                                                                        const normalizedUrl = nextUrl ?? "";
                                                                        setAioManifestUrlInput(normalizedUrl);
                                                                        setAioManifestUrlDraft(normalizedUrl);
                                                                    }}
                                                                    onDraftValueChange={setAioManifestUrlDraft}
                                                                    placeholder="https://..."
                                                                    multiline
                                                                    rows={2}
                                                                    inputClassName={cn(
                                                                        editorSurface.field,
                                                                        "min-h-[4.5rem] rounded-xl py-3 text-sm leading-[1.35] resize-none overflow-y-auto"
                                                                    )}
                                                                    iconButtonClassName="h-8 w-8 shrink-0 rounded-lg text-foreground/52"
                                                                    copyTitle="Copy AIOMetadata URL"
                                                                    clearTitle="Delete AIOMetadata URL"
                                                                />
                                                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        className={editorAction.premium}
                                                                        onClick={() => void handleSyncAIOMetadataUrl()}
                                                                        disabled={!aioManifestUrlDraft.trim() || isImportingUrl}
                                                                    >
                                                                        {isImportingUrl ? (
                                                                            <span className="flex items-center gap-2">
                                                                                <RotateCcw className="w-4 h-4 animate-spin" />
                                                                                Syncing...
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                <Check className="w-4 h-4 mr-2.5" />
                                                                                Sync Manifest URL
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className={cn(editorSurface.panel, "flex h-full flex-col gap-3 rounded-xl p-4")}>
                                                                <p className="text-sm font-semibold tracking-tight text-foreground">Import AIOMetadata JSON</p>
                                                                <div className="relative group">
                                                                    <Textarea
                                                                        placeholder="Paste catalogs JSON or drop a .json file here..."
                                                                        rows={2}
                                                                        className={cn(
                                                                            editorSurface.field,
                                                                            "min-h-[4.5rem] max-h-[4.5rem] pr-16 py-3 text-sm leading-[1.35] focus:border-primary/50 text-foreground resize-none font-sans placeholder:text-foreground/40 custom-scrollbar rounded-xl transition-all overflow-y-auto",
                                                                            isFallbackDropActive && "opacity-20"
                                                                        )}
                                                                        value={aioJsonInput}
                                                                        onChange={(e) => setAioJsonInput(e.target.value)}
                                                                    />
                                                                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={cn("h-8 px-2.5 rounded-lg text-xs", editorHover.iconDanger)}
                                                                            onClick={() => setAioJsonInput("")}
                                                                            disabled={!aioJsonInput.trim()}
                                                                        >
                                                                            Clear
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        className={editorAction.premium}
                                                                        onClick={() => void handleImportAIOMetadataJson()}
                                                                        disabled={!aioJsonInput.trim()}
                                                                    >
                                                                        <Check className="w-4 h-4 mr-2.5" />
                                                                        Import JSON
                                                                    </Button>

                                                                    <input
                                                                        type="file"
                                                                        id="unified-fallback-upload"
                                                                        accept=".json"
                                                                        className="hidden"
                                                                        ref={fallbackFileInputRef}
                                                                        onChange={handleUploadFallbacks}
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-11 px-5 rounded-xl border-border/60 hover:bg-muted/50 font-medium"
                                                                        onClick={() => fallbackFileInputRef.current?.click()}
                                                                    >
                                                                        <FileJson className="w-4 h-4 mr-2.5" />
                                                                        Select JSON File
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <AIOMetadataExportPanel
                                                currentValues={currentValues}
                                                importedCatalogs={aioSyncState?.catalogs ?? null}
                                                customFallbacks={customFallbacks}
                                            />
                                        </div>
                                    ) : section.id === "groups" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-5">
                                                <p className="text-sm text-foreground/70 px-1 leading-relaxed">
                                                    Create and organize groups, assign catalogs, and update your setup.
                                                </p>
                                                <UnifiedSubgroupEditor aiomMismatchSummary={aiomMismatchSummary} onOpenGuide={(guide) => {
                                                    setActiveGuide(guide);
                                                    setIsGuideDialogOpen(true);
                                                }} />
                                            </div>
                                        </div>
                                    ) : section.id === "catalogs" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-5">
                                                <p className="text-sm text-foreground/70 px-1 leading-relaxed">
                                                    Manage the catalogs that appear on your Omni home tab. Enable or disable catalogs, adjust their appearance, and configure the ranked Top Row or Header.
                                                </p>
                                                <CatalogEditor />
                                            </div>
                                        </div>
                                    ) : section.id === "patterns" ? (
                                        <div className="space-y-5">
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3 shadow-[0_8px_18px_rgba(245,158,11,0.06)] mt-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-600 dark:text-amber-500/90 leading-relaxed font-medium">
                                                    Only edit the patterns if you fully understand how they work. Import from template to safely get the latest visual tags.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Button
                                                    onClick={() => setIsImportPatternsOpen(true)}
                                                    className="mt-3 h-10 bg-primary hover:bg-primary/92 text-primary-foreground shadow-lg shadow-primary/20 px-6 font-bold"
                                                >
                                                    <UploadCloud className="w-5 h-5 mr-2" />
                                                    Import from Template
                                                </Button>
                                            </div>
                                            <ImportPatternsModal isOpen={isImportPatternsOpen} onClose={() => setIsImportPatternsOpen(false)} />
                                            <UnifiedPatternEditor />
                                        </div>
                                    ) : section.id === "settings" ? (
                                        <div className="space-y-4">
                                            {keysToRender.map((key) => {
                                                const renderer = (
                                                    <GenericRenderer
                                                        key={key}
                                                        data={currentValues[key]}
                                                        path={[key]}
                                                        searchQuery={searchTerm}
                                                    />
                                                );
                                                
                                                if (key === "hidden_stream_button_elements") {
                                                    return (
                                                        <Fragment key={key}>
                                                            <StreamElementOrderingEditor />
                                                            <ShelfOrderingEditor />
                                                        </Fragment>
                                                    );
                                                }
                                                return renderer;
                                            })}
                                            {!keysToRender.includes("hidden_stream_button_elements") && (
                                                <Fragment>
                                                    <StreamElementOrderingEditor />
                                                    <ShelfOrderingEditor />
                                                </Fragment>
                                            )}
                                            <MdblistRatingsEditor />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                {keysToRender.map(key => (
                                                    <GenericRenderer
                                                        key={key}
                                                        data={currentValues[key]}
                                                        path={[key]}
                                                        searchQuery={searchTerm}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    <div className="lg:hidden pt-1">
                        <div className="rounded-lg border border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(248,250,252,0.36))] px-4 py-3 shadow-[0_10px_26px_rgba(15,23,42,0.045)] backdrop-blur-md dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(20,23,29,0.82),rgba(16,19,25,0.78))] dark:shadow-[0_10px_22px_rgba(2,6,23,0.12)]">
                            <AppMeta align="center" showGitHub />
                        </div>
                    </div>

                </div>
            </main>

            <Dialog open={isSectionsOpen} onOpenChange={setIsSectionsOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="top-auto left-0 right-0 bottom-0 max-w-none translate-x-0 translate-y-0 rounded-t-[2rem] rounded-b-none border-x-0 border-b-0 border-border/70 bg-popover/96 p-0 shadow-[0_-20px_56px_rgba(2,6,23,0.4)] backdrop-blur-2xl sm:max-w-none dark:bg-popover/94"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>Sections</DialogTitle>
                        <DialogDescription>Jump to a section of the editor.</DialogDescription>
                    </DialogHeader>
                    <div className="px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <div className="mx-auto mb-2.5 h-1.5 w-10 rounded-full bg-white/12" />
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-foreground">Sections</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSectionsOpen(false)}
                                className="h-9 w-9 rounded-xl border border-border/70 bg-background/70 text-foreground/74 shadow-none hover:bg-accent/60 hover:text-foreground backdrop-blur-md"
                                aria-label="Close sections"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-3 overflow-hidden rounded-lg border border-white/8 bg-white/4">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => handleMobileSectionSelect(section.id)}
                                    className={cn(
                                        "flex w-full items-center justify-between border-b border-white/6 px-4 py-3 text-left transition-colors last:border-b-0",
                                        activeSectionId === section.id
                                            ? "bg-primary/10"
                                            : "hover:bg-muted/40"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                "h-2 w-2 rounded-full transition-colors",
                                                activeSectionId === section.id ? "bg-primary" : "bg-transparent border border-white/14"
                                            )}
                                        />
                                        <p
                                            className={cn(
                                                "text-[14px] font-semibold tracking-tight",
                                                activeSectionId === section.id ? "text-foreground" : "text-foreground/88"
                                            )}
                                        >
                                            {section.title}
                                        </p>
                                    </div>
                                    <span className={cn("text-base", activeSectionId === section.id ? "text-primary" : "text-foreground/34")}>›</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="pointer-events-none fixed bottom-0 right-0 z-30 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] lg:hidden">
                <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(226,232,240,0.72))] p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.14)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(226,232,240,0.56))] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.74),rgba(10,10,12,0.88))] dark:shadow-[0_14px_34px_rgba(2,6,23,0.26)] dark:supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(24,24,27,0.56),rgba(10,10,12,0.74))]">
                        <Button
                            onClick={handleDownloadClick}
                            className={cn(
                                "size-11 rounded-full bg-primary font-bold text-primary-foreground shadow-[0_10px_24px_rgba(2,6,23,0.22)] hover:bg-primary/92 p-0 flex items-center justify-center shrink-0"
                            )}
                            title="Download JSON"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="size-11 rounded-full border-slate-200/80 bg-white/42 px-0 text-foreground/72 shadow-none hover:bg-muted/80 dark:border-white/10 dark:bg-white/6 dark:hover:bg-muted/50"
                                    title="More actions"
                                    aria-label="More actions"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="end" className="mb-2 w-52 rounded-lg">
                                <div className="p-2 pb-1.5">
                                    <div className="flex items-center gap-1 rounded-xl bg-muted/40 p-1">
                                        <Button
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setTheme("light")}
                                            className={cn(
                                                "flex-1 h-9 rounded-lg transition-all",
                                                theme === "light" ? "bg-white shadow-sm text-foreground dark:bg-zinc-800" : "text-foreground/50 hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                            )}
                                            title="Light Mode"
                                        >
                                            <Sun className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTheme("dark")}
                                            className={cn(
                                                "flex-1 h-9 rounded-lg transition-all",
                                                theme === "dark" ? "bg-white shadow-sm text-foreground dark:bg-zinc-800" : "text-foreground/50 hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                            )}
                                            title="Dark Mode"
                                        >
                                            <Moon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTheme("system")}
                                            className={cn(
                                                "flex-1 h-9 rounded-lg transition-all",
                                                theme === "system" ? "bg-white shadow-sm text-foreground dark:bg-zinc-800" : "text-foreground/50 hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                            )}
                                            title="System Theme"
                                        >
                                            <Monitor className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="mx-1 my-1 bg-border/60" />
                                <DropdownMenuItem
                                    onClick={handleCopy}
                                    className={`cursor-pointer rounded-xl px-3 py-2.5 ${isCopied ? "text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10" : ""}`}
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span className="flex-1">{isCopied ? "Copied to Clipboard" : "Copy JSON"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleBackToStart}
                                    className="cursor-pointer rounded-xl px-3 py-2.5"
                                    variant="destructive"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Back to Start
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="mx-1 my-1 bg-border/60" />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 text-foreground/72 focus:text-foreground focus:bg-muted/60">
                                    <a href="https://ko-fi.com/botbidraiser" target="_blank" rel="noopener noreferrer">
                                        <Heart className="w-4 h-4" />
                                        <span className="flex-1">Support</span>
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
            </div>

            <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
                {activeGuide === "install" && <TemplateGuide />}
                {activeGuide === "update" && <UpdateGuide />}
                {activeGuide === "use" && <Documentation onOpenInstallGuide={() => setActiveGuide("install")} />}
            </Dialog>

            {/* Exit Confirmation Dialog */}
            <AlertDialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Unsaved Changes?</AlertDialogTitle>
                        <AlertDialogDescription className="text-foreground/70">
                            Are you sure you want to return to the start screen? Any unsaved modifications to your configuration will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-accent hover:text-foreground">
                            Stay here
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBackToStart}
                            variant="destructive"
                            className="h-9 border-none bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 font-bold"
                        >
                            Yes, Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Catalog Names Confirmation */}
            <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Reset Catalog Names?</AlertDialogTitle>
                        <AlertDialogDescription className="text-foreground/70">
                            Are you sure you want to reset all imported catalog names? This will clear your custom overrides and revert to AIOMetadata defaults.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-accent hover:text-foreground">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmResetCatalogNames}
                            variant="destructive"
                            className="h-9 border-none bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 font-bold"
                        >
                            Yes, Reset All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <EditorPerfDebugPanel />
        </div>
    );
}

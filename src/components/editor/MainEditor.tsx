"use client";

import { useId, useState, useEffect, useRef } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericRenderer } from "@/components/editor/GenericRenderer";
import { CatalogEditor } from "@/components/editor/CatalogEditor";
import { UnifiedSubgroupEditor } from "@/components/editor/UnifiedSubgroupEditor";
import { UnifiedPatternEditor } from "@/components/editor/UnifiedPatternEditor";
import { ImportPatternsModal } from "@/components/editor/ImportPatternsModal";
import { OrderingEditor } from "@/components/editor/OrderingEditor";
import { ThemeToggle } from "@/components/theme-toggle";
import { Textarea } from "@/components/ui/textarea";
import { Documentation } from "@/components/editor/Documentation";
import {
    Download,
    Copy,
    RotateCcw,
    Check,
    UploadCloud,
    ClipboardPaste,
    BookOpen,
    Menu,
    FileJson,
    Trash2,
    Heart,
    Github,
    LogOut,
    Info,
    AlertTriangle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { editorAction, editorNoticeTone } from "@/components/editor/ui/style-contract";

type UiNotice = {
    tone: "success" | "error" | "info";
    message: string;
};

export function MainEditor() {
    const { originalConfig, currentValues, fileName, exportConfig, exportPartialConfig, customFallbacks, setCustomFallbacks, unloadConfig } = useConfig();
    const searchTerm = "";
    const exportSetupNameId = useId();

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [isImportPatternsOpen, setIsImportPatternsOpen] = useState(false);
    const [pastedJson, setPastedJson] = useState("");
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [uiNotice, setUiNotice] = useState<UiNotice | null>(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const lastScrollY = useRef(0);
    const scrollContainerRef = useRef<HTMLElement>(null);
    const scrollThreshold = 10; // min px to trigger hide/show

    useEffect(() => {
        const handleScroll = () => {
            // On mobile we scroll the window/body, on desktop we scroll the ref container
            const currentScrollY = window.innerWidth < 1024 
                ? window.scrollY 
                : scrollContainerRef.current?.scrollTop || 0;

            setIsScrolled(currentScrollY > 8);
            
            if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
                return;
            }

            if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY.current || currentScrollY <= 10) {
                setIsHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        const container = scrollContainerRef.current;
        if (window.innerWidth < 1024) {
            window.addEventListener("scroll", handleScroll, { passive: true });
        } else if (container) {
            container.addEventListener("scroll", handleScroll, { passive: true });
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            container?.removeEventListener("scroll", handleScroll);
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
        "mdblist_badge_color_hex_values",
        "mdblist_badge_text_overrides",
        "disabled_shelves",
        "show_metadata_provider",
        "pattern_default_filter_enabled_patterns",
        "show_only_first_regex_tag",
        "shelf_order",
        "always_show_titles",
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

    const sections = [
        { id: "aiometadata", title: "AIOMetadata Integration", keys: [] },
        { id: "groups", title: "Group Manager", keys: ["subgroup_order", "main_catalog_groups", "catalog_group_image_urls", "catalog_groups"] },
        { id: "catalogs", title: "Catalog Manager", keys: ["selected_catalogs", "pinned_catalogs", "small_catalogs", "top_row_catalogs", "starred_catalogs", "randomized_catalogs", "small_toprow_catalogs", "catalog_ordering", "custom_catalog_names"] },
        { id: "settings", title: "General Settings", keys: ["hide_external_playback_prompt", "hide_spoilers", "small_continue_watching_shelf", "hidden_stream_button_elements", "oled_mode_enabled", "preferred_audio_language", "preferred_subtitle_language"] },
        { id: "patterns", title: "Patterns & Regex", keys: ["pattern_tag_enabled_patterns", "regex_pattern_custom_names", "regex_pattern_image_urls", "pattern_default_filter_enabled_patterns", "pattern_image_color_indices", "pattern_border_radius_indices", "pattern_background_opacities", "pattern_border_thickness_indices", "pattern_color_indices", "pattern_color_hex_values", "auto_play_enabled_patterns", "auto_play_patterns"] },
    ];

    const showNotice = (tone: UiNotice["tone"], message: string) => {
        setUiNotice({ tone, message });
    };

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
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = newFileName;
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
        unloadConfig();
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


    const processAIOMetadata = (jsonText: string) => {
        try {
            const config = JSON.parse(jsonText);
            const catalogsList = config?.config?.catalogs || config?.catalogs;
            if (!catalogsList || !Array.isArray(catalogsList)) {
                showNotice("error", "Invalid JSON format. Could not find catalogs array.");
                return;
            }

            const newFallbacks: Record<string, string> = { ...customFallbacks };
            let addedCount = 0;
            for (const cat of catalogsList) {
                if (cat.id && cat.name) {
                    newFallbacks[cat.id] = cat.name;
                    addedCount++;
                }
            }

            setCustomFallbacks(newFallbacks);
            localStorage.setItem("omni_custom_fallbacks", JSON.stringify(newFallbacks));
            showNotice("success", `Imported ${addedCount} catalog names from AIOMetadata.`);
            setPastedJson(""); // clear on success
        } catch (err: unknown) {
            console.error(err);
            showNotice("error", "Failed to parse JSON. Please ensure it is valid JSON.");
        }
    };

    const handleUploadFallbacks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            processAIOMetadata(event.target?.result as string);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handlePasteImport = () => {
        if (!pastedJson.trim()) return;
        processAIOMetadata(pastedJson);
    };

    const handleResetCatalogNames = () => {
        setIsResetConfirmOpen(true);
    };

    const confirmResetCatalogNames = () => {
        setCustomFallbacks({});
        localStorage.removeItem("omni_custom_fallbacks");
        showNotice("info", "Imported AIOMetadata names were cleared.");
        setIsResetConfirmOpen(false);
    };

    return (
        <div className="relative flex min-h-screen lg:h-[100dvh] w-full max-w-[100vw] overflow-x-hidden lg:overflow-y-hidden bg-transparent text-foreground font-sans">


            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 border-r border-border bg-card/95 backdrop-blur-md lg:backdrop-blur-none lg:bg-card flex flex-col transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-5 pt-[calc(1.25rem+env(safe-area-inset-top))] border-b border-border flex flex-col gap-4 bg-card/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-base font-black flex items-center gap-3 text-white tracking-tight">
                                <div className="w-16 h-16 flex items-center justify-center shrink-0 relative group">
                                    <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain relative z-10 scale-125" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="leading-none text-foreground">Omni Snapshot</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">Manager</span>
                                </div>
                            </h1>
                        </div>
                        {/* Mobile Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-foreground/70 hover:text-white -mr-2"
                            onClick={() => setIsSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </Button>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map(section => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="block px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            {section.title}
                        </a>
                    ))}
                    <div className="pt-4 mt-4 border-t border-border space-y-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 h-10 px-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 font-medium"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Documentation
                                </Button>
                            </DialogTrigger>
                            <Documentation />
                        </Dialog>
                        <Button
                            asChild
                            variant="ghost"
                            className="w-full justify-start gap-3 h-10 px-3 text-sm text-pink-600 dark:text-pink-500 hover:text-pink-700 dark:hover:text-pink-400 hover:bg-pink-500/10 font-medium"
                        >
                            <a href="https://ko-fi.com/botbidraiser" target="_blank" rel="noopener noreferrer">
                                <Heart className="w-4 h-4" />
                                Support Me
                            </a>
                        </Button>
                    </div>
                </nav>

                <div className="p-4 border-t border-border bg-card flex flex-col gap-2">
                    <div className="bg-background/40 rounded-lg p-2.5 border border-border/60 mb-1">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="text-xs font-bold uppercase tracking-wide text-foreground/70 flex items-center gap-1.5 leading-none">
                                <FileJson className="w-3 h-3 text-foreground/70" />
                                Selected File
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-foreground/70 hover:text-blue-500 hover:bg-blue-500/10 -mr-1 -mt-1 group/back"
                                onClick={handleBackToStart}
                                title="Back to Start"
                                aria-label="Back to start"
                            >
                                <LogOut className="w-3.5 h-3.5 transition-transform group-hover/back:-translate-x-0.5" />
                            </Button>
                        </div>
                        <p className="text-xs text-foreground/70 font-mono truncate">{fileName}</p>
                    </div>

                    <div className="hidden lg:flex flex-col gap-2">
                        <Button
                            onClick={handleDownloadClick}
                            className="w-full font-bold h-10 sm:h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            <Download className="w-4 h-4 mr-2.5" />
                            Download JSON
                        </Button>
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            className="w-full text-foreground/70 hover:text-white h-10 bg-muted/40 border border-border/60 hover:bg-muted transition-all px-4"
                        >
                            <Copy className="w-4 h-4 mr-2.5" />
                            Copy to Clipboard
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-3 pb-2 border-t border-border/40">
                        <div className="flex items-center justify-between">
                            <a href="https://github.com/nobnobz/omni-snapshot-editor" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors font-medium">
                                <Github className="w-3.5 h-3.5" />
                                GitHub
                            </a>
                            <div className="scale-[0.80] origin-right -my-1">
                                <ThemeToggle />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-foreground/40 font-medium leading-none scale-95 origin-left">
                                Made by Bot-Bid-Raiser
                            </div>
                            <div className="text-xs text-foreground/40 font-mono leading-none scale-95 origin-right">
                                v{APP_VERSION}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-md bg-card border-border text-foreground">
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
                                className="h-10 sm:h-9 text-base sm:text-sm bg-background border-border focus-visible:ring-blue-500"
                            />
                            <p className="text-xs text-foreground/70">
                                The export will include a new timestamp automatically.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="hover:bg-accent hover:text-accent-foreground border border-transparent">
                            Cancel
                        </Button>
                        <Button onClick={confirmDownload} className={editorAction.primary}>
                            Confirm & Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-x-hidden lg:overflow-y-auto scroll-smooth relative z-10 pb-safe-bottom"
            >
                {/* Desktop Static Header (Not Sticky) */}
                <div className="hidden lg:flex items-center justify-between px-8 py-10 border-b border-border bg-gradient-to-b from-card to-transparent">
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Configuration Editor</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={handleBackToStart}
                            className="text-foreground/70 hover:text-foreground hover:bg-accent transition-colors gap-2 px-4 h-10"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Back to Start
                        </Button>
                    </div>
                </div>

                <header
                className={`sticky top-0 z-50 w-full border-b transition-all duration-300 transform pt-safe-top flex items-center px-4 h-[calc(4rem+env(safe-area-inset-top))] lg:hidden
                    ${isScrolled ? "border-transparent bg-transparent backdrop-blur-none" : "border-border/40 bg-card/55 backdrop-blur-xl"}
                    ${isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
                `}
            >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-foreground/70 hover:text-white lg:hidden h-9 w-9 shrink-0"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 relative">
                            <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain relative z-10 scale-125" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-none text-foreground font-bold text-sm sm:text-sm">Omni Snapshot</span>
                            <span className="text-xs text-blue-400 font-bold uppercase tracking-wide mt-0.5">Manager</span>
                        </div>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1 sm:gap-3">
                        <Button
                            onClick={handleDownloadClick}
                            size="sm"
                            className="h-9 px-2.5 sm:px-4 flex items-center justify-center font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            <Download className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className={`h-9 min-w-[36px] sm:w-[100px] flex items-center justify-center transition-all duration-300 border-border/60 hover:bg-muted px-2.5 sm:px-3 ${isCopied ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5' : 'text-foreground/80'}`}
                            title="Copy to Clipboard"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Copy</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackToStart}
                            className="h-9 w-9 text-foreground/70 hover:text-foreground hover:bg-muted"
                            title="Back to Start"
                            aria-label="Back to start"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-10 space-y-10">
                    {uiNotice && (
                        <div
                            className={cn(
                                "rounded-xl border px-4 py-3 text-sm leading-relaxed",
                                uiNotice.tone === "error"
                                    ? editorNoticeTone.danger
                                    : uiNotice.tone === "success"
                                        ? editorNoticeTone.success
                                        : editorNoticeTone.info
                            )}
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span>{uiNotice.message}</span>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="shrink-0 text-foreground/80 hover:text-foreground"
                                    onClick={() => setUiNotice(null)}
                                    aria-label="Dismiss notice"
                                >
                                    <span className="text-base leading-none">x</span>
                                </Button>
                            </div>
                        </div>
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
                                            className="text-foreground/70 hover:text-white h-8 px-3 text-xs hover:bg-muted transition-colors gap-1.5"
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
                                                <p className="text-sm text-foreground/70 leading-relaxed">
                                                    Import your catalogs by uploading an AIOMetadata config file or pasting the JSON. To export your catalogs in AIOMetadata, go to Catalogs &gt; Share Setup.
                                                </p>
                                                <div className={cn("rounded-xl p-4 text-sm flex gap-4 items-start mt-4 shadow-sm border", editorNoticeTone.info)}>
                                                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                                                    <p className="leading-relaxed">
                                                        <span className="font-bold">Note:</span> You can skip this step if you don’t want to import additional catalogs from your AIOMetadata setup.
                                                    </p>
                                                </div>
                                                {Object.keys(customFallbacks).length > 0 && (
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* File Upload card */}
                                                <div className="group relative bg-card border border-border hover:border-border/80 rounded-xl p-4 transition-all duration-300 flex flex-col h-full overflow-hidden shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <div className="flex items-start gap-3 mb-auto relative z-10">
                                                        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                                            <UploadCloud className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-foreground mb-0.5">Upload File</h4>
                                                            <p className="text-xs text-foreground/70 leading-relaxed">
                                                                Import from your <code className="text-xs bg-white/5 border border-white/10 px-1 py-0.5 rounded text-foreground">aiometadata-config.json</code>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex-1 flex flex-col justify-end relative z-10">
                                                        <label
                                                            htmlFor="main-fallback-upload"
                                                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 hover:border-blue-500/40 rounded-lg mb-3 bg-muted/5 transition-colors cursor-pointer group/drop min-h-[96px]"
                                                        >
                                                            <UploadCloud className="w-5 h-5 mb-1.5 opacity-40 group-hover/drop:opacity-70 group-hover/drop:text-blue-500 transition-all" />
                                                            <span className="text-xs font-medium opacity-40 group-hover/drop:opacity-70 group-hover/drop:text-blue-500 transition-all">Select file to upload</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id="main-fallback-upload"
                                                            accept=".json"
                                                            className="hidden"
                                                            onChange={handleUploadFallbacks}
                                                        />
                                                        <label
                                                            htmlFor="main-fallback-upload"
                                                            className="w-full inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 border border-transparent shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all duration-200"
                                                        >
                                                            <UploadCloud className="w-4 h-4 mr-2" />
                                                            Select JSON File
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Paste JSON card */}
                                                <div className="group relative bg-card border border-border hover:border-border/80 rounded-xl p-4 transition-all duration-300 flex flex-col h-full overflow-hidden shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <div className="flex items-start gap-3 mb-3 relative z-10">
                                                        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500">
                                                            <ClipboardPaste className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-foreground mb-0.5">Paste Content</h4>
                                                            <p className="text-xs text-foreground/70 leading-relaxed">
                                                                Directly paste your raw JSON setup if you copied it to the clipboard.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 mt-auto relative z-10">
                                                        <Textarea
                                                            placeholder="Paste your JSON configuration here..."
                                                            className="min-h-[60px] text-base bg-muted/30 border-input focus:border-blue-500/50 text-foreground resize-none font-mono placeholder:text-foreground/50 custom-scrollbar rounded-lg"
                                                            value={pastedJson}
                                                            onChange={(e) => setPastedJson(e.target.value)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="w-full text-sm h-9 bg-blue-600 hover:bg-blue-500 text-white border-none rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all duration-200"
                                                            onClick={handlePasteImport}
                                                            disabled={!pastedJson.trim()}
                                                        >
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Import Configuration
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : section.id === "groups" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-5">
                                                <p className="text-sm text-foreground/70 px-1 leading-relaxed">
                                                    Create and organize groups, assign catalogs, and reorder items. To update your setup, use <strong>Update from Template</strong>.
                                                </p>
                                                <UnifiedSubgroupEditor />
                                            </div>
                                        </div>
                                    ) : section.id === "catalogs" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-5">
                                                <p className="text-sm text-foreground/70 px-1 leading-relaxed">
                                                    Manage global catalogs that appear below your groups. Enable/disable them, adjust appearance (e.g. landscape), and configure the ranked Top Row display.
                                                </p>
                                                <CatalogEditor />
                                            </div>
                                        </div>
                                    ) : section.id === "patterns" ? (
                                        <div className="space-y-5">
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-3 shadow-sm mt-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-600 dark:text-amber-500/90 leading-relaxed font-medium">
                                                    Only edit the patterns if you fully understand how they work. Import from template to safely get the latest visual tags.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Button
                                                    onClick={() => setIsImportPatternsOpen(true)}
                                                    className="bg-muted hover:bg-accent text-foreground border border-border shadow-sm mt-3"
                                                >
                                                    <UploadCloud className="w-5 h-5 mr-2" />
                                                    Import from Template
                                                </Button>
                                            </div>
                                            <ImportPatternsModal isOpen={isImportPatternsOpen} onClose={() => setIsImportPatternsOpen(false)} />
                                            <UnifiedPatternEditor />
                                        </div>
                                    ) : section.id === "settings" ? (
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
                                    ) : section.id === "ordering" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                {keysToRender.map(key => (
                                                    <OrderingEditor
                                                        key={key}
                                                        configKey={key}
                                                    />
                                                ))}
                                            </div>
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

                </div>
            </main>

            {/* Exit Confirmation Dialog */}
            <AlertDialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
                <AlertDialogContent className="bg-card border-border text-foreground">
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
                            className="h-9 border-none"
                        >
                            Yes, Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Catalog Names Confirmation */}
            <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <AlertDialogContent className="bg-card border-border text-foreground">
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
                            className="h-9 border-none"
                        >
                            Yes, Reset All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

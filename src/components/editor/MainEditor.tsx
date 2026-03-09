"use client";

import { useState } from "react";
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
    Search,
    Download,
    Copy,
    RotateCcw,
    Eye,
    Check,
    UploadCloud,
    ClipboardPaste,
    BookOpen,
    Menu,
    FileJson,
    Trash2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export function MainEditor() {
    const { originalConfig, currentValues, fileName, exportConfig, exportPartialConfig, resetAll, cleanupOrphans, customFallbacks, setCustomFallbacks, unloadConfig } = useConfig();
    const [searchTerm, setSearchTerm] = useState("");

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [isImportPatternsOpen, setIsImportPatternsOpen] = useState(false);
    const [pastedJson, setPastedJson] = useState("");

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    // Map keys to their section
    const keyToSectionMap = new Map<string, string>();
    sections.forEach(s => s.keys.forEach(k => keyToSectionMap.set(k, s.id)));

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

    const handleSectionExport = (sectionId: string, sectionTitle: string, keys: string[]) => {
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

    const handleCopy = () => {
        const config = exportConfig();
        if (!config) return;
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        alert("Copied to clipboard!");
    };


    const processAIOMetadata = (jsonText: string) => {
        try {
            const config = JSON.parse(jsonText);
            const catalogsList = config?.config?.catalogs || config?.catalogs;
            if (!catalogsList || !Array.isArray(catalogsList)) {
                alert("Invalid JSON format. Could not find catalogs array.");
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
            alert(`Successfully imported ${addedCount} catalog names!`);
            setPastedJson(""); // clear on success
        } catch (err) {
            console.error(err);
            alert("Failed to parse JSON. Please ensure it is valid JSON.");
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

    const handleResetAIOMetadata = () => {
        if (confirm("Are you sure you want to reset all imported catalog names from AIOMetadata? This will clear your custom names and revert to defaults for any newly added catalogs. Existing catalogs in your setup will keep their names until re-synced.")) {
            setCustomFallbacks({});
            localStorage.removeItem("omni_custom_fallbacks");
            alert("AIOMetadata imported names have been cleared.");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans relative">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 border-r border-border bg-card flex flex-col transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-5 border-b border-border flex flex-col gap-4 bg-card/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-base font-black flex items-center gap-3 text-white tracking-tight">
                                <div className="w-16 h-16 flex items-center justify-center shrink-0 relative group">
                                    <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain relative z-10 scale-125" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="leading-none text-foreground">Omni Snapshot</span>
                                    <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Manager</span>
                                </div>
                            </h1>
                        </div>
                        {/* Mobile Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-muted-foreground hover:text-white -mr-2"
                            onClick={() => setIsSidebarOpen(false)}
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
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            {section.title}
                        </a>
                    ))}
                    <div className="pt-4 mt-4 border-t border-border space-y-2">
                        <div className="flex items-center justify-between px-3 py-1">
                            <span className="text-sm text-muted-foreground font-medium">Appearance</span>
                            <ThemeToggle />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/10 rounded-md transition-colors font-medium">
                                    <BookOpen className="w-4 h-4" />
                                    Documentation
                                </button>
                            </DialogTrigger>
                            <Documentation />
                        </Dialog>
                    </div>
                </nav>

                <div className="p-4 border-t border-border bg-card flex flex-col gap-2">
                    <div className="bg-background/40 rounded-lg p-2.5 border border-border/60 mb-1 lg:block hidden">
                        <div className="flex justify-between items-center mb-1">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <FileJson className="w-3 h-3 text-muted-foreground" />
                                Selected File
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{fileName}</p>
                    </div>

                    <div className="hidden lg:flex flex-col gap-2">
                        <Button
                            onClick={handleDownloadClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-500/10"
                        >
                            <Download className="w-4 h-4 mr-2.5" />
                            Download JSON
                        </Button>
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-white h-10 bg-muted/40 border border-border/60 hover:bg-muted transition-all px-4"
                        >
                            <Copy className="w-4 h-4 mr-2.5" />
                            Copy to Clipboard
                        </Button>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/40">
                        <div className="text-[9px] text-muted-foreground font-medium">
                            Made by Bot-Bid-Raiser
                        </div>
                        <div className="text-[9px] text-muted-foreground font-medium text-right">
                            v0.1.0
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
                            <label className="text-sm text-muted-foreground">Setup Name</label>
                            <Input
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                placeholder="E.g., My Awesome Setup"
                                className="bg-background border-border focus-visible:ring-blue-500"
                            />
                            <p className="text-xs text-muted-foreground">
                                The export will include a new timestamp automatically.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="hover:bg-accent hover:text-accent-foreground border border-transparent">
                            Cancel
                        </Button>
                        <Button onClick={confirmDownload} className="bg-blue-600 hover:bg-blue-700">
                            Confirm & Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto scroll-smooth">
                {/* Desktop Static Header (Not Sticky) */}
                <div className="hidden lg:flex items-center justify-between px-8 py-8 border-b border-border bg-gradient-to-b from-card to-transparent">
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Configuration Editor</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={unloadConfig}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors gap-2 px-4 h-10"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Back to Start
                        </Button>
                    </div>
                </div>

                <header className="lg:hidden h-16 border-b border-border bg-card/80 backdrop-blur-sm shadow-sm flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center shrink-0 relative">
                            <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain relative z-10 scale-125" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-none text-foreground font-bold text-sm">Omni Snapshot</span>
                            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Manager</span>
                        </div>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-9 px-2 sm:px-3 bg-muted border border-border hover:bg-accent hover:border-border transition-all"
                        >
                            <Copy className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline-block md:hidden">Copy</span>
                            <span className="hidden md:inline-block">Copy to Clipboard</span>
                        </Button>

                        <Button
                            onClick={handleDownloadClick}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-9 text-white shadow-lg shadow-blue-500/20 px-3 sm:px-4 flex items-center justify-center font-bold"
                        >
                            <Download className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline-block md:hidden">Download</span>
                            <span className="hidden md:inline-block">Download .json</span>
                        </Button>

                        <div className="w-px h-6 bg-muted mx-0.5 sm:mx-1" />

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-white h-9 px-2 sm:px-3 hover:bg-muted transition-colors"
                            onClick={unloadConfig}
                        >
                            <RotateCcw className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline-block md:hidden">Back</span>
                            <span className="hidden md:inline-block">Back to Start</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-muted-foreground hover:text-white lg:hidden h-9 w-9 shrink-0"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto p-8 space-y-12">



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
                            <section key={section.id} id={section.id} className="scroll-mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-medium text-foreground">{section.title}</h3>
                                    {["groups", "catalogs", "patterns"].includes(section.id) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-white h-8 px-3 text-xs hover:bg-muted transition-colors gap-1.5"
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
                                            <div className="space-y-3">
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                                    <strong>Note:</strong> Import your catalogs by uploading an AIOMetadata configuration file. In AIOMetadata, go to Catalogs and share your setup by downloading the .json file or copying it to the clipboard.
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm leading-relaxed">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-red-600 dark:text-red-400 font-medium">You can skip this step if you only want to use my template and do not want to add any new catalogs.</div>
                                                        {Object.keys(customFallbacks).length > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={handleResetAIOMetadata}
                                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 h-8 px-3 text-xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                                Reset Imported Data
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* File Upload card */}
                                                <div className="group relative bg-card border border-border hover:border-border/80 rounded-xl p-6 transition-all duration-300 flex flex-col h-full overflow-hidden shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <div className="flex items-start gap-4 mb-auto relative z-10">
                                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                                            <UploadCloud className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-medium text-foreground mb-1">Upload File</h4>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                Import from your <code className="text-[11px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-foreground">aiometadata-config.json</code>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 relative z-10">
                                                        <input
                                                            type="file"
                                                            id="main-fallback-upload"
                                                            accept=".json"
                                                            className="hidden"
                                                            onChange={handleUploadFallbacks}
                                                        />
                                                        <label
                                                            htmlFor="main-fallback-upload"
                                                            className="w-full inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white h-10 px-4 border border-transparent shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all duration-200"
                                                        >
                                                            <UploadCloud className="w-4 h-4 mr-2" />
                                                            Select JSON File
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Paste JSON card */}
                                                <div className="group relative bg-card border border-border hover:border-border/80 rounded-xl p-6 transition-all duration-300 flex flex-col h-full overflow-hidden shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <div className="flex items-start gap-4 mb-5 relative z-10">
                                                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                                                            <ClipboardPaste className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-medium text-foreground mb-1">Paste Content</h4>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                                Directly paste your raw JSON setup if you copied it to the clipboard.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 mt-auto relative z-10">
                                                        <Textarea
                                                            placeholder="Paste your JSON configuration here..."
                                                            className="min-h-[100px] text-sm bg-white/5 border-white/10 focus:border-purple-500/50 text-foreground resize-none font-mono placeholder:text-muted-foreground custom-scrollbar rounded-lg"
                                                            value={pastedJson}
                                                            onChange={(e) => setPastedJson(e.target.value)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="w-full text-sm h-10 bg-purple-600 hover:bg-purple-500 text-white border-none rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.2)] transition-all duration-200"
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
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                                <strong>Note:</strong> Create and organize groups, assign catalogs, and reorder items. To update your existing setup with new catalogs or images from my template, use <strong>Update from Template</strong> and select my template.
                                            </div>
                                            <UnifiedSubgroupEditor />
                                        </div>
                                    ) : section.id === "catalogs" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                                    <strong>Note:</strong> Manage your global catalogs here. Global catalogs appear below your groups on the home screen. You can enable or disable them, adjust their appearance, configure the top row, and change their order.
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                                    <strong>Note:</strong> The Top Row displays a ranked catalog with numbered items below Continue Watching. You can hide the catalog after enabling the Top Row and the Top Row still appears.
                                                </div>
                                            </div>
                                            <CatalogEditor />
                                        </div>
                                    ) : section.id === "patterns" ? (
                                        <div className="space-y-6">
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
                                                <div className="text-red-600 dark:text-red-400 font-medium">Only edit the patterns if you fully understand how they work.</div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() => setIsImportPatternsOpen(true)}
                                                    className="bg-muted hover:bg-accent text-foreground border border-border shadow-sm"
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
                                            <div className="space-y-6">
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
                                            {keysToRender.map(key => (
                                                <OrderingEditor
                                                    key={key}
                                                    configKey={key}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {keysToRender.map(key => (
                                                <GenericRenderer
                                                    key={key}
                                                    data={currentValues[key]}
                                                    path={[key]}
                                                    searchQuery={searchTerm}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}

                </div>
            </main>
        </div>
    );
}

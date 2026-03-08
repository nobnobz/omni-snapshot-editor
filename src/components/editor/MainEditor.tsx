"use client";

import { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericRenderer } from "@/components/editor/GenericRenderer";
import { CatalogEditor } from "@/components/editor/CatalogEditor";
import { UnifiedSubgroupEditor } from "@/components/editor/UnifiedSubgroupEditor";
import { UnifiedPatternEditor } from "@/components/editor/UnifiedPatternEditor";
import { OrderingEditor } from "@/components/editor/OrderingEditor";
import { Textarea } from "@/components/ui/textarea";
import { Documentation } from "@/components/editor/Documentation";
import {
    Search,
    Download,
    Copy,
    RotateCcw,
    Eye,
    Wrench,
    Check,
    UploadCloud,
    ClipboardPaste,
    BookOpen
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
    const { originalConfig, currentValues, fileName, exportConfig, resetAll, cleanupOrphans, customFallbacks, setCustomFallbacks, unloadConfig } = useConfig();
    const [searchTerm, setSearchTerm] = useState("");

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [setupName, setSetupName] = useState("");
    const [pastedJson, setPastedJson] = useState("");

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
        "oled_mode_enabled",
        "metadata_cache_duration",
        "hidden_stream_button_elements",
        "auto_play_enabled_patterns",
        "hide_addon_info_in_catalog_names",
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
        { id: "groups", title: "Groups Manager", keys: ["subgroup_order", "main_catalog_groups", "catalog_group_image_urls", "catalog_groups"] },
        { id: "catalogs", title: "Catalogs Manager", keys: ["selected_catalogs", "pinned_catalogs", "small_catalogs", "top_row_catalogs", "starred_catalogs", "randomized_catalogs", "small_toprow_catalogs", "catalog_ordering", "custom_catalog_names"] },
        { id: "settings", title: "General Settings", keys: ["hide_external_playback_prompt", "hide_spoilers", "mdblist_enabled_ratings", "small_continue_watching_shelf", "preferred_audio_language", "preferred_subtitle_language"] },
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

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col">
                <div className="p-4 border-b border-neutral-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-blue-600 p-1.5 rounded text-white text-xs">O</span>
                        Omni Config
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1 truncate">{fileName}</p>
                </div>

                <div className="p-4 border-b border-neutral-800 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                        <Input
                            placeholder="Search settings..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 bg-neutral-950 border-neutral-800 text-sm h-9"
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map(section => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="block px-3 py-2 text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition-colors"
                        >
                            {section.title}
                        </a>
                    ))}
                    <div className="pt-4 mt-4 border-t border-neutral-800">
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

                <div className="p-4 border-t border-neutral-800 space-y-2">


                    <Button onClick={handleDownloadClick} className="w-full bg-blue-600 hover:bg-blue-700 h-9 shrink-0" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download JSON
                    </Button>
                    <Button onClick={handleCopy} variant="outline" className="w-full border-neutral-800 bg-transparent hover:bg-neutral-800 h-9 shrink-0" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                    </Button>
                </div>
            </aside>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-md bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Export Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400">Setup Name</label>
                            <Input
                                value={setupName}
                                onChange={(e) => setSetupName(e.target.value)}
                                placeholder="E.g., My Awesome Setup"
                                className="bg-neutral-950 border-neutral-800 focus-visible:ring-blue-500"
                            />
                            <p className="text-xs text-neutral-500">
                                The export will include a new timestamp automatically.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setIsExportModalOpen(false)} className="hover:bg-neutral-800 border border-transparent">
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
                <div className="max-w-4xl mx-auto p-8 space-y-12">

                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                        <h2 className="text-2xl font-semibold">Configuration Editor</h2>
                        <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white" onClick={unloadConfig}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Back to Start
                        </Button>
                    </div>

                    {sections.map(section => {
                        // Find keys that exist in current config for this section
                        const sectionKeys = section.keys.filter(k => currentValues[k] !== undefined);

                        // For settings section, get all assigned keys plus all keys not in other sections
                        let keysToRender = sectionKeys;

                        // Filter out ignored keys entirely from ANY section UI
                        keysToRender = keysToRender.filter(k => !ignoredKeys.has(k));

                        if (keysToRender.length === 0 && !["aiometadata", "catalogs", "groups", "patterns"].includes(section.id)) return null;

                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-medium text-neutral-200">{section.title}</h3>
                                </div>

                                <div className="space-y-4">
                                    {section.id === "aiometadata" ? (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80 leading-relaxed">
                                                    <strong>Note:</strong> Import your catalogs by uploading an AIOMetadata configuration file. In AIOMetadata, go to Catalogs and share your setup by downloading the .json file or copying it to the clipboard.
                                                </div>
                                                <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80 leading-relaxed">
                                                    <div className="text-red-400/80 font-medium">You can skip this step if you only want to use my template and do not want to add any new catalogs.</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* File Upload card */}
                                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 flex items-start gap-4 h-full">
                                                    <div className="mt-1 bg-blue-500/10 p-2 rounded-full hidden sm:block">
                                                        <UploadCloud className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <h4 className="text-sm font-medium text-neutral-200">Upload AIOMetadata</h4>
                                                        <p className="text-xs text-neutral-400 leading-relaxed">
                                                            Select your <code className="text-[10px] bg-neutral-800 px-1 rounded">aiometadata-config.json</code> to import your catalogs.
                                                        </p>
                                                        <div className="pt-2">
                                                            <input
                                                                type="file"
                                                                id="main-fallback-upload"
                                                                accept=".json"
                                                                className="hidden"
                                                                onChange={handleUploadFallbacks}
                                                            />
                                                            <label
                                                                htmlFor="main-fallback-upload"
                                                                className="inline-flex cursor-pointer items-center justify-center rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 h-8 px-4 border border-neutral-700 transition-colors w-full sm:w-auto"
                                                            >
                                                                <UploadCloud className="w-3.5 h-3.5 mr-2" />
                                                                Upload File
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Paste JSON card */}
                                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-5 flex items-start gap-4 h-full">
                                                    <div className="mt-1 bg-blue-500/10 p-2 rounded-full hidden sm:block">
                                                        <ClipboardPaste className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <h4 className="text-sm font-medium text-neutral-200">Paste JSON Content</h4>
                                                        <Textarea
                                                            placeholder="Paste your AIOMetadata JSON here..."
                                                            className="min-h-[100px] text-xs bg-neutral-950 border-neutral-800 focus:border-blue-500/50 transition-colors custom-scrollbar"
                                                            value={pastedJson}
                                                            onChange={(e) => setPastedJson(e.target.value)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-500 text-white border-none"
                                                            onClick={handlePasteImport}
                                                            disabled={!pastedJson.trim()}
                                                        >
                                                            <Check className="w-3.5 h-3.5 mr-2" />
                                                            Import from Paste
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : section.id === "groups" ? (
                                        <div className="space-y-6">
                                            <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80 leading-relaxed">
                                                <strong>Note:</strong> Create and organize groups, assign catalogs, and reorder items. To update your existing setup with new catalogs or images from my template, use <strong>Update from Template</strong> and select my template.
                                            </div>
                                            <UnifiedSubgroupEditor />
                                        </div>
                                    ) : section.id === "catalogs" ? (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80 leading-relaxed">
                                                    <strong>Note:</strong> Manage your global catalogs here. Global catalogs appear below your groups on the home screen. You can enable or disable them, adjust their appearance, configure the top row, and change their order.
                                                </div>
                                                <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80 leading-relaxed">
                                                    <strong>Note:</strong> The Top Row displays a ranked catalog with numbered items below Continue Watching. You can hide the catalog after enabling the Top Row and the Top Row still appears.
                                                </div>
                                            </div>
                                            <CatalogEditor />
                                        </div>
                                    ) : section.id === "patterns" ? (
                                        <div className="space-y-6">
                                            <div className="bg-blue-900/10 border border-blue-900/30 rounded p-4 text-sm text-blue-200/80">
                                                <div className="text-red-400/80 font-medium">Only edit the patterns if you fully understand how they work.</div>
                                            </div>
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

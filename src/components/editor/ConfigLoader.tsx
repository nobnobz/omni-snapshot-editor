"use client";

import { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Github, Upload, CheckCircle2, Sparkles, FileJson, BookOpen, Heart, ChevronDown, FileDown, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Documentation } from "@/components/editor/Documentation";
import { TemplateGuide } from "@/components/editor/TemplateGuide";

function fixMojibakeString(str: string): string {
    if ([...str].some(c => c.charCodeAt(0) > 255)) return str;
    try {
        const bytes = new Uint8Array(str.split("").map(c => c.charCodeAt(0)));
        const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return decoded === str ? str : decoded;
    } catch (e) {
        return str;
    }
}

function repairMojibakeInConfig(obj: any): any {
    if (typeof obj === "string") {
        return fixMojibakeString(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(repairMojibakeInConfig);
    } else if (obj !== null && typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = repairMojibakeInConfig(obj[key]);
        }
        return newObj;
    }
    return obj;
}

export function ConfigLoader() {
    const { loadConfig, manifest, manifestStatus, fetchManifest } = useConfig();

    useEffect(() => {
        fetchManifest();
    }, []);

    const templates: { label: string; url: string }[] = manifest?.templates.omni ? [
        {
            label: manifest.templates.omni.label,
            url: manifest.templates.omni.url
        }
    ] : [
        {
            label: "UME Template",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        },
    ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);
    const [url, setUrl] = useState(templates[0].url);

    useEffect(() => {
        if (manifest?.templates.omni) {
            setSelectedVersion(manifest.templates.omni.label);
            setUrl(manifest.templates.omni.url);
        }
    }, [manifest]);

    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVersionChange = (version: string) => {
        setSelectedVersion(version);
        const t = templates.find(t => t.label === version);
        if (t) setUrl(t.url);
    };

    const fetchFromGitHub = async () => {
        if (!url) {
            setError("Please enter a valid GitHub raw URL.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `token ${token}`;
            }
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(buffer);
            const json = repairMojibakeInConfig(JSON.parse(text));
            const fn = url.split("/").pop() || "omni-config.json";
            loadConfig(json, fn);
        } catch (err: any) {
            setError(err.message || "Failed to load JSON from URL.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (url: string, defaultFilename: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = defaultFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download file. Please try right-clicking and 'Save Link As'.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = repairMojibakeInConfig(JSON.parse(event.target?.result as string));
                loadConfig(json, file.name);
            } catch (err) {
                setError("Invalid JSON file.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file, "UTF-8");
    };

    const handleCreateBlank = () => {
        const wrap = (val: any) => ({ _data: btoa(JSON.stringify(val)) });
        const skeleton: any = {
            name: "New Project",
            version: "1.0.0",
            values: {
                subgroup_order: wrap({}),
                main_catalog_groups: wrap({}),
                catalog_groups: wrap({}),
                catalog_group_image_urls: wrap({}),
                selected_catalogs: wrap(["omni_empty_setup_placeholder"]),
                pinned_catalogs: wrap([]),
                small_catalogs: wrap([]),
                top_row_catalogs: wrap([]),
                starred_catalogs: wrap([]),
                randomized_catalogs: wrap([]),
                small_toprow_catalogs: wrap([]),
                catalog_ordering: wrap([]),
                custom_catalog_names: wrap({}),
                regex_pattern_custom_names: wrap({}),
                regex_pattern_image_urls: wrap({}),
                pattern_tag_enabled_patterns: wrap([]),
                pattern_default_filter_enabled_patterns: wrap([]),
                pattern_image_color_indices: wrap({}),
                pattern_border_radius_indices: wrap({}),
                pattern_background_opacities: wrap({}),
                pattern_border_thickness_indices: wrap({}),
                pattern_color_indices: wrap({}),
                pattern_color_hex_values: wrap({}),
                auto_play_enabled_patterns: wrap([]),
                auto_play_patterns: wrap([]),
                landscape_catalogs: wrap([]),
                disabled_shelves: wrap([]),
                subtitle_color: wrap({ opacity: 1, red: 1, green: 1, blue: 1 }),
                subtitle_background_color: wrap({ opacity: 0.5, red: 0, green: 0, blue: 0 }),
                top_row_item_limits: wrap({}),
                shelf_order: wrap(["Continue Watching", "Top Row", "Catalog Groups", "Catalog", "Live TV", "AI Recommendations"]),

                // Primitive booleans (fix for clean setup, MUST NOT be wrapped):
                hide_external_playback_prompt: false, // false by default in clean config (ON)
                hide_spoilers: false,
                small_continue_watching_shelf: false,
                oled_mode_enabled: true,
                hide_addon_info_in_catalog_names: true,
                hidden_stream_button_elements: ["Metadata Tags", "Addon Name"],

                // Wrapped ones
                mdblist_enabled_ratings: wrap(["tomatoes", "imdb"]),
                searchEnabled: false,
                traktSearchEnabled: false,
                preferred_audio_language: "eng",
                preferred_subtitle_language: "eng",
                catalog_cache_duration: 2,
                bottom_align_logo: false,
                default_metadata_provider: "aio-metadata",
                subtitle_font_size: 8,
                isASSUseImageRender: false,
                isSRTUseImageRender: false,
                metadata_cache_duration: 2,
                image_cache_duration: 10,
                show_metadata_provider: false,
                intro_skip_times: {},
                stream_button_elements_order: ["Title", "Metadata Tags", "Pattern Tags", "Addon Name"],
                subtitle_bold: false,
                show_metadata_tags: true,
                subtitle_italic: false,
                always_show_titles: true,
                enable_external_player_trakt_scrobbling: false,
                show_only_first_regex_tag: false,
                high_contrast_focus: false,
                main_group_order: [],
                catalog_group_order: [],
            },
            catalogs: []
        };
        skeleton.includedKeys = Object.keys(skeleton.values);
        loadConfig(skeleton, "clear-config.json");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-8 font-sans text-foreground relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000" />
            <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-500/10 dark:bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-8000" />

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-5xl relative z-10">
                <div className="text-center mb-6 space-y-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2 mx-auto">
                        <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Omni Snapshot Manager
                    </h1>
                    <p className="text-sm sm:text-base text-foreground/70 max-w-lg mx-auto leading-relaxed">
                        Import an Omni snapshot from GitHub or your local disk, or create a new setup from scratch.
                    </p>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors font-medium border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-sm">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="hidden sm:inline">Documentation</span>
                                    <span className="sm:hidden">Docs</span>
                                </button>
                            </DialogTrigger>
                            <Documentation />
                        </Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium border border-white/20 hover:border-white/40 backdrop-blur-sm group">
                                    <Github className="w-4 h-4" />
                                    <span>UME Templates</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-card border-border shadow-2xl backdrop-blur-xl" align="center">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold px-3 py-2">
                                    Project Resources
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400">
                                    <a
                                        href="https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 w-full px-2 py-1.5"
                                    >
                                        <Github className="w-4 h-4" />
                                        <span className="text-xs font-semibold">UME Template</span>
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400">
                                    <a
                                        href="https://github.com/nobnobz/omni-snapshot-editor"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 w-full px-2 py-1.5"
                                    >
                                        <Github className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Editor Source Code</span>
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold px-3 py-2">
                                    Help & Guides
                                </DropdownMenuLabel>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400 flex items-center gap-2 px-3 py-1.5"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span className="text-xs font-semibold">How to Install</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                    <TemplateGuide />
                                </Dialog>

                                <DropdownMenuSeparator className="bg-border/40" />
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold px-3 py-2">
                                    Direct Downloads
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400 flex items-center gap-2 px-3 py-1.5"
                                    onClick={() => handleDownload(manifest?.templates.omni.url || "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json", "omni-snapshot-ume.json")}
                                >
                                    <FileJson className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Omni Snapshot (UME)</span>
                                    <FileDown className="w-3 h-3 ml-auto opacity-40" />
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className={`flex items-center gap-2 px-3 py-1.5 ${!manifest?.templates.aiometadata ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400'}`}
                                    onClick={() => {
                                        if (manifest?.templates.aiometadata) {
                                            handleDownload(manifest.templates.aiometadata.url, "aiometadata-template.json");
                                        }
                                    }}
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span className="text-xs font-semibold">AIOMetadata Template</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className={`flex items-center gap-2 px-3 py-1.5 ${!manifest?.templates.aiostreams ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400'}`}
                                    onClick={() => {
                                        if (manifest?.templates.aiostreams) {
                                            handleDownload(manifest.templates.aiostreams.url, "aiostreams-template.json");
                                        }
                                    }}
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span className="text-xs font-semibold">AioStreams Template</span>
                                </DropdownMenuItem>
                                <div className="px-3 py-2">
                                    <p className="text-[9px] text-foreground/40 leading-tight">
                                        More templates available in the GitHub repository.
                                    </p>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <a href="https://ko-fi.com/botbidraiser" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors font-medium border border-pink-500/20 hover:border-pink-500/40 backdrop-blur-sm group">
                            <Heart className="w-4 h-4 group-hover:fill-pink-500/20 transition-all" />
                            <span className="hidden sm:inline">Support my work</span>
                            <span className="sm:hidden">Support</span>
                        </a>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-xl flex gap-3 items-start backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* 1. Local File Section */}
                    <Card className="bg-card/90 dark:bg-card/60 border-border/80 dark:border-border/60 backdrop-blur-xl shadow-lg dark:shadow-2xl flex flex-col h-full transition-all duration-300 hover:border-foreground/20 dark:hover:border-border/80 hover:bg-card hover:shadow-xl dark:hover:bg-card/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Upload className="w-5 h-5 text-foreground/70 group-hover:text-emerald-400 transition-colors" />
                                Custom Import
                            </CardTitle>
                            <CardDescription className="text-xs text-foreground/70 leading-relaxed">
                                Upload a local JSON configuration file.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col justify-center min-h-[180px] mb-4">
                                <Label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-full px-4 transition-all duration-300 bg-background/40 border border-border border-dashed rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-950/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <div className="pointer-events-none flex flex-col items-center justify-center space-y-3">
                                        <div className="p-3 bg-card rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg border border-border">
                                            <FileJson className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                Drop .json file here
                                            </p>
                                        </div>
                                    </div>
                                    <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileUpload} disabled={loading} />
                                </Label>
                            </div>
                            <div className="mt-auto">
                                <label
                                    htmlFor="file-upload"
                                    className={`flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md h-10 font-bold transition-all cursor-pointer shadow-sm text-sm ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                                >
                                    {loading ? "Loading..." : "Select Local File"}
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. GitHub Section */}
                    <Card className="bg-card/90 dark:bg-card/60 border-border/80 dark:border-border/60 backdrop-blur-xl shadow-lg dark:shadow-2xl flex flex-col h-full transition-all duration-300 hover:border-foreground/20 dark:hover:border-border/80 hover:bg-card hover:shadow-xl dark:hover:bg-card/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Github className="w-5 h-5 text-foreground/70 group-hover:text-blue-400 transition-colors" />
                                From GitHub
                            </CardTitle>
                            <CardDescription className="text-xs text-foreground/70 leading-relaxed">
                                Load a template directly from a raw URL or use my Unified Media Experience (UME) template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col justify-center min-h-[180px] mb-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-foreground/70">Template</Label>
                                    <Select value={selectedVersion} onValueChange={handleVersionChange}>
                                        <SelectTrigger className="w-full h-10 bg-background/40 border-border text-xs font-mono">
                                            <SelectValue placeholder="Select version" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {templates.map(t => (
                                                <SelectItem key={t.label} value={t.label} className="text-xs font-mono focus:bg-accent focus:text-accent-foreground">
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-muted"></div>
                                    <span className="text-[10px] text-foreground/70 uppercase font-bold tracking-wider">or enter url</span>
                                    <div className="flex-1 h-px bg-muted"></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="text-xs font-semibold text-foreground/70 lg:sr-only">URL</Label>
                                    <Input
                                        id="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://raw.githubusercontent.com/..."
                                        className="bg-background/40 border-border text-foreground placeholder:text-foreground/70 font-mono text-[10px] sm:text-xs h-10 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Button
                                    onClick={fetchFromGitHub}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white h-10 font-bold transition-all shadow-sm"
                                >
                                    {loading ? "Loading..." : "Load from GitHub"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Clean Slate Section */}
                    <Card className="bg-card/90 dark:bg-card/60 border-border/80 dark:border-border/60 backdrop-blur-xl shadow-lg dark:shadow-2xl flex flex-col h-full transition-all duration-300 hover:border-foreground/20 dark:hover:border-border/80 hover:bg-card hover:shadow-xl dark:hover:bg-card/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-foreground/70 group-hover:text-purple-400 transition-colors" />
                                Start Fresh
                            </CardTitle>
                            <CardDescription className="text-xs text-foreground/70 leading-relaxed">
                                Create an empty configuration skeleton.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[180px] mb-4">
                                <div className="p-4 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-xs text-center text-foreground/70 max-w-[180px]">
                                    Empty groups, catalogs, and patterns. Ready for your data.
                                </p>
                            </div>
                            <div className="mt-auto">
                                <Button
                                    onClick={handleCreateBlank}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-10 font-bold transition-all shadow-sm"
                                >
                                    Create Clean File
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest leading-relaxed">
                        v0.2.0 • Built with Antigravity by Bot-Bid-Raiser
                    </p>
                </div>
            </div>
        </div>
    );
}

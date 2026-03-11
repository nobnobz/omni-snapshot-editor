"use client";

import { validateOmniConfig } from "@/lib/config-utils";
import { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Github, Upload, Sparkles, FileJson, BookOpen, Heart, ChevronDown, FileDown, ExternalLink, ChevronRight, UploadCloud } from "lucide-react";
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
import { APP_VERSION } from "@/lib/constants";
import type { OmniConfig } from "@/lib/types";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
type LoaderSkeleton = OmniConfig & { catalogs?: unknown[] };

function fixMojibakeString(str: string): string {
    if ([...str].some(c => c.charCodeAt(0) > 255)) return str;
    try {
        const bytes = new Uint8Array(str.split("").map(c => c.charCodeAt(0)));
        const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return decoded === str ? str : decoded;
    } catch {
        return str;
    }
}

function repairMojibakeInConfig(obj: unknown): unknown {
    if (typeof obj === "string") {
        return fixMojibakeString(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(repairMojibakeInConfig);
    } else if (obj !== null && typeof obj === "object") {
        const newObj: Record<string, unknown> = {};
        for (const key in obj) {
            newObj[key] = repairMojibakeInConfig((obj as Record<string, unknown>)[key]);
        }
        return newObj;
    }
    return obj;
}

export function ConfigLoader() {
    const { loadConfig, manifest, fetchManifest } = useConfig();

    useEffect(() => {
        fetchManifest();
    }, [fetchManifest]);

    const templates: { label: string; url: string }[] = manifest?.templates?.length ?
        manifest.templates
            .filter(t => t.id.startsWith('ume-') && t.id !== 'ume-catalogs' && t.url)
            .map(t => ({ label: t.name, url: t.url })) : [
            {
                label: "UME Omni Template",
                url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
            },
        ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);
    const [url, setUrl] = useState(templates[0].url);

    useEffect(() => {
        const defaultTemplate = manifest?.templates?.find(t => t.id === 'ume-main' || t.isDefault);
        if (defaultTemplate) {
            setSelectedVersion(defaultTemplate.name);
            setUrl(defaultTemplate.url);
        }
    }, [manifest]);

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
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(buffer);
            const json = repairMojibakeInConfig(JSON.parse(text)) as OmniConfig;

            // Structural Validation
            if (!validateOmniConfig(json)) {
                throw new Error("The file is not a valid Omni configuration.");
            }

            const fn = url.split("/").pop() || "omni-config.json";
            loadConfig(json, fn);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load JSON from URL.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size Limit: 5MB
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > MAX_SIZE) {
            setError("The file is too large. Maximum allowed size is 5MB.");
            return;
        }

        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = repairMojibakeInConfig(JSON.parse(event.target?.result as string)) as OmniConfig;

                // Structural Validation
                if (!validateOmniConfig(json)) {
                    setError("The file is not a valid Omni configuration.");
                    setLoading(false);
                    return;
                }

                loadConfig(json, file.name);
            } catch {
                setError("Invalid JSON file.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file, "UTF-8");
    };

    const handleCreateBlank = () => {
        const wrap = (val: JsonValue): { _data: string } => ({ _data: btoa(JSON.stringify(val)) });
        const skeleton: LoaderSkeleton = {
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
        skeleton.includedKeys = Object.keys(skeleton.values as JsonObject);
        loadConfig(skeleton, "clear-config.json");
    };

    return (
        <div className="min-h-[100dvh] relative font-sans text-foreground selection:bg-blue-500/30 overflow-x-hidden">
            {/* Robust Background Stack - Guaranteed to cover full viewport including notch/safe areas */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                {/* 1. Base solid background */}
                <div className="absolute inset-0 bg-background" />

                {/* 2. Grid pattern - extended even further for super-robust coverage */}
                <div 
                    className="absolute inset-x-0 -top-[300px] -bottom-[300px]" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }} 
                />

                {/* 3. Decorative Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/15 dark:bg-blue-900/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/15 dark:bg-indigo-900/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-900/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
            </div>

            <div className="absolute top-4 right-4 z-50 pt-safe pr-safe">
                <ThemeToggle />
            </div>

            <div className="w-full min-h-[100dvh] flex items-center justify-center relative z-10 px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))]">
                {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 pt-safe-top">
                <div className="text-center mb-6 space-y-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2 mx-auto">
                        <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        Omni Snapshot Manager
                    </h1>
                    <p className="text-sm sm:text-base text-foreground/70 max-w-lg mx-auto leading-relaxed">
                        Import an Omni snapshot from GitHub or your local disk, or create a new setup from scratch.
                    </p>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        {/* Row 1: UME Templates (Centered & Prominent) */}
                        <div className="flex justify-center w-full">
                            {/* 1. UME Templates */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="group flex w-full max-w-[292px] items-center justify-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-6 py-3 text-blue-400 backdrop-blur-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:bg-blue-500/20 hover:shadow-blue-500/10 sm:min-w-[292px] sm:w-auto"
                                    >
                                        <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                            <FileDown className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="text-[13px] font-bold tracking-tight">Download UME Templates</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[280px] bg-card/95 border-border shadow-2xl backdrop-blur-2xl pb-2 animate-in fade-in zoom-in-95 duration-200" align="center">
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-black px-3 py-2.5">
                                        UME Templates
                                    </DropdownMenuLabel>
                                    {(() => {
                                        const templates = manifest?.templates?.filter(t => t.url && t.id !== 'ume-catalogs') || [];
                                        
                                        if (templates.length === 0) return (
                                            <div className="px-3 py-4 text-center">
                                                <p className="text-[10px] text-foreground/40 italic">No templates found.</p>
                                            </div>
                                        );

                                        return templates.map(template => {
                                            const versionRegex = /v\d+(?:\.\d+)*/;
                                            const v = template.name.match(versionRegex)?.[0];
                                            const baseName = template.name.replace(versionRegex, "").replace("UME Template", "Omni Template").trim() || "Omni Template";

                                            return (
                                                <DropdownMenuItem
                                                    key={template.id}
                                                    onSelect={() => {
                                                        setSelectedVersion(template.name);
                                                        setUrl(template.url);
                                                        // Scroll to GitHub section
                                                        document.querySelector('.grid')?.children[1].scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="cursor-pointer focus:bg-blue-500/15 focus:text-blue-400 flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors"
                                                >
                                                    <div className="p-1.5 bg-blue-500/10 rounded-md group-hover:bg-blue-500/20 transition-colors">
                                                        <FileJson className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-foreground">{baseName}</span>
                                                        {v && <span className="text-[9px] text-foreground/50 font-mono">{v}</span>}
                                                    </div>
                                                    <FileDown className="w-3 h-3 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                                                </DropdownMenuItem>
                                            );
                                        });
                                    })()}

                                    <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
                                    
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-black px-3 py-2">
                                        Guide
                                    </DropdownMenuLabel>
                                    <div className="px-1.5 py-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <DropdownMenuItem 
                                                    onSelect={(e) => e.preventDefault()}
                                                    className="cursor-pointer focus:bg-blue-500/15 focus:text-blue-400 flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors"
                                                >
                                                    <div className="p-1.5 bg-blue-500/10 rounded-md group-hover:bg-blue-500/20 transition-colors">
                                                        <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-foreground">How to Install</span>
                                                    <ChevronRight className="w-3 h-3 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                                                </DropdownMenuItem>
                                            </DialogTrigger>
                                            <TemplateGuide />
                                        </Dialog>
                                    </div>

                                    <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />

                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-black px-3 py-2">
                                        GitHub
                                    </DropdownMenuLabel>
                                    <div className="px-1.5 py-1 space-y-0.5">
                                        <DropdownMenuItem 
                                            asChild
                                            className="cursor-pointer focus:bg-foreground/10 flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors"
                                        >
                                            <a href="https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser" target="_blank" rel="noopener noreferrer">
                                                <div className="p-1.5 bg-foreground/5 rounded-md group-hover:bg-foreground/10 transition-colors">
                                                    <Github className="w-3.5 h-3.5 text-foreground/70" />
                                                </div>
                                                <span className="text-[11px] font-bold text-foreground/70">UME Templates</span>
                                                <ExternalLink className="w-3 h-3 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem 
                                            asChild
                                            className="cursor-pointer focus:bg-foreground/10 flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors"
                                        >
                                            <a href="https://github.com/nobnobz/omni-snapshot-editor" target="_blank" rel="noopener noreferrer">
                                                <div className="p-1.5 bg-foreground/5 rounded-md group-hover:bg-foreground/10 transition-colors">
                                                    <Github className="w-3.5 h-3.5 text-foreground/70" />
                                                </div>
                                                <span className="text-[11px] font-bold text-foreground/70">Omni Snapshot Manager</span>
                                                <ExternalLink className="w-3 h-3 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Row 2: Secondary Resources */}
                        <div className="flex w-full flex-row items-center justify-center gap-2 sm:gap-3">
                            {/* 2. Documentation */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        type="button"
                                        className="group flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-center text-indigo-400 backdrop-blur-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:bg-indigo-500/20 w-fit min-w-[120px]"
                                    >
                                        <BookOpen className="h-3.5 w-3.5 text-indigo-400/80 group-hover:text-indigo-400 transition-all" />
                                        <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Documentation</span>
                                    </button>
                                </DialogTrigger>
                                <Documentation />
                            </Dialog>

                            {/* 3. Support Me */}
                            <a
                                href="https://ko-fi.com/botbidraiser"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-center text-pink-400 backdrop-blur-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:bg-pink-500/20 hover:text-pink-400 w-fit min-w-[120px]"
                            >
                                <Heart className="h-3.5 w-3.5 text-pink-400/80 group-hover:text-pink-400 group-hover:fill-pink-400/10 transition-all" />
                                <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Support Me</span>
                            </a>
                        </div>
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
                                Upload a Omni JSON configuration file.
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
                                    className={`flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl h-10 font-bold transition-all cursor-pointer shadow-md text-sm ${loading ? 'opacity-70 pointer-events-none' : ''}`}
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
                                        className="h-10 sm:h-9 text-base sm:text-xs bg-muted/30 border-input focus:border-blue-500/50 text-foreground placeholder:text-foreground/40 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <Button
                                    onClick={fetchFromGitHub}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white h-10 font-bold transition-all shadow-md rounded-xl"
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
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-10 font-bold transition-all shadow-md rounded-xl"
                                >
                                    {loading ? "Loading..." : "Create Clean File"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 text-center pb-safe">
                    <p className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest leading-relaxed">
                        v0.2.19 • Built with Antigravity by Bot-Bid-Raiser
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
}

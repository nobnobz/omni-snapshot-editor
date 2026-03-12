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
import { cn } from "@/lib/utils";
import { downloadTemplateFile } from "@/lib/template-download";
import { editorLayout, editorNoticeTone } from "@/components/editor/ui/style-contract";

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

    const handleDownloadTemplate = async (templateUrl: string, templateName: string) => {
        try {
            setLoading(true);
            await downloadTemplateFile(templateUrl, templateName);
        } catch (err) {
            setError("Failed to download template. Please try again.");
            console.error(err);
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
        <div className="min-h-app-screen relative font-sans text-foreground selection:bg-blue-500/30 overflow-x-hidden">

            <div
                className="absolute z-50"
                style={{
                    top: "max(0.75rem, env(safe-area-inset-top))",
                    right: "max(0.75rem, env(safe-area-inset-right))",
                }}
            >
                <ThemeToggle />
            </div>

            <div className="w-full min-h-app-screen flex items-start sm:items-center justify-center relative z-10 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                {/* Content Wrapper */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
                    <div className="text-center mb-4 space-y-3">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center mb-0 mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element -- Static local logo; preserving existing rendering behavior. */}
                            <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm dark:drop-shadow-md">
                            Omni Snapshot Manager
                        </h1>
                        <p className="text-sm sm:text-base text-foreground/70 max-w-lg mx-auto leading-relaxed">
                            Import an Omni snapshot from GitHub or your local disk, or create a new setup from scratch.
                        </p>

                        <div className="pt-6 flex flex-col items-center gap-3">
                            {/* Row 1: UME Templates (Centered & Prominent) */}
                            <div className="mx-auto flex w-full max-w-[460px] justify-center">
                                {/* 1. UME Templates */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "group relative h-[52px] w-full justify-center rounded-[1.2rem] border border-blue-300 bg-blue-50 px-3 text-blue-700 backdrop-blur-xl shadow-[0_5px_12px_rgba(37,99,235,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-100 dark:border-blue-500/50 dark:bg-blue-500/16 dark:text-blue-200 dark:shadow-[0_5px_12px_rgba(9,45,120,0.18)] dark:hover:border-blue-400/65 dark:hover:bg-blue-500/20"
                                            )}
                                        >
                                            <span className="flex items-center justify-center gap-2.5">
                                                <FileDown className="h-[0.98rem] w-[0.98rem] text-blue-600 dark:text-blue-300" strokeWidth={2.2} />
                                                <span className="text-[0.94rem] font-semibold tracking-tight text-blue-700 dark:text-blue-200">Download UME Templates</span>
                                            </span>
                                            <ChevronDown className="absolute right-3.5 h-[0.92rem] w-[0.92rem] text-blue-600/85 transition-colors group-hover:text-blue-700 dark:text-blue-300/85 dark:group-hover:text-blue-200" strokeWidth={2.25} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="center"
                                        sideOffset={8}
                                        className="w-[min(22rem,calc(100vw-1.25rem))] rounded-xl border border-border/80 bg-card/95 p-1 pb-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.4)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
                                    >
                                        <DropdownMenuLabel className="px-2.5 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
                                            UME Templates
                                        </DropdownMenuLabel>
                                        {(() => {
                                            const templates = manifest?.templates?.filter(t => t.url && t.id !== 'ume-catalogs') || [];

                                            if (templates.length === 0) return (
                                                <div className="px-3 py-6 text-center">
                                                    <p className="text-sm text-foreground/45 italic">No templates found.</p>
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
                                                            handleDownloadTemplate(template.url, template.name);
                                                        }}
                                                        className="group/item flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-foreground focus:bg-blue-500/10 focus:text-foreground transition-colors"
                                                    >
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 ring-1 ring-inset ring-blue-500/20 group-hover/item:bg-blue-500/15 transition-colors">
                                                            <FileJson className="h-3 w-3 text-blue-400" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold text-foreground">{baseName}</span>
                                                            {v && <span className="block text-[10px] leading-tight text-foreground/40 font-normal tracking-[0.01em]">{v}</span>}
                                                        </div>
                                                        <div className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-300/70 opacity-80 transition-all group-hover/item:opacity-100 group-hover/item:border-blue-500/35 group-hover/item:bg-blue-500/15">
                                                            <FileDown className="h-3 w-3" />
                                                        </div>
                                                    </DropdownMenuItem>
                                                );
                                            });
                                        })()}

                                        <DropdownMenuSeparator className="mx-1.5 my-1 bg-border/60" />

                                        <DropdownMenuLabel className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
                                            Guide
                                        </DropdownMenuLabel>
                                        <div className="px-0.5 py-0">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="group/item flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-foreground focus:bg-blue-500/10 focus:text-foreground transition-colors"
                                                    >
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 ring-1 ring-inset ring-blue-500/20 group-hover/item:bg-blue-500/15 transition-colors">
                                                            <UploadCloud className="h-3 w-3 text-blue-400" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-foreground">How to Install</span>
                                                        <ChevronRight className="ml-auto h-3 w-3 text-foreground/35 transition-all group-hover/item:text-foreground/70" />
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                                <TemplateGuide />
                                            </Dialog>
                                        </div>

                                        <DropdownMenuSeparator className="mx-1.5 my-1 bg-border/60" />

                                        <DropdownMenuLabel className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/45">
                                            GitHub
                                        </DropdownMenuLabel>
                                        <div className="space-y-0.5 px-0.5 py-0">
                                            <DropdownMenuItem
                                                asChild
                                                className="group/item flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-foreground/80 focus:bg-foreground/10 transition-colors"
                                            >
                                                <a href="https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser" target="_blank" rel="noopener noreferrer">
                                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground/10 ring-1 ring-inset ring-border/80 transition-colors group-hover/item:bg-foreground/15">
                                                        <Github className="h-3 w-3 text-foreground/70" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground/80">UME Templates</span>
                                                    <ExternalLink className="ml-auto h-3 w-3 text-foreground/30 transition-all group-hover/item:text-foreground/65" />
                                                </a>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                asChild
                                                className="group/item flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-foreground/80 focus:bg-foreground/10 transition-colors"
                                            >
                                                <a href="https://github.com/nobnobz/omni-snapshot-editor" target="_blank" rel="noopener noreferrer">
                                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground/10 ring-1 ring-inset ring-border/80 transition-colors group-hover/item:bg-foreground/15">
                                                        <Github className="h-3 w-3 text-foreground/70" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground/80">Omni Snapshot Manager</span>
                                                    <ExternalLink className="ml-auto h-3 w-3 text-foreground/30 transition-all group-hover/item:text-foreground/65" />
                                                </a>
                                            </DropdownMenuItem>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Row 2: Secondary Resources */}
                            <div className="mx-auto grid w-full max-w-[460px] grid-cols-2 gap-2">
                                {/* 2. Documentation */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="group h-[46px] justify-center gap-1.5 rounded-[1.1rem] border border-indigo-300 bg-indigo-50 px-2.5 text-indigo-700 backdrop-blur-xl shadow-[0_4px_10px_rgba(79,70,229,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-500/50 dark:bg-indigo-500/14 dark:text-indigo-100 dark:hover:border-indigo-400/70 dark:hover:bg-indigo-500/18"
                                        >
                                            <BookOpen className="h-[0.9rem] w-[0.9rem] text-indigo-600 dark:text-indigo-300" strokeWidth={2.2} />
                                            <span className="text-[0.88rem] font-medium tracking-tight">Documentation</span>
                                        </Button>
                                    </DialogTrigger>
                                    <Documentation />
                                </Dialog>

                                {/* 3. Support Me */}
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="group h-[46px] justify-center gap-1.5 rounded-[1.1rem] border border-pink-300 bg-pink-50 px-2.5 text-pink-700 backdrop-blur-xl shadow-[0_4px_10px_rgba(236,72,153,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-400 hover:bg-pink-100 dark:border-pink-500/50 dark:bg-pink-500/14 dark:text-pink-100 dark:hover:border-pink-400/70 dark:hover:bg-pink-500/18"
                                >
                                    <a
                                        href="https://ko-fi.com/botbidraiser"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5"
                                    >
                                        <Heart className="h-[0.9rem] w-[0.9rem] text-pink-600 transition-all duration-300 group-hover:fill-pink-600/12 dark:text-pink-300 dark:group-hover:fill-pink-300/12" strokeWidth={2.2} />
                                        <span className="text-[0.88rem] font-medium tracking-tight">Support Me</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={cn("mb-6 p-4 text-sm border rounded-xl flex gap-3 items-start backdrop-blur-sm animate-in fade-in slide-in-from-top-4", editorNoticeTone.danger)}>
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-10">
                        {/* 1. Local File Section */}
                        <Card className={cn(editorLayout.sectionCard, "backdrop-blur-xl flex flex-col h-full transition-all duration-300 hover:border-border/80 hover:bg-card shadow-lg overflow-hidden group")}>
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
                        <Card className={cn(editorLayout.sectionCard, "backdrop-blur-xl flex flex-col h-full transition-all duration-300 hover:border-border/80 hover:bg-card shadow-lg overflow-hidden group")}>
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
                                            <SelectTrigger className="w-full h-10 bg-background/40 border-border text-base sm:text-sm font-mono">
                                                <SelectValue placeholder="Select version" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                {templates.map(t => (
                                                    <SelectItem key={t.label} value={t.label} className="text-sm sm:text-xs font-mono focus:bg-accent focus:text-accent-foreground">
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-muted"></div>
                                        <span className="text-xs text-foreground/70 uppercase font-bold tracking-wider">or enter url</span>
                                        <div className="flex-1 h-px bg-muted"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url" className="text-xs font-semibold text-foreground/70 lg:sr-only">URL</Label>
                                        <Input
                                            id="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://raw.githubusercontent.com/..."
                                            className="h-10 sm:h-9 text-base sm:text-sm bg-muted/30 border-input focus:border-blue-500/50 text-foreground placeholder:text-foreground/40 rounded-xl"
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
                        <Card className={cn(editorLayout.sectionCard, "backdrop-blur-xl flex flex-col h-full transition-all duration-300 hover:border-border/80 hover:bg-card shadow-lg overflow-hidden group")}>
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

                    <div className="mt-16 text-center pb-4">
                        <p className="text-[10px] sm:text-[11px] text-foreground/30 font-medium uppercase tracking-[0.16em] leading-none scale-[0.88] origin-center">
                            <span className="block">v{APP_VERSION} • By Bot-Bid-Raiser</span>
                            <span className="mt-1 block">Built with Antigravity</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Github, Upload, CheckCircle2, Sparkles, FileJson } from "lucide-react";

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
    const { loadConfig } = useConfig();

    const templates = [
        {
            label: "v1.7.1",
            url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json"
        },
    ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);
    const [url, setUrl] = useState(templates[0].url);
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
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-8 font-sans text-neutral-100 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-5xl relative z-10">
                <div className="text-center mb-8 sm:mb-12 space-y-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-2 mx-auto">
                        <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Omni Snapshot Manager
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed">
                        Load an Omni configuration file from GitHub or your local disk, or start a new project from scratch.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-xl flex gap-3 items-start backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* 1. Local File Section */}
                    <Card className="bg-neutral-900/60 border-neutral-800/60 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 hover:border-neutral-700/80 hover:bg-neutral-900/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Upload className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                                Custom Import
                            </CardTitle>
                            <CardDescription className="text-xs text-neutral-500 leading-relaxed">
                                Upload a local JSON configuration file.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col justify-center min-h-[180px] mb-4">
                                <Label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-full px-4 transition-all duration-300 bg-neutral-950/40 border border-neutral-800 border-dashed rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-950/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <div className="pointer-events-none flex flex-col items-center justify-center space-y-3">
                                        <div className="p-3 bg-neutral-900 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg border border-neutral-800">
                                            <FileJson className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">
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
                    <Card className="bg-neutral-900/60 border-neutral-800/60 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 hover:border-neutral-700/80 hover:bg-neutral-900/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Github className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                                From GitHub
                            </CardTitle>
                            <CardDescription className="text-xs text-neutral-500 leading-relaxed">
                                Load a template directly from a raw URL.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col justify-center min-h-[180px] mb-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-neutral-400">Template</Label>
                                    <select
                                        value={selectedVersion}
                                        onChange={(e) => handleVersionChange(e.target.value)}
                                        className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 text-xs text-neutral-100 font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                    >
                                        {templates.map(t => (
                                            <option key={t.label} value={t.label}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-neutral-800"></div>
                                    <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-wider">or enter url</span>
                                    <div className="flex-1 h-px bg-neutral-800"></div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="text-xs font-semibold text-neutral-400 lg:sr-only">URL</Label>
                                    <Input
                                        id="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://raw.githubusercontent.com/..."
                                        className="bg-neutral-950/40 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 font-mono text-[10px] sm:text-xs h-10 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500"
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
                    <Card className="bg-neutral-900/60 border-neutral-800/60 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 hover:border-neutral-700/80 hover:bg-neutral-900/80 overflow-hidden group">
                        <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                Start Fresh
                            </CardTitle>
                            <CardDescription className="text-xs text-neutral-500 leading-relaxed">
                                Create an empty configuration skeleton.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[180px] mb-4">
                                <div className="p-4 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform duration-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                    <Sparkles className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-xs text-center text-neutral-400 max-w-[180px]">
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
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                        v0.1.0 • Built with Antigravity by Bot-Bid-Raiser
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { validateOmniConfig } from "@/lib/config-utils";
import { useState, useEffect, type ReactNode } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertCircle,
    Github,
    Upload,
    Sparkles,
    FileJson,
    BookOpen,
    Heart,
    ChevronDown,
    FileDown,
    ExternalLink,
    ChevronRight,
    UploadCloud,
    RefreshCcw,
    type LucideIcon,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplateGuide } from "@/components/editor/TemplateGuide";
import { Documentation } from "@/components/editor/Documentation";
import { UpdateGuide } from "@/components/editor/UpdateGuide";
import { APP_VERSION } from "@/lib/constants";
import type { OmniConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { downloadTemplateFile } from "@/lib/template-download";
import { getTemplateDisplay } from "@/lib/template-display";
import { editorHover, editorLoader, editorNoticeTone, editorSurface } from "@/components/editor/ui/style-contract";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
type LoaderSkeleton = OmniConfig & { catalogs?: unknown[] };
type LoaderBadgeTone = "primary" | "neutral" | "pink" | "emerald" | "violet" | "amber";

const MAX_UPLOAD_SIZE_MB = 5;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const loaderBadgeToneClass: Record<LoaderBadgeTone, string> = {
    primary: "border-primary/24 bg-primary/[0.045] text-primary/90 dark:border-primary/22 dark:bg-primary/10 dark:text-primary",
    neutral: "border-slate-300/74 bg-white/78 text-foreground/72 dark:border-white/9 dark:bg-white/[0.04] dark:text-foreground/76",
    pink: "border-pink-400/24 bg-pink-500/[0.05] text-pink-600 dark:border-pink-400/22 dark:bg-pink-400/10 dark:text-pink-300",
    emerald: "border-emerald-400/24 bg-emerald-500/[0.05] text-emerald-600 dark:border-emerald-400/22 dark:bg-emerald-400/10 dark:text-emerald-300",
    violet: "border-violet-400/24 bg-violet-500/[0.05] text-violet-600 dark:border-violet-400/22 dark:bg-violet-400/10 dark:text-violet-300",
    amber: "border-amber-400/24 bg-amber-500/[0.05] text-amber-600 dark:border-amber-400/22 dark:bg-amber-400/10 dark:text-amber-300",
};

const loaderResourceIconToneClass: Record<LoaderBadgeTone, string> = {
    primary: "text-primary/88 transition-colors duration-200 ease-out group-hover/resource:text-primary dark:text-primary/88 dark:group-hover/resource:text-primary",
    neutral: "text-foreground/54 transition-colors duration-200 ease-out group-hover/resource:text-foreground/76 dark:text-foreground/68 dark:group-hover/resource:text-foreground/84",
    pink: "text-pink-600/86 transition-colors duration-200 ease-out group-hover/resource:text-pink-600 dark:text-pink-300/88 dark:group-hover/resource:text-pink-300",
    emerald: "text-emerald-600/78 transition-colors duration-200 ease-out group-hover/resource:text-emerald-600 dark:text-emerald-300/88 dark:group-hover/resource:text-emerald-300",
    violet: "text-violet-600/78 transition-colors duration-200 ease-out group-hover/resource:text-violet-600 dark:text-violet-300/88 dark:group-hover/resource:text-violet-300",
    amber: "text-amber-600/90 transition-colors duration-200 ease-out group-hover/resource:text-amber-600 dark:text-amber-300/88 dark:group-hover/resource:text-amber-300",
};

const loaderCardBadgeHoverToneClass: Record<LoaderBadgeTone, string> = {
    primary: "group-hover/card:border-primary/28 group-hover/card:bg-primary/[0.08] dark:group-hover/card:border-primary/32 dark:group-hover/card:bg-primary/14",
    neutral: "group-hover/card:border-slate-300/82 group-hover/card:bg-slate-100/72 dark:group-hover/card:border-white/14 dark:group-hover/card:bg-white/[0.07]",
    pink: "group-hover/card:border-pink-400/28 group-hover/card:bg-pink-500/[0.08] dark:group-hover/card:border-pink-400/32 dark:group-hover/card:bg-pink-400/14",
    emerald: "group-hover/card:border-emerald-400/28 group-hover/card:bg-emerald-500/[0.08] dark:group-hover/card:border-emerald-400/32 dark:group-hover/card:bg-emerald-400/14",
    violet: "group-hover/card:border-violet-400/28 group-hover/card:bg-violet-500/[0.08] dark:group-hover/card:border-violet-400/32 dark:group-hover/card:bg-violet-400/14",
    amber: "group-hover/card:border-amber-400/28 group-hover/card:bg-amber-500/[0.08] dark:group-hover/card:border-amber-400/32 dark:group-hover/card:bg-amber-400/14",
};

function LoaderIconBadge({
    icon: Icon,
    tone = "primary",
    className,
}: {
    icon: LucideIcon;
    tone?: LoaderBadgeTone;
    className?: string;
}) {
    return (
        <span className={cn(editorLoader.iconBadge, loaderBadgeToneClass[tone], className)}>
            <Icon className="size-[1.05rem] text-current" strokeWidth={2.15} />
        </span>
    );
}

function LoaderResourceButtonContent({
    icon: Icon,
    label,
    mobileLabel,
    tone = "primary",
    affordance,
}: {
    icon: LucideIcon;
    label: string;
    mobileLabel?: string;
    tone?: LoaderBadgeTone;
    affordance?: ReactNode;
}) {
    return (
        <span className="relative flex w-full items-center justify-center">
            <span className="inline-flex min-w-0 items-center justify-center gap-2.5 sm:gap-3">
                <Icon className={cn("size-[1.08rem] shrink-0 sm:size-[1.18rem]", loaderResourceIconToneClass[tone])} strokeWidth={2.2} />
                <span className="min-w-0 truncate text-[0.9rem] font-semibold tracking-[-0.02em] text-foreground sm:text-[0.98rem] sm:tracking-[-0.015em]">
                    <span className={cn(mobileLabel && "hidden sm:inline")}>{label}</span>
                    {mobileLabel && <span className="sm:hidden">{mobileLabel}</span>}
                </span>

                {affordance && (
                    <span className="flex size-4 items-center justify-center shrink-0">
                        {affordance}
                    </span>
                )}
            </span>
        </span>
    );
}

function LoaderCardIntro({
    icon,
    title,
    description,
    tone = "primary",
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    tone?: LoaderBadgeTone;
}) {
    return (
        <CardHeader className="gap-4 px-6 pt-5 pb-0 sm:px-6 sm:pt-6">
            <div className="flex items-start gap-3">
                <LoaderIconBadge
                    icon={icon}
                    tone={tone}
                    className={cn("size-10 shrink-0 shadow-none", loaderCardBadgeHoverToneClass[tone])}
                />
                <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg font-semibold tracking-tight text-foreground">{title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-foreground/68">{description}</CardDescription>
                </div>
            </div>
            <div className={editorLoader.cardDivider} />
        </CardHeader>
    );
}

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

    const templates: { label: string; url: string }[] = manifest?.templates?.length
        ? manifest.templates
              .filter(t => t.id.startsWith("ume-") && t.id !== "ume-catalogs" && t.url)
              .map(t => ({ label: t.name, url: t.url }))
        : [
              {
                  label: "UME Omni Template",
                  url: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/Older%20Versions/v1.7.1/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json",
              },
          ];

    const [selectedVersion, setSelectedVersion] = useState(templates[0].label);
    const [url, setUrl] = useState(templates[0].url);

    useEffect(() => {
        if (manifest?.templates?.length) {
            const umeTemplates = manifest.templates.filter(t => t.id.startsWith("ume-") && t.id !== "ume-catalogs" && t.url);
            if (umeTemplates.length > 0) {
                const latest = umeTemplates[0];
                setSelectedVersion(latest.name);
                setUrl(latest.url);
            }
        }
    }, [manifest]);

    useEffect(() => {
        const preventNavigationOnDrop = (event: DragEvent) => {
            if (!event.dataTransfer) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        };

        const targets = [window, document, document.documentElement, document.body];
        targets.forEach((target) => {
            target.addEventListener("dragenter", preventNavigationOnDrop as EventListener, true);
            target.addEventListener("dragover", preventNavigationOnDrop as EventListener, true);
            target.addEventListener("drop", preventNavigationOnDrop as EventListener, true);
        });

        return () => {
            targets.forEach((target) => {
                target.removeEventListener("dragenter", preventNavigationOnDrop as EventListener, true);
                target.removeEventListener("dragover", preventNavigationOnDrop as EventListener, true);
                target.removeEventListener("drop", preventNavigationOnDrop as EventListener, true);
            });
        };
    }, []);

    const [isFileDropActive, setIsFileDropActive] = useState(false);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const [activeGuide, setActiveGuide] = useState<"install" | "update" | "use">("use");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVersionChange = (version: string) => {
        setSelectedVersion(version);
        const template = templates.find((item) => item.label === version);
        if (template) setUrl(template.url);
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

    const isJsonFile = (file: File) => file.name.toLowerCase().endsWith(".json") || file.type === "application/json";

    const processFile = (file: File) => {
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            setError(`The file is too large. Maximum allowed size is ${MAX_UPLOAD_SIZE_MB}MB.`);
            return;
        }

        if (!isJsonFile(file)) {
            setError("Please upload a valid JSON file.");
            return;
        }

        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = repairMojibakeInConfig(JSON.parse(event.target?.result as string)) as OmniConfig;

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
        e.target.value = "";
    };

    const handleFileDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDropActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        processFile(file);
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

                hide_external_playback_prompt: false,
                hide_spoilers: false,
                small_continue_watching_shelf: false,
                oled_mode_enabled: true,
                hide_addon_info_in_catalog_names: true,
                hidden_stream_button_elements: ["Metadata Tags", "Addon Name"],

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
            catalogs: [],
        };
        skeleton.includedKeys = Object.keys(skeleton.values as JsonObject);
        loadConfig(skeleton, "clear-config.json");
    };

    const openGuide = (guide: "install" | "update" | "use") => {
        setActiveGuide(guide);
        setIsGuideDialogOpen(true);
    };

    const manifestTemplates = manifest?.templates?.filter((template) => template.url) || [];
    const manifestUmeTemplates = manifestTemplates.filter((template) => template.id.startsWith("ume-") && template.id !== "ume-catalogs");
    const latestUmeTemplate = manifestUmeTemplates.find((template) => template.isDefault || template.id === "ume-main") || manifestUmeTemplates[0];
    const catalogsOnlyTemplate = manifestTemplates.find((template) => template.id === "ume-catalogs");
    const nonLegacyTemplates = manifestTemplates.filter((template) => {
        if (latestUmeTemplate && template.id === latestUmeTemplate.id) return false;
        if (template.id.startsWith("ume-") && template.id !== "ume-catalogs") return false;
        if (template.id === "ume-catalogs") return false;
        return true;
    });
    const templateDownloads = latestUmeTemplate ? [latestUmeTemplate, ...nonLegacyTemplates] : [...nonLegacyTemplates];

    if (catalogsOnlyTemplate) {
        const aiometadataIndex = templateDownloads.findIndex((template) => template.id === "aiometadata");
        if (aiometadataIndex >= 0) {
            templateDownloads.splice(aiometadataIndex + 1, 0, catalogsOnlyTemplate);
        } else {
            templateDownloads.push(catalogsOnlyTemplate);
        }
    }

    const loaderThemeToggleClass =
        "size-11 rounded-[1.2rem] border border-slate-200/76 bg-white/66 p-0 text-foreground/72 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:border-slate-300/86 hover:bg-white/78 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/14 dark:hover:bg-white/[0.08] sm:size-12 [&_svg]:size-[1.1rem]";

    const loaderDropdownItemClass = cn(
        "group/item flex cursor-pointer items-center gap-3 rounded-[1rem] px-3 py-2.5 text-foreground",
        editorHover.transition
    );

    const loaderDropdownIconClass = "size-9 shrink-0";
    const loaderResourceAffordanceClass = "size-4 text-foreground/48 transition-[transform,color] duration-200 ease-out group-hover/resource:text-foreground/68";
    const loaderActionCardClass = cn(editorLoader.actionCard, "group/card flex h-full flex-col overflow-hidden");
    const loaderDocsButtonClass = editorLoader.resourceButtonSecondary;

    const baseCtaClass = cn(editorLoader.primaryCta, loading && "pointer-events-none opacity-70");
    const loaderEmeraldCtaClass = cn(
        baseCtaClass,
        "border-emerald-500/14 bg-[linear-gradient(180deg,rgba(16,185,129,0.86),rgba(5,150,105,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_rgba(16,185,129,0.08)]",
        "hover:border-emerald-500/20 hover:bg-[linear-gradient(180deg,rgba(20,184,166,0.88),rgba(13,148,136,0.94))] hover:shadow-[0_10px_22px_rgba(16,185,129,0.12)]",
        "dark:border-emerald-400/24 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.92),rgba(4,120,87,0.95))] dark:hover:border-emerald-400/30 dark:hover:bg-[linear-gradient(180deg,rgba(20,184,166,0.94),rgba(13,148,136,0.97))] dark:hover:shadow-[0_12px_24px_rgba(16,185,129,0.16)]"
    );
    const loaderPrimaryCtaClass = cn(
        baseCtaClass,
        "border-sky-600/14 bg-[linear-gradient(180deg,rgba(2,132,199,0.86),rgba(3,105,161,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_rgba(2,132,199,0.1)]",
        "hover:border-sky-600/20 hover:bg-[linear-gradient(180deg,rgba(14,165,233,0.88),rgba(2,132,199,0.94))] hover:shadow-[0_10px_22px_rgba(2,132,199,0.14)]",
        "dark:border-sky-500/24 dark:bg-[linear-gradient(180deg,rgba(2,132,199,0.92),rgba(3,105,161,0.95))] dark:hover:border-sky-500/30 dark:hover:bg-[linear-gradient(180deg,rgba(14,165,233,0.94),rgba(2,132,199,0.97))] dark:hover:shadow-[0_12px_24px_rgba(2,132,199,0.2)]"
    );
    const loaderVioletCtaClass = cn(
        baseCtaClass,
        "border-violet-500/14 bg-[linear-gradient(180deg,rgba(139,92,246,0.86),rgba(124,58,237,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_rgba(139,92,246,0.08)]",
        "hover:border-violet-500/20 hover:bg-[linear-gradient(180deg,rgba(168,85,247,0.88),rgba(147,51,234,0.94))] hover:shadow-[0_10px_22px_rgba(139,92,246,0.12)]",
        "dark:border-violet-400/24 dark:bg-[linear-gradient(180deg,rgba(139,92,246,0.92),rgba(109,40,217,0.95))] dark:hover:border-violet-400/30 dark:hover:bg-[linear-gradient(180deg,rgba(168,85,247,0.94),rgba(147,51,234,0.97))] dark:hover:shadow-[0_12px_24px_rgba(139,92,246,0.16)]"
    );

    const loaderFieldClass = cn(
        "h-11 rounded-[1rem] border-slate-300/84 bg-white/[0.82] text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:border-slate-400/88 hover:bg-white/[0.95] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,21,27,0.92),rgba(16,19,25,0.9))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:border-white/12 dark:hover:bg-input/52",
        "placeholder:text-foreground/38"
    );
    const loaderDropzoneClass = cn(
        editorLoader.dropzonePanel,
        "group/dropzone flex min-h-[206px] w-full cursor-pointer flex-col items-center justify-center px-5 py-6 text-center sm:min-h-[214px]",
        isFileDropActive
            ? "border-emerald-400/42 bg-emerald-500/[0.08] shadow-[0_16px_34px_rgba(16,185,129,0.14)] dark:border-emerald-400/34 dark:bg-emerald-400/[0.1]"
            : "hover:border-emerald-400/24 hover:bg-emerald-500/[0.04] hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)] dark:hover:border-emerald-400/28 dark:hover:bg-emerald-400/[0.07]"
    );

    return (
        <div className="min-h-app-screen relative overflow-x-hidden font-sans text-foreground selection:bg-primary/30">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-[-16%] top-[-14rem] h-[28rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.11),transparent_62%)]" />
                <div className="absolute inset-x-0 top-0 h-[16rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0)_86%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0)_86%)]" />
                <div className="absolute left-1/2 top-16 h-[16rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/4 blur-[120px] dark:bg-primary/8" />
            </div>

            <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
                {activeGuide === "install" && <TemplateGuide />}
                {activeGuide === "update" && <UpdateGuide />}
                {activeGuide === "use" && <Documentation onOpenInstallGuide={() => setActiveGuide("install")} />}
            </Dialog>

            <div
                className="absolute z-50"
                style={{
                    top: "max(0.75rem, env(safe-area-inset-top))",
                    right: "max(0.75rem, env(safe-area-inset-right))",
                }}
            >
                <ThemeToggle buttonClassName={loaderThemeToggleClass} />
            </div>

            <div className="relative z-10 flex min-h-app-screen w-full items-start justify-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-5 sm:items-center xl:px-6">
                <div className="relative z-10 mx-auto w-full max-w-[88rem] py-3 sm:py-4 lg:py-5 xl:max-w-[92rem]">
                    <div className={cn(editorLoader.heroPanel, "relative px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8") }>
                        <div className="relative space-y-4 sm:space-y-5 lg:space-y-6">
                            <div className="mx-auto max-w-[46rem] text-center">
                                <div className="mx-auto flex h-[5.25rem] w-[5.25rem] items-center justify-center sm:h-[7rem] sm:w-[7rem]">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- Static local logo; preserving existing rendering behavior. */}
                                    <img src="/omni-snapshot-editor/clown.png" alt="Logo" className="h-full w-full object-contain" />
                                </div>

                                <div className="mt-3.5 space-y-1.5 sm:mt-4.5 sm:space-y-2.5">
                                    <h1 className="text-[2rem] font-black tracking-tight text-foreground sm:text-[2.62rem] xl:text-[2.88rem]">
                                        Omni Snapshot Manager
                                    </h1>
                                    <p className="mx-auto max-w-[42rem] text-sm leading-6 text-foreground/70 sm:text-[0.98rem] sm:leading-7">
                                        Import an Omni snapshot from GitHub or your local disk, or start a new setup from scratch.
                                    </p>
                                </div>

                                <div className="mx-auto mt-5 flex w-full max-w-[33.5rem] flex-col gap-3 sm:mt-5.5">
                                    <div className="w-full">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="outline" className={cn(editorLoader.resourceButtonPrimary, "group/resource w-full")}>
                                                    <LoaderResourceButtonContent
                                                        icon={FileDown}
                                                        label="Download UME Templates"
                                                        mobileLabel="UME Templates"
                                                        affordance={<ChevronDown className={cn(loaderResourceAffordanceClass, "group-hover/resource:translate-y-px")} strokeWidth={2.2} />}
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="center"
                                                sideOffset={8}
                                                className={cn(editorSurface.overlay, "w-[min(20rem,calc(100vw-0.75rem))] rounded-[1.4rem] p-1.5")}
                                            >
                                                <DropdownMenuLabel className={cn(editorLoader.subtleMeta, "px-3 pt-1 pb-1 text-foreground/38")}>UME Templates</DropdownMenuLabel>
                                                {templateDownloads.length === 0 ? (
                                                    <div className="px-3 py-6 text-center">
                                                        <p className="text-sm italic text-foreground/45">No templates found.</p>
                                                    </div>
                                                ) : (
                                                    templateDownloads.map((template) => {
                                                        const display = getTemplateDisplay(template.name, template.id);

                                                        return (
                                                            <DropdownMenuItem
                                                                key={template.id}
                                                                onSelect={() => {
                                                                    handleDownloadTemplate(template.url, template.name);
                                                                }}
                                                                className={loaderDropdownItemClass}
                                                            >
                                                                <LoaderIconBadge icon={FileJson} className={loaderDropdownIconClass} />
                                                                <div className="min-w-0 flex-1">
                                                                    <span className="block truncate text-sm font-semibold text-foreground">{display.label}</span>
                                                                    {display.version ? (
                                                                        <span className="mt-0.5 block text-[10px] font-medium tracking-[0.04em] text-foreground/42">{display.version}</span>
                                                                    ) : null}
                                                                </div>
                                                                <LoaderIconBadge icon={FileDown} tone="neutral" className="size-8 shrink-0" />
                                                            </DropdownMenuItem>
                                                        );
                                                    })
                                                )}

                                                <DropdownMenuSeparator className="mx-2 my-1 bg-border/60 dark:bg-white/8" />

                                                <DropdownMenuLabel className={cn(editorLoader.subtleMeta, "px-3 py-1 text-foreground/38")}>Guide</DropdownMenuLabel>
                                                <div className="px-0.5">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={loaderDropdownItemClass}>
                                                                <LoaderIconBadge icon={UploadCloud} className={loaderDropdownIconClass} />
                                                                <span className="text-sm font-semibold text-foreground">How to Install</span>
                                                                <ChevronRight className="ml-auto size-4 text-foreground/32 transition-colors duration-200 ease-out group-hover/item:text-foreground/62" />
                                                            </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <TemplateGuide />
                                                    </Dialog>
                                                </div>

                                                <DropdownMenuSeparator className="mx-2 my-1 bg-border/60 dark:bg-white/8" />

                                                <DropdownMenuLabel className={cn(editorLoader.subtleMeta, "px-3 py-1 text-foreground/38")}>GitHub</DropdownMenuLabel>
                                                <div className="space-y-0.5 px-0.5">
                                                    <DropdownMenuItem asChild className={cn(loaderDropdownItemClass, "text-foreground/82")}>
                                                        <a href="https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser" target="_blank" rel="noopener noreferrer">
                                                            <LoaderIconBadge icon={Github} tone="neutral" className={loaderDropdownIconClass} />
                                                            <span className="text-sm font-semibold text-foreground/82">UME Templates</span>
                                                            <ExternalLink className="ml-auto size-4 text-foreground/30 transition-colors duration-200 ease-out group-hover/item:text-foreground/58" />
                                                        </a>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild className={cn(loaderDropdownItemClass, "text-foreground/82")}>
                                                        <a href="https://github.com/nobnobz/omni-snapshot-editor" target="_blank" rel="noopener noreferrer">
                                                            <LoaderIconBadge icon={Github} tone="neutral" className={loaderDropdownIconClass} />
                                                            <span className="text-sm font-semibold text-foreground/82">Omni Snapshot Manager</span>
                                                            <ExternalLink className="ml-auto size-4 text-foreground/30 transition-colors duration-200 ease-out group-hover/item:text-foreground/58" />
                                                        </a>
                                                    </DropdownMenuItem>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mx-auto grid w-full max-w-[33.5rem] grid-cols-2 gap-2.5 sm:gap-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="outline" className={cn(loaderDocsButtonClass, "group/resource w-full")}>
                                                    <LoaderResourceButtonContent
                                                        icon={BookOpen}
                                                        label="Documentation"
                                                        mobileLabel="Docs"
                                                        tone="amber"
                                                        affordance={<ChevronDown className={cn(loaderResourceAffordanceClass, "group-hover/resource:translate-y-px")} strokeWidth={2.2} />}
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="center"
                                                sideOffset={8}
                                                className={cn(editorSurface.overlay, "w-[min(18rem,calc(100vw-0.75rem))] rounded-[1.25rem] p-2")}
                                            >
                                                <DropdownMenuLabel className={cn(editorLoader.subtleMeta, "px-3 pt-1.5 pb-1 text-foreground/38")}>
                                                    Guides
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => openGuide("install")} className={loaderDropdownItemClass}>
                                                    <LoaderIconBadge icon={UploadCloud} tone="amber" className={loaderDropdownIconClass} />
                                                    <span className="text-sm font-semibold">How to Install</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => openGuide("update")} className={loaderDropdownItemClass}>
                                                    <LoaderIconBadge icon={RefreshCcw} tone="amber" className={loaderDropdownIconClass} />
                                                    <span className="text-sm font-semibold">How to Update</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => openGuide("use")} className={loaderDropdownItemClass}>
                                                    <LoaderIconBadge icon={BookOpen} tone="amber" className={loaderDropdownIconClass} />
                                                    <span className="text-sm font-semibold">How to Use</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button asChild type="button" variant="outline" className={cn(editorLoader.resourceButtonUtility, "group/resource w-full") }>
                                            <a href="https://ko-fi.com/botbidraiser" target="_blank" rel="noopener noreferrer">
                                                <LoaderResourceButtonContent
                                                    icon={Heart}
                                                    label="Support My Work"
                                                    mobileLabel="Support"
                                                    tone="pink"
                                                />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <div className={cn("rounded-[1.2rem] border px-4 py-4 text-sm shadow-[0_14px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-5", editorNoticeTone.danger)}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 size-5 shrink-0" />
                                        <span className="leading-relaxed">{error}</span>
                                    </div>
                                </div>
                            ) : null}

                            <div className="mx-auto w-full max-w-[72rem] pt-3 sm:pt-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                                    <Card className={loaderActionCardClass}>
                                        <div className="h-[3px] w-full bg-[linear-gradient(90deg,rgba(20,184,166,0.82),rgba(52,211,153,0.78),rgba(34,197,94,0.72))]" />
                                        <LoaderCardIntro
                                            icon={Upload}
                                            title="Custom Import"
                                            description="Upload an Omni JSON file from your local machine."
                                            tone="emerald"
                                        />
                                        <CardContent className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-6 sm:pb-6">
                                            <div className={cn(editorLoader.bodyPanel, "flex flex-1 flex-col justify-center") }>
                                                <Label
                                                    htmlFor="file-upload"
                                                    onDragEnter={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsFileDropActive(true);
                                                    }}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setIsFileDropActive(true);
                                                        e.dataTransfer.dropEffect = "copy";
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                                                        setIsFileDropActive(false);
                                                    }}
                                                    onDrop={handleFileDrop}
                                                    className={loaderDropzoneClass}
                                                >
                                                    <div className="pointer-events-none flex max-w-[16rem] flex-col items-center gap-3">
                                                        <LoaderIconBadge
                                                            icon={FileJson}
                                                            tone="emerald"
                                                            className="size-11 shadow-none group-hover/dropzone:border-emerald-400/28 group-hover/dropzone:bg-emerald-500/10"
                                                        />
                                                        <p className="text-sm font-semibold text-foreground">Drop .json file here</p>
                                                    </div>
                                                    <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileUpload} disabled={loading} />
                                                </Label>
                                            </div>

                                             <label htmlFor="file-upload" className={cn(loaderEmeraldCtaClass, "w-full cursor-pointer") }>
                                                {loading ? "Loading..." : "Select Local File"}
                                            </label>
                                        </CardContent>
                                    </Card>

                                    <Card className={loaderActionCardClass}>
                                        <div className="h-[3px] w-full bg-[linear-gradient(90deg,rgba(96,165,250,0.82),rgba(99,102,241,0.8),rgba(129,140,248,0.74))]" />
                                        <LoaderCardIntro
                                            icon={Github}
                                            title="From GitHub"
                                            description="Load a template from a raw URL or use the Unified Media Experience template."
                                            tone="primary"
                                        />
                                        <CardContent className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-6 sm:pb-6">
                                            <div className={cn(editorLoader.bodyPanel, "flex flex-1 flex-col justify-center gap-4") }>
                                                <div className="space-y-2.5">
                                                    <Label className={cn(editorLoader.subtleMeta, "text-foreground/48")}>Template</Label>
                                                    <Select value={selectedVersion} onValueChange={handleVersionChange}>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full font-medium focus:border-ring/50",
                                                                loaderFieldClass
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Select version" />
                                                        </SelectTrigger>
                                                        <SelectContent className={cn(editorSurface.overlay, "border-border/80 text-popover-foreground")}>
                                                            {templates.map((template) => (
                                                                <SelectItem key={template.label} value={template.label} className="text-sm font-mono focus:bg-accent focus:text-accent-foreground">
                                                                    {template.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-px flex-1 bg-border/70 dark:bg-white/10" />
                                                    <span className={cn(editorLoader.subtleMeta, "text-foreground/38")}>or enter url</span>
                                                    <div className="h-px flex-1 bg-border/70 dark:bg-white/10" />
                                                </div>

                                                <div className="space-y-2.5">
                                                    <Label htmlFor="url" className={cn(editorLoader.subtleMeta, "text-foreground/48")}>Raw URL</Label>
                                                    <Input
                                                        id="url"
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        placeholder="https://raw.githubusercontent.com/..."
                                                        className={cn(
                                                            loaderFieldClass,
                                                            "focus:border-ring/50"
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <Button onClick={fetchFromGitHub} disabled={loading} className={cn(loaderPrimaryCtaClass, "w-full") }>
                                                {loading ? "Loading..." : "Load from GitHub"}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(loaderActionCardClass, "md:col-span-2 lg:col-span-1") }>
                                        <div className="h-[3px] w-full bg-[linear-gradient(90deg,rgba(168,85,247,0.8),rgba(217,70,239,0.78),rgba(236,72,153,0.72))]" />
                                        <LoaderCardIntro
                                            icon={Sparkles}
                                            title="Start Fresh"
                                            description="Create an empty configuration skeleton with the core Omni structure."
                                            tone="violet"
                                        />
                                        <CardContent className="flex flex-1 flex-col gap-4 px-6 pb-6 sm:px-6 sm:pb-6">
                                            <div className={cn(editorLoader.bodyPanel, "relative flex flex-1 flex-col items-center justify-center overflow-hidden py-8 text-center") }>
                                                <div className="pointer-events-none absolute inset-x-10 top-7 h-20 rounded-full bg-violet-500/[0.05] blur-3xl dark:bg-violet-400/[0.08]" />
                                                <div className="relative flex max-w-[15rem] flex-col items-center gap-4">
                                                    <LoaderIconBadge
                                                        icon={Sparkles}
                                                        tone="violet"
                                                        className="size-12 shrink-0 shadow-none group-hover/card:border-violet-400/28 group-hover/card:bg-violet-500/10"
                                                    />
                                                    <p className="text-sm font-medium leading-6 text-foreground/66">
                                                        Clean base file, ready to edit.
                                                    </p>
                                                </div>
                                            </div>

                                             <Button onClick={handleCreateBlank} disabled={loading} className={cn(loaderVioletCtaClass, "w-full") }>
                                                {loading ? "Loading..." : "Create Clean File"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="pt-1 text-center">
                                <p className={cn(editorLoader.subtleMeta, "text-foreground/34") }>
                                    <span className="block">v{APP_VERSION} • By Bot-Bid-Raiser</span>
                                    <span className="mt-1 block">Built with Antigravity</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

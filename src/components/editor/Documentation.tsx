"use client";

import React from "react";
import {
    AlertCircle,
    BookOpen,
    ChevronRight,
    Database,
    Download,
    ExternalLink,
    FileJson,
    Hash,
    HelpCircle,
    Image as ImageIcon,
    Layers,
    Laptop,
    Layout,
    LayoutGrid,
    Maximize,
    Monitor,
    MousePointer2,
    Palette,
    PlusCircle,
    RefreshCcw,
    ShieldCheck,
    Smartphone,
    Star,
    Upload,
    UploadCloud,
    WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/context/ConfigContext";
import { AIOSTREAMS_FORMATTER_DOWNLOAD_URL, downloadTemplateFile, shouldOfferTemplateUrlChoice } from "@/lib/template-download";
import { getTemplateDisplay } from "@/lib/template-display";
import { FALLBACK_TEMPLATE_URLS, findTemplateByKind } from "@/lib/template-manifest";
import { editorHover } from "@/components/editor/ui/style-contract";
import { GuideHeader } from "@/components/editor/GuideHeader";
import {
    GuideBody,
    GuideDialog,
    GuidePanel,
    GuideSection,
    GuideStepList,
} from "@/components/editor/GuidePrimitives";
import { TemplateDownloadChoiceDialog } from "@/components/editor/TemplateDownloadChoiceDialog";

type DocumentationProps = {
    headerAction?: React.ReactNode;
    onOpenInstallGuide?: () => void;
};

type FeatureCard = {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

export function Documentation({ headerAction, onOpenInstallGuide }: DocumentationProps = {}) {
    const { manifest } = useConfig();
    const [downloadChoiceTemplate, setDownloadChoiceTemplate] = React.useState<{ name: string; url: string; version?: string | null } | null>(null);

    const omniTemplate = findTemplateByKind(manifest?.templates, "omni");
    const aiomTemplate = findTemplateByKind(manifest?.templates, "aiometadata");
    const aiosTemplate = findTemplateByKind(manifest?.templates, "aiostreams");

    const templates = [
        {
            name: "Omni Snapshot",
            id: "ume-main",
            manifestName: omniTemplate?.name || "UME Omni Template",
            url: omniTemplate?.url || FALLBACK_TEMPLATE_URLS.omni,
            version: omniTemplate?.version,
        },
        {
            name: "AIOMetadata",
            id: "aiometadata",
            manifestName: aiomTemplate?.name || "UME AIOMetadata Template",
            url: aiomTemplate?.url || "",
            version: aiomTemplate?.version,
        },
        {
            name: "AIOStreams",
            id: "aiostreams",
            manifestName: aiosTemplate?.name || "UME AIOStreams Template",
            url: aiosTemplate?.url || "",
            version: aiosTemplate?.version,
        },
        {
            name: "AIOStreams Formatter v3.0",
            id: "aiostreams-formatter",
            manifestName: "UME AIOStreams Formatter v3.0",
            url: AIOSTREAMS_FORMATTER_DOWNLOAD_URL,
            version: "v3.0",
        },
    ];

    const startOptions: FeatureCard[] = [
        {
            title: "Custom Import",
            description:
                "Upload your existing .json configuration to continue your own setup or edit a template copy.",
            icon: Upload,
        },
        {
            title: "From GitHub",
            description:
                "Load a raw .json URL directly for public templates and team-shared setups.",
            icon: ExternalLink,
        },
        {
            title: "Start Fresh",
            description:
                "Begin from an empty config when building a structure from scratch.",
            icon: PlusCircle,
        },
    ];

    const groupActions: FeatureCard[] = [
        {
            title: "Create New Group",
            description: "Add a new main group and assign existing subgroups immediately.",
            icon: PlusCircle,
        },
        {
            title: "Add to Group",
            description: "Move unassigned subgroups into any existing main group.",
            icon: LayoutGrid,
        },
        {
            title: "Update from Template",
            description:
                "Sync groups from another setup with clearer matching and cleaner review.",
            icon: RefreshCcw,
        },
    ];

    const catalogFeatures: FeatureCard[] = [
        {
            title: "Shelf Visibility",
            description: "Control which catalogs appear in the home shelf section.",
            icon: Layout,
        },
        {
            title: "Top Row",
            description:
                "Pin selected catalogs to a ranked top row, even when shelf visibility is off.",
            icon: Hash,
        },
        {
            title: "Header Feature",
            description: "Promote catalogs to a larger featured presentation at the top.",
            icon: Maximize,
        },
        {
            title: "Randomize",
            description: "Shuffle catalog items each load for dynamic recommendations.",
            icon: RefreshCcw,
        },
        {
            title: "Small Layout",
            description: "Use a compact poster layout for denser catalog sections.",
            icon: LayoutGrid,
        },
    ];

    const patternCapabilities: FeatureCard[] = [
        {
            title: "Edit Existing Patterns",
            description: "Tune matching logic and output labels in-place.",
            icon: RefreshCcw,
        },
        {
            title: "Create New Patterns",
            description: "Add new regex-driven grouping and tagging rules.",
            icon: PlusCircle,
        },
        {
            title: "Styling Controls",
            description: "Adjust tag colors, contrast and visual behavior.",
            icon: Palette,
        },
        {
            title: "Custom Images",
            description: "Attach artwork per pattern where supported.",
            icon: ImageIcon,
        },
        {
            title: "Import / Export",
            description: "Share pattern packs between environments.",
            icon: Upload,
        },
    ];

    const handleDownload = async (template: typeof templates[number]) => {
        if (shouldOfferTemplateUrlChoice(template.id, template.manifestName)) {
            setDownloadChoiceTemplate({ name: template.manifestName, url: template.url, version: template.version });
            return;
        }

        try {
            await downloadTemplateFile(template.url, template.manifestName, template.version);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const guideActionButtonClass = `${editorHover.transition} ${editorHover.premiumCard} group h-auto min-h-11 w-full justify-between gap-3 rounded-2xl border border-primary/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(241,245,255,0.46))] px-4 py-3 text-left shadow-[0_4px_10px_rgba(148,163,184,0.07)] hover:border-primary/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(232,238,255,0.5))] dark:border-primary/16 dark:bg-[linear-gradient(180deg,rgba(17,22,34,0.82),rgba(13,18,29,0.78))] dark:shadow-[0_6px_14px_rgba(2,6,23,0.18)] dark:hover:border-primary/24 dark:hover:bg-[linear-gradient(180deg,rgba(20,26,40,0.86),rgba(15,21,34,0.82))]`;

    return (
        <GuideDialog>
            <GuideHeader
                badge="How to Use"
                title="Omni Snapshot Manager"
                icon={BookOpen}
                action={headerAction}
                tone="indigo"
            />

            <GuideBody>
                <GuideSection
                    eyebrow="Prerequisite"
                    title="Install AIOMetadata first"
                    icon={ShieldCheck}
                    tone="amber"
                >
                    <p className="text-sm leading-relaxed text-foreground/78">
                        Install the <strong>AIOMetadata Addon</strong> on Omni first before using the snapshot manager.{" "}
                        {onOpenInstallGuide ? (
                            <button
                                type="button"
                                onClick={onOpenInstallGuide}
                                className="inline-flex items-center gap-1 font-semibold text-primary transition-colors duration-200 ease-out hover:text-primary/85 dark:text-primary"
                            >
                                Open How to Install guide
                            </button>
                        ) : null}
                    </p>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 1"
                    title="Start Page Options"
                    description="There are three entry paths depending on whether you start from scratch or reuse an existing config."
                    icon={MousePointer2}
                    tone="indigo"
                >
                    <div className="grid gap-4 md:auto-rows-fr md:grid-cols-3">
                        {startOptions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <GuidePanel key={item.title} title={item.title} icon={Icon} description={item.description} tone="indigo" />
                            );
                        })}
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 2"
                    title="AIOMetadata Integration"
                    description="Import your personal AIOMetadata setup if you want to sync your catalogs."
                    icon={Database}
                    tone="indigo"
                >
                    <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-2">
                        <GuidePanel
                            title="Why this is needed"
                            icon={AlertCircle}
                            description="Omni stores many AIOMetadata catalogs by ID only. Fallback names keep your editor readable, but for personal catalog naming you should import your own mappings."
                            tone="indigo"
                        />

                        <GuidePanel title="Import your AIOMetadata setup" icon={HelpCircle} tone="indigo">
                            <GuideStepList
                                items={[
                                    "Recommended way to import your setup is by pasting your AIOMetadata manifest URL.",
                                    "This will sync all your catalogs automatically.",
                                ]}
                                tone="indigo"
                                className="mt-1"
                            />
                        </GuidePanel>
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 3"
                    title="Groups Manager"
                    description="Manage main groups and subgroups while preserving visual structure."
                    icon={Layers}
                    tone="indigo"
                >
                    <div className="grid gap-4 md:auto-rows-fr md:grid-cols-3">
                        {groupActions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <GuidePanel key={item.title} title={item.title} icon={Icon} description={item.description} tone="indigo" />
                            );
                        })}
                    </div>

                    <GuidePanel title="Customization controls" icon={Palette} tone="indigo" className="mt-4">
                        <GuideStepList
                            items={[
                                "Switch poster style per main group (Poster, Square, Landscape).",
                                "Set subgroup image backgrounds.",
                                "Manage catalog-to-subgroup links and reorder with drag and drop.",
                            ]}
                            ordered={false}
                            tone="indigo"
                            className="mt-1"
                        />
                    </GuidePanel>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 4"
                    title="Catalogs Manager"
                    description="Control visibility, presentation and ranking of each catalog block."
                    icon={Star}
                    tone="indigo"
                >
                    <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
                        {catalogFeatures.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <GuidePanel key={feature.title} title={feature.title} icon={Icon} description={feature.description} tone="indigo" />
                            );
                        })}
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 5"
                    title="Patterns & Regex Tags"
                    description="Use patterns to control matching behavior, labels, and visual tagging."
                    icon={WandSparkles}
                    tone="indigo"
                >
                    <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
                        {patternCapabilities.map((item) => {
                            const Icon = item.icon;
                            return (
                                <GuidePanel
                                    key={item.title}
                                    title={item.title}
                                    icon={Icon}
                                    description={item.description}
                                    tone="indigo"
                                />
                            );
                        })}
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 6"
                    title="Finalizing & Export"
                    description="Use the built-in export paths once your structure and patterns are ready."
                    icon={Download}
                    tone="indigo"
                >
                    <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2">
                        <GuidePanel
                            title="Full Export"
                            description="Download the complete configuration as one JSON file."
                            tone="indigo"
                        />
                        <GuidePanel
                            title="Partial Export"
                            description="Export only selected modules like groups or patterns for safe merge workflows."
                            tone="indigo"
                        />
                    </div>

                    <GuidePanel title="Export behavior" icon={HelpCircle} tone="indigo" className="mt-4">
                        <GuideStepList
                            items={["Exports run automatic cleanup and structure validation to reduce manual fixing."]}
                            ordered={false}
                            tone="indigo"
                            className="mt-1"
                        />
                    </GuidePanel>
                </GuideSection>

                <GuideSection
                    eyebrow="Section 7"
                    title="Install & Device Sync"
                    description="Download the core templates, then import on iOS and sync to Apple TV."
                    icon={UploadCloud}
                    tone="indigo"
                >
                    <div className="flex flex-wrap gap-2.5">
                        {templates.map((item) => {
                            const isAvailable = !!item.url;
                            const display = getTemplateDisplay(item.manifestName, item.id);
                            const version = "version" in item ? item.version || display.version : display.version;

                            return (
                                <Button
                                    key={item.id}
                                    onClick={() => {
                                        if (!isAvailable) return;
                                        handleDownload(item);
                                    }}
                                    variant="outline"
                                    disabled={!isAvailable}
                                    className={guideActionButtonClass}
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/16 bg-primary/6 dark:border-primary/18 dark:bg-primary/7">
                                            <FileJson className="h-4 w-4 text-primary/90" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-bold tracking-tight text-foreground">{display.label}</span>
                                            {version && (
                                                <span className="mt-0.5 block text-[10px] leading-tight text-foreground/46 font-medium tracking-[0.04em]">
                                                    {version}
                                                </span>
                                            )}
                                            {!isAvailable && (
                                                <span className="mt-0.5 block text-[10px] leading-tight text-foreground/40 font-medium tracking-[0.04em] italic">
                                                    Currently unavailable
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground/36 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:group-hover:text-primary" />
                                </Button>
                            );
                        })}
                    </div>

                    <div className="mt-4 grid gap-4 lg:auto-rows-fr lg:grid-cols-2">
                        <GuidePanel title="iOS Installation" icon={Smartphone} tone="indigo">
                            <p className="text-sm text-foreground/72">Copy your JSON backup into:</p>
                            <div className="mt-2 rounded-xl border border-primary/20 bg-primary/8 px-3.5 py-3 font-mono text-xs text-primary dark:text-primary">
                                Files &gt; On my iPhone &gt; Omni &gt; Backups
                            </div>
                            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-foreground/78">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                If the backup does not appear, force close Omni and reopen.
                            </p>
                        </GuidePanel>

                        <GuidePanel title="macOS Installation" icon={Laptop} tone="indigo">
                            <p className="text-sm leading-relaxed text-foreground/72">
                                In Finder, press Shift+Command+G and open Omni&apos;s local backup folder. Drop the downloaded snapshot JSON into Backups, then reopen Omni if needed.
                            </p>
                            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/8 px-3.5 py-3 font-mono text-xs text-primary dark:text-primary">
                                ~/Library/Containers/Omni/Data/Documents/Backups
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-foreground/78">
                                Fallback path: <span className="font-mono text-[11px] text-foreground/74">/Users/USERNAME/Library/Containers/win.stkc.omni/Data/Documents/Backups</span>
                            </p>
                        </GuidePanel>

                        <GuidePanel title="Apple TV Sync" icon={Monitor} tone="indigo">
                            <p className="text-sm leading-relaxed text-foreground/72">
                                Import on iOS first, enable iCloud Sync in Omni settings, then pull on Apple TV.
                            </p>
                        </GuidePanel>
                    </div>
                </GuideSection>
            </GuideBody>

            <TemplateDownloadChoiceDialog
                open={!!downloadChoiceTemplate}
                onOpenChange={(open) => {
                    if (!open) {
                        setDownloadChoiceTemplate(null);
                    }
                }}
                templateName={downloadChoiceTemplate?.name || ""}
                templateUrl={downloadChoiceTemplate?.url || ""}
                templateVersion={downloadChoiceTemplate?.version}
            />
        </GuideDialog>
    );
}

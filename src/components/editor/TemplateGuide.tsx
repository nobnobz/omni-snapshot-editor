"use client";

import React from "react";
import {
    ChevronRight,
    Cloud,
    Download,
    FileJson,
    Info,
    Laptop,
    Link2,
    MousePointer2,
    Search,
    Settings,
    ShieldCheck,
    Smartphone,
    UploadCloud,
    Zap,
} from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import { cn } from "@/lib/utils";
import { downloadTemplateFile, shouldOfferTemplateUrlChoice } from "@/lib/template-download";
import { FALLBACK_TEMPLATE_URLS, findTemplateByKind } from "@/lib/template-manifest";
import { editorHover } from "@/components/editor/ui/style-contract";
import { GuideHeader } from "@/components/editor/GuideHeader";
import { TemplateDownloadChoiceDialog } from "@/components/editor/TemplateDownloadChoiceDialog";
import {
    GuideBody,
    GuideDialog,
    GuideFlow,
    GuidePanel,
    GuideSection,
    GuideStepList,
} from "@/components/editor/GuidePrimitives";

type TemplateGuideProps = {
    headerAction?: React.ReactNode;
};

type TemplateAsset = {
    name: string;
    id: string;
    url: string;
    version?: string;
};

type InstanceGroup = {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    links: { text: string; url: string; tone: string }[];
};

type SetupTrack = {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    steps: string[];
    finalStep: string;
};

type DeviceGuide = {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    details: {
        label: string;
        value: string;
    }[];
    tone: "blue";
};

export function TemplateGuide({ headerAction }: TemplateGuideProps = {}) {
    const { manifest } = useConfig();
    const [downloadChoiceTemplate, setDownloadChoiceTemplate] = React.useState<TemplateAsset | null>(null);

    const omniTemplate = manifest?.templates?.find((template) => template.isDefault) || findTemplateByKind(manifest?.templates, "omni");
    const aiomTemplate = findTemplateByKind(manifest?.templates, "aiometadata");
    const catalogsTemplate = findTemplateByKind(manifest?.templates, "catalogs");
    const aiosTemplate = findTemplateByKind(manifest?.templates, "aiostreams");

    const coreTemplates: TemplateAsset[] = [
        {
            name: "UME Omni Template",
            id: omniTemplate?.id || "ume-omni-main",
            url: omniTemplate?.url || FALLBACK_TEMPLATE_URLS.omni,
            version: omniTemplate?.version,
        },
        {
            name: "UME AIOMetadata Template",
            id: aiomTemplate?.id || "ume-aiometadata-main",
            url: aiomTemplate?.url || "",
            version: aiomTemplate?.version,
        },
        {
            name: "UME AIOMetadata (Catalogs Only)",
            id: catalogsTemplate?.id || "ume-catalogs-main",
            url: catalogsTemplate?.url || "",
            version: catalogsTemplate?.version,
        },
        {
            name: "UME AIOStreams Template",
            id: aiosTemplate?.id || "ume-aiostreams-main",
            url: aiosTemplate?.url || "",
            version: aiosTemplate?.version,
        },
    ];

    const instanceGroups: InstanceGroup[] = [
        {
            name: "AIOStreams",
            icon: Zap,
            description: "Use the stable instance by default. Nightly is useful only when you need new fixes or features immediately.",
            links: [
                {
                    text: "Stable Instance",
                    url: "https://aiostreamsfortheweebsstable.midnightignite.me/stremio/configure",
                    tone: "text-emerald-600 dark:text-emerald-300",
                },
                {
                    text: "Nightly Instance",
                    url: "https://aiostreams-nightly.fortheweak.cloud/stremio/configure",
                    tone: "text-amber-600 dark:text-amber-300",
                },
            ],
        },
        {
            name: "AIOMetadata",
            icon: Search,
            description: "The stable build is the safer default. Nightly Instance is only recommended if you accept occasional bugs.",
            links: [
                {
                    text: "Stable Instance",
                    url: "https://aiometadatafortheweebs.midnightignite.me/configure/",
                    tone: "text-emerald-600 dark:text-emerald-300",
                },
                {
                    text: "Nightly Instance",
                    url: "https://aiometadata.fortheweak.cloud/configure/",
                    tone: "text-amber-600 dark:text-amber-300",
                },
            ],
        },
    ];

    const setupTracks: SetupTrack[] = [
        {
            title: "Configure AIOStreams",
            icon: Zap,
            steps: [
                "Open AIOStreams, go to Save & Install, and select Import.",
                "Paste the template URL or upload the AIOStreams .json file.",
                "Fill in your required API keys and provider credentials.",
                "Create the config, set a password, and keep UUID + password saved.",
            ],
            finalStep: "Add the generated AIOStreams manifest URL in Omni under Addons.",
        },
        {
            title: "Configure AIOMetadata",
            icon: Search,
            steps: [
                "Open the AIOMetadata instance and import the matching template.",
                "Add your API keys and MDBList key.",
                "Create the config, set a password, and keep UUID + password saved.",
            ],
            finalStep: "Add the generated AIOMetadata manifest URL in Omni under Addons.",
        },
    ];

    const deviceGuides: DeviceGuide[] = [
        {
            title: "Import on iPhone / iPad",
            icon: Smartphone,
            description: "Move the downloaded Omni snapshot JSON file into Omni’s local backup folder. If it doesn’t appear right away, restart Omni. Then select the imported snapshot and restore it.",
            details: [
                {
                    label: "Path",
                    value: "Files > On My iPhone > Omni > Backups",
                },
            ],
            tone: "blue",
        },
        {
            title: "Import on macOS",
            icon: Laptop,
            description: "Open Finder, press Shift+Command+G, and paste the Omni backup folder path below. Move the downloaded snapshot JSON into Backups, then restart Omni if it does not appear immediately.",
            details: [
                {
                    label: "Go to Folder",
                    value: "~/Library/Containers/Omni/Data/Documents/Backups",
                },
                {
                    label: "Fallback path",
                    value: "/Users/USERNAME/Library/Containers/win.stkc.omni/Data/Documents/Backups",
                },
            ],
            tone: "blue",
        },
        {
            title: "Sync to Apple TV",
            icon: Cloud,
            description: "Import the backup on iOS first, enable iCloud Sync in Omni settings, then pull the synced setup on Apple TV.",
            details: [
                {
                    label: "Note",
                    value: "iCloud Sync must be enabled on the same Apple account.",
                },
            ],
            tone: "blue",
        },
    ];

    const handleDownload = async (template: TemplateAsset) => {
        const templateName = template.version ? `${template.name} ${template.version}` : template.name;
        if (shouldOfferTemplateUrlChoice(template.id, templateName)) {
            setDownloadChoiceTemplate({
                ...template,
                name: templateName,
            });
            return;
        }

        try {
            await downloadTemplateFile(template.url, templateName);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const guideActionButtonClass = cn(
        "group flex items-center justify-between gap-3 rounded-2xl border border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(239,246,255,0.46))] px-4 py-3 shadow-[0_6px_14px_rgba(148,163,184,0.08)] hover:border-primary/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(224,242,254,0.56))] dark:border-primary/28 dark:bg-[linear-gradient(180deg,rgba(14,33,52,0.9),rgba(8,22,38,0.86))] dark:shadow-[0_10px_20px_rgba(2,6,23,0.24)] dark:hover:border-primary/42 dark:hover:bg-[linear-gradient(180deg,rgba(18,41,66,0.94),rgba(10,28,48,0.9))]",
        editorHover.transition,
        editorHover.premiumCard
    );
    const guideActionIconShellClass =
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/18 bg-primary/8 dark:border-primary/20 dark:bg-primary/8";

    return (
        <GuideDialog>
            <GuideHeader
                badge="Setup and Import"
                title="How to Install"
                icon={UploadCloud}
                action={headerAction}
                tone="blue"
            />

            <GuideBody>
                <GuideFlow
                    title="Install order"
                    icon={UploadCloud}
                    tone="blue"
                    items={[
                        {
                            title: "Choose your instances",
                            detail: "Pick the stable or nightly sources you want to use.",
                            icon: Settings,
                        },
                        {
                            title: "Download all 3 templates",
                            detail: "Keep the snapshot and both addon templates ready.",
                            icon: Download,
                        },
                        {
                            title: "Configure addons in Omni",
                            detail: "Set up both addons, then add both manifest URLs.",
                            icon: Link2,
                        },
                        {
                            title: "Import the Omni Snapshot",
                            detail: "Finish by importing the prepared snapshot backup.",
                            icon: UploadCloud,
                        },
                    ]}
                />

                <GuideSection
                    eyebrow="Phase 1"
                    title="Choose your instances"
                    description="Start with the instance pair you want to run, then download the three template files you will use during setup."
                    icon={Settings}
                    tone="blue"
                >
                    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="grid gap-4 md:auto-rows-fr md:grid-cols-2">
                            {instanceGroups.map((group) => {
                                const Icon = group.icon;
                                return (
                                    <GuidePanel
                                        key={group.name}
                                        title={group.name}
                                        icon={Icon}
                                        description={group.description}
                                        tone="blue"
                                    >
                                        <div className="space-y-2.5">
                                            {group.links.map((link) => (
                                                <a
                                                    key={link.text}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={guideActionButtonClass}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <span className={guideActionIconShellClass}>
                                                            <Icon className="h-4 w-4 text-primary dark:text-primary" />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold tracking-tight text-foreground">{link.text}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-foreground/36 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:group-hover:text-primary" />
                                                </a>
                                            ))}
                                        </div>
                                    </GuidePanel>
                                );
                            })}
                        </div>

                        <GuidePanel
                            title="Required files"
                            icon={Download}
                            tone="blue"
                            description="Download the template files below."
                        >
                            <div className="space-y-2.5">
                                {coreTemplates.map((item) => {
                                    const isAvailable = !!item.url;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                if (!isAvailable) return;
                                                handleDownload(item);
                                            }}
                                            disabled={!isAvailable}
                                            className={cn(
                                                guideActionButtonClass, 
                                                "w-full text-left",
                                                !isAvailable && "opacity-60 cursor-not-allowed grayscale-[0.5]"
                                            )}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className={guideActionIconShellClass}>
                                                    <FileJson className="h-4 w-4 text-primary dark:text-primary" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-bold tracking-tight text-foreground">{item.name}</span>
                                                    <span className="mt-0.5 block text-[10px] leading-tight text-foreground/46 font-medium tracking-[0.04em]">
                                                        {item.version || (isAvailable ? "Latest" : "Coming Soon")}
                                                    </span>
                                                </span>
                                            </span>
                                            {isAvailable ? (
                                                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/36 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:group-hover:text-primary" />
                                            ) : (
                                                <div className="text-[9px] font-bold uppercase tracking-wider text-foreground/30 px-1.5 py-0.5 border border-border/40 rounded-md">Pending</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </GuidePanel>
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Phase 2"
                    title="Configure the addon pair"
                    description="Both addons are required. Configure them separately, then add each manifest to Omni."
                    icon={MousePointer2}
                    tone="blue"
                >
                    <div className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
                        {setupTracks.map((track, index) => {
                            const Icon = track.icon;
                            return (
                                <GuidePanel
                                    key={track.title}
                                    eyebrow={`Step 0${index + 1}`}
                                    title={track.title}
                                    icon={Icon}
                                    tone="blue"
                                >
                                    <div className="flex h-full flex-col">
                                        <GuideStepList items={track.steps} className="mt-4" />
                                        <div className="mt-4 space-y-2 border-t border-border/60 pt-4 xl:mt-auto">
                                            <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/78">
                                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                                Save UUID + password before leaving the page.
                                            </p>
                                            <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/78">
                                                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                {track.finalStep}
                                            </p>
                                        </div>
                                    </div>
                                </GuidePanel>
                            );
                        })}
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Phase 3"
                    title="Connect and import"
                    description="Confirm both addon manifests are connected in Omni, then import the snapshot and move it onto your target devices."
                    icon={Info}
                    tone="blue"
                >
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:items-start">
                        {deviceGuides.map((item) => {
                            const Icon = item.icon;
                            return (
                                <GuidePanel
                                    key={item.title}
                                    title={item.title}
                                    icon={Icon}
                                    tone={item.tone}
                                >
                                    <div>
                                        <p className="text-sm leading-relaxed text-foreground/72">
                                            {item.description}
                                        </p>
                                        <div className="mt-5 space-y-3">
                                            {item.details.map((detail) => (
                                                <div
                                                    key={`${item.title}-${detail.label}`}
                                                    className="rounded-xl border border-border/60 bg-background/55 p-3"
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">
                                                        {detail.label}
                                                    </p>
                                                    <p className="mt-2 break-words font-mono text-xs text-foreground/74">
                                                        {detail.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GuidePanel>
                            );
                        })}
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
            />
        </GuideDialog>
    );
}

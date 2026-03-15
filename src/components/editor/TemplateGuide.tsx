"use client";

import React from "react";
import {
    CheckCircle2,
    ChevronRight,
    Cloud,
    Download,
    FileJson,
    Info,
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
import { downloadTemplateFile } from "@/lib/template-download";
import { getTemplateDisplay } from "@/lib/template-display";
import { editorHover } from "@/components/editor/ui/style-contract";
import { GuideHeader } from "@/components/editor/GuideHeader";
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
    note: string;
    tone: "blue";
};

export function TemplateGuide({ headerAction }: TemplateGuideProps = {}) {
    const { manifest } = useConfig();

    const templates: TemplateAsset[] = [
        {
            name: "Omni Snapshot",
            id: "ume-main",
            url:
                manifest?.templates?.find((t) => t.id === "ume-main")?.url ||
                "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/fusion-template-bot-bid-raiser-v1.6.2.json",
        },
        {
            name: "AIOMetadata",
            id: "aiometadata",
            url:
                manifest?.templates?.find((t) => t.id === "aiometadata")?.url ||
                "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/aiometadata-patterns-v1.json",
        },
        {
            name: "AIOStreams",
            id: "aiostreams",
            url:
                manifest?.templates?.find((t) => t.id === "aiostreams")?.url ||
                "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/main/aiostreams-patterns-v1.json",
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
                "Open the AIOStreams instance and start the install flow.",
                "Choose Import Template and upload the AIOStreams template.",
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
            description: "Move the downloaded Omni Snapshot JSON into Omni's local backups folder, then restart Omni if the file does not appear immediately.",
            note: "Files > On My iPhone > Omni > Backups",
            tone: "blue",
        },
        {
            title: "Sync to Apple TV",
            icon: Cloud,
            description: "Import the backup on iOS first, enable iCloud Sync in Omni settings, then pull the synced setup on Apple TV.",
            note: "iCloud Sync must be enabled on the same Apple account.",
            tone: "blue",
        },
    ];

    const handleDownload = async (url: string, templateName: string) => {
        try {
            await downloadTemplateFile(url, templateName);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const getTemplateName = (id: string, fallback: string) =>
        manifest?.templates?.find((t) => t.id === id)?.name || fallback;

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
                                {templates.map((item) => {
                                    const manifestName = getTemplateName(item.id, item.name);
                                    const display = getTemplateDisplay(manifestName, item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleDownload(item.url, manifestName)}
                                            className={cn(guideActionButtonClass, "w-full text-left")}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className={guideActionIconShellClass}>
                                                    <FileJson className="h-4 w-4 text-primary dark:text-primary" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-bold tracking-tight text-foreground">{display.label}</span>
                                                    {display.version && (
                                                        <span className="mt-0.5 block text-[10px] leading-tight text-foreground/46 font-medium tracking-[0.04em]">
                                                            {display.version}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-foreground/36 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:group-hover:text-primary" />
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
                    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                        <GuidePanel title="Checklist" icon={CheckCircle2} tone="blue">
                            <GuideStepList
                                items={[
                                    "AIOStreams manifest URL added in Omni",
                                    "AIOMetadata manifest URL added in Omni",
                                    "Both addon configs saved with password",
                                    "Snapshot template downloaded to your device",
                                ]}
                                ordered={false}
                                tone="blue"
                                className="mt-1"
                            />
                        </GuidePanel>

                        <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-2">
                            {deviceGuides.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <GuidePanel
                                        key={item.title}
                                        title={item.title}
                                        icon={Icon}
                                        tone={item.tone}
                                        className="h-full"
                                    >
                                        <div className="flex h-full flex-col">
                                            <p className="min-h-[7.5rem] text-sm leading-relaxed text-foreground/72 sm:min-h-[8.5rem]">
                                                {item.description}
                                            </p>
                                            <div className="mt-4 rounded-xl border border-border/60 bg-background/55 p-3.5 lg:mt-auto">
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">Important path / note</p>
                                                <p className="mt-2 break-words font-mono text-xs text-foreground/74">{item.note}</p>
                                            </div>
                                        </div>
                                    </GuidePanel>
                                );
                            })}
                        </div>
                    </div>
                </GuideSection>
            </GuideBody>
        </GuideDialog>
    );
}

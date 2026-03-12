"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    Copy,
    Link2,
    ListChecks,
    LogIn,
    RefreshCcw,
    Sparkles,
    Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideHeader } from "@/components/editor/GuideHeader";
import {
    GuideBody,
    GuideCodeBlock,
    GuideDialog,
    GuideFlow,
    GuidePanel,
    GuideSection,
    GuideStepList,
} from "@/components/editor/GuidePrimitives";

type UpdateGuideProps = {
    headerAction?: React.ReactNode;
};

const CATALOGS_ONLY_URL =
    "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/aiometadata-catalogs-only-2026-03-12.json";

export function UpdateGuide({ headerAction }: UpdateGuideProps = {}) {
    const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(CATALOGS_ONLY_URL);
            setCopyState("copied");
            window.setTimeout(() => setCopyState("idle"), 1800);
        } catch (error) {
            console.error("Failed to copy update URL:", error);
        }
    };

    return (
        <GuideDialog>
            <GuideHeader
                badge="Update Flow"
                title="Update from Existing Setup"
                icon={RefreshCcw}
                action={headerAction}
                tone="amber"
            />

            <GuideBody>
                <GuideFlow
                    title="Quick update path"
                    icon={Workflow}
                    tone="amber"
                    items={[
                        { title: "Update AIOMetadata catalogs", detail: "Import the latest catalog-only setup into AIOMetadata." },
                        { title: "Import your current snapshot", detail: "Load the setup you already use into the manager." },
                        { title: "Update from template", detail: "Pull in template changes through the Catalog Manager." },
                        { title: "Review and personalize", detail: "Select, reorder, rename, and finish the imported changes." },
                    ]}
                />

                <GuideSection
                    step="01"
                    title="Update AIOMetadata catalogs first"
                    description="If you already have your own AIOMetadata setup, you do not need to import the full template again just to get new catalogs."
                    tone="amber"
                >
                    <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-[1fr_0.95fr]">
                        <GuidePanel title="In AIOMetadata" icon={LogIn} tone="blue">
                            <GuideStepList
                                items={[
                                    "Login with your existing UUID.",
                                    "Open Catalogs.",
                                    "Choose Import from Setup.",
                                    "Select From URL.",
                                    "Paste the catalogs-only link below and import.",
                                ]}
                                className="mt-1"
                            />
                        </GuidePanel>

                        <GuideCodeBlock
                            label="Catalogs-only URL"
                            value={CATALOGS_ONLY_URL}
                            helperText="Use this only to pull new catalogs into your existing AIOMetadata setup."
                            tone="amber"
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCopyUrl}
                                    className="h-9 w-full border-amber-500/20 bg-background/60 hover:bg-amber-500/8 sm:w-auto"
                                >
                                    {copyState === "copied" ? "Copied" : "Copy URL"}
                                    <Copy className="ml-2 h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </GuideSection>

                <GuideSection
                    step="02"
                    title="Load your current snapshot into the manager"
                    description="Once AIOMetadata is up to date, switch to the manager and work against your real setup instead of starting from a blank template."
                    tone="amber"
                >
                    <GuidePanel title="Use your real setup" icon={ListChecks} tone="amber">
                        <GuideStepList
                            items={[
                                "Create a new Omni Snapshot if needed and export your current setup.",
                                "Open the manager and use Custom Import.",
                                "Upload your current Omni Snapshot JSON so updates apply to your real setup.",
                            ]}
                            className="mt-1"
                        />
                    </GuidePanel>
                </GuideSection>

                <GuideSection
                    step="03"
                    title="Run the template update"
                    description="The update flow lives inside the Catalog Manager and works against your imported snapshot."
                    tone="amber"
                >
                    <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-[1fr_0.9fr]">
                        <GuidePanel title="In the app" icon={Workflow} tone="amber">
                            <GuideStepList
                                items={[
                                    "Open the Catalog Manager.",
                                    "Click Update from Template.",
                                    "Choose the latest template or upload your own custom template as source.",
                                ]}
                                tone="amber"
                                className="mt-1"
                            />
                        </GuidePanel>

                        <GuidePanel title="What the updater detects" icon={Link2} tone="amber">
                            <GuideStepList
                                items={[
                                    "New groups and catalogs",
                                    "Existing groups that should be updated",
                                    "Catalog changes and image changes",
                                ]}
                                ordered={false}
                                tone="amber"
                                className="mt-1"
                            />
                        </GuidePanel>
                    </div>
                </GuideSection>

                <GuideSection
                    step="04"
                    title="Review, import, then clean up"
                    description="After the update scan, choose only the catalogs and groups you want, then finish the update with your own ordering and naming."
                    tone="amber"
                >
                    <div className="grid gap-4 lg:auto-rows-fr lg:grid-cols-2">
                        <GuidePanel title="During import" icon={ListChecks} tone="amber">
                            <GuideStepList
                                items={[
                                    "Select the groups and catalogs you want to update or add.",
                                    "Skip anything you want to keep untouched.",
                                    "Import once the selection looks correct.",
                                ]}
                                ordered={false}
                                className="mt-1"
                            />
                        </GuidePanel>

                        <GuidePanel title="After import" icon={Sparkles} tone="amber">
                            <GuideStepList
                                items={[
                                    "Reorder imported catalogs and groups as needed.",
                                    "Rename items where you want your own labels.",
                                    "Personalize images, layout, and final structure.",
                                ]}
                                ordered={false}
                                className="mt-1"
                            />
                        </GuidePanel>
                    </div>
                </GuideSection>

                <GuideSection
                    eyebrow="Optional"
                    title="Update regex patterns too"
                    description="If you also want newer regex patterns, you can import or update those separately afterward. This is optional and not required for the catalog/group update itself."
                    icon={CheckCircle2}
                    tone="blue"
                >
                    <GuidePanel title="When to do this" icon={Sparkles} tone="blue">
                        <GuideStepList
                            items={[
                                "Do this only if you want updated tag logic or newer regex behavior.",
                                "You can keep your current regex setup if the catalog and group update is your only goal.",
                            ]}
                            ordered={false}
                            className="mt-1"
                        />
                    </GuidePanel>
                </GuideSection>
            </GuideBody>
        </GuideDialog>
    );
}

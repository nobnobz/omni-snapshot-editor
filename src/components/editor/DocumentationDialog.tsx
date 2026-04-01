"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, RefreshCcw, Sparkles, UploadCloud } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Documentation } from "@/components/editor/Documentation";
import { TemplateGuide } from "@/components/editor/TemplateGuide";
import { UpdateGuide } from "@/components/editor/UpdateGuide";
import { cn } from "@/lib/utils";
import { GuideHeader } from "@/components/editor/GuideHeader";
import { GuideBody, GuideDialog } from "@/components/editor/GuidePrimitives";
import { editorHover } from "@/components/editor/ui/style-contract";

type GuideId = "menu" | "install" | "update" | "use";

type DocumentationDialogProps = {
    trigger?: React.ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const cards = [
    {
        id: "install" as const,
        title: "How to Install",
        subtitle: "Setup and import",
        description: "Step-by-step setup from template download to Omni import.",
        icon: UploadCloud,
        tone: "blue" as const,
    },
    {
        id: "update" as const,
        title: "How to Update",
        subtitle: "Update flow",
        description: "Upgrade strategy for existing setups.",
        icon: RefreshCcw,
        tone: "amber" as const,
    },
    {
        id: "use" as const,
        title: "How to Use",
        subtitle: "Master guide",
        description: "Complete editor reference for groups, catalogs and patterns.",
        icon: BookOpen,
        tone: "indigo" as const,
    },
];

const cardToneClasses = {
    blue: {
        shell: "border-primary/24 bg-primary/8 hover:border-primary/45 hover:bg-primary/10",
        icon: "border-primary/20 bg-primary/10 text-primary",
        badge: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
        arrow: "border-primary/18 bg-background/60 text-primary",
    },
    amber: {
        shell: "border-amber-500/24 bg-amber-500/7 hover:border-amber-400/45 hover:bg-amber-500/10",
        icon: "border-amber-500/20 bg-amber-500/10 text-amber-500",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        arrow: "border-amber-500/18 bg-background/60 text-amber-500",
    },
    indigo: {
        shell: "border-primary/24 bg-primary/8 hover:border-primary/45 hover:bg-primary/10",
        icon: "border-primary/20 bg-primary/10 text-primary",
        badge: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
        arrow: "border-primary/18 bg-background/60 text-primary",
    },
};

function BackButton({ onBack }: { onBack: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onBack}
            className="h-10 shrink-0 rounded-xl border-border/70 bg-background/70 px-4 text-foreground/86 shadow-none hover:bg-accent/60 hover:text-foreground"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All guides
        </Button>
    );
}

function MenuGuideCard({
    card,
    index,
    onSelect,
}: {
    card: (typeof cards)[number];
    index: number;
    onSelect: (id: GuideId) => void;
}) {
    const Icon = card.icon;
    const tone = cardToneClasses[card.tone];

    return (
        <button
            type="button"
            onClick={() => onSelect(card.id)}
            className={cn(
                `group rounded-2xl border p-4 text-left ${editorHover.transition} duration-200 sm:rounded-3xl lg:p-4 ${editorHover.premiumCard}`,
                tone.shell
            )}
        >
            <div className="flex items-start gap-3 lg:hidden">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", tone.icon)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">{card.subtitle}</p>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">{card.title}</h3>
                        </div>
                        <span className={cn("inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border px-2 text-[11px] font-bold", tone.badge)}>
                            0{index + 1}
                        </span>
                    </div>
                </div>
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border", tone.arrow)}>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>

            <div className="hidden lg:block">
                <div className="flex items-start justify-between gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", tone.icon)}>
                        <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className={cn("inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[11px] font-bold", tone.badge)}>
                        0{index + 1}
                    </span>
                </div>
                <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">{card.subtitle}</p>
                    <h3 className="mt-1 text-lg font-black tracking-tight text-foreground xl:text-[1.65rem]">{card.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-foreground/66">{card.description}</p>
                </div>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-foreground/84">
                    Open guide
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>
        </button>
    );
}

function Menu({ onSelect }: { onSelect: (id: GuideId) => void }) {
    return (
        <GuideDialog className="relative h-auto max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overflow-x-hidden p-0 sm:max-w-[56rem]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.94)_0%,rgba(17,24,39,0.94)_42%,rgba(17,24,39,0.86)_58%,rgba(17,24,39,0.78)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_58%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_46%)] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="relative px-4 py-4 sm:px-6 sm:py-6">
                <GuideHeader
                    badge="How To"
                    title="Choose your guide"
                    icon={Sparkles}
                    tone="indigo"
                    compact
                    showDivider={false}
                />
            </div>
            <GuideBody className="relative mt-0 px-4 pt-1 sm:px-6 sm:pt-2">
                <div className="grid gap-4 lg:grid-cols-3">
                    {cards.map((card, idx) => (
                        <MenuGuideCard key={card.id} card={card} index={idx} onSelect={onSelect} />
                    ))}
                </div>
            </GuideBody>
        </GuideDialog>
    );
}

export function DocumentationDialog({ trigger, open: controlledOpen, onOpenChange }: DocumentationDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [activeGuide, setActiveGuide] = useState<GuideId>("menu");
    const open = controlledOpen ?? uncontrolledOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (controlledOpen === undefined) {
            setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
        if (nextOpen) setActiveGuide("menu");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            {activeGuide === "menu" && <Menu onSelect={setActiveGuide} />}
            {activeGuide === "install" && <TemplateGuide headerAction={<BackButton onBack={() => setActiveGuide("menu")} />} />}
            {activeGuide === "use" && (
                <Documentation
                    headerAction={<BackButton onBack={() => setActiveGuide("menu")} />}
                    onOpenInstallGuide={() => setActiveGuide("install")}
                />
            )}
            {activeGuide === "update" && <UpdateGuide headerAction={<BackButton onBack={() => setActiveGuide("menu")} />} />}
        </Dialog>
    );
}

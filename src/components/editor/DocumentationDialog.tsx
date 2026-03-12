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

type GuideId = "menu" | "install" | "update" | "use";

type DocumentationDialogProps = {
    trigger: React.ReactElement;
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
        shell: "border-sky-500/24 bg-sky-500/7 hover:border-sky-400/45 hover:bg-sky-500/10",
        icon: "border-sky-500/20 bg-sky-500/10 text-sky-500",
        badge: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300",
        arrow: "border-sky-500/18 bg-background/60 text-sky-500",
    },
    amber: {
        shell: "border-amber-500/24 bg-amber-500/7 hover:border-amber-400/45 hover:bg-amber-500/10",
        icon: "border-amber-500/20 bg-amber-500/10 text-amber-500",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        arrow: "border-amber-500/18 bg-background/60 text-amber-500",
    },
    indigo: {
        shell: "border-indigo-500/24 bg-indigo-500/7 hover:border-indigo-400/45 hover:bg-indigo-500/10",
        icon: "border-indigo-500/20 bg-indigo-500/10 text-indigo-500",
        badge: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
        arrow: "border-indigo-500/18 bg-background/60 text-indigo-500",
    },
};

function BackButton({ onBack }: { onBack: () => void }) {
    return (
        <Button variant="outline" onClick={onBack} className="shrink-0">
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
                "group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 sm:rounded-3xl sm:p-5",
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
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", tone.icon)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn("inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2.5 text-[11px] font-bold", tone.badge)}>
                        0{index + 1}
                    </span>
                </div>
                <div className="mt-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">{card.subtitle}</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/68">{card.description}</p>
                </div>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-foreground/84">
                    Open guide
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>
        </button>
    );
}

function Menu({ onSelect }: { onSelect: (id: GuideId) => void }) {
    return (
        <GuideDialog className="h-auto max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] sm:max-w-5xl p-0 overflow-hidden">
            <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_58%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_45%)] px-4 py-4 sm:px-8 sm:py-8">
                <GuideHeader
                    badge="Documentation"
                    title="Choose your guide"
                    icon={Sparkles}
                    tone="indigo"
                />
            </div>
            <GuideBody className="px-4 sm:px-8">
                <div className="grid gap-4 lg:grid-cols-3">
                    {cards.map((card, idx) => (
                        <MenuGuideCard key={card.id} card={card} index={idx} onSelect={onSelect} />
                    ))}
                </div>
            </GuideBody>
        </GuideDialog>
    );
}

export function DocumentationDialog({ trigger }: DocumentationDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeGuide, setActiveGuide] = useState<GuideId>("menu");

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) setActiveGuide("menu");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
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

"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, RefreshCcw, Sparkles, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Documentation } from "@/components/editor/Documentation";
import { TemplateGuide } from "@/components/editor/TemplateGuide";
import { cn } from "@/lib/utils";
import { editorLayout } from "@/components/editor/ui/style-contract";

type GuideId = "menu" | "install" | "update" | "use";

type DocumentationDialogProps = {
    trigger: React.ReactElement;
};

const cards = [
    {
        id: "install" as const,
        title: "How to install",
        subtitle: "Setup and import",
        description: "Use the full install guide for templates and Omni setup.",
        icon: UploadCloud,
        tone: "border-sky-500/35 hover:border-sky-400 bg-sky-500/6",
        iconTone: "text-sky-500",
    },
    {
        id: "update" as const,
        title: "How to update",
        subtitle: "Coming soon",
        description: "Placeholder for migration and upgrade steps.",
        icon: RefreshCcw,
        tone: "border-amber-500/35 hover:border-amber-400 bg-amber-500/6",
        iconTone: "text-amber-500",
    },
    {
        id: "use" as const,
        title: "How to use",
        subtitle: "Master guide",
        description: "Open the complete editor manual.",
        icon: BookOpen,
        tone: "border-indigo-500/35 hover:border-indigo-400 bg-indigo-500/6",
        iconTone: "text-indigo-500",
    },
];

function BackButton({ onBack }: { onBack: () => void }) {
    return (
        <Button variant="outline" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All guides
        </Button>
    );
}

function UpdatePlaceholder({ onBack }: { onBack: () => void }) {
    return (
        <DialogContent className={cn(editorLayout.dialogContent, "sm:max-w-3xl max-h-[95vh] overflow-y-auto")}>
            <DialogHeader className="border-b border-border pb-7 mb-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <DialogTitle className="text-3xl font-extrabold flex items-center gap-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            <RefreshCcw className="w-10 h-10 text-amber-500" />
                            How to update
                        </DialogTitle>
                        <p className="text-foreground/70 text-sm mt-3">This guide is being prepared.</p>
                    </div>
                    <BackButton onBack={onBack} />
                </div>
            </DialogHeader>
            <div className="space-y-5 pb-4">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-5 text-sm text-foreground/80 leading-relaxed">
                    Placeholder active. This section will include safe update steps for existing setups, template changes, and validation checks.
                </div>
            </div>
        </DialogContent>
    );
}

function Menu({ onSelect }: { onSelect: (id: GuideId) => void }) {
    return (
        <DialogContent className={cn(editorLayout.dialogContent, "sm:max-w-4xl p-0 overflow-hidden")}>
            <div className="relative h-full">
                <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_55%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_48%)] pointer-events-none" />
                <div className="relative border-b border-border/70 px-6 py-8 sm:px-8">
                    <DialogHeader className="text-left gap-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-200">
                            <Sparkles className="w-3.5 h-3.5" />
                            Documentation Center
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight">Choose your guide</DialogTitle>
                        <DialogDescription className="text-sm text-foreground/70 leading-relaxed">
                            Open the guide you need right now.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="relative px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto">
                    <div className="grid gap-4 md:grid-cols-3">
                        {cards.map((card, idx) => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.id}
                                    type="button"
                                    onClick={() => onSelect(card.id)}
                                    className={cn(
                                        "group rounded-3xl border p-5 text-left transition-all hover:-translate-y-0.5",
                                        card.tone
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="h-11 w-11 rounded-2xl border border-border/70 bg-background/70 flex items-center justify-center">
                                            <Icon className={cn("w-5 h-5", card.iconTone)} />
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">
                                            0{idx + 1}
                                        </span>
                                    </div>
                                    <div className="mt-5">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">{card.subtitle}</p>
                                        <h3 className="text-xl font-black tracking-tight mt-1">{card.title}</h3>
                                        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{card.description}</p>
                                    </div>
                                    <div className="mt-5 inline-flex items-center text-sm font-semibold text-foreground/85">
                                        Open guide
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DialogContent>
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
            {activeGuide === "use" && <Documentation headerAction={<BackButton onBack={() => setActiveGuide("menu")} />} />}
            {activeGuide === "update" && <UpdatePlaceholder onBack={() => setActiveGuide("menu")} />}
        </Dialog>
    );
}

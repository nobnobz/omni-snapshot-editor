"use client";

import React from "react";
import {
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GuideHeaderTone = "blue" | "amber" | "indigo";

const toneClasses: Record<GuideHeaderTone, string> = {
    blue: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    indigo: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
};

type GuideHeaderProps = {
    badge: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
    tone?: GuideHeaderTone;
    supplementary?: React.ReactNode;
};

export function GuideHeader({
    badge,
    title,
    description,
    icon: Icon,
    action,
    tone = "blue",
    supplementary,
}: GuideHeaderProps) {
    return (
        <DialogHeader className="border-b border-border/70 pb-4 pr-14 text-left sm:pb-5 sm:pr-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 max-w-3xl">
                    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]", toneClasses[tone])}>
                        <Icon className="h-3.5 w-3.5" />
                        {badge}
                    </div>
                    <DialogTitle className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {title}
                    </DialogTitle>
                    {description ? (
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/74 sm:text-[15px]">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? <div className="shrink-0 self-start">{action}</div> : null}
            </div>
            {supplementary ? <div className="mt-5">{supplementary}</div> : null}
        </DialogHeader>
    );
}

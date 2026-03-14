"use client";

import React from "react";
import {
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GuideHeaderTone = "blue" | "amber" | "indigo";

const toneClasses: Record<GuideHeaderTone, string> = {
    blue: "border-primary/25 bg-primary/10 text-primary dark:text-primary",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    indigo: "border-primary/25 bg-primary/10 text-primary dark:text-primary",
};

type GuideHeaderProps = {
    badge: string;
    title: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
    tone?: GuideHeaderTone;
    supplementary?: React.ReactNode;
    compact?: boolean;
    showDivider?: boolean;
};

export function GuideHeader({
    badge,
    title,
    description,
    icon: Icon,
    action,
    tone = "blue",
    supplementary,
    compact = false,
    showDivider = true,
}: GuideHeaderProps) {
    return (
        <DialogHeader
            className={cn(
                "pr-14 text-left sm:pr-20",
                showDivider ? "border-b border-border/70" : "border-b-0",
                compact ? "pb-3 sm:pb-4" : "pb-4 sm:pb-5"
            )}
        >
            <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between", compact ? "gap-3" : "gap-4")}>
                <div className="min-w-0 max-w-3xl">
                    <div
                        className={cn(
                            "inline-flex items-center rounded-full border font-bold uppercase",
                            compact ? "gap-1.5 px-2.5 py-0.5 text-[10px] tracking-[0.16em] sm:gap-2 sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.2em]" : "gap-2 px-3 py-1 text-[11px] tracking-[0.2em]",
                            toneClasses[tone]
                        )}
                    >
                        <Icon className={cn(compact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5")} />
                        {badge}
                    </div>
                    <DialogTitle className={cn("font-black tracking-tight text-foreground", compact ? "mt-3 text-2xl sm:text-3xl" : "mt-4 text-3xl sm:text-4xl")}>
                        {title}
                    </DialogTitle>
                    {description ? (
                        <p className={cn("max-w-3xl leading-relaxed text-foreground/74", compact ? "mt-2 text-sm sm:text-[15px]" : "mt-3 text-sm sm:text-[15px]")}>
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

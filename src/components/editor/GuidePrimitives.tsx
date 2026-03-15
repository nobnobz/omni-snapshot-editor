"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { editorLayout } from "@/components/editor/ui/style-contract";

type GuideTone = "neutral" | "blue" | "amber" | "emerald" | "indigo";

const sectionToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-card/45",
    blue: "border-primary/22 bg-[linear-gradient(180deg,rgba(240,249,255,0.98),rgba(224,242,254,0.88))] dark:border-primary/18 dark:bg-[linear-gradient(180deg,rgba(10,25,40,0.88),rgba(7,18,31,0.82))]",
    amber: "border-amber-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,246,239,0.9))] dark:border-amber-400/12 dark:bg-[linear-gradient(180deg,rgba(29,22,16,0.96),rgba(19,15,11,0.96))]",
    emerald: "border-emerald-500/18 bg-emerald-500/6",
    indigo: "border-primary/18 bg-[linear-gradient(180deg,rgba(245,246,255,0.96),rgba(239,242,255,0.9))] dark:border-primary/12 dark:bg-[linear-gradient(180deg,rgba(17,21,34,0.9),rgba(12,16,28,0.86))]",
};

const panelToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-muted/20",
    blue: "border-primary/24 bg-[linear-gradient(180deg,rgba(232,245,255,0.98),rgba(219,234,254,0.92))] dark:border-primary/18 dark:bg-[linear-gradient(180deg,rgba(14,31,48,0.86),rgba(10,22,36,0.8))]",
    amber: "border-amber-400/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,237,0.9))] dark:border-amber-500/16 dark:bg-[linear-gradient(180deg,rgba(48,34,20,0.78),rgba(31,22,14,0.74))]",
    emerald: "border-emerald-500/18 bg-emerald-500/6",
    indigo: "border-primary/18 bg-[linear-gradient(180deg,rgba(240,243,255,0.96),rgba(233,238,255,0.9))] dark:border-primary/12 dark:bg-[linear-gradient(180deg,rgba(22,27,41,0.84),rgba(16,21,34,0.82))]",
};

const flowItemToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/65 bg-background/50",
    blue: "border-primary/22 bg-[linear-gradient(180deg,rgba(227,242,253,0.98),rgba(219,234,254,0.94))] dark:border-primary/14 dark:bg-[linear-gradient(180deg,rgba(17,34,50,0.86),rgba(11,24,38,0.82))]",
    amber: "border-amber-400/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,247,239,0.92))] dark:border-amber-500/18 dark:bg-[linear-gradient(180deg,rgba(43,31,18,0.66),rgba(26,19,13,0.6))]",
    emerald: "border-emerald-500/14 bg-emerald-500/6",
    indigo: "border-primary/18 bg-[linear-gradient(180deg,rgba(237,239,255,0.96),rgba(231,234,255,0.92))] dark:border-primary/12 dark:bg-[linear-gradient(180deg,rgba(24,29,44,0.84),rgba(17,22,35,0.82))]",
};

const codeToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-background/60",
    blue: "border-primary/20 bg-[linear-gradient(180deg,rgba(224,242,254,0.9),rgba(239,246,255,0.82))] dark:border-primary/16 dark:bg-[linear-gradient(180deg,rgba(16,37,56,0.82),rgba(11,27,43,0.78))]",
    amber: "border-amber-400/18 bg-[linear-gradient(180deg,rgba(255,252,247,0.94),rgba(251,246,238,0.88))] dark:border-amber-400/12 dark:bg-[linear-gradient(180deg,rgba(31,22,14,0.8),rgba(19,15,11,0.9))]",
    emerald: "border-emerald-500/16 bg-emerald-500/7",
    indigo: "border-primary/20 bg-[linear-gradient(180deg,rgba(224,231,255,0.88),rgba(238,242,255,0.82))] dark:border-primary/16 dark:bg-[linear-gradient(180deg,rgba(29,34,60,0.8),rgba(20,24,45,0.76))]",
};

const markerToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-background/70 text-foreground/70",
    blue: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
    amber: "border-amber-400/22 bg-amber-400/[0.08] text-amber-700 dark:text-amber-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    indigo: "border-primary/20 bg-primary/10 text-primary dark:text-primary",
};

const iconToneClasses: Record<GuideTone, string> = {
    neutral: "text-foreground/55",
    blue: "text-primary",
    amber: "text-amber-600",
    emerald: "text-emerald-500",
    indigo: "text-primary",
};

type GuideDialogProps = {
    children: React.ReactNode;
    className?: string;
};

export function GuideDialog({ children, className }: GuideDialogProps) {
    return (
        <DialogContent
            showCloseButton={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={cn(
                editorLayout.dialogContent,
                "z-[70] h-auto max-h-[calc(100dvh-1rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] p-0 overflow-hidden flex flex-col left-1/2 -translate-x-1/2 top-[calc(0.5rem+env(safe-area-inset-top))] translate-y-0 w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:top-[3.5vh] sm:translate-y-0 sm:max-h-[calc(100dvh-3.5rem)] sm:max-w-6xl",
                className
            )}
        >
            <DialogClose asChild>
                <Button
                    variant="outline"
                    size="icon-sm"
                    className="absolute right-4 top-4 z-50 rounded-xl border-border/70 bg-background/70 text-foreground/74 shadow-none hover:bg-accent/60 hover:text-foreground backdrop-blur-md"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </DialogClose>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
                {children}
            </div>
        </DialogContent>
    );
}

type GuideBodyProps = {
    children: React.ReactNode;
    className?: string;
};

export function GuideBody({ children, className }: GuideBodyProps) {
    return <div className={cn("mt-4 space-y-5 pb-6 pr-1 sm:mt-5 sm:space-y-6", className)}>{children}</div>;
}

type GuideSectionProps = {
    title: string;
    description?: React.ReactNode;
    eyebrow?: string;
    icon?: React.ComponentType<{ className?: string }>;
    step?: string;
    tone?: GuideTone;
    children: React.ReactNode;
    className?: string;
};

export function GuideSection({
    title,
    description,
    eyebrow,
    icon: Icon,
    step,
    tone = "neutral",
    children,
    className,
}: GuideSectionProps) {
    return (
        <section className={cn("rounded-2xl border p-5 sm:p-6", sectionToneClasses[tone], className)}>
            <div className="flex items-start gap-4">
                {step ? (
                    <div
                        className={cn(
                            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold uppercase tracking-[0.12em]",
                            markerToneClasses[tone === "neutral" ? "neutral" : tone]
                        )}
                    >
                        {step}
                    </div>
                ) : Icon ? (
                    <div
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                            markerToneClasses[tone === "neutral" ? "neutral" : tone]
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                ) : null}
                <div className="min-w-0">
                    {eyebrow ? (
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/44">{eyebrow}</p>
                    ) : null}
                    <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h2>
                    {description ? (
                        <div className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/72">{description}</div>
                    ) : null}
                </div>
            </div>
            <div className="mt-5 sm:mt-6">{children}</div>
        </section>
    );
}

type GuidePanelProps = {
    title?: string;
    eyebrow?: string;
    description?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    tone?: GuideTone;
    children?: React.ReactNode;
    className?: string;
};

export function GuidePanel({
    title,
    eyebrow,
    description,
    icon: Icon,
    tone = "neutral",
    children,
    className,
}: GuidePanelProps) {
    return (
        <article className={cn("flex h-full flex-col rounded-2xl border p-4 sm:p-5", panelToneClasses[tone], className)}>
            {title || eyebrow || description ? (
                <div>
                    {eyebrow ? (
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/46">{eyebrow}</p>
                    ) : null}
                    {title ? (
                        <h3 className="mt-1 flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
                            {Icon ? <Icon className={cn("h-4 w-4 shrink-0", iconToneClasses[tone])} /> : null}
                            {title}
                        </h3>
                    ) : null}
                    {description ? (
                        <div className="mt-2 text-sm leading-relaxed text-foreground/72">{description}</div>
                    ) : null}
                </div>
            ) : null}
            {children ? (
                <div className={cn("min-h-0 flex-1", title || eyebrow || description ? "mt-4" : undefined)}>{children}</div>
            ) : null}
        </article>
    );
}

type GuideFlowItem = {
    title: string;
    detail?: string;
    icon?: React.ComponentType<{ className?: string }>;
};

type GuideFlowProps = {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    tone?: GuideTone;
    items: GuideFlowItem[];
    columnsClassName?: string;
};

export function GuideFlow({
    title,
    icon: Icon,
    tone = "blue",
    items,
    columnsClassName = "md:grid-cols-2 xl:grid-cols-4",
}: GuideFlowProps) {
    return (
        <div className={cn("rounded-2xl border p-4 sm:p-5", tone === "neutral" ? sectionToneClasses.neutral : sectionToneClasses[tone])}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/46">
                {Icon ? <Icon className={cn("h-3.5 w-3.5", iconToneClasses[tone])} /> : null}
                {title}
            </div>
            <ol className={cn("mt-4 grid gap-3", columnsClassName)}>
                {items.map((item, index) => {
                    const ItemIcon = item.icon;
                    return (
                        <li key={item.title} className={cn("rounded-2xl border p-4", flowItemToneClasses[tone])}>
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold",
                                        markerToneClasses[tone]
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="flex items-center gap-2 text-base font-bold leading-tight tracking-tight text-foreground">
                                        {ItemIcon ? <ItemIcon className={cn("h-4 w-4 shrink-0", iconToneClasses[tone])} /> : null}
                                        {item.title}
                                    </h3>
                                    {item.detail ? (
                                        <p className="mt-2 text-sm leading-relaxed text-foreground/64">{item.detail}</p>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

type GuideStepListProps = {
    items: string[];
    tone?: GuideTone;
    ordered?: boolean;
    className?: string;
};

export function GuideStepList({
    items,
    tone = "blue",
    ordered = true,
    className,
}: GuideStepListProps) {
    return (
        <ol className={cn("space-y-3", className)}>
            {items.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                    {ordered ? (
                        <span
                            className={cn(
                                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                                markerToneClasses[tone]
                            )}
                        >
                            {index + 1}
                        </span>
                    ) : (
                        <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", iconToneClasses[tone])} />
                    )}
                    <span className="text-sm leading-relaxed text-foreground/78">{item}</span>
                </li>
            ))}
        </ol>
    );
}

type GuideCodeBlockProps = {
    label: string;
    value: string;
    helperText?: string;
    action?: React.ReactNode;
    tone?: GuideTone;
    className?: string;
};

export function GuideCodeBlock({ label, value, helperText, action, tone = "neutral", className }: GuideCodeBlockProps) {
    return (
        <div className={cn("h-full rounded-2xl border p-4 sm:p-5", panelToneClasses[tone], className)}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/46">{label}</p>
            <div className={cn("mt-3 rounded-xl border p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", codeToneClasses[tone])}>
                <code className="block break-all text-xs leading-relaxed text-foreground/80 sm:text-[13px]">{value}</code>
            </div>
            {helperText || action ? (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    {helperText ? <p className="max-w-md text-xs leading-relaxed text-foreground/60">{helperText}</p> : <span />}
                    {action}
                </div>
            ) : null}
        </div>
    );
}

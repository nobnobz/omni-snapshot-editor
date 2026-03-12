"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { editorLayout } from "@/components/editor/ui/style-contract";

type GuideTone = "neutral" | "blue" | "amber" | "emerald" | "indigo";

const sectionToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-card/45",
    blue: "border-sky-500/18 bg-sky-500/6",
    amber: "border-amber-500/18 bg-amber-500/6",
    emerald: "border-emerald-500/18 bg-emerald-500/6",
    indigo: "border-indigo-500/18 bg-indigo-500/6",
};

const panelToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-muted/20",
    blue: "border-sky-500/18 bg-sky-500/6",
    amber: "border-amber-500/18 bg-amber-500/6",
    emerald: "border-emerald-500/18 bg-emerald-500/6",
    indigo: "border-indigo-500/18 bg-indigo-500/6",
};

const markerToneClasses: Record<GuideTone, string> = {
    neutral: "border-border/70 bg-background/70 text-foreground/70",
    blue: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
};

const iconToneClasses: Record<GuideTone, string> = {
    neutral: "text-foreground/55",
    blue: "text-sky-500",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    indigo: "text-indigo-500",
};

type GuideDialogProps = {
    children: React.ReactNode;
    className?: string;
};

export function GuideDialog({ children, className }: GuideDialogProps) {
    return (
        <DialogContent
            className={cn(
                editorLayout.dialogContent,
                "sm:max-w-6xl max-h-[95vh] overflow-y-auto custom-scrollbar",
                className
            )}
        >
            {children}
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
    description?: string;
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
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/72">{description}</p>
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
    description?: string;
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
        <article className={cn("h-full rounded-2xl border p-4 sm:p-5", panelToneClasses[tone], className)}>
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
                        <p className="mt-2 text-sm leading-relaxed text-foreground/72">{description}</p>
                    ) : null}
                </div>
            ) : null}
            {children ? <div className={cn(title || eyebrow || description ? "mt-4" : undefined)}>{children}</div> : null}
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
                        <li key={item.title} className="rounded-2xl border border-border/65 bg-background/50 p-4">
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
};

export function GuideCodeBlock({ label, value, helperText, action, tone = "neutral" }: GuideCodeBlockProps) {
    return (
        <div className={cn("h-full rounded-2xl border p-4 sm:p-5", panelToneClasses[tone])}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/46">{label}</p>
            <div className="mt-3 rounded-xl border border-border/70 bg-background/60 p-3.5">
                <code className="block break-all text-xs leading-relaxed text-foreground/78">{value}</code>
            </div>
            {helperText || action ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {helperText ? <p className="text-xs leading-relaxed text-foreground/58">{helperText}</p> : <span />}
                    {action}
                </div>
            ) : null}
        </div>
    );
}

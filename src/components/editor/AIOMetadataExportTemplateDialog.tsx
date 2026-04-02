"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { AIOMetadataExportTemplateDefinition } from "@/lib/aiometadata-export-settings";
import { cn } from "@/lib/utils";
import { editorAction, editorLayout, editorSurface } from "@/components/editor/ui/style-contract";
import { WandSparkles } from "lucide-react";

const formatSortSummary = (sort: string, direction?: "asc" | "desc") => {
    if (sort === "random") return "Randomized order";
    if (sort === "tmdbpopular" || sort === "popularity" || sort === "imdbpopular") return "Sort by popularity";
    if (sort === "released" || sort === "release_date") {
        if (direction === "desc") return "Sort by release date, oldest first";
        if (direction === "asc") return "Sort by release date, newest first";
        return "Sort by release date";
    }
    if (sort === "added") return "Sort by date added";

    return `Sort by ${sort}`;
};

const formatCatalogRuleLabels = (prefixes: string[] = [], names: string[] = []) => {
    const labels = [...prefixes, ...names].map((value) =>
        value
            .replace(/^\[[^\]]+\]\s*/u, "")
            .replace(/\s+\((Movies|Shows|All|Anime)\)\s*$/u, "")
            .trim()
    ).filter(Boolean);

    return Array.from(new Set(labels));
};

const formatRefreshSummary = (seconds: number) => {
    if (seconds % 3600 === 0) return `Refresh every ${seconds / 3600}h`;
    if (seconds % 60 === 0) return `Refresh every ${seconds / 60}m`;
    return `Refresh every ${seconds}s`;
};

export function AIOMetadataExportTemplateDialog({
    open,
    onOpenChange,
    template,
    onApply,
    description = "Use the predefined UME sorting settings.",
    dismissLabel = "Cancel",
    showApplyButton = true,
    applyLabel = "Apply UME Sorting",
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: AIOMetadataExportTemplateDefinition;
    onApply: () => void;
    description?: string;
    dismissLabel?: string;
    showApplyButton?: boolean;
    applyLabel?: string;
}) {
    const ruleSummaries = useMemo(() => {
        const groupedRules = new Map<string, {
            labels: Set<string>;
            summary: string;
            detail?: string;
        }>();

        template.rules.forEach((rule) => {
            if (rule.kind === "trakt-group" || rule.kind === "streaming-group" || rule.kind === "trakt-catalog") return;

            let labels: string[] = [];
            let summary = "";
            let detail: string | undefined;

            if (rule.kind === "mdblist-group") {
                const groupNames = (rule.match.widgetNames || []).filter((label) =>
                    !["Service", "Services", "Year", "Years", "Genre", "Director", "Actor", "Collection"].includes(label)
                );
                labels = groupNames.length > 0 ? groupNames : ["MDBList groups"];
                summary = formatSortSummary(rule.values.sort, rule.values.order);
                detail = formatRefreshSummary(rule.values.cacheTTL);
            } else if (rule.kind === "mdblist-catalog") {
                labels = formatCatalogRuleLabels(rule.match.namePrefixes, rule.match.names);
                if (labels.length === 0) {
                    labels = ["Named catalogs"];
                }
                summary = formatSortSummary(rule.values.sort, rule.values.order);
                detail = formatRefreshSummary(rule.values.cacheTTL);
            } else {
                labels = ["Watchlist"];
                summary = formatSortSummary(rule.values.sort, rule.values.sortDirection);
                detail = formatRefreshSummary(rule.values.cacheTTL);
            }

            const key = `${summary}__${detail ?? ""}`;
            const existing = groupedRules.get(key);

            if (existing) {
                labels.forEach((label) => existing.labels.add(label));
            } else {
                groupedRules.set(key, {
                    labels: new Set(labels),
                    summary,
                    detail,
                });
            }
        });

        return Array.from(groupedRules.values()).map((rule) => ({
            ...rule,
            labels: Array.from(rule.labels),
        }));
    }, [template]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(editorLayout.dialogContent, "p-5 sm:max-w-[40rem] sm:p-6")}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <WandSparkles className="h-5 w-5 text-primary" />
                        {template.label}
                    </DialogTitle>
                    {description ? (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                <div className="space-y-4 pt-1 sm:pt-2">
                    <div className={cn(editorSurface.panel, "space-y-3 rounded-2xl border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(246,249,252,0.48))] p-4 sm:p-5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(22,26,34,0.9),rgba(18,22,29,0.86))]")}>
                        <p className="text-sm font-semibold tracking-tight text-foreground">This will set the following AIOMetadata settings</p>
                        <div className="space-y-2.5">
                            {ruleSummaries.map((rule) => (
                                <div
                                    key={rule.labels.join("|")}
                                    className="rounded-xl border border-slate-200/70 bg-white/42 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] dark:border-white/8 dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                                >
                                    <div className="space-y-3.5 sm:grid sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-start sm:gap-4 sm:space-y-0">
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/42">
                                                Targets
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {rule.labels.map((label) => (
                                                    <span
                                                        key={label}
                                                        className="rounded-full border border-slate-200/70 px-2.5 py-1 text-sm font-medium text-foreground/78 dark:border-white/10"
                                                    >
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/42">
                                                Settings
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-foreground/76">{rule.summary}</p>
                                            {rule.detail ? (
                                                <p className="mt-1 text-xs text-foreground/54">{rule.detail}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <DialogFooter className="border-t border-border/60 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className={editorAction.secondary}
                        onClick={() => onOpenChange(false)}
                    >
                        {dismissLabel}
                    </Button>
                    {showApplyButton ? (
                        <Button
                            type="button"
                            className={editorAction.primary}
                            onClick={onApply}
                        >
                            {applyLabel}
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

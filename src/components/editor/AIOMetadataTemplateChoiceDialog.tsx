"use client";

import React from "react";
import { Download, FolderTree, Layers3, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { downloadTemplateFile } from "@/lib/template-download";
import { cn } from "@/lib/utils";
import { editorAction, editorSurface } from "@/components/editor/ui/style-contract";

type DownloadTemplateOption = {
    name: string;
    url: string;
};

type AIOMetadataTemplateChoiceDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fullTemplate: DownloadTemplateOption | null;
    catalogsTemplate: DownloadTemplateOption | null;
    onBusyChange?: (busy: boolean) => void;
    onError?: (message: string, error?: unknown) => void;
};

const optionCardClass =
    "rounded-[1.35rem] border px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-[border-color,background-color,box-shadow,opacity,transform] duration-200 ease-out";

export function AIOMetadataTemplateChoiceDialog({
    open,
    onOpenChange,
    fullTemplate,
    catalogsTemplate,
    onBusyChange,
    onError,
}: AIOMetadataTemplateChoiceDialogProps) {
    const reportError = (message: string, error: unknown) => {
        if (onError) {
            onError(message, error);
            return;
        }
        console.error(message, error);
    };

    const handleDownload = async (template: DownloadTemplateOption | null) => {
        if (!template?.url) {
            reportError("Template download is unavailable.", undefined);
            return;
        }

        onBusyChange?.(true);
        try {
            await downloadTemplateFile(template.url, template.name);
            onOpenChange(false);
        } catch (error) {
            reportError("Failed to download template.", error);
        } finally {
            onBusyChange?.(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[42rem]" showCloseButton={false}>
                <DialogHeader className="text-left">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2.5">
                            <DialogTitle className="flex items-center gap-2.5 text-[1.02rem] sm:text-[1.08rem]">
                                <Layers3 className="h-[1.15rem] w-[1.15rem] shrink-0 text-primary" />
                                <span className="truncate">UME AIOMetadata Template</span>
                            </DialogTitle>
                            <DialogDescription className="max-w-[35rem] text-[0.93rem] leading-6 text-foreground/62">
                                Use Full Template for first setup. For later updates use the Catalogs Only template, open AIOMetadata, go to{" "}
                                <strong>Catalogs</strong>, and tap <strong>Import Setup</strong>.
                            </DialogDescription>
                        </div>

                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-[1.05rem] border border-slate-200/78 bg-white/72 text-foreground/50 shadow-[0_6px_16px_rgba(15,23,42,0.05)] transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-slate-300/82 hover:bg-white/86 hover:text-foreground/72 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.03] dark:text-foreground/58 dark:shadow-none dark:hover:border-white/12 dark:hover:bg-white/[0.055] dark:hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className="space-y-3">
                    <div className={cn(editorSurface.inset, optionCardClass, "border-primary/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(239,246,255,0.52))]")}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[1rem] border border-sky-300/30 bg-sky-500/[0.06] text-sky-600 dark:border-sky-400/24 dark:bg-sky-400/10 dark:text-sky-300">
                                        <Sparkles className="size-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.98rem] font-semibold tracking-[-0.015em] text-foreground">Full Template</p>
                                        <p className="text-[0.78rem] font-medium uppercase tracking-[0.16em] text-sky-600/84 dark:text-sky-300/84">
                                            Initial setup
                                        </p>
                                    </div>
                                </div>
                                {fullTemplate?.name ? (
                                    <p className="pl-[3.2rem] text-[11px] leading-5 text-foreground/46">{fullTemplate.name}</p>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                onClick={() => handleDownload(fullTemplate)}
                                disabled={!fullTemplate?.url}
                                className={cn(editorAction.primary, "h-10 shrink-0 rounded-[1.05rem] px-4 text-[0.94rem] font-medium")}
                            >
                                Download
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className={cn(editorSurface.inset, optionCardClass, "border-amber-200/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,248,238,0.54))] dark:border-amber-400/18 dark:bg-[linear-gradient(180deg,rgba(31,24,14,0.5),rgba(22,18,11,0.42))]")}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[1rem] border border-amber-300/34 bg-amber-500/[0.06] text-amber-600 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-300">
                                        <FolderTree className="size-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.98rem] font-semibold tracking-[-0.015em] text-foreground">Catalogs Only</p>
                                        <p className="text-[0.78rem] font-medium uppercase tracking-[0.16em] text-amber-700/84 dark:text-amber-300/84">
                                            For updates
                                        </p>
                                    </div>
                                </div>
                                {catalogsTemplate?.name ? (
                                    <p className="pl-[3.2rem] text-[11px] leading-5 text-foreground/46">{catalogsTemplate.name}</p>
                                ) : null}
                            </div>
                            <Button
                                type="button"
                                onClick={() => handleDownload(catalogsTemplate)}
                                disabled={!catalogsTemplate?.url}
                                className={cn(editorAction.primary, "h-10 shrink-0 rounded-[1.05rem] px-4 text-[0.94rem] font-medium")}
                            >
                                Download
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

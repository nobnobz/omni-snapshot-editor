"use client";

import React from "react";
import { Check, Copy, Download, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogOverlay,
    DialogPortal,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { copyTemplateUrl, downloadTemplateFile } from "@/lib/template-download";
import { cn } from "@/lib/utils";
import { editorAction, editorSurface } from "@/components/editor/ui/style-contract";

type TemplateDownloadChoiceDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateName: string;
    templateUrl: string;
    onBusyChange?: (busy: boolean) => void;
    onError?: (message: string, error?: unknown) => void;
};

export function TemplateDownloadChoiceDialog({
    open,
    onOpenChange,
    templateName,
    templateUrl,
    onBusyChange,
    onError,
}: TemplateDownloadChoiceDialogProps) {
    const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle");

    React.useEffect(() => {
        if (!open) {
            setCopyState("idle");
        }
    }, [open]);

    const reportError = (message: string, error: unknown) => {
        if (onError) {
            onError(message, error);
            return;
        }
        console.error(message, error);
    };

    const handleCopyUrl = async () => {
        if (!templateUrl) {
            reportError("Template URL is unavailable.", undefined);
            return;
        }

        try {
            await copyTemplateUrl(templateUrl);
            setCopyState("copied");
            window.setTimeout(() => setCopyState("idle"), 1800);
        } catch (error) {
            reportError("Failed to copy template URL.", error);
        }
    };

    const handleDownload = async () => {
        if (!templateUrl) {
            reportError("Template URL is unavailable.", undefined);
            return;
        }

        onBusyChange?.(true);
        try {
            await downloadTemplateFile(templateUrl, templateName);
            onOpenChange(false);
        } catch (error) {
            reportError("Failed to download template.", error);
        } finally {
            onBusyChange?.(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="z-[88]" />
                <DialogContent className="z-[89] sm:max-w-[37rem]" showCloseButton={false}>
                    <DialogHeader className="text-left">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                                <DialogTitle className="flex items-center gap-2.5 text-[1.05rem] sm:text-[1.1rem]">
                                    <Link2 className="h-5 w-5 shrink-0 text-primary" />
                                    <span className="truncate">AIOStreams Template</span>
                                </DialogTitle>
                                <DialogDescription className="max-w-[30rem] text-[0.95rem] leading-7 text-foreground/62">
                                    You can either copy the raw GitHub URL directly into AIOStreams or download the JSON file manually.
                                </DialogDescription>
                            </div>

                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 rounded-[1.05rem] border border-white/8 bg-white/[0.03] text-foreground/58 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-white/12 hover:bg-white/[0.055] hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className={cn(editorSurface.inset, "rounded-[1.45rem] border-primary/14 px-5 py-4")}>
                            <p className="text-[0.95rem] font-semibold tracking-[-0.015em] text-foreground sm:text-[1rem]">{templateName}</p>
                            <p className="mt-2 break-all font-mono text-[10.5px] leading-6 text-foreground/50 sm:text-[11px]">
                                {templateUrl}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 border-t border-white/6 pt-5 sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyUrl}
                            disabled={!templateUrl}
                            className={cn(
                                editorAction.secondary,
                                editorSurface.field,
                                "h-11 min-w-[10.5rem] rounded-[1.05rem] border-white/10 bg-white/[0.02] px-4 text-[0.95rem] font-medium text-foreground/84 hover:bg-white/[0.045]"
                            )}
                        >
                            {copyState === "copied" ? "Copied" : "Copy URL"}
                            {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDownload}
                            disabled={!templateUrl}
                            className={cn(editorAction.primary, "h-11 min-w-[10.5rem] rounded-[1.05rem] px-5 text-[0.95rem] font-medium")}
                        >
                            Download
                            <Download className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

"use client";

import React from "react";
import { Check, Copy, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogOverlay,
    DialogPortal,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { copyTemplateUrl, downloadTemplateFile } from "@/lib/template-download";

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
                <DialogContent className="z-[89] sm:max-w-md">
                    <DialogHeader className="text-left">
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5 text-primary" />
                            AIOStreams Template
                        </DialogTitle>
                        <DialogDescription>
                            You can either copy the raw GitHub URL directly into AIOStreams or download the JSON file manually.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-2xl border border-primary/14 bg-primary/[0.04] p-3">
                            <p className="text-sm font-semibold text-foreground">{templateName}</p>
                            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-foreground/62">
                                {templateUrl}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="outline" onClick={handleCopyUrl} disabled={!templateUrl}>
                            {copyState === "copied" ? "Copied" : "Copy URL"}
                            {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button type="button" onClick={handleDownload} disabled={!templateUrl}>
                            Download
                            <Download className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

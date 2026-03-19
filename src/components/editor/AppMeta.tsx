"use client";

import type { ReactNode } from "react";
import { Github } from "lucide-react";
import { APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AppMetaProps = {
    align?: "start" | "center";
    className?: string;
    mode?: "default" | "stacked";
    showGitHub?: boolean;
    trailing?: ReactNode;
};

export function AppMeta({
    align = "center",
    className,
    mode = "default",
    showGitHub = false,
    trailing,
}: AppMetaProps) {
    const isCentered = align === "center";
    const isStacked = mode === "stacked";

    return (
        <div className={cn("space-y-2.5", className)}>
            {(showGitHub || trailing) && (
                <div className={cn("flex items-center gap-3", isCentered ? "justify-center" : "justify-between")}>
                    {showGitHub ? (
                        <a
                            href="https://github.com/nobnobz/omni-snapshot-editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/56 transition-colors hover:text-foreground"
                        >
                            <Github className="h-3.5 w-3.5" />
                            GitHub
                        </a>
                    ) : (
                        <span />
                    )}
                    {trailing}
                </div>
            )}

            <div className={cn(isCentered ? "text-center" : "text-left")}>
                <div className={cn("space-y-0.5", !isStacked && "sm:hidden")}>
                    <p className="text-[10px] font-medium text-foreground/42">v{APP_VERSION}</p>
                    <p className="text-[10px] text-foreground/42">Bot-Bid-Raiser</p>
                    <p className="text-[10px] text-foreground/36">Built with Antigravity</p>
                </div>

                {!isStacked && (
                    <div
                        className={cn(
                            "hidden flex-wrap items-center gap-2 text-[11px] text-foreground/40 sm:flex",
                            isCentered ? "justify-center" : "justify-start"
                        )}
                    >
                        <span className="font-mono text-foreground/42">v{APP_VERSION}</span>
                        <span className="h-1 w-1 rounded-full bg-foreground/16" />
                        <span>Bot-Bid-Raiser</span>
                        <span className="h-1 w-1 rounded-full bg-foreground/16" />
                        <span>Built with Antigravity</span>
                    </div>
                )}
            </div>
        </div>
    );
}

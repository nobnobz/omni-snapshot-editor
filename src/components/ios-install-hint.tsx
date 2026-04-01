"use client";

import { useState } from "react";
import { PlusSquare, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_STORAGE_KEY = "omni_ios_install_hint_dismissed_until";
const DISMISS_DAYS = 30;

type NavigatorWithStandalone = Navigator & {
    standalone?: boolean;
};

function isIosPhoneSafari(): boolean {
    const ua = navigator.userAgent;
    const isIphoneOrIpod = /iPhone|iPod/i.test(ua);
    if (!isIphoneOrIpod) return false;

    // Show only in Safari where "Add to Home Screen" is consistently available.
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
    if (!isSafari) return false;

    // Guard against desktop-like environments.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    return isTouch;
}

function isStandaloneMode(): boolean {
    const nav = navigator as NavigatorWithStandalone;
    const standaloneViaNavigator = Boolean(nav.standalone);
    const standaloneViaMediaQuery = window.matchMedia("(display-mode: standalone)").matches;
    return standaloneViaNavigator || standaloneViaMediaQuery;
}

function isDismissed(): boolean {
    try {
        const until = Number(localStorage.getItem(DISMISS_STORAGE_KEY));
        return Number.isFinite(until) && until > Date.now();
    } catch {
        return false;
    }
}

type IosInstallHintProps = {
    avoidBottomDock?: boolean;
};

export function IosInstallHint({ avoidBottomDock = false }: IosInstallHintProps) {
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
            return false;
        }
        return isIosPhoneSafari() && !isStandaloneMode() && !isDismissed();
    });

    const dismiss = () => {
        try {
            const dismissedUntil = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
            localStorage.setItem(DISMISS_STORAGE_KEY, String(dismissedUntil));
        } catch {
            // Ignore storage failures and just hide for this session.
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className={cn(
                "fixed inset-x-3 z-[70] pb-safe sm:hidden",
                avoidBottomDock
                    ? "bottom-[calc(5.4rem+env(safe-area-inset-bottom))]"
                    : "bottom-3"
            )}
        >
            <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur">
                <div className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary">
                        <Share className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">Install on your iPhone</p>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                            Open <strong>Share</strong>, then tap <strong>Add to Home Screen</strong> to launch Omni Snapshot Manager like an app.
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-foreground/70">
                            <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/50 px-2 py-1">
                                <Share className="h-3 w-3" />
                                Share
                            </span>
                            <span>→</span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/50 px-2 py-1">
                                <PlusSquare className="h-3 w-3" />
                                Add to Home Screen
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={dismiss}
                        className="h-8 w-8 shrink-0 text-foreground/70 hover:text-foreground hover:bg-accent/70 dark:hover:bg-accent/55"
                        aria-label="Dismiss install hint"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

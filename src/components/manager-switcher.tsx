"use client";

import * as React from "react";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ManagerId = "fusion" | "omni";

type ManagerSwitcherProps = {
    currentManager: ManagerId;
    className?: string;
    align?: "start" | "center" | "end";
};

const managers: Record<
    ManagerId,
    {
        id: ManagerId;
        name: string;
        shortName: string;
        description: string;
        href: string;
    }
> = {
    fusion: {
        id: "fusion",
        name: "Fusion Widget Manager",
        shortName: "Fusion",
        description: "Create and edit Fusion widget exports.",
        href: "https://nobnobz.github.io/fusion-widget-manager/",
    },
    omni: {
        id: "omni",
        name: "Omni Snapshot Manager",
        shortName: "Omni",
        description: "Import, build, and export Omni snapshots.",
        href: "https://nobnobz.github.io/omni-snapshot-editor/",
    },
};

export function ManagerSwitcher({
    currentManager,
    className,
    align = "start",
}: ManagerSwitcherProps) {
    const [open, setOpen] = React.useState(false);
    const current = managers[currentManager];
    const orderedManagers = [
        managers[currentManager],
        ...Object.values(managers).filter((manager) => manager.id !== currentManager),
    ];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Switch manager"
                    className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-[1.2rem] border border-slate-200/76 bg-white/70 px-3 text-left text-[13px] font-medium text-foreground/68 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-out hover:-translate-y-px hover:border-slate-300/84 hover:bg-white/82 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground/76 dark:hover:border-white/14 dark:hover:bg-white/[0.08] dark:hover:text-foreground sm:h-11 sm:px-3.5 sm:text-[14px]",
                        className
                    )}
                >
                    <span className="truncate leading-none">{current.shortName}</span>
                    <ChevronDown
                        className={cn(
                            "size-3 shrink-0 text-foreground/36 transition-[color,transform] duration-200 ease-out",
                            open && "rotate-180 text-primary/78"
                        )}
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                sideOffset={10}
                className="w-[290px] rounded-[1.55rem] border border-slate-200/86 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,253,0.94))] p-2 shadow-[0_24px_54px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,15,22,0.96),rgba(9,12,18,0.98))] dark:shadow-[0_24px_56px_rgba(2,6,23,0.46)]"
            >
                <div className="px-2.5 pb-2 pt-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/42">
                        Switch Manager
                    </p>
                </div>

                <div className="space-y-1">
                    {orderedManagers.map((manager) => {
                        const isCurrent = manager.id === currentManager;

                        if (isCurrent) {
                            return (
                                <div
                                    key={manager.id}
                                    className="flex items-start gap-3 rounded-[1.2rem] border border-primary/14 bg-primary/[0.06] px-3.5 py-3 dark:border-primary/16 dark:bg-primary/[0.1]"
                                >
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[1rem] border border-primary/14 bg-white/72 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] dark:border-primary/16 dark:bg-white/[0.06]">
                                        <Check className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                                                {manager.name}
                                            </span>
                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                                                Current
                                            </span>
                                        </div>
                                        <p className="pt-1 text-[11px] leading-5 text-foreground/58 dark:text-foreground/66">
                                            {manager.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <DropdownMenuItem
                                key={manager.id}
                                asChild
                                className="rounded-[1.2rem] px-0 py-0 focus:bg-transparent dark:focus:bg-transparent"
                            >
                                <a
                                    href={manager.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-3 rounded-[1.2rem] px-3.5 py-3 transition-[background-color,color,transform] duration-150 ease-out hover:bg-black/[0.03] hover:text-foreground dark:hover:bg-white/[0.04]"
                                >
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[1rem] border border-slate-200/84 bg-white/72 text-foreground/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] dark:border-white/10 dark:bg-white/[0.04] dark:text-foreground/66">
                                        <ArrowUpRight className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-semibold tracking-tight text-foreground">
                                            {manager.name}
                                        </div>
                                        <p className="pt-1 text-[11px] leading-5 text-foreground/58 dark:text-foreground/66">
                                            {manager.description}
                                        </p>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

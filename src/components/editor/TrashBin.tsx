"use client";

import React, { useState } from "react";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, XCircle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { editorSurface } from "@/components/editor/ui/style-contract";
import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type DeletedMainGroupItem = {
    uuid: string;
    name: string;
    subgroupNames?: string[];
    deletedAt: string;
    imageUrl?: string;
    type: "Main Group";
};

type DeletedSubgroupItem = {
    name: string;
    parentName?: string;
    catalogs?: string[];
    deletedAt: string;
    imageUrl?: string;
    type: "Subgroup";
};

type DeletedItem = DeletedMainGroupItem | DeletedSubgroupItem;

export function TrashBin() {
    const deletedSubgroups = useConfigSelector((state) => state.deletedSubgroups);
    const deletedMainGroups = useConfigSelector((state) => state.deletedMainGroups);
    const [isOpen, setIsOpen] = useState(false);
    const { restoreSubgroup, restoreMainGroup, clearDeletedSubgroups } = useConfigActions();

    if (deletedSubgroups.length === 0 && deletedMainGroups.length === 0) return null;

    const mainGroupItems = deletedMainGroups as Omit<DeletedMainGroupItem, "type">[];
    const subgroupItems = deletedSubgroups as Omit<DeletedSubgroupItem, "type">[];

    const allDeleted: DeletedItem[] = [
        ...mainGroupItems.map(g => ({ ...g, type: "Main Group" as const })),
        ...subgroupItems.map(s => ({ ...s, type: "Subgroup" as const }))
    ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    return (
        <div className={cn(editorSurface.card, "mt-8 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300")}>
            <div className="p-4 sm:p-5">
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="mb-4 flex w-full items-start justify-between gap-3 rounded-xl text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        aria-expanded={isOpen}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Recycle Bin</h3>
                                <p className="text-sm text-foreground/70">Deleted groups can be restored here.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-semibold text-foreground/70">
                                {allDeleted.length}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/55">
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${!isOpen ? "-rotate-90" : ""}`} />
                            </span>
                        </div>
                    </button>

                {isOpen && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="mb-4 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearDeletedSubgroups}
                                className={cn("h-9 text-xs px-3 gap-2 border border-transparent", editorHover.iconDanger)}
                            >
                                <Trash2 className="w-4 h-4" /> Delete All
                            </Button>
                        </div>
                        <Accordion type="single" collapsible className="space-y-1">
                            {allDeleted.map((item, idx) => (
                        <AccordionItem
                            key={`${item.name}-${item.deletedAt}`}
                            value={`deleted-${idx}`}
                            className={`${editorSurface.cardInteractive} group/item flex flex-col rounded-xl overflow-hidden transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out hover:border-border/80 w-full mb-3 shadow-sm border`}
                        >
                            <div className="flex items-center justify-between p-3 gap-4 group">
                                <AccordionTrigger className="flex-1 min-w-0 py-1.5 px-1 hover:no-underline [&>svg]:hidden [&[data-state=open]>.chevron]:rotate-90">
                                    <div className="flex items-center gap-3 text-left">
                                        <ChevronRight className="chevron h-4 w-4 shrink-0 text-foreground/50 transition-transform duration-200" />
                                        <span className="font-medium text-sm text-foreground transition-colors group-hover/item:text-primary">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 bg-muted/50 border border-border/50 rounded px-1.5 py-0.5">
                                                {item.type}
                                            </span>
                                            {item.type === 'Subgroup' && (
                                                <span className="text-[10px] sm:text-xs text-foreground/50">
                                                    in <span className="text-foreground/70">{item.parentName}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        item.type === 'Main Group' ? restoreMainGroup(item) : restoreSubgroup(item);
                                    }}
                                    className="h-7 px-3 text-xs font-semibold tracking-tight border-border/50 text-foreground/70 bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors gap-1.5 z-10 shrink-0"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                                </Button>
                            </div>
                            <AccordionContent className="px-12 pb-5 pt-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-foreground/70 uppercase font-bold tracking-widest">
                                            <Info className="w-3 h-3" /> Details
                                        </div>
                                        <div className="bg-background/50 rounded p-3 border border-border/50 text-xs space-y-1">
                                            <div>
                                                <span className="text-foreground/70 italic">{item.type === 'Main Group' ? 'Subgroups' : 'Catalogs'}:</span>{' '}
                                                {item.type === 'Main Group' ? item.subgroupNames?.length : item.catalogs?.length}
                                            </div>
                                            {item.imageUrl && (
                                                <div className="truncate"><span className="text-foreground/70 italic">Image:</span> {item.imageUrl}</div>
                                            )}
                                            <div className="text-xs text-foreground/70 pt-1">
                                                Deleted at: {new Date(item.deletedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    {item.imageUrl && (
                                        <div className="space-y-2">
                                            <div className="text-xs text-foreground/70 uppercase font-bold tracking-widest">Preview</div>
                                            <div className="relative aspect-video rounded border border-border overflow-hidden bg-background flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element -- Remote user image preview with direct onError fallback replacement. */}
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/171717/white?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
}

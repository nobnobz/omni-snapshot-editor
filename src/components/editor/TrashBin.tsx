"use client";

import React from "react";
import { useConfigActions, useConfigSelector } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, XCircle, Info } from "lucide-react";
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
    const { restoreSubgroup, restoreMainGroup, clearDeletedSubgroups } = useConfigActions();

    if (deletedSubgroups.length === 0 && deletedMainGroups.length === 0) return null;

    const mainGroupItems = deletedMainGroups as Omit<DeletedMainGroupItem, "type">[];
    const subgroupItems = deletedSubgroups as Omit<DeletedSubgroupItem, "type">[];

    const allDeleted: DeletedItem[] = [
        ...mainGroupItems.map(g => ({ ...g, type: "Main Group" as const })),
        ...subgroupItems.map(s => ({ ...s, type: "Subgroup" as const }))
    ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    return (
        <div className="mt-8 border border-border rounded-xl bg-card/20 overflow-hidden shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 sm:p-5 bg-muted/5">
                <div className="flex items-start justify-between gap-3 mb-4">
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
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearDeletedSubgroups}
                            className="h-9 text-foreground/70 hover:text-red-400 hover:bg-red-500/10 text-sm gap-2"
                        >
                            <XCircle className="w-4 h-4" /> Clear Trash
                        </Button>
                    </div>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                    {allDeleted.map((item, idx) => (
                        <AccordionItem
                            key={`${item.name}-${item.deletedAt}`}
                            value={`deleted-${idx}`}
                            className="border border-border/80 bg-card rounded-lg overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <AccordionTrigger className="p-0 [&>svg]:hidden flex items-center gap-2">
                                        <Badge variant="outline" className={`text-xs uppercase tracking-tighter bg-muted/50 border-border ${item.type === 'Main Group' ? 'text-primary border-primary/40' : 'text-foreground/70'}`}>
                                            {item.type}
                                        </Badge>
                                        <span className="font-semibold text-foreground">{item.name}</span>
                                    </AccordionTrigger>
                                    {item.type === 'Subgroup' && (
                                        <span className="text-xs text-foreground/70">
                                            was in <span className="text-foreground/70">{item.parentName}</span>
                                        </span>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => item.type === 'Main Group' ? restoreMainGroup(item) : restoreSubgroup(item)}
                                    className="h-9 bg-primary hover:bg-primary/92 text-primary-foreground text-sm gap-2 shadow-lg shadow-primary/20"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                                </Button>
                            </div>
                            <AccordionContent className="px-4 pb-4 pt-0">
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
        </div>
    );
}

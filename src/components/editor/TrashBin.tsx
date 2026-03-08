"use client";

import React from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, XCircle, Info } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function TrashBin() {
    const { deletedSubgroups, deletedMainGroups, restoreSubgroup, restoreMainGroup, clearDeletedSubgroups } = useConfig();

    if (deletedSubgroups.length === 0 && deletedMainGroups.length === 0) return null;

    const allDeleted = [
        ...deletedMainGroups.map(g => ({ ...g, type: 'Main Group' as const })),
        ...deletedSubgroups.map(s => ({ ...s, type: 'Subgroup' as const }))
    ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    return (
        <div className="mt-12 border-t border-neutral-800 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-red-500/10 p-2 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-200">Recycle Bin</h3>
                        <p className="text-sm text-neutral-500">Recently removed groups can be restored here.</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDeletedSubgroups}
                    className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 text-xs gap-2"
                >
                    <XCircle className="w-4 h-4" /> Clear Trash
                </Button>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
                {allDeleted.map((item, idx) => (
                    <AccordionItem
                        key={`${item.name}-${item.deletedAt}`}
                        value={`deleted-${idx}`}
                        className="border border-neutral-800 bg-neutral-900/40 rounded-lg overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <AccordionTrigger className="p-0 hover:no-underline [&>svg]:hidden flex items-center gap-2">
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-tighter bg-neutral-800/50 border-neutral-700 ${item.type === 'Main Group' ? 'text-blue-400 border-blue-900/50' : 'text-neutral-400'}`}>
                                        {item.type}
                                    </Badge>
                                    <span className="font-semibold text-neutral-300">{item.name}</span>
                                </AccordionTrigger>
                                {item.type === 'Subgroup' && (
                                    <span className="text-xs text-neutral-600">
                                        was in <span className="text-neutral-400">{(item as any).parentName}</span>
                                    </span>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={() => item.type === 'Main Group' ? restoreMainGroup(item) : restoreSubgroup(item)}
                                className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </Button>
                        </div>
                        <AccordionContent className="px-4 pb-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                                        <Info className="w-3 h-3" /> Details
                                    </div>
                                    <div className="bg-neutral-950/50 rounded p-3 border border-neutral-800/50 text-xs space-y-1">
                                        <div>
                                            <span className="text-neutral-500 italic">{item.type === 'Main Group' ? 'Subgroups' : 'Catalogs'}:</span>{' '}
                                            {item.type === 'Main Group' ? (item as any).subgroupNames?.length : (item as any).catalogs?.length}
                                        </div>
                                        {(item as any).imageUrl && (
                                            <div className="truncate"><span className="text-neutral-500 italic">Image:</span> {(item as any).imageUrl}</div>
                                        )}
                                        <div className="text-[10px] text-neutral-600 pt-1">
                                            Deleted at: {new Date(item.deletedAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                {(item as any).imageUrl && (
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Preview</div>
                                        <div className="relative aspect-video rounded border border-neutral-800 overflow-hidden bg-neutral-950 flex items-center justify-center">
                                            <img
                                                src={(item as any).imageUrl}
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
    );
}


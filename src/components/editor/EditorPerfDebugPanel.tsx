"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERF_UPDATE_EVENT, getPerfSamples, isPerfDebugEnabled, type PerfSample } from "@/lib/perf";

export function EditorPerfDebugPanel() {
    const [samples, setSamples] = React.useState<PerfSample[]>([]);

    React.useEffect(() => {
        if (!isPerfDebugEnabled() || typeof window === "undefined") return;

        const sync = () => setSamples(getPerfSamples());
        sync();
        window.addEventListener(PERF_UPDATE_EVENT, sync as EventListener);
        return () => window.removeEventListener(PERF_UPDATE_EVENT, sync as EventListener);
    }, []);

    if (!isPerfDebugEnabled()) return null;

    const latest = [...samples].slice(-8).reverse();

    return (
        <aside className="fixed bottom-4 right-4 z-[120] w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[rgba(10,14,22,0.92)] p-3 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Perf Debug</p>
                    <p className="text-[11px] text-white/45">{samples.length} samples</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => {
                        if (typeof window !== "undefined" && window.__omniPerf) {
                            window.__omniPerf.samples = [];
                        }
                        setSamples([]);
                    }}
                >
                    Clear
                </Button>
            </div>
            <div className="space-y-1.5">
                {latest.length === 0 ? (
                    <p className="text-xs text-white/45">No samples yet.</p>
                ) : latest.map((sample) => (
                    <div key={`${sample.at}-${sample.name}`} className="rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-semibold text-white/88">{sample.name}</p>
                            <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/10 text-[10px] text-cyan-100">
                                {sample.durationMs} ms
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}

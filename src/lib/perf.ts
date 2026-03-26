"use client";

export type PerfSample = {
    name: string;
    durationMs: number;
    at: string;
    detail?: Record<string, unknown>;
};

type PerfStore = {
    samples: PerfSample[];
};

declare global {
    interface Window {
        __omniPerf?: PerfStore;
    }
}

const PERF_EVENT_NAME = "omni-perf-update";
const MAX_SAMPLES = 200;

export const isPerfDebugEnabled = () =>
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_EDITOR_DEBUG_PERF === "1";

export const getPerfSamples = (): PerfSample[] =>
    typeof window === "undefined" ? [] : window.__omniPerf?.samples ?? [];

export const recordPerfSample = (sample: PerfSample) => {
    if (typeof window === "undefined" || !isPerfDebugEnabled()) return;

    const store = window.__omniPerf ?? { samples: [] };
    store.samples = [...store.samples, sample].slice(-MAX_SAMPLES);
    window.__omniPerf = store;
    window.dispatchEvent(new CustomEvent(PERF_EVENT_NAME, { detail: sample }));
};

export const measureSync = <T,>(
    name: string,
    fn: () => T,
    detail?: Record<string, unknown>,
): T => {
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
        return fn();
    } finally {
        const end = typeof performance !== "undefined" ? performance.now() : Date.now();
        recordPerfSample({
            name,
            durationMs: Number((end - start).toFixed(2)),
            at: new Date().toISOString(),
            detail,
        });
    }
};

export const measureAsync = async <T,>(
    name: string,
    fn: () => Promise<T>,
    detail?: Record<string, unknown>,
): Promise<T> => {
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    try {
        return await fn();
    } finally {
        const end = typeof performance !== "undefined" ? performance.now() : Date.now();
        recordPerfSample({
            name,
            durationMs: Number((end - start).toFixed(2)),
            at: new Date().toISOString(),
            detail,
        });
    }
};

export const PERF_UPDATE_EVENT = PERF_EVENT_NAME;

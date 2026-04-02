export class RemoteFetchError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = "RemoteFetchError";
    }
}

export class RemoteTimeoutError extends Error {
    constructor(message = "The request timed out.") {
        super(message);
        this.name = "RemoteTimeoutError";
    }
}

export class RemotePayloadTooLargeError extends Error {
    constructor(message = "The remote payload is too large.") {
        super(message);
        this.name = "RemotePayloadTooLargeError";
    }
}

export class RemoteFormatError extends Error {
    constructor(message = "The remote response is not in the expected format.") {
        super(message);
        this.name = "RemoteFormatError";
    }
}

type FetchWithLimitsOptions = {
    timeoutMs: number;
    maxBytes: number;
    signal?: AbortSignal;
    headers?: HeadersInit;
    method?: string;
    body?: BodyInit | null;
};

const mergeAbortSignals = (signals: Array<AbortSignal | undefined>) => {
    const availableSignals = signals.filter((signal): signal is AbortSignal => !!signal);
    if (availableSignals.length === 0) {
        return { signal: undefined, cleanup: () => {} };
    }

    const controller = new AbortController();
    const abort = () => controller.abort();

    availableSignals.forEach((signal) => {
        if (signal.aborted) {
            abort();
            return;
        }
        signal.addEventListener("abort", abort, { once: true });
    });

    return {
        signal: controller.signal,
        cleanup: () => {
            availableSignals.forEach((signal) => signal.removeEventListener("abort", abort));
        },
    };
};

const decodeTextResponse = async (response: Response, maxBytes: number) => {
    const contentLength = response.headers && typeof response.headers.get === "function"
        ? response.headers.get("content-length")
        : null;
    if (contentLength) {
        const parsedLength = Number(contentLength);
        if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
            throw new RemotePayloadTooLargeError();
        }
    }

    if (!response.body || typeof response.body.getReader !== "function") {
        const text = await response.text();
        const size = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(text).length : text.length;
        if (size > maxBytes) throw new RemotePayloadTooLargeError();
        return text;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
            await reader.cancel();
            throw new RemotePayloadTooLargeError();
        }
        chunks.push(value);
    }

    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    chunks.forEach((chunk) => {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    });

    return new TextDecoder("utf-8").decode(merged);
};

export const fetchTextWithLimits = async (
    url: string,
    { timeoutMs, maxBytes, signal, headers, method, body }: FetchWithLimitsOptions,
) => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
    const merged = mergeAbortSignals([signal, timeoutController.signal]);

    try {
        const response = await fetch(url, {
            signal: merged.signal,
            headers,
            method,
            body,
        });

        if (!response.ok) {
            throw new RemoteFetchError(`Request failed with status ${response.status}.`, response.status);
        }

        return await decodeTextResponse(response, maxBytes);
    } catch (error) {
        if (timeoutController.signal.aborted) {
            throw new RemoteTimeoutError();
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        merged.cleanup();
    }
};

export const fetchJsonWithLimits = async <T = unknown>(
    url: string,
    { timeoutMs, maxBytes, signal, headers, method, body }: FetchWithLimitsOptions,
): Promise<T> => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
    const merged = mergeAbortSignals([signal, timeoutController.signal]);

    try {
        const response = await fetch(url, {
            signal: merged.signal,
            headers,
            method,
            body,
        });

        if (!response.ok) {
            throw new RemoteFetchError(`Request failed with status ${response.status}.`, response.status);
        }

        const contentLength = response.headers && typeof response.headers.get === "function"
            ? response.headers.get("content-length")
            : null;
        if (contentLength) {
            const parsedLength = Number(contentLength);
            if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
                throw new RemotePayloadTooLargeError();
            }
        }

        if (typeof response.json === "function") {
            return await response.json() as T;
        }

        const text = await decodeTextResponse(response, maxBytes);
        try {
            return JSON.parse(text) as T;
        } catch {
            throw new RemoteFormatError("The remote response is not valid JSON.");
        }
    } catch (error) {
        if (timeoutController.signal.aborted) {
            throw new RemoteTimeoutError();
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        merged.cleanup();
    }
};

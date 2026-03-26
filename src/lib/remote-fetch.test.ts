import { afterEach, describe, expect, it, vi } from "vitest";
import {
    fetchJsonWithLimits,
    fetchTextWithLimits,
    RemoteFormatError,
    RemotePayloadTooLargeError,
} from "./remote-fetch";

const mockFetch = vi.fn<typeof fetch>();
global.fetch = mockFetch;

afterEach(() => {
    mockFetch.mockReset();
});

describe("remote-fetch", () => {
    it("reads JSON payloads within limits", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => "24" },
            json: async () => ({ ok: true }),
        } as unknown as Response);

        await expect(fetchJsonWithLimits("https://example.com/data.json", {
            timeoutMs: 1000,
            maxBytes: 1024,
        })).resolves.toEqual({ ok: true });
    });

    it("rejects oversized text payloads before reading", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => "4096" },
            text: async () => "too-large",
        } as unknown as Response);

        await expect(fetchTextWithLimits("https://example.com/text", {
            timeoutMs: 1000,
            maxBytes: 128,
        })).rejects.toBeInstanceOf(RemotePayloadTooLargeError);
    });

    it("rejects invalid JSON text", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            headers: { get: () => null },
            json: undefined,
            text: async () => "not-json",
        } as unknown as Response);

        await expect(fetchJsonWithLimits("https://example.com/bad.json", {
            timeoutMs: 1000,
            maxBytes: 1024,
        })).rejects.toBeInstanceOf(RemoteFormatError);
    });
});

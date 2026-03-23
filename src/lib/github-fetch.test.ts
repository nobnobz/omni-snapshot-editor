import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGithubTemplates } from "./github-fetch";

const mockFetch = vi.fn<typeof fetch>();

global.fetch = mockFetch;

const buildTreeItem = (path: string) => ({
    path,
    mode: "100644",
    type: "blob" as const,
    sha: "abc123",
    size: 123,
    url: `https://api.github.com/repos/example/${path}`,
});

afterEach(() => {
    mockFetch.mockReset();
});

describe("fetchGithubTemplates", () => {
    it("marks the newest Omni template as default even when an older root file exists", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                tree: [
                    buildTreeItem("ume-omni-template-v1.7.json"),
                    buildTreeItem("archive/ume-omni-template-v2.0.3.json"),
                ],
            }),
        } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(templates[0]).toEqual(
            expect.objectContaining({
                id: "archive/ume-omni-template-v2.0.3.json",
                version: "v2.0.3",
                isDefault: true,
            }),
        );
        expect(templates[1]).toEqual(
            expect.objectContaining({
                id: "ume-omni-template-v1.7.json",
                version: "v1.7",
            }),
        );
    });

    it("prefers the version declared inside AIOStreams templates over the filename", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tree: [buildTreeItem("ume-aiostreams-template-v9.9.9.json")],
                }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    version: "2.1.1",
                }),
            } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(templates).toEqual([
            expect.objectContaining({
                id: "ume-aiostreams-template-v9.9.9.json",
                name: "UME AIOStreams Template 2.1.1",
                version: "2.1.1",
            }),
        ]);
    });

    it("falls back to reading the version from raw text when the template is not strict JSON", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tree: [buildTreeItem("ume-aiostreams-template-v1.7.json")],
                }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                text: async () => '{\n  "name": "AIOStreams",\n  "version": "2.1.1",\n}',
            } as Response);

        const templates = await fetchGithubTemplates();

        expect(templates).toEqual([
            expect.objectContaining({
                id: "ume-aiostreams-template-v1.7.json",
                name: "UME AIOStreams Template 2.1.1",
                version: "2.1.1",
            }),
        ]);
    });

    it("keeps filename-based versions for non-AIOStreams templates", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                tree: [buildTreeItem("ume-omni-template-v2.0.3.json")],
            }),
        } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(templates).toEqual([
            expect.objectContaining({
                id: "ume-omni-template-v2.0.3.json",
                name: "UME Omni Template v2.0.3",
                version: "v2.0.3",
            }),
        ]);
    });
});

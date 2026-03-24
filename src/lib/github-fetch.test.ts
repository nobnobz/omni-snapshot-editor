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
    it("prefers a published template manifest when available", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                generatedAt: "2026-03-24T18:00:00Z",
                templates: [
                    {
                        id: "ume-omni-template-v2.2.json",
                        name: "UME Omni Template v2.2",
                        url: "https://raw.githubusercontent.com/example/ume-omni-template-v2.2.json",
                        version: "v2.2",
                        isDefault: true,
                    },
                    {
                        id: "ume-aiometadata-config-v2.2.json",
                        name: "UME AIOMetadata Template v2.2",
                        url: "https://raw.githubusercontent.com/example/ume-aiometadata-config-v2.2.json",
                        version: "v2.2",
                    },
                ],
            }),
        } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(templates).toEqual([
            expect.objectContaining({
                id: "ume-omni-template-v2.2.json",
                isDefault: true,
            }),
            expect.objectContaining({
                id: "ume-aiometadata-config-v2.2.json",
            }),
        ]);
    });

    it("marks the newest Omni template as default even when an older root file exists", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tree: [
                        buildTreeItem("ume-omni-template-v1.7.json"),
                        buildTreeItem("archive/ume-omni-template-v2.0.3.json"),
                    ],
                }),
            } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(2);
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
                ok: false,
                status: 404,
            } as Response)
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

        expect(mockFetch).toHaveBeenCalledTimes(3);
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
                ok: false,
                status: 404,
            } as Response)
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
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    tree: [buildTreeItem("ume-omni-template-v2.0.3.json")],
                }),
            } as Response);

        const templates = await fetchGithubTemplates();

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(templates).toEqual([
            expect.objectContaining({
                id: "ume-omni-template-v2.0.3.json",
                name: "UME Omni Template v2.0.3",
                version: "v2.0.3",
            }),
        ]);
    });

    it("falls back to the baked-in template URLs when the GitHub tree request fails", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response)
            .mockResolvedValueOnce({
                ok: false,
                status: 403,
            } as Response);

        const templates = await fetchGithubTemplates();

        expect(templates).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "fallback/ume-omni-template-v2.1.json",
                    name: "UME Omni Template v2.1",
                    isDefault: true,
                }),
                expect.objectContaining({
                    id: "fallback/ume-aiometadata-config-v2.1.json",
                    name: "UME AIOMetadata Template v2.1",
                }),
                expect.objectContaining({
                    id: "fallback/ume-aiometadata-catalogs-only-v2.1..json",
                    name: "UME AIOMetadata (Catalogs Only) v2.1",
                }),
                expect.objectContaining({
                    id: "fallback/ume-aiostreams-template-v1.7.json",
                    name: "UME AIOStreams Template v1.7",
                }),
            ]),
        );
    });
});

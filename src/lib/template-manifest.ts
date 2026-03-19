import type { TemplateManifest } from "@/context/ConfigContext";

export type TemplateEntry = TemplateManifest["templates"][number];
export type TemplateKind = "omni" | "aiometadata" | "catalogs" | "aiostreams";

const TEMPLATE_KIND_MATCHERS: Record<TemplateKind, { include: string[]; exclude?: string[] }> = {
    omni: {
        include: ["ume-omni-template", "omni-snapshot"],
    },
    aiometadata: {
        include: ["ume-aiometadata", "aiometadata"],
        exclude: ["ume-catalogs", "catalogs-only", "aiometadata-catalogs"],
    },
    catalogs: {
        include: ["ume-catalogs", "catalogs-only", "aiometadata-catalogs"],
    },
    aiostreams: {
        include: ["ume-aiostreams", "aiostreams"],
    },
};

export const FALLBACK_TEMPLATE_URLS: Record<TemplateKind, string> = {
    omni: "https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/ume-omni-template-v2.0.3.json",
    aiometadata: "",
    catalogs: "",
    aiostreams: "",
};

const buildTemplateHaystack = (value: string) => value.toLowerCase();

export function matchesTemplateKind(value: string, kind: TemplateKind): boolean {
    const haystack = buildTemplateHaystack(value);
    const matcher = TEMPLATE_KIND_MATCHERS[kind];
    const hasInclude = matcher.include.some((pattern) => haystack.includes(pattern));
    const hasExclude = matcher.exclude?.some((pattern) => haystack.includes(pattern)) ?? false;
    return hasInclude && !hasExclude;
}

export function isTemplateOfKind(template: Pick<TemplateEntry, "id" | "name">, kind: TemplateKind): boolean {
    return matchesTemplateKind(`${template.id} ${template.name}`, kind);
}

export function findTemplateByKind(templates: TemplateEntry[] | undefined, kind: TemplateKind): TemplateEntry | null {
    return templates?.find((template) => isTemplateOfKind(template, kind)) ?? null;
}

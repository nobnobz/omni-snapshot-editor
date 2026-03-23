import { TemplateManifest } from "../context/ConfigContext";
import { getTemplateDisplay } from "./template-display";
import { matchesTemplateKind } from "./template-manifest";

const OWNER = "nobnobz";
const REPO = "Omni-Template-Bot-Bid-Raiser";
// Use the recursive tree API to find all files in one go
const TREE_URL = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`;
const RAW_BASE_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main`;

interface GithubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeTemplateVersion = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
};

const shouldReadVersionFromContent = (itemPath: string) =>
  matchesTemplateKind(itemPath, "aiostreams");

const extractVersionFromTemplateText = (text: string): string | undefined => {
  try {
    const payload: unknown = JSON.parse(text);
    if (isRecord(payload)) {
      return normalizeTemplateVersion(payload.version);
    }
  } catch {
    // Fall through to a lightweight text match for templates that are not strict JSON.
  }

  const stringMatch = text.match(/"version"\s*:\s*"([^"]+)"/i);
  if (stringMatch) {
    return normalizeTemplateVersion(stringMatch[1]);
  }

  const numericMatch = text.match(/"version"\s*:\s*(\d+(?:\.\d+)*)/i);
  if (numericMatch) {
    return normalizeTemplateVersion(numericMatch[1]);
  }

  return undefined;
};

async function fetchVersionFromTemplateContent(templateUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Template fetch error: ${response.status}`);
    }

    const text = await response.text();
    return extractVersionFromTemplateText(text);
  } catch (error) {
    console.warn(`Failed to read template version from ${templateUrl}:`, error);
    return undefined;
  }
}

const compareTemplateVersions = (a?: string, b?: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const normalizedA = a.replace(/^v/i, "");
  const normalizedB = b.replace(/^v/i, "");
  return normalizedB.localeCompare(normalizedA, undefined, { numeric: true, sensitivity: "base" });
};

export async function fetchGithubTemplates(): Promise<TemplateManifest["templates"]> {
  try {
    const response = await fetch(TREE_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data = await response.json();
    const tree: GithubTreeItem[] = data.tree;

    const templates: TemplateManifest["templates"] = await Promise.all(tree
      .filter(item => {
        if (item.type !== "blob" || !item.path.endsWith(".json")) return false;
        return (
          matchesTemplateKind(item.path, "omni") ||
          matchesTemplateKind(item.path, "aiometadata") ||
          matchesTemplateKind(item.path, "catalogs") ||
          matchesTemplateKind(item.path, "aiostreams")
        );
      })
      .map(item => transformToTemplate(item)));

    // Sort: Latest version first (descending)
    templates.sort((a, b) => {
      return compareTemplateVersions(a.version, b.version);
    });

    // Mark the newest Omni template as default so the UI always prefers the latest version.
    if (templates.length > 0) {
      const defaultTemplate = templates.find((template) => matchesTemplateKind(template.id, "omni")) || templates[0];
      defaultTemplate.isDefault = true;
    }

    return templates;
  } catch (error) {
    console.error("Failed to fetch templates from GitHub:", error);
    return [];
  }
}

async function transformToTemplate(item: GithubTreeItem): Promise<TemplateManifest["templates"][0]> {
  const pathParts = item.path.split("/");
  const fileNameWithExt = pathParts[pathParts.length - 1];
  const fileName = fileNameWithExt.replace(".json", "");
  const display = getTemplateDisplay(fileName, fileName);
  const templateUrl = `${RAW_BASE_URL}/${item.path}`;
  const contentVersion = shouldReadVersionFromContent(item.path)
    ? await fetchVersionFromTemplateContent(templateUrl)
    : undefined;
  const version = contentVersion || display.version || undefined;
  const label = display.label;

  // The 'name' field is used for display in the main selector
  // We'll keep the version here for now so the selector stays descriptive
  let displayName = label;
  if (version) {
    displayName = `${label} ${version}`;
  }

  return {
    id: item.path,
    name: displayName.trim(),
    url: templateUrl,
    version,
  };
}

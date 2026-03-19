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

export async function fetchGithubTemplates(): Promise<TemplateManifest["templates"]> {
  try {
    const response = await fetch(TREE_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const data = await response.json();
    const tree: GithubTreeItem[] = data.tree;

        const templates: TemplateManifest["templates"] = tree
      .filter(item => {
        if (item.type !== "blob" || !item.path.endsWith(".json")) return false;
        return (
          matchesTemplateKind(item.path, "omni") ||
          matchesTemplateKind(item.path, "aiometadata") ||
          matchesTemplateKind(item.path, "catalogs") ||
          matchesTemplateKind(item.path, "aiostreams")
        );
      })
      .map(item => transformToTemplate(item));

    // Sort: Latest version first (descending)
    templates.sort((a, b) => {
      // If version is missing, push to bottom
      if (!a.version && !b.version) return 0;
      if (!a.version) return 1;
      if (!b.version) return -1;
      
      // Numeric comparison for versions like "2.0.3" vs "1.5.1"
      return b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Mark the top one as default if it's in the root folder or just the first one
    if (templates.length > 0) {
      // Find the first one that is in the root directory if possible, otherwise just the first one
      const rootDefault = templates.find(t => t.id.toLowerCase().includes("ume-omni-template") && !t.id.includes("/")) || templates[0];
      rootDefault.isDefault = true;
    }

    return templates;
  } catch (error) {
    console.error("Failed to fetch templates from GitHub:", error);
    return [];
  }
}

function transformToTemplate(item: GithubTreeItem): TemplateManifest["templates"][0] {
  const pathParts = item.path.split("/");
  const fileNameWithExt = pathParts[pathParts.length - 1];
  const fileName = fileNameWithExt.replace(".json", "");
  const display = getTemplateDisplay(fileName, fileName);
  
  const label = display.label;

  // The 'name' field is used for display in the main selector
  // We'll keep the version here for now so the selector stays descriptive
  let displayName = label;
  if (display.version) {
    displayName = `${label} ${display.version}`;
  }

  return {
    id: item.path,
    name: displayName.trim(),
    url: `${RAW_BASE_URL}/${item.path}`,
    version: display.version || undefined,
  };
}

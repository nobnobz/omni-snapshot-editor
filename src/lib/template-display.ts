const VERSION_REGEX = /\bv\d+(?:\.\d+)*/i;

type TemplateDisplay = {
  label: string;
  version: string | null;
};

export function getTemplateDisplay(templateName: string, templateId?: string): TemplateDisplay {
  const version = templateName.match(VERSION_REGEX)?.[0] ?? null;
  const normalizedId = (templateId || "").toLowerCase();

  if (normalizedId.includes("ume-main") || normalizedId.includes("ume-omni") || /omni[- ]snapshot/i.test(templateName)) {
    return { label: "UME Omni Template", version };
  }

  if (normalizedId.includes("aiom") || /aiometadata/i.test(templateName)) {
    if (normalizedId.includes("catalogs") || /catalogs/i.test(templateName)) {
      return { label: "UME AIOMetadata (Catalogs Only)", version };
    }
    return { label: "UME AIOMetadata Template", version };
  }

  if (normalizedId.includes("aios") || /aiostreams/i.test(templateName)) {
    return { label: "UME AIOStreams Template", version };
  }

  let label = templateName.replace(VERSION_REGEX, "").trim();
  label = label.replace(/\s+/g, " ").trim();

  if (!label.toLowerCase().includes("template")) {
    label = `${label} Template`.trim();
  }

  return { label, version };
}

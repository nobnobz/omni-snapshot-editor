const VERSION_REGEX = /\bv\d+(?:\.\d+)*/i;

type TemplateDisplay = {
  label: string;
  version: string | null;
};

export function getTemplateDisplay(templateName: string, templateId?: string): TemplateDisplay {
  const version = templateName.match(VERSION_REGEX)?.[0] ?? null;
  const normalizedId = (templateId || "").toLowerCase();

  if (normalizedId === "ume-main") {
    return { label: "UME Omni Template", version };
  }

  if (normalizedId === "aiometadata") {
    return { label: "AIOMetadata Template", version };
  }

  if (normalizedId === "aiostreams") {
    return { label: "AIOStreams Template", version };
  }

  if (normalizedId === "ume-catalogs") {
    return { label: "AIOMetadata Catalogs", version };
  }

  let label = templateName.replace(VERSION_REGEX, "").trim();
  label = label.replace(/\s+/g, " ").trim();

  if (/omni snapshot/i.test(label)) {
    label = "UME Omni Template";
  } else if (/aiometadata/i.test(label) && /catalogs?\s*only|catalogs?/i.test(label)) {
    label = "AIOMetadata Catalogs";
  } else if (/aiometadata/i.test(label) && !/template/i.test(label)) {
    label = "AIOMetadata Template";
  } else if (/aiostreams/i.test(label) && !/template/i.test(label)) {
    label = "AIOStreams Template";
  } else if (!/template/i.test(label)) {
    label = `${label} Template`.trim();
  }

  return { label, version };
}

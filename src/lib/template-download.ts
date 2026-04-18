import { matchesTemplateKind } from "./template-manifest";
import { fetchTextWithLimits } from "./remote-fetch";

const sanitizeTemplateFilenameSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

const buildVersionSuffixVariants = (version: string) => {
  const variants = new Set<string>();
  if (!version) {
    return variants;
  }

  variants.add(version);
  if (version.startsWith("v")) {
    variants.add(version.slice(1));
  } else {
    variants.add(`v${version}`);
  }

  return variants;
};

const appendVersionToFilename = (templateName: string, version?: string | null) => {
  const safeName = sanitizeTemplateFilenameSegment(templateName);
  const safeVersion = version ? sanitizeTemplateFilenameSegment(version) : "";

  if (!safeVersion) {
    return safeName;
  }

  const versionVariants = buildVersionSuffixVariants(safeVersion);
  const alreadyHasVersion = [...versionVariants].some(
    (variant) => safeName === variant || safeName.endsWith(`-${variant}`)
  );

  if (alreadyHasVersion) {
    return safeName;
  }

  return `${safeName}-${safeVersion}`;
};

export const buildTemplateDownloadFilename = (templateName: string, version?: string | null) => {
  let safeName = templateName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  if (safeName.endsWith(".json")) {
    safeName = safeName.slice(0, -5);
  }

  // Keep legacy "ume-" naming for AIOMetadata/AIOStreams templates.
  if (
    (safeName.includes("aiometadata") || safeName.includes("aiostreams")) &&
    !safeName.startsWith("ume-")
  ) {
    safeName = `ume-${safeName}`;
  }

  const filename = appendVersionToFilename(safeName, version);
  return filename.endsWith(".json") ? filename : `${filename}.json`;
};

export const shouldOfferTemplateUrlChoice = (templateId: string, templateName: string) =>
  matchesTemplateKind(`${templateId} ${templateName}`, "aiostreams");

export const copyTemplateUrl = async (templateUrl: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard copy is not supported in this browser.");
  }

  await navigator.clipboard.writeText(templateUrl);
};

export const downloadTemplateFile = async (templateUrl: string, templateName: string, version?: string | null) => {
  const text = await fetchTextWithLimits(templateUrl, {
    timeoutMs: 12000,
    maxBytes: 5_000_000,
  });
  // Use octet-stream to force download on iOS Safari.
  const blob = new Blob([text], { type: "application/octet-stream" });
  const downloadUrl = URL.createObjectURL(blob);
  const fileName = buildTemplateDownloadFilename(templateName, version ?? undefined);

  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
};

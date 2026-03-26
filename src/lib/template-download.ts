import { matchesTemplateKind } from "./template-manifest";
import { fetchTextWithLimits } from "./remote-fetch";

export const buildTemplateDownloadFilename = (templateName: string) => {
  let safeName = templateName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  // Keep legacy "ume-" naming for AIOMetadata/AIOStreams templates.
  if (
    (safeName.includes("aiometadata") || safeName.includes("aiostreams")) &&
    !safeName.startsWith("ume-")
  ) {
    safeName = `ume-${safeName}`;
  }

  return safeName.endsWith(".json") ? safeName : `${safeName}.json`;
};

export const shouldOfferTemplateUrlChoice = (templateId: string, templateName: string) =>
  matchesTemplateKind(`${templateId} ${templateName}`, "aiostreams");

export const copyTemplateUrl = async (templateUrl: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard copy is not supported in this browser.");
  }

  await navigator.clipboard.writeText(templateUrl);
};

export const downloadTemplateFile = async (templateUrl: string, templateName: string) => {
  const text = await fetchTextWithLimits(templateUrl, {
    timeoutMs: 12000,
    maxBytes: 5_000_000,
  });
  // Use octet-stream to force download on iOS Safari.
  const blob = new Blob([text], { type: "application/octet-stream" });
  const downloadUrl = URL.createObjectURL(blob);
  const fileName = buildTemplateDownloadFilename(templateName);

  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
};

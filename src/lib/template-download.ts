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

export const downloadTemplateFile = async (templateUrl: string, templateName: string) => {
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error("Download failed");
  }

  const text = await response.text();
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

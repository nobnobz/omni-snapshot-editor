import { describe, expect, it } from "vitest";
import { buildTemplateDownloadFilename, shouldOfferTemplateUrlChoice } from "./template-download";

describe("shouldOfferTemplateUrlChoice", () => {
  it("returns true for AIOStreams templates", () => {
    expect(shouldOfferTemplateUrlChoice("ume-aiostreams-template-v2.1.1.json", "UME AIOStreams Template 2.1.1")).toBe(true);
  });

  it("returns false for the AIOStreams formatter download", () => {
    expect(shouldOfferTemplateUrlChoice("ume-aiostreams-formatter-v3.0.json", "UME AIOStreams Formatter v3.0")).toBe(false);
  });

  it("returns false for non-AIOStreams templates", () => {
    expect(shouldOfferTemplateUrlChoice("ume-aiometadata-template-v2.1.1.json", "UME AIOMetadata Template 2.1.1")).toBe(false);
  });
});

describe("buildTemplateDownloadFilename", () => {
  it("adds the version to the downloaded filename", () => {
    expect(buildTemplateDownloadFilename("UME Omni Template", "v2.1.1")).toBe("ume-omni-template-v2.1.1.json");
  });

  it("does not duplicate an existing version suffix", () => {
    expect(buildTemplateDownloadFilename("UME Omni Template v2.1.1", "v2.1.1")).toBe("ume-omni-template-v2.1.1.json");
  });

  it("builds a json filename for the AIOStreams formatter", () => {
    expect(buildTemplateDownloadFilename("UME AIOStreams Formatter v3.0", "v3.0")).toBe("ume-aiostreams-formatter-v3.0.json");
  });
});

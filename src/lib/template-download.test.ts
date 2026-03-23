import { describe, expect, it } from "vitest";
import { shouldOfferTemplateUrlChoice } from "./template-download";

describe("shouldOfferTemplateUrlChoice", () => {
    it("returns true for AIOStreams templates", () => {
        expect(shouldOfferTemplateUrlChoice("ume-aiostreams-template-v2.1.1.json", "UME AIOStreams Template 2.1.1")).toBe(true);
    });

    it("returns false for non-AIOStreams templates", () => {
        expect(shouldOfferTemplateUrlChoice("ume-aiometadata-template-v2.1.1.json", "UME AIOMetadata Template 2.1.1")).toBe(false);
    });
});

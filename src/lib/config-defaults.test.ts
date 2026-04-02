import { describe, expect, it } from "vitest";
import { applyConfigDefaults, DEFAULT_METADATA_PROVIDER } from "./config-defaults";

describe("applyConfigDefaults", () => {
    it("sets default_metadata_provider to aio-metadata when it is missing", () => {
        expect(applyConfigDefaults({ hide_spoilers: false })).toMatchObject({
            hide_spoilers: false,
            default_metadata_provider: DEFAULT_METADATA_PROVIDER,
        });
    });

    it("preserves an existing default_metadata_provider value", () => {
        expect(applyConfigDefaults({ default_metadata_provider: "bem export" })).toMatchObject({
            default_metadata_provider: "bem export",
        });
    });
});

import { describe, expect, it } from "vitest";
import { getTemplateDisplay } from "./template-display";

describe("getTemplateDisplay", () => {
  it("returns the formatter label for the AIOStreams formatter", () => {
    expect(getTemplateDisplay("UME AIOStreams Formatter v3.0", "aiostreams-formatter")).toEqual({
      label: "UME AIOStreams Formatter",
      version: "v3.0",
    });
  });
});

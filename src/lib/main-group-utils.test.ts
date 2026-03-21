import { describe, expect, it } from "vitest";
import { normalizeMainGroupOrder } from "./main-group-utils";

describe("normalizeMainGroupOrder", () => {
    it("appends main groups that are missing from the stored order", () => {
        const mainGroups = {
            "collections-uuid": { name: "Collections" },
            "movies-uuid": { name: "Movies" },
            "streaming-uuid": { name: "Streaming Services" },
        };

        expect(normalizeMainGroupOrder(mainGroups, ["streaming-uuid", "movies-uuid"])).toEqual([
            "streaming-uuid",
            "movies-uuid",
            "collections-uuid",
        ]);
    });

    it("drops unknown ids from the order", () => {
        const mainGroups = {
            "movies-uuid": { name: "Movies" },
        };

        expect(normalizeMainGroupOrder(mainGroups, ["missing-uuid", "movies-uuid"])).toEqual([
            "movies-uuid",
        ]);
    });

    it("uses object keys when no valid order array exists", () => {
        const mainGroups = {
            "collections-uuid": { name: "Collections" },
            "movies-uuid": { name: "Movies" },
        };

        expect(normalizeMainGroupOrder(mainGroups, undefined)).toEqual([
            "collections-uuid",
            "movies-uuid",
        ]);
    });
});

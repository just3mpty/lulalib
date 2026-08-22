import { describe, expect, it } from "vitest";
import { toJSON } from "../src/export/json";
import { track } from "../src/music/track";
import { toScore } from "../src/render/score";

describe("toJSON", () => {
    const score = toScore(track("acid", { notes: "C4", rhythm: "x" }), { bpm: 120 });

    it("produit un JSON qui se reparse en le même Score (round-trip)", () => {
        expect(JSON.parse(toJSON(score))).toEqual(score);
    });

    it("indente avec l'option pretty", () => {
        expect(toJSON(score, { pretty: true })).toContain("\n");
        expect(toJSON(score)).not.toContain("\n"); // compact par défaut
    });
});

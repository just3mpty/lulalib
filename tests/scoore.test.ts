import { describe, expect, it } from "vitest";
import { track } from "../src/music/track";
import { toScore } from "../src/render/score";

describe("toScore", () => {
    it("produit un Score conforme (fractions sérialisées, events triés, inventaire)", () => {
        const bass = track("acid", { notes: "C2 G2", rhythm: "x-x-" });
        const kick = track("909", { rhythm: "x-x-" });

        expect(toScore([bass, kick], { bpm: 128 })).toEqual({
            version: 1,
            bpm: 128,
            duration: "1/1",
            instruments: { acid: {}, "909": {} },
            events: [
                { start: "0/1", dur: "1/4", instrument: "acid", note: "C2" },
                { start: "0/1", dur: "1/4", instrument: "909" },
                { start: "1/2", dur: "1/4", instrument: "acid", note: "G2" },
                { start: "1/2", dur: "1/4", instrument: "909" },
            ],
        });
    });

    it("accepte un seul track et remonte key/timeSignature", () => {
        const t = track("acid", { notes: "C4", rhythm: "x" });
        const score = toScore(t, { bpm: 120, key: "Cm" });
        expect(score.key).toBe("Cm");
        expect(score.duration).toBe("1/4");
    });
});

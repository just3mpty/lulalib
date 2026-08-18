import { describe, expect, it } from "vitest";
import { section } from "../src/music/section";
import { song } from "../src/music/song";
import { track } from "../src/music/track";

const verse = section([track("acid", { notes: "C2", rhythm: "x" })]);
const chorus = section([track("909", { rhythm: "x-x-" })]);

describe("song / arrange", () => {
    it("arrange stocke les sections et garde les métadonnées", () => {
        const s = song({ bpm: 128, key: "Cm" }).arrange([verse, chorus]);
        expect(s.bpm).toBe(128);
        expect(s.key).toBe("Cm");
        expect(s.arrangement).toHaveLength(2);
    });

    it("arrange est immuable : l'original n'est pas modifié", () => {
        const base = song({ bpm: 128 });
        base.arrange([verse]);
        expect(base.arrangement).toHaveLength(0); // base intact
    });

    it("export enchaîne les sections dans le temps", () => {
        const a = section([track("acid", { notes: "C4", rhythm: "x" })]); // length 1/4
        const b = section([track("909", { rhythm: "x" })]); // length 1/4

        const score = song({ bpm: 120 }).arrange([a, b]).export();

        expect(score.duration).toBe("1/2"); // 1/4 + 1/4 → SÉQUENTIEL (pas simultané !)
        expect(score.events).toEqual([
            { start: "0/1", dur: "1/4", instrument: "acid", note: "C4" },
            { start: "1/4", dur: "1/4", instrument: "909" },
        ]);
        expect(score.instruments).toEqual({ acid: {}, "909": {} });
    });
});

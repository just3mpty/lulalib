import { describe, expect, it } from "vitest";
import { event } from "../src/core/event";
import { section } from "../src/music/section";
import { bass, drums } from "../src/music/sugar";
import { track } from "../src/music/track";
import { toScore } from "../src/render/score";
import { frac } from "../src/time/fraction";
import { span } from "../src/time/timespan";

describe("drums", () => {
    it("empile des parties étiquetées", () => {
        const kit = drums("909").kick("x-x-").snare("--x-").build();
        const evs = kit.pattern.query(span(frac(0), kit.pattern.length));
        expect(evs).toEqual([
            event(frac(0), frac(1, 4), { instrument: "909", part: "kick" }),
            event(frac(1, 2), frac(1, 4), { instrument: "909", part: "kick" }),
            event(frac(1, 2), frac(1, 4), { instrument: "909", part: "snare" }),
        ]);
    });

    it("remplit l'inventaire du Score avec les parties", () => {
        const score = toScore(drums("909").kick("x-x-").snare("--x-").build(), { bpm: 120 });
        expect(score.instruments).toEqual({ "909": { parts: ["kick", "snare"] } });
    });
});

describe("bass / lead", () => {
    it("produit le même pattern que track()", () => {
        const sugar = bass("acid").notes("C2 G2").rhythm("x-x-").build();
        const core = track("acid", { notes: "C2 G2", rhythm: "x-x-" });
        const win = span(frac(0), sugar.pattern.length);
        expect(sugar.instrument).toBe("acid");
        expect(sugar.pattern.query(win)).toEqual(core.pattern.query(win));
    });

    it("est immuable", () => {
        const base = bass("acid").notes("C2");
        base.rhythm("x-x-"); // renvoie un nouveau builder, `base` inchangé
        expect(base.length).toEqual(frac(1, 4)); // notes "C2" + rythme défaut "x" = 1 pas
    });

    it("s'utilise directement dans section()", () => {
        const s = section([bass("acid").notes("C2 G2").rhythm("x-x-")]);
        expect(s.length).toEqual(frac(1));
    });
});

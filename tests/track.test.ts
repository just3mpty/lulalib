import { describe, expect, it } from "vitest";
import { event } from "../src/core/event";
import { type Track, track } from "../src/music/track";
import { frac } from "../src/time/fraction";
import { span } from "../src/time/timespan";

function evts(t: Track) {
    return t.pattern.query(span(frac(0), t.pattern.length));
}

describe("track", () => {
    it("assemble notes + rythme", () => {
        const t = track("acid", { notes: "C2 G2", rhythm: "x-x-" });
        expect(t.instrument).toBe("acid");
        expect(evts(t)).toEqual([
            event(frac(0), frac(1, 4), { instrument: "acid", note: "C2" }),
            event(frac(1, 2), frac(1, 4), { instrument: "acid", note: "G2" }),
        ]);
    });

    it("rythme par défaut : un 'x' par note", () => {
        const t = track("piano", { notes: "C4 E4 G4" });
        expect(evts(t).map((e) => e.value.note)).toEqual(["C4", "E4", "G4"]);
        expect(t.pattern.length).toEqual(frac(3, 4));
    });

    it("percussion : rythme seul", () => {
        const t = track("909", { rhythm: "x-x-" });
        expect(evts(t)).toEqual([
            event(frac(0), frac(1, 4), { instrument: "909" }),
            event(frac(1, 2), frac(1, 4), { instrument: "909" }),
        ]);
    });

    it("lève si ni notes ni rythme", () => {
        expect(() => track("x", {})).toThrow();
    });
});

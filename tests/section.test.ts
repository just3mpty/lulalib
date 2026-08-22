import { describe, expect, it } from "vitest";
import { at, section } from "../src/music/section";
import { song } from "../src/music/song";
import { track } from "../src/music/track";
import { frac } from "../src/time/fraction";

describe("section", () => {
    it("regroupe des tracks et prend la longueur du plus long", () => {
        const bass = track("acid", { notes: "C2 G2", rhythm: "x-x-" });
        const kick = track("909", { rhythm: "x-x--x--" });
        const verse = section([bass, kick], "verse");

        expect(verse.name).toBe("verse");
        expect(verse.tracks).toHaveLength(2);
        expect(verse.length).toEqual(frac(2));
    });

    it("section vide → longueur 0", () => {
        expect(section([]).length).toEqual(frac(0));
    });
    it("prend le max quel que soit l'ordre", () => {
        const long = track("909", { rhythm: "x-x--x--" });
        const short = track("acid", { notes: "C2", rhythm: "x" });
        expect(section([long, short]).length).toEqual(frac(2));
    });

    it(".with ajoute des tracks sans modifier la section d'origine", () => {
        const base = section([track("a", { rhythm: "x" })], "verse");
        const extended = base.with([track("b", { rhythm: "x" })]);

        expect(base.tracks).toHaveLength(1);
        expect(extended.tracks).toHaveLength(2);
        expect(extended.name).toBe("verse");
    });

    it("at() pose un élément à un offset temporel", () => {
        const crash = track("crash", { rhythm: "x" });
        const score = song({ bpm: 120 })
            .arrange([section([at(frac(1), crash)])])
            .export();

        expect(score.events).toEqual([{ start: "1/1", dur: "1/4", instrument: "crash" }]);
        expect(score.duration).toBe("5/4");
    });
});

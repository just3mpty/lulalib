import { describe, expect, it } from "vitest";
import { at, section } from "../src/music/section";
import { song } from "../src/music/song";
import { track } from "../src/music/track";
import { frac } from "../src/time/fraction";

describe("section", () => {
    it("regroupe des tracks et prend la longueur du plus long", () => {
        const bass = track("acid", { notes: "C2 G2", rhythm: "x-x-" }); // 4 pas → length 1
        const kick = track("909", { rhythm: "x-x--x--" }); // 8 pas → length 2
        const verse = section([bass, kick], "verse");

        expect(verse.name).toBe("verse");
        expect(verse.tracks).toHaveLength(2);
        expect(verse.length).toEqual(frac(2)); // le plus long
    });

    it("section vide → longueur 0", () => {
        expect(section([]).length).toEqual(frac(0));
    });
    it("prend le max quel que soit l'ordre", () => {
        const long = track("909", { rhythm: "x-x--x--" }); // length 2
        const short = track("acid", { notes: "C2", rhythm: "x" }); // length 1/4
        expect(section([long, short]).length).toEqual(frac(2)); // le long est en 1er
    });

    it(".with ajoute des tracks sans modifier la section d'origine", () => {
        const base = section([track("a", { rhythm: "x" })], "verse");
        const extended = base.with([track("b", { rhythm: "x" })]);

        expect(base.tracks).toHaveLength(1); // base intact (immuable)
        expect(extended.tracks).toHaveLength(2);
        expect(extended.name).toBe("verse"); // le nom est conservé
    });

    it("at() pose un élément à un offset temporel", () => {
        const crash = track("crash", { rhythm: "x" }); // length 1/4
        const score = song({ bpm: 120 })
            .arrange([section([at(frac(1), crash)])])
            .export();

        expect(score.events).toEqual([{ start: "1/1", dur: "1/4", instrument: "crash" }]);
        expect(score.duration).toBe("5/4"); // offset 1 + durée 1/4
    });
});

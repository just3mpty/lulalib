import { describe, expect, it } from "vitest";
import { section } from "../src/music/section";
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
});

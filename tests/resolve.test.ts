import { describe, expect, it } from "vitest";
import { event } from "../src/core/event";
import { flattenMelody, flattenRhythm, resolve } from "../src/music/resolve";
import { ParseError } from "../src/notation/errors";
import { parseMelody } from "../src/notation/melody";
import { parseRhythm } from "../src/notation/rhythm";
import { frac } from "../src/time/fraction";
import { span } from "../src/time/timespan";

const step = frac(1, 4);

function events(notes: string, rhythm: string, instrument = "acid") {
    const p = resolve(parseMelody(notes), parseRhythm(rhythm), { instrument, step });
    return p.query(span(frac(0), p.length));
}

describe("flattenMelody", () => {
    it("aplatit notes et accords en entrées", () => {
        expect(flattenMelody(parseMelody("C4 E4,G4"))).toEqual([["C4"], ["E4", "G4"]]);
    });

    it("déplie les répétitions *n", () => {
        expect(flattenMelody(parseMelody("C4*3"))).toEqual([["C4"], ["C4"], ["C4"]]);
    });

    it("déplie les groupes", () => {
        expect(flattenMelody(parseMelody("[C4 E4]*2"))).toEqual([["C4"], ["E4"], ["C4"], ["E4"]]);
    });
});

describe("flattenRhythm", () => {
    it("aplatit les atomes de base", () => {
        expect(flattenRhythm(parseRhythm("x-_"))).toEqual([
            { type: "trigger" },
            { type: "rest" },
            { type: "hold" },
        ]);
    });

    it("normalise x@n en trigger + (n-1) holds", () => {
        expect(flattenRhythm(parseRhythm("x@4"))).toEqual([
            { type: "trigger" },
            { type: "hold" },
            { type: "hold" },
            { type: "hold" },
        ]);
        expect(flattenRhythm(parseRhythm("x@4"))).toEqual(flattenRhythm(parseRhythm("x___")));
    });

    it("déplie les groupes *n", () => {
        expect(flattenRhythm(parseRhythm("[x-]*2"))).toEqual([
            { type: "trigger" },
            { type: "rest" },
            { type: "trigger" },
            { type: "rest" },
        ]);
    });
});

describe("resolve", () => {
    it("couple notes et rythme (fixture §5.5)", () => {
        expect(events("C2 G2 Bb2 A2", "x-x-xx--")).toEqual([
            event(frac(0), frac(1, 4), { instrument: "acid", note: "C2" }),
            event(frac(1, 2), frac(1, 4), { instrument: "acid", note: "G2" }),
            event(frac(1), frac(1, 4), { instrument: "acid", note: "Bb2" }),
            event(frac(5, 4), frac(1, 4), { instrument: "acid", note: "A2" }),
        ]);
    });

    it("length = nombre de pas × step", () => {
        const p = resolve(parseMelody("C2 G2 Bb2 A2"), parseRhythm("x-x-xx--"), {
            instrument: "acid",
            step,
        });
        expect(p.length).toEqual(frac(2));
    });

    it("fait boucler la réserve quand il y a plus de déclenchements que de notes", () => {
        const notes = events("C2 G2 Bb2 A2", "xx-xx-xx").map((e) => e.value.note);
        expect(notes).toEqual(["C2", "G2", "Bb2", "A2", "C2", "G2"]);
    });

    it("tenue x___ = un seul event legato de 4 pas", () => {
        expect(events("C4", "x___")).toEqual([
            event(frac(0), frac(1), { instrument: "acid", note: "C4" }),
        ]);
    });

    it("staccato x--- = un event d'un seul pas", () => {
        expect(events("C4", "x---")).toEqual([
            event(frac(0), frac(1, 4), { instrument: "acid", note: "C4" }),
        ]);
    });

    it("un accord produit N events au même start", () => {
        expect(events("C4,E4,G4", "x")).toEqual([
            event(frac(0), frac(1, 4), { instrument: "acid", note: "C4" }),
            event(frac(0), frac(1, 4), { instrument: "acid", note: "E4" }),
            event(frac(0), frac(1, 4), { instrument: "acid", note: "G4" }),
        ]);
    });

    it("percussion : un rythme sans notes produit des events sans note", () => {
        expect(events("", "x-x-", "909")).toEqual([
            event(frac(0), frac(1, 4), { instrument: "909" }),
            event(frac(1, 2), frac(1, 4), { instrument: "909" }),
        ]);
    });

    it("rejette un '_' sans note à prolonger", () => {
        expect(() => events("C4", "_x")).toThrow(ParseError);
    });
});

import { describe, expect, it } from "vitest";
import { ParseError } from "../src/notation/errors";
import { parseMelody } from "../src/notation/melody";

describe("parseMelody — notes", () => {
    it("parse des notes séparées par des espaces", () => {
        expect(parseMelody("C4 E4 G4")).toEqual([
            { type: "note", pitch: "C4", repeat: 1 },
            { type: "note", pitch: "E4", repeat: 1 },
            { type: "note", pitch: "G4", repeat: 1 },
        ]);
    });

    it("gère les altérations et normalise la casse", () => {
        expect(parseMelody("eb4 F#3")).toEqual([
            { type: "note", pitch: "Eb4", repeat: 1 },
            { type: "note", pitch: "F#3", repeat: 1 },
        ]);
    });
});

describe("parseMelody — accords", () => {
    it("parse un accord (virgules, sans espaces)", () => {
        expect(parseMelody("C4,Eb4,G4")).toEqual([
            { type: "chord", pitches: ["C4", "Eb4", "G4"], repeat: 1 },
        ]);
    });

    it("distingue un accord de notes séparées par des espaces", () => {
        expect(parseMelody("C4,E4 G4")).toEqual([
            { type: "chord", pitches: ["C4", "E4"], repeat: 1 },
            { type: "note", pitch: "G4", repeat: 1 },
        ]);
    });
});

describe("parseMelody — groupes", () => {
    it("parse un groupe de notes", () => {
        expect(parseMelody("[C4 E4]")).toEqual([
            {
                type: "group",
                repeat: 1,
                children: [
                    { type: "note", pitch: "C4", repeat: 1 },
                    { type: "note", pitch: "E4", repeat: 1 },
                ],
            },
        ]);
    });

    it("rejette un crochet non fermé", () => {
        expect(() => parseMelody("[C4")).toThrow(ParseError);
    });

    it("rejette un crochet fermant orphelin", () => {
        expect(() => parseMelody("C4]")).toThrow(ParseError);
    });
});

describe("parseMelody — répétition *n", () => {
    it("répète une note", () => {
        expect(parseMelody("C4*3")).toEqual([{ type: "note", pitch: "C4", repeat: 3 }]);
    });

    it("répète un groupe", () => {
        expect(parseMelody("[C4 E4]*2")).toEqual([
            {
                type: "group",
                repeat: 2,
                children: [
                    { type: "note", pitch: "C4", repeat: 1 },
                    { type: "note", pitch: "E4", repeat: 1 },
                ],
            },
        ]);
    });

    it("rejette *0", () => {
        expect(() => parseMelody("C4*0")).toThrow(ParseError);
    });
});

describe("parseMelody — validations", () => {
    it("rejette les marqueurs temporels dans les notes", () => {
        expect(() => parseMelody("C4 _")).toThrow(ParseError);
        expect(() => parseMelody("C4 ~")).toThrow(ParseError);
        expect(() => parseMelody("C4 -")).toThrow(ParseError);
    });

    it("rejette une lettre hors A–G", () => {
        expect(() => parseMelody("H4")).toThrow(ParseError);
    });

    it("rejette une note sans octave", () => {
        expect(() => parseMelody("C")).toThrow(ParseError);
    });
});

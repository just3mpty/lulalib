import { describe, expect, it } from "vitest";
import { degreeToNote, parseKey, resolveDegrees, scaleNotes } from "../src/theory/scale";

describe("degreeToNote", () => {
    it("résout 1 3 5 selon la tonalité", () => {
        const C = parseKey("C");
        expect([1, 3, 5].map((d) => degreeToNote(C, d, 4))).toEqual(["C4", "E4", "G4"]);

        const Cm = parseKey("Cm");
        expect([1, 3, 5].map((d) => degreeToNote(Cm, d, 4))).toEqual(["C4", "Eb4", "G4"]);

        const G = parseKey("G");
        expect([1, 3, 5].map((d) => degreeToNote(G, d, 4))).toEqual(["G4", "B4", "D4"]);
    });

    it("gère le 7ᵉ degré (sensible)", () => {
        expect(degreeToNote(parseKey("G"), 7, 4)).toBe("F#4");
        expect(degreeToNote(parseKey("Cm"), 7, 4)).toBe("Bb4");
    });
    it("applique l'altération d'un token degré", () => {
        const C = parseKey("C");
        expect(degreeToNote(C, 3, 4, -1)).toBe("Eb4");
        expect(degreeToNote(C, 4, 4, +1)).toBe("F#4");
    });
});

describe("parseKey", () => {
    it("parse une tonalité mineure", () => {
        expect(parseKey("Cm")).toEqual({ root: "C", mode: "minor" });
    });
    it("parse une tonalité majeure", () => {
        expect(parseKey("C")).toEqual({ root: "C", mode: "major" });
    });
    it("gère une fondamentale altérée", () => {
        expect(parseKey("F#m")).toEqual({ root: "F#", mode: "minor" });
        expect(parseKey("Bb")).toEqual({ root: "Bb", mode: "major" });
    });
    it("rejette une tonalité invalide", () => {
        expect(() => parseKey("H")).toThrow();
    });
});

describe("scaleNotes", () => {
    it("donne les 7 notes de la gamme", () => {
        expect(scaleNotes(parseKey("C"))).toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4"]);
        expect(scaleNotes(parseKey("Cm"))).toEqual(["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4"]);
    });
});

describe("resolveDegrees", () => {
    it("traduit des degrés simples selon la key", () => {
        expect(resolveDegrees("1 3 5", parseKey("C"), 4)).toBe("C4 E4 G4");
        expect(resolveDegrees("1 3 5", parseKey("Cm"), 4)).toBe("C4 Eb4 G4");
    });
    it("laisse les notes absolues intactes", () => {
        expect(resolveDegrees("C4 E4", parseKey("C"), 4)).toBe("C4 E4");
    });
    it("mélange degrés et notes absolues", () => {
        expect(resolveDegrees("1 E4 5", parseKey("C"), 4)).toBe("C4 E4 G4");
    });
    it("lève si un degré est utilisé sans key", () => {
        expect(() => resolveDegrees("1 3 5", undefined, 4)).toThrow();
    });
    it("gère l'altération du token (#/b)", () => {
        expect(resolveDegrees("3b", parseKey("C"), 4)).toBe("Eb4");
        expect(resolveDegrees("4#", parseKey("C"), 4)).toBe("F#4");
    });
    it("gère les octaves ' (haut) et . (bas)", () => {
        expect(resolveDegrees("1'", parseKey("C"), 4)).toBe("C5");
        expect(resolveDegrees("1.", parseKey("C"), 4)).toBe("C3");
        expect(resolveDegrees("1''", parseKey("C"), 4)).toBe("C6");
    });
    it("gère un accord de degrés", () => {
        expect(resolveDegrees("1,3,5", parseKey("C"), 4)).toBe("C4,E4,G4");
        expect(resolveDegrees("1,3,5", parseKey("Cm"), 4)).toBe("C4,Eb4,G4");
    });
    it("gère un accord mêlant degré et note absolue", () => {
        expect(resolveDegrees("1,E4", parseKey("C"), 4)).toBe("C4,E4");
    });
});

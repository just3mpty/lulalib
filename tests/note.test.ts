import { describe, expect, it } from "vitest";
import { noteToSemitones, semitonesToNote, transpose } from "../src/theory/note";

describe("noteToSemitones", () => {
    it("convertit une note en demi-tons", () => {
        expect(noteToSemitones("C4")).toBe(60);
        expect(noteToSemitones("Eb4")).toBe(63);
        expect(noteToSemitones("F#3")).toBe(54);
    });

    it("reconvertit des demi-tons en note (dièses canoniques)", () => {
        expect(semitonesToNote(60)).toBe("C4");
        expect(semitonesToNote(63)).toBe("D#4");
        expect(semitonesToNote(54)).toBe("F#3");
    });

    it("transpose", () => {
        expect(transpose("C4", 12)).toBe("C5");
        expect(transpose("C4", 3)).toBe("D#4");
        expect(transpose("A4", -12)).toBe("A3");
    });
});

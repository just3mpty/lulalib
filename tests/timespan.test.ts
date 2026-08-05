import { describe, expect, it } from "vitest";
import { frac } from "../src/time/fraction";
import { contains, duration, intersect, shift, span } from "../src/time/timespan";

describe("span", () => {
    it("construit un intervalle valide", () => {
        const s = span(frac(0), frac(2));
        expect(s).toEqual({ begin: frac(0), end: frac(2) });
    });

    it("autorise un span vide (begin === end)", () => {
        expect(() => span(frac(2), frac(2))).not.toThrow();
    });

    it("refuse begin > end", () => {
        expect(() => span(frac(3), frac(1))).toThrow();
    });
});

describe("duration", () => {
    it("calcule end - begin", () => {
        expect(duration(span(frac(1), frac(3)))).toEqual(frac(2));
    });
});

describe("contains", () => {
    it("gère les bornes (demi-ouvert)", () => {
        const s = span(frac(0), frac(2));
        expect(contains(s, frac(0))).toBe(true);
        expect(contains(s, frac(1))).toBe(true);
        expect(contains(s, frac(2))).toBe(false);
    });
});

describe("intersect", () => {
    it("calcule le recouvrement", () => {
        expect(intersect(span(frac(1), frac(4)), span(frac(3), frac(6)))).toEqual(
            span(frac(3), frac(4)),
        );
    });
    it("renvoie null quand les fenêtres sont bord à bord", () => {
        expect(intersect(span(frac(0), frac(2)), span(frac(2), frac(4)))).toBeNull();
    });
    it("renvoie null quand les fenêtres sont disjointes", () => {
        expect(intersect(span(frac(0), frac(1)), span(frac(3), frac(4)))).toBeNull();
    });
});

describe("shift", () => {
    it("décale begin et end de delta", () => {
        expect(shift(span(frac(1), frac(3)), frac(2))).toEqual(span(frac(3), frac(5)));
    });
});

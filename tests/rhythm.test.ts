import { describe, expect, it } from "vitest";
import { ParseError } from "../src/notation/errors";
import { parseRhythm } from "../src/notation/rhythm";

describe("parseRhythm — atomes de base", () => {
    it("parse trigger, rest, hold", () => {
        expect(parseRhythm("x-x_")).toEqual([
            { type: "trigger", symbol: "x" },
            { type: "rest" },
            { type: "trigger", symbol: "x" },
            { type: "hold" },
        ]);
    });

    it("traite ~ comme un silence et tout autre caractère comme un trigger", () => {
        expect(parseRhythm("o~")).toEqual([{ type: "trigger", symbol: "o" }, { type: "rest" }]);
    });

    it("ignore les espaces (cosmétiques)", () => {
        expect(parseRhythm("x- x-")).toEqual([
            { type: "trigger", symbol: "x" },
            { type: "rest" },
            { type: "trigger", symbol: "x" },
            { type: "rest" },
        ]);
    });

    it("gère la tenue @n sur un trigger", () => {
        expect(parseRhythm("x@4")).toEqual([{ type: "trigger", symbol: "x", sustain: 4 }]);
    });

    it("gère un @n à plusieurs chiffres", () => {
        expect(parseRhythm("x@12")).toEqual([{ type: "trigger", symbol: "x", sustain: 12 }]);
    });
});

describe("parseRhythm — erreurs de tenue @", () => {
    it("rejette @ en tête (rien à tenir)", () => {
        expect(() => parseRhythm("@4")).toThrow(ParseError);
    });

    it("rejette @ après un silence", () => {
        expect(() => parseRhythm("-@4")).toThrow(ParseError);
    });

    it("rejette @ sans entier", () => {
        expect(() => parseRhythm("x@")).toThrow(ParseError);
    });

    it("rejette @0 (entier ≤ 0)", () => {
        expect(() => parseRhythm("x@0")).toThrow(ParseError);
    });

    it("pointe la position du @ fautif", () => {
        try {
            parseRhythm("x@");
            expect.unreachable("aurait dû lever une ParseError");
        } catch (e) {
            expect(e).toBeInstanceOf(ParseError);
            if (e instanceof ParseError) {
                expect(e.position).toBe(1);
                expect(e.notation).toBe("rhythm");
            }
        }
    });
});

describe("parseRhythm — groupes", () => {
    it("parse un groupe simple", () => {
        expect(parseRhythm("[x-]")).toEqual([
            {
                type: "group",
                repeat: 1,
                children: [{ type: "trigger", symbol: "x" }, { type: "rest" }],
            },
        ]);
    });

    it("parse un groupe imbriqué", () => {
        expect(parseRhythm("[x[x-]]")).toEqual([
            {
                type: "group",
                repeat: 1,
                children: [
                    { type: "trigger", symbol: "x" },
                    {
                        type: "group",
                        repeat: 1,
                        children: [{ type: "trigger", symbol: "x" }, { type: "rest" }],
                    },
                ],
            },
        ]);
    });
    it("parse un groupe suivi d'autre chose", () => {
        expect(parseRhythm("[x-]x")).toEqual([
            {
                type: "group",
                repeat: 1,
                children: [{ type: "trigger", symbol: "x" }, { type: "rest" }],
            },
            { type: "trigger", symbol: "x" },
        ]);
    });
    it("répète un groupe avec *n", () => {
        expect(parseRhythm("[x-]*2")).toEqual([
            {
                type: "group",
                repeat: 2,
                children: [{ type: "trigger", symbol: "x" }, { type: "rest" }],
            },
        ]);
    });

    it("rejette *0 (entier ≤ 0)", () => {
        expect(() => parseRhythm("[x-]*2*0".slice(0, 5) + "0")).toThrow(ParseError);
    });
    describe("parseRhythm — erreurs de crochets", () => {
        it("rejette un crochet non fermé", () => {
            expect(() => parseRhythm("[x-")).toThrow(ParseError);
        });

        it("rejette un crochet fermant orphelin", () => {
            expect(() => parseRhythm("x]")).toThrow(ParseError);
        });

        it("accepte des groupes imbriqués bien équilibrés", () => {
            expect(() => parseRhythm("[x[x-]]")).not.toThrow();
        });
    });
});

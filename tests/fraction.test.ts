import { describe, expect, it } from "vitest";
import {
    add,
    compare,
    div,
    equals,
    frac,
    gcd,
    gt,
    gte,
    isZero,
    lt,
    lte,
    max,
    min,
    mul,
    sub,
    toNumber,
} from "../src/time/fraction";

describe("gcd", () => {
    it("trouve le plus grand commun diviseur", () => {
        expect(gcd(12, 8)).toBe(4);
        expect(gcd(8, 12)).toBe(4);
        expect(gcd(7, 1)).toBe(1);
        expect(gcd(5, 0)).toBe(5);
        expect(gcd(0, 5)).toBe(5);
    });
});

describe("frac", () => {
    it("valide, normalise et réduit les fractions", () => {
        expect(frac(2, 4)).toEqual({ num: 1, den: 2 });
        expect(frac(3)).toEqual({ num: 3, den: 1 });
        expect(frac(-1, -2)).toEqual({ num: 1, den: 2 });
        expect(frac(1, -2)).toEqual({ num: -1, den: 2 });
        expect(frac(0, 5)).toEqual({ num: 0, den: 1 });
        expect(() => frac(1, 0)).toThrow();
        expect(() => frac(1.5, 2)).toThrow();
    });
});

describe("mul", () => {
    it("multiplie deux fractions", () => {
        expect(mul(frac(1, 2), frac(2, 3))).toEqual(frac(1, 3));
        expect(mul(frac(2, 3), frac(3, 2))).toEqual(frac(1, 1));
    });
});

describe("div", () => {
    it("divise deux fractions", () => {
        expect(div(frac(1, 2), frac(1, 4))).toEqual(frac(2, 1));
        expect(() => div(frac(1, 2), frac(0))).toThrow();
    });
});

describe("add", () => {
    it("Additionne deux fractions", () => {
        expect(add(frac(1, 2), frac(1, 3))).toEqual(frac(5, 6));
        expect(add(frac(1, 2), frac(1, 2))).toEqual(frac(1, 1));
        const third = frac(1, 3);
        expect(add(add(third, third), third)).toEqual(frac(1, 1));
    });
});

describe("sub", () => {
    it("Soustrait deux fractions", () => {
        expect(sub(frac(3, 4), frac(1, 4))).toEqual(frac(1, 2));
        expect(sub(frac(1, 2), frac(1, 2))).toEqual(frac(0, 1));
    });
});

describe("compare", () => {
    it("compare deux fractions", () => {
        expect(compare(frac(1, 2), frac(3, 4))).toBe(-1);
        expect(compare(frac(3, 4), frac(1, 2))).toBe(1);
        expect(compare(frac(1, 2), frac(2, 4))).toBe(0);
    });
});

describe("equals", () => {
    it("Vérifie l'égalite de deux fractions", () => {
        expect(equals(frac(1, 2), frac(2, 4))).toBe(true);
        expect(equals(frac(1, 2), frac(1, 3))).toBe(false);
    });
});

describe("isZero", () => {
    it("Vérifie si num est à 0", () => {
        expect(isZero(frac(0, 5))).toBe(true);
        expect(isZero(frac(1, 2))).toBe(false);
    });
});

describe("lt", () => {
    it("vérifie si a est strictement plus petit que b", () => {
        expect(lt(frac(1, 2), frac(3, 4))).toBe(true);
        expect(lt(frac(3, 4), frac(1, 2))).toBe(false);
        expect(lt(frac(1, 2), frac(2, 4))).toBe(false);
    });
});

describe("gt", () => {
    it("vérifie si a est strictement plus grand que b", () => {
        expect(gt(frac(3, 4), frac(1, 2))).toBe(true);
        expect(gt(frac(1, 2), frac(3, 4))).toBe(false);
        expect(gt(frac(1, 2), frac(2, 4))).toBe(false);
    });
});

describe("lte", () => {
    it("vérifie si a est plus petit ou égal à b", () => {
        expect(lte(frac(1, 2), frac(3, 4))).toBe(true);
        expect(lte(frac(1, 2), frac(2, 4))).toBe(true);
        expect(lte(frac(3, 4), frac(1, 2))).toBe(false);
    });
});

describe("gte", () => {
    it("vérifie si a est plus grand ou égal à b", () => {
        expect(gte(frac(3, 4), frac(1, 2))).toBe(true);
        expect(gte(frac(1, 2), frac(2, 4))).toBe(true);
        expect(gte(frac(1, 2), frac(3, 4))).toBe(false);
    });
});

describe("min", () => {
    it("retourne la plus petite fraction", () => {
        expect(min(frac(1, 2), frac(3, 4))).toEqual(frac(1, 2));
        expect(max(frac(1, 2), frac(3, 4))).toEqual(frac(3, 4));
    });
});

describe("toNumber", () => {
    it("retourne une fraction sous forme de nombre", () => {
        expect(toNumber(frac(1, 2))).toBe(0.5);
        expect(toNumber(frac(3, 4))).toBe(0.75);
    });
});

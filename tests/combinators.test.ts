import { describe, expect, it } from "vitest";
import { cat, fast, pure, slow, stack } from "../src/core/combinators";
import { event } from "../src/core/event";
import { frac } from "../src/time/fraction";
import { span } from "../src/time/timespan";

describe("pure", () => {
    it("a pour longueur sa durée", () => {
        expect(pure("a", frac(1)).length).toEqual(frac(1));
    });

    it("émet son événement quand 0 est dans la fenêtre", () => {
        expect(pure("a", frac(1)).query(span(frac(0), frac(1)))).toEqual([
            event(frac(0), frac(1), "a"),
        ]);
    });

    it("n'émet rien hors de sa fenêtre d'onset", () => {
        expect(pure("a", frac(1)).query(span(frac(1), frac(2)))).toEqual([]);
    });

    it("dur par défaut = 1", () => {
        expect(pure("a").length).toEqual(frac(1));
    });

    it("renvoie [] pour un span vide (0,0)", () => {
        expect(pure("a").query(span(frac(0), frac(0)))).toEqual([]);
    });
});

describe("stack", () => {
    it("superpose les événements de tous les patterns (même start)", () => {
        const p = stack(pure("a", frac(1)), pure("b", frac(1)));
        expect(p.query(span(frac(0), frac(1)))).toEqual([
            event(frac(0), frac(1), "a"),
            event(frac(0), frac(1), "b"),
        ]);
    });

    it("a pour longueur celle du pattern le plus long", () => {
        expect(stack(pure("a", frac(1)), pure("b", frac(2))).length).toEqual(frac(2));
    });

    it("stack() sans argument → length 0 et query vide", () => {
        const p = stack<string>();
        expect(p.length).toEqual(frac(0));
        expect(p.query(span(frac(0), frac(1)))).toEqual([]);
    });
});

describe("fast", () => {
    it("divise la longueur par le facteur", () => {
        expect(fast(frac(2), pure("a", frac(1))).length).toEqual(frac(1, 2));
    });

    it("compresse l'événement (start et dur × 1/facteur)", () => {
        const p = fast(frac(2), pure("a", frac(1)));
        expect(p.query(span(frac(0), frac(1, 2)))).toEqual([event(frac(0), frac(1, 2), "a")]);
    });

    it("fast(1, p) ≡ p", () => {
        const base = pure("a", frac(1));
        expect(fast(frac(1), base).query(span(frac(0), frac(1)))).toEqual(
            base.query(span(frac(0), frac(1))),
        );
    });

    it("refuse un facteur ≤ 0", () => {
        expect(() => fast(frac(0), pure("a", frac(1)))).toThrow();
    });

    it("accepte un facteur number entier", () => {
        expect(fast(2, pure("a", frac(1))).length).toEqual(frac(1, 2));
    });

    it("refuse un facteur flottant", () => {
        expect(() => fast(1.5, pure("a", frac(1)))).toThrow();
    });
});

describe("slow", () => {
    it("multiplie la longueur par le facteur", () => {
        expect(slow(frac(2), pure("a", frac(1))).length).toEqual(frac(2));
    });

    it("étire l'événement (dur × facteur)", () => {
        const p = slow(frac(2), pure("a", frac(1)));
        expect(p.query(span(frac(0), frac(2)))).toEqual([event(frac(0), frac(2), "a")]);
    });

    it("loi d'inversion : slow(n, fast(n, p)) ≡ p", () => {
        const base = pure("a", frac(1));
        const roundtrip = slow(frac(2), fast(frac(2), base));
        expect(roundtrip.length).toEqual(base.length);
        expect(roundtrip.query(span(frac(0), frac(1)))).toEqual(base.query(span(frac(0), frac(1))));
    });
});

describe("Phase 0 — démonstration bout-en-bout", () => {
    it("compose pure, fast et stack", () => {
        const p = stack(pure("a", frac(1)), fast(frac(2), pure("b", frac(1))));

        expect(p.length).toEqual(frac(1));
        expect(p.query(span(frac(0), p.length))).toEqual([
            event(frac(0), frac(1), "a"),
            event(frac(0), frac(1, 2), "b"),
        ]);
    });
});

describe("cat", () => {
    it("place les patterns bout à bout", () => {
        const p = cat(pure("a", frac(1)), pure("b", frac(1)));
        expect(p.length).toEqual(frac(2));
        expect(p.query(span(frac(0), p.length))).toEqual([
            event(frac(0), frac(1), "a"),
            event(frac(1), frac(1), "b"),
        ]);
    });

    it("gère des longueurs différentes", () => {
        const p = cat(pure("a", frac(2)), pure("b", frac(1)));
        expect(p.length).toEqual(frac(3));
        expect(p.query(span(frac(0), p.length))).toEqual([
            event(frac(0), frac(2), "a"),
            event(frac(2), frac(1), "b"),
        ]);
    });

    it("ne renvoie que les events de la fenêtre (C1)", () => {
        const p = cat(pure("a", frac(1)), pure("b", frac(1)));
        expect(p.query(span(frac(1), frac(2)))).toEqual([event(frac(1), frac(1), "b")]);
    });

    it("cat() vide → pattern vide", () => {
        const p = cat<string>();
        expect(p.length).toEqual(frac(0));
        expect(p.query(span(frac(0), frac(1)))).toEqual([]);
    });
});

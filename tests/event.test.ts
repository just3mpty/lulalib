import { describe, expect, it } from "vitest";
import { endOf, event, scaleEvent, shiftEvent } from "../src/core/event";
import { frac } from "../src/time/fraction";

describe("event", () => {
    it("construit un événement porteur d'une valeur", () => {
        const e = event(frac(1), frac(2), "C4");
        expect(e).toEqual({ start: frac(1), dur: frac(2), value: "C4" });
    });
});

describe("endOf", () => {
    it("renvoie start + dur", () => {
        expect(endOf(event(frac(1), frac(2), "C4"))).toEqual(frac(3));
    });
});

describe("shiftEvent", () => {
    it("décale start, garde dur et value", () => {
        expect(shiftEvent(event(frac(1), frac(2), "C4"), frac(3))).toEqual(
            event(frac(4), frac(2), "C4"),
        );
    });
});

describe("scaleEvent", () => {
    it("multiplie start ET dur par factor", () => {
        expect(scaleEvent(event(frac(2), frac(1), "C4"), frac(1, 2))).toEqual(
            event(frac(1), frac(1, 2), "C4"),
        );
    });
});

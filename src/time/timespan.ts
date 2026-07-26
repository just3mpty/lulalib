import { add, type Fraction, lt, lte, max, min, sub } from "./fraction";

export type TimeSpan = {
    readonly begin: Fraction;
    readonly end: Fraction;
};

export function span(begin: Fraction, end: Fraction): TimeSpan {
    if (lte(begin, end)) return { begin, end };
    throw new Error("Fenêtre invalide");
}

export function duration(s: TimeSpan): Fraction {
    return sub(s.end, s.begin);
}

export function contains(s: TimeSpan, t: Fraction): boolean {
    return lt(t, s.end) && lte(s.begin, t);
}

export function intersect(a: TimeSpan, b: TimeSpan): TimeSpan | null {
    const begin = max(a.begin, b.begin);
    const end = min(a.end, b.end);

    if (!lt(begin, end)) return null;

    return span(begin, end);
}

export function shift(s: TimeSpan, delta: Fraction): TimeSpan {
    return span(add(s.begin, delta), add(s.end, delta));
}

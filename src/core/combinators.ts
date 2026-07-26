import { compare, div, type Fraction, frac, lte, max, mul, toFraction } from "../time/fraction";
import { contains, span } from "../time/timespan";
import { event, scaleEvent } from "./event";
import type { Pattern } from "./pattern";

export function pure<T>(value: T, dur: Fraction = frac(1)): Pattern<T> {
    return {
        length: dur,
        query: (span) => (contains(span, frac(0)) ? [event(frac(0), dur, value)] : []),
    };
}

export function stack<T>(...patterns: Pattern<T>[]): Pattern<T> {
    let length = frac(0);
    for (const p of patterns) {
        length = max(length, p.length);
    }

    return {
        length,
        query: (span) => {
            const all = patterns.flatMap((p) => p.query(span));
            return all.sort((e1, e2) => compare(e1.start, e2.start));
        },
    };
}

export function fast<T>(factor: number | Fraction, p: Pattern<T>): Pattern<T> {
    const f = toFraction(factor);
    if (lte(f, frac(0))) {
        throw new Error("fast: factor must be > 0");
    }

    return {
        length: div(p.length, f),
        query: (s) => {
            const dilated = span(mul(s.begin, f), mul(s.end, f));
            return p.query(dilated).map((e) => scaleEvent(e, div(frac(1), f)));
        },
    };
}

export function slow<T>(factor: number | Fraction, p: Pattern<T>): Pattern<T> {
    const f = toFraction(factor);
    return fast(div(frac(1), f), p);
}

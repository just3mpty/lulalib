import {
    add,
    compare,
    div,
    type Fraction,
    frac,
    lte,
    max,
    mul,
    sub,
    toFraction,
} from "../time/fraction";
import { contains, shift, span } from "../time/timespan";
import { type Event, event, scaleEvent, shiftEvent } from "./event";
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

export function cat<T>(...patterns: Pattern<T>[]): Pattern<T> {
    const length = patterns.reduce((acc, p) => add(acc, p.length), frac(0));

    return {
        length,
        query: (s) => {
            const out: Event<T>[] = [];
            let offset = frac(0);
            for (const p of patterns) {
                const localSpan = shift(s, sub(frac(0), offset));
                const localEvents = p.query(localSpan);
                for (const e of localEvents) {
                    out.push(shiftEvent(e, offset));
                }
                offset = add(offset, p.length);
            }
            return out.sort((a, b) => compare(a.start, b.start));
        },
    };
}

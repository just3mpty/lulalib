import { cat, silence } from "../core/combinators";
import type { Key } from "../theory/scale";
import { add, type Fraction, frac, max } from "../time/fraction";
import type { Track } from "./track";

export type BuildContext = { key?: Key; baseOctave?: number };

export type Buildable = Track | { length: Fraction; build(ctx?: BuildContext): Track };

export type Section = {
    name?: string;
    tracks: Buildable[];
    length: Fraction;
    repeat(n: number): Section[];
    with(extra: Buildable[]): Section;
};

function itemLength(item: Buildable): Fraction {
    return "build" in item ? item.length : item.pattern.length;
}

export function toTrack(item: Buildable, ctx?: BuildContext): Track {
    return "build" in item ? item.build(ctx) : item;
}

export function at(offset: Fraction, item: Buildable): Buildable {
    return {
        length: add(offset, itemLength(item)),
        build: (ctx) => {
            const trk = toTrack(item, ctx);
            return { instrument: trk.instrument, pattern: cat(silence(offset), trk.pattern) };
        },
    };
}

export function section(tracks: Buildable[], name?: string): Section {
    let length = frac(0);
    for (const item of tracks) {
        length = max(length, itemLength(item));
    }
    const self: Section = {
        name,
        tracks,
        length,
        repeat: (n) => Array.from({ length: n }, () => self),
        with: (extra) => section([...tracks, ...extra], name),
    };
    return self;
}

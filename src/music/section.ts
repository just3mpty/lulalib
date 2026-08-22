import type { Key } from "../theory/scale";
import { type Fraction, frac, max } from "../time/fraction";
import type { Track } from "./track";

export type BuildContext = { key?: Key; baseOctave?: number };

export type Buildable = Track | { length: Fraction; build(ctx?: BuildContext): Track };

export type Section = {
    name?: string;
    tracks: Buildable[];
    length: Fraction;
};

function itemLength(item: Buildable): Fraction {
    return "build" in item ? item.length : item.pattern.length;
}

export function toTrack(item: Buildable, ctx?: BuildContext): Track {
    return "build" in item ? item.build(ctx) : item;
}

export function section(tracks: Buildable[], name?: string): Section {
    let length = frac(0);
    for (const item of tracks) {
        length = max(length, itemLength(item));
    }
    return { name, tracks, length };
}

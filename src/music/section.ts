import { type Fraction, frac, max } from "../time/fraction";
import type { Track } from "./track";

export type Section = {
    name?: string;
    tracks: Track[];
    length: Fraction;
};

export function section(tracks: Track[], name?: string): Section {
    let length = frac(0);
    tracks.forEach((track) => {
        length = max(length, track.pattern.length);
    });
    return { name, tracks, length };
}

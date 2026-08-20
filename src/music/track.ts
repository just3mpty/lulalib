import type { Pattern } from "../core/pattern";
import { parseMelody } from "../notation/melody";
import { parseRhythm } from "../notation/rhythm";
import { type Fraction, frac } from "../time/fraction";
import { flattenMelody, resolve } from "./resolve";
import type { EventValue } from "./value";

export type Track = { instrument: string; pattern: Pattern<EventValue> };

export function track(
    instrument: string,
    spec: { notes?: string; rhythm?: string; step?: Fraction; part?: string },
): Track {
    const { notes, rhythm, step = frac(1, 4), part } = spec;
    if (!notes && !rhythm) {
        throw new Error("Ni note ni rythme");
    }
    const melody = parseMelody(notes ?? "");
    const rhythmSrc = rhythm ?? "x".repeat(flattenMelody(melody).length);
    const pattern = resolve(melody, parseRhythm(rhythmSrc), { instrument, step, part });

    return { instrument, pattern };
}

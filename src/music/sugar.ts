import { stack } from "../core/combinators";
import type { Fraction } from "../time/fraction";
import { type Track, track } from "./track";
import type { EventValue } from "./value";

type Melodic = Track & {
    notes(pitches: string): Melodic;
    rhythm(rhythmPattern: string): Melodic;
    step(value: Fraction): Melodic;
};

type MelodicSpec = { instrument: string; notes?: string; rhythm?: string; step?: Fraction };

type Drums = Track & {
    kick(rhythm: string): Drums;
    snare(rhythm: string): Drums;
    hihat(rhythm: string): Drums;
    part(name: string, rhythm: string): Drums;
    step(value: Fraction): Drums;
};

type DrumSpec = {
    instrument: string;
    parts: { name: string; rhythm: string }[];
    step?: Fraction;
};

function buildDrums(spec: DrumSpec): Drums {
    const pattern = stack(
        ...spec.parts.map(
            (p) =>
                track(spec.instrument, { rhythm: p.rhythm, part: p.name, step: spec.step }).pattern,
        ),
    );

    const addPart = (name: string, rhythm: string): Drums =>
        buildDrums({ ...spec, parts: [...spec.parts, { name, rhythm }] });

    return {
        instrument: spec.instrument,
        pattern,
        kick: (rhythm) => addPart("kick", rhythm),
        snare: (rhythm) => addPart("snare", rhythm),
        hihat: (rhythm) => addPart("hihat", rhythm),
        part: (name, rhythm) => addPart(name, rhythm),
        step: (value) => buildDrums({ ...spec, step: value }),
    };
}

export function drums(instrument: string): Drums {
    return buildDrums({ instrument, parts: [] });
}

function buildMelodic(spec: MelodicSpec): Melodic {
    const hasContent = spec.notes !== undefined || spec.rhythm !== undefined;

    const pattern = hasContent
        ? track(spec.instrument, { notes: spec.notes, rhythm: spec.rhythm, step: spec.step })
              .pattern
        : stack<EventValue>(); // rien de réglé → pattern vide (stack() = length 0, aucun event)

    return {
        instrument: spec.instrument,
        pattern,
        notes: (pitches) => buildMelodic({ ...spec, notes: pitches }),
        rhythm: (rhythmPattern) => buildMelodic({ ...spec, rhythm: rhythmPattern }),
        step: (value) => buildMelodic({ ...spec, step: value }),
    };
}

export function bass(instrument: string): Melodic {
    return buildMelodic({ instrument });
}

export function lead(instrument: string): Melodic {
    return buildMelodic({ instrument });
}

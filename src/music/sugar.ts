import { stack } from "../core/combinators";
import { type Key, parseKey, resolveDegrees } from "../theory/scale";
import type { Fraction } from "../time/fraction";
import type { BuildContext } from "./section";
import { type Track, track } from "./track";
import type { EventValue } from "./value";

const DEFAULT_KEY: Key = parseKey("C");

// --- sucre mélodique : bass() / lead() / inst() ---

export type MelodicBuilder = {
    readonly length: Fraction;
    notes(pitches: string): MelodicBuilder;
    rhythm(pattern: string): MelodicBuilder;
    step(value: Fraction): MelodicBuilder;
    octave(n: number): MelodicBuilder;
    build(ctx?: BuildContext): Track;
};

type MelodicSpec = {
    instrument: string;
    notes?: string;
    rhythm?: string;
    step?: Fraction;
    baseOctave?: number;
};

function buildMelodicTrack(spec: MelodicSpec, ctx?: BuildContext): Track {
    if (spec.notes === undefined && spec.rhythm === undefined) {
        return { instrument: spec.instrument, pattern: stack<EventValue>() };
    }
    const baseOctave = spec.baseOctave ?? ctx?.baseOctave ?? 4;
    const resolvedNotes = resolveDegrees(spec.notes ?? "", ctx?.key, baseOctave);
    return track(spec.instrument, {
        notes: resolvedNotes === "" ? undefined : resolvedNotes,
        rhythm: spec.rhythm,
        step: spec.step,
    });
}

function melodic(spec: MelodicSpec): MelodicBuilder {
    return {
        length: buildMelodicTrack(spec, { key: DEFAULT_KEY }).pattern.length,
        notes: (pitches) => melodic({ ...spec, notes: pitches }),
        rhythm: (pattern) => melodic({ ...spec, rhythm: pattern }),
        step: (value) => melodic({ ...spec, step: value }),
        octave: (n) => melodic({ ...spec, baseOctave: n }),
        build: (ctx) => buildMelodicTrack(spec, ctx),
    };
}

export function bass(instrument: string): MelodicBuilder {
    return melodic({ instrument });
}

export function lead(instrument: string): MelodicBuilder {
    return melodic({ instrument });
}

export function inst(instrument: string): MelodicBuilder {
    return melodic({ instrument });
}

// --- sucre percussions : drums() ---

export type DrumsBuilder = {
    readonly length: Fraction;
    kick(rhythm: string): DrumsBuilder;
    snare(rhythm: string): DrumsBuilder;
    hihat(rhythm: string): DrumsBuilder;
    part(name: string, rhythm: string): DrumsBuilder;
    step(value: Fraction): DrumsBuilder;
    build(ctx?: BuildContext): Track;
};

type DrumSpec = {
    instrument: string;
    parts: { name: string; rhythm: string }[];
    step?: Fraction;
};

function buildDrumsTrack(spec: DrumSpec): Track {
    const pattern = stack(
        ...spec.parts.map(
            (p) =>
                track(spec.instrument, { rhythm: p.rhythm, part: p.name, step: spec.step }).pattern,
        ),
    );
    return { instrument: spec.instrument, pattern };
}

function drumsBuilder(spec: DrumSpec): DrumsBuilder {
    const addPart = (name: string, rhythm: string): DrumsBuilder =>
        drumsBuilder({ ...spec, parts: [...spec.parts, { name, rhythm }] });

    return {
        length: buildDrumsTrack(spec).pattern.length,
        kick: (rhythm) => addPart("kick", rhythm),
        snare: (rhythm) => addPart("snare", rhythm),
        hihat: (rhythm) => addPart("hihat", rhythm),
        part: (name, rhythm) => addPart(name, rhythm),
        step: (value) => drumsBuilder({ ...spec, step: value }),
        build: () => buildDrumsTrack(spec),
    };
}

export function drums(instrument: string): DrumsBuilder {
    return drumsBuilder({ instrument, parts: [] });
}

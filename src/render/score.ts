import { stack } from "../core/combinators";
import type { Track } from "../music/track";
import { type Fraction, frac } from "../time/fraction";
import { span } from "../time/timespan";

export type ScoreEvent = {
    start: string;
    dur: string;
    instrument: string;
    part?: string;
    note?: string;
    velocity?: number;
};

export type Score = {
    version: number;
    bpm: number;
    key?: string;
    timeSignature?: [number, number];
    duration: string;
    instruments: Record<string, { parts?: string[] }>;
    events: ScoreEvent[];
};

function serializeFraction(f: Fraction): string {
    return `${f.num}/${f.den}`;
}

export function toScore(
    tracks: Track | Track[],
    meta: { bpm: number; key?: string; timeSignature?: [number, number] },
): Score {
    const list = Array.isArray(tracks) ? tracks : [tracks];
    const merged = stack(...list.map((t) => t.pattern));
    const filteredEvents = merged.query(span(frac(0), merged.length));
    const events: ScoreEvent[] = filteredEvents.map((e) => ({
        start: serializeFraction(e.start),
        dur: serializeFraction(e.dur),
        instrument: e.value.instrument,
        ...(e.value.note !== undefined ? { note: e.value.note } : {}),
        ...(e.value.part !== undefined ? { part: e.value.part } : {}),
        ...(e.value.velocity !== undefined ? { velocity: e.value.velocity } : {}),
    }));
    const instruments: Record<string, { parts?: string[] }> = {};
    for (const t of list) {
        instruments[t.instrument] = {};
    }

    return {
        version: 1,
        bpm: meta.bpm,
        ...(meta.key !== undefined ? { key: meta.key } : {}),
        ...(meta.timeSignature !== undefined ? { timeSignature: meta.timeSignature } : {}),
        duration: serializeFraction(merged.length),
        instruments,
        events,
    };
}

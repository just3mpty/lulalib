import { stack } from "../core/combinators";
import type { Event } from "../core/event";
import type { Pattern } from "../core/pattern";
import type { Track } from "../music/track";
import type { EventValue } from "../music/value";
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

export type ScoreMeta = { bpm: number; key?: string; timeSignature?: [number, number] };

function serializeFraction(f: Fraction): string {
    return `${f.num}/${f.den}`;
}

function toScoreEvent(e: Event<EventValue>): ScoreEvent {
    return {
        start: serializeFraction(e.start),
        dur: serializeFraction(e.dur),
        instrument: e.value.instrument,
        ...(e.value.note !== undefined ? { note: e.value.note } : {}),
        ...(e.value.part !== undefined ? { part: e.value.part } : {}),
        ...(e.value.velocity !== undefined ? { velocity: e.value.velocity } : {}),
    };
}

export function scoreFromPattern(pattern: Pattern<EventValue>, meta: ScoreMeta): Score {
    const events = pattern.query(span(frac(0), pattern.length)).map(toScoreEvent);
    const instruments: Record<string, { parts?: string[] }> = {};
    for (const e of events) {
        const entry = instruments[e.instrument] ?? {};
        if (e.part !== undefined) {
            const parts = entry.parts ?? [];
            if (!parts.includes(e.part)) {
                parts.push(e.part);
            }
            entry.parts = parts;
        }
        instruments[e.instrument] = entry;
    }

    return {
        version: 1,
        bpm: meta.bpm,
        ...(meta.key !== undefined ? { key: meta.key } : {}),
        ...(meta.timeSignature !== undefined ? { timeSignature: meta.timeSignature } : {}),
        duration: serializeFraction(pattern.length),
        instruments,
        events,
    };
}

export function toScore(tracks: Track | Track[], meta: ScoreMeta): Score {
    const list = Array.isArray(tracks) ? tracks : [tracks];
    const merged = stack(...list.map((t) => t.pattern));
    return scoreFromPattern(merged, meta);
}

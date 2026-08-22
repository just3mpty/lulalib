import type { Score } from "../render/score";
import { noteToSemitones } from "../theory/note";

export type MidiEvent = {
    tick: number;
    kind: "on" | "off";
    channel: number;
    note: number;
    velocity: number;
};

const DRUM_NOTES: Record<string, number> = { kick: 36, snare: 38, hihat: 42, clap: 39, tom: 45 };

export function writeVarLength(value: number): number[] {
    const bytes = [value & 0x7f];
    let rest = value >> 7;
    while (rest > 0) {
        bytes.unshift((rest & 0x7f) | 0x80);
        rest >>= 7;
    }
    return bytes;
}

export function uint16(value: number): number[] {
    return [(value >> 8) & 0xff, value & 0xff];
}

export function uint32(value: number): number[] {
    return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function ticksFromFraction(value: string, ppq: number): number {
    const parts = value.split("/");
    return Math.round((Number(parts[0]) * ppq) / Number(parts[1]));
}

export function scoreToMidiEvents(score: Score, ppq = 480): MidiEvent[] {
    const channels = new Map<string, number>();
    let nextChannel = 0;
    const channelOf = (instrument: string): number => {
        const existing = channels.get(instrument);
        if (existing !== undefined) return existing;
        if (nextChannel === 9) nextChannel = 10;
        channels.set(instrument, nextChannel);
        return nextChannel++;
    };

    const events: MidiEvent[] = [];
    for (const e of score.events) {
        const startTick = ticksFromFraction(e.start, ppq);
        const endTick = startTick + ticksFromFraction(e.dur, ppq);
        const velocity = e.velocity !== undefined ? Math.round(e.velocity * 127) : 100;

        const isPercussion = e.note === undefined;
        const channel = isPercussion ? 9 : channelOf(e.instrument);
        const note = isPercussion
            ? (DRUM_NOTES[e.part ?? ""] ?? 37)
            : noteToSemitones(e.note ?? "C4");

        events.push({ tick: startTick, kind: "on", channel, note, velocity });
        events.push({ tick: endTick, kind: "off", channel, note, velocity: 0 });
    }

    events.sort(
        (a, b) => a.tick - b.tick || (a.kind === "off" ? -1 : 1) - (b.kind === "off" ? -1 : 1),
    );
    return events;
}

export function encodeTrackData(events: MidiEvent[], bpm: number): number[] {
    const bytes: number[] = [];

    const usPerQuarter = Math.round(60_000_000 / bpm);
    bytes.push(
        0x00,
        0xff,
        0x51,
        0x03,
        (usPerQuarter >> 16) & 0xff,
        (usPerQuarter >> 8) & 0xff,
        usPerQuarter & 0xff,
    );

    let prevTick = 0;
    for (const e of events) {
        const delta = e.tick - prevTick;
        prevTick = e.tick;
        bytes.push(...writeVarLength(delta));
        const status = (e.kind === "on" ? 0x90 : 0x80) | e.channel;
        bytes.push(status, e.note, e.velocity);
    }

    bytes.push(0x00, 0xff, 0x2f, 0x00);
    return bytes;
}

const MTHD = Array.from("MThd", (c) => c.charCodeAt(0));
const MTRK = Array.from("MTrk", (c) => c.charCodeAt(0));

export function toMIDI(score: Score, opts?: { ppq?: number }): Uint8Array {
    const ppq = opts?.ppq ?? 480;
    const trackData = encodeTrackData(scoreToMidiEvents(score, ppq), score.bpm);

    const header = [...MTHD, ...uint32(6), ...uint16(0), ...uint16(1), ...uint16(ppq)];
    const track = [...MTRK, ...uint32(trackData.length), ...trackData];

    return Uint8Array.from([...header, ...track]);
}

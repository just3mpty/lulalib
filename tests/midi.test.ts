import { describe, expect, it } from "vitest";
import {
    encodeTrackData,
    scoreToMidiEvents,
    toMIDI,
    uint16,
    uint32,
    writeVarLength,
} from "../src/export/midi";
import { drums } from "../src/music/sugar";
import { track } from "../src/music/track";
import { toScore } from "../src/render/score";

describe("scoreToMidiEvents", () => {
    it("transforme une note en note-on + note-off", () => {
        const score = toScore(track("acid", { notes: "C4", rhythm: "x" }), { bpm: 120 });
        expect(scoreToMidiEvents(score, 480)).toEqual([
            { tick: 0, kind: "on", channel: 0, note: 60, velocity: 100 },
            { tick: 120, kind: "off", channel: 0, note: 60, velocity: 0 },
        ]);
    });

    it("route les percussions sur le canal 9 avec la note GM", () => {
        const score = toScore(drums("909").kick("x").build(), { bpm: 120 });
        expect(scoreToMidiEvents(score, 480)[0]).toEqual({
            tick: 0,
            kind: "on",
            channel: 9,
            note: 36,
            velocity: 100,
        });
    });
});

describe("writeVarLength", () => {
    it("encode en quantité variable", () => {
        expect(writeVarLength(0)).toEqual([0x00]);
        expect(writeVarLength(127)).toEqual([0x7f]);
        expect(writeVarLength(128)).toEqual([0x81, 0x00]);
        expect(writeVarLength(480)).toEqual([0x83, 0x60]);
    });
});

describe("uint16 / uint32", () => {
    it("encode en big-endian", () => {
        expect(uint16(6)).toEqual([0x00, 0x06]);
        expect(uint32(6)).toEqual([0x00, 0x00, 0x00, 0x06]);
    });
});

describe("encodeTrackData", () => {
    it("encode la piste (tempo, notes en delta, end-of-track)", () => {
        const score = toScore(track("acid", { notes: "C4", rhythm: "x" }), { bpm: 120 });
        expect(encodeTrackData(scoreToMidiEvents(score, 480), 120)).toEqual([
            0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0x90, 0x3c, 0x64, 0x78, 0x80, 0x3c,
            0x00, 0x00, 0xff, 0x2f, 0x00,
        ]);
    });
});

describe("toMIDI", () => {
    const score = toScore(track("acid", { notes: "C4", rhythm: "x" }), { bpm: 120 });

    it("produit un Uint8Array commençant par l'en-tête MThd", () => {
        const midi = toMIDI(score);
        expect(midi).toBeInstanceOf(Uint8Array);
        expect(Array.from(midi.slice(0, 14))).toEqual([
            0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0,
        ]);
        expect(Array.from(midi.slice(14, 18))).toEqual([0x4d, 0x54, 0x72, 0x6b]);
    });
});

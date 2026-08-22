export { cat, fast, pure, silence, slow, stack } from "./core/combinators";
export { type Event, endOf, event, scaleEvent, shiftEvent } from "./core/event";
export type { Pattern } from "./core/pattern";
export type { Exporter } from "./export/exporter";
export { toJSON } from "./export/json";
export { toMIDI } from "./export/midi";
export { at, type Buildable, type BuildContext, type Section, section } from "./music/section";
export { type Song, song } from "./music/song";
export { bass, type DrumsBuilder, drums, inst, lead, type MelodicBuilder } from "./music/sugar";
export { type Track, track } from "./music/track";
export type { EventValue } from "./music/value";
export type { MelodyAst, MelodyNode, RhythmAst, RhythmNode } from "./notation/ast";
export { ParseError } from "./notation/errors";
export { parseMelody } from "./notation/melody";
export { parseRhythm } from "./notation/rhythm";
export { type Score, type ScoreEvent, type ScoreMeta, toScore } from "./render/score";
export { noteToSemitones, semitonesToNote, transpose } from "./theory/note";
export { degreeToNote, type Key, parseKey, scaleNotes } from "./theory/scale";

export {
    add,
    compare,
    div,
    equals,
    type Fraction,
    frac,
    gt,
    gte,
    isZero,
    lt,
    lte,
    max,
    min,
    mul,
    parseFraction,
    sub,
    toFraction,
    toNumber,
} from "./time/fraction";
export { contains, duration, intersect, shift, span, type TimeSpan } from "./time/timespan";

# Uzume, guide for agents

This document teaches an agent (LLM, coding assistant) to **compose music with `uzume`** and write correct code on the first try. It covers what the library does, the exact API, and the pitfalls to avoid.

## What uzume does (and does not)

Uzume is a declarative DSL: you describe *what* to play, *when*, and *with which instrument*, and the library compiles that into a **Score**, a flat object serializable to JSON.

- It produces a Score, exportable to JSON or MIDI.
- It generates **no audio** and schedules nothing in real time. To hear a Score, export it to MIDI (open in a DAW) or hand it to an external player. Never expect the library itself to "play" a sound.

The core has **zero runtime dependencies** and uses neither the DOM nor Node: it runs anywhere.

## Installation

```bash
npm install uzume     # or: pnpm add uzume
```

```ts
import { song, section, bass, lead, drums, toJSON, toMIDI } from "uzume";
```

## Mental model: two axes

```
ARRANGEMENT (horizontal, -> cat)   intro -> verse -> chorus -> verse
SECTION     (vertical,   -> stack) drums + bass + lead play together
```

- **track / sugar**: one part = one instrument + one pattern. Written with `bass()`, `lead()`, `inst()` (melodic) or `drums()` (percussion).
- **`section([...])`**: tracks that play **simultaneously** (stacked).
- **`song().arrange([...])`**: sections placed **one after another**, exported to a Score.

Everything is **immutable**: every method returns a new value. Reusing a `section` or a `song` is safe. Never rely on in-place mutation.

## Minimal recipe

```ts
const verse = section([
    drums("909").kick("x---x---").snare("----x---").hihat("xxxxxxxx"),
    bass("acid").notes("1 5 1 4").rhythm("x-x-x-x-"),
    lead("saw").notes("1 3 5 3").octave(5).rhythm("x-x-x-x-"),
]);

const score = song({ bpm: 120, key: "Am" })
    .arrange([verse, verse])
    .export();

const json = toJSON(score, { pretty: true });
const midi = toMIDI(score); // Uint8Array (standard MIDI file)
```

## API

### Melodic sugar: `bass` / `lead` / `inst`

The three are identical **aliases** (semantic names). Signature: `bass(instrument: string) -> MelodicBuilder`.

| Method | Purpose |
| --- | --- |
| `.notes(pitches: string)` | the pitches (absolute notes or degrees), in melody mini-notation |
| `.rhythm(pattern: string)` | the rhythm, in rhythm mini-notation |
| `.step(value: string)` | duration of one step, e.g. `"1/8"` (default `"1/4"`) |
| `.octave(n: number)` | base octave for degrees (default 4) |
| `.build(ctx?)` | returns a `Track` (called automatically by `section`/`song`) |

If `.rhythm()` is omitted, each note is triggered once. If `.notes()` is omitted, the pattern is empty.

### Percussion sugar: `drums`

`drums(instrument: string) -> DrumsBuilder`. Each method adds a **part** (a named rhythmic sub-track):

| Method | Purpose |
| --- | --- |
| `.kick(rhythm)` / `.snare(rhythm)` / `.hihat(rhythm)` | shortcuts for the parts named `"kick"`/`"snare"`/`"hihat"` |
| `.part(name, rhythm)` | a part with a free name (e.g. `"clap"`, `"tom"`) |
| `.step(value: string)` | duration of one step (default `"1/4"`) |
| `.build(ctx?)` | returns a `Track` |

```ts
drums("909").kick("x---x---").snare("----x---").hihat("xxxxxxxx").part("clap", "----x---");
```

### `section(tracks, name?)`

`section(tracks: Buildable[], name?: string) -> Section`. Stacks the tracks (simultaneous play). The section length equals that of its longest track.

| Method | Purpose |
| --- | --- |
| `.repeat(n)` | returns **an array** of the section `n` times (pass it straight to `arrange`, which flattens) |
| `.with(extra)` | returns a **new** section with extra tracks added (immutable) |

### `song(meta)`

`song({ bpm, key?, timeSignature? }) -> Song`.

| Method | Purpose |
| --- | --- |
| `.arrange(sections)` | accepts an array of `Section` **or `Section[]`** (flattened automatically, so `.repeat()` fits in) |
| `.export()` | resolves degrees against the `key` and returns the `Score` |

```ts
song({ bpm: 128, key: "Cm" }).arrange([intro, verse.repeat(2), chorus]).export();
```

### `at(offset, item)`

Shifts an element in time: `at(offset: Fraction, item) -> Buildable`. The offset is a fraction, built with `frac` (exported).

```ts
import { at, frac } from "uzume";
section([at(frac(3), drums("909").part("crash", "x"))]); // crash on the 3rd beat
```

## Mini-notation

### Rhythm (the timeline)

One character = one step. Default step = `"1/4"` (a sixteenth note).

| Symbol | Meaning |
| --- | --- |
| `x` (or any non-reserved char) | trigger |
| `-` `~` | rest |
| `_` | hold (extends the previous note by one step) |
| `@n` | hold for `n` steps (`x@4` == `x___`) |
| `[ ... ]` `*n` | group + repetition |
| space | ignored (visual grouping) |

### Melody (a pool of pitches, drawn cyclically on each trigger)

| Token | Meaning |
| --- | --- |
| `C4` `Eb4` `F#3` | absolute note |
| `C4,E4,G4` | a chord: **commas, no spaces** |
| `1`-`7` | scale degree (requires `key`; `#`/`b` **after** the digit; `'` up, `.` down one octave) |
| `[ ... ]` `*n` | group + repetition |

## Time: the unit is the beat

One Score time unit = **1 beat** (a quarter note). A default step of `"1/4"` is therefore 1/4 of a beat (a sixteenth note). In the Score, `start` and `dur` are fractions serialized as strings (`"1/4"`, `"3/2"`), **never floats**.

To convert to seconds (e.g. in a player):

```
seconds = (num / den) * 60 / bpm
```

## Degrees and key

Degrees (`1`-`7`) are resolved only at `export()`, against the `song`'s `key`. The *same* code yields different notes depending on the key:

- `key: "Cm"` -> `notes("1 3 5")` becomes `C Eb G`.
- `key: "C"` -> `notes("1 3 5")` becomes `C E G`.

Without a `key`, use only absolute notes (`C4`, `Eb3`...). `.octave(n)` sets the base octave for degrees.

## The Score and the exporters

`export()` (and `toScore(tracks, meta)` for low-level use) produce:

```json
{
  "version": 1,
  "bpm": 120,
  "key": "Am",
  "duration": "2/1",
  "instruments": { "909": { "parts": ["kick", "snare", "hihat"] }, "acid": {} },
  "events": [
    { "start": "0/1", "dur": "1/4", "instrument": "909", "part": "kick" },
    { "start": "0/1", "dur": "1/4", "instrument": "acid", "note": "A2" }
  ]
}
```

Each event has **either** `part` (percussion) **or** `note` (melodic), never both. `instrument` is just a **name**: it is up to the player to decide which sound to map to it.

- `toJSON(score, { pretty? })` -> a JSON string.
- `toMIDI(score, { ppq? })` -> a `Uint8Array` (standard MIDI file; percussion on channel 10, General MIDI drum map).

## Rules for agents (common pitfalls)

- **No audio.** Never assume the library plays a sound; it produces a Score.
- **`note` xor `part`.** A melodic event carries `note`, a drum event carries `part`.
- **Chords without spaces**: `"C4,E4,G4"`, never `"C4, E4, G4"`.
- **`.step()` takes a string** (`"1/8"`), not a number nor a Fraction.
- **Immutable**: always keep the returned value (`x = x.with(...)`); do not expect a mutation.
- **`.repeat(n)` returns an array**; pass it to `arrange`, which flattens.
- **Degrees require a `key`.** Without one, use absolute notes.
- **Time unit = beat**, not seconds nor the bar.

## Export reference

DSL: `bass` `lead` `inst` `drums` - Composition: `section` `song` `track` `at` - Export: `toScore` `toJSON` `toMIDI` - Theory: `noteToSemitones` `semitonesToNote` `transpose` `degreeToNote` `parseKey` `scaleNotes` - Time: `frac` `add` `sub` `mul` `div` `compare` `equals` `lt` `lte` `gt` `gte` `min` `max` `isZero` `toNumber` `toFraction` `parseFraction` - Timespan: `span` `duration` `contains` `intersect` `shift` - Patterns: `pure` `stack` `fast` `slow` `cat` `silence` `event` `endOf` `shiftEvent` `scaleEvent` - Mini-notation: `parseRhythm` `parseMelody` `ParseError`.

import { type Event, event } from "../core/event";
import type { Pattern } from "../core/pattern";
import type { MelodyAst, RhythmAst } from "../notation/ast";
import { ParseError } from "../notation/errors";
import { compare, type Fraction, frac, mul } from "../time/fraction";
import { contains } from "../time/timespan";
import type { EventValue } from "./value";

type RhythmAtom = { type: "trigger" } | { type: "hold" } | { type: "rest" };

export function flattenMelody(nodes: MelodyAst): string[][] {
    const pool: string[][] = [];
    for (const node of nodes) {
        for (let r = 0; r < node.repeat; r++) {
            if (node.type === "note") {
                pool.push([node.pitch]);
            } else if (node.type === "chord") {
                pool.push(node.pitches);
            } else {
                pool.push(...flattenMelody(node.children));
            }
        }
    }
    return pool;
}

export function flattenRhythm(nodes: RhythmAst): RhythmAtom[] {
    const atoms: RhythmAtom[] = [];
    for (const node of nodes) {
        if (node.type === "trigger") {
            atoms.push({ type: "trigger" });
            const sustain = node.sustain ?? 1;
            for (let s = 1; s < sustain; s++) {
                atoms.push({ type: "hold" });
            }
        } else if (node.type === "hold") {
            atoms.push({ type: "hold" });
        } else if (node.type === "rest") {
            atoms.push({ type: "rest" });
        } else {
            for (let r = 0; r < node.repeat; r++) {
                atoms.push(...flattenRhythm(node.children));
            }
        }
    }
    return atoms;
}

type Pending = { startStep: number; steps: number; pitches: string[] };

export function resolve(
    melody: MelodyAst,
    rhythm: RhythmAst,
    opts: { instrument: string; step: Fraction },
): Pattern<EventValue> {
    const { instrument, step } = opts;
    const pool = flattenMelody(melody);
    const grid = flattenRhythm(rhythm);

    const events: Event<EventValue>[] = [];
    let poolIndex = 0;
    let current: Pending | null = null;

    const finalize = (): void => {
        if (current === null) {
            return;
        }
        const start = mul(step, frac(current.startStep));
        const dur = mul(step, frac(current.steps));
        if (current.pitches.length === 0) {
            events.push(event(start, dur, { instrument }));
        } else {
            for (const pitch of current.pitches) {
                events.push(event(start, dur, { instrument, note: pitch }));
            }
        }
    };

    for (const [i, atom] of grid.entries()) {
        if (atom.type === "trigger") {
            finalize();
            const entry = pool.length > 0 ? (pool[poolIndex % pool.length] ?? []) : [];
            poolIndex++;
            current = { startStep: i, steps: 1, pitches: entry };
        } else if (atom.type === "hold") {
            if (current === null) {
                throw new ParseError("'_' has no note to extend", i, "rhythm");
            }
            current.steps += 1;
        } else {
            finalize();
            current = null;
        }
    }
    finalize();

    events.sort((a, b) => compare(a.start, b.start));

    const length = mul(step, frac(grid.length));

    return {
        length,
        query: (span) => events.filter((e) => contains(span, e.start)),
    };
}

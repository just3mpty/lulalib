import type { MelodyAst } from "./ast";
import { ParseError } from "./errors";

function readNote(src: string, from: number): { pitch: string; next: number } {
    let cursor = from;
    const letter = src[cursor];

    if (letter === "~" || letter === "_" || letter === "@" || letter === "-") {
        throw new ParseError(
            `temporal marker '${letter}' is not allowed in notes — it belongs in the rhythm`,
            cursor,
            "melody",
        );
    }

    if (letter === undefined) {
        throw new ParseError("expected a note letter", cursor, "melody");
    }

    const upper = letter.toUpperCase();
    if (upper < "A" || upper > "G") {
        throw new ParseError(`invalid note letter '${letter}'`, cursor, "melody");
    }
    let pitch = upper;
    cursor++;

    const accidental = src[cursor];
    if (accidental === "#" || accidental === "b") {
        pitch += accidental;
        cursor++;
    }

    const octaveStart = cursor;
    while (cursor < src.length) {
        const digit = src[cursor];
        if (digit === undefined || digit < "0" || digit > "9") break;
        cursor++;
    }

    if (cursor === octaveStart) {
        throw new ParseError("note is missing its octave", octaveStart, "melody");
    }
    pitch += src.slice(octaveStart, cursor);

    return { pitch, next: cursor };
}

function readRepeat(src: string, from: number): { repeat: number; next: number } {
    if (src[from] !== "*") {
        return { repeat: 1, next: from }; // pas de "*" → répétition = 1, on ne bouge pas
    }
    let cursor = from + 1;
    let digits = "";
    while (cursor < src.length) {
        const digit = src[cursor];
        if (digit === undefined || digit < "0" || digit > "9") break;
        digits += digit;
        cursor++;
    }
    const repeat = Number(digits);
    if (digits === "" || repeat <= 0) {
        throw new ParseError("'*' must be followed by a positive integer", from + 1, "melody");
    }
    return { repeat, next: cursor };
}

function parsePool(src: string, start: number): { nodes: MelodyAst; next: number } {
    const nodes: MelodyAst = [];
    let i = start;
    while (i < src.length) {
        const char = src[i];
        if (char === undefined) break;

        if (char === " ") {
            i++;
            continue;
        }

        if (char === "]") {
            return { nodes, next: i };
        }

        if (char === "[") {
            const inner = parsePool(src, i + 1);
            if (src[inner.next] !== "]") {
                throw new ParseError("unclosed '['", i, "melody");
            }
            const rep = readRepeat(src, inner.next + 1);
            nodes.push({ type: "group", children: inner.nodes, repeat: rep.repeat });
            i = rep.next;
            continue;
        }

        const note = readNote(src, i);
        const pitches = [note.pitch];
        let after = note.next;

        while (src[after] === ",") {
            const newNote = readNote(src, after + 1);
            pitches.push(newNote.pitch);
            after = newNote.next;
        }

        const rep = readRepeat(src, after);
        if (pitches.length === 1) {
            nodes.push({ type: "note", pitch: note.pitch, repeat: rep.repeat });
        } else {
            nodes.push({ type: "chord", pitches, repeat: rep.repeat });
        }
        i = rep.next;
    }
    return { nodes, next: i };
}

export function parseMelody(src: string): MelodyAst {
    const result = parsePool(src, 0);
    if (result.next < src.length) {
        throw new ParseError("Unmatched ']'", result.next, "melody");
    }
    return result.nodes;
}

import type { RhythmAst } from "./ast";
import { ParseError } from "./errors";

function readInteger(src: string, from: number): { value: number; next: number } {
    let cursor = from;
    let digits = "";
    while (cursor < src.length) {
        const digit = src[cursor];
        if (digit === undefined || digit < "0" || digit > "9") break;
        digits += digit;
        cursor++;
    }
    return { value: Number(digits), next: cursor };
}

function parseSequence(src: string, start: number): { nodes: RhythmAst; next: number } {
    const nodes: RhythmAst = [];
    let i = start;
    while (i < src.length) {
        const char = src[i];
        if (char === undefined) break;

        if (char === "]") {
            return { nodes, next: i };
        } else if (char === "[") {
            const inner = parseSequence(src, i + 1);
            if (src[inner.next] !== "]") {
                throw new ParseError("unclosed '['", i, "rhythm");
            }
            let repeat = 1;
            let after = inner.next + 1;

            if (src[after] === "*") {
                const parsed = readInteger(src, after + 1);
                if (parsed.value <= 0) {
                    throw new ParseError(
                        "'*' must be followed by a positive integer",
                        after + 1,
                        "rhythm",
                    );
                }
                repeat = parsed.value;
                after = parsed.next;
            }

            nodes.push({ type: "group", children: inner.nodes, repeat });
            i = after;
            continue;
        } else if (char === " ") {
            i++;
            continue;
        } else if (char === "_") {
            nodes.push({ type: "hold" });
        } else if (char === "-" || char === "~") {
            nodes.push({ type: "rest" });
        } else if (char === "@") {
            throw new ParseError("'@' must follow a trigger", i, "rhythm");
        } else {
            let sustain: number | undefined;
            if (src[i + 1] === "@") {
                let cursor = i + 2;
                let digits = "";
                while (cursor < src.length) {
                    const digit = src[cursor];
                    if (digit === undefined || digit < "0" || digit > "9") break;
                    digits += digit;
                    cursor++;
                }
                if (digits === "" || Number(digits) <= 0) {
                    throw new ParseError(
                        "'@' must be followed by a positive integer",
                        i + 1,
                        "rhythm",
                    );
                }
                sustain = Number(digits);
                i = cursor - 1;
            }
            nodes.push({ type: "trigger", symbol: char, sustain });
        }
        i++;
    }
    return { nodes, next: i };
}

export function parseRhythm(src: string): RhythmAst {
    const result = parseSequence(src, 0);
    if (result.next < src.length) {
        throw new ParseError("unmatched ']'", result.next, "rhythm");
    }
    return result.nodes;
}

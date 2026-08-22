import { noteToSemitones } from "./note";
export type Key = { root: string; mode: "major" | "minor" };

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SCALE: Record<"major" | "minor", number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
};

function resolveDegreeToken(token: string, key: Key, baseOctave: number): string {
    const degree = Number(token.charAt(0));
    let alteration = 0;
    let octaveShift = 0;

    for (let i = 1; i < token.length; i++) {
        const c = token.charAt(i);
        if (c === "#") alteration = 1;
        else if (c === "b") alteration = -1;
        else if (c === "'") octaveShift += 1;
        else if (c === ".") octaveShift -= 1;
        else throw new Error(`invalid degree token: "${token}"`);
    }

    return degreeToNote(key, degree, baseOctave + octaveShift, alteration);
}

function resolveOne(token: string, key: Key | undefined, baseOctave: number): string {
    const first = token.charAt(0);
    if (first >= "1" && first <= "7") {
        if (key === undefined) {
            throw new Error("degrees require a key on the song");
        }
        return resolveDegreeToken(token, key, baseOctave);
    }
    return token;
}

export function parseKey(entry: string): Key {
    const mode = entry.endsWith("m") ? "minor" : "major";
    const root = mode === "minor" ? entry.slice(0, -1) : entry;

    const letter = root.charAt(0).toUpperCase();
    const accidental = root.slice(1);
    const validLetter = letter >= "A" && letter <= "G";
    const validAccidental = accidental === "" || accidental === "#" || accidental === "b";
    if (!validLetter || !validAccidental) {
        throw new Error(`invalid key: "${entry}"`);
    }

    return { root, mode };
}

function accidental(delta: number): string {
    const norm = ((((delta + 6) % 12) + 12) % 12) - 6;
    if (norm === 0) return "";
    if (norm === 1) return "#";
    if (norm === -1) return "b";
    throw new Error(`unsupported accidental (${norm})`);
}

export function degreeToNote(key: Key, degree: number, octave: number, alteration = 0): string {
    const i = (degree - 1) % 7;
    const rootIndex = LETTERS.indexOf(key.root.charAt(0).toUpperCase());
    const targetLetter = LETTERS[(rootIndex + i) % 7];
    const scaleOffset = SCALE[key.mode][i];
    if (rootIndex === -1 || targetLetter === undefined || scaleOffset === undefined) {
        throw new Error(`invalid degree ${degree} in key "${key.root}"`);
    }

    const rootPC = noteToSemitones(`${key.root}0`) % 12;
    const targetPC = (((rootPC + scaleOffset + alteration) % 12) + 12) % 12;
    const naturalPC = LETTER_PC[targetLetter] ?? 0;

    return `${targetLetter}${accidental(targetPC - naturalPC)}${octave}`;
}

export function scaleNotes(key: Key, octave = 4): string[] {
    const degrees = [1, 2, 3, 4, 5, 6, 7].map((d) => degreeToNote(key, d, octave));
    return degrees;
}

export function resolveDegrees(notes: string, key: Key | undefined, baseOctave: number): string {
    const tokens = notes.split(" ").filter((t) => t !== "");
    const resolved = tokens.map((token) =>
        token.includes(",")
            ? token
                  .split(",")
                  .map((part) => resolveOne(part, key, baseOctave))
                  .join(",")
            : resolveOne(token, key, baseOctave),
    );
    return resolved.join(" ");
}

const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const LETTER_TO_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteToSemitones(note: string): number {
    const letter = note.charAt(0).toUpperCase();
    const base = LETTER_TO_SEMITONE[letter];
    if (base === undefined) {
        throw new Error(`invalid note: "${note}"`);
    }

    const second = note.charAt(1);
    let accidental = 0;
    let octaveStart = 1;
    if (second === "#") {
        accidental = 1;
        octaveStart = 2;
    } else if (second === "b") {
        accidental = -1;
        octaveStart = 2;
    }

    const octave = Number(note.slice(octaveStart));
    return (octave + 1) * 12 + base + accidental;
}

export function semitonesToNote(semitones: number): string {
    const octave = Math.floor(semitones / 12) - 1;
    const pc = ((semitones % 12) + 12) % 12;
    const name = PITCH_CLASSES[pc];
    if (name === undefined) {
        throw new Error(`invalid pitch class: ${pc}`);
    }
    return `${name}${octave}`;
}

export function transpose(note: string, semitones: number): string {
    return semitonesToNote(noteToSemitones(note) + semitones);
}

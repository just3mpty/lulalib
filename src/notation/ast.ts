export type RhythmNode =
    | { type: "trigger"; symbol: string; sustain?: number }
    | { type: "hold" }
    | { type: "rest" }
    | { type: "group"; children: RhythmNode[]; repeat: number };

export type RhythmAst = RhythmNode[];

export type MelodyNode =
    | { type: "note"; pitch: string; repeat: number }
    | { type: "chord"; pitches: string[]; repeat: number }
    | { type: "group"; children: MelodyNode[]; repeat: number };

export type MelodyAst = MelodyNode[];

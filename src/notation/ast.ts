export type RhythmNode =
  | { type: "trigger"; symbol: string; sustain?: number } // "x", "x@4" → sustain=4
  | { type: "hold" } // "_"
  | { type: "rest" } // "-" | "~"
  | { type: "group"; children: RhythmNode[]; repeat: number }; // "[…]", "*n"

export type RhythmAst = RhythmNode[];

export type MelodyNode =
  | { type: "note"; pitch: string; repeat: number } // "C4"
  | { type: "chord"; pitches: string[]; repeat: number } // "C4,Eb4,G4"
  | { type: "group"; children: MelodyNode[]; repeat: number }; // "[…]"

export type MelodyAst = MelodyNode[];


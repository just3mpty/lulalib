import { cat, stack } from "../core/combinators";
import { type Score, scoreFromPattern } from "../render/score";
import type { Section } from "./section";

export type Song = {
    readonly bpm: number;
    readonly key?: string;
    readonly timeSignature?: [number, number];
    readonly arrangement: Section[];
    arrange(sections: Section[]): Song;
    export(): Score;
};

type SongState = {
    bpm: number;
    key?: string;
    timeSignature?: [number, number];
    arrangement: Section[];
};

function build(state: SongState): Song {
    return {
        ...state,
        arrange(sections: Section[]): Song {
            return build({ ...state, arrangement: sections });
        },
        export(): Score {
            const sectionPatterns = state.arrangement.map((sec) =>
                stack(...sec.tracks.map((t) => t.pattern)),
            );
            const songPattern = cat(...sectionPatterns);

            return scoreFromPattern(songPattern, {
                bpm: state.bpm,
                key: state.key,
                timeSignature: state.timeSignature,
            });
        },
    };
}

export function song(meta: { bpm: number; key?: string; timeSignature?: [number, number] }): Song {
    return build({ ...meta, arrangement: [] });
}

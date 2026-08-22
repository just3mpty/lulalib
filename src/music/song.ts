import { cat, stack } from "../core/combinators";
import { type Score, scoreFromPattern } from "../render/score";
import { parseKey } from "../theory/scale";
import { type BuildContext, type Section, toTrack } from "./section";

export type Song = {
    readonly bpm: number;
    readonly key?: string;
    readonly timeSignature?: [number, number];
    readonly arrangement: Section[];
    arrange(sections: (Section | Section[])[]): Song;
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
        arrange(sections: (Section | Section[])[]): Song {
            return build({ ...state, arrangement: sections.flat() });
        },
        export(): Score {
            const ctx: BuildContext = state.key === undefined ? {} : { key: parseKey(state.key) };

            const sectionPatterns = state.arrangement.map((sec) =>
                stack(...sec.tracks.map((item) => toTrack(item, ctx).pattern)),
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

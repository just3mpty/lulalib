import type { Score } from "../render/score";

export function toJSON(score: Score, opts?: { pretty?: boolean }): string {
    return JSON.stringify(score, null, opts?.pretty ? 2 : undefined);
}

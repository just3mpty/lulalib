import type { Score } from "../render/score";

export type Exporter<Out> = (score: Score) => Out;

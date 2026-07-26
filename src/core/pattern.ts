import type { Fraction } from "../time/fraction";
import type { TimeSpan } from "../time/timespan";
import type { Event } from "./event";

// RULES
// 1. Ne renvoie que les évènements dont le start est inclus - [s.begin, s.end)]
// 2. Le même span en entrée redonne toujours les mêmes events en sortie
// 3. Les évènements sont triés par start croissant
// 4. Longueur >= 0

export type Pattern<T> = {
    readonly length: Fraction;
    readonly query: (span: TimeSpan) => Event<T>[];
};

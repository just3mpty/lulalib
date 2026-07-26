import { add, type Fraction, mul } from "../time/fraction";

export type Event<T> = {
    readonly start: Fraction;
    readonly dur: Fraction;
    readonly value: T;
};

export function event<T>(start: Fraction, dur: Fraction, value: T): Event<T> {
    return { start, dur, value };
}

export function endOf<T>(e: Event<T>): Fraction {
    return add(e.start, e.dur);
}

export function shiftEvent<T>(e: Event<T>, delta: Fraction): Event<T> {
    return event(add(e.start, delta), e.dur, e.value);
}

export function scaleEvent<T>(e: Event<T>, factor: Fraction): Event<T> {
    return event(mul(e.start, factor), mul(e.dur, factor), e.value);
}

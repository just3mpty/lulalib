export type Fraction = {
    readonly num: number;
    readonly den: number;
};

export function gcd(a: number, b: number): number {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function frac(num: number, den: number = 1): Fraction {
    if (den === 0) {
        throw new Error("Division by zero");
    }
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
        throw new Error("Non-integer inputs");
    }

    let n = num;
    let d = den;

    if (d < 0) {
        n = -n;
        d = -d;
    }

    const divisor = gcd(Math.abs(n), d);
    return { num: n / divisor, den: d / divisor };
}

export function mul(a: Fraction, b: Fraction): Fraction {
    return frac(a.num * b.num, a.den * b.den);
}

export function div(a: Fraction, b: Fraction): Fraction {
    return frac(a.num * b.den, a.den * b.num);
}

export function add(a: Fraction, b: Fraction): Fraction {
    return frac(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function sub(a: Fraction, b: Fraction): Fraction {
    return frac(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
    const left = a.num * b.den;
    const right = a.den * b.num;

    if (left > right) return 1;
    if (left < right) return -1;
    return 0;
}

export function equals(a: Fraction, b: Fraction): boolean {
    return a.num === b.num && a.den === b.den;
}

export function isZero(f: Fraction): boolean {
    return f.num === 0;
}

export function lt(a: Fraction, b: Fraction): boolean {
    return compare(a, b) === -1;
}

export function lte(a: Fraction, b: Fraction): boolean {
    return compare(a, b) !== 1;
}

export function gt(a: Fraction, b: Fraction): boolean {
    return compare(a, b) === 1;
}

export function gte(a: Fraction, b: Fraction): boolean {
    return compare(a, b) !== -1;
}

export function min(a: Fraction, b: Fraction): Fraction {
    return lte(a, b) ? a : b;
}

export function max(a: Fraction, b: Fraction): Fraction {
    return gte(a, b) ? a : b;
}

export function toNumber(f: Fraction): number {
    return f.num / f.den;
}

export function toFraction(value: number | Fraction): Fraction {
    if (typeof value === "number") {
        return frac(value);
    }
    return value;
}

export function parseFraction(value: string): Fraction {
    const parts = value.split("/");
    const num = Number(parts[0]);
    const den = parts.length > 1 ? Number(parts[1]) : 1;
    return frac(num, den);
}

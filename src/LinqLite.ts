type Selector<T, TResult> = (e: T) => TResult;
type Predicate<T> = (e: T) => boolean;

const emptySelector = (e: any) => e.valueOf();
const emptyPredicate = (e: any) => true;

export function firstOrUndefined<T>(target: Iterable<T>, predicate: Predicate<T> = emptyPredicate): T | undefined {
    for (let item of target) {
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

export function first<T>(target: Iterable<T>, predicate: Predicate<T> = emptyPredicate): T {
    const result = firstOrUndefined(target, predicate);
    if (result === undefined) {
        throw new Error("empty sequence");
    }

    return result;
}

function lastOrUndefinedForArray<T>(target: T[], predicate: Predicate<T> = emptyPredicate): T | undefined {
    for (let i = target.length - 1; i >= 0; --i) {
        const item = target[i];
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

export function lastOrUndefined<T>(target: Iterable<T> | T[], predicate: Predicate<T> = emptyPredicate): T | undefined {
    if (target instanceof Array) {
        return lastOrUndefinedForArray(target, predicate);
    }

    let last: T | undefined = undefined;
    for (let item of target) {
        if (predicate(item)) {
            last = item;
        }
    }

    return last;
}

export function last<T>(target: Iterable<T> | T[], predicate: Predicate<T> = emptyPredicate): T {
    const result = lastOrUndefined(target, predicate);
    if (result === undefined) {
        throw new Error("empty sequence");
    }

    return result;
}

export function* select<T, TResult>(target: Iterable<T>, selector: Selector<T, TResult>)
    : IterableIterator<TResult> {
    for (let item of target) {
        yield selector(item);
    }
}

export function* selectMany<T, TResult>(target: Iterable<T>, selector: Selector<T, Iterable<TResult>>)
    : IterableIterator<TResult> {
    for (let item of target) {
        for (let child of selector(item)) {
            yield child;
        }
    }
}

export function* where<T>(target: Iterable<T>, predicate: Predicate<T>)
    : IterableIterator<T> {
    for (let item of target) {
        if (predicate(item)) {
            yield item;
        }
    }
}

export function min<T>(target: Iterable<T>, selector: Selector<T, number> = emptySelector): number {
    let min = Number.MAX_VALUE;

    for (let item of target) {
        min = Math.min(min, selector(item));
    }

    return min;
}

export function max<T>(target: Iterable<T>, selector: Selector<T, number> = emptySelector): number {
    let max = Number.MIN_VALUE;
    for (let item of target) {
        max = Math.max(max, selector(item));
    }

    return max;
}

export function minMax<T>(target: Iterable<T>, selector: Selector<T, number> = emptySelector)
    : { min: number, max: number } {

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (let item of target) {
        const value = selector(item);
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return { min, max };
}

export function sum<T>(target: Iterable<T>, selector: Selector<T, number> = emptySelector): number {
    let sum = 0;
    for (let item of target) {
        sum += selector(item);
    }

    return sum;
}

export interface ILinqObject<T> extends Iterable<T> {
    select<TResult>(selector: Selector<T, TResult>): ILinqObject<TResult>;
    selectMany<TResult>(selector: Selector<T, Iterable<TResult>>): ILinqObject<TResult>;
    where(predicate: Predicate<T>): ILinqObject<T>;
    min(selector?: Selector<T, number>): number;
    max(selector?: Selector<T, number>): number;
    minMax(selector?: Selector<T, number>): { min: number, max: number };
    sum(selector?: Selector<T, number>): number;
}

class LinqWrapper<T> implements ILinqObject<T> {

    constructor(private readonly iterable: Iterable<T>) {

    }

    [Symbol.iterator](): Iterator<T> {
        // ReSharper disable once ImplicitAnyError
        return this.iterable[Symbol.iterator]();
    }

    firstOrUndefined(predicate: Predicate<T>): T | undefined {
        return firstOrUndefined(this.iterable, predicate);
    }

    first(predicate: Predicate<T>): T {
        return first(this.iterable, predicate);
    }

    lastOrUndefined(predicate: Predicate<T>): T | undefined {
        return lastOrUndefined(this.iterable, predicate);
    }

    last(predicate: Predicate<T>): T {
        return last(this.iterable, predicate);
    }

    select<TResult>(selector: Selector<T, TResult>): ILinqObject<TResult> {
        return new LinqWrapper(select(this.iterable, selector));
    }

    selectMany<TResult>(selector: Selector<T, Iterable<TResult>>): ILinqObject<TResult> {
        return new LinqWrapper(selectMany(this.iterable, selector));
    }

    where(predicate: Predicate<T>): ILinqObject<T> {
        return new LinqWrapper(where(this.iterable, predicate));
    }

    min(selector: Selector<T, number> = emptySelector): number {
        return min(this.iterable, selector);
    }

    max(selector: Selector<T, number> = emptySelector): number {
        return max(this.iterable, selector);
    }

    minMax(selector: Selector<T, number> = emptySelector): { min: number, max: number } {
        return minMax(this.iterable, selector);
    }

    sum(selector: Selector<T, number> = emptySelector): number {
        return sum(this.iterable, selector);
    }
}

// ReSharper disable once InconsistentNaming
export function L<T>(iterable: Iterable<T>): ILinqObject<T> {
    return new LinqWrapper(iterable);
}
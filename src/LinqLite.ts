export type Selector<T, TResult> = (e: T) => TResult;
export type IndexedSelector<T, TResult> = (e: T, index: number) => TResult;
export type Predicate<T> = (e: T) => boolean;
export type IndexedPredicate<T> = (e: T, index: number) => boolean;
export type EqualityComparer<T> = (a: T, b: T) => boolean;
export type Hash<T> = (e: T) => number;

type HashSet<T> = { [key: number]: T };

const defaultNumberSelector = (e: any) => e.valueOf();
const defaultPredicate = () => true;
const defaultEqualityComparer = (a: any, b: any) => a === b;
const defaultHash = (e: any) => e.valueOf();

function throwEmptySequence(): never {
    throw new Error("empty sequence");
}

function makeHashSet<T>(source: Iterable<T>, hash: Hash<T>): HashSet<T> {
    const hashSet: HashSet<T> = {};
    for (let item of source) {
        hashSet[hash(item)] = item;
    }
    return hashSet;
}

/**
 * Applies an accumulator function over a sequence.
 * @param source An Iterable<T> to aggregate over.
 * @param func An accumulator function to be invoked on each element.
 * @return The final accumulator value.
 */
export function aggregate<T>(source: Iterable<T>,
    func: (accumulate: T, current: T) => T): T {
    const iterator = source[Symbol.iterator]();

    const { done, value } = iterator.next();
    if (done) {
        throwEmptySequence();
    }

    let seed = value;

    while (true) {
        const iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        }

        seed = func(seed, iterateResult.value);
    }

    return seed;
}

/**
 * Applies an accumulator function over a sequence. The specified seed value is used as the initial accumulator value.
 * @param source An Iterable<T> to aggregate over.
 * @param func An accumulator function to be invoked on each element.
 * @param seed The initial accumulator value.
 * @return The final accumulator value.
 */
export function aggregateWithSeed<T, TAccumulate>(source: Iterable<T>,
    seed: TAccumulate, func: (accumulate: TAccumulate, current: T) => TAccumulate): TAccumulate {

    for (let item of source) {
        seed = func(seed, item);
    }

    return seed;
}

/**
 * Determines whether all elements of a sequence satisfy a condition.
 * @param source An Iterable<T> that contains the elements to apply the predicate to.
 * @param predicate A function to test each element for a condition.
 * @return true if every element of the source sequence passes the test in the specified predicate, or if the sequence is empty; otherwise, false.
 */
export function all<T>(source: Iterable<T>, predicate: Predicate<T>): boolean {
    for (let item of source) {
        if (!predicate(item)) {
            return false;
        }
    }

    return true;
}

/**
 * Determines whether any element of a sequence satisfies a condition.
 * @param source An Iterable<T> whose elements to apply the predicate to.
 * @param predicate A function to test each element for a condition.
 * @return true if any elements in the source sequence pass the test in the specified predicate; otherwise, false.
 */
export function any<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): boolean {
    for (let item of source) {
        if (predicate(item)) {
            return true;
        }
    }

    return false;
}

/**
 * Computes the average of a sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
 * @param source A sequence of values that are used to calculate an average.
 * @param selector A transform function to apply to each element.
 * @return The average of the sequence of values.
 */
export function average<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let sum = 0;
    let count = 0;
    for (let item of source) {
        sum += selector(item);
        ++count;
    }

    return sum / count;
}

/**
 * Assert the elements of an Iterable<T> as the specified type.
 * @param source The Iterable<T> that contains the elements to be asserted as type TResult.
 * @return An Iterable<TResult> that contains each element of the source sequence asserted to the specified type.
 */
export function* assertType<T, TResult extends T>(source: Iterable<T>): Iterable<TResult> {
    for (let item of source) {
        yield (item as TResult);
    }
}

/**
 * Concatenates two sequences.
 * @param first The first sequence to concatenate.
 * @param second The sequence to concatenate to the first sequence.
 * @return An Iterable<T> that contains the concatenated elements of the two input sequences.
 */
export function* concat<T>(first: Iterable<T>, second: Iterable<T>): Iterable<T> {
    for (let item of first) {
        yield item;
    }
    for (let item of second) {
        yield item;
    }
}


/**
 * Determines whether a sequence contains a specified element by using a specified EqualityComparer<T>.
 * @param source A sequence in which to locate a value.
 * @param value The value to locate in the sequence.
 * @param comparer An equality comparer to compare values.
 * @return true if the source sequence contains an element that has the specified value; otherwise, false.
 */
export function contains<T>(source: Iterable<T>, value: T, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
    for (let item of source) {
        if (comparer(item, value)) {
            return true;
        }
    }

    return false;
}

/**
 * Returns a number that represents how many elements in the specified sequence satisfy a condition.
 * @param source A sequence that contains elements to be tested and counted.
 * @param predicate A function to test each element for a condition.
 * @return A number that represents how many elements in the sequence satisfy the condition in the predicate function.
 */
export function count<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): number {
    let count = 0;
    for (let item of source) {
        if (predicate(item)) {
            ++count;
        }
    }

    return count;
}

/**
 * Returns the elements of the specified sequence or the specified value in a singleton collection if the sequence is empty.
 * @param source The sequence to return the specified value for if it is empty.
 * @param defaultValue The value to return if the sequence is empty.
 * @return An Iterable<T> that contains defaultValue if source is empty; otherwise, source.
 */
export function* defaultIfEmpty<T>(source: Iterable<T>, defaultValue: T): Iterable<T> {
    const iterator = source[Symbol.iterator]();
    let iterateResult = iterator.next();
    if (iterateResult.done) {
        yield defaultValue;
    } else {
        yield iterateResult.value;
    }

    while (true) {
        iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        } else {
            yield iterateResult.value;
        }
    }
}

/**
 * Returns distinct elements from a sequence by using a specified EqualityComparer<T> to compare values.
 * @param source The sequence to remove duplicate elements from.
 * @param comparer An EqualityComparer<T> to compare values.
 * @return An Iterable<T> that contains distinct elements from the source sequence.
 */
export function* distinct<T>(source: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    const iteratedElements = new Array<T>();

    for (let item of source) {
        if (contains(iteratedElements, item, comparer)) {
            continue;
        }
        iteratedElements.push(item);
        yield item;
    }
}

/**
 * Returns distinct elements from a sequence by using a specified Hash<T> to calculate hash values.
 * @param source The sequence to remove duplicate elements from.
 * @param hash A Hash<T> to calculate hash values.
 * @return An Iterable<T> that contains distinct elements from the source sequence.
 */
export function* distinctHash<T>(source: Iterable<T>, hash: Hash<T> = defaultHash): Iterable<T> {
    const iteratedElements: { [key: number]: T } = {};

    for (let item of source) {
        const hashValue = hash(item);
        if (iteratedElements[hashValue] !== undefined) {
            continue;
        }
        iteratedElements[hashValue] = item;
        yield item;
    }
}

/**
 * Returns the element at a specified index in a sequence.
 * @param source An Iterable<T> to return an element from.
 * @param index The zero-based index of the element to retrieve.
 * @return The element at the specified position in the source sequence.
 */
export function elementAt<T>(source: Iterable<T>, index: number): T {
    const element = elementAtOrUndefined(source, index);

    if (!element) {
        throw new Error("element not existed");
    }

    return element;
}

/**
 * Returns the element at a specified index in a sequence or undefined if the index is out of range.
 * @param source An Iterable<T> to return an element from.
 * @param index The zero-based index of the element to retrieve.
 * @return undefined if the index is outside the bounds of the source sequence; otherwise, the element at the specified position in the source sequence.
 */
export function elementAtOrUndefined<T>(source: Iterable<T>, index: number): T | undefined {
    let currentIndex = 0;
    for (let item of source) {
        if (currentIndex === index) {
            return item;
        }

        ++currentIndex;
    }

    return undefined;
}

/**
 * Produces the set difference of two sequences by using the specified EqualityComparer<T> to compare values.
 * @param first An Iterable<T> whose elements that are not also in second will be returned.
 * @param second An Iterable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned
 * @param comparer An EqualityComparer<T> to compare values.
 * @return A sequence that contains the set difference of the elements of two sequences.
 */
export function* except<T>(first: Iterable<T>,
    second: Iterable<T>,
    comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    for (let item of first) {
        if (!contains(second, item, comparer)) {
            yield item;
        }
    }
}

/**
 * Produces the set difference of two sequences by using the specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose elements that are not also in second will be returned.
 * @param second An Iterable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned
 * @param hash A Hash<T> to calculate hash values.
 * @return A sequence that contains the set difference of the elements of two sequences.
 */
export function* exceptHash<T>(first: Iterable<T>,
    second: Iterable<T>,
    hash: Hash<T> = defaultHash): Iterable<T> {

    const hashedSecond = makeHashSet(second, hash);
    for (let item of first) {
        if (hashedSecond[hash(item)] === undefined) {
            yield item;
        }
    }
}

/**
 * Returns the first element in a sequence that satisfies a specified condition.
 * @param source An Iterable<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return The first element in the sequence that passes the test in the specified predicate function.
 */
export function first<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T {
    const result = firstOrUndefined(source, predicate);
    if (result === undefined) {
        throwEmptySequence();
    }

    return result!;
}

/**
 * Returns the first element of the sequence that satisfies a condition or undefined if no such element is found.
 * @param source An Iterable<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return undefined if source is empty or if no element passes the test specified by predicate; otherwise, the first element in source that passes the test specified by predicate.
 */
export function firstOrUndefined<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T | undefined {
    for (let item of source) {
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

/**
 * Returns undefined in a singleton collection if the sequence is empty.
 * @param source The sequence to return a default value for if it is empty.
 * @return An Iterable<T | undefined> object that contains undefined if source is empty; otherwise, source.
 */
export function* undefinedIfEmpty<T>(source: Iterable<T>): Iterable<T | undefined> {
    const iterator = source[Symbol.iterator]();
    let iterateResult = iterator.next();
    if (iterateResult.done) {
        yield undefined;
    } else {
        yield iterateResult.value;
    }

    while (true) {
        iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        } else {
            yield iterateResult.value;
        }
    }
}

// todo: groupBy and overloads
// todo: groupJoin and overloads

/**
 * Produces the set intersection of two sequences by using the specified EqualityComparer<T> to compare values.
 * @param first An Iterable<T> whose distinct elements that also appear in second will be returned.
 * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
 * @param comparer An EqualityComparer<T> to compare values.
 * @return A sequence that contains the elements that form the set intersection of two sequences.
 */
export function* intersect<T>(first: Iterable<T>, second: Iterable<T>, comparer: EqualityComparer<T>): Iterable<T> {
    for (let item of first) {
        if (contains(second, item, comparer)) {
            yield item;
        }
    }
}

/**
 * Produces the set intersection of two sequences by using the specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose distinct elements that also appear in second will be returned.
 * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
 * @param hash An Hash<T> to calculate hash values.
 * @return A sequence that contains the elements that form the set intersection of two sequences.
 */
export function* intersectHash<T>(first: Iterable<T>, second: Iterable<T>, hash: Hash<T>): Iterable<T> {

    const hashedSecond = makeHashSet(second, hash);
    for (let item of first) {
        if (hashedSecond[hash(item)] !== undefined) {
            yield item;
        }
    }
}

// todo: join and overloads

/**
 * Returns the last element of a sequence that satisfies a specified condition.
 * @param source An Iterable<T> or Array<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return The last element in the sequence that passes the test in the specified predicate function.
 */
export function last<T>(source: Iterable<T> | T[], predicate: Predicate<T> = defaultPredicate): T {
    const result = lastOrUndefined(source, predicate);
    if (result === undefined) {
        throw new Error("empty sequence");
    }

    return result;
}

function lastOrUndefinedForArray<T>(source: T[], predicate: Predicate<T> = defaultPredicate): T | undefined {
    for (let i = source.length - 1; i >= 0; --i) {
        const item = source[i];
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

/**
 * Returns the last element of a sequence that satisfies a condition or undefined if no such element is found.
 * @param source An Iterable<T> or Array<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return undefined if the sequence is empty or if no elements pass the test in the predicate function; otherwise, the last element that passes the test in the predicate function.
 */
export function lastOrUndefined<T>(source: Iterable<T> | T[], predicate: Predicate<T> = defaultPredicate): T | undefined {
    if (source instanceof Array) {
        return lastOrUndefinedForArray(source, predicate);
    }

    let last: T | undefined = undefined;
    for (let item of source) {
        if (predicate(item)) {
            last = item;
        }
    }

    return last;
}

/**
 * Invokes a transform function on each element of a sequence and returns the maximum number value.
 * @param source A sequence of values to determine the maximum value of.
 * @param selector A transform function to apply to each element.
 * @return The maximum value in the sequence.
 */
export function max<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let max = Number.MIN_VALUE;
    for (let item of source) {
        max = Math.max(max, selector(item));
    }

    return max;
}

/**
 * Invokes a transform function on each element of a sequence and returns the minimum number value.
 * @param source A sequence of values to determine the minimum value of.
 * @param selector A transform function to apply to each element.
 * @return The minimum value in the sequence.
 */
export function min<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let min = Number.MAX_VALUE;

    for (let item of source) {
        min = Math.min(min, selector(item));
    }

    return min;
}

/**
 * Invokes a transform function on each element of a sequence and returns the minimum and maximum number value.
 * @param source A sequence of values to determine the minimum and maximum value of.
 * @param selector A transform function to apply to each element.
 * @returns The minimum and maximum value in the sequence.
 */
export function minMax<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector)
    : { min: number, max: number } {

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (let item of source) {
        const value = selector(item);
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return { min, max };
}

// todo: ofType
// todo: orderBy
// todo: orderByDescending

function* reverseArray<T>(source: T[]): Iterable<T> {
    for (let i = source.length - 1; i >= 0; --i) {
        yield source[i];
    }
}

/**
 * Inverts the order of the elements in a sequence.
 * @param source A sequence of values to reverse.
 * @return A sequence whose elements correspond to those of the input sequence in reverse order.
 */
export function* reverse<T>(source: Iterable<T> | T[]): Iterable<T> {
    if (source instanceof Array) {
        yield* reverseArray(source);
    } else {
        yield* reverseArray(toArray(source));
    }
}

/**
 * Projects each element of a sequence into a new form by optionally incorporating the element's index.
 * @param source A sequence of values to invoke a transform function on.
 * @param selector A transform function to apply to each source element; the optional second parameter of the function represents the index of the source element.
 * @return An Iterator<T> whose elements are the result of invoking the transform function on each element of source.
 */
export function* select<T, TResult>(source: Iterable<T>, selector: IndexedSelector<T, TResult>): Iterable<TResult> {
    let index = 0;
    for (let item of source) {
        yield selector(item, index);
        ++index;
    }
}

/**
 * Projects each element of a sequence to an Iterable<T>, and flattens the resulting sequences into one sequence.
 * @param source A sequence of values to project.
 * @param selector A transform function to apply to each source element; the optional second parameter of the function represents the index of the source element.
 * @return An Iterable<T> whose elements are the result of invoking the one-to-many transform function on each element of an input sequence.
 */
export function* selectMany<T, TResult>(source: Iterable<T>, selector: IndexedSelector<T, Iterable<TResult>>): Iterable<TResult> {
    let index = 0;
    for (let item of source) {
        for (let child of selector(item, index)) {
            yield child;
        }
        ++index;
    }
}

/**
 * Determines whether two sequences are equal by comparing their elements by using a specified EqualityComparer<T>.
 * @param first An IEnumerable<T> to compare to second.
 * @param second An IEnumerable<T> to compare to the first sequence.
 * @param comparer An IEqualityComparer<T> to use to compare elements.
 * @return true if the two source sequences are of equal length and their corresponding elements compare equal according to comparer; otherwise, false.
 */
export function sequenceEqual<T>(first: Iterable<T>,
    second: Iterable<T>,
    comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
    const firstIterator = first[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();

    while (true) {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done) {
            return secondResult.done;
        } else if (secondResult.done) {
            return false;
        } else if (!comparer(firstResult.value, secondResult.value)) {
            return false;
        }
    }
}

/**
 * Returns the only element of a sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
 * @param source An Iterable<T> to return a single element from.
 * @param predicate A function to test an element for a condition.
 * @return The single element of the input sequence that satisfies a condition.
 */
export function single<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T {
    const result = singleOrUndefined(source, predicate);
    if (result === undefined) {
        throw new Error("sequence contains no element that satisfies specified predicate");
    }
    return result;
}

/**
 * Returns the only element of a sequence that satisfies a specified condition or undefined if no such element exists; this method throws an exception if more than one element satisfies the condition.
 * @param source An IEnumerable<T> to return a single element from.
 * @param predicate A function to test an element for a condition.
 * @return The single element of the input sequence that satisfies the condition, or undefined if no such element is found.
 */
export function singleOrUndefined<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T | undefined {
    let result: T | undefined = undefined;
    for (let item of source) {
        if (predicate(item)) {
            if (result !== undefined) {
                throw new Error("sequence contains more than one element that satisfies specified predicate");
            }
            result = item;
        }
    }
    return result;
}

/**
 * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
 * @param source An Iterable<T> to return elements from.
 * @param count The number of elements to skip before returning the remaining elements.
 * @return An Iterable<T> that contains the elements that occur after the specified index in the input sequence.
 */
export function* skip<T>(source: Iterable<T>, count: number): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (index >= count) {
            yield item;
        }
        ++index;
    }
}

/**
 * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.function.
 * @param source An Iterable<T> to return elements from.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
 */
export function* skipWhile<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    let skip = true;
    for (let item of source) {
        if (skip) {
            if (predicate(item, index)) {
                ++index;
                continue;
            }
            skip = false;
        }

        yield item;
    }
}

/**
 * Computes the sum of the sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
 * @param source A sequence of values that are used to calculate a sum.
 * @param selector A transform function to apply to each element.
 * @return The sum of the projected values.
 */
export function sum<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let sum = 0;
    for (let item of source) {
        sum += selector(item);
    }

    return sum;
}

/**
 * Returns a specified number of contiguous elements from the start of a sequence.
 * @param source The sequence to return elements from.
 * @param count The number of elements to return.
 * @return An Iterable<T> that contains the specified number of elements from the start of the input sequence.
 */
export function* take<T>(source: Iterable<T>, count: number): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (index < count) {
            yield item;
        } else {
            break;
        }
        ++index;
    }
}

/**
 * Returns elements from a sequence as long as a specified condition is true.
 * @param source The sequence to return elements from.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains elements from the input sequence that occur before the element at which the test no longer passes.
 */
export function* takeWhile<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (predicate(item, index)) {
            yield item;
            ++index;
            continue;
        }
        break;
    }
}

/**
 * Creates an array from a Iterable<T>.
 * @param source An Iterable<T> to create an array from.
 * @return An array that contains the elements from the input sequence.
 */
export function toArray<T>(source: Iterable<T>): T[] {
    const array = new Array<T>();
    for (let item of source) {
        array.push(item);
    }
    return array;
}

// todo: toDictionary
// todo: toLookup

/**
 * Produces the set union of two sequences by using a specified EqualityComparer<T>.
 * @param first An Iterable<T> whose distinct elements form the first set for the union.
 * @param second An Iterable<T> whose distinct elements form the second set for the union.
 * @param comparer The EqualityComparer<T> to compare values.
 * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
 */
export function* union<T>(first: Iterable<T>, second: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    const items = new Array<T>();
    for (let item of first) {
        if (!contains(items, item, comparer)) {
            items.push(item);
            yield item;
        }
    }
    for (let item of second) {
        if (!contains(items, item, comparer)) {
            items.push(item);
            yield item;
        }
    }
}

/**
 * Produces the set union of two sequences by using a specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose distinct elements form the first set for the union.
 * @param second An Iterable<T> whose distinct elements form the second set for the union.
 * @param hash The Hash<T> to calculate hash values.
 * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
 */
export function* unionHash<T>(first: Iterable<T>, second: Iterable<T>, hash: Hash<T> = defaultHash): Iterable<T> {
    const items: HashSet<T> = {};
    for (let item of first) {
        const hashValue = hash(item);
        if (items[hashValue] === undefined) {
            items[hashValue] = item;
            yield item;
        }
    }
    for (let item of second) {
        const hashValue = hash(item);
        if (items[hashValue] === undefined) {
            items[hashValue] = item;
            yield item;
        }
    }
}

/**
 * Filters a sequence of values based on a predicate.
 * @param source An Iterable<T> to filter.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains elements from the input sequence that satisfy the condition.
 */
export function* where<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (predicate(item, index)) {
            yield item;
        }
        ++index;
    }
}

/**
 * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
 * @param first The first sequence to merge.
 * @param second The second sequence to merge.
 * @param resultSelector A function that specifies how to merge the elements from the two sequences.
 * @return An Iterable<T> that contains merged elements of two input sequences.
 */
export function* zip<TFirst, TSecond, TResult>(first: Iterable<TFirst>,
    second: Iterable<TSecond>,
    resultSelector: (first: TFirst, second: TSecond) => TResult)
    : Iterable<TResult> {

    const firstIterator = first[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();

    while (true) {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done || secondResult.done) {
            break;
        }

        yield resultSelector(firstResult.value, secondResult.value);
    }

}

export interface ILinqObject<T> extends Iterable<T> {
    /**
     * Applies an accumulator function over this sequence.
     * @param func An accumulator function to be invoked on each element.
     * @return The final accumulator value.
     */
    aggregate(func: (accumulate: T, current: T) => T): T;
    /**
     * Applies an accumulator function over this sequence. The specified seed value is used as the initial accumulator value.
     * @param func An accumulator function to be invoked on each element.
     * @param seed The initial accumulator value.
     * @return The final accumulator value.
     */
    aggregateWithSeed<TAccumulate>(seed: TAccumulate, func?: (accumulate: TAccumulate, current: T) => TAccumulate):
        TAccumulate;
    /**
     * Determines whether all elements of this sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     * @return true if every element of the source sequence passes the test in the specified predicate, or if the sequence is empty; otherwise, false.
     */
    all(predicate: Predicate<T>): boolean;
    /**
     * Determines whether any element of this  sequence satisfies a condition.
     * @param predicate A function to test each element for a condition.
     * @return true if any elements in the source sequence pass the test in the specified predicate; otherwise, false.
     */
    any(predicate?: Predicate<T>): boolean;
    /**
     * Computes the average of this sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
     * @param selector A transform function to apply to each element.
     * @return The average of the sequence of values.
     */
    average(selector?: Selector<T, number>): number;

    /**
     * Assert the elements of this sequence as the specified type.
     * @param source The Iterable<T> that contains the elements to be asserted as type TResult.
     * @return An ILinqObject<TResult> that contains each element of the source sequence asserted to the specified type.
     */
    assertType<TResult extends T>(): ILinqObject<TResult>;
    /**
     * Concatenates this sequence with another sequence.
     * @param other The sequence to concatenate to this sequence.
     * @return An ILinqObject<T> that contains the concatenated elements of the two input sequences.
     */
    concat(other: Iterable<T>): ILinqObject<T>;
    /**
     * Determines whether this sequence contains a specified element by using a specified EqualityComparer<T>.
     * @param value The value to locate in the sequence.
     * @param comparer An equality comparer to compare values.
     * @return true if this sequence contains an element that has the specified value; otherwise, false.
     */
    contains(value: T, comparer?: EqualityComparer<T>): boolean;
    /**
     * Returns a number that represents how many elements in this sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     * @return A number that represents how many elements in this sequence satisfy the condition in the predicate function.
     */
    count(predicate: Predicate<T>): number;

    /**
     * Returns the elements of this sequence or the specified value in a singleton collection if the sequence is empty.
     * @param defaultValue The value to return if this sequence is empty.
     * @return An ILinqObject<T> that contains defaultValue if source is empty; otherwise, source.
     */
    defaultIfEmpty(defaultValue: T): ILinqObject<T>;
    /**
     * Returns distinct elements from this sequence by using a specified EqualityComparer<T> to compare values.
     * @param comparer An EqualityComparer<T> to compare values.
     * @return An ILinqObject<T> that contains distinct elements from this sequence.
     */
    distinct(comparer?: EqualityComparer<T>): ILinqObject<T>;
    /**
     * Returns distinct elements from this sequence by using a specified Hash<T> to calculate hash values.
     * @param hash A Hash<T> to calculate hash values.
     * @return An ILinqObject<T> that contains distinct elements from the source sequence.
     */
    distinctHash(hash?: Hash<T>): ILinqObject<T>;
    /**
     * Returns the element at a specified index in this sequence.
     * @param index The zero-based index of the element to retrieve.
     * @return The element at the specified position in the this sequence.
     */
    elementAt(index: number): T;
    /**
     * Returns the element at a specified index in this sequence or undefined if the index is out of range.
     * @param index The zero-based index of the element to retrieve.
     * @return undefined if the index is outside the bounds of this sequence; otherwise, the element at the specified position in this sequence.
     */
    elementAtOrUndefined(index: number): T | undefined;

    /**
     * Produces the set difference of this and another sequence by using the specified EqualityComparer<T> to compare values.
     * @param other An Iterable<T> whose elements that also occur in the this sequence will cause those elements to be removed from the returned
     * @param comparer An EqualityComparer<T> to compare values.
     * @return A sequence that contains the set difference of the elements of this and ther other sequences.
     */
    except(other: Iterable<T>, comparer?: EqualityComparer<T>): ILinqObject<T>;
    /**
     * Produces the set difference of this and another sequence by using the specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose elements that also occur in the this sequence will cause those elements to be removed from the returned
     * @param hash A Hash<T> to calculate hash values.
     * @return A sequence that contains the set difference of the elements of this and ther other sequences.
     */
    exceptHash(other: Iterable<T>, hash?: Hash<T>): ILinqObject<T>;
    /**
     * Returns the first element in this sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @return The first element in this sequence that passes the test in the specified predicate function.
     */
    first(predicate?: Predicate<T>): T;
    /**
     * Returns the first element of this sequence that satisfies a condition or undefined if no such element is found.
     * @param predicate A function to test each element for a condition.
     * @return undefined if this sequence is empty or if no element passes the test specified by predicate; otherwise, the first element in this sequence that passes the test specified by predicate.
     */
    firstOrUndefined(predicate?: Predicate<T>): T | undefined;
    /**
     * Returns undefined in a singleton collection if this sequence is empty.
     * @return An Iterable<T | undefined> object that contains undefined if this sequence is empty; otherwise, this sequence.
     */
    undefinedIfEmpty(): ILinqObject<T | undefined>;
    /**
     * Produces the set intersection of this and another sequence by using the specified EqualityComparer<T> to compare values.
     * @param other An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An EqualityComparer<T> to compare values.
     * @return A sequence that contains the elements that form the set intersection of this and the other sequences.
     */
    intersect(other: Iterable<T>, comparer?: EqualityComparer<T>): ILinqObject<T>;
    /**
     * Produces the set intersection of this and another sequence by using the specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param hash An Hash<T> to calculate hash values.
     * @return A sequence that contains the elements that form the set intersection of this and the other sequences.
     */
    intersectHash(other: Iterable<T>, hash?: Hash<T>): ILinqObject<T>;
    /**
     * Returns the last element of this sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @return The last element in this sequence that passes the test in the specified predicate function.
     */
    last(predicate?: Predicate<T>): T;
    /**
     * Returns the last element of this sequence that satisfies a condition or undefined if no such element is found.
     * @param predicate A function to test each element for a condition.
     * @return undefined if this sequence is empty or if no elements pass the test in the predicate function; otherwise, the last element that passes the test in the predicate function.
     */
    lastOrUndefined(predicate?: Predicate<T>): T | undefined;
    /**
     * Invokes a transform function on each element of this sequence and returns the maximum number value.
     * @param selector A transform function to apply to each element.
     * @return The maximum value in this sequence.
     */
    max(selector?: Selector<T, number>): number;
    /**
     * Invokes a transform function on each element of this sequence and returns the minimum number value.
     * @param selector A transform function to apply to each element.
     * @return The minimum value in this sequence.
     */
    min(selector?: Selector<T, number>): number;
    /**
     * Invokes a transform function on each element of this sequence and returns the minimum and maximum number value.
     * @param selector A transform function to apply to each element.
     * @returns The minimum and maximum value in this sequence.
     */
    minMax(selector?: Selector<T, number>): { min: number, max: number };
    /**
     * Inverts the order of this elements in a sequence.
     * @return A sequence whose elements correspond to those of this input sequence in reverse order.
     */
    reverse(): ILinqObject<T>;
    /**
     * Projects each element of this sequence into a new form by optionally incorporating the element's index.
     * @param selector A transform function to apply to each element; the optional second parameter of the function represents the index of the element.
     * @return An Iterator<T> whose elements are the result of invoking the transform function on each element of source.
     */
    select<TResult>(selector?: IndexedSelector<T, TResult>): ILinqObject<TResult>;
    /**
     * Projects each element of this sequence to an Iterable<TResult>, and flattens the resulting sequences into one sequence.
     * @param selector A transform function to apply to each element; the optional second parameter of the function represents the index of the element.
     * @return An ILinqObject<T> whose elements are the result of invoking the one-to-many transform function on each element of this sequence.
     */
    selectMany<TResult>(selector?: IndexedSelector<T, Iterable<TResult>>): ILinqObject<TResult>;
    /**
     * Determines whether this sequence is equal to another by comparing their elements by using a specified EqualityComparer<T>.
     * @param other The Iterable<T> to compare to this sequence.
     * @param comparer An EqualityComparer<T> to use to compare elements.
     * @return true if the two source sequences are of equal length and their corresponding elements compare equal according to comparer; otherwise, false.
     */
    sequenceEqual(other: Iterable<T>, comparer?: EqualityComparer<T>): boolean;
    /**
     * Returns the only element of this sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
     * @param predicate A function to test an element for a condition.
     * @return The single element of this sequence that satisfies a condition.
     */
    single(predicate?: Predicate<T>): T;
    /**
     * Returns the only element of this sequence that satisfies a specified condition or undefined if no such element exists; this method throws an exception if more than one element satisfies the condition.
     * @param predicate A function to test an element for a condition.
     * @return The single element of this sequence that satisfies the condition, or undefined if no such element is found.
     */
    singleOrUndefined(predicate?: Predicate<T>): T | undefined;
    /**
     * Bypasses a specified number of elements in this sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     * @return An ILinqObject<T> that contains the elements that occur after the specified index in this sequence.
     */
    skip(count: number): ILinqObject<T>;
    /**
     * Bypasses elements in this sequence as long as a specified condition is true and then returns the remaining elements.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return An ILinqObject<T> that contains the elements from this sequence starting at the first element in the linear series that does not pass the test specified by predicate.
     */
    skipWhile(predicate: IndexedPredicate<T>): ILinqObject<T>;
    /**
     * Computes the sum of the sequence of number values that are obtained by invoking a transform function on each element of this sequence.
     * @param selector A transform function to apply to each element.
     * @return The sum of the projected values.
     */
    sum(selector?: Selector<T, number>): number;
    /**
     * Returns a specified number of contiguous elements from the start of this sequence.
     * @param count The number of elements to return.
     * @return An ILinqObject<T> that contains the specified number of elements from the start of this sequence.
     */
    take(count: number): ILinqObject<T>;
    /**
     * Returns elements from this sequence as long as a specified condition is true.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return An Iterable<T> that contains elements from the input sequence that occur before the element at which the test no longer passes.
     */
    takeWhile(predicate: IndexedPredicate<T>): ILinqObject<T>;
    /**
     * Creates an array from this sequence.
     * @return An array that contains the elements from this sequence.
     */
    toArray(): T[];
    /**
     * Produces the set union of this and another sequence by using a specified EqualityComparer<T>.
     * @param other An Iterable<T> whose distinct elements form the other set for the union.
     * @param comparer The EqualityComparer<T> to compare values.
     * @return An ILinqObject<T> that contains the elements from both input sequences, excluding duplicates.
     */
    union(other: Iterable<T>, comparer?: EqualityComparer<T>): ILinqObject<T>;
    /**
     * Produces the set union of this and another sequence by using a specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose distinct elements form the other set for the union.
     * @param hash The Hash<T> to calculate hash values.
     * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    unionHash(other: Iterable<T>, hash?: Hash<T>): ILinqObject<T>;
    /**
     * Filters this sequence of values based on a predicate.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return An Iterable<T> that contains elements from this sequence that satisfy the condition.
     */
    where(predicate: IndexedPredicate<T>): ILinqObject<T>;
    /**
     * Applies a specified function to the corresponding elements of this and another sequences, producing a sequence of the results.
     * @param second The other sequence to merge.
     * @param resultSelector A function that specifies how to merge the elements from the two sequences.
     * @return An ILinqObject<T> that contains merged elements of two input sequences.
     */
    zip<TSecond, TResult>(other: Iterable<TSecond>, resultSelector: (first: T, other: TSecond) => TResult):
        ILinqObject<TResult>;
}

class LinqWrapper<T> implements ILinqObject<T> {

    constructor(private readonly iterable: Iterable<T>) {

    }

    [Symbol.iterator](): Iterator<T> {
        // ReSharper disable once ImplicitAnyError
        return this.iterable[Symbol.iterator]();
    }

    aggregate(func: (accumulate: T, current: T) => T): T {
        return aggregate(this.iterable, func);
    }

    aggregateWithSeed<TAccumulate>(seed: TAccumulate, func: (accumulate: TAccumulate, current: T) => TAccumulate)
        : TAccumulate {
        return aggregateWithSeed(this.iterable, seed, func);
    }

    all(predicate: Predicate<T>): boolean {
        return all(this.iterable, predicate);
    }

    any(predicate: Predicate<T> = defaultPredicate): boolean {
        return any(this.iterable, predicate);
    }

    average(selector: Selector<T, number> = defaultNumberSelector): number {
        return average(this.iterable, selector);
    }

    assertType<TResult extends T>(): ILinqObject<TResult> {
        return new LinqWrapper(assertType<T, TResult>(this.iterable));
    }

    concat(other: Iterable<T>): ILinqObject<T> {
        return new LinqWrapper<T>(concat(this.iterable, other));
    }

    contains(value: T, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
        return contains(this.iterable, value, comparer);
    }

    count(predicate: Predicate<T> = defaultPredicate): number {
        return count(this.iterable);
    }

    defaultIfEmpty(defaultValue: T): ILinqObject<T> {
        return new LinqWrapper<T>(defaultIfEmpty(this.iterable, defaultValue));
    }

    distinct(comparer: EqualityComparer<T> = defaultEqualityComparer): ILinqObject<T> {
        return new LinqWrapper<T>(distinct(this.iterable));
    }

    distinctHash(hash: Hash<T> = defaultHash): ILinqObject<T> {
        return new LinqWrapper<T>(distinctHash(this.iterable, hash));
    }

    elementAt(index: number): T {
        return elementAt(this.iterable, index);
    }

    elementAtOrUndefined(index: number): T | undefined {
        return elementAtOrUndefined(this.iterable, index);
    }


    except(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ILinqObject<T> {
        return new LinqWrapper<T>(except(this.iterable, other, comparer));
    }

    exceptHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ILinqObject<T> {
        return new LinqWrapper<T>(exceptHash(this.iterable, other, hash));
    }

    first(predicate: Predicate<T> = defaultPredicate): T {
        return first(this.iterable, predicate);
    }

    firstOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return firstOrUndefined(this.iterable, predicate);
    }

    undefinedIfEmpty(): ILinqObject<T | undefined> {
        return new LinqWrapper<T | undefined>(undefinedIfEmpty(this.iterable));
    }

    intersect(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ILinqObject<T> {
        return new LinqWrapper<T>(intersect(this.iterable, other, comparer));
    }

    intersectHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ILinqObject<T> {
        return new LinqWrapper<T>(intersectHash(this.iterable, other, hash));
    }

    last(predicate: Predicate<T> = defaultPredicate): T {
        return last(this.iterable, predicate);
    }

    lastOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return lastOrUndefined(this.iterable, predicate);
    }

    max(selector: Selector<T, number> = defaultNumberSelector): number {
        return max(this.iterable, selector);
    }

    min(selector: Selector<T, number> = defaultNumberSelector): number {
        return min(this.iterable, selector);
    }

    minMax(selector: Selector<T, number> = defaultNumberSelector): { min: number, max: number } {
        return minMax(this.iterable, selector);
    }

    reverse(): ILinqObject<T> {
        return new LinqWrapper<T>(reverse(this.iterable));
    }

    select<TResult>(selector: IndexedSelector<T, TResult>): ILinqObject<TResult> {
        return new LinqWrapper<TResult>(select(this.iterable, selector));
    }

    selectMany<TResult>(selector: IndexedSelector<T, Iterable<TResult>>): ILinqObject<TResult> {
        return new LinqWrapper(selectMany(this.iterable, selector));
    }

    sequenceEqual(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
        return sequenceEqual(this.iterable, other, comparer);
    }

    single(predicate: Predicate<T> = defaultPredicate): T {
        return single(this.iterable, predicate);
    }

    singleOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return singleOrUndefined(this.iterable, predicate);
    }

    skip(count: number): ILinqObject<T> {
        return new LinqWrapper<T>(skip(this.iterable, count));
    }

    skipWhile(predicate: IndexedPredicate<T>): ILinqObject<T> {
        return new LinqWrapper<T>(skipWhile(this.iterable, predicate));
    }

    sum(selector: Selector<T, number> = defaultNumberSelector): number {
        return sum(this.iterable, selector);
    }

    take(count: number): ILinqObject<T> {
        return new LinqWrapper<T>(take(this.iterable, count));
    }

    takeWhile(predicate: IndexedPredicate<T>): ILinqObject<T> {
        return new LinqWrapper<T>(takeWhile(this.iterable, predicate));
    }

    toArray(): T[] {
        return toArray(this.iterable);
    }

    union(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ILinqObject<T> {
        return new LinqWrapper<T>(union(this.iterable, other, comparer));
    }

    unionHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ILinqObject<T> {
        return new LinqWrapper<T>(unionHash(this.iterable, other, hash));
    }

    where(predicate: IndexedPredicate<T>): ILinqObject<T> {
        return new LinqWrapper<T>(where(this.iterable, predicate));
    }

    zip<TSecond, TResult>(other: Iterable<TSecond>, resultSelector: (first: T, other: TSecond) => TResult):
        ILinqObject<TResult> {
        return new LinqWrapper(zip(this.iterable, other, resultSelector));
    }
}

// ReSharper disable once InconsistentNaming
export function L<T>(iterable: Iterable<T>): ILinqObject<T> {
    return new LinqWrapper(iterable);
}
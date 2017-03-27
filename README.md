# ts-linqlite
A lightweight Typescript Linq library
This library uses a light wrapper layer to implement C# Linq-like query methods.

As this project is still in its early stage, it's consisted of one single file and can be dropped into your project to use directly. Later I will consider to make a npm package for it.

# Usage #
## Install ##
Simply clone this repository and put `linqlite.ts` into any place of your project.
## Using ##
There are two ways to use ts-linqlite.
If you want to make a quick one-off invocation to a linq method, you can call the methods directly. For example:
```typescript
const values = [1, 2, 3, 4, 5];
const squares = select(values, v => v * v);
```
This will return an `Iterable` directly, without allocating additional objects.

If you prefer the .NET style fluent API, you can use the `L` method to wrap an array to an `ISequence`, which is analogous to .NET's `IEnumerable`:
```typescript
const values = [1, 2, 3, 4, 5];
const squares = L(values).select(v => v * v).where(v < 12);
```

Please read [the wiki page](https://github.com/hillin/ts-linqlite/wiki/Comparing-to-.NET-Linq-APIs) to learn more about the differences between ts-linqlite and .NET's Linq API.

# Contribute! #
ts-linqlite is a part of another project of mine. It is not extensively tested, it would be really appreciated if you can test it (specially or within your project) and fire issues if you found.

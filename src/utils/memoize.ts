import { getValueHash } from './get-value-hash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface MemoizedFn<T extends AnyFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  clearCache: () => void;
  getCacheSize: () => number;
}

export const fnMemo = <T extends AnyFunction>(fn: T, maxSize = 100): MemoizedFn<T> => {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = (...args: Parameters<T>) => {
    const key = getValueHash(args);
    if (cache.has(key)) {
      // Move to end (LRU) - delete and re-add
      const value = cache.get(key)!;
      cache.delete(key);
      cache.set(key, value);
      return value;
    }

    const result = fn(...args);

    // LRU eviction - remove oldest if at capacity
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  };

  memoized.clearCache = () => cache.clear();
  memoized.getCacheSize = () => cache.size;

  return memoized as MemoizedFn<T>;
};

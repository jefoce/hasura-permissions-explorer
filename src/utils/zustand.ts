import qs from 'qs';
import type { StateStorage } from 'zustand/middleware';

// Custom decoder to preserve boolean types when parsing URL params
const customDecoder = (
  str: string,
  defaultDecoder: (str: string, decoder?: unknown, charset?: string) => string,
  charset: string,
  type: 'key' | 'value'
): unknown => {
  const decoded = defaultDecoder(str, defaultDecoder, charset);

  // Only transform values, not keys
  if (type === 'value') {
    // Convert boolean strings to actual booleans
    if (decoded === 'true') return true;
    if (decoded === 'false') return false;

    // Convert null string to actual null
    if (decoded === 'null') return null;
  }

  return decoded;
};

export function createSearchParamsStorage(): StateStorage {
  const getParams = (): Record<string, unknown> => {
    if (typeof window === 'undefined') return {};
    return qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
      decoder: customDecoder,
    }) as Record<string, unknown>;
  };

  const setParams = (params: Record<string, unknown>): void => {
    if (typeof window === 'undefined') return;
    const queryString = qs.stringify(params, { addQueryPrefix: true });
    const newUrl = `${window.location.pathname}${queryString}`;
    if (newUrl !== window.location.href.replace(window.location.origin, '')) {
      window.history.replaceState({}, '', newUrl);
    }
  };

  return {
    getItem: (name: string): string | null => {
      const params = getParams();
      const value = params[name];
      return value === undefined ? null : JSON.stringify(value);
    },

    setItem: (name: string, value: string): void => {
      const params = getParams();
      const parsedValue = JSON.parse(value);
      const currentValue = params[name];

      // Skip if values are deeply equal
      const currentStr = currentValue === undefined ? undefined : JSON.stringify(currentValue);
      const newStr = JSON.stringify(parsedValue);
      if (currentStr === newStr) {
        return;
      }

      if (parsedValue === null || (Array.isArray(parsedValue) && parsedValue.length === 0)) {
        delete params[name];
      } else {
        params[name] = parsedValue;
      }

      setParams(params);
    },

    removeItem: (name: string): void => {
      const params = getParams();
      if (!(name in params)) return;
      delete params[name];
      setParams(params);
    },
  };
}

import { useState, useEffect, useRef } from 'react';

import { useDebounce } from './useDebounce';

interface UseDebouncedStateOptions<T> {
  storeValue: T;
  onDebouncedChange: (value: T) => void;
  delay?: number;
}

interface UseDebouncedStateReturn<T> {
  localValue: T;
  setLocalValue: (value: T) => void;
  debouncedValue: T;
}

export function useDebouncedState<T>(options: UseDebouncedStateOptions<T>): UseDebouncedStateReturn<T> {
  const { storeValue, onDebouncedChange, delay = 300 } = options;

  const [localValue, setLocalValue] = useState<T>(storeValue);
  const debouncedValue = useDebounce(localValue, delay);

  // Use ref to avoid dependency array issues with the callback
  const callbackRef = useRef(onDebouncedChange);

  // Update store when debounced value changes
  useEffect(() => {
    callbackRef.current = onDebouncedChange;
  });

  useEffect(() => {
    if (debouncedValue !== storeValue) {
      callbackRef.current(debouncedValue);
    }
  }, [debouncedValue, storeValue]);

  // Sync local state with store when external value changes
  useEffect(() => {
    setLocalValue(storeValue);
  }, [storeValue]);
  return {
    localValue,
    setLocalValue,
    debouncedValue,
  };
}

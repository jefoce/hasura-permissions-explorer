import { useReducer, useEffect, useRef } from 'react';

interface UseProgressiveRenderOptions {
  batchSize?: number;
  batchDelay?: number;
  enabled?: boolean;
}

interface UseProgressiveRenderResult<T> {
  visibleItems: T[];
  isComplete: boolean;
  remainingCount: number;
}

type Action =
  | { type: 'RESET' }
  | { type: 'RENDER_BATCH'; payload: number }
  | { type: 'ITEMS_CHANGED'; payload: { length: number; batchSize: number } };

interface State {
  renderedCount: number;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return { renderedCount: 0 };
    case 'RENDER_BATCH':
      return { renderedCount: action.payload };
    case 'ITEMS_CHANGED':
      return { renderedCount: Math.min(action.payload.batchSize, action.payload.length) };
    default:
      return state;
  }
}

export function useProgressiveRender<T>(
  items: T[],
  options: UseProgressiveRenderOptions = {}
): UseProgressiveRenderResult<T> {
  const { batchSize = 1, batchDelay = 100, enabled = true } = options;

  const initialCount = enabled ? Math.min(batchSize, items.length) : 0;
  const [state, dispatch] = useReducer(reducer, { renderedCount: initialCount });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(true);
  const prevItemsLengthRef = useRef(items.length);

  useEffect(() => {
    isActiveRef.current = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Check if items length changed
    if (items.length !== prevItemsLengthRef.current) {
      prevItemsLengthRef.current = items.length;
      if (!enabled || items.length === 0) {
        dispatch({ type: 'RESET' });
        return;
      }
      dispatch({ type: 'ITEMS_CHANGED', payload: { length: items.length, batchSize } });
      return;
    }

    if (!enabled || items.length === 0) {
      return;
    }

    // Schedule progressive rendering
    const scheduleNextBatch = (currentCount: number) => {
      if (!isActiveRef.current || !enabled) return;

      const totalItems = items.length;

      if (currentCount >= totalItems) {
        return;
      }

      timeoutRef.current = setTimeout(() => {
        if (!isActiveRef.current) return;

        const nextCount = Math.min(currentCount + batchSize, totalItems);
        dispatch({ type: 'RENDER_BATCH', payload: nextCount });

        if (nextCount < totalItems) {
          scheduleNextBatch(nextCount);
        }
      }, batchDelay);
    };

    // Continue scheduling from current count
    scheduleNextBatch(state.renderedCount);

    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [items, enabled, batchSize, batchDelay, state.renderedCount]);

  const visibleItems = items.slice(0, state.renderedCount);
  const isComplete = state.renderedCount >= items.length;
  const remainingCount = items.length - state.renderedCount;

  return {
    visibleItems,
    isComplete,
    remainingCount,
  };
}

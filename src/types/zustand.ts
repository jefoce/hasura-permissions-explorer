import type { StoreApi } from 'zustand';

export type InferParams<T extends StoreApi<unknown>> = [T['setState'], T['getState'], T];

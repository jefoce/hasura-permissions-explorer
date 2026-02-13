import { create, type StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { InferParams } from '@/types/zustand';
import { createSearchParamsStorage } from '@/utils/zustand';

type ConnectionStore = ReturnType<typeof connectionStoreConfig>;

const connectionStoreConfig = (...args: unknown[]) => {
  const [set] = args as InferParams<StoreApi<ConnectionStore>>;

  return {
    endpoint: '',
    secret: '',

    setEndpoint(endpoint: string): void {
      set({ endpoint });
    },

    setSecret(secret: string): void {
      set({ secret });
    },

    setCredentials(endpoint: string, secret: string): void {
      set({ endpoint, secret });
    },

    reset(): void {
      set({ endpoint: '', secret: '' });
    },
  };
};

const useConnectionStore = create<ConnectionStore>()(
  persist(connectionStoreConfig, {
    name: 'connection',
    storage: createJSONStorage(createSearchParamsStorage),
  })
);

export { useConnectionStore };
export type { ConnectionStore };

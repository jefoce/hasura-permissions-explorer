import { create, type StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { HasuraMetaService } from '@/services/HasuraMetaService';
import type { InferParams } from '@/types/zustand';
import { createSearchParamsStorage } from '@/utils/zustand';

export enum TabIndex {
  ConnectToHasura = 0,
  UploadJSON = 1,
}

interface TabData {
  service: HasuraMetaService | null;
  loading: boolean;
  error: string | null;
  fileName: string | null;
}

type DataStore = ReturnType<typeof dataStoreConfig>;

const createInitialTabData = (): TabData => ({
  service: null,
  loading: false,
  error: null,
  fileName: null,
});

const dataStoreConfig = (...args: unknown[]) => {
  const [set, get] = args as InferParams<StoreApi<DataStore>>;

  return {
    tabData: {
      [TabIndex.ConnectToHasura]: createInitialTabData(),
      [TabIndex.UploadJSON]: createInitialTabData(),
    },

    activeTab: TabIndex.ConnectToHasura,

    setActiveTab(tab: TabIndex): void {
      set({ activeTab: tab });
    },

    setService(tab: TabIndex, service: HasuraMetaService | null, fileName?: string): void {
      const { tabData } = get();
      set({
        tabData: {
          ...tabData,
          [tab]: {
            ...tabData[tab],
            service,
            loading: false,
            error: null,
            fileName: fileName ?? null,
          },
        },
      });
    },

    setLoading(tab: TabIndex, loading: boolean): void {
      const { tabData } = get();
      set({
        tabData: {
          ...tabData,
          [tab]: {
            ...tabData[tab],
            loading,
          },
        },
      });
    },

    setError(tab: TabIndex, error: string | null): void {
      const { tabData } = get();
      set({
        tabData: {
          ...tabData,
          [tab]: {
            ...tabData[tab],
            error,
            loading: false,
          },
        },
      });
    },

    clearTab(tab: TabIndex): void {
      const { tabData } = get();
      set({
        tabData: {
          ...tabData,
          [tab]: createInitialTabData(),
        },
      });
    },

    getFileName(tab: TabIndex): string | null {
      return get().tabData[tab]?.fileName ?? null;
    },

    getService(tab: TabIndex): HasuraMetaService | null {
      return get().tabData[tab]?.service ?? null;
    },

    getAllRoles(tab: TabIndex): string[] | null {
      return get().tabData[tab]?.service?.allRoles ?? null;
    },
  };
};

const useDataStore = create<DataStore>()(
  persist(dataStoreConfig, {
    name: 'data',
    storage: createJSONStorage(createSearchParamsStorage),
    partialize: (state) => ({ activeTab: state.activeTab }),
    skipHydration: true,
  })
);

export { useDataStore };
export type { DataStore };

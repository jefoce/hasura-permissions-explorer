import { create, type StoreApi } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { TabIndex } from '@/stores/data.store';
import { CRUDOperation, CRUDOperationsList } from '@/types/hasura';
import type { InferParams } from '@/types/zustand';
import { createSearchParamsStorage } from '@/utils/zustand';

export type FilterTabId = TabIndex | 'embedded';

export type CrudOperation = CRUDOperation;
export { CRUDOperationsList };

type FilterStore = ReturnType<typeof filterStoreConfig>;

const filterStoreConfig = (...args: unknown[]) => {
  const [set, get] = args as InferParams<StoreApi<FilterStore>>;
  return {
    visibleRoles: {
      [TabIndex.ConnectToHasura]: null as string[] | null,
      [TabIndex.UploadJSON]: null as string[] | null,
      embedded: null as string[] | null,
    },

    visibleOperations: {
      [TabIndex.ConnectToHasura]: [...CRUDOperationsList],
      [TabIndex.UploadJSON]: [...CRUDOperationsList],
      embedded: [...CRUDOperationsList],
    },

    searchQuery: {
      [TabIndex.ConnectToHasura]: '',
      [TabIndex.UploadJSON]: '',
      embedded: '',
    },

    searchExactMatch: {
      [TabIndex.ConnectToHasura]: false,
      [TabIndex.UploadJSON]: false,
      embedded: false,
    },

    searchCaseSensitive: {
      [TabIndex.ConnectToHasura]: false,
      [TabIndex.UploadJSON]: false,
      embedded: false,
    },

    isFilterExpanded: {
      [TabIndex.ConnectToHasura]: true,
      [TabIndex.UploadJSON]: true,
      embedded: true,
    },

    toggleRole(tabId: FilterTabId, role: string): void {
      const { visibleRoles } = get();
      const currentRoles = visibleRoles[tabId] ?? null;
      const newRoles: string[] | null =
        currentRoles === null
          ? [role]
          : currentRoles.includes(role)
            ? currentRoles.filter((r: string): boolean => r !== role)
            : [...currentRoles, role].sort();
      set({
        visibleRoles: {
          ...visibleRoles,
          [tabId]: newRoles,
        },
      });
    },

    setVisibleRoles(tabId: FilterTabId, roles: string[] | null): void {
      const { visibleRoles } = get();
      const newRoles: string[] | null = roles === null ? null : [...roles].sort();
      set({
        visibleRoles: {
          ...visibleRoles,
          [tabId]: newRoles,
        },
      });
    },

    toggleOperation(tabId: FilterTabId, operation: CrudOperation): void {
      const { visibleOperations } = get();
      const currentOperations = visibleOperations[tabId] ?? null;
      const newOperations: CrudOperation[] | null =
        currentOperations === null
          ? [operation]
          : currentOperations.includes(operation)
            ? currentOperations.filter((o: CrudOperation): boolean => o !== operation)
            : [...currentOperations, operation].sort();
      set({
        visibleOperations: {
          ...visibleOperations,
          [tabId]: newOperations,
        },
      });
    },

    setVisibleOperations(tabId: FilterTabId, operations: CrudOperation[] | null): void {
      const { visibleOperations } = get();
      const newOperations: CrudOperation[] | null = operations === null ? null : [...operations].sort();
      set({
        visibleOperations: {
          ...visibleOperations,
          [tabId]: newOperations,
        },
      });
    },

    reset(tabId: FilterTabId): void {
      const { visibleRoles, visibleOperations } = get();
      set({
        visibleRoles: {
          ...visibleRoles,
          [tabId]: null,
        },
        visibleOperations: {
          ...visibleOperations,
          [tabId]: null,
        },
      });
    },

    getVisibleRoles(tabId: FilterTabId): string[] | null {
      return get().visibleRoles[tabId] ?? null;
    },

    getVisibleOperations(tabId: FilterTabId): CrudOperation[] | null {
      return get().visibleOperations[tabId] ?? null;
    },

    setSearchQuery(tabId: FilterTabId, query: string): void {
      const { searchQuery } = get();
      set({
        searchQuery: {
          ...searchQuery,
          [tabId]: query,
        },
      });
    },

    toggleSearchExactMatch(tabId: FilterTabId): void {
      const { searchExactMatch } = get();
      set({
        searchExactMatch: {
          ...searchExactMatch,
          [tabId]: !searchExactMatch[tabId],
        },
      });
    },

    toggleSearchCaseSensitive(tabId: FilterTabId): void {
      const { searchCaseSensitive } = get();
      set({
        searchCaseSensitive: {
          ...searchCaseSensitive,
          [tabId]: !searchCaseSensitive[tabId],
        },
      });
    },

    getSearchQuery(tabId: FilterTabId): string {
      return get().searchQuery[tabId] ?? '';
    },

    getSearchExactMatch(tabId: FilterTabId): boolean {
      return get().searchExactMatch[tabId] ?? false;
    },

    getSearchCaseSensitive(tabId: FilterTabId): boolean {
      return get().searchCaseSensitive[tabId] ?? false;
    },

    setFilterExpanded(tabId: FilterTabId, expanded: boolean): void {
      const { isFilterExpanded } = get();
      set({
        isFilterExpanded: {
          ...isFilterExpanded,
          [tabId]: expanded,
        },
      });
    },

    getFilterExpanded(tabId: FilterTabId): boolean {
      return get().isFilterExpanded[tabId] ?? true;
    },
  };
};

const useFilterStore = create<FilterStore>()(
  persist(filterStoreConfig, {
    name: 'filter',
    storage: createJSONStorage(createSearchParamsStorage),
  })
);

export { useFilterStore };
export type { FilterStore };

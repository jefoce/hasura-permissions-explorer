import { Box } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { useProgressiveRender } from '@/hooks/useProgressiveRender';
import type { HasuraMetaService } from '@/services/HasuraMetaService';
import type { HasuraTableService } from '@/services/HasuraTableService';
import { useFilterStore, type FilterTabId } from '@/stores/filter.store';

import { PermissionTable } from './PermissionTable';
import { PermissionTablesTabs } from './PermissionTablesTabs';

export type PermissionTablesProps = {
  service: HasuraMetaService | null;
  tabId: FilterTabId;
};

export const PermissionTables: React.FC<PermissionTablesProps> = (props) => {
  const { service, tabId } = props;
  const tableRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Get filter state from store
  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(tabId));
  const visibleOperations = useFilterStore((state) => state.getVisibleOperations(tabId));
  const searchQuery = useFilterStore((state) => state.getSearchQuery(tabId));
  const searchExactMatch = useFilterStore((state) => state.getSearchExactMatch(tabId));
  const searchCaseSensitive = useFilterStore((state) => state.getSearchCaseSensitive(tabId));
  const filterExpanded = useFilterStore((state) => state.getFilterExpanded(tabId));

  const tables = service?.tables ?? [];
  const { visibleItems, remainingCount } = useProgressiveRender<HasuraTableService>(tables, { enabled: !!service });

  // Compute visible table names
  const tableNames = useMemo(() => {
    if (!service) return [];
    return service.getVisibleTableNames(searchQuery, searchExactMatch, searchCaseSensitive);
  }, [service, searchQuery, searchExactMatch, searchCaseSensitive]);

  const setTableRef = (tableName: string) => (el: HTMLElement | null) => {
    if (el) {
      tableRefs.current.set(tableName, el);
    } else {
      tableRefs.current.delete(tableName);
    }
  };

  if (!service) return null;

  // When visibleRoles is null, show all roles from the service
  const rolesToShow = visibleRoles === null ? service.allRoles : visibleRoles;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2 }}>
      <PermissionTablesTabs tableNames={tableNames} tableRefs={tableRefs} filterExpanded={filterExpanded} />

      <Box sx={{ flex: 1 }}>
        <Box id="permission-tables-container">
          {visibleItems.map((tableService: HasuraTableService) => (
            <Box
              key={tableService.tableName}
              ref={setTableRef(tableService.tableName)}
              sx={{
                scrollMarginTop: '80px',
              }}
            >
              <PermissionTable
                service={tableService}
                visibleRoles={rolesToShow}
                visibleOperations={visibleOperations}
                searchQuery={searchQuery}
                searchExactMatch={searchExactMatch}
                searchCaseSensitive={searchCaseSensitive}
              />
            </Box>
          ))}
          {remainingCount > 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Loading {remainingCount} more tables...
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

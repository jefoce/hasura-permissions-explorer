import { Box } from '@mui/material';
import React from 'react';

import { useProgressiveRender } from '@/hooks/useProgressiveRender';
import type { HasuraMetaService } from '@/services/HasuraMetaService';
import type { HasuraTableService } from '@/services/HasuraTableService';
import type { CrudOperation } from '@/stores/filter.store';

import { PermissionTable } from './PermissionTable';

export type PermissionTablesProps = {
  service: HasuraMetaService | null;
  visibleRoles: string[] | null;
  visibleOperations: CrudOperation[] | null;
  searchQuery?: string;
  searchExactMatch?: boolean;
  searchCaseSensitive?: boolean;
};

export const PermissionTables: React.FC<PermissionTablesProps> = (props) => {
  const { service, visibleRoles, visibleOperations, searchQuery, searchExactMatch, searchCaseSensitive } = props;

  const tables = service?.tables ?? [];
  const { visibleItems, remainingCount } = useProgressiveRender<HasuraTableService>(tables, { enabled: !!service });

  if (!service) return null;

  // When visibleRoles is null, show all roles from the service
  const rolesToShow = visibleRoles === null ? service.allRoles : visibleRoles;

  return (
    <Box id="permission-tables-container">
      {visibleItems.map((tableService: HasuraTableService) => (
        <PermissionTable
          key={tableService.tableName}
          service={tableService}
          visibleRoles={rolesToShow}
          visibleOperations={visibleOperations}
          searchQuery={searchQuery}
          searchExactMatch={searchExactMatch}
          searchCaseSensitive={searchCaseSensitive}
        />
      ))}
      {remainingCount > 0 && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Loading {remainingCount} more tables...</Box>
      )}
    </Box>
  );
};

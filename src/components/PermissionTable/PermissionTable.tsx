import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { memo, useCallback, useMemo, useState } from 'react';

import type { HasuraTableService } from '@/services/HasuraTableService';
import type { CrudOperation } from '@/stores/filter.store';
import { CRUDOperationsList, OperationFullNames } from '@/types/hasura';

import { FieldRow } from './FieldRow';
import { FilterCell } from './FilterCell';

export type PermissionTableProps = {
  service: HasuraTableService;
  visibleRoles: string[] | null;
  visibleOperations: CrudOperation[] | null;
  searchQuery?: string;
  searchExactMatch?: boolean;
  searchCaseSensitive?: boolean;
};

export const PermissionTable = memo<PermissionTableProps>((props) => {
  const { service, visibleRoles, visibleOperations, searchQuery, searchExactMatch, searchCaseSensitive } = props;

  // When visibleRoles is null, show all roles from the service
  const rolesToShow = visibleRoles === null ? service.allRoles : visibleRoles;

  // When visibleOperations is null, show all operations
  const operationsToShow = visibleOperations === null ? CRUDOperationsList : visibleOperations;

  const fields = useMemo(() => {
    const allFields = service.getTableFields();

    if (!searchQuery || searchQuery.trim() === '') {
      return allFields;
    }

    const query = searchCaseSensitive ? searchQuery : searchQuery.toLowerCase();

    return allFields.filter((field) => {
      const fieldToCompare = searchCaseSensitive ? field : field.toLowerCase();

      if (searchExactMatch) {
        return fieldToCompare === query;
      } else {
        return fieldToCompare.includes(query);
      }
    });
  }, [service, searchQuery, searchExactMatch, searchCaseSensitive]);

  const hasOperationFilters = useMemo(
    () =>
      operationsToShow.filter((operation) =>
        rolesToShow.some((role: string) => service.getRoleFilters(role, operation))
      ),
    [operationsToShow, rolesToShow, service]
  );

  const hasOperationSets = useMemo(
    () =>
      operationsToShow.filter((operation) => rolesToShow.some((role: string) => service.getRoleSets(role, operation))),
    [operationsToShow, rolesToShow, service]
  );

  // State for selected hash (tracks which value hash is highlighted)
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  const handlePathClick = useCallback(
    (path: string) => {
      // Toggle: if clicking the same hash, deselect; otherwise select the new hash
      const pathHash = service.getPathHash(path);
      if (pathHash) {
        setSelectedHash((current) => (current === pathHash ? null : pathHash));
      }
    },
    [service]
  );

  // Don't render table if no fields match the search
  if (fields.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell colSpan={rolesToShow.length + 1}>
              <Typography variant="h6" color="white">
                {service.tableName}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell>
              <Typography variant="subtitle2">Field</Typography>
            </TableCell>
            {rolesToShow.map((role: string) => (
              <TableCell key={role} align="center">
                <Typography variant="subtitle2">{role}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field) => (
            <FieldRow
              key={field}
              field={field}
              service={service}
              visibleRoles={rolesToShow}
              visibleOperations={operationsToShow}
            />
          ))}
        </TableBody>

        {hasOperationFilters.length > 0 && (
          <>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell>
                  <Typography variant="subtitle2">Filters</Typography>
                </TableCell>
                {rolesToShow.map((role: string) => (
                  <TableCell key={role} align="center">
                    <Typography variant="subtitle2">{role}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {hasOperationFilters.map((operation) => (
                <TableRow key={operation}>
                  <TableCell>{OperationFullNames[operation]}</TableCell>
                  {rolesToShow.map((role: string) => {
                    const filters = service.getRoleFilters(role, operation);
                    const pathPrefix = `${role}:${operation}`;
                    return (
                      <FilterCell
                        key={role}
                        filters={filters}
                        pathPrefix={pathPrefix}
                        service={service}
                        selectedHash={selectedHash}
                        onPathClick={handlePathClick}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </>
        )}

        {hasOperationSets.length > 0 && (
          <>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell>
                  <Typography variant="subtitle2">Sets</Typography>
                </TableCell>
                {rolesToShow.map((role: string) => (
                  <TableCell key={role} align="center">
                    <Typography variant="subtitle2">{role}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {hasOperationSets.map((operation) => (
                <TableRow key={operation}>
                  <TableCell>{OperationFullNames[operation]}</TableCell>
                  {rolesToShow.map((role: string) => {
                    const sets = service.getRoleSets(role, operation);
                    const hasSets = service.formatSet(sets || {}, '\n');

                    return (
                      <TableCell key={role} align="left" sx={{ textAlign: 'left' }}>
                        {sets && (
                          <Box
                            sx={{
                              overflow: 'auto',
                              whiteSpace: 'pre',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              p: 1,
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                            }}
                          >
                            {hasSets}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </>
        )}
      </Table>
    </TableContainer>
  );
});

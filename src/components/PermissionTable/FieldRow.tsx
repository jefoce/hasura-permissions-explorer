import { Box, Chip, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

import type { HasuraTableService } from '@/services/HasuraTableService';
import type { CrudOperation } from '@/stores/filter.store';

export type FieldRowProps = {
  field: string;
  service: HasuraTableService;
  visibleRoles: string[];
  visibleOperations: CrudOperation[] | null;
};

export const FieldRow = memo<FieldRowProps>((props) => {
  const { field, service, visibleRoles, visibleOperations } = props;

  return (
    <TableRow hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {field}
        </Typography>
      </TableCell>
      {visibleRoles.map((role: string) => {
        const perms = service.getRolePermissions(role, field);
        const filteredPerms =
          visibleOperations === null ? perms : perms.filter(({ operation }) => visibleOperations.includes(operation));

        return (
          <TableCell key={role} align="center">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              {filteredPerms.map(({ operation, hasFilter }) => (
                <Tooltip key={operation} title={hasFilter ? 'Has filter restrictions' : ''} arrow>
                  <Chip
                    label={operation}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      minWidth: '28px',
                      backgroundColor: hasFilter ? 'error.main' : 'grey.300',
                      color: hasFilter ? 'white' : 'text.primary',
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </TableCell>
        );
      })}
    </TableRow>
  );
});

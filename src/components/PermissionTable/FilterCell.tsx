import { Box, TableCell } from '@mui/material';
import { memo } from 'react';

import type { HasuraTableService } from '@/services/HasuraTableService';

import { FilterJsonRenderer } from './FilterJsonRenderer';

export type FilterCellProps = {
  filters: Record<string, unknown> | null;
  pathPrefix: string;
  service: HasuraTableService;
  selectedHash: string | null;
  onPathClick: (path: string) => void;
};

export const FilterCell = memo<FilterCellProps>((props) => {
  const { filters, pathPrefix, selectedHash, onPathClick, service } = props;

  if (!filters) {
    return <TableCell align="left" sx={{ textAlign: 'left', verticalAlign: 'top' }} />;
  }

  return (
    <TableCell align="left" sx={{ textAlign: 'left', verticalAlign: 'top' }}>
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
        <FilterJsonRenderer
          data={filters}
          path=""
          pathPrefix={pathPrefix}
          service={service}
          selectedHash={selectedHash}
          onPathClick={onPathClick}
        />
      </Box>
    </TableCell>
  );
});

import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { memo } from 'react';

import { useFilterStore, type CrudOperation, type FilterTabId } from '@/stores/filter.store';
import { CRUDOperation, CRUDOperationsList, OperationFullNames } from '@/types/hasura';

interface OperationsFilterProps {
  tabId: FilterTabId;
}

export const OperationsFilter = memo<OperationsFilterProps>((props) => {
  const { tabId } = props;
  const visibleOperations = useFilterStore((state) => state.getVisibleOperations(tabId));
  const toggleOperation = useFilterStore((state) => state.toggleOperation);

  const isOperationChecked = (operation: CrudOperation): boolean =>
    visibleOperations === null || visibleOperations.includes(operation);

  const handleToggle = (operation: CrudOperation) => {
    toggleOperation(tabId, operation);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Operations
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {CRUDOperationsList.map((operation: CRUDOperation) => (
          <FormControlLabel
            key={operation}
            control={<Checkbox checked={isOperationChecked(operation)} onChange={() => handleToggle(operation)} />}
            label={OperationFullNames[operation]}
          />
        ))}
      </Box>
    </Box>
  );
});

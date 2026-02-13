import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography, Box, IconButton, Chip } from '@mui/material';
import { memo } from 'react';

import { useFilterStore, type FilterTabId } from '@/stores/filter.store';
import { CRUDOperationsList } from '@/types/hasura';

interface FilterPanelHeaderProps {
  roles: string[];
  tabId: FilterTabId;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FilterPanelHeader = memo<FilterPanelHeaderProps>((props) => {
  const { roles, tabId, isExpanded, onToggle } = props;
  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(tabId));
  const visibleOperations = useFilterStore((state) => state.getVisibleOperations(tabId));
  const searchQuery = useFilterStore((state) => state.getSearchQuery(tabId));
  const searchExactMatch = useFilterStore((state) => state.getSearchExactMatch(tabId));
  const searchCaseSensitive = useFilterStore((state) => state.getSearchCaseSensitive(tabId));

  const activeRolesCount = visibleRoles === null ? roles.length : visibleRoles.length;
  const activeOperationsCount = visibleOperations === null ? CRUDOperationsList.length : visibleOperations.length;
  const hasSearchQuery = searchQuery && searchQuery.trim() !== '';
  const hasSearchOptions = searchExactMatch || searchCaseSensitive;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">Filters</Typography>
        {!isExpanded && (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip size="small" label={`${activeRolesCount}/${roles.length} roles`} variant="outlined" />
            <Chip size="small" label={`${activeOperationsCount}/${CRUDOperationsList.length} ops`} variant="outlined" />
            {hasSearchQuery && (
              <Chip
                size="small"
                label={`"${searchQuery}"${hasSearchOptions ? ` [${searchExactMatch ? 'Ex' : ''}${searchCaseSensitive ? 'Aa' : ''}]` : ''}`}
                variant="outlined"
                color="primary"
                sx={{ maxWidth: 200 }}
              />
            )}
          </Box>
        )}
      </Box>
      <IconButton onClick={onToggle} size="small">
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  );
});

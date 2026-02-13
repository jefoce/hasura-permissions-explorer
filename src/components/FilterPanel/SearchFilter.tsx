import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { memo } from 'react';

import { useDebouncedState } from '@/hooks/useDebouncedState';
import { useFilterStore, type FilterTabId } from '@/stores/filter.store';

interface SearchFilterProps {
  tabId: FilterTabId;
}

export const SearchFilter = memo<SearchFilterProps>((props) => {
  const { tabId } = props;
  const searchQuery = useFilterStore((state) => state.getSearchQuery(tabId));
  const searchExactMatch = useFilterStore((state) => state.getSearchExactMatch(tabId));
  const searchCaseSensitive = useFilterStore((state) => state.getSearchCaseSensitive(tabId));
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const toggleSearchExactMatch = useFilterStore((state) => state.toggleSearchExactMatch);
  const toggleSearchCaseSensitive = useFilterStore((state) => state.toggleSearchCaseSensitive);

  const { localValue: localSearchQuery, setLocalValue: setLocalSearchQuery } = useDebouncedState<string>({
    storeValue: searchQuery,
    onDebouncedChange: (value) => setSearchQuery(tabId, value),
    delay: 300,
  });

  const { localValue: localExactMatch, setLocalValue: toggleExactMatch } = useDebouncedState<boolean>({
    storeValue: searchExactMatch,
    onDebouncedChange: () => toggleSearchExactMatch(tabId),
    delay: 300,
  });

  const { localValue: localCaseSensitive, setLocalValue: toggleCaseSensitive } = useDebouncedState<boolean>({
    storeValue: searchCaseSensitive,
    onDebouncedChange: () => toggleSearchCaseSensitive(tabId),
    delay: 300,
  });

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Fields
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search fields..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
        <ToggleButtonGroup
          size="small"
          aria-label="search options"
          defaultValue={[]}
          value={[localExactMatch ? 'exact' : null, localCaseSensitive ? 'case' : null]}
          onChange={(_, selected: string[]) => {
            toggleExactMatch(selected.includes('exact'));
            toggleCaseSensitive(selected.includes('case'));
          }}
        >
          <ToggleButton value="exact" title="Exact match" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            Exact
          </ToggleButton>
          <ToggleButton value="case" title="Case sensitive" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            Aa
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
});

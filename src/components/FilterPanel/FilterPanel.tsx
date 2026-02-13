import { Paper, Divider, Box, Collapse } from '@mui/material';
import React from 'react';

import { useStickyCollapse } from '@/hooks/useStickyCollapse';
import { type FilterTabId } from '@/stores/filter.store';

import { FilterPanelHeader } from './FilterPanelHeader';
import { OperationsFilter } from './OperationsFilter';
import { RolesFilter } from './RolesFilter';
import { SearchFilter } from './SearchFilter';

export interface FilterPanelProps {
  roles: string[];
  tabId: FilterTabId;
}

export const FilterPanel: React.FC<FilterPanelProps> = (props) => {
  const { roles, tabId } = props;
  const { isExpanded, toggle, containerRef } = useStickyCollapse({ threshold: 300 });

  return (
    <Box ref={containerRef} sx={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <Paper sx={{ p: 2 }}>
        <FilterPanelHeader roles={roles} tabId={tabId} isExpanded={isExpanded} onToggle={toggle} />

        <Collapse in={isExpanded} timeout={300}>
          <Box sx={{ mt: 2 }}>
            <RolesFilter roles={roles} tabId={tabId} />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <OperationsFilter tabId={tabId} />
              </Box>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
              <Box sx={{ flex: 1 }}>
                <SearchFilter tabId={tabId} />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

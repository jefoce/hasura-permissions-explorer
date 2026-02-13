import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { memo } from 'react';

import { useFilterStore, type FilterTabId } from '@/stores/filter.store';

interface RolesFilterProps {
  roles: string[];
  tabId: FilterTabId;
}

export const RolesFilter = memo<RolesFilterProps>((props) => {
  const { roles, tabId } = props;
  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(tabId));
  const toggleRole = useFilterStore((state) => state.toggleRole);

  const isRoleChecked = (role: string): boolean => visibleRoles === null || visibleRoles.includes(role);

  const handleToggle = (role: string) => {
    toggleRole(tabId, role);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Roles
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {roles.map((role) => (
          <FormControlLabel
            key={role}
            control={<Checkbox checked={isRoleChecked(role)} onChange={() => handleToggle(role)} />}
            label={role}
          />
        ))}
      </Box>
    </Box>
  );
});

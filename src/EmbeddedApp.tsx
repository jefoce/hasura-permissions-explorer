import { CssBaseline, Link, Stack, ThemeProvider, Typography, createTheme } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { FilterPanel } from '@/components/FilterPanel';
import { PermissionTables } from '@/components/PermissionTable';
import { HasuraMetaService } from '@/services/HasuraMetaService';
import { useFilterStore } from '@/stores/filter.store';

// Extend Window interface for export configuration
declare global {
  interface Window {
    __hasuraMetadata?: unknown;
    __exportConfig?: {
      selectedRoles: string[];
      selectedTables: string[];
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderRight: '1px solid rgba(224, 224, 224, 1)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
      },
    },
  },
});

export default function EmbeddedApp() {
  const service = useMemo(() => {
    if (window.__hasuraMetadata) {
      return new HasuraMetaService(window.__hasuraMetadata);
    }
    return null;
  }, []);

  const setVisibleRoles = useFilterStore((state) => state.setVisibleRoles);
  const visibleRoles = useFilterStore((state) => state.getVisibleRoles('embedded'));

  useEffect(() => {
    if (service && visibleRoles === null) {
      const exportConfig = window.__exportConfig;
      const initialRoles = exportConfig ? exportConfig.selectedRoles : service.allRoles;
      setVisibleRoles('embedded', initialRoles);
    }
  }, [service, setVisibleRoles, visibleRoles]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack gap={2} sx={{ width: '100%', minHeight: '100%', p: '20px', boxSizing: 'border-box' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Link
            href="https://jefoce.github.io/hasura-permissions-explorer/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
          >
            Hasura Permissions Explorer
          </Link>
        </Typography>
        {service && (
          <>
            <FilterPanel roles={service.allRoles} tabId="embedded" />
            <PermissionTables service={service} tabId="embedded" />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}

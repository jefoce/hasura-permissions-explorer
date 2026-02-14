import {
  Alert,
  Box,
  Container,
  CssBaseline,
  Stack,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import React, { useCallback } from 'react';

import { ConnectionForm } from '@/components/ConnectionForm';
import { ExportButton } from '@/components/ExportButton';
import { FileDropZone } from '@/components/FileDropZone';
import { FilterPanel } from '@/components/FilterPanel';
import { PermissionTables } from '@/components/PermissionTable';
import { useDataStore, TabIndex } from '@/stores/data.store';

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

export default function App() {
  // Direct store usage with selectors - only select values, not functions
  const activeTab = useDataStore((state) => state.activeTab);
  const service = useDataStore((state) => state.tabData[activeTab]?.service ?? null);
  const error = useDataStore((state) => state.tabData[activeTab]?.error ?? null);
  const allRoles = useDataStore((state) => state.getAllRoles(activeTab));

  // Get store actions directly (they're stable references)
  const setActiveTab = useDataStore((state) => state.setActiveTab);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue as TabIndex);
    },
    [setActiveTab]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Stack gap={2} sx={{ width: '100%', minHeight: '100%', p: '20px', boxSizing: 'border-box' }}>
        <Container maxWidth="md">
          <Stack gap={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              Hasura Permissions Explorer
            </Typography>

            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Connect to Hasura" />
                <Tab label="Upload JSON" />
              </Tabs>
              <ExportButton disabled={!service} service={service} />
            </Box>

            {activeTab === TabIndex.ConnectToHasura && <ConnectionForm activeTab={activeTab} />}

            {activeTab === TabIndex.UploadJSON && <FileDropZone activeTab={activeTab} />}

            {(error || service?.error) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error || service?.error}
              </Alert>
            )}
          </Stack>
        </Container>

        {allRoles && <FilterPanel roles={allRoles} tabId={activeTab} />}

        <PermissionTables service={service} tabId={activeTab} />
      </Stack>
    </ThemeProvider>
  );
}

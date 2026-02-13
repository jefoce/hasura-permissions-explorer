import {
  Typography,
  Box,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  Container,
  Stack,
  Paper,
} from '@mui/material';
import React, { useCallback } from 'react';

import { ConnectionForm } from '@/components/ConnectionForm';
import { ExportButton } from '@/components/ExportButton';
import { FileDropZone } from '@/components/FileDropZone';
import { FilterPanel } from '@/components/FilterPanel';
import { PermissionTables } from '@/components/PermissionTable';
import { useDataStore, TabIndex } from '@/stores/data.store';
import { useFilterStore } from '@/stores/filter.store';

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
  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(activeTab));
  const visibleOperations = useFilterStore((state) => state.getVisibleOperations(activeTab));
  const searchQuery = useFilterStore((state) => state.getSearchQuery(activeTab));
  const searchExactMatch = useFilterStore((state) => state.getSearchExactMatch(activeTab));
  const searchCaseSensitive = useFilterStore((state) => state.getSearchCaseSensitive(activeTab));

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

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                backgroundColor: 'grey.100',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Filters and settings are stored in URL search params — share the link to give anyone access to your
                current view.
                <br />
                Note: metadata is only stored for this session, so the JSON tab will be empty when shared or after
                reload.
              </Typography>
            </Paper>

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

        <PermissionTables
          service={service}
          visibleRoles={visibleRoles}
          visibleOperations={visibleOperations}
          searchQuery={searchQuery}
          searchExactMatch={searchExactMatch}
          searchCaseSensitive={searchCaseSensitive}
        />
      </Stack>
    </ThemeProvider>
  );
}

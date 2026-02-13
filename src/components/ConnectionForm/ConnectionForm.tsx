import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Box, Button, CircularProgress, FormControl, FormLabel, TextField, Typography, Paper } from '@mui/material';
import React, { useState, useCallback, useRef, useEffect } from 'react';

import { PingDot } from '@/components/ui/Indication/PingDot';
import { useHasuraConnection } from '@/hooks/useHasuraConnection';
import { useConnectionStore } from '@/stores/connection.store';
import { useDataStore, TabIndex } from '@/stores/data.store';
import { useFilterStore } from '@/stores/filter.store';

export interface ConnectionFormProps {
  activeTab: TabIndex;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = (props) => {
  const { activeTab } = props;
  const connectRef = useRef<HTMLButtonElement>(null);

  const endpoint = useConnectionStore((state) => state.endpoint);
  const secret = useConnectionStore((state) => state.secret);
  const setCredentials = useConnectionStore((state) => state.setCredentials);

  const loading = useDataStore((state) => state.tabData[activeTab]?.loading ?? false);
  const service = useDataStore((state) => state.tabData[activeTab]?.service ?? null);
  const setService = useDataStore((state) => state.setService);
  const setLoading = useDataStore((state) => state.setLoading);
  const setError = useDataStore((state) => state.setError);

  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(activeTab));
  const setVisibleRoles = useFilterStore((state) => state.setVisibleRoles);

  const { connectionState, connect } = useHasuraConnection();
  const lastEndpointRef = useRef<string>(connectionState.endpoint);

  const [localEndpoint, setLocalEndpoint] = useState(endpoint);
  const [localSecret, setLocalSecret] = useState(secret);

  const loadFromHasura = useCallback(
    async (endpoint?: string, secret?: string) => {
      setLoading(activeTab, true);
      setError(activeTab, null);

      const creds = endpoint && secret ? { endpoint, secret } : connectionState;
      const result = await connect(creds);
      if (result.success && result.service) {
        setService(activeTab, result.service);

        // Initialize filters with all roles if null, or reset when endpoint changes
        if (endpoint && endpoint !== lastEndpointRef.current) {
          setVisibleRoles(activeTab, result.service.allRoles);
          lastEndpointRef.current = endpoint;
        } else if (visibleRoles === null) {
          setVisibleRoles(activeTab, result.service.allRoles);
        }
      } else {
        setError(activeTab, result.error);
      }
    },
    [activeTab, connect, connectionState, setLoading, setError, setService, setVisibleRoles, visibleRoles]
  );

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      setCredentials(localEndpoint, localSecret);
      void loadFromHasura(localEndpoint, localSecret);
    },
    [localEndpoint, localSecret, setCredentials, loadFromHasura]
  );

  useEffect(() => {
    if (endpoint && secret) {
      connectRef.current?.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <FormControl fullWidth sx={{ gap: 2 }}>
        <FormLabel>Hasura Connection</FormLabel>

        <TextField
          label="Endpoint"
          placeholder="http://localhost/v1/graphql"
          value={localEndpoint}
          onChange={(e) => setLocalEndpoint(e.target.value)}
          size="small"
          disabled={loading}
        />

        <TextField
          label="Admin Secret"
          type="password"
          placeholder="your-admin-secret"
          value={localSecret}
          onChange={(e) => setLocalSecret(e.target.value)}
          size="small"
          disabled={loading}
        />

        <Button
          ref={connectRef}
          type="submit"
          variant="contained"
          disabled={loading || !localEndpoint}
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
        >
          {loading ? 'Connecting...' : service ? 'Refresh' : 'Connect'}
        </Button>
      </FormControl>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading metadata from Hasura...
          </Typography>
        </Box>
      )}

      {!loading && service && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <PingDot />
          <Typography variant="body2" sx={{ color: '#6ca413', ml: 1 }}>
            Connected
          </Typography>
          <Typography variant="body2" color="textDisabled" sx={{ ml: 'auto' }}>
            {service.tables.length} tables loaded
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

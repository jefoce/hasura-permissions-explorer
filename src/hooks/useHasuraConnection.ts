import { useCallback } from 'react';

import { fetchMetadataFromHasura } from '@/services/HasuraClient';
import { HasuraMetaService } from '@/services/HasuraMetaService';
import { useConnectionStore } from '@/stores/connection.store';

export interface HasuraConnectionState {
  endpoint: string;
  secret: string;
}

export function useHasuraConnection() {
  const { endpoint, secret, setEndpoint, setSecret, setCredentials } = useConnectionStore();

  const connect = useCallback(
    async (creds?: { endpoint: string; secret: string }) => {
      const { endpoint: credsEndpoint, secret: credsSecret } = creds ?? { endpoint, secret };

      if (!credsEndpoint || !credsSecret) {
        return {
          success: false,
          error: 'Please enter both endpoint and secret',
          service: null,
        };
      }

      try {
        const result = await fetchMetadataFromHasura(credsEndpoint, credsSecret);

        if (result.error) {
          return {
            success: false,
            error: result.error,
            service: null,
          };
        } else if (result.metadata) {
          const service = new HasuraMetaService(result.metadata);
          return {
            success: true,
            error: null,
            service,
          };
        }

        return {
          success: false,
          error: 'Unknown error occurred',
          service: null,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to load from Hasura',
          service: null,
        };
      }
    },
    [endpoint, secret]
  );

  return {
    connectionState: { endpoint, secret },
    updateEndpoint: setEndpoint,
    updateSecret: setSecret,
    setCredentials,
    connect,
    hasEnvCredentials: false,
  };
}

import type { HasuraMetadata } from '@/types/hasura';

import type { MetadataResult } from './HasuraMetaService';

export async function fetchMetadataFromHasura(
  endpoint: string,
  adminSecret: string
): Promise<MetadataResult & { metadata?: HasuraMetadata }> {
  try {
    // Try to get metadata via Hasura's export_metadata API
    const url = new URL(endpoint);
    const response = await fetch(`${url.origin}/v1/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': adminSecret,
      },
      body: JSON.stringify({
        type: 'export_metadata',
        args: {},
      }),
    });

    if (!response.ok) {
      return {
        tables: [],
        allRoles: [],
        error: `Failed to fetch metadata: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    // The export_metadata returns { metadata: { ... } }
    const metadata: HasuraMetadata = {
      metadata: data,
    };

    return {
      tables: [],
      allRoles: [],
      error: null,
      metadata,
    };
  } catch (err) {
    return {
      tables: [],
      allRoles: [],
      error: err instanceof Error ? err.message : 'Failed to fetch metadata from Hasura',
    };
  }
}

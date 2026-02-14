import { Download as DownloadIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { get } from 'lodash-es';
import React, { useCallback, useState } from 'react';

import type { HasuraMetaService } from '@/services/HasuraMetaService';
import type { Source, HasuraMetadata, TablePermissions } from '@/types/hasura';

import { ExportModal } from './ExportModal';

export type ExportButtonProps = {
  disabled?: boolean;
  service: HasuraMetaService | null;
};

export const ExportButton: React.FC<ExportButtonProps> = (props) => {
  const { disabled = false, service } = props;
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleExport = useCallback(
    async (selectedRoles: string[], selectedTables: string[]) => {
      if (!service) return;

      try {
        // Filter metadata to only include selected tables
        const filteredMetadata = filterMetadataByTables(service.rawMetadata, selectedTables);

        // Generate the export HTML with inlined assets
        const exportHtml = await generateExportHTML(filteredMetadata, selectedRoles, selectedTables);

        const blob = new Blob([exportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hasura-permissions-explorer.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        alert('Failed to export. Please try again.');
      }
    },
    [service]
  );

  const allRoles = service?.allRoles ?? [];
  const allTables = service?.tables.map((t) => t.tableName) ?? [];

  return (
    <>
      <Button variant="outlined" onClick={handleOpenModal} disabled={disabled} startIcon={<DownloadIcon />}>
        Export to HTML
      </Button>
      <ExportModal
        open={modalOpen}
        onClose={handleCloseModal}
        onExport={handleExport}
        allRoles={allRoles}
        allTables={allTables}
      />
    </>
  );
};

// Filter metadata to only include selected tables
// Returns minimal structure: { sources: [...] } with filtered tables
function filterMetadataByTables(metadata: HasuraMetadata, selectedTables: string[]): HasuraMetadata {
  const sources: Source[] = get(metadata, 'metadata.sources') || get(metadata, 'sources', []);

  if (!Array.isArray(sources)) {
    return { sources: [] };
  }

  const filteredSources = sources.map<Source>((source: Source) => {
    const tables = get(source, 'tables', []);
    const filteredTables = tables.filter((table: unknown) => {
      const tableName = get(table, 'table.name');
      return typeof tableName === 'string' && selectedTables.includes(tableName);
    });
    return {
      name: source.name,
      tables: filteredTables.map<TablePermissions>((t) => ({
        table: t.table,
        insert_permissions: t.insert_permissions,
        select_permissions: t.select_permissions,
        update_permissions: t.update_permissions,
        delete_permissions: t.delete_permissions,
      })),
    };
  });

  return { sources: filteredSources } as HasuraMetadata;
}

async function generateExportHTML(
  metadata: HasuraMetadata,
  selectedRoles: string[],
  selectedTables: string[]
): Promise<string> {
  // Define static asset paths (only embedded.js and embedded.css after inlineDynamicImports)
  const cssFiles = ['assets/embedded.css'];
  const jsFiles = ['assets/embedded.js'];

  // Fetch all CSS files
  let cssContent = '';
  for (const cssFile of cssFiles) {
    try {
      const response = await fetch(cssFile);
      if (response.ok) {
        cssContent += '\n/* ' + cssFile + ' */\n' + (await response.text());
      }
    } catch {
      // Ignore fetch errors for CSS files
    }
  }

  // Fetch the embedded JS file (all code inlined)
  let jsContent = '';
  for (const jsFile of jsFiles) {
    try {
      const response = await fetch(jsFile);
      if (response.ok) {
        jsContent += '\n/* ' + jsFile + ' */\n' + (await response.text());
      }
    } catch {
      // Ignore fetch errors for JS files
    }
  }

  if (!jsContent) {
    throw new Error('Could not load embedded.js. Please build the app first (npm run build).');
  }

  // Create the standalone HTML document
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='5' y='5' width='90' height='90' rx='20' fill='%23059669'/%3E%3Ctext x='50' y='72' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='70' font-weight='600' fill='%23ffffff'%3EH%3C/text%3E%3C/svg%3E" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hasura Permissions Explorer</title>
    <style>${cssContent}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__hasuraMetadata = ${JSON.stringify(metadata)};
      window.__exportConfig = {
        selectedRoles: ${JSON.stringify(selectedRoles)},
        selectedTables: ${JSON.stringify(selectedTables)}
      };
    </script>
    <script type="module">${jsContent}</script>
  </body>
</html>`;

  return html;
}

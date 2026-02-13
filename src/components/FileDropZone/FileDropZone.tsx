import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { PingDot } from '@/components/ui/Indication/PingDot';
import { HasuraMetaService } from '@/services/HasuraMetaService';
import { useDataStore, TabIndex } from '@/stores/data.store';
import { useFilterStore } from '@/stores/filter.store';

export interface FileDropZoneProps {
  activeTab: TabIndex;
}

export const FileDropZone: React.FC<FileDropZoneProps> = (props) => {
  const { activeTab } = props;

  // Get store actions directly (stable references)
  const setService = useDataStore((state) => state.setService);
  const setError = useDataStore((state) => state.setError);
  const fileName = useDataStore((state) => state.tabData[activeTab]?.fileName ?? null);
  const service = useDataStore((state) => state.tabData[activeTab]?.service ?? null);

  const visibleRoles = useFilterStore((state) => state.getVisibleRoles(activeTab));
  const setVisibleRoles = useFilterStore((state) => state.setVisibleRoles);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer.items) {
        const items = Array.from(e.dataTransfer.items);

        items.forEach((item) => {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file && file.name.match(/\.json$/)) {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onloadend = function () {
                try {
                  const base64Content = reader.result as string;
                  const jsonString = atob(base64Content.replace('data:application/json;base64,', ''));
                  const json = JSON.parse(jsonString);
                  const newService = new HasuraMetaService(json);
                  setService(activeTab, newService, file.name);
                  // Initialize filters with all roles if null
                  if (visibleRoles === null) {
                    setVisibleRoles(activeTab, newService.allRoles);
                  }
                } catch {
                  setError(activeTab, 'Cannot convert JSON :/');
                }
              };
            }
          }
        });
      }
    },
    [activeTab, setService, setError, visibleRoles, setVisibleRoles]
  );

  return (
    <Box>
      <Paper
        elevation={0}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          backgroundColor: 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'grey.100',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400' }} />
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Drop Hasura Metadata
            </Typography>
            <Typography variant="body2" color="text.secondary">
              *.json file to view permissions
            </Typography>
          </Box>
        </Box>
      </Paper>

      {fileName && service && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <PingDot />
          <Typography variant="body2" sx={{ color: '#6ca413', ml: 1 }}>
            {fileName}
          </Typography>
          <Typography variant="body2" color="textDisabled" sx={{ ml: 'auto' }}>
            {service.tables.length} tables loaded
          </Typography>
        </Box>
      )}
    </Box>
  );
};

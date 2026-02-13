import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import React, { useState } from 'react';

export type ExportModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: (selectedRoles: string[], selectedTables: string[]) => void;
  allRoles: string[];
  allTables: string[];
};

export const ExportModal: React.FC<ExportModalProps> = (props) => {
  const { open, onClose, onExport, allRoles, allTables } = props;

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(allRoles));
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set(allTables));

  // Reset selections when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedRoles(new Set(allRoles));
      setSelectedTables(new Set(allTables));
    }
  }, [open, allRoles, allTables]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const handleTableToggle = (table: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) {
        next.delete(table);
      } else {
        next.add(table);
      }
      return next;
    });
  };

  const handleSelectAllRoles = () => {
    setSelectedRoles(new Set(allRoles));
  };

  const handleDeselectAllRoles = () => {
    setSelectedRoles(new Set());
  };

  const handleSelectAllTables = () => {
    setSelectedTables(new Set(allTables));
  };

  const handleDeselectAllTables = () => {
    setSelectedTables(new Set());
  };

  const handleExport = () => {
    onExport(Array.from(selectedRoles), Array.from(selectedTables));
    onClose();
  };

  const allRolesSelected = selectedRoles.size === allRoles.length && allRoles.length > 0;
  const allTablesSelected = selectedTables.size === allTables.length && allTables.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Export Permissions Explorer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Roles ({selectedRoles.size} / {allRoles.length})
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Button size="small" onClick={handleSelectAllRoles} disabled={allRolesSelected} sx={{ mr: 1 }}>
              Select All
            </Button>
            <Button size="small" onClick={handleDeselectAllRoles} disabled={selectedRoles.size === 0}>
              Deselect All
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              maxHeight: 150,
              overflow: 'auto',
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            {allRoles.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox checked={selectedRoles.has(role)} onChange={() => handleRoleToggle(role)} size="small" />
                }
                label={role}
                sx={{ minWidth: 150 }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Select Tables ({selectedTables.size} / {allTables.length})
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Button size="small" onClick={handleSelectAllTables} disabled={allTablesSelected} sx={{ mr: 1 }}>
              Select All
            </Button>
            <Button size="small" onClick={handleDeselectAllTables} disabled={selectedTables.size === 0}>
              Deselect All
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              maxHeight: 200,
              overflow: 'auto',
              p: 1,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            {allTables.map((table) => (
              <FormControlLabel
                key={table}
                control={
                  <Checkbox
                    checked={selectedTables.has(table)}
                    onChange={() => handleTableToggle(table)}
                    size="small"
                  />
                }
                label={table}
                sx={{ minWidth: 200 }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={selectedRoles.size === 0 || selectedTables.size === 0}
        >
          Export ({selectedRoles.size} roles, {selectedTables.size} tables)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

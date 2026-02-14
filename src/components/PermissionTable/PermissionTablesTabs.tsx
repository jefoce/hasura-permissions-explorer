import { Box, Divider, Paper, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface PermissionTablesTabsProps {
  tableNames: string[];
  tableRefs: React.RefObject<Map<string, HTMLElement>>;
  filterExpanded?: boolean;
}

const TAB_WIDTH = 120;
const TAB_HEIGHT = 40;
const SCROLL_OFFSET = 100;

export const PermissionTablesTabs: React.FC<PermissionTablesTabsProps> = (props) => {
  const { tableNames, tableRefs, filterExpanded = true } = props;
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const stickyTop = filterExpanded ? '260px' : '80px';
  const maxHeight = filterExpanded ? 'calc(100vh - 280px)' : 'calc(100vh - 100px)';

  // Find active table on scroll (throttled with requestAnimationFrame)
  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + SCROLL_OFFSET;
          let currentActive: string | null = null;

          // Find active table using refs
          for (let i = tableNames.length - 1; i >= 0; i--) {
            const tableName = tableNames[i];
            const element = tableRefs.current?.get(tableName);
            if (element && element.offsetTop <= scrollPosition) {
              currentActive = tableName;
              break;
            }
          }

          if (currentActive !== activeTable) {
            setActiveTable(currentActive);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [tableNames, tableRefs, activeTable]);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (activeTable) {
      const tab = tabRefs.current.get(activeTable);
      if (tab) {
        tab.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      }
    }
  }, [activeTable]);

  const handleClick = (tableName: string) => {
    setActiveTable(tableName);

    const element = tableRefs.current?.get(tableName);
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  };

  const setTabRef = (tableName: string) => (el: HTMLDivElement | null) => {
    if (el) {
      tabRefs.current.set(tableName, el);
    } else {
      tabRefs.current.delete(tableName);
    }
  };

  if (tableNames.length === 0) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        position: 'sticky',
        top: stickyTop,
        zIndex: 50,
        width: TAB_WIDTH,
        maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'top 0.3s, max-height 0.3s',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '2px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tableNames.map((tableName, index) => (
          <React.Fragment key={tableName}>
            <Tooltip title={tableName} placement="right">
              <Box
                ref={setTabRef(tableName)}
                onClick={() => handleClick(tableName)}
                sx={{
                  width: TAB_WIDTH,
                  height: TAB_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  backgroundColor: activeTable === tableName ? 'action.selected' : 'background.paper',
                  borderLeft: activeTable === tableName ? '3px solid' : '3px solid transparent',
                  borderColor: activeTable === tableName ? 'primary.main' : 'transparent',
                  px: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {tableName}
                </Typography>
              </Box>
            </Tooltip>
            {index < tableNames.length - 1 && <Divider sx={{ borderColor: 'divider' }} />}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

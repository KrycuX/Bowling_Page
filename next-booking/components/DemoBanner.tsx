"use client";

import { Box, Typography, Chip } from '@mui/material';
import { Science as ScienceIcon } from '@mui/icons-material';
import { useDemoMode } from '../hooks/useDemoMode';

export function DemoBanner() {
  const { data: isDemoMode, isLoading } = useDemoMode();

  if (isLoading || !isDemoMode) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ff6b35',
        color: 'white',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        animation: 'pulse 2s infinite'
      }}
    >
      <ScienceIcon sx={{ fontSize: 20 }} />
      <Typography variant="body2" fontWeight="bold">
        WERSJA TESTOWA - DEMO
      </Typography>
      <Chip 
        label="DEMO" 
        size="small" 
        sx={{ 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem'
        }} 
      />
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
}



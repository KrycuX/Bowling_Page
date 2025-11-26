'use client';

import { Box, Stack, Typography } from '@mui/material';

import type { Resource } from '../lib/types';

type Props = {
  resources: Resource[];
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
};

export function ResourceSelect({ resources, value, onChange, disabled }: Props) {
  const selectedType = value
    .map((id) => resources.find((resource) => resource.id === id)?.type)
    .find((type): type is Resource['type'] => Boolean(type));

  const toggleResource = (resourceId: number) => {
    if (disabled) return;
    
    if (value.includes(resourceId)) {
      onChange(value.filter((id) => id !== resourceId));
    } else {
      onChange([...value, resourceId]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF', fontWeight: 600 }}>
        Wybierz zasoby
      </Typography>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
        {resources.map((resource) => {
          const checked = value.includes(resource.id);
          const resourceIcon = getResourceIcon(resource.type);
          const resourceLabel = getResourceLabel(resource.type);
          const shouldDisable =
            Boolean(selectedType) && selectedType !== resource.type && !checked;

          return (
            <Box
              key={resource.id}
              onClick={() => toggleResource(resource.id)}
              sx={{
                flex: '1 1 calc(50% - 8px)',
                minWidth: '200px',
                p: 3,
                borderRadius: 3,
                border: checked 
                  ? '2px solid #8B5CF6' 
                  : shouldDisable 
                    ? '2px solid #3A3A5C' 
                    : '2px solid #2D2D44',
                background: checked
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
                  : '#1A1A2E',
                cursor: disabled || shouldDisable ? 'not-allowed' : 'pointer',
                opacity: disabled || shouldDisable ? 0.5 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: disabled || shouldDisable ? undefined : '#8B5CF6',
                  transform: disabled || shouldDisable ? undefined : 'translateY(-2px)',
                  boxShadow: disabled || shouldDisable 
                    ? undefined 
                    : checked 
                      ? '0 8px 25px rgba(139, 92, 246, 0.4)'
                      : '0 4px 15px rgba(139, 92, 246, 0.2)'
                }
              }}
            >
              <Stack spacing={2} alignItems="center" textAlign="center">
                {/* Icon */}
                <Box
                  sx={{
                    fontSize: '2.5rem',
                    color: checked ? '#FFFFFF' : '#8B5CF6',
                    mb: 1
                  }}
                >
                  {resourceIcon}
                </Box>
                
                {/* Resource name */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: checked ? '#FFFFFF' : '#FFFFFF',
                    fontSize: '1.1rem'
                  }}
                >
                  {resource.name}
                </Typography>
                
                {/* Resource type */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: checked ? 'rgba(255, 255, 255, 0.8)' : '#B8BCC8',
                    fontSize: '0.9rem'
                  }}
                >
                  {resourceLabel}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function getResourceIcon(type: Resource['type']): string {
  switch (type) {
    case 'BOWLING_LANE':
      return '🎳';
    case 'BILLIARDS_TABLE':
      return '🎱';
    case 'QUIZ_ROOM':
      return '🧠';
    case 'KARAOKE_ROOM':
      return '🎤';
    default:
      return '📍';
  }
}

function getResourceLabel(type: Resource['type']): string {
  switch (type) {
    case 'BOWLING_LANE':
      return 'Tor do kregli';
    case 'BILLIARDS_TABLE':
      return 'Stol bilardowy';
    case 'QUIZ_ROOM':
      return 'Pokoj quizowy';
    case 'KARAOKE_ROOM':
      return 'Pokoj karaoke';
    default:
      return 'Zasob';
  }
}


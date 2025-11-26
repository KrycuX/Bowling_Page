'use client';

import { Box, Stack, Typography } from '@mui/material';

type Step = {
  id: string;
  title: string;
  description: string;
};

type BookingStepsProps = {
  currentStep: number;
  steps: Step[];
};

export function BookingSteps({ currentStep, steps }: BookingStepsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Progress indicator */}
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <Box key={step.id} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Step circle */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: isActive || isCompleted ? '#FFFFFF' : '#B8BCC8',
                  background: isActive 
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
                    : isCompleted
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
                    : '#2D2D44',
                  border: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                  boxShadow: isActive 
                    ? '0 0 20px rgba(139, 92, 246, 0.4)'
                    : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {isCompleted ? '✓' : stepNumber}
              </Box>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 80,
                    height: 2,
                    background: isCompleted 
                      ? 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)'
                      : '#2D2D44',
                    ml: 2,
                    position: 'relative',
                    zIndex: 1
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
      
      {/* Step labels */}
      <Stack direction="row" justifyContent="space-between" sx={{ px: 2 }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <Box key={step.id} sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive || isCompleted ? 600 : 400,
                  color: isActive || isCompleted ? '#FFFFFF' : '#B8BCC8',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {step.title}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

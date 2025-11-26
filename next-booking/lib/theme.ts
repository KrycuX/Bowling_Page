import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Fioletowy główny
      light: '#A78BFA',
      dark: '#7C3AED'
    },
    secondary: {
      main: '#3B82F6', // Niebieski dla akcentów
      light: '#60A5FA',
      dark: '#2563EB'
    },
    background: {
      default: '#0F0F23', // Bardzo ciemny fioletowy
      paper: '#1A1A2E' // Ciemny szary dla kart
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8BCC8'
    },
    grey: {
      800: '#1A1A2E',
      700: '#2D2D44',
      600: '#3A3A5C'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px'
        },
        contained: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            boxShadow: '0 6px 20px 0 rgba(139, 92, 246, 0.6)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A2E',
          border: '1px solid #2D2D44',
          borderRadius: 16
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A2E',
          border: '1px solid #2D2D44'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2D2D44',
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#3A3A5C'
            },
            '&:hover fieldset': {
              borderColor: '#8B5CF6'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B5CF6'
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#1A1A2E',
          border: '1px solid #2D2D44'
        }
      }
    }
  }
});

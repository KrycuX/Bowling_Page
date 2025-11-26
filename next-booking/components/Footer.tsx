"use client";

import { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import { 
  AccessTime as ClockIcon, 
  Phone as PhoneIcon, 
  Mail as MailIcon,
  LocationOn as LocationIcon,
  Article as ArticleIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

type WeeklyHours = {
  monday: { openHour: number; closeHour: number; closed: boolean };
  tuesday: { openHour: number; closeHour: number; closed: boolean };
  wednesday: { openHour: number; closeHour: number; closed: boolean };
  thursday: { openHour: number; closeHour: number; closed: boolean };
  friday: { openHour: number; closeHour: number; closed: boolean };
  saturday: { openHour: number; closeHour: number; closed: boolean };
  sunday: { openHour: number; closeHour: number; closed: boolean };
};

type BusinessHoursResponse = {
  weekly: WeeklyHours | null;
  dayOffs: Array<{ date: string; reason: string | null }>;
  todayStatus: {
    isOpen: boolean;
    openHour: number | null;
    closeHour: number | null;
    isDayOff: boolean;
  };
};

const DAY_NAMES = [
  { key: 'monday' as const, label: 'Poniedziałek' },
  { key: 'tuesday' as const, label: 'Wtorek' },
  { key: 'wednesday' as const, label: 'Środa' },
  { key: 'thursday' as const, label: 'Czwartek' },
  { key: 'friday' as const, label: 'Piątek' },
  { key: 'saturday' as const, label: 'Sobota' },
  { key: 'sunday' as const, label: 'Niedziela' },
];

function BusinessHours() {
  const [data, setData] = useState<BusinessHoursResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.bowlinghub.pl';
        const response = await fetch(`${apiUrl}/business-hours`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch business hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Ładowanie godzin otwarcia...
        </Typography>
      </Box>
    );
  }

  if (!data?.weekly) {
    return (
      <Box sx={{ py: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            Poniedziałek - Niedziela
          </Typography>
          <Typography variant="body2" color="text.secondary">
            10:00 - 22:00
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {DAY_NAMES.map(({ key, label }) => {
        const dayHours = data.weekly![key];
        const hours = dayHours.closed
          ? 'Zamknięte'
          : `${dayHours.openHour.toString().padStart(2, '0')}:00 - ${dayHours.closeHour.toString().padStart(2, '0')}:00`;

        return (
          <Box
            key={key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': {
                borderBottom: 'none'
              }
            }}
          >
            <Typography variant="body2" color="text.primary" fontWeight="medium">
              {label}
            </Typography>
            <Typography
              variant="body2"
              color={dayHours.closed ? 'error.main' : 'text.secondary'}
            >
              {hours}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default function Footer() {
  // Use state to avoid hydration mismatches
  const [mainDomain, setMainDomain] = useState('https://bowlinghub.pl');

  // Calculate main domain only on client to prevent hydration errors
  useEffect(() => {
    const hostname = window.location.hostname;
    // Jeśli jesteśmy na subdomenie (np. rezerwacje.bowlinghub.pl), zwróć domenę główną
    if (hostname.includes('rezerwacje.')) {
      setMainDomain(`https://${hostname.replace('rezerwacje.', '')}`);
    } else {
      setMainDomain(`https://${hostname}`);
    }
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        bgcolor: 'rgba(26, 26, 46, 0.5)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)',
          boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        {/* Pierwszy poziom - 3 sekcje */}
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Godziny otwarcia */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ClockIcon sx={{ color: 'primary.main', fontSize: { xs: 20, md: 24 } }} />
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Godziny otwarcia
              </Typography>
            </Box>
            <BusinessHours />
          </Grid>

          {/* Dane kontaktowe */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: 'relative',
                pl: { md: 4 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '10%',
                  bottom: '10%',
                  width: '1px',
                  background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.3), transparent)',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)',
                  display: { xs: 'none', md: 'block' }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PhoneIcon sx={{ color: 'primary.main', fontSize: { xs: 20, md: 24 } }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Dane kontaktowe
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <LocationIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Adres
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                      ul. Przykładowa 123<br />
                      00-000 Warszawa
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <PhoneIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Telefon
                    </Typography>
                    <MuiLink
                      href="tel:+48123456789"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.light' }
                      }}
                    >
                      +48 123 456 789
                    </MuiLink>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <MailIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Email
                    </Typography>
                    <MuiLink
                      href="mailto:kontakt@bowlinghub.pl"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        '&:hover': { color: 'primary.light' }
                      }}
                    >
                      kontakt@bowlinghub.pl
                    </MuiLink>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Informacje prawne */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: 'relative',
                pl: { md: 4 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '10%',
                  bottom: '10%',
                  width: '1px',
                  background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.3), transparent)',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)',
                  display: { xs: 'none', md: 'block' }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ArticleIcon sx={{ color: 'primary.main', fontSize: { xs: 20, md: 24 } }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Informacje prawne
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MuiLink
                  href={`${mainDomain}/polityka-prywatnosci`}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(26, 26, 46, 0.6)',
                    border: '1px solid',
                    borderColor: 'divider',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(45, 45, 68, 0.3)'
                    }
                  }}
                >
                  <ArticleIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Polityka prywatności
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Polityka prywatności i ochrony danych
                    </Typography>
                  </Box>
                </MuiLink>

                <MuiLink
                  href={`${mainDomain}/regulaminy`}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(26, 26, 46, 0.6)',
                    border: '1px solid',
                    borderColor: 'divider',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(45, 45, 68, 0.3)'
                    }
                  }}
                >
                  <DescriptionIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="medium" sx={{ mb: 0.5 }}>
                      Regulaminy
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Regulaminy usług i obiektu
                    </Typography>
                  </Box>
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* Drugi poziom - Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} BowlingHub - Demo Booking Experience. Wszelkie prawa zastrzeżone.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}


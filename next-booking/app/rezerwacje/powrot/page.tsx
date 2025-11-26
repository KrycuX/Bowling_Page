"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { usePublicSettings } from '../../../hooks/usePublicSettings';
import { apiClient } from '../../../lib/apiClient';

type PaymentStatus = 'loading' | 'success' | 'error' | 'unknown';

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const settings = usePublicSettings();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const MAX_RETRIES = 20; // Maksymalnie 20 prób (około 40 sekund z 2s interwałem)

  // Ensure this component only fully renders on the client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client to avoid hydration mismatches
    if (!isClient) return;

    const checkPaymentStatus = async (attempt: number = 0) => {
      // Extract payment parameters from URL
      let sessionId = searchParams.get('sessionId');
      const statusFromUrl = searchParams.get('status');
      const error = searchParams.get('error');
      const orderId = searchParams.get('orderId');
      const paymentMethodFromUrl = searchParams.get('paymentMethod');
      
      // Zapisz paymentMethod w stanie
      if (paymentMethodFromUrl) {
        setPaymentMethod(paymentMethodFromUrl);
      }
      
      // Sprawdź czy to płatność na miejscu
      if (statusFromUrl === 'success' && paymentMethodFromUrl === 'ON_SITE_CASH' && orderId) {
        setStatus('success');
        setMessage('Twoja rezerwacja została potwierdzona! Płatność zostanie dokonana na miejscu.');
        enqueueSnackbar('Rezerwacja potwierdzona. Płatność na miejscu.', { variant: 'success' });
        return;
      }

      // Jeśli nie ma sessionId w URL, sprawdź localStorage
      // Przelewy24 może nie przekazywać parametrów w return URL
      if (!sessionId && typeof window !== 'undefined') {
        sessionId = localStorage.getItem('p24_sessionId');
      }

      // If in mock mode, always show success
      if (settings.data?.p24Mode === 'mock') {
        setStatus('success');
        setMessage('Płatność została pomyślnie zrealizowana! Twoja rezerwacja została potwierdzona. (Tryb testowy)');
        enqueueSnackbar('Płatność zakończona pomyślnie (tryb testowy)', { variant: 'success' });
        
        // Wyczyść localStorage po sprawdzeniu
        if (typeof window !== 'undefined' && sessionId) {
          localStorage.removeItem('p24_sessionId');
          localStorage.removeItem('p24_orderId');
        }
        return;
      }

      if (error) {
        setStatus('error');
        setMessage('Płatność nie została zrealizowana. Spróbuj ponownie.');
        enqueueSnackbar('Błąd płatności', { variant: 'error' });
        
        // Wyczyść localStorage
        if (typeof window !== 'undefined' && sessionId) {
          localStorage.removeItem('p24_sessionId');
          localStorage.removeItem('p24_orderId');
        }
        return;
      }

      if (statusFromUrl === 'success' && sessionId) {
        setStatus('success');
        setMessage('Płatność została pomyślnie zrealizowana! Twoja rezerwacja została potwierdzona.');
        enqueueSnackbar('Płatność zakończona pomyślnie', { variant: 'success' });
        
        // Wyczyść localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('p24_sessionId');
          localStorage.removeItem('p24_orderId');
        }
        return;
      }

      if (statusFromUrl === 'cancelled') {
        setStatus('error');
        setMessage('Płatność została anulowana. Możesz spróbować ponownie.');
        enqueueSnackbar('Płatność anulowana', { variant: 'warning' });
        
        // Wyczyść localStorage
        if (typeof window !== 'undefined' && sessionId) {
          localStorage.removeItem('p24_sessionId');
          localStorage.removeItem('p24_orderId');
        }
        return;
      }

      // Jeśli mamy sessionId ale nie ma statusu w URL, sprawdź przez API
      if (sessionId) {
        try {
          const response = await apiClient.get(`/payments/status/${sessionId}`);
          const paymentStatus = response.data.status;

          if (paymentStatus === 'PAID') {
            setStatus('success');
            setMessage('Płatność została pomyślnie zrealizowana! Twoja rezerwacja została potwierdzona.');
            enqueueSnackbar('Płatność zakończona pomyślnie', { variant: 'success' });
            
            // Wyczyść localStorage po sprawdzeniu
            if (typeof window !== 'undefined') {
              localStorage.removeItem('p24_sessionId');
              localStorage.removeItem('p24_orderId');
            }
          } else if (paymentStatus === 'PENDING' || paymentStatus === 'RESERVED' || paymentStatus === 'PENDING_PAYMENT') {
            // Jeśli nie przekroczono limitu prób, spróbuj ponownie
            if (attempt < MAX_RETRIES) {
              setStatus('loading');
              setMessage('Sprawdzanie statusu płatności...');
              
              setTimeout(() => {
                checkPaymentStatus(attempt + 1);
              }, 2000); // Skrócono interwał z 3000ms do 2000ms dla szybszej odpowiedzi
            } else {
              setStatus('unknown');
              setMessage('Czas oczekiwania na potwierdzenie płatności minął. Skontaktuj się z obsługą jeśli masz problemy.');
              enqueueSnackbar('Przekroczono limit prób sprawdzania statusu', { variant: 'warning' });
            }
          } else {
            setStatus('error');
            setMessage('Płatność nie została zrealizowana. Spróbuj ponownie.');
            enqueueSnackbar('Płatność nie została zrealizowana', { variant: 'error' });
            
            // Wyczyść localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('p24_sessionId');
              localStorage.removeItem('p24_orderId');
            }
          }
        } catch (error: unknown) {
          console.error('Error checking payment status:', error);
          
          // Jeśli order nie istnieje, może płatność jeszcze nie została przetworzona
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 404 && attempt < MAX_RETRIES) {
            setStatus('loading');
            setMessage('Oczekiwanie na potwierdzenie płatności...');
            
            setTimeout(() => {
              checkPaymentStatus(attempt + 1);
            }, 2000); // Skrócono interwał z 3000ms do 2000ms dla szybszej odpowiedzi
          } else {
            setStatus('unknown');
            setMessage('Nie można sprawdzić statusu płatności. Skontaktuj się z obsługą jeśli masz problemy.');
            enqueueSnackbar('Błąd sprawdzania statusu płatności', { variant: 'error' });
          }
        }
        return;
      }

      // Unknown status or missing parameters
      setStatus('unknown');
      setMessage('Nie można określić statusu płatności. Skontaktuj się z obsługą jeśli masz problemy.');
    };

    checkPaymentStatus();
  }, [isClient, searchParams, enqueueSnackbar, settings.data]);

  const handleGoHome = () => {
    // Pobierz domenę główną - jeśli jesteśmy na subdomenie (np. rezerwacje.thealley2b.pl), wróć do domeny głównej
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('rezerwacje.')) {
        window.location.href = `https://${hostname.replace('rezerwacje.', '')}`;
      } else {
        window.location.href = '/';
      }
    }
  };

  const handleTryAgain = () => {
    // Pobierz domenę główną - jeśli jesteśmy na subdomenie (np. rezerwacje.thealley2b.pl), wróć do domeny głównej
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('rezerwacje.')) {
        window.location.href = `https://${hostname.replace('rezerwacje.', '')}`;
      } else {
        window.location.href = '/';
      }
    }
  };

  // Show loading state during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Ładowanie...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            {status === 'loading' && (
              <>
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                  Sprawdzanie statusu płatności...
                </Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <SuccessIcon sx={{ fontSize: 60, color: 'success.main' }} />
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {paymentMethod === 'ON_SITE_CASH' ? 'Rezerwacja potwierdzona!' : 'Płatność zakończona pomyślnie!'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {message}
                </Typography>
                <Alert severity="success" sx={{ width: '100%' }}>
                  {paymentMethod === 'ON_SITE_CASH' ? (
                    <>
                      Twoja rezerwacja została potwierdzona. Płatność zostanie dokonana na miejscu. Otrzymasz e-mail z potwierdzeniem.
                    </>
                  ) : (
                    <>
                      Twoja rezerwacja została potwierdzona. Otrzymasz e-mail z potwierdzeniem.
                      {settings.data?.p24Mode === 'mock' && (
                        <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                          🧪 Tryb testowy - płatność symulowana
                        </Box>
                      )}
                    </>
                  )}
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  sx={{ mt: 2 }}
                >
                  Powrót do rezerwacji
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
                <Typography variant="h5" color="error.main" fontWeight="bold">
                  Problem z płatnością
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {message}
                </Typography>
                <Alert severity="error" sx={{ width: '100%' }}>
                  Jeśli problem się powtarza, skontaktuj się z obsługą klienta.
                </Alert>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleTryAgain}
                  >
                    Spróbuj ponownie
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={handleGoHome}
                  >
                    Powrót do rezerwacji
                  </Button>
                </Stack>
              </>
            )}

            {status === 'unknown' && (
              <>
                <ErrorIcon sx={{ fontSize: 60, color: 'warning.main' }} />
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  Nieznany status płatności
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {message}
                </Typography>
                <Alert severity="warning" sx={{ width: '100%' }}>
                  Skontaktuj się z obsługą klienta, podając numer sesji płatności.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  sx={{ mt: 2 }}
                >
                  Powrót do rezerwacji
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Ładowanie...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}

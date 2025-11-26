"use client";

import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useAdminSettings } from '../../../hooks/panel/useAdminSettings';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Helper functions for price conversion
function grToZl(gr: number): number {
  return gr / 100;
}

function zlToGr(zl: number): number {
  return Math.round(zl * 100);
}

export default function SettingsPage() {
  const { settings, loading, error, update } = useAdminSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Błąd: {error.message}
      </Alert>
    );
  }
  
  if (!settings) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Brak danych ustawień
      </Alert>
    );
  }

  function toNumberSafe(v: FormDataEntryValue | null): number | undefined {
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const OPEN_HOUR = toNumberSafe(form.get('OPEN_HOUR'));
    const CLOSE_HOUR = toNumberSafe(form.get('CLOSE_HOUR'));
    const SLOT_INTERVAL_MINUTES = toNumberSafe(form.get('SLOT_INTERVAL_MINUTES'));

    if (OPEN_HOUR != null && (OPEN_HOUR < 0 || OPEN_HOUR > 23)) {
      enqueueSnackbar('OPEN_HOUR musi być 0-23', { variant: 'warning' });
      return;
    }
    if (CLOSE_HOUR != null && (CLOSE_HOUR < 1 || CLOSE_HOUR > 23)) {
      enqueueSnackbar('CLOSE_HOUR musi być 1-23', { variant: 'warning' });
      return;
    }
    if (OPEN_HOUR != null && CLOSE_HOUR != null && OPEN_HOUR >= CLOSE_HOUR) {
      enqueueSnackbar('OPEN_HOUR musi być < CLOSE_HOUR', { variant: 'warning' });
      return;
    }
    if (SLOT_INTERVAL_MINUTES != null && (SLOT_INTERVAL_MINUTES < 5 || SLOT_INTERVAL_MINUTES > 60)) {
      enqueueSnackbar('SLOT_INTERVAL_MINUTES 5-60', { variant: 'warning' });
      return;
    }

    const input: Record<string, unknown> = {};
    form.forEach((value, key) => {
      // Special handling for password fields - allow clearing (empty string)
      // Password fields are only in FormData if user changed them
      if (['P24_API_KEY', 'P24_CRC', 'SMTP_PASSWORD'].includes(key)) {
        // If the field is in FormData, it means user changed it
        // Send it (even if empty, to allow clearing)
        input[key] = String(value);
        return;
      }
      // For other fields, skip empty values
      if (value === '') return;
      if (/^(OPEN_HOUR|CLOSE_HOUR|SLOT_INTERVAL_MINUTES|HOLD_DURATION_MINUTES|BILLIARDS_TABLES_COUNT|BOWLING_.*_HOURS|QUIZ_.*|KARAOKE_.*)/.test(key)) {
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        input[key] = n;
      } else if (/^PRICE_/.test(key)) {
        // Convert prices from zł to gr
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        input[key] = zlToGr(n);
      } else if (key === 'DEMO_MODE') {
        input[key] = value === 'true';
      } else if (key === 'SMTP_SECURE') {
        input[key] = value === 'true';
      } else if (key === 'CONTACT_FORM_EMAIL_TEMPLATE') {
        input[key] = String(value);
      } else if (key === 'SMTP_PORT') {
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        input[key] = n;
      } else {
        input[key] = value;
      }
    });

    try {
      setSaving(true);
      await update(input);
      enqueueSnackbar('Zapisano ustawienia', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: 'primary.main',
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <SettingsIcon fontSize="large" />
        Ustawienia systemu
      </Typography>

      <form onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {/* Godziny i interwały */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Godziny i interwały
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="TIMEZONE"
                      label="Strefa czasowa"
                      defaultValue={settings.TIMEZONE}
                      fullWidth
                      variant="outlined"
                      helperText="Format: Europe/Warsaw"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="OPEN_HOUR"
                      label="Godzina otwarcia"
                      type="number"
                      defaultValue={settings.OPEN_HOUR}
                      fullWidth
                      variant="outlined"
                      inputProps={{ min: 0, max: 23 }}
                      helperText="0-23"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="CLOSE_HOUR"
                      label="Godzina zamknięcia"
                      type="number"
                      defaultValue={settings.CLOSE_HOUR}
                      fullWidth
                      variant="outlined"
                      inputProps={{ min: 1, max: 23 }}
                      helperText="1-23"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="SLOT_INTERVAL_MINUTES"
                      label="Interwał rezerwacji"
                      type="number"
                      defaultValue={settings.SLOT_INTERVAL_MINUTES}
                      fullWidth
                      variant="outlined"
                      inputProps={{ min: 5, max: 60 }}
                      helperText="5-60 minut"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="HOLD_DURATION_MINUTES"
                      label="Czas rezerwacji tymczasowej"
                      type="number"
                      defaultValue={settings.HOLD_DURATION_MINUTES}
                      fullWidth
                      variant="outlined"
                      helperText="Minuty na potwierdzenie"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cennik */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Cennik
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="PRICE_BOWLING_PER_HOUR"
                      label="Bowling (zł/h)"
                      type="number"
                      defaultValue={grToZl(settings.PRICE_BOWLING_PER_HOUR)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="PRICE_BILLIARDS_PER_HOUR"
                      label="Bilard (zł/h)"
                      type="number"
                      defaultValue={grToZl(settings.PRICE_BILLIARDS_PER_HOUR)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="PRICE_KARAOKE_PER_PERSON_PER_HOUR"
                      label="Karaoke (zł/os/h)"
                      type="number"
                      defaultValue={grToZl(settings.PRICE_KARAOKE_PER_PERSON_PER_HOUR)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="PRICE_QUIZ_PER_PERSON_PER_SESSION"
                      label="Quiz (zł/os/sesja)"
                      type="number"
                      defaultValue={grToZl(settings.PRICE_QUIZ_PER_PERSON_PER_SESSION)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                      }}
                      inputProps={{ step: 0.01, min: 0 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Limity */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Limity
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="BILLIARDS_TABLES_COUNT"
                      label="Liczba stołów bilardowych"
                      type="number"
                      defaultValue={settings.BILLIARDS_TABLES_COUNT}
                      fullWidth
                      variant="outlined"
                      helperText="Dostępne stoły do rezerwacji"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="BOWLING_MIN_DURATION_HOURS"
                      label="Min. czas bowlingu"
                      type="number"
                      defaultValue={settings.BOWLING_MIN_DURATION_HOURS}
                      fullWidth
                      variant="outlined"
                      helperText="Godziny"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="BOWLING_MAX_DURATION_HOURS"
                      label="Max. czas bowlingu"
                      type="number"
                      defaultValue={settings.BOWLING_MAX_DURATION_HOURS}
                      fullWidth
                      variant="outlined"
                      helperText="Godziny"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="QUIZ_DURATION_HOURS"
                      label="Czas trwania quizu"
                      type="number"
                      defaultValue={settings.QUIZ_DURATION_HOURS}
                      fullWidth
                      variant="outlined"
                      helperText="Godziny"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="QUIZ_MAX_PEOPLE"
                      label="Max. osób w quizie"
                      type="number"
                      defaultValue={settings.QUIZ_MAX_PEOPLE}
                      fullWidth
                      variant="outlined"
                      helperText="Osoby"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="KARAOKE_MIN_DURATION_HOURS"
                      label="Min. czas karaoke"
                      type="number"
                      defaultValue={settings.KARAOKE_MIN_DURATION_HOURS}
                      fullWidth
                      variant="outlined"
                      helperText="Godziny"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="KARAOKE_MAX_DURATION_HOURS"
                      label="Max. czas karaoke"
                      type="number"
                      defaultValue={settings.KARAOKE_MAX_DURATION_HOURS}
                      fullWidth
                      variant="outlined"
                      helperText="Godziny"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="KARAOKE_MAX_PEOPLE"
                      label="Max. osób w karaoke"
                      type="number"
                      defaultValue={settings.KARAOKE_MAX_PEOPLE}
                      fullWidth
                      variant="outlined"
                      helperText="Osoby"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tryb aplikacji */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Tryb aplikacji
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="DEMO_MODE"
                      label="Tryb demo"
                      defaultValue={settings.DEMO_MODE ? 'true' : 'false'}
                      fullWidth
                      variant="outlined"
                      select
                      SelectProps={{ native: true }}
                      helperText="Tryb demo pokazuje banner informacyjny na wszystkich stronach"
                    >
                      <option value="true">Demo (wersja testowa)</option>
                      <option value="false">Production (wersja produkcyjna)</option>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Płatności Przelewy24 */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <PaymentIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Płatności Przelewy24
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="P24_MODE"
                      label="Tryb płatności"
                      defaultValue={settings.P24_MODE}
                      fullWidth
                      variant="outlined"
                      select
                      SelectProps={{ native: true }}
                      helperText="Mock - testy, Sandbox - testy Przelewy24, Production - prawdziwe płatności"
                    >
                      <option value="mock">Mock (testy lokalne)</option>
                      <option value="sandbox">Sandbox (testy Przelewy24)</option>
                      <option value="production">Production (prawdziwe płatności)</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="P24_MERCHANT_ID"
                      label="ID Sprzedawcy"
                      defaultValue={settings.P24_MERCHANT_ID ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Z panelu Przelewy24"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="P24_POS_ID"
                      label="ID Punktu Sprzedaży"
                      defaultValue={settings.P24_POS_ID ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Z panelu Przelewy24"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="P24_CRC"
                      label="Klucz CRC"
                      type="password"
                      defaultValue={settings.P24_CRC ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Klucz szyfrowania z panelu Przelewy24"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="P24_API_KEY"
                      label="Klucz API"
                      type="password"
                      defaultValue={settings.P24_API_KEY ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Klucz API z panelu Przelewy24"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="P24_RETURN_URL"
                      label="URL powrotu"
                      defaultValue={settings.P24_RETURN_URL}
                      fullWidth
                      variant="outlined"
                      helperText="Gdzie przekierować po płatności"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="P24_STATUS_URL"
                      label="URL statusu"
                      defaultValue={settings.P24_STATUS_URL}
                      fullWidth
                      variant="outlined"
                      helperText="Gdzie wysyłać powiadomienia o płatności"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Konfiguracja email */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <EmailIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Konfiguracja email
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="SENDER_EMAIL"
                      label="Email nadawcy"
                      type="email"
                      defaultValue={settings.SENDER_EMAIL ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Adres email, z którego będą wysyłane maile"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="SENDER_NAME"
                      label="Nazwa nadawcy"
                      defaultValue={settings.SENDER_NAME ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Nazwa wyświetlana w polu 'Od' (opcjonalne)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="SMTP_HOST"
                      label="Host SMTP"
                      defaultValue={settings.SMTP_HOST ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="np. smtp.gmail.com, smtp.office365.com"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="SMTP_PORT"
                      label="Port SMTP"
                      type="number"
                      defaultValue={settings.SMTP_PORT ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Zwykle 465 (SSL) lub 587 (TLS)"
                      inputProps={{ min: 1, max: 65535 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="SMTP_SECURE"
                      label="Bezpieczne połączenie"
                      defaultValue={settings.SMTP_SECURE !== false ? 'true' : 'false'}
                      fullWidth
                      variant="outlined"
                      select
                      SelectProps={{ native: true }}
                      helperText="TLS/SSL"
                    >
                      <option value="true">Tak (TLS/SSL)</option>
                      <option value="false">Nie</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="SMTP_USER"
                      label="Użytkownik SMTP"
                      defaultValue={settings.SMTP_USER ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Login do serwera SMTP"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="SMTP_PASSWORD"
                      label="Hasło SMTP"
                      type="password"
                      defaultValue={settings.SMTP_PASSWORD ?? ''}
                      fullWidth
                      variant="outlined"
                      helperText="Hasło do serwera SMTP"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Maile będą wysyłane automatycznie po opłaceniu zamówienia lub utworzeniu rezerwacji z płatnością na miejscu.
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Contact Form Email Template */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <EmailIcon color="primary" />
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    Szablon emaila formularza kontaktowego
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="CONTACT_FORM_EMAIL_TEMPLATE"
                      label="Szablon HTML emaila potwierdzającego"
                      defaultValue={settings.CONTACT_FORM_EMAIL_TEMPLATE ?? ''}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={12}
                      helperText="Dostępne zmienne: {{name}}, {{email}}, {{phone}}, {{message}}"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Ten szablon będzie używany do wysyłania potwierdzenia do klienta po wysłaniu formularza kontaktowego. 
                      Jeśli pozostawisz puste, zostanie użyty domyślny szablon.
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center">
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SettingsIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {saving ? 'Zapisywanie…' : 'Zapisz ustawienia'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}




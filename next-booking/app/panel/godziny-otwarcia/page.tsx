"use client";

import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useAdminSettings } from '../../../hooks/panel/useAdminSettings';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';

type WeeklyHours = {
  monday: { openHour: number; closeHour: number; closed: boolean };
  tuesday: { openHour: number; closeHour: number; closed: boolean };
  wednesday: { openHour: number; closeHour: number; closed: boolean };
  thursday: { openHour: number; closeHour: number; closed: boolean };
  friday: { openHour: number; closeHour: number; closed: boolean };
  saturday: { openHour: number; closeHour: number; closed: boolean };
  sunday: { openHour: number; closeHour: number; closed: boolean };
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

const defaultWeeklyHours: WeeklyHours = {
  monday: { openHour: 10, closeHour: 22, closed: false },
  tuesday: { openHour: 10, closeHour: 22, closed: false },
  wednesday: { openHour: 10, closeHour: 22, closed: false },
  thursday: { openHour: 10, closeHour: 22, closed: false },
  friday: { openHour: 10, closeHour: 22, closed: false },
  saturday: { openHour: 10, closeHour: 22, closed: false },
  sunday: { openHour: 10, closeHour: 22, closed: false },
};

export default function GodzinyOtwarciaPage() {
  const { settings, loading, error, update } = useAdminSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(
    settings?.WEEKLY_HOURS || defaultWeeklyHours
  );

  // Update state when settings load
  useEffect(() => {
    if (settings?.WEEKLY_HOURS) {
      setWeeklyHours(settings.WEEKLY_HOURS);
    }
  }, [settings?.WEEKLY_HOURS]);

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
        Błąd podczas ładowania ustawień: {error.message}
      </Alert>
    );
  }

  const handleDayChange = (day: keyof WeeklyHours, field: 'openHour' | 'closeHour' | 'closed', value: number | boolean) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate
      for (const day of DAY_NAMES) {
        const dayHours = weeklyHours[day.key];
        if (!dayHours.closed) {
          if (dayHours.openHour < 0 || dayHours.openHour > 23) {
            enqueueSnackbar(`${day.label}: Godzina otwarcia musi być 0-23`, { variant: 'warning' });
            return;
          }
          if (dayHours.closeHour < 1 || dayHours.closeHour > 23) {
            enqueueSnackbar(`${day.label}: Godzina zamknięcia musi być 1-23`, { variant: 'warning' });
            return;
          }
          if (dayHours.openHour >= dayHours.closeHour) {
            enqueueSnackbar(`${day.label}: Godzina otwarcia musi być mniejsza niż zamknięcia`, { variant: 'warning' });
            return;
          }
        }
      }

      await update({ WEEKLY_HOURS: weeklyHours });
      enqueueSnackbar('Godziny otwarcia zostały zapisane', { variant: 'success' });
    } catch (err: unknown) {
      const error = err as { message?: string };
      enqueueSnackbar(error.message || 'Błąd podczas zapisywania', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

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
        <ScheduleIcon fontSize="large" />
        Godziny otwarcia tygodniowe
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Te ustawienia powinny być skonfigurowane raz i rzadko zmieniane. 
        Godziny są używane do wyświetlania na stronie głównej oraz przy rezerwacjach.
      </Alert>

      <Card elevation={3}>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Dzień</strong></TableCell>
                  <TableCell align="center"><strong>Zamknięte</strong></TableCell>
                  <TableCell align="center"><strong>Godzina otwarcia</strong></TableCell>
                  <TableCell align="center"><strong>Godzina zamknięcia</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DAY_NAMES.map(({ key, label }) => {
                  const dayHours = weeklyHours[key];
                  return (
                    <TableRow key={key}>
                      <TableCell><strong>{label}</strong></TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={dayHours.closed}
                          onChange={(e) => handleDayChange(key, 'closed', e.target.checked)}
                          disabled={saving}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={dayHours.closed ? '' : dayHours.openHour}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              handleDayChange(key, 'openHour', val);
                            }
                          }}
                          disabled={dayHours.closed || saving}
                          inputProps={{ min: 0, max: 23, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={dayHours.closed ? '' : dayHours.closeHour}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              handleDayChange(key, 'closeHour', val);
                            }
                          }}
                          disabled={dayHours.closed || saving}
                          inputProps={{ min: 1, max: 23, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? <CircularProgress size={24} /> : 'Zapisz'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

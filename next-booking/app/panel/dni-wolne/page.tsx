"use client";

import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDayOffs } from '../../../hooks/panel/useDayOffs';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';

dayjs.locale('pl');

export default function DniWolnePage() {
  const { dayOffs, loading, error, create, delete: deleteDayOff, isCreating, isDeleting } = useDayOffs();
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState('');

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
        Błąd podczas ładowania dni wolnych: {error.message}
      </Alert>
    );
  }

  const handleAdd = async () => {
    if (!selectedDate) {
      enqueueSnackbar('Wybierz datę', { variant: 'warning' });
      return;
    }

    const dateStr = selectedDate.format('YYYY-MM-DD');
    
    // Check if date is in the past
    if (selectedDate.isBefore(dayjs().startOf('day'))) {
      enqueueSnackbar('Nie można dodać dnia wolnego dla daty w przeszłości', { variant: 'warning' });
      return;
    }

    try {
      await create({
        date: dateStr,
        reason: reason.trim() || null,
      });
      enqueueSnackbar('Dzień wolny został dodany', { variant: 'success' });
      setOpenDialog(false);
      setSelectedDate(null);
      setReason('');
    } catch (err: unknown) {
      const error = err as { body?: { message?: string }; message?: string };
      enqueueSnackbar(error.body?.message || error.message || 'Błąd podczas dodawania', { variant: 'error' });
    }
  };

  const handleDelete = async (date: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć dzień wolny ${date}?`)) {
      return;
    }

    try {
      await deleteDayOff(date);
      enqueueSnackbar('Dzień wolny został usunięty', { variant: 'success' });
    } catch (err: unknown) {
      const error = err as { body?: { message?: string }; message?: string };
      enqueueSnackbar(error.body?.message || error.message || 'Błąd podczas usuwania', { variant: 'error' });
    }
  };

  const sortedDayOffs = [...dayOffs].sort((a, b) => a.date.localeCompare(b.date));

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
        <CalendarIcon fontSize="large" />
        Dni wolne (sporadyczne zamknięcia)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Dni wolne są dodatkowo sprawdzane przy rezerwacjach. 
        Możesz również dodać wpis na stronie głównej landingu informujący o zamknięciu.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Lista dni wolnych</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Dodaj dzień wolny
                </Button>
              </Box>

              {sortedDayOffs.length === 0 ? (
                <Alert severity="info">
                  Brak dni wolnych. Kliknij &quot;Dodaj dzień wolny&quot;, aby dodać sporadyczne zamknięcie.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Data</strong></TableCell>
                        <TableCell><strong>Powód</strong></TableCell>
                        <TableCell align="right"><strong>Akcje</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedDayOffs.map((dayOff) => (
                        <TableRow key={dayOff.id}>
                          <TableCell>{dayOff.date}</TableCell>
                          <TableCell>{dayOff.reason || <em>Brak powodu</em>}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(dayOff.date)}
                              disabled={isDeleting}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj dzień wolny</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <DatePicker
                  label="Data"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  minDate={dayjs().startOf('day')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Powód (opcjonalnie)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="np. Święto, Remont, etc."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={!selectedDate || isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

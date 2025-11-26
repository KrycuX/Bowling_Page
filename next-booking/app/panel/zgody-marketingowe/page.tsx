'use client';

import { useState, useMemo } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import DownloadIcon from '@mui/icons-material/Download';

import { useMarketingConsents, useMarketingConsentsExport } from '../../../hooks/panel/useMarketingConsents';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function MarketingConsentsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useMarketingConsents({
    search: debouncedSearch,
    page,
    pageSize,
  });

  const exportMutation = useMarketingConsentsExport();

  const consents = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 0;

  const activeConsents = consents.filter(c => c.consentGiven).length;

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              📧 Zgody marketingowe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Lista zgód na kontakt marketingowy od klientów
            </Typography>
          </Stack>
          <Button 
            variant="contained" 
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending || total === 0}
            size="large"
            startIcon={exportMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          >
            Eksport CSV
          </Button>
        </Stack>
      </Paper>

      {/* Statistics */}
      <Stack direction="row" spacing={3}>
        <Card elevation={1} sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wszystkich zgód
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        
        <Card elevation={1} sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {activeConsents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktywnych zgód
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Search */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Szukaj (email, imię, nazwisko, telefon)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Wpisz tekst do wyszukania..."
        />
      </Paper>

      {/* Error State */}
      {isError && (
        <Alert severity="error">
          Nie udało się wczytać zgód marketingowych. {error?.message}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Ładowanie zgód marketingowych...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!isLoading && (
        <Paper elevation={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Imię</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nazwisko</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data wyrażenia</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Źródło</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow 
                    key={consent.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover' 
                      } 
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {consent.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {consent.firstName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {consent.lastName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {consent.phone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(consent.consentedAt).tz('Europe/Warsaw').format('YYYY-MM-DD HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {consent.source}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={consent.consentGiven ? 'Aktywna' : 'Cofnięta'}
                        color={consent.consentGiven ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Empty State */}
      {!isLoading && consents.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Brak zgód marketingowych
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {debouncedSearch 
                ? 'Nie znaleziono zgód pasujących do wyszukiwania.'
                : 'Brak zgód marketingowych w systemie.'
              }
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}


'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
} from '@mui/material';
import dayjs from 'dayjs';
import { useContactSubmissions, useContactSubmission } from '../../../hooks/panel/useContactSubmissions';

export default function ContactPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterEmail, setFilterEmail] = useState('');

  const { data, isLoading, isError, error } = useContactSubmissions({
    page,
    pageSize,
    email: filterEmail || undefined,
  });

  const { data: selectedSubmission } = useContactSubmission(selectedId || 0);

  const handleSearch = () => {
    setFilterEmail(emailFilter);
    setPage(1);
  };

  const handleViewDetails = (id: number) => {
    setSelectedId(id);
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Zgłoszenia kontaktowe</Typography>
      </Stack>

      {isError && (
        <Alert severity="error">
          Nie udało się wczytać zgłoszeń. {error?.message}
        </Alert>
      )}

      {/* Filter */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Filtruj po email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" onClick={handleSearch}>
            Szukaj
          </Button>
          {(filterEmail || emailFilter) && (
            <Button
              variant="text"
              onClick={() => {
                setFilterEmail('');
                setEmailFilter('');
                setPage(1);
              }}
            >
              Wyczyść
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Table */}
      {isLoading ? (
        <Typography>Ładowanie...</Typography>
      ) : (
        <Stack spacing={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Imię i nazwisko</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data.map((submission) => (
                  <TableRow key={submission.id} hover>
                    <TableCell>#{submission.id}</TableCell>
                    <TableCell>
                      {dayjs(submission.createdAt).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell>{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.phone || '—'}</TableCell>
                    <TableCell>
                      {submission.marketingConsent ? (
                        <Chip label="Tak" color="success" size="small" />
                      ) : (
                        <Chip label="Nie" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(submission.id)}
                      >
                        Szczegóły
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data?.meta && data.meta.totalPages > 1 && (
            <Box display="flex" justifyContent="center">
              <Pagination
                count={data.meta.totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}

          {data?.data.length === 0 && (
            <Alert severity="info">Brak zgłoszeń do wyświetlenia</Alert>
          )}
        </Stack>
      )}

      {/* Details Dialog */}
      <Dialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Szczegóły zgłoszenia #{selectedId}</DialogTitle>
        <DialogContent>
          {selectedSubmission ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data zgłoszenia
                </Typography>
                <Typography>
                  {dayjs(selectedSubmission.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Imię i nazwisko
                </Typography>
                <Typography>{selectedSubmission.name}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography>{selectedSubmission.email}</Typography>
              </Box>

              {selectedSubmission.phone && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography>{selectedSubmission.phone}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Wiadomość
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.message}
                </Paper>
              </Box>

              <Stack direction="row" spacing={2}>
                <Chip
                  label={selectedSubmission.rodoConsent ? 'Zgoda RODO' : 'Brak zgody RODO'}
                  color={selectedSubmission.rodoConsent ? 'success' : 'error'}
                />
                <Chip
                  label={selectedSubmission.marketingConsent ? 'Zgoda marketingowa' : 'Brak zgody marketingowej'}
                  color={selectedSubmission.marketingConsent ? 'success' : 'default'}
                />
              </Stack>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  IP klienta
                </Typography>
                <Typography variant="body2">{selectedSubmission.clientIp}</Typography>
              </Box>

              {selectedSubmission.userAgent && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Agent
                  </Typography>
                  <Typography variant="body2">{selectedSubmission.userAgent}</Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography>Ładowanie...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}


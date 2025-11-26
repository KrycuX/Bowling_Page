'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
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
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Download as DownloadIcon, Search as SearchIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useCouponAssignments, useDeleteAssignment } from '../../hooks/panel/useCoupons';

type CouponAssignmentsDialogProps = {
  open: boolean;
  onClose: () => void;
  couponId: number;
  couponCode: string;
};

export function CouponAssignmentsDialog({ open, onClose, couponId, couponCode }: CouponAssignmentsDialogProps) {
  const { data: assignments, isLoading, isError } = useCouponAssignments(couponId);
  const deleteAssignment = useDeleteAssignment();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'available'>('all');
  const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'usedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    let filtered = assignments;
    
    // Filtruj według statusu
    if (statusFilter === 'used') {
      filtered = filtered.filter(assignment => assignment.usedAt);
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(assignment => !assignment.usedAt);
    }
    
    // Filtruj według wyszukiwania
    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sortuj
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'usedAt':
          aValue = a.usedAt ? new Date(a.usedAt).getTime() : 0;
          bValue = b.usedAt ? new Date(b.usedAt).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [assignments, searchTerm, statusFilter, sortBy, sortOrder]);

  const usedCount = assignments?.filter(a => a.usedAt).length || 0;
  const totalCount = assignments?.length || 0;

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć to przypisanie?')) {
      try {
        await deleteAssignment.mutateAsync({ couponId, assignmentId });
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        alert('Nie udało się usunąć przypisania');
      }
    }
  };

  const handleSort = (column: 'email' | 'createdAt' | 'usedAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    if (!assignments) return;
    
    const csvContent = [
      'Email,Status,Data przypisania,Data użycia',
      ...assignments.map(assignment => [
        assignment.email,
        assignment.usedAt ? 'Użyty' : 'Dostępny',
        dayjs(assignment.createdAt).format('DD.MM.YYYY HH:mm'),
        assignment.usedAt ? dayjs(assignment.usedAt).format('DD.MM.YYYY HH:mm') : '—'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kupon-${couponCode}-przypisania.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h6">
              Przypisane emaile - {couponCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kupon przypisany do maila - tylko przypisane emaile mogą go użyć
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {assignments && assignments.length > 0 && (
              <Tooltip title="Eksportuj do CSV">
                <IconButton onClick={handleExportCSV} size="small" color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Nie udało się wczytać przypisań kuponu.
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Statystyki */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Chip 
                  icon={<EmailIcon />} 
                  label={`${totalCount} przypisań`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${usedCount} użytych`} 
                  color={usedCount > 0 ? "success" : "default"} 
                  variant="outlined" 
                />
                <Chip 
                  label={`${totalCount - usedCount} dostępnych`} 
                  color="info" 
                  variant="outlined" 
                />
                {totalCount > 0 && (
                  <Chip 
                    label={`${Math.round((usedCount / totalCount) * 100)}% wykorzystania`} 
                    color={usedCount > 0 ? "success" : "default"} 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Box>

            {/* Filtry i wyszukiwanie */}
            {assignments && assignments.length > 0 && (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setStatusFilter('all')}
                  >
                    Wszystkie ({totalCount})
                  </Button>
                  <Button
                    size="small"
                    variant={statusFilter === 'available' ? 'contained' : 'outlined'}
                    onClick={() => setStatusFilter('available')}
                    color="info"
                  >
                    Dostępne ({totalCount - usedCount})
                  </Button>
                  <Button
                    size="small"
                    variant={statusFilter === 'used' ? 'contained' : 'outlined'}
                    onClick={() => setStatusFilter('used')}
                    color="success"
                  >
                    Użyte ({usedCount})
                  </Button>
                </Stack>
                <TextField
                  placeholder="Szukaj emaili..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}

            {/* Informacja o wynikach */}
            {assignments && assignments.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Wyświetlane: {filteredAssignments.length} z {totalCount} przypisań
                {searchTerm && ` (wyszukiwanie: "${searchTerm}")`}
                {statusFilter !== 'all' && ` (filtr: ${statusFilter === 'used' ? 'użyte' : 'dostępne'})`}
              </Typography>
            )}

            {/* Tabela emaili */}
            {filteredAssignments && filteredAssignments.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        onClick={() => handleSort('email')}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>Email</span>
                          {sortBy === 'email' && (
                            sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell 
                        align="right"
                        onClick={() => handleSort('createdAt')}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                          <span>Data przypisania</span>
                          {sortBy === 'createdAt' && (
                            sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell 
                        align="right"
                        onClick={() => handleSort('usedAt')}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                          <span>Data użycia</span>
                          {sortBy === 'usedAt' && (
                            sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">Akcje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {assignment.email}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {assignment.usedAt ? (
                            <Chip 
                              label="Użyty" 
                              color="success" 
                              size="small" 
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip 
                              label="Dostępny" 
                              color="default" 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(assignment.createdAt).format('DD.MM.YYYY HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {assignment.usedAt ? (
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(assignment.usedAt).format('DD.MM.YYYY HH:mm')}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {!assignment.usedAt && (
                            <Tooltip title="Usuń przypisanie">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                disabled={deleteAssignment.isPending}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Nie znaleziono emaili pasujących do wyszukiwania.' : 'Brak przypisanych emaili do tego kuponu.'}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  );
}

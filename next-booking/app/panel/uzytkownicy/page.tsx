'use client';

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
import Typography from '@mui/material/Typography';
import Link from 'next/link';

import { useUsersQuery } from '../../../hooks/panel/useUsers';
import type { UserRow } from '../../../lib/types';

export default function UsersPage() {
  const { data } = useUsersQuery();

  const users = data?.data ?? [];
  const activeUsers = users.filter(user => user.isActive).length;
  const adminUsers = users.filter(user => user.role === 'ADMIN').length;

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              👥 Użytkownicy
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Zarządzanie użytkownikami systemu
            </Typography>
          </Stack>
          <Button 
            variant="contained" 
            component={Link} 
            href="/panel/uzytkownicy/nowy"
            size="large"
          >
            ➕ Dodaj użytkownika
          </Button>
        </Stack>
      </Paper>

      {/* Statistics */}
      <Stack direction="row" spacing={3}>
        <Card elevation={1} sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wszystkich użytkowników
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        
        <Card elevation={1} sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {activeUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktywnych użytkowników
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        
        <Card elevation={1} sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {adminUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administratorów
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Users Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rola</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ostatnie logowanie</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Data utworzenia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: UserRow) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover' 
                    } 
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'warning' : 'default'}
                      size="small"
                      variant={user.role === 'ADMIN' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Aktywny' : 'Nieaktywny'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleString('pl-PL')
                        : 'Nigdy'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {users.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Brak użytkowników
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dodaj pierwszego użytkownika, aby rozpocząć zarządzanie systemem.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

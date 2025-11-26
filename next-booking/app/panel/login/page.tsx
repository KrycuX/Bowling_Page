'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { login } from '../../../lib/panel/auth';
import { clearPanelSession } from '../../../lib/panel/session';
import { useAdminAuth } from '../../../hooks/panel/useAdminAuth';
import { Turnstile } from '../../../components/Turnstile';

export default function PanelLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, refetch } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/panel');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!turnstileToken) {
      setError('Proszę ukończyć weryfikację zabezpieczającą');
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      await login(email, password, turnstileToken);
      // Invalidate and refetch auth query to update authentication state
      await queryClient.invalidateQueries({ queryKey: ['admin', 'me'] });
      await refetch();
      // Use window.location for full page reload to ensure cookie is available
      window.location.href = '/panel';
    } catch (err) {
      setError('Nieprawidłowe dane logowania');
      clearPanelSession();
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 5, width: 360 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h5" textAlign="center">
              Panel pracownika
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <TextField
              label="Hasło"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null);
                  setError('Weryfikacja zabezpieczająca nie powiodła się. Spróbuj ponownie.');
                }}
                mode="managed"
                theme="auto"
              />
            </Box>
            <Button type="submit" variant="contained" disabled={loading || !turnstileToken}>
              Zaloguj
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

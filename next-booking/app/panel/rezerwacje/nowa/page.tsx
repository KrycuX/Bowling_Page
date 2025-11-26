'use client';

import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OrderForm, type OrderFormValues } from '../../../../components/panel/OrderForm';
import { useCreateOrder } from '../../../../hooks/panel/useOrderMutations';
import { ApiError } from '../../../../lib/panel/api';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Wybrany slot nie jest już dostępny. Wybierz inny termin.';
    }
    if (error.status === 400) {
      if (error.body && typeof error.body === 'object' && 'message' in error.body) {
        if ('errors' in error.body && Array.isArray(error.body.errors)) {
          const validationErrors = error.body.errors as Array<{ path: string; message: string }>;
          if (validationErrors.length > 0) {
            return `Błąd walidacji: ${validationErrors[0].message}`;
          }
        }
        return String(error.body.message);
      }
      return 'Nieprawidłowe dane. Sprawdź wprowadzone informacje.';
    }
    if (error.status === 500) {
      return 'Błąd serwera. Spróbuj ponownie później.';
    }
    return `Błąd: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message || 'Wystąpił nieoczekiwany błąd.';
  }
  return 'Wystąpił nieoczekiwany błąd.';
}

export default function NewOrderPage() {
  const router = useRouter();
  const createMutation = useCreateOrder();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setError(null);
      const result = await createMutation.mutateAsync(values);
      setSuccess('Rezerwacja utworzona');
      router.push(`/panel/rezerwacje/${result.orderId}`);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight="bold">
            ➕ Nowa rezerwacja
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Utwórz nową rezerwację dla klienta
          </Typography>
        </Stack>
      </Paper>

      <OrderForm onSubmit={handleSubmit} submitting={createMutation.isPending} />
      
      <Snackbar open={Boolean(success)} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

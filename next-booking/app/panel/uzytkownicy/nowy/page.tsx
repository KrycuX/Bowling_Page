'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useState } from 'react';

import { UserForm } from '../../../../components/panel/UserForm';
// ⬇️ type-only import – nie trafi do bundla
import type { UserRole } from '../../../../components/panel/UserForm';
import { useCreateUser } from '../../../../hooks/panel/useUsers';

export default function NewUserPage() {
  const createUser = useCreateUser();
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; role: UserRole }) => {
    const result = await createUser.mutateAsync(values);
    setTemporaryPassword(result.temporaryPassword);
  };

  return (
    <>
      <UserForm onSubmit={handleSubmit} submitting={createUser.isPending} />
      <Snackbar
        open={Boolean(temporaryPassword)}
        autoHideDuration={8000}
        onClose={() => setTemporaryPassword(null)}
      >
        <Alert severity="info" onClose={() => setTemporaryPassword(null)}>
          Tymczasowe hasło: <strong>{temporaryPassword}</strong>
        </Alert>
      </Snackbar>
    </>
  );
}

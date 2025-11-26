'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export const USER_ROLES = ['EMPLOYEE', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

type Props = {
  initialEmail?: string;
  initialRole?: UserRole;
  onSubmit: (values: { email: string; role: UserRole }) => Promise<void>;
  submitting?: boolean;
};

export function UserForm({
  initialEmail = '',
  initialRole = 'EMPLOYEE', // 👈 string zamiast UserRole.EMPLOYEE
  onSubmit,
  submitting,
}: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<UserRole>(initialRole);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({ email, role });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2} maxWidth={400}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          select
          label="Rola"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          required
        >
          <MenuItem value="EMPLOYEE">Pracownik</MenuItem>
          <MenuItem value="ADMIN">Administrator</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" disabled={submitting}>
          Zapisz
        </Button>
      </Stack>
    </Box>
  );
}


"use client";

import { Box, Stack, TextField, Typography } from "@mui/material";

type CustomerValue = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type Props = {
  value: CustomerValue;
  onChange: (value: CustomerValue) => void;
};

export function CustomerForm({ value, onChange }: Props) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: '#FFFFFF', fontWeight: 600 }}>
        Dane kontaktowe
      </Typography>
      
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Imię"
            value={value.firstName}
            onChange={(event) => onChange({ ...value, firstName: event.target.value })}
            required
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#B8BCC8'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#8B5CF6'
              }
            }}
          />
          <TextField
            label="Nazwisko"
            value={value.lastName}
            onChange={(event) => onChange({ ...value, lastName: event.target.value })}
            required
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#B8BCC8'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#8B5CF6'
              }
            }}
          />
        </Stack>
        
        <TextField
          type="email"
          label="Adres e-mail"
          value={value.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
          helperText="Wykorzystamy ten adres do wysłania potwierdzenia rezerwacji."
          required
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#B8BCC8'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#8B5CF6'
            },
            '& .MuiFormHelperText-root': {
              color: '#B8BCC8'
            }
          }}
        />
        
        <TextField
          label="Telefon (opcjonalnie)"
          value={value.phone}
          onChange={(event) => onChange({ ...value, phone: event.target.value })}
          fullWidth
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#B8BCC8'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#8B5CF6'
            }
          }}
        />
      </Stack>
    </Box>
  );
}

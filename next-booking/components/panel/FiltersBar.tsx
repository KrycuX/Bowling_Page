"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

export const ORDER_STATUSES = [
  "HOLD",
  "PENDING_PAYMENT",
  "PENDING_ONSITE",
  "PAID",
  "EXPIRED",
  "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type FiltersState = {
  quickFilter?: 'created_today' | 'slot_today' | 'slot_tomorrow';
  dateFrom?: string;
  dateTo?: string;
  resourceType?: "BOWLING_LANE" | "QUIZ_ROOM" | "KARAOKE_ROOM" | "BILLIARDS_TABLE";
  status?: OrderStatus;
  q?: string;
};

type Props = {
  filters: FiltersState;
  onChange: (next: Partial<FiltersState>) => void;
  onReset: () => void;
};

export function FiltersBar({ filters, onChange, onReset }: Props) {
  return (
    <Stack spacing={2}>
      {/* Quick filter buttons */}
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        <Chip
          label="Złożone dzisiaj"
          onClick={() => onChange({ quickFilter: 'created_today' })}
          color={filters.quickFilter === 'created_today' ? 'primary' : 'default'}
          variant={filters.quickFilter === 'created_today' ? 'filled' : 'outlined'}
          clickable
        />
        <Chip
          label="Termin dzisiaj"
          onClick={() => onChange({ quickFilter: 'slot_today' })}
          color={filters.quickFilter === 'slot_today' ? 'primary' : 'default'}
          variant={filters.quickFilter === 'slot_today' ? 'filled' : 'outlined'}
          clickable
        />
        <Chip
          label="Termin Jutro"
          onClick={() => onChange({ quickFilter: 'slot_tomorrow' })}
          color={filters.quickFilter === 'slot_tomorrow' ? 'primary' : 'default'}
          variant={filters.quickFilter === 'slot_tomorrow' ? 'filled' : 'outlined'}
          clickable
        />
      </Stack>

      {/* Regular filters */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
        <TextField
          label="Szukaj (email/telefon)"
          value={filters.q ?? ""}
          onChange={(event) => onChange({ q: event.target.value })}
          size="small"
        />

      <TextField
        label="Od"
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(event) => onChange({ dateFrom: event.target.value })}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Do"
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(event) => onChange({ dateTo: event.target.value })}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        select
        label="Status"
        value={filters.status ?? ""}
        onChange={(event) =>
          onChange({ status: (event.target.value || undefined) as OrderStatus | undefined })
        }
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Wszystkie</MenuItem>
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Typ zasobu"
        value={filters.resourceType ?? ""}
        onChange={(event) =>
          onChange({
            resourceType: (event.target.value || undefined) as FiltersState["resourceType"]
          })
        }
        size="small"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Wszystkie</MenuItem>
        <MenuItem value="BOWLING_LANE">Kregle</MenuItem>
        <MenuItem value="BILLIARDS_TABLE">Bilard</MenuItem>
        <MenuItem value="QUIZ_ROOM">Quiz Room</MenuItem>
        <MenuItem value="KARAOKE_ROOM">Karaoke</MenuItem>
      </TextField>

      <Box>
        <Button onClick={onReset}>Wyczysc</Button>
      </Box>
      </Stack>
    </Stack>
  );
}

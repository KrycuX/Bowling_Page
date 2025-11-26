'use client';

import { useState } from 'react';
import { Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCoupons, useCreateCoupon, useImportAssignments, useUpdateCoupon } from '../../../hooks/panel/useCoupons';
import { CouponAssignmentsDialog } from '../../../components/panel/CouponAssignmentsDialog';

export default function CouponsPage() {
  const { data, isLoading, isError, error } = useCoupons();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const importMutation = useImportAssignments();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    id?: number;
    code: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    appliesToAll: boolean;
    usePerEmail: boolean;
    minTotal?: number | null;
    showOnLandingPage?: boolean;
  }>({ code: '', type: 'PERCENT', value: 10, appliesToAll: true, usePerEmail: false, showOnLandingPage: false });
  const [csvDialog, setCsvDialog] = useState<{ open: boolean; id?: number }>({ open: false });
  const [csv, setCsv] = useState('');
  const [assignmentsDialog, setAssignmentsDialog] = useState<{ open: boolean; couponId?: number; couponCode?: string }>({ open: false });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Kupony</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Dodaj</Button>
      </Stack>

        {isError && <Alert severity="error">Nie udało się wczytać kuponów. {error?.message}</Alert>}

        {isLoading ? (
          <Typography>Ładowanie...</Typography>
        ) : (
          <Box>
            <Grid container spacing={2}>
              {data?.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c.id}>
                  <Stack p={2} border="1px solid #333" borderRadius={2} spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={700}>{c.code}</Typography>
                      <Chip label={c.isActive ? 'Aktywny' : 'Nieaktywny'} color={c.isActive ? 'success' : 'default'} size="small" />
                    </Stack>
                    <Typography variant="body2">{c.type === 'PERCENT' ? `-${c.value / 100}%` : `-${(c.value / 100).toFixed(2)} zł`}</Typography>
                    <Typography variant="body2">Zakres: {c.appliesToAll ? 'Wszystko' : c.allowedTypes.map((t) => t.resourceType).join(', ')}</Typography>
                    <Typography variant="body2" color={c.usePerEmail ? 'success.main' : 'info.main'}>
                      {c.usePerEmail ? 'Dla wszystkich (jednorazowy)' : 'Przypisany do maila'}
                    </Typography>
                    {c.showOnLandingPage && (
                      <Chip label="Na landing page" color="secondary" size="small" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {c.validFrom ? dayjs(c.validFrom).format('YYYY-MM-DD') : '—'} – {c.validTo ? dayjs(c.validTo).format('YYYY-MM-DD') : '—'}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button size="small" onClick={() => { 
                        setForm({ 
                          ...c, 
                          type: c.type as 'PERCENT' | 'FIXED',
                          value: c.value / 100, // Konwersja promili/groszy na procenty/złote
                          showOnLandingPage: c.showOnLandingPage ?? false
                        }); 
                        setOpen(true); 
                      }}>Edytuj</Button>
                      {!c.usePerEmail && (
                        <Button size="small" onClick={() => setAssignmentsDialog({ open: true, couponId: c.id, couponCode: c.code })}>
                          Przypisane emaile
                        </Button>
                      )}
                      <Button size="small" onClick={() => setCsvDialog({ open: true, id: c.id })}>Import e-maile</Button>
                    </Stack>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{form?.id ? 'Edytuj kupon' : 'Dodaj kupon'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField label="Kod" value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
              <ToggleButtonGroup exclusive value={form.type ?? 'PERCENT'} onChange={(_e, v) => v && setForm((f) => ({ ...f, type: v }))} size="small">
                <ToggleButton value="PERCENT">Procent</ToggleButton>
                <ToggleButton value="FIXED">Kwota</ToggleButton>
              </ToggleButtonGroup>
              <TextField 
                label={form.type === 'PERCENT' ? 'Wartość (%)' : 'Wartość (zł)'} 
                type="number" 
                value={form.value ?? 0} 
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} 
                inputProps={{ step: 0.01 }}
              />
              <TextField label="Minimalna kwota (opcjonalnie)" type="number" value={form.minTotal ?? ''} onChange={(e) => setForm((f) => ({ ...f, minTotal: e.target.value ? Number(e.target.value) : null }))} />
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>Typ kuponu:</Typography>
                <ToggleButtonGroup exclusive value={form.usePerEmail} onChange={(_e, v) => v !== null && setForm((f) => ({ ...f, usePerEmail: v }))} size="small">
                  <ToggleButton value={true}>Dla wszystkich (jednorazowy)</ToggleButton>
                  <ToggleButton value={false}>Przypisany do maila</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary">
                  {form.usePerEmail 
                    ? "Kupon może być użyty przez każdego, ale tylko raz na email" 
                    : "Kupon musi być najpierw przypisany do konkretnych emaili (użyj 'Import e-maile')"
                  }
                </Typography>
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.showOnLandingPage ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, showOnLandingPage: e.target.checked }))}
                  />
                }
                label="Wyświetlaj na stronie landing page"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Anuluj</Button>
            {form?.id ? (
              <Button onClick={async () => { 
                const payload = {
                  ...form, 
                  id: form.id!,
                  value: Math.round(form.value * 100) // Konwersja procentów/złotych na promile/grosze
                };
                await updateMutation.mutateAsync(payload); 
                setOpen(false); 
              }}>Zapisz</Button>
            ) : (
              <Button onClick={async () => { 
                const payload = {
                  ...form,
                  value: Math.round(form.value * 100) // Konwersja procentów/złotych na promile/grosze
                };
                await createMutation.mutateAsync(payload); 
                setOpen(false); 
              }}>Utwórz</Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog open={csvDialog.open} onClose={() => setCsvDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>Import przypisań e-mail</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>Wklej CSV z jedną kolumną email.</Typography>
            <TextField label="CSV" value={csv} onChange={(e) => setCsv(e.target.value)} multiline minRows={6} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCsvDialog({ open: false })}>Anuluj</Button>
            <Button onClick={async () => { if (csvDialog.id) { await importMutation.mutateAsync({ id: csvDialog.id, csv }); setCsv(''); setCsvDialog({ open: false }); } }}>Importuj</Button>
          </DialogActions>
        </Dialog>

        <CouponAssignmentsDialog
          open={assignmentsDialog.open}
          onClose={() => setAssignmentsDialog({ open: false })}
          couponId={assignmentsDialog.couponId || 0}
          couponCode={assignmentsDialog.couponCode || ''}
        />
    </Stack>
  );
}



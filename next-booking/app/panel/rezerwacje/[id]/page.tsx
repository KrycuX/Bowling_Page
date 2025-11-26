"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "../../../../components/panel/ConfirmDialog";
import { useCancelOrder, useMarkOrderPaid } from "../../../../hooks/panel/useOrderMutations";
import { useOrderDetails } from "../../../../hooks/panel/useOrderDetails";

const STATUS_LABELS: Record<string, string> = {
  HOLD: "HOLD",
  PENDING_PAYMENT: "Oczekuje na platnosc",
  PENDING_ONSITE: "Platnosc na miejscu",
  PAID: "Oplacone",
  EXPIRED: "Wygasla",
  CANCELLED: "Anulowana"
};

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "error"> = {
  HOLD: "warning",
  PENDING_PAYMENT: "warning",
  PENDING_ONSITE: "warning",
  PAID: "success",
  EXPIRED: "default",
  CANCELLED: "error"
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ONLINE: "Online",
  ON_SITE_CASH: "Gotowka",
  ON_SITE_CARD: "Karta"
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  BOWLING_LANE: "Kręgle",
  BILLIARDS_TABLE: "Bilard",
  QUIZ_ROOM: "Quiz",
  KARAOKE_ROOM: "Karaoke"
};

const RESOURCE_TYPE_COLORS: Record<string, "primary" | "secondary" | "success" | "warning" | "error" | "info"> = {
  BOWLING_LANE: "primary",
  BILLIARDS_TABLE: "secondary", 
  QUIZ_ROOM: "success",
  KARAOKE_ROOM: "warning"
};

function formatDateTime(value: string | undefined) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("pl-PL");
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const { data: order, refetch } = useOrderDetails(orderId);
  const cancelMutation = useCancelOrder(orderId);
  const markPaidMutation = useMarkOrderPaid(orderId);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarVariant, setSnackbarVariant] = useState<"success" | "error">("success");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const summary = useMemo(() => {
    if (!order || !order.items || !order.reservedSlots) {
      return null;
    }

    const sortedSlots = [...(order.reservedSlots ?? [])].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const slotsByResource = new Map<number, typeof sortedSlots>();
    sortedSlots.forEach((slot) => {
      const current = slotsByResource.get(slot.resourceId) ?? [];
      current.push(slot);
      slotsByResource.set(slot.resourceId, current);
    });

    const items = order.items.map((item) => {
      const slots = (slotsByResource.get(item.resourceId) ?? []).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];

      return {
        resourceId: item.resourceId,
        resourceName: item.resource?.name || `Zasób #${item.resourceId}`,
        resourceType: item.resource?.type || 'UNKNOWN',
        pricingMode: item.pricingMode,
        peopleCount: item.peopleCount,
        start: formatDateTime(firstSlot?.startTime),
        end: formatDateTime(lastSlot?.endTime ?? slots[0]?.endTime),
        durationHours: slots.length || 1,
        description: item.description
      };
    });

    return {
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone ?? "-",
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      createdAt: formatDateTime(order.createdAt),
      paidAt: formatDateTime(order.paidAt ?? undefined),
      items
    };
  }, [order]);

  const handleCancel = async () => {
    if (!order) {
      return;
    }
    try {
      await cancelMutation.mutateAsync({ reason: "Anulowane z panelu" });
      setConfirmCancel(false);
      setSnackbarVariant("success");
      setSnackbarMessage("Rezerwacja anulowana");
      refetch();
    } catch (error) {
      setSnackbarVariant("error");
      setSnackbarMessage("Nie udalo sie anulowac rezerwacji");
    }
  };

  const handleMarkPaid = async () => {
    if (!order) {
      return;
    }
    try {
      await markPaidMutation.mutateAsync();
      setSnackbarVariant("success");
      setSnackbarMessage("Zamowienie oznaczone jako oplacone");
      refetch();
    } catch (error) {
      setSnackbarVariant("error");
      setSnackbarMessage("Nie udalo sie oznaczyc zamowienia jako oplacone");
    }
  };

  if (!order || !summary) {
    return <Typography>Ladowanie...</Typography>;
  }

  const canCancel = !["CANCELLED", "EXPIRED"].includes(order.status);
  const paymentStatusLabel =
    order.status === "PAID"
      ? "Oplacone"
      : order.status === "PENDING_PAYMENT"
      ? "Oczekuje na platnosc online"
      : order.status === "PENDING_ONSITE"
      ? "Platnosc na miejscu"
      : STATUS_LABELS[order.status] ?? order.status;
  const canMarkPaid = order.status !== "PAID" && !["CANCELLED", "EXPIRED"].includes(order.status);

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              Rezerwacja {order.orderNumber || order.id}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={STATUS_LABELS[order.status] ?? order.status}
                color={STATUS_COLOR[order.status] ?? "default"}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary">
                Utworzono: {summary.createdAt}
              </Typography>
            </Stack>
          </Stack>
          <Button
            color="error"
            variant="outlined"
            onClick={() => setConfirmCancel(true)}
            disabled={!canCancel || cancelMutation.isPending}
            size="large"
          >
            Anuluj rezerwację
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                👤 Informacje o kliencie
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Imię i nazwisko</Typography>
                  <Typography variant="body1" fontWeight="medium">{summary.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{summary.customerEmail}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1">{summary.customerPhone}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                💳 Informacje o płatności
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Kwota</Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {(summary.totalAmount / 100).toFixed(2)} {summary.currency}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Metoda płatności</Typography>
                  <Typography variant="body1">{PAYMENT_METHOD_LABELS[summary.paymentMethod] ?? summary.paymentMethod}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status płatności</Typography>
                  <Typography variant="body1">{paymentStatusLabel}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Opłacono</Typography>
                  <Typography variant="body1">{summary.paidAt}</Typography>
                </Box>
                {canMarkPaid && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleMarkPaid}
                    disabled={markPaidMutation.isPending}
                    sx={{ mt: 2 }}
                  >
                    Oznacz jako opłacone
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resources */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🎯 Zarezerwowane zasoby
              </Typography>
              {summary.items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Brak przypisanych zasobów.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {summary.items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={`${item.resourceId}-${index}`}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%'
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={RESOURCE_TYPE_LABELS[item.resourceType] || item.resourceType}
                              color={RESOURCE_TYPE_COLORS[item.resourceType] || "default"}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.resourceName}
                            </Typography>
                          </Stack>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary">Czas trwania</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {item.durationHours} h
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary">Początek</Typography>
                            <Typography variant="body1">{item.start}</Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary">Koniec</Typography>
                            <Typography variant="body1">{item.end}</Typography>
                          </Box>
                          
                          {item.peopleCount != null && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">Liczba osób</Typography>
                              <Typography variant="body1">{item.peopleCount}</Typography>
                            </Box>
                          )}
                          
                          {item.description && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">Opis</Typography>
                              <Typography variant="body1">{item.description}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
      >
        <Alert severity={snackbarVariant} onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmCancel}
        title="Czy na pewno anulowac rezerwacje?"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        confirmText="Anuluj rezerwacje"
        cancelText="Zamknij"
      />
    </Stack>
  );
}

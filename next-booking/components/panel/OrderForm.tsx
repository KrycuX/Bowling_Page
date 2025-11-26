"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import { CalendarInline } from "../../app/(booking)/components/CalendarInline";
import { ResourceGrid } from "../booking/ResourceGrid";
import { useAvailability } from "../../hooks/useAvailability";
import { useDaySchedule } from "../../hooks/useDaySchedule";
import { dayjs } from "../../lib/dayjs";
import type { PricingMode, Resource, ResourceType } from "../../lib/types";
import {
  calculatePrice,
  formatPrice,
  getAvailableDurations,
  getKaraokeMaxPeople,
  getPricingModeForResourceType,
  getQuizMaxPeople
} from "../../lib/pricing";
import { getAvailableStartTimes } from "../../lib/availability";
import { useAdminSettings } from "../../hooks/panel/useAdminSettings";

export type OrderFormValues = {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  items: {
    resourceId: number;
    date: string;
    start: string;
    duration: number;
    peopleCount?: number | null;
    pricingMode: PricingMode;
  }[];
  payment: {
    method: "ON_SITE_CASH" | "ON_SITE_CARD";
  };
};

type Props = {
  initialDate?: string;
  initialCustomer?: OrderFormValues["customer"];
  initialItems?: OrderFormValues["items"];
  initialPaymentMethod?: OrderFormValues["payment"]["method"];
  onSubmit: (values: OrderFormValues) => Promise<void>;
  submitting?: boolean;
};

type ResourceTypeTab = {
  value: ResourceType;
  label: string;
};

const RESOURCE_TYPE_TABS: ResourceTypeTab[] = [
  { value: "BOWLING_LANE", label: "Bowling" },
  { value: "BILLIARDS_TABLE", label: "Bilard" },
  { value: "QUIZ_ROOM", label: "Quiz" },
  { value: "KARAOKE_ROOM", label: "Karaoke" }
];

const defaultCustomer = {
  email: "",
  firstName: "",
  lastName: "",
  phone: ""
};

const defaultDate = () => new Date().toISOString().slice(0, 10);

function deriveInitialResourceType(items?: OrderFormValues["items"]): ResourceType {
  if (!items || items.length === 0) {
    return "BOWLING_LANE";
  }
  const first = items[0];
  switch (first.pricingMode) {
    case "PER_PERSON_PER_SESSION":
      return "QUIZ_ROOM";
    case "PER_PERSON_PER_HOUR":
      return "KARAOKE_ROOM";
    case "PER_RESOURCE_PER_HOUR":
    default:
      return "BOWLING_LANE";
  }
}

function deriveInitialCandidateTypes(items?: OrderFormValues["items"]): ResourceType[] {
  if (!items || items.length === 0) {
    return ["BOWLING_LANE", "BILLIARDS_TABLE", "QUIZ_ROOM", "KARAOKE_ROOM"];
  }
  const pricingMode = items[0].pricingMode;
  if (pricingMode === "PER_PERSON_PER_SESSION") {
    return ["QUIZ_ROOM"];
  }
  if (pricingMode === "PER_PERSON_PER_HOUR") {
    return ["KARAOKE_ROOM"];
  }
  return ["BOWLING_LANE", "BILLIARDS_TABLE"];
}

function isMultiResourceType(resourceType: ResourceType): boolean {
  return resourceType === "BOWLING_LANE" || resourceType === "BILLIARDS_TABLE";
}

function requiresPeopleCount(resourceType: ResourceType): boolean {
  return resourceType === "QUIZ_ROOM" || resourceType === "KARAOKE_ROOM";
}

export function OrderForm({
  initialDate,
  initialCustomer,
  initialItems,
  initialPaymentMethod = "ON_SITE_CASH",
  onSubmit,
  submitting
}: Props) {
  const { settings: adminSettings } = useAdminSettings();
  const pricingOverrides = useMemo(() => {
    if (!adminSettings) {
      return undefined;
    }
    return {
      priceBowlingPerHour: adminSettings.PRICE_BOWLING_PER_HOUR,
      priceBilliardsPerHour: adminSettings.PRICE_BILLIARDS_PER_HOUR,
      priceKaraokePerPersonPerHour: adminSettings.PRICE_KARAOKE_PER_PERSON_PER_HOUR,
      priceQuizPerPersonPerSession: adminSettings.PRICE_QUIZ_PER_PERSON_PER_SESSION,
      bowlingMinDurationHours: adminSettings.BOWLING_MIN_DURATION_HOURS,
      bowlingMaxDurationHours: adminSettings.BOWLING_MAX_DURATION_HOURS,
      quizDurationHours: adminSettings.QUIZ_DURATION_HOURS,
      karaokeMinDurationHours: adminSettings.KARAOKE_MIN_DURATION_HOURS,
      karaokeMaxDurationHours: adminSettings.KARAOKE_MAX_DURATION_HOURS,
      quizMaxPeople: adminSettings.QUIZ_MAX_PEOPLE,
      karaokeMaxPeople: adminSettings.KARAOKE_MAX_PEOPLE
    };
  }, [adminSettings]);

  const [date, setDate] = useState(initialDate ?? defaultDate());
  const [customer, setCustomer] = useState({ ...defaultCustomer, ...initialCustomer });
  const [paymentMethod, setPaymentMethod] = useState<"ON_SITE_CASH" | "ON_SITE_CARD">(
    initialPaymentMethod
  );

  const candidateTypes = useMemo(
    () => deriveInitialCandidateTypes(initialItems),
    [initialItems]
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [resourceType, setResourceType] = useState<ResourceType>(
    deriveInitialResourceType(initialItems)
  );
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>(
    initialItems?.map((item) => item.resourceId) ?? []
  );
  const [startTime, setStartTime] = useState(initialItems?.[0]?.start ?? "");
  const [duration, setDuration] = useState(initialItems?.[0]?.duration ?? 1);
  const [peopleCount, setPeopleCount] = useState<number | "">(
    requiresPeopleCount(resourceType) ? initialItems?.[0]?.peopleCount ?? 1 : ""
  );
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [initialApplied, setInitialApplied] = useState(
    !initialItems || initialItems.length === 0
  );

  useEffect(() => {
    if (!requiresPeopleCount(resourceType)) {
      if (peopleCount !== "") {
        setPeopleCount("");
      }
      return;
    }
    if (peopleCount === "") {
      setPeopleCount(resourceType === "QUIZ_ROOM" ? 4 : 4);
    }
  }, [resourceType, peopleCount]);

  const availabilityQuery = useAvailability({
    date,
    resourceType,
    resourceId: undefined
  });
  const availability = availabilityQuery.data;
  const resources = useMemo<Resource[]>(() => availability?.resources ?? [], [availability]);
  const slotInterval = availability?.slotIntervalMinutes ?? 60;

  const scheduleQuery = useDaySchedule({
    date,
    resourceType,
    resourceId: undefined
  });
  const schedule = scheduleQuery.data;

  useEffect(() => {
    if (!availabilityQuery.isFetched) {
      return;
    }

    if (initialApplied) {
      return;
    }

    const initialIds = initialItems?.map((item) => item.resourceId) ?? [];
    const missingInitialResource = initialIds.some(
      (id) => !resources.some((resource) => resource.id === id)
    );

    if (missingInitialResource && candidateIndex + 1 < candidateTypes.length) {
      const nextType = candidateTypes[candidateIndex + 1];
      setCandidateIndex((prev) => prev + 1);
      setResourceType(nextType);
      return;
    }

    if (!missingInitialResource && initialIds.length > 0) {
      setSelectedResourceIds(initialIds);
      setStartTime(initialItems?.[0]?.start ?? "");
      setDuration(initialItems?.[0]?.duration ?? 1);
      if (requiresPeopleCount(resourceType)) {
        setPeopleCount(initialItems?.[0]?.peopleCount ?? 1);
      }
      setInitialApplied(true);
    } else if (initialItems && initialItems.length === 0) {
      setInitialApplied(true);
    }
  }, [
    availabilityQuery.isFetched,
    candidateIndex,
    candidateTypes,
    initialApplied,
    initialItems,
    resourceType,
    resources
  ]);

  useEffect(() => {
    setSelectedResourceIds((prev) =>
      prev.filter((id) => resources.some((resource) => resource.id === id))
    );
  }, [resources]);

  useEffect(() => {
    if (selectedResourceIds.length === 0) {
      setStartTime("");
      setSelectedSlots(new Set());
    }
  }, [selectedResourceIds]);

  // Sync selectedSlots with form values when manually changed
  useEffect(() => {
    if (startTime && selectedResourceIds.length > 0 && duration > 0) {
      const [hoursStr] = startTime.split(':');
      const startHour = parseInt(hoursStr, 10);
      const newSelectedSlots = new Set<string>();
      
      selectedResourceIds.forEach(resourceId => {
        for (let i = 0; i < duration; i++) {
          const hour = startHour + i;
          newSelectedSlots.add(`${resourceId}:${hour}`);
        }
      });
      
      setSelectedSlots(newSelectedSlots);
    } else if (!startTime) {
      setSelectedSlots(new Set());
    }
  }, [startTime, duration, selectedResourceIds]);


  const selectedResources = useMemo(
    () => resources.filter((resource) => selectedResourceIds.includes(resource.id)),
    [resources, selectedResourceIds]
  );

  const durationOptions = useMemo(() => {
    const baseDurations = computeBaseDurations(
      resourceType,
      selectedResources,
      resources,
      pricingOverrides
    );
    return baseDurations.filter((value) => {
      const times = computeAvailableTimes({
        resourceType,
        resources: selectedResources,
        duration: value,
        slotInterval
      });
      return times.length > 0;
    });
  }, [resourceType, selectedResources, resources, slotInterval, pricingOverrides]);

  useEffect(() => {
    if (durationOptions.length === 0) {
      setDuration(1);
      return;
    }
    if (!durationOptions.includes(duration)) {
      setDuration(durationOptions[0]);
    }
  }, [duration, durationOptions]);

  const availableTimes = useMemo(
    () =>
      computeAvailableTimes({
        resourceType,
        resources: selectedResources,
        duration,
        slotInterval
      }),
    [resourceType, selectedResources, duration, slotInterval]
  );

  const selectableTimes = useMemo(() => {
    if (!startTime) {
      return availableTimes;
    }
    if (availableTimes.includes(startTime)) {
      return availableTimes;
    }
    return Array.from(new Set([startTime, ...availableTimes])).sort();
  }, [availableTimes, startTime]);

  useEffect(() => {
    if (startTime && !availableTimes.includes(startTime)) {
      setStartTime("");
    }
  }, [startTime, availableTimes]);

  const requiresCount = requiresPeopleCount(resourceType);
  const maxPeople = useMemo(
    () =>
      resourceType === "QUIZ_ROOM"
        ? getQuizMaxPeople(pricingOverrides)
        : getKaraokeMaxPeople(pricingOverrides),
    [resourceType, pricingOverrides]
  );

  const normalizedPeopleCount = useMemo(() => {
    if (!requiresCount) {
      return undefined;
    }
    if (typeof peopleCount === "number") {
      return peopleCount;
    }
    const parsed = Number(peopleCount);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [requiresCount, peopleCount]);

  const totalAmount = useMemo(() => {
    if (selectedResources.length === 0 || !startTime) {
      return 0;
    }
    return selectedResources.reduce((sum, resource) => {
      const peopleForResource =
        resource.type === "QUIZ_ROOM" || resource.type === "KARAOKE_ROOM"
          ? normalizedPeopleCount ?? 0
          : undefined;
      return sum + calculatePrice(resource, duration, peopleForResource, pricingOverrides);
    }, 0);
  }, [
    selectedResources,
    duration,
    startTime,
    normalizedPeopleCount,
    pricingOverrides
  ]);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isEmailValid = customer.email.trim().length > 0 && isValidEmail(customer.email);

  const canSubmit =
    selectedResourceIds.length > 0 &&
    startTime !== "" &&
    durationOptions.length > 0 &&
    customer.firstName.trim().length > 0 &&
    customer.lastName.trim().length > 0 &&
    isEmailValid &&
    (!requiresCount ||
      (typeof peopleCount === "number" &&
        peopleCount >= 1 &&
        peopleCount <= maxPeople));

  const pricingMode = getPricingModeForResourceType(resourceType);

  const handleResourceSelectionChange = (ids: number[]) => {
    if (isMultiResourceType(resourceType)) {
      setSelectedResourceIds(ids);
    } else {
      const nextId = ids.length > 0 ? ids[ids.length - 1] : null;
      setSelectedResourceIds(nextId ? [nextId] : []);
    }
    setStartTime("");
  };

  const handleResourceTypeChange = (_: unknown, nextType: ResourceType | null) => {
    if (!nextType) {
      return;
    }
    setResourceType(nextType);
    setCandidateIndex(0);
    setSelectedResourceIds([]);
    setStartTime("");
    setDuration(1);
    setPeopleCount(requiresPeopleCount(nextType) ? (nextType === "QUIZ_ROOM" ? 4 : 4) : "");
  };

  // Convert availability data to ResourceGrid format
  const gridResources = useMemo(() => {
    return resources.map((resource) => {
      // Convert availability slots to ResourceGrid format
      const slots: Array<{
        startTime: string;
        endTime: string;
        status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
      }> = resource.slots?.map((slot) => {
        if (slot.status === 'AVAILABLE') {
          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'AVAILABLE'
          };
        }
        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status === 'BOOKED' ? 'BOOKED' : 'HOLD'
        };
      }) ?? [];
      
      // Add booked/hold slots from schedule if available (to show all bookings)
      const scheduleResource = schedule?.resources.find(r => r.resourceId === resource.id);
      if (scheduleResource) {
        scheduleResource.bookings.forEach(booking => {
          // Only add if not already in slots (avoid duplicates)
          const exists = slots.some(s => s.startTime === booking.from && s.endTime === booking.to);
          if (!exists) {
            slots.push({
              startTime: booking.from,
              endTime: booking.to,
              status: booking.status === 'BOOKED' ? 'BOOKED' as const : 'HOLD' as const
            });
          }
        });
      }
      
      return {
        id: resource.id,
        name: resource.name,
        slots
      };
    });
  }, [resources, schedule]);

  const openHour = schedule?.openHour ?? 8;
  const closeHour = schedule?.closeHour ?? 22;

  // Handler for clicking on a resource in the grid
  const handleResourceClick = (resourceId: number) => {
    if (isMultiResourceType(resourceType)) {
      // Toggle resource selection
      setSelectedResourceIds(prev => 
        prev.includes(resourceId)
          ? prev.filter(id => id !== resourceId)
          : [...prev, resourceId]
      );
    } else {
      // Single selection
      setSelectedResourceIds(prev => 
        prev.includes(resourceId) ? [] : [resourceId]
      );
    }
    // Clear slot selection when changing resource
    setSelectedSlots(new Set());
    setStartTime("");
  };

  // Handler for clicking on a slot in the grid
  const handleSlotClick = (resourceId: number, hour: number) => {
    const slotKey = `${resourceId}:${hour}`;
    const newSelectedSlots = new Set(selectedSlots);
    
    // Toggle slot selection
    if (newSelectedSlots.has(slotKey)) {
      newSelectedSlots.delete(slotKey);
    } else {
      // Clear other slots for this resource if single resource type
      if (!isMultiResourceType(resourceType)) {
        Array.from(newSelectedSlots).forEach(key => {
          if (key.startsWith(`${resourceId}:`)) {
            newSelectedSlots.delete(key);
          }
        });
      }
      newSelectedSlots.add(slotKey);
    }
    
    setSelectedSlots(newSelectedSlots);
    
    // Auto-fill form based on selected slots
    if (newSelectedSlots.size > 0) {
      const resourceSlots = Array.from(newSelectedSlots)
        .filter(key => key.startsWith(`${resourceId}:`))
        .map(key => {
          const [, hourStr] = key.split(':');
          return parseInt(hourStr, 10);
        })
        .sort((a, b) => a - b);
      
      if (resourceSlots.length > 0) {
        // Set selected resource
        if (!selectedResourceIds.includes(resourceId)) {
          setSelectedResourceIds(isMultiResourceType(resourceType) 
            ? [...selectedResourceIds, resourceId]
            : [resourceId]
          );
        }
        
        // Calculate start time and duration
        const startHour = resourceSlots[0];
        const calculatedDuration = resourceSlots.length;
        
        setStartTime(`${String(startHour).padStart(2, '0')}:00`);
        setDuration(calculatedDuration);
      }
    } else {
      setStartTime("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    // Additional email validation before submit
    if (!isValidEmail(customer.email)) {
      return;
    }

    const normalizedItems: OrderFormValues["items"] = selectedResourceIds.map((resourceId) => ({
      resourceId,
      date,
      start: startTime,
      duration,
      peopleCount: requiresCount
        ? (typeof peopleCount === "number" ? peopleCount : Number(peopleCount))
        : null,
      pricingMode
    }));

    await onSubmit({
      customer: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone
      },
      items: normalizedItems,
      payment: {
        method: paymentMethod
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {/* Resource Type Selection */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" gutterBottom>
              🎯 Typ zasobu
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={resourceType}
              onChange={handleResourceTypeChange}
              size="large"
              fullWidth
            >
              {RESOURCE_TYPE_TABS.map((tab) => (
                <ToggleButton key={tab.value} value={tab.value} sx={{ flex: 1 }}>
                  {tab.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {/* Calendar Preview */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" gutterBottom>
              📅 Wybór dnia
            </Typography>
            <CalendarInline
              value={dayjs(date)}
              onChange={(nextDay) => {
                const nextDate = nextDay.format("YYYY-MM-DD");
                setDate(nextDate);
                setStartTime("");
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                availabilityQuery.refetch();
                scheduleQuery.refetch();
              }}
              disabled={availabilityQuery.isLoading || scheduleQuery.isLoading}
              fullWidth
            >
              🔄 Odśwież dane
            </Button>
          </Stack>
        </Paper>

        {/* Interactive Resource Grid */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" color="primary" gutterBottom>
              📊 Planer zasobów
            </Typography>
            {scheduleQuery.isError && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                Nie udało się pobrać planera zasobów.
              </Typography>
            )}
            {scheduleQuery.isLoading || availabilityQuery.isLoading ? (
              <Typography variant="body2">Ładowanie planera...</Typography>
            ) : gridResources.length > 0 ? (
              <>
                <ResourceGrid
                  resources={gridResources}
                  openHour={openHour}
                  closeHour={closeHour}
                  selectedResourceIds={selectedResourceIds}
                  onResourceClick={handleResourceClick}
                  selectedSlots={selectedSlots}
                  onSlotClick={handleSlotClick}
                  selectedDate={date}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  💡 Kliknij w zasób, aby go wybrać, a następnie kliknij w dostępne sloty czasowe, aby automatycznie wypełnić formularz.
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Brak zasobów do wyświetlenia.
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Customer Information */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" color="primary" gutterBottom>
                  👤 Dane klienta
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Imię"
                      fullWidth
                      value={customer.firstName}
                      onChange={(event) =>
                        setCustomer((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Nazwisko"
                      fullWidth
                      value={customer.lastName}
                      onChange={(event) =>
                        setCustomer((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      type="email"
                      label="Email"
                      fullWidth
                      value={customer.email}
                      onChange={(event) =>
                        setCustomer((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                      variant="outlined"
                      error={customer.email.length > 0 && !isEmailValid}
                      helperText={
                        customer.email.length > 0 && !isEmailValid
                          ? "Wprowadź poprawny adres email"
                          : undefined
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Telefon"
                      fullWidth
                      value={customer.phone}
                      onChange={(event) =>
                        setCustomer((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Płatność"
                      fullWidth
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value as "ON_SITE_CASH" | "ON_SITE_CARD")
                      }
                      variant="outlined"
                    >
                      <MenuItem value="ON_SITE_CASH">Gotówka na miejscu</MenuItem>
                      <MenuItem value="ON_SITE_CARD">Karta na miejscu</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            {/* Reservation Details */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📅 Szczegóły rezerwacji
                </Typography>
                
                <ResourceSelector
                  resources={resources}
                  selectedResourceIds={selectedResourceIds}
                  onChange={handleResourceSelectionChange}
                  resourceType={resourceType}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Czas trwania (h)"
                      fullWidth
                      value={duration}
                      onChange={(event) => setDuration(Number(event.target.value))}
                      disabled={resourceType === "QUIZ_ROOM" || durationOptions.length === 0}
                      variant="outlined"
                    >
                      {durationOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt} {opt === 1 ? 'godzina' : opt < 5 ? 'godziny' : 'godzin'}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Godzina startu"
                      fullWidth
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      disabled={selectedResourceIds.length === 0 || selectableTimes.length === 0}
                      variant="outlined"
                      helperText={
                        selectedResourceIds.length === 0
                          ? "Wybierz zasób"
                          : selectableTimes.length === 0
                          ? "Brak wolnych godzin dla wybranych ustawień"
                          : undefined
                      }
                    >
                      {selectableTimes.length === 0 ? (
                        <MenuItem value="">Brak dostępnych godzin</MenuItem>
                      ) : (
                        selectableTimes.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>
                </Grid>
                
                {requiresCount && (
                  <TextField
                    type="number"
                    label={`Liczba osób (1-${maxPeople})`}
                    value={peopleCount}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isNaN(next)) {
                        setPeopleCount("");
                      } else {
                        setPeopleCount(next);
                      }
                    }}
                    inputProps={{ min: 1, max: maxPeople }}
                    fullWidth
                    variant="outlined"
                  />
                )}
                
                {totalAmount > 0 && (
                  <AlertBox label="Przewidywana kwota" value={formatPrice(totalAmount)} />
                )}
              </Stack>
            </Paper>

        {/* Submit Button */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={!canSubmit || submitting}
              sx={{ minWidth: 200 }}
            >
              {submitting ? 'Zapisywanie...' : '💾 Zapisz rezerwację'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

function ResourceSelector({
  resources,
  selectedResourceIds,
  onChange,
  resourceType
}: {
  resources: Resource[];
  selectedResourceIds: number[];
  onChange: (ids: number[]) => void;
  resourceType: ResourceType;
}) {
  if (resources.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Brak zasobów dla wybranego typu i dnia.
        </Typography>
      </Box>
    );
  }

  const allowsMultiple = isMultiResourceType(resourceType);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight="medium">
        {allowsMultiple ? "Wybierz zasoby" : "Wybierz zasób"}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {resources.map((resource) => {
          const selected = selectedResourceIds.includes(resource.id);

          return (
            <Chip
              key={resource.id}
              label={resource.name}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              size="medium"
              onClick={() => {
                if (allowsMultiple) {
                  if (selected) {
                    onChange(selectedResourceIds.filter((id) => id !== resource.id));
                  } else {
                    onChange([...selectedResourceIds, resource.id]);
                  }
                } else {
                  onChange(selected ? [] : [resource.id]);
                }
              }}
              clickable
              sx={{
                '&:hover': {
                  backgroundColor: selected ? 'primary.dark' : 'action.hover',
                }
              }}
            />
          );
        })}
      </Stack>
      {selectedResourceIds.length > 0 && (
        <Typography variant="body2" color="text.secondary">
          Wybrano: {selectedResourceIds.length} {selectedResourceIds.length === 1 ? 'zasób' : 'zasobów'}
        </Typography>
      )}
    </Stack>
  );
}

function computeBaseDurations(
  resourceType: ResourceType,
  selectedResources: Resource[],
  allResources: Resource[],
  pricingOverrides?: Parameters<typeof getAvailableDurations>[1]
): number[] {
  if (selectedResources.length === 0) {
    const fallback = allResources[0];
    if (!fallback) {
      return [1];
    }
    return getAvailableDurations(fallback, pricingOverrides);
  }

  if (isMultiResourceType(resourceType)) {
    return selectedResources
      .map((resource) => getAvailableDurations(resource, pricingOverrides))
      .reduce<number[]>((acc, options, index) => {
        if (index === 0) {
          return options;
        }
        return acc.filter((value) => options.includes(value));
      }, getAvailableDurations(selectedResources[0], pricingOverrides));
  }

  return getAvailableDurations(selectedResources[0], pricingOverrides);
}

function computeAvailableTimes({
  resourceType,
  resources,
  duration,
  slotInterval
}: {
  resourceType: ResourceType;
  resources: Resource[];
  duration: number;
  slotInterval: number;
}): string[] {
  if (resources.length === 0) {
    return [];
  }

  if (isMultiResourceType(resourceType)) {
    const timeSets = resources.map((resource) =>
      new Set(getAvailableStartTimes(resource, duration, slotInterval))
    );

    return timeSets.reduce<string[]>((acc, current, index) => {
      if (index === 0) {
        return Array.from(current);
      }
      return acc.filter((time) => current.has(time));
    }, []);
  }

  return getAvailableStartTimes(resources[0], duration, slotInterval);
}

function AlertBox({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "2px solid",
        borderColor: "success.main",
        backgroundColor: (theme) => alpha(theme.palette.success.light, 0.1),
        px: 3,
        py: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" color="success.main" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  );
}

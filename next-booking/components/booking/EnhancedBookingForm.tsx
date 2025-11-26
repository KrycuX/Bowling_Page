'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Fab from '@mui/material/Fab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import type { Dayjs } from 'dayjs';
import { CalendarInline } from '../../app/(booking)/components/CalendarInline';
import { ResourceGrid } from './ResourceGrid';
import { useAvailability } from '../../hooks/useAvailability';
import { useDaySchedule } from '../../hooks/useDaySchedule';
import { useHoldAndCheckout } from '../../hooks/useHoldAndCheckout';
import { dayjs, WARSAW_TZ } from '../../lib/dayjs';
import type { PricingMode, Resource, ResourceType } from '../../lib/types';
import {
  calculatePrice,
  formatPrice,
  getKaraokeMaxPeople,
  getQuizMaxPeople,
  pricingModeByResourceType
} from '../../lib/pricing';
import { apiClient } from '../../lib/apiClient';
import { z } from 'zod';
import { Turnstile, type TurnstileRef } from '../Turnstile';
import { usePublicSettings } from '../../hooks/usePublicSettings';

type EnhancedBookingFormProps = {
  date: string;
  resourceType: ResourceType;
  title: string;
  description: string;
};

type HoldItemInput = {
  resourceId: number;
  date: string;
  start: string;
  duration: number;
  pricingMode: PricingMode;
  peopleCount?: number;
};

const resourceTypePathMap: Record<ResourceType, string> = {
  BOWLING_LANE: 'kregle',
  BILLIARDS_TABLE: 'bilard',
  QUIZ_ROOM: 'quiz',
  KARAOKE_ROOM: 'karaoke'
};

export function EnhancedBookingForm({ 
  date, 
  resourceType, 
  title, 
  description 
}: EnhancedBookingFormProps) {
  const { data: publicSettings } = usePublicSettings();
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [customer, setCustomer] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '' 
  });
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<null | { amount: number; totalAfter: number }>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'ON_SITE_CASH'>('ONLINE');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [acceptPrzelewy24, setAcceptPrzelewy24] = useState(false);
  const [acceptRodo, setAcceptRodo] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileRef>(null);
  const tokenPromiseRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  
  const acceptAll = paymentMethod === 'ONLINE' 
    ? acceptPrzelewy24 && acceptRodo && acceptMarketing
    : acceptRodo && acceptMarketing;

  const requiresPeopleCount = resourceType === 'QUIZ_ROOM' || resourceType === 'KARAOKE_ROOM';
  const pricingOverrides = useMemo(() => {
    if (!publicSettings) return undefined;
    return {
      priceBowlingPerHour: publicSettings.priceBowlingPerHour,
      priceBilliardsPerHour: publicSettings.priceBilliardsPerHour,
      priceKaraokePerPersonPerHour: publicSettings.priceKaraokePerPersonPerHour,
      priceQuizPerPersonPerSession: publicSettings.priceQuizPerPersonPerSession,
      bowlingMinDurationHours: publicSettings.bowlingMinDurationHours,
      bowlingMaxDurationHours: publicSettings.bowlingMaxDurationHours,
      quizDurationHours: publicSettings.quizDurationHours,
      karaokeMinDurationHours: publicSettings.karaokeMinDurationHours,
      karaokeMaxDurationHours: publicSettings.karaokeMaxDurationHours,
      quizMaxPeople: publicSettings.quizMaxPeople,
      karaokeMaxPeople: publicSettings.karaokeMaxPeople
    };
  }, [publicSettings]);

  const [peopleCountInput, setPeopleCountInput] = useState<string>(requiresPeopleCount ? '1' : '');
  const maxPeople = useMemo(() => {
    if (!requiresPeopleCount) return null;
    return resourceType === 'QUIZ_ROOM'
      ? getQuizMaxPeople(pricingOverrides)
      : getKaraokeMaxPeople(pricingOverrides);
  }, [requiresPeopleCount, resourceType, pricingOverrides]);

  useEffect(() => {
    setPeopleCountInput(requiresPeopleCount ? '1' : '');
  }, [requiresPeopleCount]);

  const parsedPeopleCount = requiresPeopleCount ? Number.parseInt(peopleCountInput, 10) : undefined;

  const hasValidPeopleCount = useMemo(() => {
    if (!requiresPeopleCount) return true;
    if (!peopleCountInput) return false;
    if (Number.isNaN(parsedPeopleCount)) return false;
    if ((parsedPeopleCount ?? 0) < 1) return false;
    if (maxPeople && (parsedPeopleCount ?? 0) > maxPeople) return false;
    return true;
  }, [requiresPeopleCount, parsedPeopleCount, maxPeople, peopleCountInput]);

  const normalizedPeopleCount = hasValidPeopleCount && requiresPeopleCount ? parsedPeopleCount : undefined;

  const summaryRef = useRef<HTMLDivElement>(null);

  const selectedDateString = selectedDate?.format('YYYY-MM-DD') ?? '';

  const { data: availability, isLoading, isError, refetch } = useAvailability({
    date: selectedDateString,
    resourceType
  });

  const {  isLoading: scheduleLoading, refetch: refetchSchedule } = useDaySchedule({
    date: selectedDateString,
    resourceType
  });

  const holdMutation = useHoldAndCheckout();

  const resources = useMemo<Resource[]>(
    () => availability?.resources ?? [],
    [availability]
  );

  useEffect(() => {
    setSelectedResourceIds([]);
    setSelectedSlots(new Set());
    setSelectedDate(dayjs.tz(date, WARSAW_TZ));
  }, [date]);

  // Initialize selectedDate on client side to avoid hydration mismatch
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(dayjs.tz(date, WARSAW_TZ));
    }
  }, [date, selectedDate]);

  // Handle scroll to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (summaryRef.current) {
        const rect = summaryRef.current.getBoundingClientRect();
        // Show button if summary panel is below the viewport
        setShowScrollButton(rect.top > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDateChange = (newDate: Dayjs) => {
    const newDateString = newDate.format('YYYY-MM-DD');
    setSelectedDate(newDate);
    // Update URL without reloading
    const resourceTypePath = resourceTypePathMap[resourceType];
    if (resourceTypePath) {
      window.history.replaceState({}, '', `/${resourceTypePath}?date=${newDateString}`);
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchSchedule();
  };

  const handleResourceClick = (resourceId: number) => {
    setSelectedResourceIds(prev => {
      if (prev.includes(resourceId)) {
        // Deselect resource if clicking the same one
        return prev.filter(id => id !== resourceId);
      } else {
        // Add resource if not already selected (max 4)
        if (prev.length >= 4) {
          return prev; // Keep existing selection if at max
        }
        return [...prev, resourceId];
      }
    });
    // Don't clear slots when clicking resource header
  };

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSlotClick = (resourceId: number, hour: number) => {
    // If clicking on an already selected slot, deselect it
    const isCurrentlySelected = selectedSlots.has(`${resourceId}:${hour}`);
    
    if (isCurrentlySelected) {
      // Remove this specific slot
      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${resourceId}:${hour}`);
        return newSet;
      });
      
      // Remove resource from selection if no slots are selected for it
      setSelectedResourceIds(prev => {
        const remaining = prev.filter(id => {
          if (id === resourceId) {
            // Check if there are any other slots selected for this resource
            const hasOtherSlots = Array.from(selectedSlots).some(slotKey => {
              const [slotResourceId] = slotKey.split(':');
              return parseInt(slotResourceId, 10) === resourceId && slotKey !== `${resourceId}:${hour}`;
            });
            return hasOtherSlots;
          }
          return true;
        });
        return remaining;
      });
    } else {
      // Add this resource to selection if not already there
      setSelectedResourceIds(prev => {
        if (prev.includes(resourceId)) {
          return prev;
        }
        // Add if we have less than 4 resources selected
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, resourceId];
      });
      
      setSelectedSlots(prev => {
        const newSet = new Set(prev);
        
        // Get existing slots for this resource to check continuity
        const existingSlots = Array.from(prev)
          .filter(key => key.startsWith(`${resourceId}:`))
          .map(key => {
            const [, h] = key.split(':');
            return parseInt(h, 10);
          })
          .sort((a, b) => a - b);
        
        // If no existing slots, just add
        if (existingSlots.length === 0) {
          newSet.add(`${resourceId}:${hour}`);
        } else {
          const maxHour = Math.max(...existingSlots);
          const minHour = Math.min(...existingSlots);
          
          // Only add if adjacent to existing selection or if it's a fresh start
          if (hour === maxHour + 1 || hour === minHour - 1) {
            newSet.add(`${resourceId}:${hour}`);
          } else {
            // Not adjacent - clear and start fresh for this resource only
            existingSlots.forEach(h => newSet.delete(`${resourceId}:${h}`));
            newSet.add(`${resourceId}:${hour}`);
          }
        }
        
        return newSet;
      });
    }
  };

  useEffect(() => {
    setSelectedResourceIds((previous) =>
      previous.filter((id) => resources.some((resource) => resource.id === id))
    );
  }, [resources]);

  const selectedResources = useMemo(
    () => resources.filter((resource) => selectedResourceIds.includes(resource.id)),
    [resources, selectedResourceIds]
  );

  // Calculate new grid-based selection
  const gridSelectedResources = useMemo(() => {
    if (selectedResourceIds.length === 0) return [];
    return resources.filter(r => selectedResourceIds.includes(r.id));
  }, [resources, selectedResourceIds]);

  const canSubmitWithoutConsents =
    selectedResourceIds.length > 0 &&
    selectedSlots.size > 0 &&
    customer.firstName &&
    customer.lastName &&
    customer.email &&
    hasValidPeopleCount;
  
  const canSubmit = canSubmitWithoutConsents && (
    (paymentMethod === 'ON_SITE_CASH' && acceptRodo) || 
    (paymentMethod === 'ONLINE' && acceptPrzelewy24 && acceptRodo)
  );
  
  // Calculate total price based on grid selection
  const totalPrice = useMemo(() => {
    if (gridSelectedResources.length === 0 || selectedSlots.size === 0) {
      return 0;
    }

    return gridSelectedResources.reduce((sum, resource) => {
      const resourceHours = Array.from(selectedSlots)
        .filter(slotKey => slotKey.startsWith(`${resource.id}:`))
        .map(slotKey => {
          const [, hourStr] = slotKey.split(':');
          return parseInt(hourStr, 10);
        })
        .sort((a, b) => a - b);
      
      const resourceDuration = resourceHours.length;
      const peopleForResource =
        resource.type === 'QUIZ_ROOM' || resource.type === 'KARAOKE_ROOM'
          ? normalizedPeopleCount ?? 0
          : undefined;
      return sum + calculatePrice(resource, resourceDuration, peopleForResource, pricingOverrides);
    }, 0);
  }, [gridSelectedResources, selectedSlots, normalizedPeopleCount, pricingOverrides]);
  
  const finalPrice = couponApplied ? couponApplied.totalAfter : totalPrice;

  const isGridModeActive = selectedResourceIds.length > 0 && selectedSlots.size > 0;

  const getResourceHours = (resourceId: number) => {
    return Array.from(selectedSlots)
      .filter(slotKey => slotKey.startsWith(`${resourceId}:`))
      .map(slotKey => {
        const [, hourStr] = slotKey.split(':');
        return parseInt(hourStr, 10);
      })
      .sort((a, b) => a - b);
  };

  const buildHoldItems = (): HoldItemInput[] => {
    if (!selectedDateString) {
      return [];
    }

    if (selectedSlots.size === 0) {
      return [];
    }

    return selectedResourceIds
      .map<HoldItemInput | null>((resourceId) => {
        const resource = resources.find((r) => r.id === resourceId);
        if (!resource) {
          return null;
        }

        const peopleForResource =
          (resource.type === 'QUIZ_ROOM' || resource.type === 'KARAOKE_ROOM') && normalizedPeopleCount
            ? normalizedPeopleCount
            : undefined;

        const resourceHours = getResourceHours(resourceId);
        if (resourceHours.length === 0) {
          return null;
        }

        const startHour = resourceHours[0];
        const durationHours = resourceHours.length;
        const startTimeValue = `${String(startHour).padStart(2, '0')}:00`;

        return {
          resourceId,
          date: selectedDateString,
          start: startTimeValue,
          duration: durationHours,
          pricingMode: pricingModeByResourceType[resource.type],
          ...(peopleForResource ? { peopleCount: peopleForResource } : {}),
        };
      })
      .filter((item): item is HoldItemInput => item !== null);
  };

  // Handler for Turnstile token success
  const handleTurnstileSuccess = (token: string) => {
    // If we're waiting for a fresh token (for checkout), resolve the promise
    if (tokenPromiseRef.current) {
      tokenPromiseRef.current.resolve(token);
      tokenPromiseRef.current = null;
    } else {
      // Otherwise, just set the token normally
      setTurnstileToken(token);
    }
  };

  // Handler for Turnstile token error
  const handleTurnstileError = () => {
    // If we're waiting for a fresh token, reject the promise
    if (tokenPromiseRef.current) {
      tokenPromiseRef.current.reject(new Error('Turnstile verification failed'));
      tokenPromiseRef.current = null;
    } else {
      setTurnstileToken(null);
    }
  };

  // Function to get a fresh Turnstile token by resetting and waiting for a new one
  const getFreshTurnstileToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Store the promise resolvers
      tokenPromiseRef.current = { resolve, reject };
      
      // Reset Turnstile to get a new token
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      } else {
        reject(new Error('Turnstile widget not available'));
        tokenPromiseRef.current = null;
      }
      
      // Set a timeout to reject if no token is received within 30 seconds
      setTimeout(() => {
        if (tokenPromiseRef.current) {
          tokenPromiseRef.current.reject(new Error('Turnstile token timeout'));
          tokenPromiseRef.current = null;
        }
      }, 30000);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Zapobiegaj wielokrotnym submittom
    if (isSubmitting || holdMutation.isPending) {
      return;
    }
    
    if (!canSubmit || !turnstileToken) return;

    setIsSubmitting(true); // Ustaw flagę na początku
    try {
      const items = buildHoldItems();
      if (items.length === 0) {
        setIsSubmitting(false);
        return;
      }
      
      await holdMutation.mutateAsync({
        items,
        customer,
        ...(couponApplied && couponCode ? { couponCode } : {}),
        paymentMethod,
        marketingConsent: acceptMarketing,
        turnstileToken,
        // Only provide callback for online payments (which require checkout)
        ...(paymentMethod === 'ONLINE' ? { getFreshTurnstileToken } : {})
      });
      // W przypadku sukcesu nie resetujemy flagi, bo nastąpi przekierowanie
    } catch (error) {
      console.error('Booking failed:', error);
      setIsSubmitting(false); // Reset flagi tylko w przypadku błędu
    }
  };

  async function applyCoupon() {
    if (!customer.email || selectedResourceIds.length === 0) return;
    if (requiresPeopleCount && !hasValidPeopleCount) return;

    if (!isGridModeActive) return;

    const holdItemsForPricing = buildHoldItems();
    if (holdItemsForPricing.length === 0) return;

    const items = holdItemsForPricing
      .map((item) => {
        const resource = resources.find((r) => r.id === item.resourceId);
        if (!resource) {
          return null;
        }

        const peopleForResource =
          resource.type === 'QUIZ_ROOM' || resource.type === 'KARAOKE_ROOM'
            ? item.peopleCount ?? 0
            : undefined;

        return {
          resourceType: resource.type,
          totalAmount: calculatePrice(resource, item.duration, peopleForResource),
        };
      })
      .filter((entry): entry is { resourceType: ResourceType; totalAmount: number } => entry !== null);

    if (items.length === 0) return;
    const schema = z.object({ ok: z.literal(true), totalAfter: z.number().int(), discount: z.object({ amount: z.number().int() }) });
    try {
      const { data } = await apiClient.post('/coupons/validate', {
        code: couponCode,
        email: customer.email,
        items
      });
      const parsed = schema.parse(data);
      setCouponApplied({ amount: parsed.discount.amount, totalAfter: parsed.totalAfter });
    } catch (error: unknown) {
      console.error('Coupon validation failed:', error);
      // You could add a toast notification here to show the error to the user
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Błąd walidacji kuponu'
        : 'Błąd walidacji kuponu';
      alert(errorMessage);
    }
  }

  // Don't render until selectedDate is initialized to avoid hydration mismatch
  if (!selectedDate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#8B5CF6' }} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {/* Header */}
        <Stack spacing={2} textAlign="center">
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ color: '#B8BCC8', fontWeight: 400 }}>
            {description}
          </Typography>
        </Stack>

        {/* Main Layout */}
        <Stack spacing={4}>
          {isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Nie udało się pobrać dostępności. Spróbuj ponownie.
            </Alert>
          )}

          {/* Calendar and Resource Grid - Side by side on desktop, stacked on mobile */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 3 }}
            sx={{ width: '100%', alignItems: 'stretch' }}
          >
            {/* Calendar */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: '#1A1A2E', 
              border: '1px solid #2D2D44',
              width: { xs: '100%', md: '40%' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                  📅 Wybierz datę
                </Typography>
                <CalendarInline value={selectedDate} onChange={handleDateChange} />
                <Button
                  variant="outlined"
                  onClick={handleRefresh}
                  disabled={isLoading || scheduleLoading}
                  fullWidth
                  sx={{ 
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderColor: '#A78BFA',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  🔄 Odśwież podgląd
                </Button>
              </Stack>
            </Paper>

            {/* Resource Grid */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: '#1A1A2E', 
              border: '1px solid #2D2D44',
              width: { xs: '100%', md: '58%' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                  🎯 Wybierz tor i czas
                </Typography>
                {isLoading ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress sx={{ color: '#8B5CF6' }} />
                    <Typography variant="body2" sx={{ color: '#B8BCC8', mt: 2 }}>
                      Ładowanie zasobów...
                    </Typography>
                  </Stack>
                ) : (
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ResourceGrid
                      resources={resources}
                      openHour={availability?.openHour ?? 10}
                      closeHour={availability?.closeHour ?? 22}
                      selectedResourceIds={selectedResourceIds}
                      onResourceClick={handleResourceClick}
                      selectedSlots={selectedSlots}
                      onSlotClick={handleSlotClick}
                      selectedDate={selectedDateString}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>

          {/* Bottom Row - Customer Information and Submit */}
          <Box sx={{ width: '100%' }}>
            <Stack spacing={4} ref={summaryRef}>
            {/* Customer Information */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: '#1A1A2E', 
              border: '1px solid #2D2D44',
              width: '100%',
              boxSizing: 'border-box'
            }}>
                <Stack spacing={3}>
                  <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                    📝 Dane kontaktowe
                  </Typography>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <TextField
                      label="Imię"
                      fullWidth
                      value={customer.firstName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#2D2D44',
                          '& fieldset': { borderColor: '#4A4A6A' }
                        }
                      }}
                    />
                    <TextField
                      label="Nazwisko"
                      fullWidth
                      value={customer.lastName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#2D2D44',
                          '& fieldset': { borderColor: '#4A4A6A' }
                        }
                      }}
                    />
                  </Stack>
                  <TextField
                    type="email"
                    label="Email"
                    fullWidth
                    value={customer.email}
                    onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    required
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#2D2D44',
                        '& fieldset': { borderColor: '#4A4A6A' }
                      }
                    }}
                  />
                  <TextField
                    label="Telefon"
                    fullWidth
                    value={customer.phone}
                    onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#2D2D44',
                        '& fieldset': { borderColor: '#4A4A6A' }
                      }
                    }}
                  />
                </Stack>
            </Paper>

            {/* Coupon + Submit */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: '#1A1A2E', 
              border: '1px solid #2D2D44', 
              width: '100%'
            }}>
                <Stack spacing={2} sx={{ height: '100%' }}>

                  {requiresPeopleCount && (
                    <Stack spacing={1}>
                      <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                        👥 Liczba osób
                      </Typography>
                      <TextField
                        type="number"
                        label="Liczba osób"
                        value={peopleCountInput}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setPeopleCountInput(value);
                        }}
                        required
                        error={!hasValidPeopleCount}
                        helperText={
                          !hasValidPeopleCount
                            ? maxPeople
                              ? `Podaj liczbę od 1 do ${maxPeople}`
                              : 'Podaj liczbę większą od zera'
                            : maxPeople
                              ? `Maksymalnie ${maxPeople} osób`
                              : undefined
                        }
                        inputProps={{ min: 1, max: maxPeople ?? undefined }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#2D2D44',
                            '& fieldset': { borderColor: '#4A4A6A' }
                          }
                        }}
                      />
                    </Stack>
                  )}

                  {/* Price Summary */}
                  {(selectedResources.length > 0 || (selectedResourceIds.length > 0 && selectedSlots.size > 0)) && (
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#2D2D44', border: '1px solid #4A4A6A' }}>
                      <Stack spacing={1}>
                        <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                          💰 Podsumowanie
                        </Typography>
                        {requiresPeopleCount && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Liczba osób:
                            </Typography>
                            <Typography variant="body2">
                              {hasValidPeopleCount && normalizedPeopleCount != null ? normalizedPeopleCount : 'N/A'}
                            </Typography>
                          </Stack>
                        )}
                        {gridSelectedResources.length > 0 && selectedSlots.size > 0 && (
                          <>
                            {gridSelectedResources.map(resource => {
                              const resourceHours = Array.from(selectedSlots)
                                .filter(slotKey => slotKey.startsWith(`${resource.id}:`))
                                .map(slotKey => {
                                  const [, hourStr] = slotKey.split(':');
                                  return parseInt(hourStr, 10);
                                })
                                .sort((a, b) => a - b);
                              
                              const resourceDuration = resourceHours.length;
                              
                              return (
                                <Stack key={resource.id} direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    {resource.name}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {resourceDuration} {resourceDuration === 1 ? 'godzina' : 'godziny'}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </>
                        )}
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Cena podstawowa:
                          </Typography>
                          <Typography variant="body2">
                            {formatPrice(totalPrice)}
                          </Typography>
                        </Stack>
                        {couponApplied && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Rabat:
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              -{formatPrice(couponApplied.amount)}
                            </Typography>
                          </Stack>
                        )}
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                            Do zapłaty:
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                            {formatPrice(finalPrice)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  )}
                                    <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                    🎫 Kod rabatowy
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Kod rabatowy"
                      fullWidth
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!couponApplied}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#2D2D44',
                          '& fieldset': { borderColor: '#4A4A6A' }
                        }
                      }}
                    />
                    {!couponApplied ? (
                      <Button
                        variant="outlined"
                        onClick={applyCoupon}
                        disabled={!couponCode || !customer.email || (requiresPeopleCount && !hasValidPeopleCount)}
                      >
                        Zastosuj
                      </Button>
                    ) : (
                      <Button variant="text" onClick={() => { setCouponApplied(null); setCouponCode(''); }}>
                        Usuń
                      </Button>
                    )}
                  </Stack>
                  {couponApplied && (
                    <Alert severity="success">Zastosowano rabat: -{(couponApplied.amount / 100).toFixed(2)} zł</Alert>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                      💳 Metoda płatności
                    </Typography>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => {
                        const newMethod = e.target.value as 'ONLINE' | 'ON_SITE_CASH';
                        setPaymentMethod(newMethod);
                        if (newMethod === 'ON_SITE_CASH') {
                          setAcceptPrzelewy24(false);
                        }
                      }}
                    >
                      <FormControlLabel value="ONLINE" control={<Radio />} label="Przelewem (online)" />
                      <FormControlLabel value="ON_SITE_CASH" control={<Radio />} label="Na miejscu" />
                    </RadioGroup>
                    
                    {(paymentMethod === 'ONLINE' || paymentMethod === 'ON_SITE_CASH') && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                          ✅ Zgody
                        </Typography>
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={acceptAll}
                              indeterminate={
                                paymentMethod === 'ONLINE' 
                                  ? acceptPrzelewy24 && acceptRodo && !acceptMarketing
                                  : acceptRodo && !acceptMarketing
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                if (paymentMethod === 'ONLINE') {
                                  setAcceptPrzelewy24(checked);
                                }
                                setAcceptRodo(checked);
                                setAcceptMarketing(checked);
                              }}
                              sx={{
                                color: '#8B5CF6',
                                '&.Mui-checked': {
                                  color: '#8B5CF6',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Zaznacz wszystko
                            </Typography>
                          }
                        />
                        
                        <Divider sx={{ my: 1 }} />
                        
                        {paymentMethod === 'ONLINE' && (
                          <FormControl required error={paymentMethod === 'ONLINE' && !acceptPrzelewy24}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={acceptPrzelewy24}
                                  onChange={(e) => {
                                    setAcceptPrzelewy24(e.target.checked);
                                  }}
                                  required
                                  sx={{
                                    color: '#8B5CF6',
                                    '&.Mui-checked': {
                                      color: '#8B5CF6',
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  Oświadczam, że zapoznałem się z{' '}
                                  <Link
                                    href="https://www.przelewy24.pl/regulamin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="always"
                                    sx={{ color: '#8B5CF6' }}
                                  >
                                    regulaminem
                                  </Link>
                                  {' '}i{' '}
                                  <Link
                                    href="https://www.przelewy24.pl/obowiazek-informacyjny-rodo-platnicy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="always"
                                    sx={{ color: '#8B5CF6' }}
                                  >
                                    obowiązkiem informacyjnym
                                  </Link>
                                  {' '}serwisu Przelewy24.
                                </Typography>
                              }
                            />
                            {paymentMethod === 'ONLINE' && !acceptPrzelewy24 && (
                              <FormHelperText>To pole jest wymagane</FormHelperText>
                            )}
                          </FormControl>
                        )}
                        
                        <FormControl required error={!acceptRodo}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={acceptRodo}
                                onChange={(e) => {
                                  setAcceptRodo(e.target.checked);
                                }}
                                required
                                sx={{
                                  color: '#8B5CF6',
                                  '&.Mui-checked': {
                                    color: '#8B5CF6',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO
                              </Typography>
                            }
                          />
                          {!acceptRodo && (
                            <FormHelperText>To pole jest wymagane</FormHelperText>
                          )}
                        </FormControl>
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={acceptMarketing}
                              onChange={(e) => {
                                setAcceptMarketing(e.target.checked);
                              }}
                              sx={{
                                color: '#8B5CF6',
                                '&.Mui-checked': {
                                  color: '#8B5CF6',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Wyrażam zgodę na kontakt marketingowy (newsletter, promocje) - opcjonalnie
                            </Typography>
                          }
                        />
                      </>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                        onSuccess={handleTurnstileSuccess}
                        onError={handleTurnstileError}
                        mode="managed"
                        theme="auto"
                      />
                    </Box>
                    <Stack justifyContent="center" alignItems="center">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    disabled={!canSubmit || holdMutation.isPending || isSubmitting || !turnstileToken}
                    fullWidth
                    sx={{ 
                      backgroundColor: '#8B5CF6',
                      '&:hover': { backgroundColor: '#7C3AED' },
                      height: 60,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    {holdMutation.isPending || isSubmitting ? 'Rezerwowanie...' : '🎯 Zarezerwuj'}
                  </Button>
                    </Stack>
                  </Stack>
                </Stack>
            </Paper>
          </Stack>
            </Box>
        </Stack>
      </Stack>

      {/* Sticky summary panel */}
      {showScrollButton && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            backgroundColor: '#1A1A2E',
            borderTop: '1px solid #2D2D44',
            zIndex: 1000
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            {(selectedResources.length > 0 || (selectedResourceIds.length > 0 && selectedSlots.size > 0)) && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#B8BCC8' }}>
                    Do zapłaty:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                    {formatPrice(finalPrice)}
                  </Typography>
                </Stack>
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || holdMutation.isPending || isSubmitting || !turnstileToken}
              sx={{
                backgroundColor: '#8B5CF6',
                '&:hover': { backgroundColor: '#7C3AED' },
                minWidth: 200,
                height: 48,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {holdMutation.isPending || isSubmitting ? 'Rezerwowanie...' : '🎯 Zarezerwuj'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Floating scroll button */}
      {showScrollButton && (
        <Fab
          color="primary"
          aria-label="scroll to summary"
          onClick={scrollToSummary}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            backgroundColor: '#8B5CF6',
            '&:hover': {
              backgroundColor: '#7C3AED'
            },
            zIndex: 1001
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      )}
    </Box>
  );
}

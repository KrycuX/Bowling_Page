import { lazy } from 'react';

// Lazy load heavy components
export const LazyDataGrid = lazy(() => import('@mui/x-data-grid').then(module => ({ default: module.DataGrid })));
export const LazyDatePicker = lazy(() => import('@mui/x-date-pickers').then(module => ({ default: module.DatePicker })));
export const LazyTimePicker = lazy(() => import('@mui/x-date-pickers').then(module => ({ default: module.TimePicker })));

// Lazy load custom components
export const LazyAvailabilityPlanner = lazy(() => import('./AvailabilityPlanner').then(module => ({ default: module.AvailabilityPlanner })));
export const LazyEnhancedBookingForm = lazy(() => import('./booking/EnhancedBookingForm').then(module => ({ default: module.EnhancedBookingForm })));


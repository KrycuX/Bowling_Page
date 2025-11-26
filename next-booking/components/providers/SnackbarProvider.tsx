'use client';

import { SnackbarProvider as NotistackProvider } from 'notistack';

type Props = {
  children: React.ReactNode;
};

export function SnackbarProvider({ children }: Props) {
  return (
    <NotistackProvider
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={4000}
      maxSnack={3}
    >
      {children}
    </NotistackProvider>
  );
}

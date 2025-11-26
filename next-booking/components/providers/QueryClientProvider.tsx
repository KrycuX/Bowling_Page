'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

type Props = {
  children: React.ReactNode;
};

export function ReactQueryProvider({ children }: Props) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2, // Zwiększono liczbę retry
            staleTime: 5 * 60 * 1000, // 5 minut - zoptymalizowane cache'owanie
            gcTime: 10 * 60 * 1000, // 10 minut - dłuższe przechowywanie w pamięci
            refetchOnMount: false,
            refetchOnReconnect: true, // Włączono refetch przy reconnect
            refetchInterval: false,
            // Dodatkowe optymalizacje
            networkMode: 'online',
            refetchIntervalInBackground: false,
          },
          mutations: {
            retry: 1,
            networkMode: 'online',
          }
        }
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

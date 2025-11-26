import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Roboto } from 'next/font/google';

import './globals.css';
import { ReactQueryProvider } from '../components/providers/QueryClientProvider';
import { SnackbarProvider } from '../components/providers/SnackbarProvider';
import { ThemeRegistry } from '../components/providers/ThemeRegistry';
import { DemoBanner } from '../components/DemoBanner';
import { CMPConsentBridge } from '../components/CMPConsentBridge';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Rezerwacje | Bowling & Quiz',
  description: 'Rezerwuj tor do kregli lub pokoj quizowy online.',
  alternates: {
    canonical: '/rezerwacje'
  }
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';

  return (
    <html lang="pl" className={roboto.className}>
      <head>
        {/* Consent Mode v2 - Default Denied (must be before GTM/GA) */}
        <Script
          id="consent-mode-v2"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
      </head>
      <body>
        <ThemeRegistry>
          <ReactQueryProvider>
            <SnackbarProvider>
              <CMPConsentBridge />
              <DemoBanner />
              <div className="main-container">
                {children}
              </div>
            </SnackbarProvider>
          </ReactQueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import "./animations.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "BowlingHub - Nowoczesne centrum rozrywki",
  description: "BowlingHub - przykładowy projekt prezentacyjny centrum rozrywki (kręgle, bilard, karaoke, quiz).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || "";

  return (
    <html lang="pl" className="w-full h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
      <body
        className={`${montserrat.variable} ${roboto.variable} antialiased w-full min-h-screen flex flex-col`}
      >
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

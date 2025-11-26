# TheAlley2B Landing Page

Landing page dla TheAlley2B - Premium Entertainment Hub.

## URL Produkcyjny
- **Strona główna**: `https://thealley2b.pl`
- **WWW**: `https://www.thealley2b.pl`

## Funkcjonalności

- 🎳 Prezentacja aktywności (kegle, bilard, karaoke, quiz)
- 📧 Formularz kontaktowy
- 📰 Newsletter
- 🖼️ Galeria
- 📄 Informacje o lokalizacji, menu, promocjach

## Technologie

- **Next.js 14+** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

## Konfiguracja

### Zmienne środowiskowe (.env.local)

Skopiuj `env.local.example` do `.env.local` i uzupełnij:

```bash
NEXT_PUBLIC_BOOKING_API_URL=https://api.thealley2b.pl
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

Zobacz `ops/turnstile/README.md` dla instrukcji jak uzyskać klucze Turnstile.

## Bezpieczeństwo

- **Consent Mode v2** - Google Consent Mode z domyślnym "denied"
- **CSP Headers** - Content Security Policy z nonce
- **Turnstile** - Cloudflare Turnstile w formularzach kontaktowych/newsletter
- **Security Headers** - HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options

### CookieYes i GTM/GA

**Ważne:** CookieYes snippet musi być wklejony ręcznie w `<head>` przed GTM/GA.

1. Otwórz `app/layout.tsx`
2. W sekcji `<head>`, **PRZED** skryptem Consent Mode v2, wklej snippet CookieYes:
```tsx
<head>
  {/* CookieYes snippet - wklej tutaj */}
  <script id="cookieyes" type="text/javascript" src="..."></script>
  
  {/* Consent Mode v2 - Default Denied (już istnieje) */}
  <Script id="consent-mode-v2" ... />
</head>
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

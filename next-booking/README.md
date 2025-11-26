# Next.js Booking Frontend

Frontend aplikacja dla systemu rezerwacji The Alley 2b.

## URL Produkcyjny
- **Frontend**: `https://thealley2b.pl/rezerwacje`
- **API**: `https://thealley2b.pl/api`

## Funkcjonalności

- 🎳 Rezerwacje kręgli
- 🎤 Rezerwacje karaoke  
- 🎯 Rezerwacje quizów
- 🎱 Rezerwacje bilardu
- 👥 Panel administracyjny
- 🎫 System kuponów
- 📱 Responsywny design

## Technologie

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Material-UI (MUI)**
- **TanStack Query**
- **Axios**

## Instalacja

```bash
# Instalacja zależności
npm install

# Konfiguracja środowiska
cp env.production.example .env.local
# Edytuj .env.local z właściwymi danymi

# Build aplikacji
npm run build

# Uruchomienie
npm start
```

## Skrypty

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Testy
npm test
npm run test:unit

# Linting
npm run lint
```

## Konfiguracja Produkcyjna

### Zmienne środowiskowe (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://thealley2b.pl/api

# Pricing Configuration (in grosze/100 PLN)
# These should match the values in booking-api/.env
NEXT_PUBLIC_PRICE_BOWLING_PER_HOUR=12000
NEXT_PUBLIC_PRICE_QUIZ_PER_PERSON_PER_SESSION=5000
NEXT_PUBLIC_PRICE_KARAOKE_PER_PERSON_PER_HOUR=4000
NEXT_PUBLIC_PRICE_BILLIARDS_PER_HOUR=5000

# Duration Limits (in hours)
NEXT_PUBLIC_BOWLING_MIN_DURATION_HOURS=1
NEXT_PUBLIC_BOWLING_MAX_DURATION_HOURS=3
NEXT_PUBLIC_QUIZ_DURATION_HOURS=1
NEXT_PUBLIC_QUIZ_MAX_PEOPLE=8
NEXT_PUBLIC_KARAOKE_MIN_DURATION_HOURS=1
NEXT_PUBLIC_KARAOKE_MAX_DURATION_HOURS=4
NEXT_PUBLIC_KARAOKE_MAX_PEOPLE=10

# Security Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
API_BASE_URL=https://api.thealley2b.pl
```

## Deployment

### Apache + Passenger

```apache
<VirtualHost *:443>
    ServerName thealley2b.pl
    DocumentRoot /var/www/next-booking
    
    <Directory /var/www/next-booking>
        AllowOverride All
        Options -MultiViews
        Require all granted
    </Directory>
    
    PassengerAppRoot /var/www/next-booking
    PassengerAppType node
    PassengerStartupFile server.js
    PassengerNodejs /usr/bin/node
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
</VirtualHost>
```

### Systemd Service

```ini
[Unit]
Description=Next.js Booking Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/next-booking
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Struktura Aplikacji

### Strony
- `/` - Strona główna
- `/rezerwacje` - Formularz rezerwacji
- `/bilard` - Rezerwacje bilardu
- `/karaoke` - Rezerwacje karaoke
- `/kregle` - Rezerwacje kręgli
- `/quiz` - Rezerwacje quizów
- `/panel` - Panel administracyjny

### Komponenty
- `components/booking/` - Komponenty rezerwacji
- `components/panel/` - Komponenty panelu admin
- `components/providers/` - Context providers

### Hooks
- `hooks/useAvailability.ts` - Hook dostępności
- `hooks/useHoldAndCheckout.ts` - Hook rezerwacji
- `hooks/panel/` - Hooks panelu admin

### Lib
- `lib/apiClient.ts` - Klient API
- `lib/availability.ts` - Logika dostępności
- `lib/pricing.ts` - Logika cenowa
- `lib/types.ts` - Definicje TypeScript

## API Integration

Aplikacja komunikuje się z backend API przez:

```typescript
// lib/apiClient.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});
```

### Endpointy używane przez frontend:

- `GET /api/availability` - Sprawdź dostępność
- `POST /api/hold` - Zablokuj termin
- `POST /api/checkout` - Finalizuj rezerwację
- `GET /api/schedule` - Harmonogram
- `POST /api/admin/auth/login` - Logowanie admin
- `GET /api/admin/orders` - Lista zamówień

## Styling

Aplikacja używa **Material-UI (MUI)** z custom theme:

```typescript
// lib/theme.ts
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## Testy

```bash
# Wszystkie testy
npm test

# Testy jednostkowe
npm run test:unit

# Testy E2E (Playwright)
npm run test:e2e
```

## Monitoring

### Logi
- Next.js używa wbudowanego systemu logowania
- Logi są dostępne w konsoli serwera

### Performance
- **Next.js Image Optimization** - automatyczna optymalizacja obrazów
- **Code Splitting** - automatyczne dzielenie kodu
- **Static Generation** - statyczne generowanie stron

## Bezpieczeństwo

### Implementowane zabezpieczenia

- **Consent Mode v2** - Google Consent Mode z domyślnym "denied" dla analytics i ads
- **CSP Headers** - Content Security Policy z nonce dla skryptów
- **Turnstile** - Cloudflare Turnstile dla ochrony formularzy (login, booking, contact)
- **Rate Limiting** - throttling POST /api/* (20/min/IP) w middleware
- **Bot Filtering** - blokowanie prostych botów (curl, python-requests, scrapy)
- **Security Headers** - HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options
- **CSRF Protection** - ochrona przed CSRF
- **Input Validation** - walidacja danych wejściowych

### Konfiguracja CookieYes i GTM/GA

**Ważne:** CookieYes snippet musi być wklejony ręcznie w `<head>` przed jakimkolwiek skryptem GTM/GA.

1. **Zaloguj się do CookieYes Dashboard** i skopiuj snippet TCF 2.2 + Consent Mode v2
2. **Otwórz** `app/layout.tsx`
3. **Wklej snippet CookieYes** w sekcji `<head>`, **PRZED** skryptem Consent Mode v2 (który już jest w kodzie):

```tsx
<head>
  {/* CookieYes snippet - wklej tutaj */}
  <script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/..."></script>
  
  {/* Consent Mode v2 - Default Denied (już istnieje) */}
  <Script id="consent-mode-v2" ... />
</head>
```

4. **Dodaj GTM/GA** po Consent Mode v2:

```tsx
{/* GTM/GA - dodaj po Consent Mode v2 */}
<Script
  src="https://www.googletagmanager.com/gtag/js?id=YOUR_GTM_ID"
  strategy="afterInteractive"
/>
<Script id="gtag-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'YOUR_GA_ID');
  `}
</Script>
```

**CMPConsentBridge** (`components/CMPConsentBridge.tsx`) automatycznie mapuje zgodę CookieYes do Consent Mode v2:
- `analytics` → `analytics_storage`
- `marketing` → `ad_storage`, `ad_user_data`, `ad_personalization`

### Troubleshooting CSP

**Błędy CSP w konsoli:**

Jeśli widzisz błędy CSP dotyczące skryptów CookieYes/GTM/GA:

1. **Sprawdź nonce w CSP header** - powinien być w `script-src`
2. **Dodaj źródła do CSP** w `middleware.ts`:
   - Jeśli CookieYes używa własnej domeny, dodaj do `script-src`: `https://cdn-cookieyes.com`
   - Jeśli GTM wymaga dodatkowych źródeł, dodaj do odpowiednich dyrektyw

**Przykład rozszerzenia CSP:**

```typescript
// W middleware.ts, zaktualizuj CSP:
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com`,
  "connect-src 'self' https://www.google-analytics.com https://api.thealley2b.pl",
  // ...
].join('; ');
```

**Sprawdzanie nagłówków:**

Użyj narzędzi deweloperskich przeglądarki (Network tab) aby sprawdzić:
- `Content-Security-Policy` header
- `x-nonce` header (dla debugowania)
- Konsola przeglądarki pod kątem błędów CSP

### Turnstile

Komponent `Turnstile` (`components/Turnstile.tsx`) jest gotowy do użycia w formularzach.
Ustaw `NEXT_PUBLIC_TURNSTILE_SITE_KEY` w `.env.local`.

**Przykład użycia:**

```tsx
import { Turnstile } from '@/components/Turnstile';

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
  onSuccess={(token) => {
    // Wysyłaj token w headerze CF-Turnstile-Response do API
  }}
  onError={() => {
    // Obsługa błędu
  }}
/>
```

## Struktura Projektu

```
next-booking/
├── app/                    # App Router (Next.js 14)
│   ├── (booking)/         # Grupa tras rezerwacji
│   ├── bilard/            # Strona bilardu
│   ├── karaoke/           # Strona karaoke
│   ├── kregle/            # Strona kręgli
│   ├── quiz/              # Strona quizów
│   ├── rezerwacje/        # Główna strona rezerwacji
│   ├── panel/             # Panel administracyjny
│   ├── layout.tsx         # Layout główny
│   └── page.tsx           # Strona główna
├── components/             # Komponenty React
│   ├── booking/           # Komponenty rezerwacji
│   ├── panel/             # Komponenty panelu
│   └── providers/         # Context providers
├── hooks/                  # Custom hooks
├── lib/                    # Biblioteki i utilities
├── public/                 # Statyczne pliki
└── tests/                  # Testy
```

## Wsparcie

W przypadku problemów sprawdź:
1. Logi aplikacji
2. Konfigurację zmiennych środowiskowych
3. Połączenie z API
4. Certyfikaty SSL
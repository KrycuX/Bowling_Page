# Cloudflare Turnstile - Konfiguracja

## Przegląd

Cloudflare Turnstile to bezpłatna alternatywa dla reCAPTCHA, która chroni formularze przed botami i spamem.

## Jak uzyskać klucze Turnstile

### 1. Utwórz konto Cloudflare (jeśli nie masz)

Przejdź do [cloudflare.com](https://cloudflare.com) i utwórz konto.

### 2. Utwórz Turnstile Site

1. Zaloguj się do **Cloudflare Dashboard**
2. Przejdź do **Security** → **Turnstile**
3. Kliknij **Add Site**
4. Wypełnij formularz:
   - **Site name**: np. "TheAlley2B Landing"
   - **Domain**: `thealley2b.pl` (możesz dodać też `www.thealley2b.pl` i `rezerwacje.thealley2b.pl`)
   - **Widget mode**: Wybierz "Managed" (dla widocznej CAPTCHA) lub "Invisible" (dla niewidocznej)
5. Kliknij **Create**
6. Skopiuj **Site Key** (klucz publiczny) i **Secret Key** (klucz prywatny)

### 3. Skonfiguruj zmienne środowiskowe

#### booking-api (.env)

```bash
TURNSTILE_SECRET_KEY=your_secret_key_here
```

#### next-booking (.env.local)

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
```

#### thealley2b-landing (.env.local)

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here  # Tylko jeśli używasz serwerowej weryfikacji w API routes
```

**Uwaga:** `NEXT_PUBLIC_*` zmienne są dostępne po stronie klienta. **NIE** umieszczaj Secret Key w zmiennych `NEXT_PUBLIC_*`!

## Testowanie

### Testowanie lokalnie

1. Ustaw klucze w `.env.local`
2. Uruchom aplikację: `npm run dev`
3. Sprawdź formularz - powinien wyświetlić się widget Turnstile
4. Wypełnij formularz i wyślij - powinno działać

### Testowanie weryfikacji

```bash
# Test bez tokenu - powinno zwrócić 403
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Test z nieprawidłowym tokenem - powinno zwrócić 403
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "CF-Turnstile-Response: invalid-token" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

## Troubleshooting CSP

### Błędy CSP dotyczące Turnstile

Jeśli widzisz błędy w konsoli przeglądarki typu:

```
Refused to load the script 'https://challenges.cloudflare.com/turnstile/v0/api.js'
because it violates the Content-Security-Policy directive: "script-src ..."
```

**Rozwiązanie:**

Sprawdź `middleware.ts` - CSP powinien zawierać:
```
script-src 'self' 'nonce-{NONCE}' https://challenges.cloudflare.com ...
frame-src https://challenges.cloudflare.com
```

### Błędy CSP dotyczące CookieYes/GTM/GA

Jeśli CookieYes, GTM lub GA nie działają:

1. **Sprawdź CSP w middleware.ts** - powinien zawierać odpowiednie źródła:
   ```typescript
   script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com
   ```

2. **Sprawdź konsolę przeglądarki** - zobacz dokładny błąd CSP

3. **Dodaj brakujące źródła** do odpowiednich dyrektyw CSP:
   - `script-src` - dla skryptów
   - `connect-src` - dla żądań API (np. Google Analytics)
   - `frame-src` - dla iframe'ów (np. CookieYes widget)
   - `img-src` - dla obrazów (np. tracking pixels)

### Typowe źródła do dodania do CSP

**CookieYes:**
```
script-src: https://cdn-cookieyes.com
frame-src: https://cdn-cookieyes.com
```

**Google Tag Manager:**
```
script-src: https://www.googletagmanager.com
connect-src: https://www.googletagmanager.com https://www.google-analytics.com
```

**Google Analytics:**
```
script-src: https://www.google-analytics.com
connect-src: https://www.google-analytics.com
img-src: https://www.google-analytics.com
```

### Przykład pełnego CSP (middleware.ts)

```typescript
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com`,
  "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://api.thealley2b.pl",
  "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "frame-src https://challenges.cloudflare.com https://cdn-cookieyes.com",
  "frame-ancestors 'none'",
].join('; ');
```

### Sprawdzanie nonce

Nonce jest generowany per-request w middleware i przekazywany przez nagłówek `x-nonce`. 

**Debugowanie:**
1. Otwórz DevTools → Network
2. Sprawdź odpowiedź HTML
3. W nagłówkach odpowiedzi sprawdź `Content-Security-Policy` - powinien zawierać `'nonce-...'`
4. W HTML sprawdź `<script nonce="...">` - nonce powinien się zgadzać

## Bezpieczeństwo

- **Nigdy nie umieszczaj Secret Key** w kodzie klienta (`NEXT_PUBLIC_*`)
- **Secret Key** tylko po stronie serwera (API routes, backend)
- **Site Key** może być publiczny (jest używany w kodzie klienta)
- Regularnie rotuj klucze w przypadku kompromitacji

## Zasoby

- [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)


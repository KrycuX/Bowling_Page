# Booking API

Backend API dla systemu rezerwacji BowlingHub (projekt demo do portfolio).

## Przykładowe URL-e produkcyjne
- **API**: `https://api.bowlinghub.pl`
- **Frontend**: `https://rezerwacje.bowlinghub.pl`

## Funkcjonalności

- 🎳 Rezerwacje kręgli
- 🎤 Rezerwacje karaoke  
- 🎯 Rezerwacje quizów
- 🎱 Rezerwacje bilardu
- 💳 Integracja z Przelewy24
- 👥 Panel administracyjny
- 🎫 System kuponów

## Technologie

- **Node.js** + **Express.js**
- **Prisma** + **MySQL**
- **TypeScript**
- **Zod** (walidacja)
- **Argon2** (hashowanie haseł)

## Instalacja

```bash
# Instalacja zależności
npm install

# Konfiguracja bazy danych
cp env.production.example .env
# Edytuj .env z właściwymi danymi

# Migracje bazy danych
npm run prisma:deploy
npm run prisma:seed

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
npm run test:api
npm run test:e2e

# Baza danych
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed

# Cleanup
npm run cleanup:holds
npm run cleanup:pending
```

## Konfiguracja Produkcyjna

### Zmienne środowiskowe (.env)

```bash
# Podstawowe
NODE_ENV=production
APP_PORT=4000
APP_HOST=0.0.0.0
APP_URL=https://api.bowlinghub.pl
ALLOWED_ORIGINS=https://rezerwacje.bowlinghub.pl

# Baza danych
DATABASE_URL=mysql://user:password@localhost:3306/reservation_system

# Czas i godziny otwarcia
TIMEZONE=Europe/Warsaw
OPEN_HOUR=10
CLOSE_HOUR=22

# Konfiguracja holdów
HOLD_DURATION_MINUTES=30

# Cennik (w groszach/100 PLN)
PRICE_BOWLING_PER_HOUR=12000
PRICE_QUIZ_PER_PERSON_PER_SESSION=5000
PRICE_KARAOKE_PER_PERSON_PER_HOUR=4000
PRICE_BILLIARDS_PER_HOUR=5000

# Zasoby
BILLIARDS_TABLES_COUNT=4

# Limity czasowe (w godzinach)
BOWLING_MIN_DURATION_HOURS=1
BOWLING_MAX_DURATION_HOURS=3
QUIZ_DURATION_HOURS=1
QUIZ_MAX_PEOPLE=8
KARAOKE_MIN_DURATION_HOURS=1
KARAOKE_MAX_DURATION_HOURS=4
KARAOKE_MAX_PEOPLE=10

# Konfiguracja slotów
SLOT_INTERVAL_MINUTES=60

# Autentykacja
AUTH_SESSION_TTL_HOURS=12
AUTH_CSRF_REQUIRED=true

# Przelewy24
P24_MERCHANT_ID=your_merchant_id
P24_POS_ID=your_pos_id
P24_CRC=your_crc_key
P24_API_KEY=your_api_key
P24_MODE=production
P24_RETURN_URL=https://rezerwacje.bowlinghub.pl/rezerwacje/powrot
P24_STATUS_URL=https://api.bowlinghub.pl/payments/p24/webhook
```

## Deployment

### Apache + Passenger

```apache
<VirtualHost *:443>
    ServerName bowlinghub.pl
    DocumentRoot /var/www/booking-api/public
    
    <Directory /var/www/booking-api/public>
        AllowOverride All
        Options -MultiViews
        Require all granted
    </Directory>
    
    PassengerAppRoot /var/www/booking-api
    PassengerAppType node
    PassengerStartupFile dist/server.js
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
Description=Booking API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/booking-api
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## API Endpoints

### Dostępność
- `GET /api/availability` - Sprawdź dostępność
- `GET /api/availability/grid` - Siatka dostępności

### Rezerwacje
- `POST /api/hold` - Zablokuj termin
- `POST /api/checkout` - Finalizuj rezerwację
- `GET /api/schedule` - Harmonogram

### Płatności
- `POST /api/payments/p24/create` - Utwórz płatność P24
- `POST /api/payments/p24/webhook` - Webhook P24

### Panel Admin
- `POST /api/admin/auth/login` - Logowanie admin
- `GET /api/admin/orders` - Lista zamówień
- `GET /api/admin/users` - Lista użytkowników
- `POST /api/admin/coupons` - Zarządzanie kuponami

## Monitoring

### Logi
- Aplikacja używa **Pino** do logowania
- Logi są strukturalne (JSON)
- Poziomy: `error`, `warn`, `info`, `debug`

### Health Check
- `GET /api/health` - Status aplikacji
- `GET /api/health/db` - Status bazy danych

## Bezpieczeństwo

### Implementowane zabezpieczenia

- **Helmet.js** - nagłówki bezpieczeństwa (HSTS, X-Frame-Options, Permissions-Policy, etc.)
- **CORS** - tylko dozwolone domeny: `bowlinghub.pl`, `www.bowlinghub.pl`, `rezerwacje.bowlinghub.pl`
- **Rate Limiting** - ograniczenia zapytań przez Upstash Redis:
  - POST `/admin/auth/login`: 5/min/IP + 20/h/konto
  - POST `/admin/auth/register`, POST `/password-reset`: 3/min/IP
  - Pozostałe POST: 20/min/IP
- **Content-Type Validation** - tylko `application/json` dla POST/PUT/PATCH
- **Body Size Limits** - maksymalnie 1 MB dla JSON/urlencoded
- **CSRF Protection** - ochrona przed CSRF
- **Argon2** - bezpieczne hashowanie haseł
- **ValidationPipe** - automatyczne obcinanie pól spoza DTO (`whitelist: true`)

### Testowanie zabezpieczeń

#### Test Rate Limiting
```bash
# Wykonaj 25 zapytań w ciągu 60 sekund - co najmniej 5 powinno zwrócić 429
for i in {1..25}; do
  curl -X POST http://localhost:4000/admin/auth/login \
    -H "Content-Type: application/json" \
    -H "CF-Turnstile-Response: valid-token" \
    -d '{"email":"test@example.com","password":"test123"}'
  echo "Request $i"
  sleep 1
done
```

#### Test Walidacji Content-Type

```bash
# Bez Content-Type - powinno zwrócić 415
curl -X POST http://localhost:4000/hold \
  -d '{"items":[]}'

# Z nieprawidłowym Content-Type - powinno zwrócić 415
curl -X POST http://localhost:4000/hold \
  -H "Content-Type: text/plain" \
  -d '{"items":[]}'
```

#### Test Limitu Rozmiaru Body

```bash
# Utwórz plik > 1MB i wyślij - powinno zwrócić 413
dd if=/dev/zero of=large.json bs=1M count=2
curl -X POST http://localhost:4000/hold \
  -H "Content-Type: application/json" \
  -d @large.json
```

### Troubleshooting

**Rate limiting nie działa:**
- Sprawdź czy `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN` są ustawione
- Sprawdź logi aplikacji pod kątem błędów połączenia z Upstash
- W przypadku błędów, interceptor "fail open" - pozwala na request (sprawdź logi)

**Turnstile guard nie działa:**
- Sprawdź czy `TURNSTILE_SECRET_KEY` jest ustawione
- Upewnij się, że frontend wysyła token w headerze `CF-Turnstile-Response`
- Sprawdź logi aplikacji pod kątem błędów weryfikacji

**CORS blokuje requesty:**
- Sprawdź czy origin jest w liście dozwolonych: `bowlinghub.pl`, `www.bowlinghub.pl`, `rezerwacje.bowlinghub.pl`
- W development, localhost jest automatycznie dozwolony

## Testy

```bash
# Wszystkie testy
npm test

# Testy jednostkowe
npm run test:unit

# Testy API
npm run test:api

# Testy E2E
npm run test:e2e

# Testy z watch mode
npm run test:watch
```

## Struktura Projektu

```
booking-api/
├── src/
│   ├── app.ts              # Konfiguracja Express
│   ├── server.ts           # Serwer HTTP
│   ├── config/             # Konfiguracja
│   ├── domain/             # Logika biznesowa
│   ├── lib/                # Biblioteki
│   ├── middleware/         # Middleware Express
│   ├── routes/             # Endpointy API
│   ├── services/           # Serwisy biznesowe
│   ├── types/              # Definicje TypeScript
│   ├── utils/              # Narzędzia
│   └── validators/          # Walidatory Zod
├── prisma/                 # Schema bazy danych
├── tests/                  # Testy
├── scripts/                # Skrypty pomocnicze
└── dist/                   # Skompilowany kod
```

## Wsparcie

W przypadku problemów sprawdź:
1. Logi aplikacji
2. Status bazy danych
3. Konfigurację zmiennych środowiskowych
4. Certyfikaty SSL
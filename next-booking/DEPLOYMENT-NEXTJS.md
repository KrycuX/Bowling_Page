# 🚀 Instrukcje wdrożenia Next.js na mydevil.net

## Struktura katalogów

```
/usr/home/TWÓJ_LOGIN/domains/TWOJA_DOMENA/
├── public_nodejs/          # API (booking-api)
└── public_html/            # Frontend (next-booking)
```

## 📁 Przygotowanie Next.js (Frontend)

### 1. Skopiuj pliki do public_html
```bash
# Skopiuj cały katalog next-booking do public_html
cp -r next-booking/* /usr/home/TWÓJ_LOGIN/domains/TWOJA_DOMENA/public_html/
```

### 2. Zainstaluj zależności
```bash
cd /usr/home/TWÓJ_LOGIN/domains/TWOJA_DOMENA/public_html/
npm install
```

### 3. Zbuduj aplikację
```bash
npm run build
```

### 4. Skonfiguruj zmienne środowiskowe
Stwórz plik `.env.local`:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.thealley2b.pl
# Dodaj inne zmienne jeśli potrzebne
```

## 🔧 Opcje uruchomienia

### Opcja A: Standardowy Next.js (zalecana)
Użyj pliku `app.js` - już przygotowany!

### Opcja B: Standalone build
Jeśli chcesz użyć standalone build:
```bash
# Zmień nazwę pliku
mv app.js app-standard.js
mv app-standalone.js app.js
```

## ⚙️ Konfiguracja w panelu DevilWEB

1. **Zaloguj się do panelu DevilWEB**
2. **Przejdź do sekcji "WWW"**
3. **Wybierz swoją domenę**
4. **Ustaw typ strony na "Node.js"**
5. **Ustaw katalog główny na `public_html`**
6. **Zapisz zmiany**

## 🚀 Restart aplikacji

```bash
# Przez SSH
devil www restart TWOJA_DOMENA

# Lub przez panel DevilWEB - przycisk "Restart"
```

## 🔍 Sprawdzenie

Po restarcie sprawdź:
- Czy aplikacja działa: `https://rezerwacje.thealley2b.pl`
- Logi błędów: `devil www logs TWOJA_DOMENA`
- Status: `devil www status TWOJA_DOMENA`

## 📋 Struktura plików po wdrożeniu

```
public_html/
├── app.js                  # Punkt wejścia dla Phusion Passenger
├── app-standalone.js       # Alternatywny punkt wejścia
├── package.json            # Z main: "app.js"
├── .next/                  # Zbudowana aplikacja Next.js
├── public/                 # Statyczne pliki
├── .env.local              # Zmienne środowiskowe
└── node_modules/           # Zależności
```

## ⚠️ Ważne uwagi

1. **Next.js standalone** - automatycznie optymalizuje dla hostingu
2. **Phusion Passenger** - automatycznie przydziela porty
3. **HTTPS** - automatycznie obsługiwane przez mydevil.net
4. **API URL** - ustaw `NEXT_PUBLIC_API_URL` na adres Twojego API

## 🎯 Gotowe!

Frontend Next.js będzie działać na `https://rezerwacje.thealley2b.pl`

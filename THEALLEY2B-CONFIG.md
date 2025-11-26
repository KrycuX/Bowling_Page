# 🚀 Konfiguracja dla domen thealley2b.pl

## ✅ Zaktualizowane konfiguracje

### **API (api.thealley2b.pl):**
- ✅ `booking-api/env.example` - URL i CORS
- ✅ `booking-api/src/config/env.ts` - domyślne wartości
- ✅ `booking-api/src/app.ts` - CORS dla subdomen
- ✅ `booking-api/src/services/paymentService.ts` - URL płatności
- ✅ `booking-api/env.production` - plik produkcyjny

### **Frontend (rezerwacje.thealley2b.pl):**
- ✅ `next-booking/env.local.example` - API URL
- ✅ `next-booking/env.production` - plik produkcyjny
- ✅ `next-booking/DEPLOYMENT-NEXTJS.md` - dokumentacja

## 🔧 Konfiguracja CORS

API teraz obsługuje:
- ✅ `https://rezerwacje.thealley2b.pl` (główna domena frontendu)
- ✅ Wszystkie subdomeny `*.thealley2b.pl`
- ✅ Requesty bez origin (mobile apps, curl)
- ✅ Pełne metody HTTP (GET, POST, PUT, DELETE, OPTIONS)
- ✅ Credentials i odpowiednie nagłówki

## 🌐 URL Konfiguracja

### **API:**
- **URL**: `https://api.thealley2b.pl`
- **CORS**: `https://rezerwacje.thealley2b.pl`
- **Płatności**: 
  - Return: `https://rezerwacje.thealley2b.pl/rezerwacje/powrot`
  - Webhook: `https://api.thealley2b.pl/payments/p24/webhook`

### **Frontend:**
- **URL**: `https://rezerwacje.thealley2b.pl`
- **API**: `https://api.thealley2b.pl`

## 📁 Pliki do wdrożenia

### **Na serwerze API (public_nodejs/):**
```bash
# Skopiuj pliki
cp booking-api/* /usr/home/TWÓJ_LOGIN/domains/api.thealley2b.pl/public_nodejs/

# Skopiuj konfigurację produkcyjną
cp booking-api/env.production /usr/home/TWÓJ_LOGIN/domains/api.thealley2b.pl/public_nodejs/.env
```

### **Na serwerze Frontend (public_html/):**
```bash
# Skopiuj pliki
cp next-booking/* /usr/home/TWÓJ_LOGIN/domains/rezerwacje.thealley2b.pl/public_html/

# Skopiuj konfigurację produkcyjną
cp next-booking/env.production /usr/home/TWÓJ_LOGIN/domains/rezerwacje.thealley2b.pl/public_html/.env.local
```

## ⚙️ Konfiguracja w panelu DevilWEB

### **API (api.thealley2b.pl):**
1. Typ strony: **Node.js**
2. Katalog główny: **public_nodejs**
3. Plik startowy: **app.js**

### **Frontend (rezerwacje.thealley2b.pl):**
1. Typ strony: **Node.js**
2. Katalog główny: **public_html**
3. Plik startowy: **app.js**

## 🚀 Komendy wdrożenia

```bash
# API
cd /usr/home/TWÓJ_LOGIN/domains/api.thealley2b.pl/public_nodejs/
npm install
npm run build
devil www restart api.thealley2b.pl

# Frontend
cd /usr/home/TWÓJ_LOGIN/domains/rezerwacje.thealley2b.pl/public_html/
npm install
npm run build
devil www restart rezerwacje.thealley2b.pl
```

## ✅ Gotowe!

- **API**: `https://api.thealley2b.pl`
- **Frontend**: `https://rezerwacje.thealley2b.pl`
- **CORS**: Skonfigurowany dla obu domen
- **Płatności**: URL zaktualizowane
- **HTTPS**: Automatycznie obsługiwane przez mydevil.net

**Wszystkie konfiguracje są gotowe do wdrożenia!** 🎉



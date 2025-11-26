# Plan usunięcia zakładki 'Terminarz' z admin panelu

## Cel
Usunięcie funkcjonalności 'Terminarz' z panelu administracyjnego. Zakładka ta jest zbędna i może być zastąpiona funkcjonalnością dostępną w innych częściach systemu.

## Obecny stan systemu

### Frontend - Komponenty i strony
1. **Strona terminarza**: `next-booking/app/panel/terminarz/page.tsx`
   - Główny komponent: `AdminSchedulePage`
   - Funkcjonalność: wyświetlanie terminarza zasobów, tworzenie rezerwacji z terminarza
   - Rozmiar: ~685 linii kodu

2. **Hook**: `next-booking/hooks/panel/useDayScheduleAdmin.ts`
   - Hook specyficzny dla terminarza admina
   - Używa endpointu `/admin/schedule`
   - Używany tylko w `terminarz/page.tsx`

3. **Nawigacja**: `next-booking/components/panel/PanelShell.tsx`
   - Link do terminarza w linii 23: `{ href: "/panel/terminarz", label: "Terminarz" }`

4. **Dashboard**: `next-booking/app/panel/page.tsx`
   - Przycisk "Terminarz" w sekcji szybkich akcji (linie 252-261)

5. **OrderForm**: `next-booking/components/panel/OrderForm.tsx`
   - Komunikat błędu z referencją do terminarza (linia 598)
   - Można zmienić na bardziej ogólny komunikat

### Backend - API endpoint
1. **Endpoint**: `/admin/schedule`
   - Używany tylko przez frontend terminarza
   - Testowany w: `booking-api/tests/api/schedule.test.ts`
   - Należy sprawdzić implementację w `booking-api/src/`

### Testy
1. **Test E2E**: `next-booking/tests/panelSchedule.spec.ts`
   - Test funkcjonalności terminarza w Playwright
   - 54 linie kodu

## Plan implementacji

### Krok 1: Usunięcie komponentów frontendowych

#### 1.1. Usunięcie strony terminarza
- **Plik do usunięcia**: `next-booking/app/panel/terminarz/page.tsx`
- **Dodatkowo**: Usunąć cały katalog `next-booking/app/panel/terminarz/` jeśli zawiera tylko ten plik

#### 1.2. Usunięcie hooka `useDayScheduleAdmin`
- **Plik do usunięcia**: `next-booking/hooks/panel/useDayScheduleAdmin.ts`
- **Sprawdzić**: Czy `AdminDaySchedule` type jest używany gdzie indziej (prawdopodobnie nie)

#### 1.3. Usunięcie linku z nawigacji
- **Plik**: `next-booking/components/panel/PanelShell.tsx`
- **Zmiana**: Usunąć linię 23 z tablicy `navLinks`:
  ```typescript
  // PRZED:
  const navLinks = [
    { href: "/panel", label: "Dashboard" },
    { href: "/panel/rezerwacje", label: "Rezerwacje" },
    { href: "/panel/terminarz", label: "Terminarz" }, // ← USUNĄĆ
    { href: "/panel/rezerwacje/nowa", label: "Nowa rezerwacja" },
    { href: "/panel/kupony", label: "Kupony" },
    { href: "/panel/zgody-marketingowe", label: "Zgody marketingowe" }
  ];
  
  // PO:
  const navLinks = [
    { href: "/panel", label: "Dashboard" },
    { href: "/panel/rezerwacje", label: "Rezerwacje" },
    { href: "/panel/rezerwacje/nowa", label: "Nowa rezerwacja" },
    { href: "/panel/kupony", label: "Kupony" },
    { href: "/panel/zgody-marketingowe", label: "Zgody marketingowe" }
  ];
  ```

#### 1.4. Usunięcie przycisku z Dashboard
- **Plik**: `next-booking/app/panel/page.tsx`
- **Zmiana**: Usunąć Grid item z przyciskiem "Terminarz" (linie 252-261):
  ```tsx
  // USUNĄĆ CAŁY BLOK:
  <Grid item xs={12} sm={6} md={3}>
    <Button 
      variant="outlined" 
      fullWidth 
      component={Link} 
      href="/panel/terminarz"
      sx={{ py: 2 }}
    >
      📅 Terminarz
    </Button>
  </Grid>
  ```
- **Uwaga**: Po usunięciu jeden Grid item zostanie, rozważyć reorganizację layoutu

#### 1.5. Aktualizacja komunikatu błędu w OrderForm
- **Plik**: `next-booking/components/panel/OrderForm.tsx`
- **Zmiana**: Zmienić komunikat błędu z referencją do terminarza na bardziej ogólny:
  ```tsx
  // PRZED (linia 598):
  Nie udało się pobrać terminarza.
  
  // PO:
  Nie udało się pobrać planera zasobów.
  ```
  (lub bardziej ogólny komunikat zgodny z kontekstem komponentu)

### Krok 2: Usunięcie testów

#### 2.1. Usunięcie testu E2E
- **Plik do usunięcia**: `next-booking/tests/panelSchedule.spec.ts`
- Test sprawdza funkcjonalność terminarza, która zostanie usunięta

### Krok 3: Weryfikacja backendu (opcjonalne)

#### 3.1. Sprawdzenie użycia endpointu `/admin/schedule`
- **Sprawdzić**: Czy endpoint `/admin/schedule` jest używany gdzie indziej
- **Akcja**: Jeśli używany tylko przez terminarz, można go usunąć w przyszłości
- **Uwaga**: Na początku można zostawić endpoint, aby nie łamać API, ale oznaczyć jako deprecated

#### 3.2. Testy backendowe
- **Plik**: `booking-api/tests/api/schedule.test.ts`
- **Sprawdzić**: Czy test `'returns admin schedule with order identifiers'` jest używany tylko dla terminarza
- **Decyzja**: Jeśli endpoint zostaje, testy mogą zostać; jeśli endpoint zostanie usunięty, usunąć również test

## Szczegółowa lista plików do zmiany/usunięcia

### Pliki do usunięcia:
1. ✅ `next-booking/app/panel/terminarz/page.tsx`
2. ✅ `next-booking/hooks/panel/useDayScheduleAdmin.ts`
3. ✅ `next-booking/tests/panelSchedule.spec.ts`

### Pliki do modyfikacji:
1. ✅ `next-booking/components/panel/PanelShell.tsx` - usunąć link z nawigacji
2. ✅ `next-booking/app/panel/page.tsx` - usunąć przycisk z dashboard
3. ✅ `next-booking/components/panel/OrderForm.tsx` - zmienić komunikat błędu (opcjonalne)

### Pliki do weryfikacji (opcjonalne):
1. ⚠️ `booking-api/src/...` - znaleźć implementację `/admin/schedule` endpoint
2. ⚠️ `booking-api/tests/api/schedule.test.ts` - rozważyć usunięcie lub pozostawienie

## Kolejność wykonywania

1. **Najpierw**: Usunięcie referencji w komponentach (PanelShell, Dashboard)
2. **Następnie**: Usunięcie strony i hooka
3. **Na końcu**: Usunięcie testów E2E

## Zgodność wsteczna

- ⚠️ **Brak zgodności wstecznej**: Użytkownicy, którzy mają zapisane linki do `/panel/terminarz` otrzymają 404
- ✅ **Bezpieczne**: Linki w nawigacji i dashboard zostaną automatycznie usunięte

## Testowanie po usunięciu

1. ✅ Sprawdzić, czy aplikacja się kompiluje bez błędów
2. ✅ Sprawdzić, czy nawigacja działa poprawnie (brak linku do terminarza)
3. ✅ Sprawdzić, czy dashboard wyświetla się poprawnie
4. ✅ Sprawdzić, czy nie ma błędów w konsoli przeglądarki
5. ✅ Sprawdzić, czy pozostałe funkcjonalności działają (rezerwacje, kupony, etc.)

## Uwagi dodatkowe

- Rozważyć przeniesienie funkcjonalności tworzenia rezerwacji z terminarza do strony "Nowa rezerwacja", jeśli była używana
- Endpoint `/admin/schedule` może pozostać w backendzie jako deprecated, aby nie łamać potencjalnych zewnętrznych integracji (jeśli takie istnieją)
- Jeśli endpoint zostaje, można dodać logowanie użycia, aby monitorować czy jest jeszcze używany

## Status wykonania

- [x] Krok 1.1 - Usunięcie strony terminarza ✅
- [x] Krok 1.2 - Usunięcie hooka useDayScheduleAdmin ✅
- [x] Krok 1.3 - Usunięcie linku z nawigacji ✅
- [x] Krok 1.4 - Usunięcie przycisku z Dashboard ✅
- [x] Krok 1.5 - Aktualizacja komunikatu błędu ✅
- [x] Krok 2.1 - Usunięcie testu E2E ✅
- [x] Krok 3.1 - Weryfikacja endpointu backendowego ✅
  - Dodano kontroler `AdminScheduleController` z oznaczeniem deprecated
  - Endpoint `/admin/schedule` zwraca header `X-Deprecated: true` oraz `X-Deprecation-Message`
  - Dodano JSDoc komentarz z oznaczeniem `@deprecated`
- [ ] Testowanie końcowe (wymaga uruchomienia aplikacji)


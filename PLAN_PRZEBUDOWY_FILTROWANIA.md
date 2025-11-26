# Plan przebudowy filtrowania rezerwacji

## Wymagania
Wbudowane domyślne filtry:
1. **"Złożone dzisiaj"** - rezerwacje utworzone dzisiaj (według `createdAt`)
2. **"Termin dzisiaj"** - rezerwacje z terminem dzisiaj (według `reservedSlots.startTime`)
3. **"Termin Jutro"** - rezerwacje z terminem jutro (według `reservedSlots.startTime`)

## Obecny stan systemu

### Frontend
- **Komponent**: `next-booking/components/panel/FiltersBar.tsx`
  - Obecne filtry: `dateFrom`, `dateTo`, `status`, `resourceType`, `q` (wyszukiwanie)
- **Strona**: `next-booking/app/panel/rezerwacje/page.tsx`
  - Używa `FiltersBar` i `useOrdersQuery`
- **Hook**: `next-booking/hooks/panel/useOrdersQuery.ts`
  - Typ `OrdersFilters` zawiera: `dateFrom`, `dateTo`, `resourceId`, `resourceType`, `status`, `q`, `page`, `pageSize`

### Backend
- **Service**: `booking-api/src/modules/admin/orders/admin-orders.service.ts`
  - Metoda `listOrders()` filtruje obecnie tylko po `createdAt` przy użyciu `dateFrom`/`dateTo`
  - Nie ma obsługi filtrowania po `reservedSlots.startTime`
- **Validator**: `booking-api/src/validators/adminOrders.ts`
  - Schema `orderListQuerySchema` obsługuje tylko `dateFrom`/`dateTo` dla daty utworzenia

## Plan implementacji

### Krok 1: Rozszerzenie backendu (API)

#### 1.1. Dodanie nowych parametrów filtrowania
- Dodać parametry `slotDateFrom` i `slotDateTo` do filtrowania po `reservedSlots.startTime`
- Zachować `dateFrom`/`dateTo` dla filtrowania po `createdAt` (zgodność wsteczna)

#### 1.2. Modyfikacja `admin-orders.service.ts`
```typescript
// Rozszerzyć OrderListQuery:
export type OrderListQuery = {
  dateFrom?: string;      // Filtrowanie po createdAt (data utworzenia)
  dateTo?: string;        // Filtrowanie po createdAt (data utworzenia)
  slotDateFrom?: string;  // Filtrowanie po reservedSlots.startTime (data terminu)
  slotDateTo?: string;    // Filtrowanie po reservedSlots.startTime (data terminu)
  // ... pozostałe parametry
};

// W metodzie listOrders() dodać:
if (query.slotDateFrom || query.slotDateTo) {
  // Użyć QueryBuilder z join do reservedSlots i filtrować po startTime
}
```

#### 1.3. Aktualizacja validacji
- Rozszerzyć `orderListQuerySchema` w `adminOrders.ts` o `slotDateFrom` i `slotDateTo`

### Krok 2: Rozszerzenie frontendu

#### 2.1. Aktualizacja `FiltersBar.tsx`
- Dodać sekcję z przyciskami szybkich filtrów:
  - Przyciski: "Złożone dzisiaj", "Termin dzisiaj", "Termin Jutro"
  - Styl: Chip/ToggleButton z zaznaczeniem aktywnego filtra
- Rozszerzyć `FiltersState`:
  ```typescript
  export type FiltersState = {
    quickFilter?: 'created_today' | 'slot_today' | 'slot_tomorrow';
    dateFrom?: string;
    dateTo?: string;
    // ... pozostałe
  };
  ```

#### 2.2. Aktualizacja `useOrdersQuery.ts`
- Rozszerzyć `OrdersFilters`:
  ```typescript
  export type OrdersFilters = {
    dateFrom?: string;
    dateTo?: string;
    slotDateFrom?: string;
    slotDateTo?: string;
    // ... pozostałe
  };
  ```

#### 2.3. Logika mapowania w `page.tsx`
- W komponencie `OrdersPage` dodać funkcję mapującą `quickFilter` na odpowiednie parametry:
  ```typescript
  const mapQuickFilterToParams = (filter?: string): Partial<OrdersFilters> => {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    
    switch (filter) {
      case 'created_today':
        return { dateFrom: today, dateTo: today };
      case 'slot_today':
        return { slotDateFrom: today, slotDateTo: today };
      case 'slot_tomorrow':
        return { slotDateFrom: tomorrow, slotDateTo: tomorrow };
      default:
        return {};
    }
  };
  ```

### Krok 3: Implementacja szczegółowa

#### 3.1. Backend - Filtrowanie po reservedSlots
Problem: TypeORM `findAndCount` z `where` nie obsługuje łatwo filtrowania po relacjach.
Rozwiązanie: Użyć QueryBuilder z join:

```typescript
const queryBuilder = this.orderRepository
  .createQueryBuilder('order')
  .leftJoinAndSelect('order.items', 'item')
  .leftJoinAndSelect('item.resource', 'resource')
  .leftJoinAndSelect('order.reservedSlots', 'slot');

if (query.slotDateFrom || query.slotDateTo) {
  if (query.slotDateFrom && query.slotDateTo) {
    queryBuilder.andWhere(
      'DATE(slot.startTime) BETWEEN :slotDateFrom AND :slotDateTo',
      { slotDateFrom: query.slotDateFrom, slotDateTo: query.slotDateTo }
    );
  } else if (query.slotDateFrom) {
    queryBuilder.andWhere('DATE(slot.startTime) >= :slotDateFrom', {
      slotDateFrom: query.slotDateFrom
    });
  } else if (query.slotDateTo) {
    queryBuilder.andWhere('DATE(slot.startTime) <= :slotDateTo', {
      slotDateTo: query.slotDateTo
    });
  }
}

// Zachować filtrowanie po createdAt dla dateFrom/dateTo
if (query.dateFrom || query.dateTo) {
  // ... istniejąca logika
}

// Dodać distinct dla uniknięcia duplikatów przy join
queryBuilder.distinct(true);

const [orders, total] = await queryBuilder
  .orderBy('order.createdAt', 'DESC')
  .skip(skip)
  .take(pageSize)
  .getManyAndCount();
```

#### 3.2. Frontend - UI szybkich filtrów
```tsx
// W FiltersBar.tsx
<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
  <Chip
    label="Złożone dzisiaj"
    onClick={() => onChange({ quickFilter: 'created_today' })}
    color={filters.quickFilter === 'created_today' ? 'primary' : 'default'}
    variant={filters.quickFilter === 'created_today' ? 'filled' : 'outlined'}
  />
  <Chip
    label="Termin dzisiaj"
    onClick={() => onChange({ quickFilter: 'slot_today' })}
    color={filters.quickFilter === 'slot_today' ? 'primary' : 'default'}
    variant={filters.quickFilter === 'slot_today' ? 'filled' : 'outlined'}
  />
  <Chip
    label="Termin Jutro"
    onClick={() => onChange({ quickFilter: 'slot_tomorrow' })}
    color={filters.quickFilter === 'slot_tomorrow' ? 'primary' : 'default'}
    variant={filters.quickFilter === 'slot_tomorrow' ? 'filled' : 'outlined'}
  />
</Stack>
```

## Zachowanie zgodności wstecznej
- `dateFrom`/`dateTo` nadal filtrują po `createdAt`
- Nowe parametry `slotDateFrom`/`slotDateTo` są opcjonalne
- Jeśli oba typy filtrów są użyte jednocześnie, zastosować AND (oba warunki muszą być spełnione)

## Testowanie
1. Test szybkich filtrów - każdy z trzech przycisków powinien zwrócić odpowiednie rezerwacje
2. Test kombinacji - szybki filtr + inne filtry (status, resourceType)
3. Test czyszczenia - przycisk "Wyczyść" powinien resetować również quickFilter
4. Test wydajności - sprawdzić czy QueryBuilder z join nie spowalnia zapytania przy dużej liczbie rezerwacji

## Uwagi
- Używać `DATE()` w SQL dla porównywania dat (ignorowanie czasu)
- Uwzględnić strefę czasową - używać dat względem strefy czasowej systemu
- Dodać `distinct(true)` w QueryBuilder aby uniknąć duplikatów przy join z reservedSlots
- Rozważyć dodanie indeksów na `reservedSlots.startTime` jeśli jeszcze nie istnieją


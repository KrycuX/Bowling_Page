import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { 
  User, Resource, AppSettings, Coupon, CouponAllowedType,
  ResourceType, UserRole, CouponType, Order, OrderItem, ReservedSlot,
  OrderStatus, PaymentMethod, SlotStatus, PricingMode
} from '../database/entities';
import { hashPassword } from '../utils/security';
import { createId } from '@paralleldrive/cuid2';
import { addHours, addMinutes, setHours, setMinutes } from 'date-fns';

async function seed() {
  try {
    // Inicjalizuj połączenie
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = AppDataSource.getRepository(User);
    const resourceRepository = AppDataSource.getRepository(Resource);
    const settingsRepository = AppDataSource.getRepository(AppSettings);
    const couponRepository = AppDataSource.getRepository(Coupon);
    const couponAllowedTypeRepository = AppDataSource.getRepository(CouponAllowedType);

    // Sprawdź czy już istnieją dane
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed...');
      await AppDataSource.destroy();
      return;
    }

    console.log('🌱 Seeding initial data...');

    // 1. Utwórz użytkowników
    const adminPassword = 'Admin123!';
    const adminPasswordHash = await hashPassword(adminPassword);
    
    const adminUser = userRepository.create({
      email: 'admin@thealley2b.pl',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(adminUser);
    console.log(`✅ Created admin user: admin@thealley2b.pl (password: ${adminPassword})`);

    const employeePassword = 'Employee123!';
    const employeePasswordHash = await hashPassword(employeePassword);
    
    const employeeUser = userRepository.create({
      email: 'employee@thealley2b.pl',
      passwordHash: employeePasswordHash,
      role: UserRole.EMPLOYEE,
      isActive: true,
    });
    await userRepository.save(employeeUser);
    console.log(`✅ Created employee user: employee@thealley2b.pl (password: ${employeePassword})`);

    // 2. Utwórz zasoby
    const resources = [
      {
        name: 'Tor kręgielny 1',
        type: ResourceType.BOWLING_LANE,
        pricePerHour: 12000, // 120 PLN
      },
      {
        name: 'Tor kręgielny 2',
        type: ResourceType.BOWLING_LANE,
        pricePerHour: 12000,
      },
      {
        name: 'Tor kręgielny 3',
        type: ResourceType.BOWLING_LANE,
        pricePerHour: 12000,
      },
      {
        name: 'Tor kręgielny 4',
        type: ResourceType.BOWLING_LANE,
        pricePerHour: 12000,
      },
      {
        name: 'Stół bilardowy 1',
        type: ResourceType.BILLIARDS_TABLE,
        pricePerHour: 5000, // 50 PLN
      },
      {
        name: 'Stół bilardowy 2',
        type: ResourceType.BILLIARDS_TABLE,
        pricePerHour: 5000,
      },
      {
        name: 'Stół bilardowy 3',
        type: ResourceType.BILLIARDS_TABLE,
        pricePerHour: 5000,
      },
      {
        name: 'Stół bilardowy 4',
        type: ResourceType.BILLIARDS_TABLE,
        pricePerHour: 5000,
      },
      {
        name: 'Pokój karaoke',
        type: ResourceType.KARAOKE_ROOM,
        pricePerHour: 4000, // 40 PLN per person
      },
      {
        name: 'Pokój quiz',
        type: ResourceType.QUIZ_ROOM,
        priceFlat: 5000, // 50 PLN per person per session
      },
    ];

    const createdResources = resourceRepository.create(resources);
    await resourceRepository.save(createdResources);
    console.log(`✅ Created ${resources.length} resources`);

    // 3. Utwórz ustawienia aplikacji
    const appSettings = settingsRepository.create({
      id: 1,
      timezone: 'Europe/Warsaw',
      openHour: 10,
      closeHour: 22,
      slotIntervalMinutes: 60,
      holdDurationMinutes: 30,
      priceBowlingPerHour: 12000,
      priceBilliardsPerHour: 5000,
      priceKaraokePerPersonPerHour: 4000,
      priceQuizPerPersonPerSession: 5000,
      billiardsTablesCount: 4,
      bowlingMinDurationHours: 1,
      bowlingMaxDurationHours: 3,
      quizDurationHours: 1,
      quizMaxPeople: 8,
      karaokeMinDurationHours: 1,
      karaokeMaxDurationHours: 4,
      karaokeMaxPeople: 10,
      p24Mode: 'mock', // Mock mode for development
      demoMode: true,
    });
    await settingsRepository.save(appSettings);
    console.log('✅ Created app settings');

    // 4. Utwórz kupony
    const welcomeCoupon = couponRepository.create({
      code: 'WELCOME10',
      type: CouponType.PERCENT,
      value: 10,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      appliesToAll: true,
      isActive: true,
      minTotal: 5000, // 50 PLN minimum
      maxUsesTotal: 100,
      usePerEmail: false,
    });
    await couponRepository.save(welcomeCoupon);

    const bowlingCoupon = couponRepository.create({
      code: 'BOWLING20',
      type: CouponType.PERCENT,
      value: 20,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      appliesToAll: false,
      isActive: true,
      minTotal: 10000, // 100 PLN minimum
      maxUsesTotal: 50,
      usePerEmail: true,
    });
    await couponRepository.save(bowlingCoupon);

    // 5. Dodaj typ zasobu do kuponu BOWLING20
    const bowlingAllowedType = couponAllowedTypeRepository.create({
      coupon: bowlingCoupon,
      resourceType: ResourceType.BOWLING_LANE,
    });
    await couponAllowedTypeRepository.save(bowlingAllowedType);

    console.log(`✅ Created 2 coupons`);
    console.log('✅ Configured coupon resource types');

    // 6. Utwórz przykładowe zamówienia
    console.log('🌱 Creating sample orders...');
    
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const reservedSlotRepository = AppDataSource.getRepository(ReservedSlot);

    const sampleNames = [
      'Jan Kowalski', 'Anna Nowak', 'Piotr Wiśniewski', 'Maria Dąbrowska',
      'Tomasz Lewandowski', 'Katarzyna Wójcik', 'Paweł Kamiński', 'Magdalena Zielińska',
      'Adam Szymański', 'Aleksandra Woźniak', 'Marcin Kozłowski', 'Natalia Jankowska',
      'Krzysztof Mazur', 'Karolina Krawczyk', 'Robert Piotrowski', 'Agata Grabowski',
      'Daniel Nowicki', 'Joanna Pawłowski', 'Michał Michalski', 'Dominika Nowakowska',
      'Łukasz Adamczyk', 'Justyna Dudek', 'Jakub Jaworski', 'Weronika Zawadzki',
      'Mateusz Borkowski', 'Monika Sokołowski', 'Marek Szulc', 'Patrycja Lis',
      'Kamil Tokarski', 'Marta Szymczak', 'Bartosz Czerwiński', 'Paulina Pietrzak',
    ];

    const allResources = await resourceRepository.find();
    const bowlingResources = allResources.filter(r => r.type === ResourceType.BOWLING_LANE);
    const billiardsResources = allResources.filter(r => r.type === ResourceType.BILLIARDS_TABLE);
    const karaokeResources = allResources.filter(r => r.type === ResourceType.KARAOKE_ROOM);
    const quizResources = allResources.filter(r => r.type === ResourceType.QUIZ_ROOM);

    // Helper function to get random element
    const randomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

    // Helper function to generate random date in range
    const randomDate = (start: Date, end: Date): Date => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Helper function to add random hours
    const randomHour = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Create 50 orders
    const startDate = new Date('2025-10-25');
    const endDate = new Date('2025-12-24');
    const orderDates = Array.from({ length: 50 }, () => randomDate(startDate, endDate));

    for (let i = 0; i < 50; i++) {
      const orderDate = orderDates[i];
      const orderTime = randomHour(10, 21); // Random hour between 10 and 21
      
      // Random resource type and selection
      const resourceTypeRoll = Math.random();
      let selectedResource: Resource;
      let durationHours = 1;
      let peopleCount: number | null = null;
      let pricingMode = PricingMode.PER_RESOURCE_PER_HOUR;

      if (resourceTypeRoll < 0.4) {
        // 40% bowling
        selectedResource = randomElement(bowlingResources);
        durationHours = Math.random() < 0.5 ? 1 : 2;
        pricingMode = PricingMode.PER_RESOURCE_PER_HOUR;
      } else if (resourceTypeRoll < 0.7) {
        // 30% billiards
        selectedResource = randomElement(billiardsResources);
        durationHours = Math.random() < 0.7 ? 1 : 2;
        pricingMode = PricingMode.PER_RESOURCE_PER_HOUR;
      } else if (resourceTypeRoll < 0.9) {
        // 20% karaoke
        selectedResource = randomElement(karaokeResources);
        durationHours = randomElement([1, 2, 3]);
        peopleCount = randomElement([2, 3, 4, 5, 6]);
        pricingMode = PricingMode.PER_PERSON_PER_HOUR;
      } else {
        // 10% quiz
        selectedResource = randomElement(quizResources);
        durationHours = 1;
        peopleCount = randomElement([2, 3, 4, 5, 6, 7, 8]);
        pricingMode = PricingMode.PER_PERSON_PER_SESSION;
      }

      // Calculate pricing
      let unitAmount = 0;
      let quantity = 1;
      if (pricingMode === PricingMode.PER_RESOURCE_PER_HOUR) {
        unitAmount = selectedResource.pricePerHour || 10000;
        quantity = durationHours;
      } else if (pricingMode === PricingMode.PER_PERSON_PER_HOUR) {
        unitAmount = selectedResource.pricePerHour || 4000;
        quantity = (peopleCount || 1) * durationHours;
      } else if (pricingMode === PricingMode.PER_PERSON_PER_SESSION) {
        unitAmount = selectedResource.priceFlat || 5000;
        quantity = peopleCount || 1;
      }
      
      const totalAmount = unitAmount * quantity;

      // Create order
      const orderId = createId();
      const customerName = randomElement(sampleNames);
      const statusRoll = Math.random();
      let status = OrderStatus.PAID;
      let paidAt = orderDate;
      
      if (statusRoll < 0.7) {
        status = OrderStatus.PAID;
        paidAt = orderDate;
      } else if (statusRoll < 0.85) {
        status = OrderStatus.HOLD;
        paidAt = undefined as any;
      } else if (statusRoll < 0.95) {
        status = OrderStatus.PENDING_PAYMENT;
        paidAt = undefined as any;
      } else {
        status = OrderStatus.CANCELLED;
        paidAt = undefined as any;
      }

      const paymentMethod = status === OrderStatus.PAID 
        ? (Math.random() < 0.3 ? PaymentMethod.ON_SITE_CASH : PaymentMethod.ONLINE)
        : PaymentMethod.ONLINE;

      const order = orderRepository.create({
        id: orderId,
        status: status,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        discountAmount: 0,
        currency: 'PLN',
        customerName: customerName,
        customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
        customerPhone: `+48${Math.floor(Math.random() * 900000000) + 100000000}`,
        paidAt: paidAt,
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      const savedOrder = await orderRepository.save(order);

      // Create order item
      const item = orderItemRepository.create({
        orderId: savedOrder.id,
        resourceId: selectedResource.id,
        quantity: quantity,
        unitAmount: unitAmount,
        totalAmount: totalAmount,
        peopleCount: peopleCount,
        pricingMode: pricingMode,
        description: `${selectedResource.name}`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
      await orderItemRepository.save(item);

      // Create reserved slot
      const startTime = setMinutes(setHours(new Date(orderDate), orderTime), 0);
      const endTime = addHours(startTime, durationHours);
      
      let slotStatus = SlotStatus.BOOKED;
      if (status === OrderStatus.HOLD) {
        slotStatus = SlotStatus.HOLD;
      }

      const slot = reservedSlotRepository.create({
        orderId: savedOrder.id,
        resourceId: selectedResource.id,
        startTime: startTime,
        endTime: endTime,
        status: slotStatus,
        expiresAt: status === OrderStatus.HOLD ? addHours(new Date(), 1) : null,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
      await reservedSlotRepository.save(slot);
    }

    console.log(`✅ Created 50 sample orders`);

    console.log('🎉 Initial data seeded successfully!');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('   Admin: admin@thealley2b.pl / Admin123!');
    console.log('   Employee: employee@thealley2b.pl / Employee123!');
    console.log('');
    console.log('🎫 Sample coupons:');
    console.log('   WELCOME10 - 10% off (min 50 PLN)');
    console.log('   BOWLING20 - 20% off bowling (min 100 PLN)');
    console.log('');
    console.log('📦 Sample data:');
    console.log('   50 orders created for dates from 25.10.2025 to 24.12.2025');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

seed();
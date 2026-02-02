import {
  Location,
  CartType,
  Reservation,
  RenterProfile,
  AdminUser,
  PricingRule,
  InventoryAllocation,
  PaymentMethod,
} from '@/types/rental';
import {
  locations,
  cartTypes,
  pricingRules,
  inventoryAllocations,
  renterProfiles,
  adminUsers,
  reservations as initialReservations,
} from '@/data/mockData';

// Storage keys
const STORAGE_KEYS = {
  LOCATIONS: 'rental_locations',
  CART_TYPES: 'rental_cart_types',
  PRICING_RULES: 'rental_pricing_rules',
  INVENTORY_ALLOCATIONS: 'rental_inventory_allocations',
  RENTER_PROFILES: 'rental_renter_profiles',
  ADMIN_USERS: 'rental_admin_users',
  RESERVATIONS: 'rental_reservations',
  PAYMENT_METHODS: 'rental_payment_methods',
  CURRENT_USER: 'rental_current_user',
};

// Initialize storage with mock data
const initializeStorage = () => {
  // Only initialize if not already done
  if (!localStorage.getItem('_rental_app_initialized')) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    localStorage.setItem(STORAGE_KEYS.CART_TYPES, JSON.stringify(cartTypes));
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(pricingRules));
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ALLOCATIONS, JSON.stringify(inventoryAllocations));
    localStorage.setItem(STORAGE_KEYS.RENTER_PROFILES, JSON.stringify(renterProfiles));
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(initialReservations));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify([]));
    localStorage.setItem('_rental_app_initialized', 'true');
  }
};

// ============ LOCATIONS ============
export const LocationService = {
  getAll: (): Location[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return data ? JSON.parse(data) : locations;
  },

  getById: (id: string): Location | undefined => {
    return LocationService.getAll().find((l) => l.id === id);
  },

  getRetailEnabled: (): Location[] => {
    return LocationService.getAll().filter((l) => l.retailEnabled);
  },

  update: (location: Location) => {
    const all = LocationService.getAll();
    const index = all.findIndex((l) => l.id === location.id);
    if (index >= 0) {
      all[index] = location;
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(all));
    }
  },
};

// ============ CART TYPES ============
export const CartTypeService = {
  getAll: (): CartType[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CART_TYPES);
    return data ? JSON.parse(data) : cartTypes;
  },

  getById: (id: string): CartType | undefined => {
    return CartTypeService.getAll().find((c) => c.id === id);
  },

  getByCategory: (category: string): CartType[] => {
    return CartTypeService.getAll().filter((c) => c.category === category);
  },

  update: (cartType: CartType) => {
    const all = CartTypeService.getAll();
    const index = all.findIndex((c) => c.id === cartType.id);
    if (index >= 0) {
      all[index] = cartType;
      localStorage.setItem(STORAGE_KEYS.CART_TYPES, JSON.stringify(all));
    }
  },
};

// ============ PRICING RULES ============
export const PricingService = {
  getAll: (): PricingRule[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PRICING_RULES);
    return data ? JSON.parse(data).map((rule: any) => ({
      ...rule,
      startDate: new Date(rule.startDate),
      endDate: rule.endDate ? new Date(rule.endDate) : undefined,
      createdAt: new Date(rule.createdAt),
    })) : pricingRules;
  },

  getById: (id: string): PricingRule | undefined => {
    return PricingService.getAll().find((r) => r.id === id);
  },

  getByCartType: (cartTypeId: string, locationId?: string): PricingRule[] => {
    return PricingService.getAll().filter(
      (r) =>
        r.cartTypeId === cartTypeId &&
        r.enabled &&
        (!locationId || r.locationId === locationId || !r.locationId)
    );
  },

  getPriceForDate: (cartTypeId: string, rentalPeriod: string, date: Date, locationId?: string): number | undefined => {
    const rules = PricingService.getByCartType(cartTypeId, locationId)
      .filter(r => r.rentalPeriod === rentalPeriod)
      .filter(r => r.startDate <= date && (!r.endDate || r.endDate >= date))
      .sort((a, b) => b.priority - a.priority);

    return rules.length > 0 ? rules[0].price : undefined;
  },

  create: (rule: PricingRule) => {
    const all = PricingService.getAll();
    all.push(rule);
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(all));
  },

  update: (rule: PricingRule) => {
    const all = PricingService.getAll();
    const index = all.findIndex((r) => r.id === rule.id);
    if (index >= 0) {
      all[index] = rule;
      localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(all));
    }
  },

  delete: (id: string) => {
    const all = PricingService.getAll();
    const filtered = all.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(filtered));
  },
};

// ============ INVENTORY ALLOCATION ============
export const InventoryService = {
  getAll: (): InventoryAllocation[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_ALLOCATIONS);
    return data ? JSON.parse(data).map((alloc: any) => ({
      ...alloc,
      lastUpdated: new Date(alloc.lastUpdated),
      unavailableDates: alloc.unavailableDates?.map((d: any) => ({
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        reason: d.reason,
      })),
    })) : inventoryAllocations;
  },

  getByLocationAndCartType: (locationId: string, cartTypeId: string): InventoryAllocation | undefined => {
    return InventoryService.getAll().find(
      (a) => a.locationId === locationId && a.cartTypeId === cartTypeId
    );
  },

  getAvailable: (locationId: string, cartTypeId: string): number => {
    const alloc = InventoryService.getByLocationAndCartType(locationId, cartTypeId);
    return alloc ? alloc.availableQuantity : 0;
  },

  reserve: (locationId: string, cartTypeId: string, quantity: number) => {
    const alloc = InventoryService.getByLocationAndCartType(locationId, cartTypeId);
    if (alloc && alloc.availableQuantity >= quantity) {
      alloc.reservedQuantity += quantity;
      alloc.availableQuantity -= quantity;
      alloc.lastUpdated = new Date();
      const all = InventoryService.getAll();
      const index = all.findIndex((a) => a.id === alloc.id);
      if (index >= 0) {
        all[index] = alloc;
        localStorage.setItem(STORAGE_KEYS.INVENTORY_ALLOCATIONS, JSON.stringify(all));
        return true;
      }
    }
    return false;
  },

  release: (locationId: string, cartTypeId: string, quantity: number) => {
    const alloc = InventoryService.getByLocationAndCartType(locationId, cartTypeId);
    if (alloc) {
      alloc.reservedQuantity = Math.max(0, alloc.reservedQuantity - quantity);
      alloc.availableQuantity += quantity;
      alloc.lastUpdated = new Date();
      const all = InventoryService.getAll();
      const index = all.findIndex((a) => a.id === alloc.id);
      if (index >= 0) {
        all[index] = alloc;
        localStorage.setItem(STORAGE_KEYS.INVENTORY_ALLOCATIONS, JSON.stringify(all));
      }
    }
  },

  update: (allocation: InventoryAllocation) => {
    const all = InventoryService.getAll();
    const index = all.findIndex((a) => a.id === allocation.id);
    if (index >= 0) {
      all[index] = allocation;
      localStorage.setItem(STORAGE_KEYS.INVENTORY_ALLOCATIONS, JSON.stringify(all));
    }
  },
};

// ============ RENTER PROFILES ============
export const RenterService = {
  getAll: (): RenterProfile[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.RENTER_PROFILES);
    return data ? JSON.parse(data).map((profile: any) => ({
      ...profile,
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt),
    })) : renterProfiles;
  },

  getById: (id: string): RenterProfile | undefined => {
    return RenterService.getAll().find((r) => r.id === id);
  },

  getByEmail: (email: string): RenterProfile | undefined => {
    return RenterService.getAll().find((r) => r.email === email);
  },

  create: (profile: RenterProfile) => {
    const all = RenterService.getAll();
    all.push(profile);
    localStorage.setItem(STORAGE_KEYS.RENTER_PROFILES, JSON.stringify(all));
  },

  update: (profile: RenterProfile) => {
    const all = RenterService.getAll();
    const index = all.findIndex((r) => r.id === profile.id);
    if (index >= 0) {
      profile.updatedAt = new Date();
      all[index] = profile;
      localStorage.setItem(STORAGE_KEYS.RENTER_PROFILES, JSON.stringify(all));
    }
  },
};

// ============ ADMIN USERS ============
export const AdminService = {
  getAll: (): AdminUser[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    return data ? JSON.parse(data).map((admin: any) => ({
      ...admin,
      createdAt: new Date(admin.createdAt),
      updatedAt: new Date(admin.updatedAt),
    })) : adminUsers;
  },

  getById: (id: string): AdminUser | undefined => {
    return AdminService.getAll().find((a) => a.id === id);
  },

  getByEmail: (email: string): AdminUser | undefined => {
    return AdminService.getAll().find((a) => a.email === email);
  },
};

// ============ RESERVATIONS ============
export const ReservationService = {
  getAll: (): Reservation[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return data ? JSON.parse(data).map((res: any) => ({
      ...res,
      createdAt: new Date(res.createdAt),
      updatedAt: new Date(res.updatedAt),
      checkoutAt: res.checkoutAt ? new Date(res.checkoutAt) : undefined,
      checkinAt: res.checkinAt ? new Date(res.checkinAt) : undefined,
      cancelledAt: res.cancelledAt ? new Date(res.cancelledAt) : undefined,
      reservationItems: res.reservationItems.map((item: any) => ({
        ...item,
        rentalStartDatetime: new Date(item.rentalStartDatetime),
        rentalEndDatetime: new Date(item.rentalEndDatetime),
      })),
    })) : initialReservations;
  },

  getById: (id: string): Reservation | undefined => {
    return ReservationService.getAll().find((r) => r.id === id);
  },

  getByConfirmationNumber: (confirmationNumber: string): Reservation | undefined => {
    return ReservationService.getAll().find((r) => r.confirmationNumber === confirmationNumber);
  },

  getByRenterId: (renterId: string): Reservation[] => {
    return ReservationService.getAll().filter((r) => r.renterProfileId === renterId);
  },

  getByLocation: (locationId: string): Reservation[] => {
    return ReservationService.getAll().filter((r) => r.locationId === locationId);
  },

  getByStatus: (status: string): Reservation[] => {
    return ReservationService.getAll().filter((r) => r.status === status);
  },

  create: (reservation: Reservation) => {
    const all = ReservationService.getAll();
    all.push(reservation);
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(all));
    return reservation;
  },

  update: (reservation: Reservation) => {
    const all = ReservationService.getAll();
    const index = all.findIndex((r) => r.id === reservation.id);
    if (index >= 0) {
      reservation.updatedAt = new Date();
      all[index] = reservation;
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(all));
    }
  },

  delete: (id: string) => {
    const all = ReservationService.getAll();
    const filtered = all.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(filtered));
  },
};

// ============ PAYMENT METHODS ============
export const PaymentMethodService = {
  getAll: (): PaymentMethod[] => {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return data ? JSON.parse(data).map((method: any) => ({
      ...method,
      createdAt: new Date(method.createdAt),
    })) : [];
  },

  getByRenterId: (renterId: string): PaymentMethod[] => {
    return PaymentMethodService.getAll().filter((m) => m.renterProfileId === renterId);
  },

  getDefault: (renterId: string): PaymentMethod | undefined => {
    return PaymentMethodService.getByRenterId(renterId).find((m) => m.isDefault);
  },

  create: (method: PaymentMethod) => {
    const all = PaymentMethodService.getAll();
    all.push(method);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(all));
  },

  setDefault: (renterId: string, methodId: string) => {
    const all = PaymentMethodService.getAll();
    all.forEach((m) => {
      if (m.renterProfileId === renterId) {
        m.isDefault = m.id === methodId;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(all));
  },

  delete: (id: string) => {
    const all = PaymentMethodService.getAll();
    const filtered = all.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(filtered));
  },
};

// ============ CURRENT USER ============
export const UserService = {
  getCurrentUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  clearCurrentUser: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  logout: () => {
    UserService.clearCurrentUser();
  },
};

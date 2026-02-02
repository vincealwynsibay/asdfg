// ============ LOCATIONS ============
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  operatingHours: OperatingHours;
  imageUrl: string;
  retailEnabled: boolean;
  retailDescription?: string;
  coordinates?: { lat: number; lng: number };
}

export interface OperatingHours {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
}

// ============ INVENTORY ============
export interface CartType {
  id: string;
  name: string;
  description: string;
  category: 'golf-cart' | 'scooter' | 'bike';
  seats: number;
  features: string[];
  imageUrl: string;
  pricing: PricingTier;
  available: number;
  requiresLicense: boolean;
  minimumAge: number;
}

export interface PricingTier {
  hourly?: number;
  daily: number;
  weekly?: number;
  monthly?: number;
}

// ============ PRICING ============
export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'custom';

export interface PricingRule {
  id: string;
  cartTypeId: string;
  locationId?: string; // null = applies to all locations
  startDate: Date;
  endDate?: Date; // null = indefinite
  rentalPeriod: RentalPeriod;
  price: number;
  currency: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  dayOfWeekPricing?: Record<string, number>; // 'monday', 'tuesday', etc.
  isSpecialPricing?: boolean;
  specialPricingName?: string;
  specialPricingDescription?: string;
  enabled: boolean;
  priority: number;
  createdAt: Date;
}

// ============ CART & CHECKOUT ============
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CartItem {
  id: string; // unique identifier for cart line item
  cartType: CartType;
  quantity: number;
  rentalPeriod: RentalPeriod;
  dateRange: DateRange;
  hours?: number;
  baseRate: number;
  subtotal: number;
}

export interface PricingBreakdown {
  basePrice: number;
  rentalPeriodPrice: number;
  quantity: number;
  subtotal: number;
  discountAmount?: number;
  deliveryFee?: number;
  taxAmount?: number;
  total: number;
}

// ============ USERS & AUTHENTICATION ============
export interface RenterProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  dateOfBirth?: string;
  driversLicenseNumber?: string;
  driversLicenseExpiry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  savedAddresses?: DeliveryAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'rental_admin' | 'field_personnel';
  locationId?: string; // for field personnel
  createdAt: Date;
  updatedAt: Date;
}

// ============ CUSTOMER INFO & DELIVERY ============
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  driversLicense?: string;
  dateOfBirth?: string;
}

export interface DeliveryAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: DeliveryAddress;
  instructions?: string;
  timeWindow?: 'morning' | 'afternoon' | 'evening';
  estimatedTime?: string;
  status?: 'scheduled' | 'in-transit' | 'delivered';
}

// ============ RESERVATIONS ============
export interface ReservationItem {
  id: string;
  cartTypeId: string;
  rentalPeriod: RentalPeriod;
  rentalStartDatetime: Date;
  rentalEndDatetime: Date;
  rentalQuantity: number;
  baseRate: number;
  pricingBreakdown: PricingBreakdown;
  status: 'pending' | 'confirmed' | 'checked-out' | 'checked-in' | 'completed' | 'cancelled';
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  locationId: string;
  location?: Location;
  reservationItems: ReservationItem[];
  customerInfo: CustomerInfo;
  renterProfileId?: string; // if logged in
  delivery: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  promoCode?: string;
  promoDiscount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  checkoutAt?: Date;
  checkinAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
}

// ============ PAYMENT ============
export interface PaymentMethod {
  id: string;
  renterProfileId: string;
  stripePaymentMethodId: string;
  cardBrand: string;
  last4Digits: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  reservationId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  createdAt: Date;
}

// ============ INVENTORY TRACKING ============
export interface InventoryAllocation {
  id: string;
  cartTypeId: string;
  locationId: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  maintenanceQuantity: number;
  unavailableDates?: { startDate: Date; endDate: Date; reason: string }[];
  lastUpdated: Date;
}

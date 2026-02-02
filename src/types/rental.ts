export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  operatingHours: string;
  imageUrl: string;
}

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

export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CartItem {
  cartType: CartType;
  quantity: number;
  rentalPeriod: RentalPeriod;
  dateRange: DateRange;
  hours?: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  driversLicense?: string;
  dateOfBirth?: string;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: string;
  instructions?: string;
  timeWindow?: 'morning' | 'afternoon' | 'evening';
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  location: Location;
  items: CartItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  promoCode?: string;
  promoDiscount?: number;
}

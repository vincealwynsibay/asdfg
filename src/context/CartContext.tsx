import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Location, PricingBreakdown } from '@/types/rental';
import { PricingService } from '@/services/localStorage';

interface CartContextType {
  items: CartItem[];
  selectedLocation: Location | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (item: CartItem) => void;
  clearCart: () => void;
  setLocation: (location: Location) => void;
  getSubtotal: () => number;
  getTaxes: (taxRate?: number) => number;
  getDeliveryFee: () => number;
  getTotal: (taxRate?: number, deliveryFee?: number) => number;
  calculatePricing: (item: CartItem) => PricingBreakdown;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rental_cart';
const LOCATION_STORAGE_KEY = 'rental_selected_location';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart and location from storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const restored = parsed.map((item: any) => ({
          ...item,
          dateRange: {
            startDate: new Date(item.dateRange.startDate),
            endDate: new Date(item.dateRange.endDate),
          },
        }));
        setItems(restored);
      } catch (e) {
        console.error('Failed to restore cart from storage', e);
      }
    }

    if (savedLocation) {
      try {
        setSelectedLocationState(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Failed to restore location from storage', e);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Save location to storage whenever it changes
  useEffect(() => {
    if (isInitialized && selectedLocation) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(selectedLocation));
    }
  }, [selectedLocation, isInitialized]);

  const calculatePricing = (item: CartItem): PricingBreakdown => {
    let basePrice = 0;
    let rentalPeriodPrice = 0;

    // Get pricing from service
    const price = PricingService.getPriceForDate(
      item.cartType.id,
      item.rentalPeriod,
      item.dateRange.startDate,
      selectedLocation?.id
    ) || item.baseRate;

    basePrice = price;

    switch (item.rentalPeriod) {
      case 'hourly':
        rentalPeriodPrice = price * (item.hours || 2);
        break;
      case 'daily': {
        const days = Math.ceil(
          (item.dateRange.endDate.getTime() - item.dateRange.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
        );
        rentalPeriodPrice = price * Math.max(1, days);
        break;
      }
      case 'weekly':
        rentalPeriodPrice = price * (item.cartType.pricing.weekly ? 1 : 7);
        break;
      case 'monthly':
        rentalPeriodPrice = price * (item.cartType.pricing.monthly ? 1 : 30);
        break;
      default:
        rentalPeriodPrice = price;
    }

    const subtotal = rentalPeriodPrice * item.quantity;

    return {
      basePrice,
      rentalPeriodPrice,
      quantity: item.quantity,
      subtotal,
      total: subtotal,
    };
  };

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.cartType.id === item.cartType.id &&
          i.rentalPeriod === item.rentalPeriod &&
          i.dateRange.startDate.getTime() === item.dateRange.startDate.getTime() &&
          i.dateRange.endDate.getTime() === item.dateRange.endDate.getTime()
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }

      return [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateItem = (item: CartItem) => {
    setItems((prev) =>
      prev.map((existingItem) =>
        existingItem.id === item.id ? item : existingItem
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const setLocation = (location: Location) => {
    setSelectedLocationState(location);
    // Clear cart when location changes
    clearCart();
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const pricing = calculatePricing(item);
      return total + pricing.subtotal;
    }, 0);
  };

  const getTaxes = (taxRate: number = 0.1) => {
    return getSubtotal() * taxRate;
  };

  const getDeliveryFee = () => {
    // Default delivery fee
    return items.length > 0 ? 15 : 0;
  };

  const getTotal = (taxRate: number = 0.1, deliveryFee?: number) => {
    const subtotal = getSubtotal();
    const taxes = subtotal * taxRate;
    const delivery = deliveryFee !== undefined ? deliveryFee : getDeliveryFee();
    return subtotal + taxes + delivery;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        selectedLocation,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        setLocation,
        getSubtotal,
        getTaxes,
        getDeliveryFee,
        getTotal,
        calculatePricing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

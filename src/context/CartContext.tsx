import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Location } from '@/types/rental';

interface CartContextType {
  items: CartItem[];
  selectedLocation: Location | null;
  addItem: (item: CartItem) => void;
  removeItem: (cartTypeId: string) => void;
  updateQuantity: (cartTypeId: string, quantity: number) => void;
  clearCart: () => void;
  setLocation: (location: Location) => void;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.cartType.id === item.cartType.id && i.rentalPeriod === item.rentalPeriod
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      
      return [...prev, item];
    });
  };

  const removeItem = (cartTypeId: string) => {
    setItems((prev) => prev.filter((item) => item.cartType.id !== cartTypeId));
  };

  const updateQuantity = (cartTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartTypeId);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.cartType.id === cartTypeId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const setLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const pricing = item.cartType.pricing;
      let price = 0;
      
      switch (item.rentalPeriod) {
        case 'hourly':
          price = (pricing.hourly || 0) * (item.hours || 2);
          break;
        case 'daily':
          const days = Math.ceil(
            (item.dateRange.endDate.getTime() - item.dateRange.startDate.getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          price = pricing.daily * Math.max(1, days);
          break;
        case 'weekly':
          price = pricing.weekly || pricing.daily * 7;
          break;
        case 'monthly':
          price = pricing.monthly || pricing.daily * 30;
          break;
      }
      
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        selectedLocation,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setLocation,
        getSubtotal,
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

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Reservation, PricingRule, InventoryAllocation, Location } from '@/types/rental';
import { reservations as initialReservations, pricingRules as initialPricingRules, inventoryAllocations as initialInventoryAllocations, locations as initialLocations } from '@/data/mockData';

type UserRole = 'renter' | 'rental_admin' | 'field_personnel';

interface AdminContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  
  // Reservations
  reservations: Reservation[];
  updateReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
  
  // Pricing
  pricingRules: PricingRule[];
  addPricingRule: (rule: PricingRule) => void;
  updatePricingRule: (rule: PricingRule) => void;
  deletePricingRule: (id: string) => void;
  
  // Inventory
  inventoryAllocations: InventoryAllocation[];
  updateInventoryAllocation: (allocation: InventoryAllocation) => void;
  
  // Locations
  locations: Location[];
  updateLocation: (location: Location) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('renter');
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules);
  const [inventoryAllocations, setInventoryAllocations] = useState<InventoryAllocation[]>(initialInventoryAllocations);
  const [locations, setLocations] = useState<Location[]>(initialLocations);

  const updateReservation = (reservation: Reservation) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservation.id ? reservation : r))
    );
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'cancelled', paymentStatus: 'refunded', cancelledAt: new Date() }
          : r
      )
    );
  };

  const addPricingRule = (rule: PricingRule) => {
    setPricingRules((prev) => [...prev, rule]);
  };

  const updatePricingRule = (rule: PricingRule) => {
    setPricingRules((prev) =>
      prev.map((r) => (r.id === rule.id ? rule : r))
    );
  };

  const deletePricingRule = (id: string) => {
    setPricingRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateInventoryAllocation = (allocation: InventoryAllocation) => {
    setInventoryAllocations((prev) =>
      prev.map((a) => (a.id === allocation.id ? allocation : a))
    );
  };

  const updateLocation = (location: Location) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === location.id ? location : l))
    );
  };

  return (
    <AdminContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        reservations,
        updateReservation,
        cancelReservation,
        pricingRules,
        addPricingRule,
        updatePricingRule,
        deletePricingRule,
        inventoryAllocations,
        updateInventoryAllocation,
        locations,
        updateLocation,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider } from "@/context/AdminContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import ReservationLookup from "./pages/ReservationLookup";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import ReservationsPage from "./pages/admin/Reservations";
import PricingPage from "./pages/admin/Pricing";
import InventoryPage from "./pages/admin/Inventory";
import LocationsPage from "./pages/admin/Locations";
import FieldOperationsPage from "./pages/admin/FieldOperations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <AdminProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation/:confirmationNumber" element={<Confirmation />} />
              <Route path="/reservation-lookup" element={<ReservationLookup />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reservations" element={<ReservationsPage />} />
              <Route path="/admin/pricing" element={<PricingPage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/locations" element={<LocationsPage />} />
              <Route path="/admin/field-operations" element={<FieldOperationsPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

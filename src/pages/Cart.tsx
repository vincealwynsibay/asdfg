import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Trash2, ShoppingBag, MapPin, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/types/rental';

const Cart = () => {
  const navigate = useNavigate();
  const { items, selectedLocation, removeItem, getSubtotal } = useCart();

  const getItemPrice = (item: CartItem) => {
    const pricing = item.cartType.pricing;
    switch (item.rentalPeriod) {
      case 'hourly':
        return (pricing.hourly || 0) * (item.hours || 2);
      case 'daily':
        const days = Math.max(1, differenceInDays(item.dateRange.endDate, item.dateRange.startDate));
        return pricing.daily * days;
      case 'weekly':
        return pricing.weekly || pricing.daily * 7;
      case 'monthly':
        return pricing.monthly || pricing.daily * 30;
      default:
        return pricing.daily;
    }
  };

  const getDuration = (item: CartItem) => {
    switch (item.rentalPeriod) {
      case 'hourly':
        return `${item.hours || 2} hours`;
      case 'daily':
        const days = Math.max(1, differenceInDays(item.dateRange.endDate, item.dateRange.startDate));
        return `${days} day${days > 1 ? 's' : ''}`;
      case 'weekly':
        return '1 week';
      case 'monthly':
        return '1 month';
      default:
        return '';
    }
  };

  const subtotal = getSubtotal();
  const taxRate = 0.12;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center space-y-4 p-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-sm">
              Start browsing our selection of golf carts, scooters, and e-bikes.
            </p>
            <Button onClick={() => navigate('/browse')} className="gradient-primary">
              Browse Vehicles
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2"
            onClick={() => navigate('/browse')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>

          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Location Info */}
              {selectedLocation && (
                <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{selectedLocation.name}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img 
                        src={item.cartType.imageUrl} 
                        alt={item.cartType.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{item.cartType.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(item.dateRange.startDate, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{getDuration(item)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {item.rentalPeriod} rate
                        </span>
                        <span className="font-semibold">
                          ${(getItemPrice(item) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-xl bg-card border border-border shadow-card">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes (12%)</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-6 gradient-primary"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Taxes and fees will be calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

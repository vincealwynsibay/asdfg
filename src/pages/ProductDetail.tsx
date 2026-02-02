import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, addHours, differenceInDays } from 'date-fns';
import { 
  ArrowLeft, 
  Users, 
  Zap, 
  Shield, 
  Check, 
  Minus, 
  Plus,
  Calendar,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cartTypes } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RentalPeriod, DateRange } from '@/types/rental';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedLocation, addItem } = useCart();
  
  const cart = cartTypes.find((c) => c.id === id);
  
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('daily');
  const [quantity, setQuantity] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 2),
  });
  const [hours, setHours] = useState(2);

  if (!cart) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Vehicle not found</h2>
            <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const periodOptions = [
    { value: 'hourly', label: 'Hourly', price: cart.pricing.hourly, available: !!cart.pricing.hourly },
    { value: 'daily', label: 'Daily', price: cart.pricing.daily, available: true },
    { value: 'weekly', label: 'Weekly', price: cart.pricing.weekly, available: !!cart.pricing.weekly },
    { value: 'monthly', label: 'Monthly', price: cart.pricing.monthly, available: !!cart.pricing.monthly },
  ].filter((opt) => opt.available);

  const calculatePrice = () => {
    switch (rentalPeriod) {
      case 'hourly':
        return (cart.pricing.hourly || 0) * hours;
      case 'daily':
        const days = Math.max(1, differenceInDays(dateRange.endDate, dateRange.startDate));
        return cart.pricing.daily * days;
      case 'weekly':
        return cart.pricing.weekly || cart.pricing.daily * 7;
      case 'monthly':
        return cart.pricing.monthly || cart.pricing.daily * 30;
      default:
        return cart.pricing.daily;
    }
  };

  const getRentalDuration = () => {
    switch (rentalPeriod) {
      case 'hourly':
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      case 'daily':
        const days = Math.max(1, differenceInDays(dateRange.endDate, dateRange.startDate));
        return `${days} day${days > 1 ? 's' : ''}`;
      case 'weekly':
        return '1 week';
      case 'monthly':
        return '1 month';
      default:
        return '';
    }
  };

  const handleAddToCart = () => {
    addItem({
      cartType: cart,
      quantity,
      rentalPeriod,
      dateRange,
      hours: rentalPeriod === 'hourly' ? hours : undefined,
    });
    toast.success(`Added ${quantity} ${cart.name} to cart`);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2"
            onClick={() => navigate('/browse')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img 
                  src={cart.imageUrl} 
                  alt={cart.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {cart.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="py-1.5">
                    <Check className="mr-1 h-3 w-3" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Details & Booking */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{cart.category === 'golf-cart' ? 'Golf Cart' : cart.category === 'scooter' ? 'Scooter' : 'E-Bike'}</Badge>
                  {cart.available <= 3 && (
                    <Badge variant="destructive">Only {cart.available} left</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-3">{cart.name}</h1>
                <p className="text-muted-foreground">{cart.description}</p>
              </div>

              {/* Quick Info */}
              <div className="flex items-center gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{cart.seats} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Electric</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Insured</span>
                </div>
              </div>

              {/* Requirements */}
              {(cart.requiresLicense || cart.minimumAge > 16) && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-accent">
                  <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent-foreground mb-1">Requirements</p>
                    <ul className="text-muted-foreground space-y-1">
                      {cart.requiresLicense && <li>• Valid driver's license required</li>}
                      <li>• Minimum age: {cart.minimumAge} years</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <div className="space-y-4 p-6 rounded-xl bg-card border border-border shadow-card">
                {/* Rental Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rental Period</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {periodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setRentalPeriod(option.value as RentalPeriod)}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all",
                          rentalPeriod === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="font-semibold">${option.price}</div>
                        <div className="text-xs text-muted-foreground">/{option.label.toLowerCase()}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                {rentalPeriod === 'hourly' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(dateRange.startDate, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => date && setDateRange({ ...dateRange, startDate: date })}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration</label>
                      <Select value={hours.toString()} onValueChange={(v) => setHours(parseInt(v))}>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8].map((h) => (
                            <SelectItem key={h} value={h.toString()}>
                              {h} hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : rentalPeriod === 'daily' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pick-up Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(dateRange.startDate, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => {
                              if (date) {
                                setDateRange({
                                  startDate: date,
                                  endDate: date >= dateRange.endDate ? addDays(date, 1) : dateRange.endDate,
                                });
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Return Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            {format(dateRange.endDate, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.endDate}
                            onSelect={(date) => date && setDateRange({ ...dateRange, endDate: date })}
                            disabled={(date) => date <= dateRange.startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(dateRange.startDate, 'MMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.startDate}
                          onSelect={(date) => date && setDateRange({ ...dateRange, startDate: date })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(cart.available, quantity + 1))}
                      disabled={quantity >= cart.available}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {cart.available} available
                    </span>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${calculatePrice().toFixed(2)} × {quantity} {cart.name}
                    </span>
                    <span>${(calculatePrice() * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{getRentalDuration()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Subtotal</span>
                    <span className="text-2xl font-bold text-primary">
                      ${(calculatePrice() * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full gradient-primary"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  User, 
  CreditCard,
  Check,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CustomerInfo, DeliveryInfo, CartItem, Reservation, ReservationItem, DeliveryAddress } from '@/types/rental';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ReservationService } from '@/services/localStorage';

type Step = 'delivery' | 'customer' | 'payment' | 'review';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'customer', label: 'Contact', icon: User },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Check },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, selectedLocation, getSubtotal, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState<Step>('delivery');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: 'pickup',
    address: '',
    instructions: '',
    timeWindow: 'morning',
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    driversLicense: '',
    dateOfBirth: '',
  });

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

  const subtotal = getSubtotal();
  const deliveryFee = deliveryInfo.type === 'delivery' ? 100 : 0;
  const taxRate = 0.12;
  const taxes = (subtotal + deliveryFee) * taxRate;
  const total = subtotal + deliveryFee + taxes;

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goToStep = (step: Step) => {
    const targetIndex = steps.findIndex((s) => s.id === step);
    if (targetIndex <= currentStepIndex || targetIndex === currentStepIndex + 1) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleSubmit = () => {
    // Generate confirmation and reservation numbers
    const confirmationNumber = `CONF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build reservation items from cart
    const reservationItems: ReservationItem[] = items.map((cartItem) => {
      const pricing = cartItem.cartType.pricing;
      let baseRate = 0;

      switch (cartItem.rentalPeriod) {
        case 'hourly':
          baseRate = pricing.hourly || 0;
          break;
        case 'daily':
          baseRate = pricing.daily;
          break;
        case 'weekly':
          baseRate = pricing.weekly || pricing.daily * 7;
          break;
        case 'monthly':
          baseRate = pricing.monthly || pricing.daily * 30;
          break;
        default:
          baseRate = pricing.daily;
      }

      const itemPrice = getItemPrice(cartItem);
      const subtotal = itemPrice * cartItem.quantity;

      return {
        id: `ITEM-${Math.random().toString(36).substr(2, 9)}`,
        cartTypeId: cartItem.cartType.id,
        rentalPeriod: cartItem.rentalPeriod,
        rentalStartDatetime: cartItem.dateRange.startDate,
        rentalEndDatetime: cartItem.dateRange.endDate,
        rentalQuantity: cartItem.quantity,
        baseRate,
        pricingBreakdown: {
          basePrice: baseRate,
          rentalPeriodPrice: itemPrice,
          quantity: cartItem.quantity,
          subtotal,
          total: subtotal,
        },
        status: 'confirmed',
      };
    });

    // Build delivery address if delivery
    let deliveryAddress: DeliveryAddress | undefined;
    if (deliveryInfo.type === 'delivery' && deliveryInfo.address) {
      deliveryAddress = {
        id: `ADDR-${Math.random().toString(36).substr(2, 9)}`,
        street: deliveryInfo.address,
        city: '',
        state: '',
        zipCode: '',
        country: 'PH',
        instructions: deliveryInfo.instructions,
      };
    }

    // Create reservation object
    const reservation: Reservation = {
      id: reservationId,
      confirmationNumber,
      locationId: selectedLocation?.id || '',
      reservationItems,
      customerInfo,
      delivery: {
        type: deliveryInfo.type,
        address: deliveryAddress,
        timeWindow: deliveryInfo.timeWindow,
      },
      subtotal,
      deliveryFee: deliveryInfo.type === 'delivery' ? 100 : 0,
      taxes,
      total,
      status: 'confirmed',
      paymentStatus: 'succeeded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to local storage
    try {
      ReservationService.create(reservation);
      toast.success('Reservation confirmed!');
      clearCart();
      navigate(`/confirmation/${confirmationNumber}`);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      toast.error('Failed to confirm reservation. Please try again.');
    }
  };

  const isStepValid = (step: Step) => {
    switch (step) {
      case 'delivery':
        return deliveryInfo.type === 'pickup' || 
          (deliveryInfo.type === 'delivery' && deliveryInfo.address && deliveryInfo.timeWindow);
      case 'customer':
        return customerInfo.firstName && customerInfo.lastName && 
          customerInfo.email && customerInfo.phone;
      case 'payment':
        return true; // Would validate payment in real app
      default:
        return true;
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : index < currentStepIndex
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Content */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-xl bg-card border border-border">
                {currentStep === 'delivery' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Delivery Options</h2>
                    
                    <RadioGroup
                      value={deliveryInfo.type}
                      onValueChange={(value: 'pickup' | 'delivery') =>
                        setDeliveryInfo({ ...deliveryInfo, type: value })
                      }
                    >
                      <div className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        deliveryInfo.type === 'pickup' ? "border-primary bg-primary/5" : "border-border"
                      )}>
                        <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                        <div className="flex-1">
                          <label htmlFor="pickup" className="font-medium cursor-pointer">
                            Pickup at Location
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pick up your rental at {selectedLocation?.name}
                          </p>
                          <p className="text-sm font-medium text-primary mt-2">Free</p>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        deliveryInfo.type === 'delivery' ? "border-primary bg-primary/5" : "border-border"
                      )}>
                        <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                        <div className="flex-1">
                          <label htmlFor="delivery" className="font-medium cursor-pointer">
                            Delivery to Your Location
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            We'll deliver to your address and pick it up when you're done
                          </p>
                          <p className="text-sm font-medium text-primary mt-2">$100 (delivery + pickup)</p>
                        </div>
                      </div>
                    </RadioGroup>

                    {deliveryInfo.type === 'delivery' && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                          <Label htmlFor="address">Delivery Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Main St, City"
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Preferred Time Window</Label>
                          <RadioGroup
                            value={deliveryInfo.timeWindow}
                            onValueChange={(value: 'morning' | 'afternoon' | 'evening') =>
                              setDeliveryInfo({ ...deliveryInfo, timeWindow: value })
                            }
                            className="flex flex-wrap gap-3"
                          >
                            {[
                              { value: 'morning', label: 'Morning', time: '9am - 12pm' },
                              { value: 'afternoon', label: 'Afternoon', time: '1pm - 4pm' },
                              { value: 'evening', label: 'Evening', time: '5pm - 8pm' },
                            ].map((window) => (
                              <div
                                key={window.value}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                                  deliveryInfo.timeWindow === window.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                <RadioGroupItem value={window.value} id={window.value} />
                                <label htmlFor={window.value} className="cursor-pointer">
                                  <div className="font-medium">{window.label}</div>
                                  <div className="text-xs text-muted-foreground">{window.time}</div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                          <Textarea
                            id="instructions"
                            placeholder="Gate code, building access, etc."
                            value={deliveryInfo.instructions}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, instructions: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 'customer' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Contact Information</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h3 className="font-medium mb-4">Driver Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="license">Driver's License Number</Label>
                          <Input
                            id="license"
                            value={customerInfo.driversLicense}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, driversLicense: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={customerInfo.dateOfBirth}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, dateOfBirth: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Payment Information</h2>
                    
                    <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Payment integration would go here.<br />
                        For demo purposes, click Continue to proceed.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Review Your Order</h2>
                    
                    {/* Items Summary */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img 
                              src={item.cartType.imageUrl} 
                              alt={item.cartType.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.cartType.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • {format(item.dateRange.startDate, 'MMM d')}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${(getItemPrice(item) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Info */}
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        {deliveryInfo.type === 'pickup' ? (
                          <MapPin className="h-5 w-5 text-primary" />
                        ) : (
                          <Truck className="h-5 w-5 text-primary" />
                        )}
                        <span className="font-medium">
                          {deliveryInfo.type === 'pickup' ? 'Pickup' : 'Delivery'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deliveryInfo.type === 'pickup' 
                          ? selectedLocation?.name 
                          : deliveryInfo.address}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-medium">Contact</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customerInfo.firstName} {customerInfo.lastName}<br />
                        {customerInfo.email}<br />
                        {customerInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => currentStepIndex > 0 && setCurrentStep(steps[currentStepIndex - 1].id)}
                    disabled={currentStepIndex === 0}
                  >
                    Back
                  </Button>

                  {currentStep === 'review' ? (
                    <Button className="gradient-primary" onClick={handleSubmit}>
                      Confirm Reservation
                    </Button>
                  ) : (
                    <Button
                      className="gradient-primary"
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep)}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-xl bg-card border border-border shadow-card">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes (12%)</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

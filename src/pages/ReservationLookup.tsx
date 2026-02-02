import { useState } from 'react';
import { Search, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format, addDays } from 'date-fns';

const ReservationLookup = () => {
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reservation, setReservation] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response - in real app would fetch from backend
    if (confirmationNumber.toUpperCase() === 'DEMO123') {
      setReservation({
        confirmationNumber: 'RR-DEMO123',
        status: 'confirmed',
        pickupDate: addDays(new Date(), 1),
        returnDate: addDays(new Date(), 3),
        location: {
          name: 'Mati Beachside Rentals',
          address: '123 Ocean Drive, Mati',
        },
        items: [
          { name: 'Golf Cart - Standard', quantity: 1 },
        ],
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        total: 336,
      });
    } else {
      setError('No reservation found with this confirmation number and email.');
      setReservation(null);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-12">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Find Your Reservation</h1>
              <p className="text-muted-foreground">
                Enter your confirmation number and email to view your booking details.
              </p>
            </div>

            {/* Lookup Form */}
            <form onSubmit={handleLookup} className="p-6 rounded-xl bg-card border border-border shadow-card mb-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmation Number</Label>
                  <Input
                    id="confirmation"
                    placeholder="e.g., DEMO123"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                  {isLoading ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Reservation
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Try "DEMO123" with any email to see a sample reservation.
              </p>
            </form>

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 mb-6">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Reservation Not Found</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Reservation Details */}
            {reservation && (
              <div className="p-6 rounded-xl bg-card border border-border shadow-card animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmation Number</p>
                    <p className="text-xl font-bold font-mono">{reservation.confirmationNumber}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium capitalize">
                    {reservation.status}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pick-up</p>
                      <p className="font-medium">{format(reservation.pickupDate, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Return</p>
                      <p className="font-medium">{format(reservation.returnDate, 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-lg bg-muted/50 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{reservation.location.name}</p>
                      <p className="text-sm text-muted-foreground">{reservation.location.address}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Your Rental</h3>
                  {reservation.items.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-border flex justify-between items-center mb-6">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">${reservation.total.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Modify Booking
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                    Cancel Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationLookup;

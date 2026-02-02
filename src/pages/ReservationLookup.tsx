import { useState } from 'react';
import { Search, Calendar, MapPin, Clock, AlertCircle, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAdmin } from '@/context/AdminContext';

const ReservationLookup = () => {
  const { reservations, cancelReservation } = useAdmin();
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundReservation, setFoundReservation] = useState<typeof reservations[0] | null>(null);
  const [error, setError] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find reservation by confirmation number and email
    const found = reservations.find(
      (res) => res.confirmationNumber === confirmationNumber && res.customerInfo.email === email
    );

    if (found) {
      setFoundReservation(found);
    } else {
      setError('No reservation found with this confirmation number and email.');
      setFoundReservation(null);
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    if (foundReservation) {
      cancelReservation(foundReservation.id);
      setError('');
      setFoundReservation(null);
      setConfirmationNumber('');
      setEmail('');
      setShowCancelDialog(false);
      setCancellationReason('');
    }
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
            {foundReservation && (
              <div className="p-6 rounded-xl bg-card border border-border shadow-card animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmation Number</p>
                    <p className="text-xl font-bold font-mono">{foundReservation.confirmationNumber}</p>
                  </div>
                  <Badge variant={foundReservation.status === 'cancelled' ? 'destructive' : 'default'}>
                    {foundReservation.status}
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <p className="font-medium">{foundReservation.customerInfo.firstName} {foundReservation.customerInfo.lastName}</p>
                  <p className="text-sm text-muted-foreground">{foundReservation.customerInfo.email}</p>
                  <p className="text-sm text-muted-foreground">{foundReservation.customerInfo.phone}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {foundReservation.reservationItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {item.rentalPeriod === 'daily' ? 'Rental Period' : 'Period'}
                        </p>
                        <p className="font-medium text-xs">
                          {format(new Date(item.rentalStartDatetime), 'MMM d, yyyy')} - {format(new Date(item.rentalEndDatetime), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location */}
                <div className="p-4 rounded-lg bg-muted/50 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{foundReservation.location?.name || 'Location TBD'}</p>
                      <p className="text-sm text-muted-foreground">{foundReservation.delivery.type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Your Rental ({foundReservation.reservationItems.length} item{foundReservation.reservationItems.length !== 1 ? 's' : ''})</h3>
                  {foundReservation.reservationItems.map((item, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      Cart Type: {item.cartTypeId} × {item.rentalQuantity} ({item.rentalPeriod})
                    </p>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-1 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${foundReservation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery:</span>
                    <span>${foundReservation.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>${foundReservation.taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">${foundReservation.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                  <p className="text-muted-foreground">Payment Status</p>
                  <Badge variant="secondary">{foundReservation.paymentStatus}</Badge>
                </div>

                {/* Actions */}
                {foundReservation.status !== 'cancelled' && (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2" disabled>
                      <Edit3 className="h-4 w-4" />
                      Modify (Coming Soon)
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 gap-2"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Reservation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to cancel this reservation? This action cannot be undone.
                  </p>
                  
                  <div>
                    <Label>Cancellation Reason (Optional)</Label>
                    <Textarea 
                      placeholder="Let us know why you're cancelling..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                    <p className="font-medium text-blue-900">Refund Policy</p>
                    <p className="text-xs text-blue-800 mt-1">
                      Refunds are processed according to your booking's cancellation policy. You will receive an email confirmation once the refund is processed.
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep Reservation
                  </Button>
                  <Button variant="destructive" onClick={handleCancel}>
                    Cancel Reservation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationLookup;

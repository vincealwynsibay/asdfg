import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Download,
  Share2,
  Home,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { ReservationService, CartTypeService, LocationService } from '@/services/localStorage';
import { useEffect, useState } from 'react';
import { Reservation, CartType, Location } from '@/types/rental';

const Confirmation = () => {
  const { confirmationNumber } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [cartTypes, setCartTypes] = useState<Record<string, CartType>>({});
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!confirmationNumber) {
      setLoading(false);
      return;
    }

    try {
      const res = ReservationService.getByConfirmationNumber(confirmationNumber);
      if (res) {
        setReservation(res);
        
        // Load cart types and location
        const types: Record<string, CartType> = {};
        res.reservationItems.forEach((item) => {
          const cartType = CartTypeService.getById(item.cartTypeId);
          if (cartType) {
            types[item.cartTypeId] = cartType;
          }
        });
        setCartTypes(types);

        const loc = LocationService.getById(res.locationId);
        if (loc) {
          setLocation(loc);
        }
      }
    } catch (error) {
      console.error('Failed to load reservation:', error);
    } finally {
      setLoading(false);
    }
  }, [confirmationNumber]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8 animate-fade-up">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Reservation Confirmed!</h1>
              <p className="text-muted-foreground">
                Your booking has been confirmed. Check your email for details.
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-card mb-6">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmation Number</p>
                  <p className="text-2xl font-bold font-mono">{reservation.confirmationNumber}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pick-up</p>
                    <p className="font-medium">{format(reservation.pickupDate, 'EEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className="font-medium">{format(reservation.returnDate, 'EEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 rounded-lg bg-muted/50 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{reservation.location.name}</p>
                    <p className="text-sm text-muted-foreground">{reservation.location.address}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                      <Phone className="h-4 w-4" />
                      <span>{reservation.location.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium">Your Rental</h3>
                {reservation.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-medium">Total Paid</span>
                <span className="text-2xl font-bold text-primary">${reservation.total.toFixed(2)}</span>
              </div>
            </div>

            {/* What's Next */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-semibold mb-4">What's Next?</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>Check your email for the confirmation and rental agreement.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0" />
                  <span>You'll receive a reminder 24 hours before your pickup.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>Bring your valid driver's license and the confirmation number.</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild className="flex-1 gradient-primary">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Reservation
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Confirmation;

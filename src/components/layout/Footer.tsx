import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">RentRide</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for golf cart, scooter, and e-bike rentals. Explore with freedom.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Rentals
                </Link>
              </li>
              <li>
                <Link to="/reservation-lookup" className="text-muted-foreground hover:text-primary transition-colors">
                  My Reservation
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+63 912 345 6789</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@rentride.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RentRide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

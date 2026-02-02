import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationCard } from '@/components/ui/location-card';
import { locations } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Index = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const { setLocation } = useCart();
  const navigate = useNavigate();

  const handleContinue = () => {
    const location = locations.find(l => l.id === selectedLocationId);
    if (location) {
      setLocation(location);
      navigate('/browse');
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Flexible Rentals',
      description: 'Hourly, daily, weekly, or monthly — rent on your terms.',
    },
    {
      icon: MapPin,
      title: 'Multiple Locations',
      description: 'Convenient pickup spots across the area.',
    },
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'All vehicles are insured for your peace of mind.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden gradient-hero">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          
          <div className="container relative py-16 md:py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Explore with freedom</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Rent Golf Carts, Scooters & E-Bikes
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Discover Mati your way. Easy online booking, competitive rates, and top-quality vehicles for your adventure.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="gradient-primary w-full sm:w-auto" onClick={() => document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' })}>
                  Start Booking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/reservation-lookup')}>
                  Find My Reservation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Selection */}
        <section id="locations" className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Pickup Location</h2>
              <p className="text-muted-foreground">
                Select a location to see available vehicles and start your booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  selected={selectedLocationId === location.id}
                  onClick={() => setSelectedLocationId(location.id)}
                />
              ))}
            </div>

            {selectedLocationId && (
              <div className="mt-8 flex justify-center animate-fade-up">
                <Button size="lg" className="gradient-primary" onClick={handleContinue}>
                  Continue to Browse Vehicles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

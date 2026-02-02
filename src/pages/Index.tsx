import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Shield, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationCard } from '@/components/ui/location-card';
import { locations } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const { setLocation } = useCart();
  const navigate = useNavigate();

  const handleContinue = () => {
    const location = locations.find(l => l.id === selectedLocationId);
    if (location && startDate && endDate) {
      setLocation(location);
      // Pass dates through URL or context
      sessionStorage.setItem('rentalStartDate', startDate);
      sessionStorage.setItem('rentalStartTime', startTime);
      sessionStorage.setItem('rentalEndDate', endDate);
      sessionStorage.setItem('rentalEndTime', endTime);
      navigate('/browse');
    }
  };

  const isFormValid = selectedLocationId && startDate && endDate && new Date(`${endDate}T${endTime}`) > new Date(`${startDate}T${startTime}`);

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
        {/* Hero Section with Search */}
        <section className="relative overflow-hidden gradient-hero min-h-screen flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          
          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              {/* Heading */}
              <div className="text-center mb-12 animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>Explore with freedom</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-4">
                  Rent Golf Carts, Scooters & E-Bikes
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                  Discover Mati your way. Easy online booking, competitive rates, and vehicles ready for your adventure.
                </p>
              </div>

              {/* Search Card */}
              <div className="bg-card border border-border rounded-2xl shadow-xl p-8 md:p-10 animate-fade-up">
                <h2 className="text-xl font-semibold mb-6">Find Your Perfect Rental</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Pickup Location
                    </Label>
                    <Select value={selectedLocationId || ''} onValueChange={setSelectedLocationId}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a location..." />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Start Time
                    </Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="h-12"
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      End Time
                    </Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="gradient-primary flex-1"
                    onClick={handleContinue}
                    disabled={!isFormValid}
                  >
                    Search Vehicles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/reservation-lookup')}
                  >
                    Find Reservation
                  </Button>
                </div>
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


      </main>

      <Footer />
    </div>
  );
};

export default Index;

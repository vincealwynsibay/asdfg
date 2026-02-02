import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, MapPin, ChevronDown, Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InventoryCard } from '@/components/ui/inventory-card';
import { cartTypes, locations } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type Category = 'all' | 'golf-cart' | 'scooter' | 'bike';

const Browse = () => {
  const navigate = useNavigate();
  const { selectedLocation, setLocation } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  
  // Date/Time filters from landing page
  const [startDate, setStartDate] = useState(() => sessionStorage.getItem('rentalStartDate') || '');
  const [startTime, setStartTime] = useState(() => sessionStorage.getItem('rentalStartTime') || '09:00');
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem('rentalEndDate') || '');
  const [endTime, setEndTime] = useState(() => sessionStorage.getItem('rentalEndTime') || '17:00');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All Vehicles' },
    { value: 'golf-cart', label: 'Golf Carts' },
    { value: 'scooter', label: 'Scooters' },
    { value: 'bike', label: 'E-Bikes' },
  ];

  const filteredCarts = useMemo(() => {
    return cartTypes.filter((cart) => {
      const matchesSearch = cart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cart.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleProductClick = (cartId: string) => {
    navigate(`/product/${cartId}`);
  };

  // If no location selected, redirect to home
  if (!selectedLocation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Please select a location first</h2>
            <p className="text-muted-foreground">Choose a pickup location to see available vehicles.</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1">
        {/* Location Bar */}
        <div className="sticky top-16 z-40 bg-background border-b border-border">
          <div className="container py-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                {/* Location Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 text-left">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">Pickup Location</span>
                        <span className="font-medium">{selectedLocation.name}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {locations.map((location) => (
                      <DropdownMenuItem
                        key={location.id}
                        onClick={() => setLocation(location)}
                        className={cn(
                          "flex flex-col items-start gap-1 py-3",
                          selectedLocation.id === location.id && "bg-primary/10"
                        )}
                      >
                        <span className="font-medium">{location.name}</span>
                        <span className="text-xs text-muted-foreground">{location.address}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Date/Time Filter Toggle */}
                <Button
                  variant={showDateFilter ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                >
                  <Calendar className="h-4 w-4" />
                  {startDate && endDate ? (
                    <>
                      {format(parseISO(startDate), 'MMM d')} - {format(parseISO(endDate), 'MMM d')}
                    </>
                  ) : (
                    'Select Dates'
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {/* Clear Dates Button */}
                {startDate && endDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      sessionStorage.removeItem('rentalStartDate');
                      sessionStorage.removeItem('rentalEndDate');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Date/Time Filter Expanded View */}
              {showDateFilter && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          sessionStorage.setItem('rentalStartDate', e.target.value);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Start Time</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          sessionStorage.setItem('rentalStartTime', e.target.value);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          sessionStorage.setItem('rentalEndDate', e.target.value);
                        }}
                        min={startDate}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">End Time</Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => {
                          setEndTime(e.target.value);
                          sessionStorage.setItem('rentalEndTime', e.target.value);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDateFilter(false)}
                  >
                    Apply Date Filter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Available Vehicles</h1>
            <div className="space-y-2 text-muted-foreground">
              <p>{filteredCarts.length} vehicles available at {selectedLocation.name}</p>
              {startDate && endDate && (
                <p className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Rental: {format(parseISO(startDate), 'MMM d, yyyy')} at {startTime} - {format(parseISO(endDate), 'MMM d, yyyy')} at {endTime}
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    selectedCategory === category.value && 'gradient-primary'
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          {filteredCarts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCarts.map((cart) => (
                <InventoryCard
                  key={cart.id}
                  cartType={cart}
                  onClick={() => handleProductClick(cart.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;

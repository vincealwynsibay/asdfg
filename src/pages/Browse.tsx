import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, MapPin, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';

type Category = 'all' | 'golf-cart' | 'scooter' | 'bike';

const Browse = () => {
  const navigate = useNavigate();
  const { selectedLocation, setLocation } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

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
          </div>
        </div>

        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Available Vehicles</h1>
            <p className="text-muted-foreground">
              {filteredCarts.length} vehicles available at {selectedLocation.name}
            </p>
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

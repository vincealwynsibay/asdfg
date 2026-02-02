import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Package, MapPin, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/context/AdminContext';
import { useCart } from '@/context/CartContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentRole, reservations, pricingRules, inventoryAllocations, locations, setCurrentRole } = useAdmin();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (currentRole === 'renter') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md p-8 text-center border-2">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            You are currently in Renter mode. Switch to Admin to manage the business.
          </p>
          <Button 
            className="w-full gradient-primary mb-3"
            onClick={() => setCurrentRole('rental_admin')}
          >
            Switch to Admin
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Renter
          </Button>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Reservations',
      value: reservations.length,
      icon: Users,
      color: 'from-blue-500/10 to-cyan-500/10',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Locations',
      value: locations.filter(l => l.retailEnabled).length,
      icon: MapPin,
      color: 'from-green-500/10 to-emerald-500/10',
      textColor: 'text-green-600',
    },
    {
      title: 'Pricing Rules',
      value: pricingRules.length,
      icon: Calendar,
      color: 'from-purple-500/10 to-pink-500/10',
      textColor: 'text-purple-600',
    },
    {
      title: 'Inventory Items',
      value: inventoryAllocations.reduce((sum, a) => sum + a.totalQuantity, 0),
      icon: Package,
      color: 'from-orange-500/10 to-amber-500/10',
      textColor: 'text-orange-600',
    },
  ];

  const navigationCards = [
    {
      id: 'reservations',
      title: 'Manage Reservations',
      description: 'View, edit, and manage customer reservations',
      icon: Users,
      path: '/admin/reservations',
    },
    {
      id: 'locations',
      title: 'Locations',
      description: 'Configure retail-enabled locations and settings',
      icon: MapPin,
      path: '/admin/locations',
    },
    {
      id: 'pricing',
      title: 'Pricing Rules',
      description: 'Create and manage dynamic pricing strategies',
      icon: Calendar,
      path: '/admin/pricing',
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Allocate and track inventory across locations',
      icon: Package,
      path: '/admin/inventory',
    },
    {
      id: 'field-ops',
      title: 'Field Operations',
      description: 'Day-of checkout and check-in management',
      icon: TrendingUp,
      path: '/admin/field-operations',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your rental business</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{currentRole === 'field_personnel' ? 'Field Staff' : 'Admin'}</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentRole('renter')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Renter Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards
            .filter(card => currentRole === 'rental_admin' || card.id === 'field-ops')
            .map((card) => {
              const Icon = card.icon;
              const isHovered = hoveredCard === card.id;
              return (
                <Card
                  key={card.id}
                  className="p-6 cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-primary/0 hover:border-l-primary"
                  onClick={() => navigate(card.path)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform ${isHovered ? 'scale-110' : ''}`}>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </Card>
              );
            })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reservations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reservations</h3>
            <div className="space-y-3">
              {reservations.slice(0, 3).map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{res.customerInfo.firstName} {res.customerInfo.lastName}</p>
                    <p className="text-xs text-muted-foreground">{res.confirmationNumber}</p>
                  </div>
                  <Badge variant={res.status === 'confirmed' ? 'default' : 'secondary'}>
                    {res.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Inventory Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
            <div className="space-y-3">
              {inventoryAllocations.slice(0, 3).map((alloc) => (
                <div key={alloc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Cart Type {alloc.cartTypeId.slice(0, 8)}...</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${(alloc.reservedQuantity / alloc.totalQuantity) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-medium">{alloc.availableQuantity}/{alloc.totalQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

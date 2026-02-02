import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/context/AdminContext';
import { PricingRule, RentalPeriod } from '@/types/rental';

const PricingPage = () => {
  const navigate = useNavigate();
  const { pricingRules, addPricingRule, updatePricingRule, deletePricingRule, locations } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    cartTypeId: '',
    locationId: '',
    rentalPeriod: 'daily' as RentalPeriod,
    price: 100,
    enabled: true,
  });

  const handleOpenDialog = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        cartTypeId: rule.cartTypeId,
        locationId: rule.locationId || '',
        rentalPeriod: rule.rentalPeriod,
        price: rule.price,
        enabled: rule.enabled,
      });
    } else {
      setEditingRule(null);
      setFormData({
        cartTypeId: '',
        locationId: '',
        rentalPeriod: 'daily',
        price: 100,
        enabled: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.cartTypeId || !formData.rentalPeriod) {
      alert('Please fill in required fields');
      return;
    }

    if (editingRule) {
      updatePricingRule({
        ...editingRule,
        ...formData,
        updatedAt: new Date(),
      });
    } else {
      addPricingRule({
        id: `pricing-${Date.now()}`,
        ...formData,
        startDate: new Date(),
        endDate: undefined,
        currency: 'USD',
        enabled: true,
        priority: 0,
        createdAt: new Date(),
        created_by_user_id: 'admin-001',
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      deletePricingRule(id);
    }
  };

  const periodLabels = {
    hourly: '$ per hour',
    daily: '$ per day',
    weekly: '$ per week',
    monthly: '$ per month',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pricing Rules</h1>
              <p className="text-sm text-muted-foreground">{pricingRules.length} rules configured</p>
            </div>
          </div>
          <Button className="gradient-primary gap-2" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="container py-8">
        {/* Pricing Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricingRules.length > 0 ? (
            pricingRules.map((rule) => (
              <Card key={rule.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{rule.cartTypeId}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.rentalPeriod === 'custom' ? 'Custom' : rule.rentalPeriod}
                    </p>
                  </div>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="bg-muted/50 p-3 rounded mb-3">
                  <p className="text-2xl font-bold">${rule.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {periodLabels[rule.rentalPeriod as keyof typeof periodLabels] || 'per period'}
                  </p>
                </div>

                {rule.locationId && (
                  <div className="text-xs text-muted-foreground mb-3">
                    Location: {rule.locationId.slice(0, 20)}...
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleOpenDialog(rule)}
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pricing rules configured yet</p>
              <Button className="mt-4 gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Create First Rule
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cart Type</label>
              <Input 
                placeholder="e.g., golf-cart-standard"
                value={formData.cartTypeId}
                onChange={(e) => setFormData({ ...formData, cartTypeId: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Location (Optional)</label>
              <Select value={formData.locationId} onValueChange={(value) => setFormData({ ...formData, locationId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Rental Period</label>
              <Select value={formData.rentalPeriod} onValueChange={(value) => setFormData({ ...formData, rentalPeriod: value as RentalPeriod })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Price</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">$</span>
                <Input 
                  type="number"
                  placeholder="100.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
              <label htmlFor="enabled" className="text-sm">Enable this rule</label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-primary" onClick={handleSave}>
              {editingRule ? 'Update' : 'Create'} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage;

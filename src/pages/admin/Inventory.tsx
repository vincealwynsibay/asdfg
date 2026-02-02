import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/context/AdminContext';
import { InventoryAllocation } from '@/types/rental';

const InventoryPage = () => {
  const navigate = useNavigate();
  const { inventoryAllocations, updateInventoryAllocation } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<InventoryAllocation | null>(null);
  const [formData, setFormData] = useState({
    totalQuantity: 0,
    reservedQuantity: 0,
    maintenanceQuantity: 0,
  });

  const handleOpenDialog = (allocation: InventoryAllocation) => {
    setEditingAllocation(allocation);
    setFormData({
      totalQuantity: allocation.totalQuantity,
      reservedQuantity: allocation.reservedQuantity,
      maintenanceQuantity: allocation.maintenanceQuantity,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingAllocation) {
      const availableQuantity = formData.totalQuantity - formData.reservedQuantity - formData.maintenanceQuantity;
      if (availableQuantity < 0) {
        alert('Reserved + Maintenance cannot exceed total quantity');
        return;
      }

      updateInventoryAllocation({
        ...editingAllocation,
        totalQuantity: formData.totalQuantity,
        reservedQuantity: formData.reservedQuantity,
        availableQuantity,
        maintenanceQuantity: formData.maintenanceQuantity,
        lastUpdated: new Date(),
      });
      setIsDialogOpen(false);
    }
  };

  const totalInventory = inventoryAllocations.reduce((sum, a) => sum + a.totalQuantity, 0);
  const totalReserved = inventoryAllocations.reduce((sum, a) => sum + a.reservedQuantity, 0);
  const totalAvailable = inventoryAllocations.reduce((sum, a) => sum + a.availableQuantity, 0);
  const totalMaintenance = inventoryAllocations.reduce((sum, a) => sum + a.maintenanceQuantity, 0);

  const utilizationRate = totalInventory > 0 ? Math.round((totalReserved / totalInventory) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">{inventoryAllocations.length} cart types tracked</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Inventory</p>
            <p className="text-3xl font-bold mt-2">{totalInventory}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{totalAvailable}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Reserved</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{totalReserved}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className="text-3xl font-bold mt-2 text-orange-600">{utilizationRate}%</p>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Cart Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Allocation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventoryAllocations.length > 0 ? (
                  inventoryAllocations.map((alloc) => {
                    const utilizationPercent = (alloc.reservedQuantity / alloc.totalQuantity) * 100 || 0;
                    const status = alloc.availableQuantity === 0 ? 'fully-booked' : 
                                   utilizationPercent > 75 ? 'high-demand' : 
                                   utilizationPercent > 50 ? 'moderate' : 'available';
                    
                    const statusColors = {
                      'fully-booked': 'bg-red-100 text-red-800',
                      'high-demand': 'bg-orange-100 text-orange-800',
                      'moderate': 'bg-yellow-100 text-yellow-800',
                      'available': 'bg-green-100 text-green-800',
                    };

                    return (
                      <tr key={alloc.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{alloc.cartTypeId}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{alloc.locationId}</td>
                        <td className="px-6 py-4 text-sm font-medium">{alloc.totalQuantity}</td>
                        <td className="px-6 py-4">
                          <div className="w-full max-w-xs">
                            <div className="flex gap-2 mb-1">
                              <span className="text-xs">Avail: {alloc.availableQuantity}</span>
                              <span className="text-xs">Res: {alloc.reservedQuantity}</span>
                              <span className="text-xs">Maint: {alloc.maintenanceQuantity}</span>
                            </div>
                            <Progress value={utilizationPercent} className="h-2" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusColors[status as keyof typeof statusColors]}>
                            {status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="gap-2"
                            onClick={() => handleOpenDialog(alloc)}
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No inventory allocations found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingAllocation && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Inventory Allocation</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cart Type</p>
                <p className="font-medium">{editingAllocation.cartTypeId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Location</p>
                <p className="font-medium">{editingAllocation.locationId}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Total Quantity</label>
                <Input 
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Reserved Quantity</label>
                <Input 
                  type="number"
                  value={formData.reservedQuantity}
                  onChange={(e) => setFormData({ ...formData, reservedQuantity: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">Items currently booked</p>
              </div>

              <div>
                <label className="text-sm font-medium">Maintenance Quantity</label>
                <Input 
                  type="number"
                  value={formData.maintenanceQuantity}
                  onChange={(e) => setFormData({ ...formData, maintenanceQuantity: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">Items under maintenance</p>
              </div>

              <div className="bg-muted/50 p-3 rounded">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {formData.totalQuantity - formData.reservedQuantity - formData.maintenanceQuantity}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="gradient-primary" onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryPage;

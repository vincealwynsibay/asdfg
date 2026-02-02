import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/context/AdminContext';

const FieldOperationsPage = () => {
  const navigate = useNavigate();
  const { reservations, updateReservation, currentRole, setCurrentRole } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<typeof reservations[0] | null>(null);
  const [operationMode, setOperationMode] = useState<'checkout' | 'checkin'>('checkout');
  const [notes, setNotes] = useState('');
  const [inventoryAssignment, setInventoryAssignment] = useState('');

  // Filter for upcoming reservations ready for checkout
  const checkoutReady = reservations.filter(r => r.status === 'confirmed' && r.delivery.type === 'pickup');
  const checkinReady = reservations.filter(r => r.status === 'in-progress' && r.delivery.type === 'pickup');

  const handleOpenDialog = (reservation: typeof reservations[0], mode: 'checkout' | 'checkin') => {
    setSelectedReservation(reservation);
    setOperationMode(mode);
    setNotes('');
    setInventoryAssignment('');
    setIsDialogOpen(true);
  };

  const handleCheckout = () => {
    if (!selectedReservation) return;
    
    const updatedItems = selectedReservation.reservationItems.map(item => ({
      ...item,
      status: 'checked-out' as const,
    }));

    updateReservation({
      ...selectedReservation,
      status: 'in-progress',
      reservationItems: updatedItems,
      checkoutAt: new Date(),
      notes: (selectedReservation.notes || '') + `\n[Field Ops] Checkout: ${notes}`,
      updatedAt: new Date(),
    });

    setIsDialogOpen(false);
  };

  const handleCheckin = () => {
    if (!selectedReservation) return;

    const updatedItems = selectedReservation.reservationItems.map(item => ({
      ...item,
      status: 'checked-in' as const,
    }));

    updateReservation({
      ...selectedReservation,
      status: 'completed',
      reservationItems: updatedItems,
      checkinAt: new Date(),
      notes: (selectedReservation.notes || '') + `\n[Field Ops] Check-in: ${notes}`,
      updatedAt: new Date(),
    });

    setIsDialogOpen(false);
  };

  const needsAttention = [
    ...checkoutReady.filter(r => {
      const now = new Date();
      const rentalStart = r.reservationItems[0]?.rentalStartDatetime;
      return rentalStart && (new Date(rentalStart).getTime() - now.getTime()) < 3600000; // Within 1 hour
    }),
  ];

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
              <h1 className="text-2xl font-bold">Field Operations</h1>
              <p className="text-sm text-muted-foreground">Manage day-of checkout and check-in</p>
            </div>
          </div>
          <Badge variant="secondary">Field Staff</Badge>
        </div>
      </div>

      <div className="container py-8">
        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <Card className="p-4 mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Upcoming Checkouts</p>
                <p className="text-sm text-orange-800">
                  {needsAttention.length} reservation(s) starting soon. Process checkouts below.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <Button 
            variant={operationMode === 'checkout' ? 'default' : 'ghost'}
            className={operationMode === 'checkout' ? 'gradient-primary' : ''}
            onClick={() => setOperationMode('checkout')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Checkout ({checkoutReady.length})
          </Button>
          <Button 
            variant={operationMode === 'checkin' ? 'default' : 'ghost'}
            className={operationMode === 'checkin' ? 'gradient-primary' : ''}
            onClick={() => setOperationMode('checkin')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Check-in ({checkinReady.length})
          </Button>
        </div>

        {/* Reservations List */}
        <div className="space-y-3">
          {operationMode === 'checkout' ? (
            checkoutReady.length > 0 ? (
              checkoutReady.map((res) => (
                <Card key={res.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-primary" />
                        <p className="font-semibold">
                          {res.customerInfo.firstName} {res.customerInfo.lastName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                        <div>
                          <p className="text-muted-foreground">Conf #:</p>
                          <p className="font-mono">{res.confirmationNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Items:</p>
                          <p>{res.reservationItems.length} cart(s)</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total:</p>
                          <p>${res.total.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone:</p>
                          <p>{res.customerInfo.phone}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="gap-2"
                      onClick={() => handleOpenDialog(res, 'checkout')}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Checkout
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reservations ready for checkout</p>
              </Card>
            )
          ) : checkinReady.length > 0 ? (
            checkinReady.map((res) => (
              <Card key={res.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <p className="font-semibold">
                        {res.customerInfo.firstName} {res.customerInfo.lastName}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                      <div>
                        <p className="text-muted-foreground">Conf #:</p>
                        <p className="font-mono">{res.confirmationNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items:</p>
                        <p>{res.reservationItems.length} cart(s)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total:</p>
                        <p>${res.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone:</p>
                        <p>{res.customerInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="gap-2"
                    variant="secondary"
                    onClick={() => handleOpenDialog(res, 'checkin')}
                  >
                    <XCircle className="h-4 w-4" />
                    Check-in
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reservations ready for check-in</p>
            </Card>
          )}
        </div>
      </div>

      {/* Operation Dialog */}
      {selectedReservation && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {operationMode === 'checkout' ? 'Process Checkout' : 'Process Check-in'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded text-sm">
                <p className="font-medium">{selectedReservation.customerInfo.firstName} {selectedReservation.customerInfo.lastName}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedReservation.confirmationNumber}</p>
              </div>

              {operationMode === 'checkout' ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Inventory Assignment</label>
                    <Input 
                      placeholder="e.g., Cart #A1, Cart #B5"
                      value={inventoryAssignment}
                      onChange={(e) => setInventoryAssignment(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify which vehicles/items are being checked out
                    </p>
                  </div>
                </>
              ) : null}

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea 
                  placeholder={operationMode === 'checkout' ? 
                    "e.g., Customer confirmed driver's license, no visible damage" :
                    "e.g., Items returned in good condition, minor scratches noted"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                <p className="font-medium mb-1">Checklist:</p>
                <ul className="space-y-1">
                  <li>✓ Verify customer ID</li>
                  <li>✓ Inspect items for damage</li>
                  <li>✓ Confirm all accessories included</li>
                  <li>✓ Take photos if damage present</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary"
                onClick={operationMode === 'checkout' ? handleCheckout : handleCheckin}
              >
                {operationMode === 'checkout' ? 'Checkout' : 'Check-in'} Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FieldOperationsPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, Search, Eye, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdmin } from '@/context/AdminContext';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

const ReservationsPage = () => {
  const navigate = useNavigate();
  const { reservations, updateReservation, cancelReservation } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedReservation, setSelectedReservation] = useState<typeof reservations[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.customerInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.confirmationNumber.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (reservation: typeof reservations[0]) => {
    updateReservation({
      ...reservation,
      status: 'confirmed',
      updatedAt: new Date(),
    });
    setSelectedReservation(null);
    setIsDetailOpen(false);
  };

  const handleCancel = (reservation: typeof reservations[0]) => {
    cancelReservation(reservation.id);
    setSelectedReservation(null);
    setIsDetailOpen(false);
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
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
              <h1 className="text-2xl font-bold">Manage Reservations</h1>
              <p className="text-sm text-muted-foreground">{filteredReservations.length} reservations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or confirmation #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Reservations List */}
        <div className="space-y-3">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((res) => (
              <Card key={res.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                setSelectedReservation(res);
                setIsDetailOpen(true);
              }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <p className="font-semibold truncate">
                          {res.customerInfo.firstName} {res.customerInfo.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{res.confirmationNumber}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{res.reservationItems.length} item(s)</span>
                      <span>•</span>
                      <span>${res.total.toFixed(2)}</span>
                      <span>•</span>
                      <span>{res.location?.name || 'Unknown Location'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[res.status as keyof typeof statusColors]}>
                      {res.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReservation(res);
                      setIsDetailOpen(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reservations found</p>
            </Card>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedReservation && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedReservation.customerInfo.firstName} {selectedReservation.customerInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedReservation.customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedReservation.customerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmation #</p>
                  <p className="font-medium">{selectedReservation.confirmationNumber}</p>
                </div>
              </div>

              {/* Reservation Items */}
              <div>
                <p className="font-semibold mb-2">Items</p>
                {selectedReservation.reservationItems.map((item, idx) => (
                  <div key={idx} className="text-sm p-2 rounded bg-muted/50 mb-2">
                    <p className="font-medium">Cart Type: {item.cartTypeId}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.rentalPeriod} • Qty: {item.rentalQuantity} • ${item.baseRate}/unit
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-muted/30 p-3 rounded space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${selectedReservation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>${selectedReservation.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>${selectedReservation.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${selectedReservation.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={statusColors[selectedReservation.status as keyof typeof statusColors]}>
                  {selectedReservation.status}
                </Badge>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              {selectedReservation.status === 'pending' && (
                <Button 
                  className="gap-2"
                  onClick={() => handleApprove(selectedReservation)}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {selectedReservation.status !== 'cancelled' && (
                <Button 
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleCancel(selectedReservation)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReservationsPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, Edit2, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/context/AdminContext';
import { Location } from '@/types/rental';

const LocationsPage = () => {
  const navigate = useNavigate();
  const { locations, updateLocation } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    retailDescription: '',
    retailEnabled: false,
  });

  const handleOpenDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      phone: location.phone,
      email: location.email || '',
      retailDescription: location.retailDescription || '',
      retailEnabled: location.retailEnabled,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingLocation) {
      updateLocation({
        ...editingLocation,
        ...formData,
      });
      setIsDialogOpen(false);
    }
  };

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
            <h1 className="text-2xl font-bold">Locations</h1>
            <p className="text-sm text-muted-foreground">{locations.filter(l => l.retailEnabled).length} retail locations active</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Location Image */}
              <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                <img 
                  src={location.imageUrl} 
                  alt={location.name}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{location.name}</h3>
                    <Badge variant={location.retailEnabled ? 'default' : 'secondary'}>
                      {location.retailEnabled ? 'Retail Active' : 'Retail Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{location.phone}</span>
                  </div>
                  {location.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{location.email}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {location.retailDescription && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {location.retailDescription}
                  </p>
                )}

                {/* Operating Hours */}
                <div className="text-xs text-muted-foreground mb-4 bg-muted/50 p-2 rounded">
                  <p className="font-medium mb-1">Hours (Today)</p>
                  <p>
                    {location.operatingHours.monday.closed ? 'Closed' : 
                      `${location.operatingHours.monday.open} - ${location.operatingHours.monday.close}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleOpenDialog(location)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowQRCode(location.id)}
                  >
                    <QrCode className="h-4 w-4" />
                    QR
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      {editingLocation && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Retail Description</label>
                <Textarea 
                  placeholder="Describe this location for renters..."
                  value={formData.retailDescription}
                  onChange={(e) => setFormData({ ...formData, retailDescription: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="retail"
                  checked={formData.retailEnabled}
                  onChange={(e) => setFormData({ ...formData, retailEnabled: e.target.checked })}
                />
                <label htmlFor="retail" className="text-sm">Enable retail rentals at this location</label>
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

      {/* QR Code Dialog */}
      {showQRCode && (
        <Dialog open={!!showQRCode} onOpenChange={() => setShowQRCode(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Location QR Code</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-primary mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">QR Code Preview</p>
                  <p className="text-xs mt-2 font-mono text-muted-foreground">
                    /rent?location={showQRCode}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                This QR code links to the rental page for this location. Scan to start booking!
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQRCode(null)}>
                Close
              </Button>
              <Button className="gradient-primary">Download QR Code</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LocationsPage;

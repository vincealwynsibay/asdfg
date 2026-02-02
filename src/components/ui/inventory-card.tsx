import { Users, Zap, ChevronRight } from 'lucide-react';
import { CartType } from '@/types/rental';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InventoryCardProps {
  cartType: CartType;
  onClick: () => void;
}

export function InventoryCard({ cartType, onClick }: InventoryCardProps) {
  const categoryLabels = {
    'golf-cart': 'Golf Cart',
    'scooter': 'Scooter',
    'bike': 'E-Bike',
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 group hover:shadow-elevated hover:border-primary/30"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={cartType.imageUrl}
          alt={cartType.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {categoryLabels[cartType.category]}
          </Badge>
          {cartType.available <= 3 && (
            <Badge variant="destructive" className="bg-destructive/90 backdrop-blur-sm">
              Only {cartType.available} left
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{cartType.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {cartType.description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{cartType.seats} seats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4" />
            <span>Electric</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1 pt-2 border-t border-border">
          <span className="text-2xl font-bold text-primary">
            ${cartType.pricing.daily}
          </span>
          <span className="text-sm text-muted-foreground">/day</span>
          {cartType.pricing.hourly && (
            <span className="text-sm text-muted-foreground ml-auto">
              From ${cartType.pricing.hourly}/hr
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

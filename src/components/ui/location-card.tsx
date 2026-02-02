import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react';
import { Location } from '@/types/rental';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  selected?: boolean;
  onClick: () => void;
}

// Helper function to format operating hours
function formatOperatingHours(operatingHours: Location['operatingHours']): string {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group consecutive days with same hours
  const groups: Array<{ days: string; hours: string }> = [];
  let currentGroup: { days: string[]; hours: string } | null = null;
  
  days.forEach((day, index) => {
    const dayHours = operatingHours[day];
    const hoursStr = dayHours.closed 
      ? 'Closed' 
      : `${dayHours.open} - ${dayHours.close}`;
    
    if (currentGroup && currentGroup.hours === hoursStr) {
      currentGroup.days.push(dayNames[index]);
    } else {
      if (currentGroup) {
        groups.push({
          days: currentGroup.days.length > 1 
            ? `${currentGroup.days[0]}-${currentGroup.days[currentGroup.days.length - 1]}`
            : currentGroup.days[0],
          hours: currentGroup.hours
        });
      }
      currentGroup = { days: [dayNames[index]], hours: hoursStr };
    }
  });
  
  // Add the last group
  if (currentGroup) {
    groups.push({
      days: currentGroup.days.length > 1 
        ? `${currentGroup.days[0]}-${currentGroup.days[currentGroup.days.length - 1]}`
        : currentGroup.days[0],
      hours: currentGroup.hours
    });
  }
  
  return groups.map(g => `${g.days}: ${g.hours}`).join(', ');
}

export function LocationCard({ location, selected, onClick }: LocationCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border-2 overflow-hidden transition-all duration-200 group",
        "hover:shadow-elevated hover:border-primary/50",
        selected ? "border-primary shadow-elevated" : "border-border"
      )}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={location.imageUrl}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {selected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Selected
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{location.name}</h3>
          <ChevronRight className={cn(
            "h-5 w-5 text-muted-foreground transition-colors",
            selected && "text-primary"
          )} />
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location.address}, {location.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatOperatingHours(location.operatingHours)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{location.phone}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

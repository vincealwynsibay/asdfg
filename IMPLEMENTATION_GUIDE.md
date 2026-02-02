# Retail Rental System - Implementation Guide

## Overview

This is a complete MVP implementation of a location-based retail rental system for golf carts, scooters, and e-bikes. The system supports three distinct user roles with separate workflows:

- **Renters**: Browse inventory, manage reservations, checkout
- **Rental Admins**: Manage pricing, inventory, locations, reservations
- **Field Personnel**: Day-of checkout and check-in operations

## Architecture

### Data Model

The system uses a local state management approach with React Context for:
- **CartContext**: Manages shopping cart and location selection for renters
- **AdminContext**: Manages reservations, pricing, inventory, and locations for admin/field staff

### Project Structure

```
/src
├── pages/
│   ├── Index.tsx              # Landing page & location selector
│   ├── Browse.tsx             # Product browsing with filters
│   ├── ProductDetail.tsx      # Individual cart/vehicle details
│   ├── Cart.tsx               # Shopping cart management
│   ├── Checkout.tsx           # Checkout flow
│   ├── Confirmation.tsx       # Booking confirmation
│   ├── ReservationLookup.tsx  # Guest reservation lookup
│   └── admin/
│       ├── Dashboard.tsx      # Admin dashboard with stats
│       ├── Reservations.tsx   # Reservation management
│       ├── Pricing.tsx        # Pricing rule management
│       ├── Inventory.tsx      # Inventory allocation
│       ├── Locations.tsx      # Location configuration
│       └── FieldOperations.tsx # Checkout/check-in workflow
├── context/
│   ├── CartContext.tsx        # Renter cart state
│   └── AdminContext.tsx       # Admin operations state
├── types/
│   └── rental.ts              # TypeScript interfaces
├── data/
│   └── mockData.ts            # Mock data for demo
└── components/
    └── layout/
        ├── Header.tsx         # Navigation header
        └── Footer.tsx         # Footer component
```

## Key Features

### Renter Features (RE-001 through RE-025)

1. **Location Selection** - Browse retail-enabled locations
2. **Inventory Browsing** - Filter by category, search, view pricing
3. **Cart Management** - Add items, modify quantities, change rental periods
4. **Flexible Pricing** - Support for hourly, daily, weekly, monthly rentals
5. **Checkout** - Payment information, delivery/pickup selection
6. **Reservation Management** - View, modify (coming soon), cancel reservations
7. **Guest Access** - View and cancel reservations without login via confirmation number + email

### Admin Features (RA-001 through RA-024)

1. **Pricing Management**
   - Create pricing rules by cart type, location, and rental period
   - Edit and delete rules
   - Support for special pricing and day-of-week pricing

2. **Inventory Management**
   - Allocate inventory across locations
   - Track reserved, available, and maintenance quantities
   - Real-time availability visualization

3. **Location Management**
   - Configure retail-enabled locations
   - Set operating hours
   - Generate QR codes for location-specific rental pages

4. **Reservation Management**
   - View all reservations with filtering
   - Approve pending reservations
   - Cancel reservations with refund processing
   - View detailed customer and item information

### Field Personnel Features

1. **Checkout Operations**
   - Process checkout for confirmed reservations
   - Assign inventory items to reservations
   - Record checkout notes and inspections

2. **Check-in Operations**
   - Process check-in for active rentals
   - Record condition notes and damage assessment
   - Complete rental workflow

## Role Switching

The system includes a role-switching mechanism accessible from:
- **Admin Dashboard**: Button to switch to "Renter Mode"
- **Renter Pages**: Access admin panel via header (visible when in admin role)

Switch roles by:
1. Navigating to `/admin` dashboard
2. Clicking "Renter Mode" button to return to renter experience
3. Header automatically updates to show relevant navigation

## User Flows

### Renter Workflow
```
Home → Select Location → Browse Inventory → Add to Cart → 
Checkout → Payment → Confirmation → View Reservation → 
Lookup/Modify/Cancel
```

### Admin Workflow
```
Dashboard → [Reservations/Pricing/Inventory/Locations/Field Ops] → 
Create/Edit/View/Delete operations
```

### Field Personnel Workflow
```
Dashboard → Field Operations → [Checkout/Check-in] → 
Process operation → Record notes
```

## Data Schema

### Key Models

**Location**
- id, name, address, city, state
- phone, email, operatingHours
- retailEnabled, retailDescription
- imageUrl, coordinates

**CartType** (Inventory Item)
- id, name, description, category
- seats, features, requiresLicense, minimumAge
- pricing (hourly, daily, weekly, monthly)
- available quantity

**PricingRule**
- id, cartTypeId, locationId (optional)
- rentalPeriod, price, currency
- startDate, endDate, priority
- enabled status, special pricing flags

**Reservation**
- id, confirmationNumber, locationId
- customerInfo (name, email, phone, company)
- reservationItems (with rental period, quantity, dates)
- delivery info (pickup or delivery with address)
- pricing breakdown and totals
- status and payment status tracking

**InventoryAllocation**
- id, cartTypeId, locationId
- totalQuantity, reservedQuantity, availableQuantity
- maintenanceQuantity, lastUpdated

## Local Storage

The system persists:
- **Cart contents** - survives page refreshes for renters
- **Selected location** - persists across browse session
- **Reservation history** - maintained in AdminContext

**Note**: In production, all data should be backed by a database (PostgreSQL, Supabase, etc.)

## Pricing Calculation

The system calculates pricing based on:
1. **Rental Period**: hourly, daily, weekly, or monthly
2. **Date Range**: automatically calculates number of periods
3. **Quantity**: number of items × periods
4. **Surcharges**: delivery fees, taxes
5. **Discounts**: promotional codes (structure ready)

Example: 2 golf carts for 3 days at $150/day = (2 × $150 × 3) = $900

## Reservation Lifecycle

```
Pending → Confirmed → In-Progress (checked out) → Completed (checked in)
   ↓
Cancelled (can happen at any stage)
```

## Guest Access

Guests can:
1. Lookup reservations via confirmation number + email
2. View full reservation details
3. Modify reservation (structure in place)
4. Cancel reservation with refund processing
5. All actions done without creating an account

## API Integration Points (Ready for Backend)

The following are ready to connect to a real backend:

- `handleLookup()` - Connect to GET /reservations/lookup
- `updateReservation()` - Connect to PATCH /reservations/:id
- `cancelReservation()` - Connect to DELETE /reservations/:id
- Pricing rules CRUD - Connect to /pricing-rules endpoints
- Inventory updates - Connect to /inventory endpoints

## How to Run

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:5173
4. Start in renter mode by default
5. Access admin by clicking "Admin" button or visiting `/admin`

## Testing the MVP

### Test Account Access
- Click the "Admin" button in header (when visible) or navigate to `/admin`
- Dashboard shows mock data for all reservations, pricing rules, and inventory
- Switch between Admin and Renter modes

### Test Renter Flow
1. Home page → Select location
2. Browse → Filter products
3. Add to cart → Modify quantities
4. View cart → Update pricing

### Test Admin Flow
1. Dashboard → View stats
2. Reservations → Filter, view details, cancel
3. Pricing → Create new rules, edit existing
4. Inventory → View allocation, update quantities
5. Locations → View and edit location details
6. Field Ops → Process checkout/check-in

### Test Guest Access
1. Go to Reservation Lookup
2. Try "CONF-001-2026" (from mock data) with email matching the reservation
3. View, modify (when enabled), or cancel reservation

## Deployment Considerations

- Add Stripe integration for real payments
- Connect to PostgreSQL database (Supabase recommended)
- Implement proper authentication (Auth.js or Supabase Auth)
- Add email notifications for confirmations and updates
- Implement QR code generation for location links
- Set up SMS reminders for upcoming pickups/returns
- Add image upload for location photos and damage reports

## Future Enhancements

1. **Advanced Pricing**: Seasonal pricing, bulk discounts, loyalty programs
2. **Availability Calendar**: Visual calendar for each location
3. **Analytics Dashboard**: Revenue reports, popular items, booking trends
4. **Notifications**: Email/SMS reminders and updates
5. **Payment Processing**: Full Stripe integration
6. **User Accounts**: Full authentication system
7. **Mobile App**: React Native version
8. **Multi-language**: i18n support
9. **Maps Integration**: Location finder with directions
10. **Damage Assessment**: Photo uploads and damage reporting

## Database Migration (When Connecting Backend)

Use the SQL scripts from the design document to:
1. Create retail_pricing table
2. Create retail_pricing_by_reservation_item junction table
3. Add retail-specific fields to locations, res_items, and reservations
4. Create get_or_create_retail_event() function
5. Set up Row Level Security policies

## Troubleshooting

**Issue**: Roles don't persist across page refresh
- **Solution**: Implement Redux or Zustand for persistent state management

**Issue**: Cart clears when changing locations
- **Solution**: This is intentional (RE-006), but can be changed to merge carts if needed

**Issue**: Mock data doesn't match schema
- **Solution**: Data has been structured to match all TypeScript interfaces exactly

## Code Quality

- Fully typed with TypeScript
- Component-based architecture
- Reusable UI components (shadcn/ui)
- Context API for state management
- Responsive design with Tailwind CSS
- Accessibility considerations (ARIA labels, semantic HTML)

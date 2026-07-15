export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Ride {
  id: string;
  customerId: string;
  driverId?: string;
  status: RideStatus;
  pickupLocation: Location;
  dropoffLocation: Location;
  fare: number;
  createdAt: string;
  updatedAt: string;
}

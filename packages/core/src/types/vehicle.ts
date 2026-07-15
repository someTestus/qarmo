// Phase 1: auto only. 'cab' excluded pending licensing approval.
export type VehicleType = 'auto' | 'bike' | 'scooter' | 'bicycle';

export interface Vehicle {
  id: string;
  ownerId: string;
  type: VehicleType;
  registrationNumber: string;
  model: string;
  color: string;
  role: 'auto_driver' | 'delivery_executive';
  isActive: boolean;
}

export type UserRole = 'customer' | 'auto_driver' | 'delivery_executive' | 'restaurant_owner';

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  roles: UserRole[];
  avatarUrl?: string;
  referralCode?: string;
  createdAt: string;
  isVerified: boolean;
}

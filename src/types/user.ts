export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  };
}
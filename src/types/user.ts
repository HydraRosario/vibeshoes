export interface User {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
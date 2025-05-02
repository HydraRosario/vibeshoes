export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
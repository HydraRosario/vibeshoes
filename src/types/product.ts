export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}
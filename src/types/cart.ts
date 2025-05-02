export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: Date;
}
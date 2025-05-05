export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  selectedColor: string;
  selectedSize: string | number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: Date;
}
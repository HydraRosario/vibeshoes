export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  selectedColor?: string;
  selectedSize?: string | number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pendiente' | 'aceptado' | 'enviado';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userEmail?: string;
  userName?: string;
}
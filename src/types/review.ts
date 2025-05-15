export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  orderId: string; // Para asegurar que sólo se puede dejar review si se compró
}

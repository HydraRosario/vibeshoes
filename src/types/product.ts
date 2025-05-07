export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  variations: Variation[];
  category?: string;
  onSale?: boolean; // For the 15% discount feature
}

export interface Variation {
  color: string;
  tallesDisponibles: (number | string)[];
  images: string[];
  stock: number;
  price?: number; // Optional price per variation
}

export interface SizeStock {
  size: number | string;
  stock: number;
  price: number;
}

// En el admin, al guardar las variaciones, asegúrate de convertir stock y price a number:
// Ejemplo en handleSubmit:
// sizes: v.sizes.map(s => ({
//   size: s.size,
//   stock: Number(s.stock),
//   price: Number(s.price)
// }))

// Tipo auxiliar para pasar selección de variación/talle a addToCart
export interface ProductWithSelection extends Product {
  selectedColor: string;
  selectedSize: string | number;
  imageUrl: string;
  price: number;
  stock: number;
}
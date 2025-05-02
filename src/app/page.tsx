'use client';

import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';

// Test data - replace with actual data from Firebase later
const testProducts: Product[] = [
  {
    id: '1',
    name: 'Zapatilla Cool 1',
    price: 120.00,
    stock: 15,
    description: 'Zapatillas deportivas con estilo único.',
    imageUrl: 'https://placehold.co/400x400/sunset/white?text=Cool+1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Corredora Elegante',
    price: 150.00,
    stock: 8,
    description: 'Zapatillas perfectas para running.',
    imageUrl: 'https://placehold.co/400x400/gray/white?text=Elegante',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Clásica Bota Alta',
    price: 100.00,
    stock: 12,
    description: 'Bota clásica para todo uso.',
    imageUrl: 'https://placehold.co/400x400/city/white?text=Clasica',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Bienvenido a VIBE SHOES</h1>
          <p className="text-xl mb-8">Tu fuente exclusiva para las últimas zapatillas a precios imbatibles. Empieza tu colección hoy.</p>
          <a href="/products" className="inline-block bg-white text-red-700 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
            Comprar Ahora
          </a>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Zapatillas Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <a href="/products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors">
            Ver Todos los Productos
          </a>
        </div>
      </div>
    </div>
  );
}

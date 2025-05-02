'use client';

import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import { getProducts } from '@/features/products';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        // Puedes mostrar un mensaje de error si quieres
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <a href="/products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors">
            Ver Todos los Productos
          </a>
        </div>
      </div>
    </div>
  );
}

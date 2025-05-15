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
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="bg-white overflow-hidden">
        {/* Fondo SVG animado */}
        <div className="absolute inset-0 -z-10 animate-gradient-move">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#be123c" fillOpacity="0.15" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-black">Bienvenido a <span className="text-black px-3 py-1 rounded-xl border border-gray-200 shadow-sm bg-white">VIBE SHOES</span></h1>
          <p className="text-2xl md:text-3xl mb-10 text-gray-700 font-light">Tu fuente exclusiva para las últimas zapatillas premium.<br className="hidden md:block" /> Empieza tu colección hoy.</p>
          <a href="/products" className="inline-block bg-white border border-gray-300 text-black px-10 py-4 rounded-full font-bold text-lg shadow hover:shadow-lg hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-200">
            Comprar Ahora
          </a>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-extrabold mb-10 text-center text-black animate-fade-in">Zapatillas Destacadas</h2>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 animate-fade-in-up">
            {products.map((product, idx) => (
              <div key={product.id} style={{ animationDelay: `${idx * 80}ms` }} className="animate-fade-in-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-16">
          <a href="/products" className="inline-block bg-[#FFD700] border border-[#FFD700] text-black px-10 py-4 rounded-full font-bold text-lg shadow hover:shadow-lg hover:bg-black hover:text-[#FFD700] hover:border-black transition-all duration-200">
            Ver Todos los Productos
          </a>
        </div>
      </div>
    </div>
  );
}

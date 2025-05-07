'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { getProducts } from '@/features/products';
import { ProductCard } from '@/components/ProductCard';
import { FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDiscounted, setShowDiscounted] = useState<boolean>(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(productsData.map(product => product.category).filter(Boolean))
        ) as string[];
        
        setCategories(uniqueCategories);
        setProducts(productsData);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
  
  // Filter products based on selected category and discount status
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesDiscount = !showDiscounted || product.onSale === true;
    return matchesCategory && matchesDiscount;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nuestros Productos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/* Category filter */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-gray-500" />
              <select 
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Discount filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="discountFilter"
              checked={showDiscounted}
              onChange={() => setShowDiscounted(!showDiscounted)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="discountFilter" className="text-sm font-medium text-gray-700">
              Ver productos en oferta (15% OFF)
            </label>
          </div>
        </div>
      </div>
      
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No hay productos disponibles.</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No hay productos que coincidan con los filtros seleccionados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} showVariationsGrid={true} />
          ))}
        </div>
      )}
    </div>
  );
}
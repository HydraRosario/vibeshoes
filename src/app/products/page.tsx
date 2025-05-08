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
  const [sortOption, setSortOption] = useState<string>('none');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [availableSizes, setAvailableSizes] = useState<(number | string)[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(productsData.map(product => product.category).filter(Boolean))
        ) as string[];
        
        // Extract all available sizes from all products
        const allSizes = new Set<number | string>();
        productsData.forEach(product => {
          if (product.variations && product.variations.length > 0) {
            product.variations.forEach(variation => {
              if (variation.tallesDisponibles && variation.tallesDisponibles.length > 0) {
                variation.tallesDisponibles.forEach(size => {
                  allSizes.add(size);
                });
              }
            });
          }
        });
        
        // Convert to array and sort numerically
        const sizeArray = Array.from(allSizes).sort((a, b) => {
          const numA = typeof a === 'string' ? parseInt(a) : a;
          const numB = typeof b === 'string' ? parseInt(b) : b;
          return numA - numB;
        });
        
        setAvailableSizes(sizeArray);
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
  
  // Filter and sort products
  const filteredAndSortedProducts = products.filter(product => {
    // Category filter
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    // Discount filter
    const matchesDiscount = !showDiscounted || product.onSale === true;
    
    // Size filter
    let matchesSize = true;
    if (selectedSize !== 'all') {
      matchesSize = false;
      const sizeToMatch = selectedSize;
      
      // Check if any variation has this size available
      if (product.variations && product.variations.length > 0) {
        for (const variation of product.variations) {
          if (variation.tallesDisponibles && variation.tallesDisponibles.includes(Number(sizeToMatch)) || 
              variation.tallesDisponibles && variation.tallesDisponibles.includes(sizeToMatch)) {
            matchesSize = true;
            break;
          }
        }
      }
    }
    
    return matchesCategory && matchesDiscount && matchesSize;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Nuestros Productos</h1>
        </div>
        
        {/* Filters section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
            Filtros y Ordenamiento
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-800">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Size filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Talle</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="all">Todos los talles</option>
                {availableSizes.map(size => (
                  <option key={size.toString()} value={size.toString()}>{size}</option>
                ))}
              </select>
            </div>
            
            {/* Sort options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="none">Relevancia</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
            </div>
            
            {/* Discount filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="discountFilter"
                checked={showDiscounted}
                onChange={() => setShowDiscounted(!showDiscounted)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="discountFilter" className="ml-2 text-sm font-medium text-gray-700">
                Ver productos en oferta (15% OFF)
              </label>
            </div>
          </div>
        </div>
        
        {products.length === 0 ? (
          <p className="text-center text-gray-600 bg-gray-100 p-4 rounded-lg">No hay productos disponibles.</p>
        ) : filteredAndSortedProducts.length === 0 ? (
          <p className="text-center text-gray-600 bg-gray-100 p-4 rounded-lg">No hay productos que coincidan con los filtros seleccionados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showVariationsGrid={true} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
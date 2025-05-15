'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { getProducts } from '@/features/products';
import { ProductCard } from '@/components/ProductCard';
import { FunnelIcon as FilterIcon } from '@heroicons/react/24/outline';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
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
    // Name search filter
    const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());

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
    
    return matchesName && matchesDiscount && matchesSize;
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
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin"></div>
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-yellow-400 animate-spin absolute top-4 left-4"></div>
          <div className="absolute top-10 left-10 flex items-center justify-center">
            <svg className="h-4 w-4 text-pink-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">Descubre Nuestros Productos</h1>
        </div>
        
        {/* Filters section */}
        <div className="bg-gradient-to-r from-pink-50 via-white to-yellow-50 p-5 rounded-2xl shadow-xl mb-8 border-2 border-pink-100 transform hover:shadow-pink-200 transition-all duration-300 animate-fade-in">
          <h2 className="text-lg font-extrabold mb-4 flex items-center text-pink-700">
            <FilterIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Personaliza tu búsqueda
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search by name */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="min-w-[200px] px-4 py-3 text-sm bg-white text-gray-800 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition-all shadow-md group-hover:shadow-pink-200"
              />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-yellow-300 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            {/* Size filter */}
            <div className="relative group">
              <select 
                className="min-w-[120px] px-4 py-3 text-sm bg-white text-gray-800 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition-all shadow-md appearance-none group-hover:shadow-pink-200"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23EC4899'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px', paddingRight: '40px'}}
              >
                <option value="all">Todos los talles</option>
                {availableSizes.map(size => (
                  <option key={size.toString()} value={size.toString()}>{size}</option>
                ))}
              </select>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-yellow-300 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            {/* Sort options */}
            <div className="relative group">
              <select 
                className="min-w-[160px] px-4 py-3 text-sm bg-white text-gray-800 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition-all shadow-md appearance-none group-hover:shadow-pink-200"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23EC4899'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px', paddingRight: '40px'}}
              >
                <option value="none">Ordenar por</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-yellow-300 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            {/* Discount filter - solo si hay productos en oferta */}
            {products.some(p => p.onSale) && (
              <div className="flex items-center bg-white px-4 py-3 rounded-xl border-2 border-pink-200 shadow-md hover:shadow-pink-200 transition-all">
                <input
                  type="checkbox"
                  id="discountFilter"
                  checked={showDiscounted}
                  onChange={() => setShowDiscounted(!showDiscounted)}
                  className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-yellow-300 rounded"
                />
                <label htmlFor="discountFilter" className="ml-2 text-sm font-bold text-pink-700">
                  Solo productos en oferta
                </label>
              </div>
            )}
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="bg-gradient-to-r from-pink-50 via-white to-yellow-50 p-10 rounded-3xl shadow-xl border-2 border-pink-100 text-center animate-fade-in">
            <svg className="w-16 h-16 mx-auto text-pink-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-xl font-bold text-pink-700 mb-2">No hay productos disponibles</p>
            <p className="text-gray-600">Volveremos pronto con nuevos productos increíbles.</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="bg-gradient-to-r from-pink-50 via-white to-yellow-50 p-10 rounded-3xl shadow-xl border-2 border-pink-100 text-center animate-fade-in">
            <svg className="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p className="text-xl font-bold text-pink-700 mb-2">No encontramos coincidencias</p>
            <p className="text-gray-600">Prueba ajustando los filtros para ver más resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map((product, index) => (
              <div key={product.id} 
                className="transform hover:scale-[1.03] transition-all duration-300" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <ProductCard product={product} showVariationsGrid={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
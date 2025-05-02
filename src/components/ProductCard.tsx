import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { addToCart } from '@/features/cart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addToCart(user.id, product, 1);
      toast.success('¡Producto agregado al carrito!');
    } catch (error) {
      setError('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="block group focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-2xl group-active:scale-100">
        <div className="aspect-w-1 aspect-h-1 relative">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{product.name}</h3>
          <p className="text-gray-600 mt-1 text-sm line-clamp-2">{product.description}</p>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 10 
                  ? 'En stock' 
                  : product.stock > 0 
                  ? `¡Solo ${product.stock} disponibles!` 
                  : 'Sin stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
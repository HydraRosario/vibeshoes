'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProducts } from '@/features/products';
import { Product } from '@/types/product';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { addToCart } from '@/features/cart';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [related, setRelated] = useState<Product[]>([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const products = await getProducts();
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        // Relacionados: otros productos (por ahora vacío si solo hay uno)
        setRelated(products.filter((p) => p.id !== id));
      } catch (e) {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }
    setAdding(true);
    try {
      if (product) {
        await addToCart(user.id, product, 1);
        toast.success('¡Producto agregado al carrito!');
      }
    } catch {
      toast.error('Error al añadir al carrito');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!product) {
    return <div className="text-center py-16 text-gray-500">Producto no encontrado.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Galería de imágenes */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full">
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name + ' ' + (idx + 1)}
                  className="rounded-lg object-cover w-full h-64 border border-gray-200 shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/lightgray/white?text=No+Disponible';
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}
        </div>
        {/* Detalles */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>
          <p className="text-lg text-gray-700 mb-6">{product.description}</p>
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-red-700 mr-4">{product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
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
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
            className="btn-primary w-full text-lg py-3 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {adding ? <LoadingSpinner size="sm" className="text-white" /> : product.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
          </button>
        </div>
      </div>
      {/* Productos relacionados */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Productos Relacionados</h2>
        {related.length === 0 ? (
          <div className="text-gray-400 text-center">No hay productos relacionados.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

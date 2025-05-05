'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Cart } from '@/types/cart';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from '@/features/cart';
import { TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [clearingCart, setClearingCart] = useState(false);

  const handleClearCart = async () => {
    if (!user) return;
    setClearingCart(true);
    const ok = await clearCart(user.id);
    setClearingCart(false);
    if (ok) {
      toast.success('Carrito vaciado');
      await loadCart();
    } else {
      toast.error('No se pudo vaciar el carrito');
    }
  };

  const loadCart = async () => {
    if (!user) return;
    
    try {
      const cartData = await getCart(user.id);
      setCart(cartData);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const handleUpdateQuantity = async (productId: string, quantity: number, selectedColor: string, selectedSize: string | number) => {
    if (!user || !cart) return;
    setUpdatingItem(productId + '-' + selectedColor + '-' + selectedSize);
    try {
      await updateCartItemQuantity(user.id, productId, quantity, selectedColor, selectedSize);
      await loadCart();
      toast.success('Cantidad actualizada');
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error('Error al actualizar cantidad');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId: string, selectedColor: string, selectedSize: string | number) => {
    if (!user || !cart) return;
    setUpdatingItem(productId + '-' + selectedColor + '-' + selectedSize);
    try {
      await updateCartItemQuantity(user.id, productId, 0, selectedColor, selectedSize);
      await loadCart();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error al eliminar item:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setUpdatingItem(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Ver Productos
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div key={item.productId + '-' + item.selectedColor + '-' + item.selectedSize} className="p-6 flex items-center space-x-4">
                  {item.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-24 relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 96px"
                        className="object-cover rounded-md"
                        priority
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <div className="text-sm text-gray-500 mb-1">Color: <span className="font-semibold">{item.selectedColor}</span> | Talle: <span className="font-semibold">{item.selectedSize}</span></div>
                    <p className="text-gray-600">
                      <span>{(item.price * item.quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        className="px-3 py-1 border-r hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.selectedColor, String(item.selectedSize))}
                        disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize}
                      >
                        -
                      </button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button
                        className="px-3 py-1 border-l hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.selectedColor, String(item.selectedSize))}
                        disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.selectedColor, item.selectedSize)}
                      disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Eliminar'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-white flex justify-end border-t">
              <button
                onClick={handleClearCart}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-60"
                disabled={clearingCart}
              >
                {clearingCart ? <LoadingSpinner size="sm" /> : <TrashIcon className="w-5 h-5" />}
                Vaciar carrito
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium">Total:</span>
                <span className="text-2xl font-bold">{cart?.total ? cart.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }) : '$0'}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
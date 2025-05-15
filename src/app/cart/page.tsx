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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Tu Carrito</h1>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60 shadow-md transition-all duration-200 transform hover:scale-105"
              disabled={clearingCart}
            >
              {clearingCart ? <LoadingSpinner size="sm" className="text-white" /> : <TrashIcon className="w-5 h-5" />}
              Vaciar carrito
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-red-100 animate-fade-in-up">
            <div className="flex flex-col items-center">
              <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <p className="text-gray-600 text-lg mb-6">Tu carrito está vacío</p>
              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-red-700 hover:bg-red-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Ver Productos
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200 overflow-hidden animate-fade-in-up">
            <div className="divide-y divide-pink-100">
              {cart.items.map((item) => (
                <div key={item.productId + '-' + item.selectedColor + '-' + item.selectedSize} className="p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 hover:bg-pink-50 transition-colors rounded-2xl">
                  {item.imageUrl && (
                    <div className="flex-shrink-0 w-28 h-28 relative rounded-xl overflow-hidden shadow-md border-2 border-pink-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 96px"
                        className="object-cover rounded-xl"
                        priority
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-pink-700 drop-shadow-sm">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 my-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 shadow">
                        Color: {item.selectedColor}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 shadow">
                        Talle: {item.selectedSize}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-700 mt-1 animate-pulse">
                      {(item.price * item.quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })} por unidad
                    </p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center border-2 border-pink-200 rounded-xl shadow bg-white overflow-hidden">
                      <button
                        className="px-4 py-2 bg-pink-100 text-pink-700 font-bold hover:bg-pink-200 disabled:opacity-50 transition-colors text-xl"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.selectedColor, String(item.selectedSize))}
                        disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-6 py-2 font-extrabold text-gray-800 min-w-[40px] text-center text-lg">{item.quantity}</span>
                      <button
                        className="px-4 py-2 bg-pink-100 text-pink-700 font-bold hover:bg-pink-200 disabled:opacity-50 transition-colors text-xl"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.selectedColor, String(item.selectedSize))}
                        disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.selectedColor, item.selectedSize)}
                      disabled={updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize}
                      className="flex items-center justify-center px-4 py-2 border-2 border-pink-200 rounded-xl text-pink-700 bg-pink-50 hover:bg-pink-100 disabled:opacity-50 transition-colors font-bold shadow"
                    >
                      {updatingItem === item.productId + '-' + item.selectedColor + '-' + item.selectedSize ? (
                        <LoadingSpinner size="sm" className="text-pink-700" />
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Eliminar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gradient-to-r from-pink-50 to-yellow-100 border-t-2 border-pink-200 rounded-b-3xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-pink-700">Total:</span>
                <span className="text-3xl font-extrabold text-green-700 animate-pulse">{cart?.total ? cart.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }) : '$0'}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="mt-4 w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white px-6 py-3 rounded-xl hover:from-yellow-400 hover:to-pink-500 font-extrabold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 animate-fade-in-up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Proceder al Pago
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
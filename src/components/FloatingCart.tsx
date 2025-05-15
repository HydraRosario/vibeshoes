'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';
import { usePathname } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { removeFromCart } from '@/features/cart';
import toast from 'react-hot-toast';

function CartItemRow({ item, userId }: { item: any; userId: string }) {
  const [removing, setRemoving] = useState(false);
  const handleRemove = async () => {
    setRemoving(true);
    const ok = await removeFromCart(userId, item.productId);
    setRemoving(false);
    if (!ok) toast.error('No se pudo eliminar el producto del carrito');
  };
  return (
    <li className="flex items-center py-2 gap-3">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover border" />
      )}
      <div className="flex-1">
        <div className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</div>
        <div className="text-xs text-gray-500">x{item.quantity} · {item.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</div>
      </div>
      <div className="font-semibold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</div>
      <button
        className="ml-2 p-1 rounded hover:bg-red-100 disabled:opacity-60"
        onClick={handleRemove}
        disabled={removing}
        aria-label="Eliminar"
        title="Eliminar"
      >
        {removing ? <LoadingSpinner size="sm" /> : <TrashIcon className="w-5 h-5 text-red-600" />}
      </button>
    </li>
  );
}

export function FloatingCart() {
  const { user, isAuthenticated } = useAuth();
  const { cart, loading } = useRealtimeCart(user?.id);
  const pathname = usePathname();

  if (pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/admin')) return null;
  if (!isAuthenticated || !user || !cart || cart.items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-xs bg-white shadow-2xl rounded-xl border border-red-200 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-6 w-6 text-red-700" />
          <span className="font-bold text-gray-900">Carrito</span>
        </div>
        <Link href="/cart" className="text-sm text-red-700 hover:underline font-semibold">Ver todo</Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-4">Tu carrito está vacío</div>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-40 overflow-y-auto mb-2">
          {/* Mostrar los 3 productos más recientes primero (ordenados del más reciente al más antiguo) */}
          {cart.items.slice(-3).reverse().map(item => (
            <CartItemRow 
              key={item.productId + '-' + item.selectedColor + '-' + item.selectedSize} 
              item={item} 
              userId={user.id} 
            />
          ))}
          {/* Mostrar "+ productos" con los productos anteriores si hay más de 3 */}
          {cart.items.length > 3 && (
            <li className="py-2 text-center text-sm text-gray-500">
              + {cart.items.length - 3} {cart.items.length - 3 === 1 ? 'producto' : 'productos'} más
            </li>
          )}
        </ul>
      )}
      {cart && cart.items.length > 0 && (
        <div className="flex justify-between items-center border-t pt-2 mt-2">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className="font-bold text-red-700">{cart.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}</span>
        </div>
      )}
    </div>
  );
}
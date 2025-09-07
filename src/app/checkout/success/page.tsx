"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrder } from '@/features/orders';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Order } from '@/types/order';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!orderId) { setError('Falta orderId'); setLoading(false); return; }
      try {
        const o = await getOrder(orderId);
        if (!o) {
          setError('No se encontró la orden');
        } else {
          setOrder(o);
        }
      } catch (e) {
        setError('Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-green-700 mb-2 text-center">¡Pago aprobado!</h1>
      <p className="text-gray-700 mb-8 text-center">Gracias por tu pedido. Abajo tienes el resumen.</p>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-center text-red-700 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>
      ) : order ? (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Número de orden</p>
              <p className="font-semibold text-gray-800">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold text-green-700 capitalize">{order.status}</p>
            </div>
          </div>
          <div className="divide-y">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{it.name}</p>
                  <p className="text-sm text-gray-500">{it.selectedColor} - {String(it.selectedSize)} x {it.quantity}</p>
                </div>
                <div className="font-semibold text-gray-800">${(it.price * it.quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${order.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-center gap-4">
        <button onClick={() => router.push('/profile')} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-md">Ver mis pedidos</button>
        <a href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md">Ir al inicio</a>
      </div>
    </div>
  );
}

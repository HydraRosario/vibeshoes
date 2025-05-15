'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { getOrdersByStatus, updateOrderStatus, getAllOrders, deleteOrder } from '@/features/orders'; // deleteOrder ya está exportado correctamente
import { LoadingSpinner } from '@/components/LoadingSpinner';

function renderOrderStatus(status: Order['status']) {
  switch (status) {
    case 'pendiente':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pendiente</span>;
    case 'aceptado':
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Aceptado</span>;
    case 'enviado':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Enviado</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
  }
}


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pendiente' | 'aceptado' | 'enviado' | 'todos'>('pendiente');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let ordersData;
      if (filter === 'todos') {
        ordersData = await getAllOrders();
      } else {
        ordersData = await getOrdersByStatus(filter);
      }
      setOrders(ordersData);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const ok = await updateOrderStatus(orderId, newStatus);
      if (ok) {
        alert('Estado actualizado correctamente');
      } else {
        alert('No se pudo actualizar el estado. Revisa los permisos de Firestore o la referencia.');
      }
      await loadOrders();
    } catch (error) {
      alert('Error al actualizar estado: ' + (typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error)));
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este pedido?')) return;
    try {
      const ok = await deleteOrder(orderId);
      if (ok) {
        alert('Pedido eliminado correctamente');
      } else {
        alert('No se pudo eliminar el pedido. Revisa los permisos de Firestore o la referencia.');
      }
      setSelectedOrder(null);
      await loadOrders();
    } catch (error) {
      alert('Error al eliminar el pedido: ' + (typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error)));
      console.error('Error al eliminar el pedido', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-yellow-100 py-12 px-2 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in-up">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-500 to-yellow-400 drop-shadow-xl text-center tracking-tight flex items-center gap-3 animate-fade-in-up">
            <svg className="h-10 w-10 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            Gestión de Órdenes
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setFilter('pendiente')}
              className={`px-5 py-2 rounded-xl font-bold transition-colors duration-150 shadow text-sm flex items-center gap-2 ${filter === 'pendiente' ? 'bg-yellow-500 text-white animate-pulse' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
              Pendientes
            </button>
            <button
              onClick={() => setFilter('aceptado')}
              className={`px-5 py-2 rounded-xl font-bold transition-colors duration-150 shadow text-sm flex items-center gap-2 ${filter === 'aceptado' ? 'bg-green-500 text-white animate-pulse' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Aceptados
            </button>
            <button
              onClick={() => setFilter('enviado')}
              className={`px-5 py-2 rounded-xl font-bold transition-colors duration-150 shadow text-sm flex items-center gap-2 ${filter === 'enviado' ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h2l1 2h13" /></svg>
              Enviados
            </button>
            <button
              onClick={() => setFilter('todos')}
              className={`px-5 py-2 rounded-xl font-bold transition-colors duration-150 shadow text-sm flex items-center gap-2 ${filter === 'todos' ? 'bg-purple-500 text-white animate-pulse' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
              Todos
            </button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 animate-fade-in-up">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-100 via-white to-yellow-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Orden ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-gray-100">
              {orders.map((order, idx) => (
                <tr key={order.id} style={{ animationDelay: `${idx * 60}ms` }} className="hover:bg-yellow-50 transition-colors animate-fade-in-up">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-extrabold text-green-700">${order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow flex items-center gap-1
                      ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : order.status === 'aceptado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    `}>
                      {order.status === 'pendiente' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>}
                      {order.status === 'aceptado' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {order.status === 'enviado' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h2l1 2h13" /></svg>}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 rounded-xl font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 shadow transition-colors flex items-center gap-2 active:scale-95"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Ver detalles
                      </button>
                      {order.status === 'pendiente' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'aceptado')}
                          className="px-4 py-2 rounded-xl font-bold text-white bg-green-600 hover:bg-green-800 shadow transition-colors flex items-center gap-2 active:scale-95"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Aceptar
                        </button>
                      )}
                      {order.status === 'aceptado' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'enviado')}
                          className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-800 shadow transition-colors flex items-center gap-2 active:scale-95"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h2l1 2h13" /></svg>
                          Marcar enviado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <p className="text-center text-red-400 font-bold mt-8 text-xl">No hay órdenes {filter === 'pendiente' ? 'pendientes' : filter === 'aceptado' ? 'aceptadas' : filter === 'enviado' ? 'enviadas' : 'en este filtro'}.</p>
        )}

        {/* Modal de detalle de orden */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white/95 rounded-3xl shadow-2xl max-w-2xl w-full p-10 border border-red-200 animate-fade-in-up relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold">&times;</button>
              <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 flex items-center gap-2">
                <svg className="h-8 w-8 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                Pedido #{selectedOrder.id.substring(0, 6)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-700 font-semibold">Cliente:</p>
                  <p className="text-gray-900">
                    {selectedOrder.userName ? (
                      <>
                        <span>{selectedOrder.userName}</span>
                        <span className="ml-2 text-xs text-gray-500">(ID: {selectedOrder.userId})</span>
                      </>
                    ) : (
                      <span>{selectedOrder.userId}</span>
                    )}
                  </p>
                  <p className="text-gray-700 font-semibold mt-2">Fecha:</p>
                  <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Email:</p>
                  <p className="text-gray-900">{selectedOrder.userEmail ? selectedOrder.userEmail : 'No disponible'}</p>
                  <p className="text-gray-700 font-semibold mt-2">Estado:</p>
                  <div className="mt-1">{renderOrderStatus(selectedOrder.status)}</div>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 font-semibold mb-2">Dirección de envío:</p>
                <p className="text-gray-900">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, CP: {selectedOrder.shippingAddress.zipCode}</p>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 font-semibold mb-2">Productos</p>
                <div className="border rounded-xl bg-gray-50">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                        <span className="text-gray-900 font-medium">{item.name || `Producto #${item.productId.substring(0, 6)}`}</span>
                        <span className="text-gray-500 text-xs ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-gray-900 font-semibold">${(item.price * item.quantity).toLocaleString('es-AR')}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-extrabold text-gray-900">Total: ${selectedOrder.total.toLocaleString('es-AR')}</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedOrder(null)} className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold">Cerrar</button>
                  <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold">Eliminar pedido</button>
                  {selectedOrder.status === 'pendiente' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'aceptado');
                        setSelectedOrder(null);
                      }}
                      className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold"
                    >
                      Aceptar pedido
                    </button>
                  )}
                  {selectedOrder.status === 'aceptado' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'enviado');
                        setSelectedOrder(null);
                      }}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold"
                    >
                      Marcar como enviado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pendiente'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('aceptado')}
            className={`px-4 py-2 rounded-md ${
              filter === 'aceptado'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aceptados
          </button>
          <button
            onClick={() => setFilter('enviado')}
            className={`px-4 py-2 rounded-md ${
              filter === 'enviado'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Enviados
          </button>
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-md ${
              filter === 'todos'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      order.status === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'aceptado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {order.status === 'pendiente' && 'Pendiente'}
                    {order.status === 'aceptado' && 'Aceptado'}
                    {order.status === 'enviado' && 'Enviado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Ver detalles
                    </button>
                    
                    {order.status === 'pendiente' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'aceptado')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Aceptar
                      </button>
                    )}
                    
                    {order.status === 'aceptado' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'enviado')}
                        className="text-blue-600 hover:text-blue-900"
                      >
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
        <p className="text-center text-gray-500 mt-4">
          No hay órdenes {filter === 'pendiente' ? 'pendientes' : filter === 'aceptado' ? 'aceptadas' : filter === 'enviado' ? 'enviadas' : 'en este filtro'}.
        </p>
      )}
      
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Detalles del Pedido #{selectedOrder.id.substring(0, 6)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            <div className="mb-4">
              <p className="text-gray-700 font-semibold">Dirección de envío:</p>
              <p className="text-gray-900">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, CP: {selectedOrder.shippingAddress.zipCode}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-2">Productos</p>
              <div className="border rounded bg-gray-50">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2 border-b last:border-b-0">
                    <div>
                      <span className="text-gray-900 font-medium">{item.name || `Producto #${item.productId.substring(0, 6)}`}</span>
                      <span className="text-gray-500 text-xs ml-2">x{item.quantity}</span>
                    </div>
                    <div className="text-gray-900 font-semibold">${(item.price * item.quantity).toLocaleString('es-AR')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold text-gray-900">Total: ${selectedOrder.total.toLocaleString('es-AR')}</span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cerrar</button>
                <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Eliminar pedido</button>
                {selectedOrder.status === 'pendiente' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedOrder.id, 'aceptado');
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
  );
}
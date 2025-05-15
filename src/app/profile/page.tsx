"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/services/auth.service";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getUserOrders } from "@/features/orders";
import { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { FaPencilAlt, FaCheck } from "react-icons/fa";
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { OrderReviewItem } from './OrderReviewItem';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    address: user?.address || {
      street: "",
      city: "Rosario",
      state: "Santa Fe",
      zipCode: "2000"
    }
  });
  const [initialForm, setInitialForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    address: user?.address || {
      street: "",
      city: "Rosario",
      state: "Santa Fe",
      zipCode: "2000"
    }
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(user?.photoURL || "");
  const [file, setFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddressEditable, setIsAddressEditable] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    if (user) {
      const userFormData = {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        address: user.address || {
          street: "",
          city: "Rosario",
          state: "Santa Fe",
          zipCode: "2000"
        }
      };
      setForm(userFormData);
      setInitialForm(userFormData);
      setPreview(user.photoURL || "");
      
      // Cargar los pedidos del usuario
      const loadOrders = async () => {
        setLoadingOrders(true);
        try {
          const userOrders = await getUserOrders(user.id);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error al cargar los pedidos:', error);
        } finally {
          setLoadingOrders(false);
        }
      };
      
      loadOrders();
    }
  }, [user]);
  
  // Check if form has changed
  useEffect(() => {
    const hasFormChanged = 
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      file !== null;
    
    setFormChanged(hasFormChanged);
  }, [form, initialForm, file]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (!user) {
    return <div className="text-center py-16">Debes iniciar sesión para ver tu perfil.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };
  
  const toggleAddressEdit = () => {
    setIsAddressEditable(!isAddressEditable);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    let photoURL = form.photoURL;
    try {
      if (file) {
        const storageRef = ref(storage, `profile-pictures/${user.id}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateUserProfile(user.id, {
        displayName: form.displayName,
        photoURL,
        address: form.address
      });
      setSuccess(true);
      setInitialForm({
        ...form,
        photoURL
      });
      setFile(null);
      setIsAddressEditable(false);
      setFormChanged(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  // Función para mostrar el estado del pedido con el color adecuado
  const renderOrderStatus = (status: Order['status']) => {
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
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <div className="mb-8 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-600'}`}
          >
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-600'}`}
          >
            Mis Pedidos
          </button>
        </div>
      </div>
      {activeTab === 'profile' && (
        <>
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 mb-2">
              <img
                src={preview || "/file.svg"}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="btn-secondary cursor-pointer mt-2">
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="displayName"
            className="input-field mt-1 bg-gray-100 text-gray-700"
            value={form.displayName}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className="input-field mt-1 bg-gray-100 text-gray-500"
            value={form.email}
            disabled
          />
        </div>
        <div>
          <div className="flex justify-between items-center mt-4">
            <label className="block text-sm font-medium text-gray-700">Dirección de envío</label>
            <button 
              type="button" 
              onClick={toggleAddressEdit} 
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              {isAddressEditable ? (
                <><FaCheck className="mr-1" /> Listo</>
              ) : (
                <><FaPencilAlt className="mr-1" /> Editar</>
              )}
            </button>
          </div>
          <div className="space-y-3 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">Calle y número <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={`input-field mt-1 ${!isAddressEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ej: Av. Córdoba 1234"
                value={form.address.street}
                onChange={e => setForm(prev => ({
                  ...prev,
                  address: { 
                    ...prev.address, 
                    street: e.target.value,
                    city: "Rosario",
                    state: "Santa Fe",
                    zipCode: "2000"
                  }
                }))}
                disabled={!isAddressEditable}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Ciudad</label>
              <input
                type="text"
                className="input-field mt-1 bg-gray-100"
                value="Rosario"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Provincia</label>
              <input
                type="text"
                className="input-field mt-1 bg-gray-100"
                value="Santa Fe"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Código Postal</label>
              <input
                type="text"
                className="input-field mt-1 bg-gray-100"
                value="2000"
                disabled
              />
            </div>
          </div>
        </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">¡Perfil actualizado!</div>}
          {formChanged && (
            <button
              type="submit"
              className="btn-primary w-full mt-4 animate-fade-in"
              disabled={saving}
            >
              {saving ? <LoadingSpinner size="sm" /> : "Guardar Cambios"}
            </button>
          )}
        </form>
      </>
    )}
    {activeTab === 'orders' && (
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-bold mb-6">Mis Pedidos</h2>
        {loadingOrders ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tienes pedidos realizados.</p>
            <button 
              onClick={() => router.push('/products')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedOrder ? (
              <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Detalles del Pedido #{selectedOrder.id.substring(0, 6)}</h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Volver a la lista
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Fecha:</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Estado:</p>
                    <div className="mt-1">{renderOrderStatus(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Dirección de envío:</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, CP: {selectedOrder.shippingAddress.zipCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total:</p>
                    <p className="font-medium text-green-700">${selectedOrder.total.toLocaleString('es-AR')}</p>
                  </div>
                </div>
                <h4 className="font-bold mb-2 text-gray-800">Productos</h4>
                <div className="space-y-3 mb-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center border-b pb-3 last:border-b-0">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded mr-3" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name || `Producto #${item.productId.substring(0, 6)}`}</p>
                        <div className="text-sm text-gray-500">
                          {item.selectedColor && <span>Color: {item.selectedColor} | </span>}
                          {item.selectedSize && <span>Talle: {item.selectedSize} | </span>}
                          <span>Cantidad: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {selectedOrder.status === 'pendiente' && 'Tu pedido está siendo revisado'}
                    {selectedOrder.status === 'aceptado' && 'Tu pedido ha sido aceptado y está en preparación'}
                    {selectedOrder.status === 'enviado' && 'Tu pedido ha sido enviado y está en camino'}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Total: ${selectedOrder.total.toLocaleString('es-AR')}
                  </div>
                </div>
                {/* Reviews por producto en pedido enviado */}
                {selectedOrder && selectedOrder.status === 'enviado' && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Dejá tu comentario sobre los productos</h4>
                    {user && selectedOrder.items.map((item) => (
  <OrderReviewItem
    key={item.productId}
    item={item}
    orderId={selectedOrder.id}
    userId={user.id}
    userName={user.displayName || user.email}
  />
))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderOrderStatus(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          ${order.total.toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
}


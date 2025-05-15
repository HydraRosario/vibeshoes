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
            className={`px-5 py-2 rounded-xl font-bold text-lg transition-colors duration-150 shadow ${activeTab === 'orders' ? 'bg-yellow-500 text-white animate-pulse' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
            onClick={() => setActiveTab('orders')}
          >
            Mis órdenes
          </button>
        </div>
        {/* Tab content */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-pink-200 animate-fade-in-up">
          {activeTab === 'profile' ? (
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Avatar y datos no editables */}
              <div className="flex flex-col items-center gap-4 bg-white/90 rounded-3xl shadow-xl p-8 border border-pink-200 min-w-[280px]">
                <img
                  src={form.photoURL || "/default-avatar.png"}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full object-cover border-4 border-pink-200 shadow-xl mb-2"
                />
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1 flex items-center gap-2 justify-center">
                    {form.displayName}
                  </h2>
                  <p className="text-gray-500 text-lg">{form.email}</p>
                </div>
              </div>
              {/* Dirección editable */}
              <form onSubmit={handleSubmit} className="flex-1 bg-white/90 rounded-3xl shadow-xl p-8 border border-pink-200 animate-fade-in-up">
                <h3 className="text-xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                  <svg className="h-6 w-6 text-yellow-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  Dirección de envío
                </h3>
                <div className="mb-4 relative">
                  <label className="block text-gray-700 font-bold mb-1">Calle y número</label>
                  <input
                    type="text"
                    name="address.street"
                    className={`w-full rounded-xl border-none px-4 py-3 shadow focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white/90 text-gray-800 placeholder-gray-400 text-lg pr-12 transition-all duration-150 ${isAddressEditable ? 'ring-2 ring-pink-400' : ''}`}
                    placeholder="Ej: Av. Córdoba 1234"
                    value={form.address.street}
                    onChange={handleChange}
                    disabled={saving || !isAddressEditable}
                    required
                  />
                  {/* Lápiz para editar */}
                  {!isAddressEditable && (
                    <button
                      type="button"
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                      onClick={() => setIsAddressEditable(true)}
                      tabIndex={-1}
                      aria-label="Editar dirección"
                    >
                      <FaPencilAlt size={20} />
                    </button>
                  )}
                </div>
                {/* Botón guardar sólo si hubo cambios */}
                {isAddressEditable && form.address.street !== initialForm.address.street && (
                  <div className="flex gap-4 items-center mt-2">
                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-pink-500 shadow-lg transition-all duration-150 active:scale-95 text-lg ${saving ? 'opacity-70' : ''}`}
                      disabled={saving}
                    >
                      {saving ? <LoadingSpinner size="sm" /> : 'Guardar cambios'}
                    </button>
                    {error && <span className="text-red-500 font-bold">{error}</span>}
                    {success && <span className="text-green-600 font-bold">¡Dirección guardada!</span>}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Ciudad</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-none px-4 py-3 shadow bg-gray-100 text-gray-500 text-lg cursor-not-allowed"
                      value="Rosario"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Provincia</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-none px-4 py-3 shadow bg-gray-100 text-gray-500 text-lg cursor-not-allowed"
                      value="Santa Fe"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Código Postal</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border-none px-4 py-3 shadow bg-gray-100 text-gray-500 text-lg cursor-not-allowed"
                      value="2000"
                      disabled
                    />
                  </div>
                </div>

              </form>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-extrabold mb-6 text-pink-600 flex items-center gap-2">
                <svg className="h-6 w-6 text-yellow-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                Historial de órdenes
              </h3>
              {loadingOrders ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-red-400 font-bold text-xl">No tienes órdenes registradas.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {orders.map((order, idx) => (
                    <div key={order.id} className="bg-gradient-to-br from-yellow-100 via-white to-pink-100 rounded-2xl shadow-lg p-8 border border-pink-100 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                      <h4 className="text-xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                        Pedido #{order.id.substring(0, 6)}
                      </h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow flex items-center gap-1
                          ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : order.status === 'aceptado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        `}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mb-2 text-gray-700">Total: <span className="font-bold text-green-700">${order.total.toLocaleString('es-AR')}</span></div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="mt-2 px-4 py-2 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow transition-colors flex items-center gap-2 active:scale-95"
                      >
                        Ver detalles
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Modal detalle de orden */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white/95 rounded-3xl shadow-2xl max-w-2xl w-full p-10 border border-pink-200 animate-fade-in-up relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-pink-500 transition-colors text-2xl font-bold">&times;</button>
              <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 flex items-center gap-2">
                <svg className="h-8 w-8 text-pink-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                Pedido #{selectedOrder.id.substring(0, 6)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-700 font-semibold">Fecha:</p>
                  <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="text-gray-700 font-semibold mt-2">Estado:</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full shadow flex items-center gap-1
                    ${selectedOrder.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : selectedOrder.status === 'aceptado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  `}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Total:</p>
                  <p className="text-green-700 font-extrabold text-lg">${selectedOrder.total.toLocaleString('es-AR')}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}

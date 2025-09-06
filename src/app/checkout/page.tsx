'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeCart } from '@/hooks/useRealtimeCart';
import { createOrder } from '@/features/orders';
import { clearCart } from '@/features/cart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Cart } from '@/types/cart';

type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { cart, loading: loadingCart } = useRealtimeCart(user?.id);
  const [loading, setLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: user?.address?.street || '',
    city: 'Rosario',  
    state: 'Santa Fe', 
    zipCode: '2000'    
  });

  useEffect(() => {
    if (user && user.address && user.address.street) {
      setShippingAddress({
        street: user.address.street,
        city: 'Rosario', 
        state: 'Santa Fe', 
        zipCode: '2000' 
      });
    }
  }, [user]);

  const formatWhatsAppMessage = () => {
    if (!cart) return '';
    
    // Creamos un separador consistente
    const separador = '--------------------------------';
    
    // Obtenemos la fecha y hora actuales formateadas
    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Número de pedido aleatorio de 4 dígitos
    const numeroPedido = Math.floor(1000 + Math.random() * 9000);
    
    // Comenzamos a construir el mensaje conforme al formato exacto
    let message = `${separador}\n`;
    message += `Hola VIBESHOES, éste es mi carrito personalizado y la información del pedido, dejo todo en sus manos!\n`;
    message += `${separador}\n`;
    message += `  TICKET DE COMPRA #${numeroPedido}\n`;
    message += `  Fecha: ${fecha} - ${hora}\n`;
    message += `  Cliente: ${user?.displayName || 'Cliente'}\n`;
    message += `${separador}\n`;
    
    message += `  *PRODUCTOS SELECCIONADOS*\n`;
    
    // Detalle de cada producto
    cart.items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Color: ${item.selectedColor}\n`;
      message += `   Talle: ${item.selectedSize}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${item.price.toLocaleString('es-AR')}\n`;
      message += `   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
    });
    
    message += `${separador}\n`;
    message += ` *RESUMEN DE PAGO*\n`;
    message += `Subtotal: $${cart.total.toLocaleString('es-AR')}\n`;
    message += `Envío: (Varía según la ubicación)\n`;
    message += `TOTAL A PAGAR: $${cart.total.toLocaleString('es-AR')} + envío\n`;
    message += `${separador}\n`;
    
    message += ` *DATOS DE ENVÍO*\n`;
    message += `Dirección: ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}\n`;
    message += `Contacto: ${user?.email || ''}\n`;
    message += `${separador}\n`;
    message += `¡Gracias por tu compra!\n`;
    message += `Estaremos procesando tu pedido a la brevedad.\n`;
    message += `${separador}`;
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !cart) return;

    // Verificar si el usuario tiene una dirección registrada
    if (!shippingAddress.street) {
      setOrderMessage('Debes registrar una dirección en tu perfil antes de realizar un pedido.');
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      // Create the order in the database
      const order = await createOrder(
        user.id, 
        cart, 
        shippingAddress, 
        user.email, 
        user.displayName || undefined
      );
      if (order) {
        // Vaciar el carrito después de crear el pedido
        if (user?.id) {
          try {
            await clearCart(user.id);
          } catch (err) {
            // No bloquear el flujo si falla, pero mostrar en consola
            console.error('No se pudo vaciar el carrito después del pedido:', err);
          }
        }
        // Generate WhatsApp message and redirect
        const whatsappMessage = formatWhatsAppMessage();
        const whatsappNumber = process.env.NEXT_PUBLIC_ADMIN_CEL; // Número de WhatsApp del coordinador
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
        setOrderMessage('¡Pedido realizado con éxito! Redirigiendo a WhatsApp para finalizar...');

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      setOrderMessage('Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center">Debes iniciar sesión para acceder al checkout.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      {loadingCart ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario de envío */}
          <div>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-pink-200 animate-fade-in-up">
              <h2 className="text-2xl font-extrabold mb-6 text-pink-600 flex items-center gap-2">
                <svg className="h-6 w-6 text-yellow-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                Dirección de Envío
              </h2>
              <div>
                {/* Siempre mostrar dirección actual (si existe) */}
                {user.address && user.address.street && (
                  <div className="mb-6 bg-gradient-to-br from-yellow-100 via-white to-pink-100 rounded-2xl shadow-lg p-6 border border-pink-100 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-pink-100 text-pink-700 mb-2">Dirección de envío</span>
                        <p className="text-gray-900 font-semibold text-lg">
                          {user.address.street}, {user.address.city}, {user.address.state}, {user.address.zipCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseProfileAddress((prev) => !prev)}
                        className="ml-4 px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-pink-500 shadow transition-all duration-150 text-sm"
                      >
                        {useProfileAddress ? 'Editar dirección' : 'Usar dirección guardada'}
                      </button>
                    </div>
                  </div>
                )}
                {/* Formulario para editar/crear dirección */}
                {(!user.address?.street || !useProfileAddress) && (
                  <form onSubmit={handleSubmit} className="mt-4 animate-fade-in-up">
                    <div className="mb-4">
                      <label htmlFor="street" className="block text-gray-700 font-bold mb-1">
                        Calle y número <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="street"
                        required
                        className="w-full rounded-xl border-none px-4 py-3 shadow focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white/90 text-gray-800 placeholder-gray-400 text-lg"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        placeholder="Ej: Av. Córdoba 1234"
                      />
                    </div>
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
                    <div className="mt-2 text-gray-700 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p><strong>Nota:</strong> Actualmente solo realizamos envíos en la ciudad de Rosario.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !cart || cart.items.length === 0}
                      className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Confirmar Pedido'}
                    </button>
                  </form>
                )}
                {/* Botón de confirmar pedido si ya tiene dirección y no está editando */}
                {user.address?.street && useProfileAddress && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !cart || cart.items.length === 0}
                    className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Confirmar Pedido'}
                  </button>
                )}
                {orderMessage && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                    {orderMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Resumen del pedido */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen del Pedido</h2>
              {!cart || cart.items.length === 0 ? (
                <p className="text-gray-600 py-4">Tu carrito está vacío</p>
              ) : (
                <>
                  {cart.items.map((item: any) => (
                    <div key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`} className="flex justify-between py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.selectedColor}, {item.selectedSize} x {item.quantity}
                        </p>
                      </div>
                      <span className="text-gray-800 font-medium">
                        ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span>${cart.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
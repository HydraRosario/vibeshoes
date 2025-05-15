'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCart } from '@/features/cart';
import { createOrder } from '@/features/orders';
import { Cart } from '@/types/cart';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const userCart = await getCart(user.id);
        setCart(userCart);

        // Set shipping address from user profile if available
        if (user.address && user.address.street) {
          setShippingAddress({
            street: user.address.street || '',
            city: 'Rosario',
            state: 'Santa Fe',
            zipCode: '2000'
          });
        } else {
          // Si no tiene dirección, usamos valores por defecto para ciudad, provincia y CP
          setShippingAddress({
            street: '',
            city: 'Rosario',
            state: 'Santa Fe',
            zipCode: '2000'
          });
        }
        setLoadingCart(false);
      }
    };

    loadCart();
  }, [user]);

  const formatWhatsAppMessage = () => {
    if (!cart || !user) return '';

    // Formatear cada producto como una línea de ticket
    const itemsList = cart.items.map((item, index) =>
      `${index + 1}. ${item.name}\n   Color: ${item.selectedColor}\n   Talle: ${item.selectedSize}\n   Cantidad: ${item.quantity}\n   Precio: $${item.price.toLocaleString('es-AR')}\n   Subtotal: $${(item.price * item.quantity).toLocaleString('es-AR')}`
    ).join('\n\n');

    const address = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state}, CP: ${shippingAddress.zipCode}`;
    
    // Obtener fecha y hora actual
    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    
    // Crear un separador para el ticket
    const separador = '--------------------------------';
    
    return encodeURIComponent(
      `🔥 *VIBESHOES - NUEVO PEDIDO* 🔥\n\n` +
      `Hola VIBESHOES, éste es mi carrito personalizado y la información del pedido, dejo todo en sus manos! 😊\n\n` +
      `${separador}\n` +
      `📋 *TICKET DE COMPRA #${Math.floor(Math.random() * 10000)}*\n` +
      `📆 Fecha: ${fecha} - ${hora}\n` +
      `👤 Cliente: ${user.displayName || user.email}\n` +
      `${separador}\n\n` +
      `🛍️ *PRODUCTOS SELECCIONADOS*\n\n${itemsList}\n\n` +
      `${separador}\n` +
      `💰 *RESUMEN DE PAGO*\n` +
      `Subtotal: $${cart.total.toLocaleString('es-AR')}\n` +
      `Envío: Gratis\n` +
      `*TOTAL A PAGAR: $${cart.total.toLocaleString('es-AR')}*\n` +
      `${separador}\n\n` +
      `📍 *DATOS DE ENVÍO*\n` +
      `Dirección: ${address}\n` +
      `Contacto: ${user.email}\n\n` +
      `${separador}\n` +
      `¡Gracias por tu compra! 🙏\n` +
      `Estaremos procesando tu pedido a la brevedad.\n` +
      `${separador}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Generate WhatsApp message and redirect
        const whatsappMessage = formatWhatsAppMessage();
        const whatsappNumber = '5493415840614'; // Número de WhatsApp del coordinador
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Dirección de Envío</h2>

              {user.address && user.address.street ? (
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Dirección de tu perfil:</p>
                      <p className="text-gray-600 mt-1">
                        {user.address.street}, Rosario, Santa Fe, CP: 2000
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseProfileAddress(!useProfileAddress)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {useProfileAddress ? 'Usar otra dirección' : 'Usar esta dirección'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="flex items-center">
                    <div>
                      <p className="font-medium text-yellow-700">No tienes una dirección registrada</p>
                      <p className="text-yellow-600 mt-1">
                        Debes registrar una dirección en tu perfil antes de realizar un pedido.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/profile')}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Ir a mi perfil
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(!user.address?.street && !useProfileAddress) && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="street"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:border-red-500 focus:ring-red-500 text-gray-800"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        placeholder="Ej: Av. Córdoba 1234"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-gray-100 text-gray-800"
                        value="Rosario"
                        disabled
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        Provincia
                      </label>
                      <input
                        type="text"
                        id="state"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-gray-100 text-gray-800"
                        value="Santa Fe"
                        disabled
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-gray-100 text-gray-800"
                        value="2000"
                        disabled
                      />
                    </div>
                    <div className="mt-2 text-gray-700 text-sm bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p><strong>Nota:</strong> Actualmente solo realizamos envíos en la ciudad de Rosario.</p>
                    </div>
                  </div>
                </form>
              )}

              {orderMessage && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  {orderMessage}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !cart || cart.items.length === 0}
                className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Confirmar Pedido'}
              </button>
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
                  {cart.items.map((item) => (
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
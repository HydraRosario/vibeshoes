export default function FailurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Pago rechazado o cancelado</h1>
      <p className="text-gray-700 mb-6">Tu pago no pudo completarse. Puedes intentar nuevamente o elegir otro medio de pago.</p>
      <div className="flex items-center justify-center gap-4">
        <a href="/checkout" className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md">Volver al Checkout</a>
        <a href="/" className="inline-block mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md">Ir al inicio</a>
      </div>
    </div>
  );
}

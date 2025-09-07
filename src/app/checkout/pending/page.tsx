export default function PendingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-yellow-700 mb-4">Pago en revisión</h1>
      <p className="text-gray-700 mb-6">Tu pago está siendo revisado por Mercado Pago. Te avisaremos cuando se confirme.</p>
      <div className="flex items-center justify-center gap-4">
        <a href="/profile" className="inline-block mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md">Ver mis pedidos</a>
        <a href="/" className="inline-block mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md">Ir al inicio</a>
      </div>
    </div>
  );
}

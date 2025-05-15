"use client";
import { useEffect, useState } from "react";
import { getProducts } from "@/features/products";
import { getAllOrders } from "../../features/orders";
// import { Chart, registerables } from "chart.js";
// import { Bar, Pie } from "react-chartjs-2";
// Chart.register(...registerables);

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [prods, ords] = await Promise.all([
        getProducts(),
        getAllOrders()
      ]);
      setProducts(prods);
      setOrders(ords);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Stock por producto
  const stockData = {
    labels: products.map((p: any) => p.name),
    datasets: [
      {
        label: 'Stock',
        data: products.map((p: any) => p.stockTotal || 0),
        backgroundColor: 'rgba(255,99,132,0.5)',
      },
    ],
  };

  // Ventas por producto
  const salesByProduct = products.map((p: any) => {
    const sales = orders.reduce((acc: number, o: any) => {
      const found = o.items?.find((item: any) => item.productId === p.id);
      return acc + (found ? found.quantity : 0);
    }, 0);
    return sales;
  });
  const salesData = {
    labels: products.map((p: any) => p.name),
    datasets: [
      {
        label: 'Ventas',
        data: salesByProduct,
        backgroundColor: 'rgba(54,162,235,0.5)',
      },
    ],
  };

  // Pie de ventas por estado
  const statusCounts: Record<string, number> = {};
  orders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Órdenes',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255,99,132,0.5)',
          'rgba(54,162,235,0.5)',
          'rgba(255,206,86,0.5)',
          'rgba(75,192,192,0.5)'
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-gray-200 py-16 px-4 flex flex-col items-center animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-500 to-yellow-400 drop-shadow-xl tracking-tight flex items-center gap-3 animate-fade-in-up">
        <svg className="h-10 w-10 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
        Dashboard de Administración
      </h1>
      {loading ? (
        <div className="flex items-center justify-center text-red-400 animate-pulse py-16">
          <svg className="h-8 w-8 mr-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
          Cargando datos...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
          {/* Stock por producto */}
          <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-red-100 transition-all hover:shadow-red-300 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" /></svg>
              <h2 className="text-2xl font-bold text-red-700 tracking-tight">Stock por producto</h2>
            </div>
            <ul className="space-y-3">
              {products.length === 0 ? (
                <li className="text-gray-400 italic">No hay productos cargados.</li>
              ) : (
                products.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-100/60 to-white/80 shadow group">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                      {p.name}
                    </span>
                    <span className="inline-block bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full shadow text-sm animate-pulse">{p.stockTotal || 0}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          {/* Ventas por producto */}
          <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-pink-100 transition-all hover:shadow-pink-200 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-7 w-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
              <h2 className="text-2xl font-bold text-pink-600 tracking-tight">Ventas por producto</h2>
            </div>
            <ul className="space-y-3">
              {products.length === 0 ? (
                <li className="text-gray-400 italic">No hay productos cargados.</li>
              ) : (
                products.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center px-4 py-2 rounded-lg bg-gradient-to-r from-pink-100/60 to-white/80 shadow group">
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {p.name}
                    </span>
                    <span className="inline-block bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full shadow text-sm animate-pulse">
                      {orders.reduce((acc: number, o: any) => {
                        const found = o.items?.find((item: any) => item.productId === p.id);
                        return acc + (found ? found.quantity : 0);
                      }, 0)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          {/* Órdenes por estado */}
          <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-yellow-100 transition-all hover:shadow-yellow-200 md:col-span-2 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <svg className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0 0V3m0 18H4" /></svg>
              <h2 className="text-2xl font-bold text-yellow-600 tracking-tight">Órdenes por estado</h2>
            </div>
            <ul className="flex flex-wrap gap-4">
              {(() => {
                const statusCounts: Record<string, number> = {};
                orders.forEach((o: any) => {
                  statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
                });
                const statusColors: Record<string, string> = {
                  pendiente: 'bg-yellow-100 text-yellow-700',
                  pagada: 'bg-green-100 text-green-700',
                  enviada: 'bg-blue-100 text-blue-700',
                  cancelada: 'bg-red-100 text-red-700',
                  completada: 'bg-pink-100 text-pink-700',
                };
                return Object.entries(statusCounts).map(([status, count]) => (
                  <li key={status} className={`px-6 py-3 rounded-full font-bold shadow text-lg flex items-center gap-2 ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="ml-2 inline-block bg-white/80 text-gray-900 rounded-full px-3 py-1 text-base font-extrabold shadow animate-bounce">{count}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

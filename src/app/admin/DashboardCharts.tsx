"use client";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function DashboardCharts({ products, orders }: { products: any[]; orders: any[] }) {
  // Productos más vendidos
  const salesByProduct = products.map((p: any) => {
    const sales = orders.reduce((acc: number, o: any) => {
      const found = o.items?.find((item: any) => item.productId === p.id);
      return acc + (found ? found.quantity : 0);
    }, 0);
    return sales;
  });
  const topProducts = products
    .map((p, i) => ({ ...p, sales: salesByProduct[i] }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Pie de ventas por producto
  const pieData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        data: topProducts.map((p) => p.sales),
        backgroundColor: [
          "#FFD700",
          "#FFE066",
          "#FFECB3",
          "#BFAE32",
          "#C9B037",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Barras de stock
  const barData = {
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: "Stock",
        data: products.map((p) => p.stockTotal || 0),
        backgroundColor: "#FFD700",
      },
    ],
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 my-10 font-sans">
      <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-red-100">
        <h3 className="font-bold text-lg mb-4 text-black">Top 5 Productos Más Vendidos</h3>
        <Pie data={pieData} />
      </div>
      <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-red-100">
        <h3 className="font-bold text-lg mb-4 text-red-700">Stock por Producto</h3>
        <Bar data={barData} options={{
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { color: '#991b1b' } }, y: { ticks: { color: '#991b1b' } } },
        }} />
      </div>
    </div>
  );
}

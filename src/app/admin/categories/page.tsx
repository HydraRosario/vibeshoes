"use client";
import { useState, useEffect } from "react";
import { getCategories, addCategory, deleteCategory } from "../../../features/categories";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCats();
  }, []);

  async function fetchCats() {
    setLoading(true);
    setCategories(await getCategories());
    setLoading(false);
  }

  async function handleAdd() {
    if (!newCat.trim()) return;
    await addCategory(newCat.trim());
    setNewCat("");
    fetchCats();
  }

  async function handleDelete(cat: string) {
    await deleteCategory(cat);
    fetchCats();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-gray-200 animate-fade-in">
      <div className="backdrop-blur-xl bg-black/60 rounded-3xl shadow-2xl px-10 py-12 max-w-lg w-full border border-red-200 relative animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg flex items-center gap-3">
          <svg className="h-8 w-8 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
          Gestión de Categorías
        </h2>
        <div className="flex gap-2 mb-8">
          <input
            className="flex-1 border-none rounded-lg px-4 py-2 text-base shadow focus:ring-2 focus:ring-red-400 focus:outline-none bg-white/90 text-gray-800 placeholder-gray-400"
            placeholder="Nueva categoría"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            maxLength={24}
          />
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-600 hover:to-red-600 text-white px-5 py-2 rounded-lg shadow-lg font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95"
            aria-label="Agregar categoría"
            disabled={loading || !newCat.trim()}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Agregar
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center text-red-200 animate-pulse py-8">
            <svg className="h-6 w-6 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
            Cargando categorías...
          </div>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-transparent">
            {categories.length === 0 ? (
              <li className="text-center text-red-200 italic py-8">No hay categorías creadas aún.</li>
            ) : (
              categories.map(cat => (
                <li key={cat} className="flex justify-between items-center bg-gradient-to-r from-red-400/20 to-white/10 px-4 py-3 rounded-xl shadow group transition-all">
                  <span className="text-lg font-medium text-white drop-shadow-sm flex items-center gap-2">
                    <svg className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0M12 3v4" /></svg>
                    {cat}
                  </span>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-700 text-white text-xs font-bold shadow transition-all duration-150 active:scale-95"
                    aria-label={`Eliminar ${cat}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Eliminar
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

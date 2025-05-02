'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/features/products';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 500 * 1024; // 500KB máximo

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen es demasiado grande. Máximo 500KB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: base64String }));
      setImagePreview(base64String);
    };
    reader.onerror = () => {
      toast.error('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl
      };

      if (editingProduct) {
        await updateProduct(editingProduct, productData);
        toast.success('Producto actualizado');
      } else {
        await createProduct(productData);
        toast.success('Producto creado');
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      toast.error(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || ''
    });
    setImagePreview(product.imageUrl || '');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        toast.success('Producto eliminado');
        await loadProducts();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: ''
    });
    setEditingProduct(null);
    setImagePreview('');
  };

  if (loading && !editingProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-900 drop-shadow-lg">Gestión de Productos</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl mb-12 border border-red-100 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Nombre del Producto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field mt-1 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="input-field mt-1 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="input-field mt-1 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Imagen del Producto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              <p className="mt-1 text-xs text-gray-400">Tamaño máximo: 500KB. Formatos: JPG, PNG, GIF</p>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Vista previa" className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow" />
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field mt-1 bg-gray-50"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary border border-gray-300 shadow-sm"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-lg font-bold px-8 py-3 shadow-lg hover:scale-105 transition-transform duration-150"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : editingProduct ? (
                'Actualizar Producto'
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>

        {/* Lista de Productos */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 animate-fade-in-up">
          <ul className="divide-y divide-gray-200">
            {products.map((product, idx) => (
              <li key={product.id} style={{ animationDelay: `${idx * 60}ms` }} className="flex items-center justify-between px-8 py-6 group hover:bg-red-50 transition-colors animate-fade-in-up">
                <div className="flex items-center">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover mr-6 border border-gray-200 shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/lightgray/white?text=No+Disponible';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-500">${product.price} - Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-4 py-2 rounded-md font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 shadow transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 rounded-md font-semibold text-white bg-red-700 hover:bg-red-800 shadow transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
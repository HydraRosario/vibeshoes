'use client';

import { useState, useEffect } from 'react';
import { Product, Variation } from '@/types/product';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/features/products';
import { DragDropImages } from './DragDropImages';
// --- Manejo de orden de imágenes ---

import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE = 500 * 1024; // 500KB máximo

// Subida a Cloudinary
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error('Cloudinary cloud name is not set');
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // Debes crear un upload preset sin firmar en Cloudinary
  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    images: string[];
    price: number | '';
    variations: Variation[];
  }>({
    name: '',
    description: '',
    images: [],
    price: '',
    variations: []
  });
  // Manejo de variaciones y talles
  const [talleMin, setTalleMin] = useState(35);
  const [talleMax, setTalleMax] = useState(44);
  const getTalleRange = () => Array.from({ length: talleMax - talleMin + 1 }, (_, i) => talleMin + i);
  const [talleRange, setTalleRange] = useState<number[]>(getTalleRange());
  const [newVariation, setNewVariation] = useState<{ color: string; tallesDisponibles: (number | string)[]; images: string[]; stock: string }>({ color: '', tallesDisponibles: [35,36,37,38,39,40,41,42,43,44], images: [], stock: '' });
  const [editingVariationIdx, setEditingVariationIdx] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  // Efecto para filtrar y ordenar productos
  useEffect(() => {
    let result = [...products];
    
    // Aplicar filtro de búsqueda
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar ordenamiento
    if (sortOrder !== 'none') {
      result.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, sortOrder]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE && file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Algunas imágenes son demasiado grandes o no son válidas. Máximo 500KB por imagen.');
    }
    setImageFiles(validFiles);
    setImagePreviews(validFiles.map(file => URL.createObjectURL(file)));
  };

  const handleAddVariation = () => {
    if (!newVariation.color || !newVariation.stock) return;
    
    if (editingVariationIdx !== null) {
      // Estamos editando una variación existente
      const updatedVariations = [...formData.variations];
      updatedVariations[editingVariationIdx] = {
        color: newVariation.color,
        tallesDisponibles: newVariation.tallesDisponibles,
        images: newVariation.images,
        stock: Number(newVariation.stock)
      };
      
      setFormData({
        ...formData,
        variations: updatedVariations
      });
      
      setEditingVariationIdx(null);
      toast.success('Variación actualizada');
    } else {
      // Estamos añadiendo una nueva variación
      setFormData({
        ...formData,
        variations: [
          ...formData.variations,
          {
            color: newVariation.color,
            tallesDisponibles: newVariation.tallesDisponibles,
            images: newVariation.images,
            stock: Number(newVariation.stock)
          }
        ]
      });
      toast.success('Variación agregada');
    }
    
    setNewVariation({ color: '', tallesDisponibles: [35,36,37,38,39,40,41,42,43,44], images: [], stock: '' });
  };
  
  const handleEditVariation = (idx: number) => {
    const variation = formData.variations[idx];
    setNewVariation({
      color: variation.color || '',
      tallesDisponibles: variation.tallesDisponibles || [35,36,37,38,39,40,41,42,43,44],
      images: variation.images || [],
      stock: variation.stock?.toString() || ''
    });
    setEditingVariationIdx(idx);
    
    // Actualizar los valores de talleMin y talleMax basados en la variación
    if (variation.tallesDisponibles && variation.tallesDisponibles.length > 0) {
      const numericTalles = variation.tallesDisponibles.map(t => Number(t)).filter(t => !isNaN(t));
      if (numericTalles.length > 0) {
        setTalleMin(Math.min(...numericTalles));
        setTalleMax(Math.max(...numericTalles));
      }
    }
  };
  
  const handleCancelEdit = () => {
    setEditingVariationIdx(null);
    setNewVariation({ color: '', tallesDisponibles: [35,36,37,38,39,40,41,42,43,44], images: [], stock: '' });
  };
  
  const handleMoveVariationImage = (variationIdx: number, from: number, to: number) => {
    if (to < 0 || to >= (formData.variations[variationIdx]?.images?.length || 0)) return;
    
    const updatedVariations = [...formData.variations];
    const images = [...(updatedVariations[variationIdx].images || [])];
    
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    
    updatedVariations[variationIdx] = {
      ...updatedVariations[variationIdx],
      images
    };
    
    setFormData({
      ...formData,
      variations: updatedVariations
    });
  };

  const handleRemoveVariation = (idx: number) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let images: string[] = [];
      if (imageFiles.length > 0) {
        images = await Promise.all(imageFiles.map(async (file) => {
          return await uploadToCloudinary(file);
        }));
      } else if (editingProduct) {
        // Si no se suben nuevas imágenes y es edición, mantener las actuales
        images = formData.images || [];
      }

      const productData: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        images,
        price: Number(formData.price),
        variations: formData.variations
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
      images: product.images || [],
      price: product.price || '',
      variations: product.variations || []
    });
    setImagePreviews(product.images || []);
    setImageFiles([]);
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

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= formData.images.length) return;
    const imgs = [...formData.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    setFormData({ ...formData, images: imgs });
    setImagePreviews(imgs);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: [],
      price: '',
      variations: []
    });
    setEditingProduct(null);
    setImagePreviews([]);
    setImageFiles([]);
    setNewVariation({ color: '', tallesDisponibles: [35,36,37,38,39,40,41,42,43,44], images: [], stock: '' });
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                className="input-field mt-1 bg-gray-50"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">Imágenes del Producto</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              <p className="mt-1 text-xs text-gray-400">Puedes seleccionar varias imágenes. Máximo 500KB por imagen.</p>
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`Vista previa ${idx+1}`} className="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow" />
                  ))}
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
          
          {/* Variaciones */}
          <div className="mt-8">
            {/* Eliminado título y círculos de variaciones */}
            <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input 
                  type="text" 
                  value={newVariation.color} 
                  onChange={e => setNewVariation({...newVariation, color: e.target.value})} 
                  className="input-field mt-1" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rango de talles</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min={1}
                    max={talleMax}
                    value={talleMin}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setTalleMin(val);
                      if(val > talleMax) setTalleMax(val);
                      const range = Array.from({ length: talleMax - val + 1 }, (_, i) => val + i);
                      setTalleRange(range);
                      setNewVariation(v => ({ ...v, tallesDisponibles: range }));
                    }}
                    className="input-field w-20"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={talleMin}
                    value={talleMax}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setTalleMax(val);
                      if(val < talleMin) setTalleMin(val);
                      const range = Array.from({ length: val - talleMin + 1 }, (_, i) => talleMin + i);
                      setTalleRange(range);
                      setNewVariation(v => ({ ...v, tallesDisponibles: range }));
                    }}
                    className="input-field w-20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input 
                  type="number" 
                  min={0} 
                  value={newVariation.stock} 
                  onChange={e => setNewVariation({...newVariation, stock: e.target.value})} 
                  className="input-field mt-1 w-20 text-gray-700" 
                />
              </div>
              
              {/* Selección de imágenes para la variación */}
              {formData.images && formData.images.length > 0 && (
                <div className="col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar imágenes para esta variación</label>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.images.map((img, idx) => {
                      const isSelected = newVariation.images.includes(img);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (isSelected) {
                              // Quitar imagen de la variación
                              setNewVariation({
                                ...newVariation,
                                images: newVariation.images.filter(i => i !== img)
                              });
                            } else {
                              // Añadir imagen a la variación
                              setNewVariation({
                                ...newVariation,
                                images: [...newVariation.images, img]
                              });
                            }
                          }}
                          className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${isSelected ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-200 hover:border-gray-400'} transition-all`}
                        >
                          <img 
                            src={img} 
                            alt="Imagen del producto" 
                            className="w-full h-16 object-cover" 
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {newVariation.images.length === 0 
                      ? 'No has seleccionado ninguna imagen para esta variación.' 
                      : `Has seleccionado ${newVariation.images.length} ${newVariation.images.length === 1 ? 'imagen' : 'imágenes'} para esta variación.`}
                  </p>
                </div>
              )}
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={handleAddVariation} 
                    className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors shadow-md"
                  >
                    {editingVariationIdx !== null ? 'Actualizar Variación' : 'Agregar Variación'}
                  </button>
                  {editingVariationIdx !== null && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit} 
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-md"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
            </div>
            
            {formData.variations.length > 0 && (
              <ul className="mt-4">
                {formData.variations.map((v, idx) => (
                  <li key={idx} className="mb-2 p-4 border border-gray-200 rounded-lg flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">Color: {v.color}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">Talles: {Array.isArray(v.tallesDisponibles) ? v.tallesDisponibles.join(', ') : 'No especificados'}</span>
                        <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">Stock: {v.stock}</span>
                      </div>
                    </div>
                    {v.images && v.images.length > 0 && (
                      <div className="flex space-x-2">
                        {v.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img src={img} alt={v.color} className="h-10 w-10 object-cover rounded-md border border-gray-300 shadow-sm" />
                            <div className="absolute -top-1 -right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                              {i > 0 && (
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveVariationImage(idx, i, i - 1);
                                  }}
                                  className="bg-white rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 text-xs shadow-sm hover:bg-gray-100"
                                >
                                  ←
                                </button>
                              )}
                              {i < v.images.length - 1 && (
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveVariationImage(idx, i, i + 1);
                                  }}
                                  className="bg-white rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 text-xs shadow-sm hover:bg-gray-100 ml-1"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button 
                        type="button" 
                        onClick={() => handleEditVariation(idx)} 
                        className="px-3 py-1 rounded-md font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 shadow-sm transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveVariation(idx)} 
                        className="px-3 py-1 rounded-md font-medium text-white bg-red-700 hover:bg-red-800 shadow-sm transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-md font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-md transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-md font-semibold text-white bg-red-700 hover:bg-red-800 shadow-lg hover:scale-105 transition-all duration-150"
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

        {/* Filtros y búsqueda */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 p-4 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-1/2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar productos</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por nombre</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${sortOrder === 'asc' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${sortOrder === 'desc' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Z-A
                </button>
                {sortOrder !== 'none' && (
                  <button
                    onClick={() => setSortOrder('none')}
                    className="px-4 py-2 rounded-md font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de productos */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 animate-fade-in-up">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <li className="py-10 text-center">
                <p className="text-gray-500 text-lg">No se encontraron productos{searchTerm ? ` que coincidan con "${searchTerm}"` : ''}.</p>
              </li>
            ) : (
              filteredProducts.map((product, idx) => {
              // Calcular stock total sumando el stock de todas las variaciones
              const totalStock = product.variations && product.variations.length > 0
                ? product.variations.reduce((acc, v) => acc + (typeof v.stock === 'number' ? v.stock : 0), 0)
                : 0;
              return (
                <li key={product.id} style={{ animationDelay: `${idx * 60}ms` }} className="flex items-center justify-between px-8 py-6 group hover:bg-red-50 transition-colors animate-fade-in-up">
                  <div className="flex items-center">
                    {product.images && product.images.length > 0 && (
                      <div className="flex space-x-2">
                        {product.images.map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover border border-gray-200 shadow"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/lightgray/white?text=No+Disponible';
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-500">Variaciones: {product.variations?.length || 0} - Stock total: {totalStock}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 min-w-[120px]">
                    <span className="font-bold text-lg text-green-700">${product.price ?? 'Sin precio'}</span>
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
                  </div>
                </li>
              );
            }))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

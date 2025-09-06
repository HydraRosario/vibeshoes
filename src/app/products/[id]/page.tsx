'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProducts } from '@/features/products';
import { Product } from '@/types/product';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { addToCart } from '@/features/cart';
import toast from 'react-hot-toast';
import ReviewList from '@/app/profile/ReviewList';

function ProductImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[500px]">
        <div className="text-gray-400">Sin imagen</div>
      </div>
    );
  }
  
  // If there's only one image, display it without carousel controls
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[500px]">
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover rounded-lg"
          priority={true}
        />
      </div>
    );
  }
  
  // Multiple images - show carousel
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[500px]">
      <button
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 w-7 h-7 text-xs"
        style={{ padding: 0 }}
        onClick={e => { e.stopPropagation(); setIdx(i => i === 0 ? images.length - 1 : i - 1); }}
        aria-label="Imagen anterior"
        type="button"
      >&#60;</button>
      <Image
        src={images[idx]}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 500px"
        className="object-cover rounded-lg"
        priority={idx === 0}
      />
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 w-7 h-7 text-xs"
        style={{ padding: 0 }}
        onClick={e => { e.stopPropagation(); setIdx(i => i === images.length - 1 ? 0 : i + 1); }}
        aria-label="Imagen siguiente"
        type="button"
      >&#62;</button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${idx === i ? 'bg-red-600' : 'bg-gray-300'}`}
            style={{ display: 'inline-block' }}
          />
        ))}
      </div>
    </div>

  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [related, setRelated] = useState<Product[]>([]);
  const { isAuthenticated, user } = useAuth();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedTalle, setSelectedTalle] = useState<string | number>('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const products = await getProducts();
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        // Relacionados: otros productos (por ahora vacío si solo hay uno)
        setRelated(products.filter((p) => p.id !== id));
      } catch (e) {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Reset talle seleccionado al cambiar color
    setSelectedTalle('');
  }, [selectedColorIdx]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!product) {
    return <div className="text-center py-16 text-gray-500">Producto no encontrado.</div>;
  }

  // Only access product.variations after confirming product is not null
  const selectedVariation = product.variations && product.variations.length > 0 ? product.variations[selectedColorIdx] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Galería de imágenes */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full">
          {selectedVariation && selectedVariation.images && selectedVariation.images.length > 0 ? (
            <ProductImageCarousel images={selectedVariation.images} alt={product.name + ' ' + selectedVariation.color} />
          ) : product.images && product.images.length > 0 ? (
            <ProductImageCarousel images={product.images} alt={product.name} />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}
        </div>
        {/* Detalles */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {product.name}
            {selectedVariation && selectedVariation.color && (
              <span className="text-xl ml-2 text-gray-600">- {selectedVariation.color}</span>
            )}
          </h1>
          <p className="text-lg text-gray-700 mb-6">{product.description}</p>
          
          {/* Selector de color como dropdown y muestra de talles disponibles */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-4">
              <div className="mb-4">
                <div className="mb-4">
                  {product.onSale ? (
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-extrabold text-green-600">
                        ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR') : 'Sin precio'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl line-through text-gray-500">
                          ${typeof product.price === 'number' ? Math.round(product.price * 1.15).toLocaleString('es-AR') : ''}
                        </span>
                        <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-md inline-block">
                          15% OFF
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-green-600">
                      ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR') : 'Sin precio'}
                    </div>
                  )}
                </div>
                <label className="block font-semibold mb-1">Color:</label>
                <div className="flex gap-4 mt-2">
                  {product.variations.map((v, idx) => (
                    <button
                      key={v.color}
                      type="button"
                      title={v.color}
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${selectedColorIdx === idx ? 'border-red-600 scale-110' : 'border-gray-300'}`}
                      style={{ background: v.images && v.images[0] ? `url('${v.images[0]}') center/cover no-repeat` : '#eee' }}
                      onClick={e => { e.preventDefault(); setSelectedColorIdx(idx); }}
                    >
                      {!v.images || v.images.length === 0 ? (
                        <span className="block w-6 h-6 bg-gray-300 rounded-full"></span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Stock:</span> {selectedVariation?.stock}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Talle:</span>
                <select
                  className="input-field ml-2"
                  value={selectedTalle}
                  onChange={e => setSelectedTalle(e.target.value)}
                >
                  <option value="">Seleccionar talle</option>
                  {[35,36,37,38,39,40,41,42,43,44].map((t) => {
                    const disponible = (selectedVariation?.tallesDisponibles || []).map(String).includes(String(t));
                    return (
                      <option key={t} value={String(t)} disabled={!disponible}>
                        {t}{!disponible ? ' (no disp.)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              if (!isAuthenticated || !user) {
                window.location.href = '/login';
                return;
              }
              
              // Verificar si el usuario tiene una dirección registrada
              if (!user.address || !user.address.street) {
                toast.error('Debes registrar una dirección en tu perfil antes de agregar productos al carrito');
                setTimeout(() => {
                  window.location.href = '/profile';
                }, 1500);
                return;
              }
              
              if (!selectedVariation) {
                toast.error('Selecciona color');
                return;
              }
              if (!selectedTalle) {
                toast.error('Selecciona talle');
                return;
              }
              // Validar que el talle pertenezca a la variación seleccionada
              const talleDisponible = (selectedVariation.tallesDisponibles || [])
                .map((t) => String(t))
                .includes(String(selectedTalle));
              if (!talleDisponible) {
                toast.error('El talle seleccionado no está disponible para este color');
                return;
              }
              if (selectedVariation.stock <= 0) {
                toast.error('Sin stock para esta variación');
                return;
              }
              setAdding(true);
              try {
                // El precio no cambia con el descuento, solo se muestra el precio "anterior" falso
                const finalPrice = typeof selectedVariation.price === 'number' 
                  ? selectedVariation.price 
                  : product.price;
                
                await addToCart(user.id, {
                  ...product,
                  selectedColor: selectedVariation.color,
                  selectedSize: selectedTalle,
                  imageUrl: selectedVariation.images[0] || product.images?.[0] || '',
                  price: finalPrice,
                  stock: selectedVariation.stock
                }, 1);
                toast.success('¡Producto agregado al carrito!');
              } catch {
                toast.error('Error al añadir al carrito');
              } finally {
                setAdding(false);
              }
            }}
            disabled={(() => {
              if (adding || !selectedVariation || selectedVariation.stock <= 0) return true;
              if (!selectedTalle) return true;
              const talleOk = (selectedVariation.tallesDisponibles || []).map(String).includes(String(selectedTalle));
              return !talleOk;
            })()}
            className="btn-primary w-full text-lg py-3 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {adding ? <LoadingSpinner size="sm" className="text-white" /> : selectedVariation && selectedVariation.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
          </button>
          
          {isAuthenticated && user && (!user.address || !user.address.street) && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-sm text-yellow-700">
              <p className="font-medium">Atención: Dirección requerida</p>
              <p className="mt-1">Debes registrar una dirección en tu perfil antes de poder agregar productos al carrito.</p>
              <button 
                onClick={() => window.location.href = '/profile'}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Ir a mi perfil
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Productos relacionados */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Productos Relacionados</h2>
        {related.length === 0 ? (
          <div className="text-gray-400 text-center text-sm">No hay productos relacionados.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.slice(0, 3).map((prod) => (
              <div key={prod.id} className="p-1">
                <ProductCard product={{ ...prod }} showVariationsGrid={false} />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Sección de comentarios/reviews debajo de los productos relacionados */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Comentarios</h2>
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}

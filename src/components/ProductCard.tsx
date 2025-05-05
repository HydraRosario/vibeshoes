import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { addToCart } from '@/features/cart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

// Carrousel que recorre la primera imagen de cada variación
function VariationCarousel({ variations, alt }: { variations: { images?: string[]; color?: string }[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const images = variations.map(v => (v.images && v.images.length > 0 ? v.images[0] : null)).filter(Boolean) as string[];
  if (!images || images.length === 0) {
    return <div className="w-full h-full flex items-center justify-center"><span className="text-xs text-gray-400">Sin imagen</span></div>;
  }
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <button
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 w-6 h-6 text-xs"
        style={{ padding: 0 }}
        onClick={e => { e.stopPropagation(); setIdx(i => i === 0 ? images.length - 1 : i - 1); }}
        aria-label="Imagen anterior"
        type="button"
      >&#60;</button>
      <Image
        src={images[idx]}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority
      />
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 w-6 h-6 text-xs"
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

// Simple carrousel de imágenes para ProductCard
function Carousel({ images, alt, smallArrows = false }: { images: string[]; alt: string; smallArrows?: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <button
        className={`absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 ${smallArrows ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base'}`}
        style={{ padding: 0 }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => i === 0 ? images.length - 1 : i - 1); }}
        aria-label="Imagen anterior"
        type="button"
      >&#60;</button>
      <Image
        src={images[imgIdx]}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={imgIdx === 0}
      />
      <button
        className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 ${smallArrows ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base'}`}
        style={{ padding: 0 }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => i === images.length - 1 ? 0 : i + 1); }}
        aria-label="Imagen siguiente"
        type="button"
      >&#62;</button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${imgIdx === i ? 'bg-red-600' : 'bg-gray-300'}`}
            style={{ display: 'inline-block' }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductCard({ product, showVariationsGrid = false }: ProductCardProps & { showVariationsGrid?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Variación seleccionada para la imagen principal
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const variations = product.variations || [];
  const selectedVariation = variations[selectedVariationIdx];

  // Flechas para cambiar variación
  const handleNextVariation = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedVariationIdx((prev) => (prev + 1) % variations.length);
  };
  const handlePrevVariation = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedVariationIdx((prev) => (prev - 1 + variations.length) % variations.length);
  };

  const mainImage = selectedVariation && selectedVariation.images && selectedVariation.images.length > 0
    ? selectedVariation.images[0]
    : (product.images && product.images.length > 0 ? product.images[0] : undefined);

  // Calcular stock total sumando el stock de todas las variaciones
  const totalStock = product.variations && product.variations.length > 0
    ? product.variations.reduce((acc, v) => acc + (typeof v.stock === 'number' ? v.stock : 0), 0)
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      const debugPrice = (selectedVariation && typeof selectedVariation.price === 'number') ? selectedVariation.price : product.price;
      
      
      
      
      await addToCart(user.id, {
        ...product,
        selectedColor: product.variations && product.variations.length > 0 ? product.variations[0].color : '',
        selectedSize: '',
        imageUrl: mainImage || '',
        price: debugPrice,
        stock: product.variations && product.variations.length > 0 ? product.variations[0].stock : 0
      }, 1);
      toast.success('¡Producto agregado al carrito!');
    } catch (error) {
      setError('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="block group focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg cursor-pointer"
      onClick={() => window.location.href = `/products/${product.id}`}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if(e.key === 'Enter') window.location.href = `/products/${product.id}`; }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform group-hover:scale-105 group-hover:shadow-2xl group-active:scale-100">
        <div className="relative w-full aspect-square bg-gray-100 rounded-t-lg overflow-hidden h-[220px] md:h-[300px]"
          onClick={e => e.stopPropagation()} // Esto previene la navegación si se hace click dentro del carrousel
        >
          {product.variations && product.variations.length > 0 ? (
            <VariationCarousel
              variations={product.variations}
              alt={product.name}
            />
          ) : (
            <Carousel images={product.images || []} alt={product.name} smallArrows />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">{product.name}</h3>
          <p className="text-base font-semibold text-green-700 mt-1">${typeof product.price === 'number' ? product.price.toLocaleString('es-AR') : 'Sin precio'}</p>
          <p className="text-gray-600 mt-1 text-sm line-clamp-2">{product.description}</p>

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Stock total: {totalStock}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
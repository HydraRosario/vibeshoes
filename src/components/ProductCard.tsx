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
  // Si solo hay una imagen, no mostrar controles de navegación
  if (images.length === 1) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </div>
    );
  }
  
  // Si hay múltiples imágenes, mostrar con controles de navegación
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <button
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 rounded-full z-10 hover:bg-white border border-gray-300 w-6 h-6 text-xs"
        style={{ padding: 0 }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => i === 0 ? images.length - 1 : i - 1); }}
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
        onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => i === images.length - 1 ? 0 : i + 1); }}
        aria-label="Imagen siguiente"
        type="button"
      >&#62;</button>
      {/* Solo mostrar los puntos de navegación si hay más de una imagen */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${idx === i ? 'bg-red-600' : 'bg-gray-300'}`}
              style={{ display: 'inline-block' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple carrousel de imágenes para ProductCard
function Carousel({ images, alt, smallArrows = false }: { images: string[]; alt: string; smallArrows?: boolean }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!images || images.length === 0) return null;
  
  // Si solo hay una imagen, mostrar sin controles de carrusel
  if (images.length === 1) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={true}
        />
      </div>
    );
  }
  
  // Ya tenemos un return arriba para el caso de una sola imagen
  // Este return es solo para múltiples imágenes
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
      {/* Solo mostrar los puntos de navegación si hay más de una imagen */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${imgIdx === i ? 'bg-red-600' : 'bg-gray-300'}`}
              style={{ display: 'inline-block' }}
            />
          ))}
        </div>
      )}
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
    
  // Calcular precio falso (15% más) para mostrar como precio anterior tachado cuando onSale es true
  const currentPrice = product.price;
  const fakeOriginalPrice = product.onSale ? Math.round(currentPrice * 1.15) : currentPrice;

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      // El precio no cambia con el descuento, solo se muestra el precio "anterior" falso
      const finalPrice = (selectedVariation && typeof selectedVariation.price === 'number')
        ? selectedVariation.price
        : product.price;
      
      await addToCart(user.id, {
        ...product,
        selectedColor: product.variations && product.variations.length > 0 ? product.variations[0].color : '',
        selectedSize: '',
        imageUrl: mainImage || '',
        price: finalPrice,
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
    <div className="group relative flex flex-col rounded-3xl bg-gradient-to-br from-pink-50 via-white to-yellow-50 shadow-2xl hover:shadow-pink-300 transition-shadow duration-200 overflow-hidden border-2 border-pink-100 animate-fade-in-up">
      <Link href={`/products/${product.id}`} className="block relative h-56 w-full">
        {product.variations && product.variations.length > 0 ? (
          <VariationCarousel variations={product.variations} alt={product.name} />
        ) : (
          product.images && product.images.length > 0 ? (
            <Carousel images={product.images} alt={product.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Sin imagen</div>
          )
        )}
        {product.onSale && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-lg animate-bounce">Oferta</span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-xl text-pink-700 mb-1 line-clamp-2 drop-shadow-sm animate-fade-in-up">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          {product.onSale ? (
            <>
              <span className="text-2xl font-extrabold text-pink-600 animate-pulse">
                {(product.price * 0.85).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
              </span>
              <span className="text-base text-gray-400 line-through font-bold">
                {product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
              </span>
            </>
          ) : (
            <span className="text-2xl font-extrabold text-pink-700 animate-fade-in-up">
              {product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })}
            </span>
          )}
        </div>
        <div className="flex-1" />
        <Link href={`/products/${product.id}`} className="mt-3 w-full inline-block text-center bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-red-50 py-3 rounded-xl font-extrabold hover:from-red-800 hover:to-red-600 transition-all duration-150 shadow-lg text-lg animate-fade-in-up">
          Ver detalles
        </Link>
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
}
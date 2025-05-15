import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface OrderReviewItemProps {
  item: any; // Puedes tipar mejor si tienes el tipo de OrderItem
  orderId: string;
  userId: string;
  userName: string;
}

export function OrderReviewItem({ item, orderId, userId, userName }: OrderReviewItemProps) {
  const [reviewed, setReviewed] = useState<boolean | null>(null);
  const [loadingReview, setLoadingReview] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkReview() {
      setLoadingReview(true);
      try {
        const mod = await import('@/features/reviews');
        const existing = await mod.getReviewByUserAndProduct(userId, item.productId);
        if (mounted) setReviewed(!!existing);
      } catch {
        if (mounted) setReviewed(false);
      } finally {
        if (mounted) setLoadingReview(false);
      }
    }
    checkReview();
    return () => { mounted = false; };
  }, [userId, item.productId]);

  return (
    <div className="mb-6 p-4 bg-white rounded shadow border">
      <div className="flex items-center gap-3 mb-2">
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
        )}
        <span className="font-semibold text-gray-800">{item.name}</span>
      </div>
      {/* Formulario para dejar review o mensaje si ya dejó review */}
      <div className="mb-2">
        {loadingReview ? (
          <span className="text-gray-400 text-sm">Cargando...</span>
        ) : reviewed ? (
          <span className="text-green-600 text-sm font-semibold">Ya has dejado un review para este producto.</span>
        ) : (
          <ReviewForm
            productId={item.productId}
            orderId={orderId}
            userId={userId}
            userName={userName}
            onReviewSubmitted={() => setReviewed(true)}
          />
        )}
      </div>
      {/* Lista de reviews del producto */}
      <ReviewList productId={item.productId} />
    </div>
  );
}

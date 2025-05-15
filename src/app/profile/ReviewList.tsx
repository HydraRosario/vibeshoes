import { useEffect, useState } from 'react';
import { getReviewsByProduct, deleteReview } from '@/features/reviews';
import { Review } from '@/types/review';
import { useAuth } from '@/hooks/useAuth';

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const res = await getReviewsByProduct(productId);
      setReviews(res);
      setLoading(false);
    };
    fetchReviews();
  }, [productId]);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    await deleteReview(reviewId);
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  if (loading) return <div className="text-sm text-gray-400">Cargando comentarios...</div>;
  if (reviews.length === 0) return <div className="text-sm text-gray-400">Sin comentarios aún.</div>;

  return (
    <div className="space-y-4 mt-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-700">{review.userName}</span>
            <span className="text-yellow-400 text-lg">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
            {isAdmin && (
              <button onClick={() => handleDelete(review.id)} className="ml-2 text-xs text-red-600 hover:underline">Eliminar</button>
            )}
          </div>
          <div className="text-gray-700 text-sm">{review.comment}</div>
        </div>
      ))}
    </div>
  );
}

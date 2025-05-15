import { useState } from 'react';
import { addReview, getReviewByUserAndProduct } from '@/features/reviews';
import { Review } from '@/types/review';

interface ReviewFormProps {
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  onReviewSubmitted: (review: Review) => void;
}

export default function ReviewForm({ productId, orderId, userId, userName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Check if review already exists
      const existing = await getReviewByUserAndProduct(userId, productId);
      if (existing) {
        setError('Ya has hecho un review para este producto.');
        setDone(true);
        return;
      }
      const review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'> = {
        productId,
        userId,
        userName,
        rating,
        comment,
        orderId,
      };
      const saved = await addReview(review);
      setDone(true);
      onReviewSubmitted(saved);
    } catch (err) {
      setError('Error al guardar el comentario.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <div className="text-green-600 font-semibold">¡Review ya hecho!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
            aria-label={`Puntuar ${star} estrellas`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm">{rating} estrellas</span>
      </div>
      <textarea
        className="w-full border rounded p-2 text-sm"
        placeholder="Dejá tu comentario sobre el producto..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        required
        minLength={3}
        maxLength={300}
      />
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <button type="submit" disabled={loading || rating === 0} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:bg-gray-400">
        {loading ? 'Enviando...' : 'Enviar review'}
      </button>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Cart } from '@/types/cart';

export function useRealtimeCart(userId?: string | null) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const cartRef = doc(db, 'carts', userId);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        setCart(docSnap.data() as Cart);
      } else {
        setCart(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return { cart, loading };
}
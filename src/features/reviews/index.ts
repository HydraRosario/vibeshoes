import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Review } from '@/types/review';

const REVIEWS_COLLECTION = 'reviews';

export const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> => {
  const now = new Date();
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...review,
    createdAt: now,
    updatedAt: now,
  });
  return { ...review, id: docRef.id, createdAt: now, updatedAt: now };
};

export const getReviewsByProduct = async (productId: string): Promise<Review[]> => {
  const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', productId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Review));
};

export const getReviewByUserAndProduct = async (userId: string, productId: string): Promise<Review | null> => {
  const q = query(collection(db, REVIEWS_COLLECTION), where('userId', '==', userId), where('productId', '==', productId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Review;
};

export const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(reviewRef, { ...updates, updatedAt: new Date() });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await deleteDoc(reviewRef);
};

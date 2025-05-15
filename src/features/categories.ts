import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const CATEGORIES_COLLECTION = 'categories';

export const getCategories = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  return snapshot.docs.map(docSnap => docSnap.data().name as string);
};

export const addCategory = async (name: string): Promise<void> => {
  await addDoc(collection(db, CATEGORIES_COLLECTION), { name });
};

export const deleteCategory = async (name: string): Promise<void> => {
  const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  const toDelete = snapshot.docs.find(docSnap => docSnap.data().name === name);
  if (toDelete) {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, toDelete.id));
  }
};

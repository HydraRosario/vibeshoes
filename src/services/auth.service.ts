import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '@/types/user';
import * as authFeature from '@/features/auth';

const USERS_COLLECTION = 'users';

export const initializeAuthListener = (
  onUserChange: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await getUserData(firebaseUser.uid);
      onUserChange(user);
    } else {
      onUserChange(null);
    }
  });
};

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const createUserProfile = async (user: User): Promise<boolean> => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user);
    return true;
  } catch (error) {
    console.error('Error al crear perfil de usuario:', error);
    return false;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), data, { merge: true });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    throw error;
  }
};

export const login = authFeature.loginWithEmail;
export const register = authFeature.registerWithEmail;
export const logout = authFeature.logout;
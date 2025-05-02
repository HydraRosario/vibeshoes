import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '@/types/user';

const ADMIN_EMAILS = ['bautistavideau@gmail.com']; // Reemplaza con tu email

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return null;
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userData: User = {
      id: result.user.uid,
      email: result.user.email!,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', result.user.uid), {
      ...userData,
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString()
    });

    return result.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return null;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // Crear nuevo perfil de usuario
      const userData: User = {
        id: result.user.uid,
        email: result.user.email!,
        displayName: result.user.displayName || undefined,
        photoURL: result.user.photoURL || undefined,
        isAdmin: ADMIN_EMAILS.includes(result.user.email!),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', result.user.uid), {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString()
      });
      // Marcar primer login en localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('first_login', 'true');
      }
    }

    // Actualizar siempre displayName y photoURL en Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: result.user.displayName || undefined,
      photoURL: result.user.photoURL || undefined,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return result.user;
  } catch (error) {
    console.error('Error en la autenticación con Google:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};
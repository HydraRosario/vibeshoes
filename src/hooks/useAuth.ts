import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/user';
import { loginWithGoogle, logout } from '@/features/auth';
import { getUserData } from '@/services/auth.service';

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener datos del usuario de Firestore, incluyendo el estado de admin
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async (): Promise<AuthResult> => {
    try {
      const user = await loginWithGoogle();
      if (!user) {
        return { 
          success: false, 
          error: 'Error al iniciar sesión con Google' 
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error al iniciar sesión con Google'
      };
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    loading,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout
  };
}
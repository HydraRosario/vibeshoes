'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();

  return (
  <nav className="bg-orange-600 text-white shadow-lg" role="navigation" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">GOKU</span>
            </Link>
            
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/products"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Productos
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/products"
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/cart"
                  className="text-white hover:text-gray-600 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                </Link>
                <Link
                  href="/profile"
                  className="bg-white/20 hover:bg-yellow-100 focus:bg-yellow-200 text-white hover:text-orange-700 focus:text-orange-800 px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium shadow-sm hover:shadow outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Mi Perfil</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-white text-orange-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-semibold"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
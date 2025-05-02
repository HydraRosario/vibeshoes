'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();

  return (
    <nav className="bg-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">VIBE SHOES</span>
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
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                </Link>
                <div className="text-sm text-gray-200">
                  {user.email}
                </div>
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
                className="bg-white text-red-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-semibold"
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
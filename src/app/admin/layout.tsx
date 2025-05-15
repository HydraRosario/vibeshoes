'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!loading && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Panel Admin</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
        </div>
        <nav className="mt-4 space-y-1">
          <Link
            href="/admin"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            Productos
          </Link>
          <Link
            href="/admin/categories"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            Categorías
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            Órdenes
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
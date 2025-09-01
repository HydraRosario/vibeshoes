'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-red-100 py-3 mt-8" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-1">
          <p className="text-gray-400">
            &copy; 2025 - VIBESHOES. Todos los derechos reservados. Designed by{' '}
            <Link href="https://github.com/HydraRosario" target="_blank" className="text-yellow-400 hover:text-yellow-200 focus:text-yellow-300 transition-colors outline-none underline">
              HydraRosario
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

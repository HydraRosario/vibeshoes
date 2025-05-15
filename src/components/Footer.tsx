'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12" role="contentinfo" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">VIBESHOES</h2>
            <p className="text-gray-400 mt-2">Tu tienda de calzado favorita</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img 
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
                alt="Google" 
                width={32} 
                height={32}
                className="rounded-full object-contain"
              />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" 
                alt="WhatsApp" 
                width={32} 
                height={32}
                className="rounded-full object-contain"
              />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png" 
                alt="Instagram" 
                width={32} 
                height={32}
                className="rounded-full object-contain"
              />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png" 
                alt="Facebook" 
                width={32} 
                height={32}
                className="rounded-full object-contain"
              />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
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

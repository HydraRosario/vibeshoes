import { Suspense } from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { FloatingCart } from '@/components/FloatingCart';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VIBESHOES - Tu tienda de zapatillas',
  description: 'Las mejores zapatillas al mejor precio. Encuentra tu estilo en VIBESHOES.',
  keywords: 'zapatillas, calzado, deportivas, moda, compras online',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Suspense fallback={null}>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Providers />
          <FloatingCart />
        </Suspense>
      </body>
    </html>
  );
}

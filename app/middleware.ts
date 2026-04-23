// middleware.ts  (di root project, sejajar dengan app/)
// Tambahkan /buku ke daftar rute yang TIDAK memerlukan login

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute yang boleh diakses tanpa login
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/katalog',
  '/buku',        // ← TAMBAHKAN INI (mencakup /buku/[id] juga)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan semua rute publik (termasuk sub-path seperti /buku/xxx)
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  // Cek session cookie
  const session = request.cookies.get('session')?.value;
  if (!session) {
    // Simpan tujuan asal agar setelah login bisa redirect balik
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Jalankan middleware di semua halaman kecuali _next & file statis
    '/((?!_next/static|_next/image|favicon.ico|logo-.*\\.png|.*\\.svg).*)',
  ],
};
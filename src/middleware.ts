import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Middleware simplificado - apenas para rotas de API
  // A proteção de rotas será feita pelo AuthGuard
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apenas proteger rotas de API
    '/api/:path*',
  ],
};
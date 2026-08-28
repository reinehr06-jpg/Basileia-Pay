import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ignorar arquivos estáticos e _next
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rotas que precisam estar logadas
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/settings');

  // Rotas exclusivas de visitante (não pode acessar se já tiver cookie)
  const isAuthRoute = request.nextUrl.pathname === '/login' ||
                      request.nextUrl.pathname === '/register' ||
                      request.nextUrl.pathname.startsWith('/forgot-password');

  // Em produção de verdade, o Laravel Sanctum devolve o cookie 'basileia_session'
  // Vamos verificar o basileia_session ou o auth_token genérico.
  const hasAuthCookie = request.cookies.has('basileia_session') || 
                        request.cookies.has('basileia_access_token');

  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

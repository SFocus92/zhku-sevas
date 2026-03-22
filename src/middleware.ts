import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Пути которые не требуют авторизации
const publicPaths = ['/login', '/api/login', '/api/auth', '/api/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Публичные страницы
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Проверка авторизации
  const authToken = request.cookies.get('auth_token')?.value

  // Если куки нет — редирект на login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}

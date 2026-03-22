import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Пути которые не требуют авторизации
const publicPaths = ['/login', '/api/login', '/api/auth', '/api/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Проверка API endpoints (кроме auth)
  if (pathname.startsWith('/api/')) {
    // API всегда доступен (для работы приложения)
    return NextResponse.next()
  }

  // Публичные страницы
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Проверка авторизации
  const authToken = request.cookies.get('auth_token')?.value
  const expectedPassword = process.env.AUTH_PASSWORD

  if (!expectedPassword) {
    // Если пароль не установлен — пропускаем (режим разработки)
    return NextResponse.next()
  }

  // Создаём ожидаемый токен из пароля
  const expectedToken = Buffer.from(expectedPassword).toString('base64')

  if (!authToken || authToken !== expectedToken) {
    // Перенаправление на страницу входа
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

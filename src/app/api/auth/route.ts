import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    const expectedPassword = process.env.AUTH_PASSWORD

    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Сервер не настроен. Добавьте AUTH_PASSWORD в Environment Variables на Vercel.' },
        { status: 500 }
      )
    }

    if (password === expectedPassword) {
      // Создаём токен из пароля
      const authToken = Buffer.from(password).toString('base64')

      const response = NextResponse.json({ success: true })

      // Устанавливаем куку на 30 дней
      response.cookies.set('auth_token', authToken, {
        httpOnly: true,
        secure: true, // Только HTTPS для production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'Неверный пароль' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

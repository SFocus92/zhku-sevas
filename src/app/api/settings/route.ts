import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить настройки
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      const now = new Date()
      settings = await prisma.settings.create({
        data: {
          ownerName: '',
          currentMonth: now.getMonth() + 1,
          currentYear: now.getFullYear(),
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Ошибка получения настроек' }, { status: 500 })
  }
}

// PUT - обновить настройки
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const settings = await prisma.settings.findFirst()
    
    if (!settings) {
      return NextResponse.json({ error: 'Настройки не найдены' }, { status: 404 })
    }
    
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone || null,
        currentMonth: data.currentMonth,
        currentYear: data.currentYear,
      }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Ошибка обновления настроек' }, { status: 500 })
  }
}

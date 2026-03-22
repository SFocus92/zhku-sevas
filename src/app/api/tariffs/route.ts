import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить все тарифы
export async function GET() {
  try {
    const tariffs = await prisma.tariff.findMany({
      where: { isActive: true },
      orderBy: { serviceType: 'asc' }
    })
    
    return NextResponse.json(tariffs)
  } catch (error) {
    console.error('Get tariffs error:', error)
    return NextResponse.json({ error: 'Ошибка получения тарифов' }, { status: 500 })
  }
}

// PUT - обновить тариф
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const tariff = await prisma.tariff.update({
      where: { id: data.id },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        unit: data.unit,
        limitFrom: data.limitFrom ? parseFloat(data.limitFrom) : null,
        limitTo: data.limitTo ? parseFloat(data.limitTo) : null,
      }
    })
    
    return NextResponse.json(tariff)
  } catch (error) {
    console.error('Update tariff error:', error)
    return NextResponse.json({ error: 'Ошибка обновления тарифа' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить статистику для главной страницы
export async function GET() {
  try {
    // Количество домов
    const housesCount = await prisma.house.count()

    // Количество заселённых домиков
    const occupiedCount = await prisma.house.count({
      where: { isOccupied: true }
    })

    // Общий объём помещений
    const houses = await prisma.house.findMany()
    const totalVolume = houses.reduce((sum, h) => sum + (h.length * h.width * h.height), 0)

    // Последние счета
    const recentBills = await prisma.bill.findMany({
      take: 5,
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    // Сумма за текущий месяц
    const now = new Date()
    const currentMonthBills = await prisma.bill.findMany({
      where: {
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    })
    const currentMonthTotal = currentMonthBills.reduce((sum, b) => sum + b.totalAmount, 0)

    return NextResponse.json({
      housesCount,
      occupiedCount,
      totalVolume: Math.round(totalVolume * 100) / 100,
      currentMonthTotal: Math.round(currentMonthTotal * 100) / 100,
      recentBills,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Ошибка получения статистики' }, { status: 500 })
  }
}

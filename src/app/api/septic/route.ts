import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить вызовы ассенизации
export async function GET() {
  try {
    const services = await prisma.septicService.findMany({
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Get septic error:', error)
    return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 })
  }
}

// POST - добавить вызов
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const service = await prisma.septicService.create({
      data: {
        date: new Date(data.date),
        cost: parseFloat(data.cost),
        volume: data.volume ? parseFloat(data.volume) : null,
        notes: data.notes || null,
        splitBetween: data.splitBetween || 'all'
      }
    })
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Create septic error:', error)
    return NextResponse.json({ error: 'Ошибка создания записи' }, { status: 500 })
  }
}

// DELETE - удалить вызов
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
    }
    
    await prisma.septicService.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete septic error:', error)
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}

// PUT - рассчитать распределение по домам
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { cost, houseIds } = data
    
    // Получаем дома
    const houses = houseIds 
      ? await prisma.house.findMany({ where: { id: { in: houseIds } } })
      : await prisma.house.findMany({ where: { isMain: false } })
    
    if (houses.length === 0) {
      return NextResponse.json({ error: 'Нет домов для распределения' }, { status: 400 })
    }
    
    const amountPerHouse = Math.round((cost / houses.length) * 100) / 100
    
    const results = houses.map((h, i) => {
      // Последний получает корректировку
      if (i === houses.length - 1) {
        const totalCalculated = amountPerHouse * (houses.length - 1)
        const correctedAmount = Math.round((cost - totalCalculated) * 100) / 100
        return { houseId: h.id, houseName: h.name, amount: correctedAmount }
      }
      return { houseId: h.id, houseName: h.name, amount: amountPerHouse }
    })
    
    return NextResponse.json({
      totalCost: cost,
      houseCount: houses.length,
      amountPerHouse,
      results
    })
  } catch (error) {
    console.error('Split septic error:', error)
    return NextResponse.json({ error: 'Ошибка расчёта' }, { status: 500 })
  }
}

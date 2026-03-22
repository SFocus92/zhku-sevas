import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить показания
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const houseId = searchParams.get('houseId')

    const where: any = {}
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    if (houseId) where.houseId = houseId

    const readings = await prisma.meterReading.findMany({
      where,
      include: {
        house: { select: { id: true, name: true } }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    // Если указан конкретный месяц/год и дом - получаем предыдущие показания
    if (month && year && houseId) {
      const currentMonth = parseInt(month)
      const currentYear = parseInt(year)

      // Получаем последние показания ДО текущего периода (любой предыдущий месяц)
      const lastReadings = await prisma.meterReading.findMany({
        where: {
          houseId,
          OR: [
            { year: { lt: currentYear } },
            { year: currentYear, month: { lt: currentMonth } }
          ]
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      })

      // Создаём мапу последних показаний по типу счётчика (берём самое свежее для каждого типа)
      const prevMap: Record<string, number> = {}
      const seenTypes = new Set<string>()
      lastReadings.forEach(r => {
        if (!seenTypes.has(r.meterType)) {
          prevMap[r.meterType] = r.currentValue
          seenTypes.add(r.meterType)
        }
      })

      return NextResponse.json({
        readings,
        previousReadings: prevMap
      })
    }

    return NextResponse.json({ readings, previousReadings: {} })
  } catch (error) {
    console.error('Get meters error:', error)
    return NextResponse.json({ error: 'Ошибка получения показаний' }, { status: 500 })
  }
}

// POST - сохранить показания
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Проверяем, есть ли уже запись за этот период
    const existing = await prisma.meterReading.findFirst({
      where: {
        houseId: data.houseId,
        meterType: data.meterType,
        month: parseInt(data.month),
        year: parseInt(data.year),
      }
    })

    const consumption = parseFloat(data.currentValue) - parseFloat(data.previousValue)

    if (existing) {
      // Обновляем
      const updated = await prisma.meterReading.update({
        where: { id: existing.id },
        data: {
          previousValue: parseFloat(data.previousValue),
          currentValue: parseFloat(data.currentValue),
          consumption: consumption > 0 ? consumption : 0,
        }
      })
      return NextResponse.json(updated)
    } else {
      // Создаём новую
      const created = await prisma.meterReading.create({
        data: {
          houseId: data.houseId,
          meterType: data.meterType,
          month: parseInt(data.month),
          year: parseInt(data.year),
          previousValue: parseFloat(data.previousValue),
          currentValue: parseFloat(data.currentValue),
          consumption: consumption > 0 ? consumption : 0,
        }
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error('Save meter error:', error)
    return NextResponse.json({ error: 'Ошибка сохранения показаний' }, { status: 500 })
  }
}

// DELETE - удалить показания
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
    }

    await prisma.meterReading.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete meter error:', error)
    return NextResponse.json({ error: 'Ошибка удаления показаний' }, { status: 500 })
  }
}

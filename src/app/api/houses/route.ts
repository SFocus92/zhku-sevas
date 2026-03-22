import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить все дома
export async function GET() {
  try {
    const houses = await prisma.house.findMany({
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }]
    })

    const housesWithVolume = houses.map(house => ({
      ...house,
      volume: house.length * house.width * house.height,
    }))

    return NextResponse.json(housesWithVolume)
  } catch (error) {
    console.error('Get houses error:', error)
    return NextResponse.json({ error: 'Ошибка получения домов' }, { status: 500 })
  }
}

// POST - создать новый дом
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const house = await prisma.house.create({
      data: {
        name: data.name,
        address: data.address || '',
        isMain: data.isMain || false,
        length: parseFloat(data.length) || 0,
        width: parseFloat(data.width) || 0,
        height: parseFloat(data.height) || 2.7,
        hasWaterMeter: data.hasWaterMeter || false,
        hasElectricMeter: data.hasElectricMeter || false,
        isOccupied: false,
      }
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error('Create house error:', error)
    return NextResponse.json({ error: 'Ошибка создания дома' }, { status: 500 })
  }
}

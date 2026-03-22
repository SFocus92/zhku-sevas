import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Инициализация тарифов Севастополя 2026
const DEFAULT_TARIFFS = [
  { name: 'Электричество (до 150 кВт·ч)', serviceType: 'electric_1', price: 5.13, unit: 'кВт·ч', limitFrom: 0, limitTo: 150 },
  { name: 'Электричество (150-600 кВт·ч)', serviceType: 'electric_2', price: 5.52, unit: 'кВт·ч', limitFrom: 150, limitTo: 600 },
  { name: 'Электричество (свыше 600 кВт·ч)', serviceType: 'electric_3', price: 9.46, unit: 'кВт·ч', limitFrom: 600, limitTo: null },
  { name: 'Газ', serviceType: 'gas', price: 59.61, unit: 'м³', limitFrom: null, limitTo: null },
  { name: 'Вода', serviceType: 'water', price: 58.63, unit: 'м³', limitFrom: null, limitTo: null },
  { name: 'Водоотведение', serviceType: 'sewage', price: 25.50, unit: 'м³', limitFrom: null, limitTo: null },
]

export async function GET() {
  try {
    // Проверяем есть ли тарифы
    const existingTariffs = await prisma.tariff.count()

    if (existingTariffs === 0) {
      await prisma.tariff.createMany({
        data: DEFAULT_TARIFFS
      })
    }

    // Проверяем есть ли дома
    const existingHouses = await prisma.house.count()

    if (existingHouses === 0) {
      // Создаём дома
      await prisma.house.createMany({
        data: [
          {
            name: 'Основной дом',
            isMain: true,
            length: 12,
            width: 8,
            height: 2.7,
            hasWaterMeter: true,
            hasElectricMeter: true,
            isOccupied: false,
          },
          {
            name: 'Гостевой 1',
            isMain: false,
            length: 6,
            width: 4,
            height: 2.5,
            hasWaterMeter: true,
            hasElectricMeter: true,
            isOccupied: false,
          },
          {
            name: 'Гостевой 2',
            isMain: false,
            length: 5,
            width: 4,
            height: 2.5,
            hasWaterMeter: true,
            hasElectricMeter: true,
            isOccupied: false,
          },
        ]
      })
    }

    // Проверяем настройки
    const existingSettings = await prisma.settings.count()

    if (existingSettings === 0) {
      const now = new Date()
      await prisma.settings.create({
        data: {
          ownerName: 'Максим',
          currentMonth: now.getMonth() + 1,
          currentYear: now.getFullYear(),
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'База данных инициализирована'
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Ошибка инициализации' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить дом по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const house = await prisma.house.findUnique({
      where: { id }
    })

    if (!house) {
      return NextResponse.json({ error: 'Дом не найден' }, { status: 404 })
    }

    return NextResponse.json({
      ...house,
      volume: house.length * house.width * house.height
    })
  } catch (error) {
    console.error('Get house error:', error)
    return NextResponse.json({ error: 'Ошибка получения дома' }, { status: 500 })
  }
}

// PUT - обновить дом
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Получаем текущий дом
    const existingHouse = await prisma.house.findUnique({
      where: { id }
    })

    if (!existingHouse) {
      return NextResponse.json({ error: 'Дом не найден' }, { status: 404 })
    }

    // Формируем данные для обновления, сохраняя существующие значения
    const updateData: any = {}

    // Обновляем только переданные поля
    if (data.name !== undefined) updateData.name = data.name
    if (data.address !== undefined) updateData.address = data.address
    if (data.length !== undefined) updateData.length = parseFloat(data.length) || existingHouse.length
    if (data.width !== undefined) updateData.width = parseFloat(data.width) || existingHouse.width
    if (data.height !== undefined) updateData.height = parseFloat(data.height) || existingHouse.height
    if (data.hasWaterMeter !== undefined) updateData.hasWaterMeter = data.hasWaterMeter
    if (data.hasElectricMeter !== undefined) updateData.hasElectricMeter = data.hasElectricMeter
    if (data.isOccupied !== undefined) updateData.isOccupied = data.isOccupied

    const house = await prisma.house.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      ...house,
      volume: house.length * house.width * house.height
    })
  } catch (error) {
    console.error('Update house error:', error)
    return NextResponse.json({ error: 'Ошибка обновления дома' }, { status: 500 })
  }
}

// DELETE - удалить дом
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем, не основной ли дом
    const existingHouse = await prisma.house.findUnique({
      where: { id }
    })

    if (!existingHouse) {
      return NextResponse.json({ error: 'Дом не найден' }, { status: 404 })
    }

    if (existingHouse.isMain) {
      return NextResponse.json({ error: 'Основной дом нельзя удалить' }, { status: 400 })
    }

    // Удаляем связанные записи
    await prisma.billItem.deleteMany({
      where: { houseId: id }
    })

    await prisma.meterReading.deleteMany({
      where: { houseId: id }
    })

    await prisma.house.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete house error:', error)
    return NextResponse.json({ error: 'Ошибка удаления дома' }, { status: 500 })
  }
}

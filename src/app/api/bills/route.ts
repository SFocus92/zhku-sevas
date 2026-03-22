import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - получить счета
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    const where: any = {}
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    
    const bills = await prisma.bill.findMany({
      where,
      include: {
        items: {
          include: {
            house: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })
    
    return NextResponse.json(bills)
  } catch (error) {
    console.error('Get bills error:', error)
    return NextResponse.json({ error: 'Ошибка получения счетов' }, { status: 500 })
  }
}

// POST - сохранить счёт
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Проверяем есть ли уже счёт за этот период
    const existing = await prisma.bill.findFirst({
      where: {
        month: data.month,
        year: data.year,
        serviceType: data.serviceType
      }
    })
    
    if (existing) {
      // Удаляем старый счёт
      await prisma.billItem.deleteMany({
        where: { billId: existing.id }
      })
      await prisma.bill.delete({
        where: { id: existing.id }
      })
    }
    
    // Создаём новый счёт
    const bill = await prisma.bill.create({
      data: {
        month: data.month,
        year: data.year,
        serviceType: data.serviceType,
        totalConsumption: data.totalConsumption,
        totalAmount: data.totalAmount,
        tariffUsed: data.price,
        items: {
          create: data.results.map((r: any) => ({
            houseId: r.houseId,
            volume: r.volume || 0,
            consumption: r.consumption,
            daysLived: r.daysLived || 30,
            share: r.share || 0,
            amount: r.amount,
          }))
        }
      },
      include: {
        items: {
          include: {
            house: { select: { id: true, name: true } }
          }
        }
      }
    })
    
    return NextResponse.json(bill)
  } catch (error) {
    console.error('Save bill error:', error)
    return NextResponse.json({ error: 'Ошибка сохранения счёта' }, { status: 500 })
  }
}

// DELETE - удалить счёт
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 })
    }
    
    await prisma.billItem.deleteMany({
      where: { billId: id }
    })
    
    await prisma.bill.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bill error:', error)
    return NextResponse.json({ error: 'Ошибка удаления счёта' }, { status: 500 })
  }
}

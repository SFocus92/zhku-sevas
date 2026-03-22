import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить тариф по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tariff = await prisma.tariff.findUnique({
      where: { id }
    });
    
    if (!tariff) {
      return NextResponse.json({ error: 'Тариф не найден' }, { status: 404 });
    }
    
    return NextResponse.json(tariff);
  } catch (error) {
    console.error('Error fetching tariff:', error);
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

// PUT - обновить тариф
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, serviceType, price, unit, isActive } = body;
    
    const tariff = await prisma.tariff.update({
      where: { id },
      data: {
        name,
        serviceType,
        price: parseFloat(price),
        unit,
        isActive: isActive !== undefined ? isActive : true,
      }
    });
    
    return NextResponse.json(tariff);
  } catch (error) {
    console.error('Error updating tariff:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении' }, { status: 500 });
  }
}

// DELETE - удалить тариф
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.tariff.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tariff:', error);
    return NextResponse.json({ error: 'Ошибка при удалении' }, { status: 500 });
  }
}

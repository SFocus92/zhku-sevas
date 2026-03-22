import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить показание по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reading = await prisma.meterReading.findUnique({
      where: { id },
      include: {
        house: true
      }
    });
    
    if (!reading) {
      return NextResponse.json({ error: 'Показание не найдено' }, { status: 404 });
    }
    
    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error fetching meter reading:', error);
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

// PUT - обновить показание
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { previousValue, currentValue, consumption } = body;
    
    const meterReading = await prisma.meterReading.update({
      where: { id },
      data: {
        previousValue: parseFloat(previousValue) || 0,
        currentValue: parseFloat(currentValue) || 0,
        consumption: parseFloat(consumption) || 0,
      },
      include: {
        house: true
      }
    });
    
    return NextResponse.json(meterReading);
  } catch (error) {
    console.error('Error updating meter reading:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении' }, { status: 500 });
  }
}

// DELETE - удалить показание
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.meterReading.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meter reading:', error);
    return NextResponse.json({ error: 'Ошибка при удалении' }, { status: 500 });
  }
}

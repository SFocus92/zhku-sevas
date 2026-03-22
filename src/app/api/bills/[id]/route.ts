import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить счёт по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            house: true
          }
        }
      }
    });
    
    if (!bill) {
      return NextResponse.json({ error: 'Счёт не найден' }, { status: 404 });
    }
    
    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

// DELETE - удалить счёт
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Сначала удаляем все элементы счёта
    await prisma.billItem.deleteMany({
      where: { billId: id }
    });
    
    // Затем удаляем сам счёт
    await prisma.bill.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Ошибка при удалении' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH - обновить статус оплаты элемента счёта
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { isPaid } = body;
    
    const item = await prisma.billItem.update({
      where: { id: itemId },
      data: {
        isPaid,
        paidAt: isPaid ? new Date() : null
      },
      include: {
        house: true
      }
    });
    
    // Проверяем, все ли элементы оплачены
    const allItems = await prisma.billItem.findMany({
      where: { billId: id }
    });
    
    const allPaid = allItems.every(item => item.isPaid);
    
    // Если все оплачены, обновляем статус счёта
    if (allPaid) {
      await prisma.bill.update({
        where: { id },
        data: { status: 'paid' }
      });
    } else {
      await prisma.bill.update({
        where: { id },
        data: { status: 'created' }
      });
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating bill item:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении' }, { status: 500 });
  }
}

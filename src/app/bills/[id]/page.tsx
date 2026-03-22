'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  Flame, Droplets, Zap, Trash2, Printer, Loader2, Home, ArrowLeft, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface BillItem {
  id: string
  houseId: string
  house: { id: string; name: string }
  volume: number
  consumption: number
  daysLived: number
  share: number
  amount: number
  isPaid: boolean
  paidAt: string | null
}

interface Bill {
  id: string
  month: number
  year: number
  serviceType: string
  totalConsumption: number
  totalAmount: number
  tariffUsed: number
  status: string
  items: BillItem[]
  createdAt: string
}

export default function BillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBill()
    }
  }, [params.id])

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/bills/${params.id}`)
      if (!res.ok) {
        router.push('/bills')
        return
      }
      const data = await res.json()
      setBill(data)
    } catch (error) {
      console.error('Error:', error)
      router.push('/bills')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!bill || !confirm('Удалить счёт?')) return
    
    try {
      await fetch(`/api/bills?id=${bill.id}`, { method: 'DELETE' })
      router.push('/bills')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleTogglePaid = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/bills/${bill?.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentStatus })
      })
      fetchBill()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePrint = () => {
    if (!bill) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const serviceName = bill.serviceType === 'gas' ? 'Газ' : 
                        bill.serviceType === 'water' ? 'Вода' : 'Электричество'
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Квитанция ${serviceName} ${bill.month}.${bill.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Квитанция за ${serviceName}</h1>
        <div class="header">
          <div>Период: ${bill.month}.${bill.year}</div>
          <div>Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Дом</th>
              <th>Потребление</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td>${item.house?.name || '-'}</td>
                <td>${item.consumption.toFixed(2)}</td>
                <td>${item.amount.toFixed(2)} руб.</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">ИТОГО: ${bill.totalAmount.toFixed(2)} руб.</div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'gas': return <Flame className="w-5 h-5 text-orange-500" />
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />
      case 'electric': return <Zap className="w-5 h-5 text-yellow-500" />
      default: return null
    }
  }

  const getServiceName = (type: string) => {
    switch (type) {
      case 'gas': return 'Газ'
      case 'water': return 'Вода'
      case 'electric': return 'Электричество'
      default: return type
    }
  }

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Счёт не найден</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">ЖКУ</span>
            </Link>
            <Link href="/bills">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                К списку
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getServiceIcon(bill.serviceType)}
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {getServiceName(bill.serviceType)}
              </h1>
              <p className="text-gray-500">
                {months[bill.month - 1]} {bill.year}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg">
            {bill.items.length} домов
          </Badge>
        </div>

        {/* Основная информация */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Детали счёта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Общее потребление</p>
                <p className="font-medium text-lg">
                  {bill.totalConsumption.toFixed(2)} {bill.serviceType === 'electric' ? 'кВт·ч' : 'м³'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Тариф</p>
                <p className="font-medium text-lg">{bill.tariffUsed.toFixed(2)} ₽</p>
              </div>
              <div>
                <p className="text-gray-500">Итого</p>
                <p className="font-bold text-2xl text-blue-600">{bill.totalAmount.toFixed(2)} ₽</p>
              </div>
              <div>
                <p className="text-gray-500">Статус</p>
                <Badge variant={bill.status === 'paid' ? 'default' : 'outline'}>
                  {bill.status === 'paid' ? 'Оплачено' : 'К оплате'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Таблица по домам */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Распределение по домам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дом</TableHead>
                    <TableHead className="text-right">Расход</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="text-center">Оплачено</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{item.house?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.consumption.toFixed(2)} {bill.serviceType === 'electric' ? 'кВт·ч' : 'м³'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.amount.toFixed(2)} ₽
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant={item.isPaid ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTogglePaid(item.id, item.isPaid)}
                          className={item.isPaid ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Оплачено
                            </>
                          ) : (
                            'Отметить'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Действия */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Печать квитанции
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить счёт
          </Button>
        </div>

        {/* Дата создания */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Создано: {new Date(bill.createdAt).toLocaleString('ru-RU')}
        </p>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  Flame, Droplets, Zap, Trash2, Printer, Loader2, Home, FileText
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
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterYear, setFilterYear] = useState('all')

  useEffect(() => {
    fetchBills()
  }, [filterMonth, filterYear])

  const fetchBills = async () => {
    try {
      let url = '/api/bills'
      const params: string[] = []
      if (filterMonth !== 'all') params.push(`month=${filterMonth}`)
      if (filterYear !== 'all') params.push(`year=${filterYear}`)
      if (params.length > 0) url += '?' + params.join('&')
      
      const res = await fetch(url)
      const data = await res.json()
      setBills(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить счёт?')) return
    
    try {
      await fetch(`/api/bills?id=${id}`, { method: 'DELETE' })
      fetchBills()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePrint = (bill: Bill) => {
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
      case 'gas': return <Flame className="w-4 h-4 text-orange-500" />
      case 'water': return <Droplets className="w-4 h-4 text-blue-500" />
      case 'electric': return <Zap className="w-4 h-4 text-yellow-500" />
      default: return <FileText className="w-4 h-4" />
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
    { value: 'all', label: 'Все месяцы' },
    { value: '1', label: 'Январь' },
    { value: '2', label: 'Февраль' },
    { value: '3', label: 'Март' },
    { value: '4', label: 'Апрель' },
    { value: '5', label: 'Май' },
    { value: '6', label: 'Июнь' },
    { value: '7', label: 'Июль' },
    { value: '8', label: 'Август' },
    { value: '9', label: 'Сентябрь' },
    { value: '10', label: 'Октябрь' },
    { value: '11', label: 'Ноябрь' },
    { value: '12', label: 'Декабрь' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
            <Link href="/">
              <Button variant="ghost" size="sm">← Назад</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Счета и квитанции</h1>
            <p className="text-gray-500 text-sm">История расчётов</p>
          </div>
          
          <Link href="/calculate">
            <Button className="w-full sm:w-auto">
              Создать счёт
            </Button>
          </Link>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3">
              <div className="w-40">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все годы</SelectItem>
                    {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список счетов */}
        {bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map(bill => (
              <Card key={bill.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getServiceIcon(bill.serviceType)}
                      {getServiceName(bill.serviceType)} - {bill.month}.{bill.year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {bill.items.length} домов
                      </Badge>
                      <span className="text-lg md:text-xl font-bold text-blue-600">
                        {bill.totalAmount.toFixed(2)} ₽
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-sm">Дом</TableHead>
                          <TableHead className="text-sm text-right">Расход</TableHead>
                          <TableHead className="text-sm text-right">Сумма</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">
                              <Badge variant="outline" className="text-xs">{item.house?.name || '-'}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm">{item.consumption.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium text-sm">{item.amount.toFixed(2)} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(bill)} className="w-full sm:w-auto">
                      <Printer className="w-4 h-4 mr-1" />
                      Печать
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(bill.id)}
                      className="text-red-500 hover:text-red-600 w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Нет созданных счетов</p>
              <Link href="/calculate">
                <Button>
                  Создать первый счёт
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  Truck, Plus, Calculator, Trash2, Loader2, Home, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface House {
  id: string
  name: string
  isMain: boolean
}

interface SepticService {
  id: string
  date: string
  cost: number
  volume: number | null
  notes: string | null
  splitBetween: string
}

export default function SepticPage() {
  const [services, setServices] = useState<SepticService[]>([])
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Форма
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [cost, setCost] = useState('')
  const [volume, setVolume] = useState('')
  const [notes, setNotes] = useState('')
  
  // Расчёт
  const [showCalculation, setShowCalculation] = useState(false)
  const [calculationResult, setCalculationResult] = useState<{
    totalCost: number
    houseCount: number
    amountPerHouse: number
    results: { houseId: string; houseName: string; amount: number }[]
  } | null>(null)

  // Быстрый расчёт
  const [quickCalcCost, setQuickCalcCost] = useState('')
  const [quickCalcResult, setQuickCalcResult] = useState<{
    total: number
    perHouse: number
    count: number
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, housesRes] = await Promise.all([
        fetch('/api/septic'),
        fetch('/api/houses')
      ])
      
      const servicesData = await servicesRes.json()
      const housesData = await housesRes.json()
      
      setServices(servicesData)
      setHouses(housesData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!cost || parseFloat(cost) <= 0) return
    
    try {
      const res = await fetch('/api/septic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost: parseFloat(cost) })
      })
      
      const data = await res.json()
      setCalculationResult(data)
      setShowCalculation(true)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    
    try {
      await fetch('/api/septic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          cost: parseFloat(cost),
          volume: volume ? parseFloat(volume) : null,
          notes: notes || null,
          splitBetween: 'all'
        })
      })
      
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить запись?')) return
    
    try {
      await fetch(`/api/septic?id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0])
    setCost('')
    setVolume('')
    setNotes('')
    setShowCalculation(false)
    setCalculationResult(null)
  }

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">ЖКУ Севастополь</h1>
            </Link>
            <Link href="/">
              <Button variant="ghost">← На главную</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Выгребная яма (ассенизация)</h2>
            <p className="text-gray-500">Учёт вызовов и распределение стоимости по домам</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить вызов
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Новый вызов ассенизатора</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Дата вызова</Label>
                  <Input 
                    type="date"
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Стоимость вызова (руб.) *</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={cost} 
                    onChange={e => setCost(e.target.value)}
                    placeholder="3000"
                  />
                </div>
                
                <div>
                  <Label>Объём (м³)</Label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={volume} 
                    onChange={e => setVolume(e.target.value)}
                    placeholder="4"
                  />
                </div>
                
                <div>
                  <Label>Примечания</Label>
                  <Input 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Доп. информация"
                  />
                </div>

                {/* Расчёт распределения */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCalculate}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Рассчитать распределение
                </Button>

                {showCalculation && calculationResult && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        Распределение на {calculationResult.houseCount} домов
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      {calculationResult.amountPerHouse.toFixed(2)} ₽ с каждого дома
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {calculationResult.results.map(r => (
                        <div key={r.houseId} className="flex justify-between">
                          <span>{r.houseName}</span>
                          <span>{r.amount.toFixed(2)} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4 mr-2" />
                  )}
                  Сохранить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Быстрый расчёт */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Быстрый расчёт
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Стоимость вызова</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="3000"
                  className="bg-white"
                  value={quickCalcCost}
                  onChange={e => setQuickCalcCost(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                if (quickCalcCost && houses.length > 0) {
                  const perHouse = parseFloat(quickCalcCost) / houses.length
                  setQuickCalcResult({
                    total: parseFloat(quickCalcCost),
                    perHouse,
                    count: houses.length
                  })
                }
              }}>
                Рассчитать
              </Button>
            </div>
            {quickCalcResult && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Итого с каждого дома ({quickCalcResult.count} домов):</span>
                  <span className="text-xl font-bold text-green-600">{quickCalcResult.perHouse.toFixed(2)} ₽</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* История вызовов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">История вызовов</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Стоимость</TableHead>
                    <TableHead>Объём</TableHead>
                    <TableHead>Примечания</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map(service => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {new Date(service.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-blue-600">{service.cost.toFixed(2)} ₽</span>
                      </TableCell>
                      <TableCell>
                        {service.volume ? `${service.volume} м³` : '-'}
                      </TableCell>
                      <TableCell>{service.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет записей о вызовах</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

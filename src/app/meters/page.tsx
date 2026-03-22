'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Zap, Droplets, Save, Loader2, Home
} from 'lucide-react'
import Link from 'next/link'

interface House {
  id: string
  name: string
  isMain: boolean
  hasWaterMeter: boolean
  hasElectricMeter: boolean
  isOccupied: boolean
}

export default function MetersPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedHouseId, setSelectedHouseId] = useState('')

  const [waterPrev, setWaterPrev] = useState('0')
  const [waterCurrent, setWaterCurrent] = useState('')
  const [electricPrev, setElectricPrev] = useState('0')
  const [electricCurrent, setElectricCurrent] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedHouseId && month && year) {
      fetchReadings()
    }
  }, [selectedHouseId, month, year])

  const fetchData = async () => {
    try {
      const housesRes = await fetch('/api/houses')
      const housesData = await housesRes.json()

      setHouses(housesData)

      // Выбираем первый гостевой дом
      const guestHouse = housesData.find((h: House) => !h.isMain)
      if (guestHouse) {
        setSelectedHouseId(guestHouse.id)
      } else if (housesData.length > 0) {
        setSelectedHouseId(housesData[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReadings = async () => {
    try {
      const res = await fetch(`/api/meters?month=${month}&year=${year}&houseId=${selectedHouseId}`)
      const data = await res.json()

      const readings = data.readings || []
      const prevReadings = data.previousReadings || {}

      // Вода
      const waterReading = readings.find((r: any) => r.meterType === 'water')
      setWaterPrev(prevReadings['water']?.toString() || '0')
      setWaterCurrent(waterReading?.currentValue?.toString() || '')

      // Электричество
      const electricReading = readings.find((r: any) => r.meterType === 'electric')
      setElectricPrev(prevReadings['electric']?.toString() || '0')
      setElectricCurrent(electricReading?.currentValue?.toString() || '')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSave = async (meterType: 'water' | 'electric') => {
    const prev = meterType === 'water' ? waterPrev : electricPrev
    const current = meterType === 'water' ? waterCurrent : electricCurrent

    if (!current) return

    setSaving(true)

    try {
      await fetch('/api/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseId: selectedHouseId,
          meterType,
          month,
          year,
          previousValue: parseFloat(prev) || 0,
          currentValue: parseFloat(current) || 0,
        })
      })

      fetchReadings()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const selectedHouse = houses.find(h => h.id === selectedHouseId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-1">Показания счётчиков</h2>
        <p className="text-gray-500 mb-6">Вводите показания для каждого домика</p>

        {/* Выбор периода и дома */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-32">
                <Label>Месяц</Label>
                <Select value={month.toString()} onValueChange={v => setMonth(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Label>Год</Label>
                <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-48">
                <Label>Дом</Label>
                <Select value={selectedHouseId} onValueChange={setSelectedHouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите дом" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map(h => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} {h.isMain && '(основной)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedHouse && (
          selectedHouse.isMain ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Home className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-medium mb-2">{selectedHouse.name}</h3>
                  <p className="text-gray-500 mb-4">
                    Это основной дом собственника. Показания не нужны — вы платите остаток.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto text-left text-sm">
                    <p className="font-medium mb-2">Как работает расчёт:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700">
                      <li>Приходит общая квитанция от города</li>
                      <li>Вводите показания гостевых домиков</li>
                      <li>На странице «Расчёт» вводите общее потребление</li>
                      <li>Жильцы платят по счётчикам, вы — остаток</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedHouse.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedHouse.isOccupied ? (
                      <Badge className="bg-green-500">Заселён</Badge>
                    ) : (
                      <Badge variant="outline">Свободен</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Вода */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Вода</span>
                      <span className="text-xs text-gray-500 ml-auto">м³</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <Label className="text-xs text-gray-500">Предыдущее</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={waterPrev}
                          className="bg-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Текущее</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Введите"
                          value={waterCurrent}
                          onChange={e => setWaterCurrent(e.target.value)}
                        />
                      </div>
                    </div>
                    {waterCurrent && (
                      <p className="text-sm text-blue-600 mb-2">
                        Расход: {(parseFloat(waterCurrent) - parseFloat(waterPrev || '0')).toFixed(2)} м³
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleSave('water')}
                      disabled={saving || !waterCurrent}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Сохранить
                    </Button>
                  </div>

                  {/* Электричество */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Электричество</span>
                      <span className="text-xs text-gray-500 ml-auto">кВт·ч</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <Label className="text-xs text-gray-500">Предыдущее</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={electricPrev}
                          className="bg-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Текущее</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Введите"
                          value={electricCurrent}
                          onChange={e => setElectricCurrent(e.target.value)}
                        />
                      </div>
                    </div>
                    {electricCurrent && (
                      <p className="text-sm text-yellow-600 mb-2">
                        Расход: {(parseFloat(electricCurrent) - parseFloat(electricPrev || '0')).toFixed(2)} кВт·ч
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleSave('electric')}
                      disabled={saving || !electricCurrent}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </main>
    </div>
  )
}

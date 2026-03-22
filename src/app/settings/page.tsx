'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Settings, Save, Loader2, Home, User } from 'lucide-react'
import Link from 'next/link'

interface Tariff {
  id: string
  name: string
  serviceType: string
  price: number
  unit: string
  limitFrom: number | null
  limitTo: number | null
}

interface SettingsData {
  id: string
  ownerName: string
  ownerPhone: string | null
  currentMonth: number
  currentYear: number
}

export default function SettingsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Форма настроек
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  
  // Редактируемые тарифы
  const [editedTariffs, setEditedTariffs] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tariffsRes, settingsRes] = await Promise.all([
        fetch('/api/tariffs'),
        fetch('/api/settings')
      ])
      
      const tariffsData = await tariffsRes.json()
      const settingsData = await settingsRes.json()
      
      setTariffs(tariffsData)
      setSettings(settingsData)
      setOwnerName(settingsData?.ownerName || '')
      setOwnerPhone(settingsData?.ownerPhone || '')
      
      // Инициализация редактируемых тарифов
      const tariffsObj: Record<string, string> = {}
      tariffsData.forEach((t: Tariff) => {
        tariffsObj[t.id] = t.price.toString()
      })
      setEditedTariffs(tariffsObj)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          ownerPhone: ownerPhone || null,
          currentMonth: new Date().getMonth() + 1,
          currentYear: new Date().getFullYear(),
        })
      })
      
      alert('Настройки сохранены!')
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTariff = async (tariff: Tariff) => {
    const newPrice = editedTariffs[tariff.id]
    if (!newPrice) return
    
    try {
      await fetch('/api/tariffs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tariff.id,
          name: tariff.name,
          price: parseFloat(newPrice),
          unit: tariff.unit,
          limitFrom: tariff.limitFrom,
          limitTo: tariff.limitTo,
        })
      })
      
      fetchData()
    } catch (error) {
      console.error('Error:', error)
    }
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
        <h2 className="text-2xl font-bold mb-6">Настройки</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Данные собственника */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Данные собственника
              </CardTitle>
              <CardDescription>
                Информация для квитанций
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ФИО собственника</Label>
                <Input
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              
              <div>
                <Label>Телефон</Label>
                <Input
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  placeholder="+7 (978) 123-45-67"
                />
              </div>
              
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Сохранить
              </Button>
            </CardContent>
          </Card>

          {/* Информация о системе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Версия системы</span>
                <Badge>1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Регион</span>
                <span className="font-medium">г. Севастополь</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Тарифы</span>
                <Badge variant="outline">2026 год</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">База данных</span>
                <Badge variant="outline">SQLite</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Тарифы */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Тарифы на коммунальные услуги</CardTitle>
            <CardDescription>
              Актуальные тарифы Севастополь 2026. Можно изменить при необходимости.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Цена (руб)</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Лимит</TableHead>
                  <TableHead className="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs.map(tariff => (
                  <TableRow key={tariff.id}>
                    <TableCell className="font-medium">{tariff.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tariff.serviceType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24"
                        value={editedTariffs[tariff.id] || tariff.price}
                        onChange={e => setEditedTariffs({
                          ...editedTariffs,
                          [tariff.id]: e.target.value
                        })}
                      />
                    </TableCell>
                    <TableCell>{tariff.unit}</TableCell>
                    <TableCell>
                      {tariff.limitFrom !== null && tariff.limitTo !== null
                        ? `${tariff.limitFrom}-${tariff.limitTo}`
                        : tariff.limitFrom !== null
                        ? `свыше ${tariff.limitFrom}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        onClick={() => handleSaveTariff(tariff)}
                        disabled={editedTariffs[tariff.id] === tariff.price.toString()}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Подсказки */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Подсказки по тарифам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Электричество:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>до 150 кВт·ч</strong> - социальная норма (самый дешёвый тариф)</li>
                <li><strong>150-600 кВт·ч</strong> - сверх социальной нормы</li>
                <li><strong>свыше 600 кВт·ч</strong> - повышенный тариф за перерасход</li>
                <li><strong>Ночной тариф</strong> - для двухтарифных счётчиков (23:00-07:00)</li>
              </ul>
              <p className="mt-4"><strong>Газ:</strong> единый тариф для населения</p>
              <p><strong>Вода:</strong> холодная вода и водоотведение (канализация)</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Home, Plus, Edit2, Trash2, Users, Ruler, Loader2, Lock, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'

interface House {
  id: string
  name: string
  address: string
  isMain: boolean
  length: number
  width: number
  height: number
  volume: number
  hasWaterMeter: boolean
  hasElectricMeter: boolean
  isOccupied: boolean
  activeResidents: number
  currentResident: { id: string; name: string } | null
}

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('2.7')
  const [hasWaterMeter, setHasWaterMeter] = useState(true)
  const [hasElectricMeter, setHasElectricMeter] = useState(true)

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const res = await fetch('/api/houses')
      const data = await res.json()
      setHouses(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setAddress('')
    setLength('')
    setWidth('')
    setHeight('2.7')
    setHasWaterMeter(true)
    setHasElectricMeter(true)
    setEditingHouse(null)
  }

  const openEditDialog = (house: House) => {
    setEditingHouse(house)
    setName(house.name)
    setAddress(house.address || '')
    setLength(house.length.toString())
    setWidth(house.width.toString())
    setHeight(house.height.toString())
    setHasWaterMeter(house.hasWaterMeter)
    setHasElectricMeter(house.hasElectricMeter)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const data = {
      name,
      address,
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 2.7,
      hasWaterMeter,
      hasElectricMeter,
    }

    try {
      if (editingHouse) {
        await fetch(`/api/houses/${editingHouse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      } else {
        await fetch('/api/houses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      }
      setDialogOpen(false)
      resetForm()
      fetchHouses()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!houseToDelete) return

    try {
      await fetch(`/api/houses/${houseToDelete.id}`, { method: 'DELETE' })
      setDeleteDialogOpen(false)
      setHouseToDelete(null)
      fetchHouses()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleOccupied = async (house: House) => {
    try {
      await fetch(`/api/houses/${house.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOccupied: !house.isOccupied })
      })
      fetchHouses()
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
            <h1 className="text-xl md:text-2xl font-bold">Дома</h1>
            <p className="text-gray-500 text-sm">Управление домами и статусом занятости</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Добавить домик
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>{editingHouse ? 'Редактировать' : 'Новый домик'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Название *</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Гостевой 1"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Длина (м)</Label>
                    <Input type="number" step="0.1" value={length} onChange={e => setLength(e.target.value)} />
                  </div>
                  <div>
                    <Label>Ширина (м)</Label>
                    <Input type="number" step="0.1" value={width} onChange={e => setWidth(e.target.value)} />
                  </div>
                  <div>
                    <Label>Высота (м)</Label>
                    <Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Счётчики</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={hasWaterMeter} onChange={e => setHasWaterMeter(e.target.checked)} className="w-4 h-4" />
                      Вода
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={hasElectricMeter} onChange={e => setHasElectricMeter(e.target.checked)} className="w-4 h-4" />
                      Электричество
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingHouse ? 'Сохранить' : 'Создать'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Список домов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map(house => (
            <Card key={house.id} className={`hover:shadow-lg transition ${house.isMain ? 'border-blue-300 bg-blue-50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className={`w-5 h-5 ${house.isMain ? 'text-blue-600' : 'text-gray-500'}`} />
                    {house.name}
                  </CardTitle>
                  {house.isMain ? (
                    <Badge className="bg-blue-600">Основной</Badge>
                  ) : house.isOccupied ? (
                    <Badge className="bg-green-500">Заселён</Badge>
                  ) : (
                    <Badge variant="outline">Свободен</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Ruler className="w-4 h-4" />
                    <span>
                      {house.length}м × {house.width}м × {house.height}м =
                      <strong className="ml-1">{house.volume.toFixed(1)} м³</strong>
                    </span>
                  </div>

                  {!house.isMain && house.currentResident && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{house.currentResident.name}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {house.hasWaterMeter && <Badge variant="outline" className="text-xs">Вода</Badge>}
                    {house.hasElectricMeter && <Badge variant="outline" className="text-xs">Электричество</Badge>}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(house)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Изменить
                  </Button>

                  {!house.isMain && (
                    <>
                      <Button
                        variant={house.isOccupied ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleOccupied(house)}
                      >
                        {house.isOccupied ? (
                          <><UserX className="w-4 h-4 mr-1" />Выселить</>
                        ) : (
                          <><UserCheck className="w-4 h-4 mr-1" />Заселить</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setHouseToDelete(house); setDeleteDialogOpen(true) }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {house.isMain && (
                    <span className="flex items-center gap-1 text-gray-400 text-sm ml-auto">
                      <Lock className="w-4 h-4" />
                      Нельзя удалить
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {houses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Нет добавленных домов</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый дом
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-red-600">Удалить {houseToDelete?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-4">
            Все данные жильцов этого дома будут удалены.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

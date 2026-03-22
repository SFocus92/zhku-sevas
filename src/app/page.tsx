'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Home, Calculator, Settings, Zap, Droplets, Flame, Waves,
  Truck, FileText, Plus, Eye, Loader2, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

interface Stats {
  housesCount: number
  occupiedCount: number
  totalVolume: number
  currentMonthTotal: number
  recentBills: any[]
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await fetch('/api/init')
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutMobile = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Шапка */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ЖКУ Севастополь</h1>
              </div>
            </div>

            {/* Desktop навигация */}
            <nav className="hidden md:flex gap-2">
              <Link href="/houses">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Дома
                </Button>
              </Link>
              <Link href="/meters">
                <Button variant="ghost" size="sm">
                  <Calculator className="w-4 h-4 mr-2" />
                  Счётчики
                </Button>
              </Link>
              <Link href="/bills">
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Счета
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <LogoutButton />
            </nav>

            {/* Мобильное меню */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Выпадающее мобильное меню */}
          {menuOpen && (
            <nav className="md:hidden pt-4 pb-2 border-t mt-3 grid grid-cols-2 gap-2">
              <Link href="/houses" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  Дома
                </Button>
              </Link>
              <Link href="/meters" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2" />
                  Счётчики
                </Button>
              </Link>
              <Link href="/bills" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Счета
                </Button>
              </Link>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600" onClick={() => { setMenuOpen(false); handleLogoutMobile() }}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="pb-1">
              <CardDescription className="text-xs md:text-sm">Домиков</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats?.housesCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription className="text-xs md:text-sm">Заселено</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats?.occupiedCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription className="text-xs md:text-sm">Объём</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats?.totalVolume?.toFixed(0) || 0} м³</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription className="text-xs md:text-sm">За месяц</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats?.currentMonthTotal?.toFixed(0) || 0} ₽</p>
            </CardContent>
          </Card>
        </div>

        {/* ГЛАВНАЯ КНОПКА */}
        <Card className="mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-xl">
          <CardContent className="py-8 md:py-12">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                Нажмите для расчёта
              </h2>
              <p className="text-blue-100 mb-4 md:mb-6 text-sm md:text-base px-4">
                Автоматический расчёт газа, воды и электричества
              </p>
              <Link href="/calculate">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl font-bold shadow-lg">
                  <Calculator className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                  РАССЧИТАТЬ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Link href="/calculate?service=gas">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="py-4 md:py-6 text-center">
                <Flame className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-orange-500" />
                <p className="font-medium text-sm md:text-base">Газ</p>
                <p className="text-xs md:text-sm text-gray-500">по объёму</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculate?service=water">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="py-4 md:py-6 text-center">
                <Droplets className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-blue-500" />
                <p className="font-medium text-sm md:text-base">Вода</p>
                <p className="text-xs md:text-sm text-gray-500">по счётчикам</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculate?service=sewage">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="py-4 md:py-6 text-center">
                <Waves className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-cyan-500" />
                <p className="font-medium text-sm md:text-base">Водоотведение</p>
                <p className="text-xs md:text-sm text-gray-500">канализация</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calculate?service=electric">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="py-4 md:py-6 text-center">
                <Zap className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-yellow-500" />
                <p className="font-medium text-sm md:text-base">Электричество</p>
                <p className="text-xs md:text-sm text-gray-500">по счётчикам</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/septic">
            <Card className="hover:shadow-lg transition cursor-pointer h-full">
              <CardContent className="py-4 md:py-6 text-center">
                <Truck className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-green-600" />
                <p className="font-medium text-sm md:text-base">Выгребная яма</p>
                <p className="text-xs md:text-sm text-gray-500">ассенизация</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Последние счета */}
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Последние счета</h3>
        <Card>
          <CardContent className="py-3 md:py-4">
            {stats?.recentBills && stats.recentBills.length > 0 ? (
              <div className="space-y-2">
                {stats.recentBills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Badge
                        variant={bill.serviceType === 'gas' ? 'destructive' : bill.serviceType === 'water' ? 'default' : bill.serviceType === 'sewage' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {bill.serviceType === 'gas' ? 'Газ' : bill.serviceType === 'water' ? 'Вода' : bill.serviceType === 'sewage' ? 'Водоотв.' : 'Электр.'}
                      </Badge>
                      <span className="text-gray-600 text-sm">{bill.month}.{bill.year}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="font-medium text-sm md:text-base">{bill.totalAmount.toFixed(2)} ₽</span>
                      <Link href={`/bills/${bill.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm md:text-base">Нет созданных счетов</p>
                <Link href="/calculate">
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать счёт
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

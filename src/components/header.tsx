'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Home, Calculator, Settings, FileText, Menu, X, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      toast.success('Выход выполнен')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  const handleMobileLogout = async () => {
    setMenuOpen(false)
    try {
      await fetch('/api/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
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
          <nav className="hidden md:flex gap-2 items-center">
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
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Выйти">
              <LogOut className="w-4 h-4 text-red-600" />
            </Button>
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
            <Button variant="outline" size="sm" className="w-full justify-start text-red-600" onClick={handleMobileLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}

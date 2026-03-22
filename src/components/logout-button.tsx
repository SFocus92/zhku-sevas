'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()

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

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      title="Выйти"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  )
}

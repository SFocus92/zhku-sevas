'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Flame, Droplets, Zap, Calculator, Loader2, Save, Printer,
  Camera, Home, AlertCircle, X, CheckCircle, Waves
} from 'lucide-react'
import Link from 'next/link'

interface Tariff {
  id: string
  name: string
  serviceType: string
  price: number
  unit: string
}

interface CalculationResult {
  houseId: string
  houseName: string
  volume?: number
  daysLived?: number
  daysInMonth?: number
  consumption: number
  share?: number
  amount: number
  hasMeter?: boolean
}

interface CalculateResponse {
  success: boolean
  serviceType: string
  month: number
  year: number
  totalConsumption: number
  price: number
  totalAmount: number
  tariffBreakdown?: string
  results: CalculationResult[]
  error?: string
}

interface OCRResult {
  success: boolean
  data?: {
    serviceType: string | null
    totalConsumption: number | null
    price: number | null
    amount: number | null
    period: { month: number; year: number } | null
    rawText?: string
    allNumbers?: number[]
  }
  error?: string
}

function CalculatePageContent() {
  const searchParams = useSearchParams()
  const initialService = searchParams.get('service') || 'gas'
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeTab, setActiveTab] = useState(initialService)
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Параметры расчёта
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [totalConsumption, setTotalConsumption] = useState('')
  const [price, setPrice] = useState('')
  const [electricLoss, setElectricLoss] = useState('')
  
  // Результат
  const [result, setResult] = useState<CalculateResponse | null>(null)
  
  // Фото и OCR
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const tariff = tariffs.find(t =>
      (activeTab === 'gas' && t.serviceType === 'gas') ||
      (activeTab === 'water' && t.serviceType === 'water') ||
      (activeTab === 'sewage' && t.serviceType === 'sewage') ||
      (activeTab === 'electric' && t.serviceType === 'electric_1')
    )
    if (tariff) {
      setPrice(tariff.price.toString())
    }
  }, [activeTab, tariffs])

  const fetchData = async () => {
    try {
      const [tariffsRes] = await Promise.all([
        fetch('/api/tariffs'),
      ])
      
      const tariffsData = await tariffsRes.json()
      setTariffs(tariffsData)
      
      const gasTariff = tariffsData.find((t: Tariff) => t.serviceType === 'gas')
      if (gasTariff) {
        setPrice(gasTariff.price.toString())
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Показываем превью
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    setUploading(true)
    setError('')
    setOcrResult(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })
      
      const data: OCRResult = await res.json()
      setOcrResult(data)
      
      if (data.success && data.data) {
        // Заполняем данные из распознанного текста
        if (data.data.totalConsumption) {
          setTotalConsumption(data.data.totalConsumption.toString())
        }
        if (data.data.price) {
          setPrice(data.data.price.toString())
        }
        if (data.data.period) {
          setMonth(data.data.period.month)
          setYear(data.data.period.year)
        }
        if (data.data.serviceType) {
          setActiveTab(data.data.serviceType)
        }
      }
    } catch (error) {
      setError('Ошибка распознавания фото')
    } finally {
      setUploading(false)
    }
  }

  const handleCalculate = async () => {
    setError('')
    setResult(null)

    // Для электричества тариф не нужен (ступенчатый)
    if (!totalConsumption) {
      setError('Введите потребление')
      return
    }

    if (activeTab !== 'electric' && activeTab !== 'sewage' && !price) {
      setError('Введите тариф')
      return
    }

    setCalculating(true)

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          serviceType: activeTab,
          totalConsumption: parseFloat(totalConsumption),
          price: activeTab === 'electric' || activeTab === 'sewage' ? 0 : parseFloat(price),
          electricLoss: electricLoss ? parseFloat(electricLoss) : 0
        })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (error) {
      setError('Ошибка расчёта')
    } finally {
      setCalculating(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    
    setSaving(true)
    
    try {
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })
      
      alert('Счёт сохранён!')
    } catch (error) {
      alert('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    if (!result) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const serviceName = result.serviceType === 'gas' ? 'Газ' : 
                        result.serviceType === 'water' ? 'Вода' : 'Электричество'
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Квитанция ${serviceName} ${result.month}.${result.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { text-align: center; font-size: 24px; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .info { margin-bottom: 20px; }
          .info p { margin: 5px 0; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 10px; text-align: left; font-size: 14px; }
          th { background: #f0f0f0; font-weight: bold; }
          .total { font-weight: bold; font-size: 20px; margin-top: 20px; text-align: right; padding: 10px; background: #f0f0f0; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>КВИТАНЦИЯ ЗА ${serviceName.toUpperCase()}</h1>
          <p>Период: ${result.month}.${result.year}</p>
        </div>
        <div class="info">
          <p><strong>Общее потребление:</strong> ${result.totalConsumption.toFixed(2)} ${result.serviceType === 'electric' ? 'кВт·ч' : 'м³'}</p>
          <p><strong>Тариф:</strong> ${result.price.toFixed(2)} руб.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Дом</th>
              <th>Потребление</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${result.results.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.houseName}</td>
                <td>${r.consumption.toFixed(2)} ${result.serviceType === 'electric' ? 'кВт·ч' : 'м³'}</td>
                <td>${r.amount.toFixed(2)} руб.</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">ИТОГО К ОПЛАТЕ: ${result.totalAmount.toFixed(2)} руб.</div>
        <div class="footer">
          <p>Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</p>
          <p>ЖКУ Севастополь</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const getServiceName = (type: string) => {
    switch (type) {
      case 'gas': return 'Газ'
      case 'water': return 'Вода'
      case 'sewage': return 'Водоотведение'
      case 'electric': return 'Электричество'
      default: return type
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'gas': return <Flame className="w-5 h-5" />
      case 'water': return <Droplets className="w-5 h-5" />
      case 'sewage': return <Waves className="w-5 h-5" />
      case 'electric': return <Zap className="w-5 h-5" />
      default: return <Calculator className="w-5 h-5" />
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
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Расчёт коммунальных услуг</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6">
            <TabsTrigger value="gas" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Газ</span>
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Вода</span>
            </TabsTrigger>
            <TabsTrigger value="sewage" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
              <Waves className="w-4 h-4" />
              <span className="hidden sm:inline">Водоотв.</span>
            </TabsTrigger>
            <TabsTrigger value="electric" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Электричество</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Форма ввода */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getServiceIcon(activeTab)}
                  Расчёт {getServiceName(activeTab).toLowerCase()}
                </CardTitle>
                <CardDescription className="text-sm">
                  {activeTab === 'gas' && 'Газ распределяется по объёму помещений'}
                  {activeTab === 'water' && 'Вода рассчитывается по счётчикам'}
                  {activeTab === 'sewage' && 'Водоотведение = сумма воды (холодная + горячая)'}
                  {activeTab === 'electric' && 'Электричество по счётчикам'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Загрузка фото - ОТКЛЮЧЕНО (только ручной ввод) */}
                {/*
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="max-h-40 mx-auto rounded" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => { setPhotoPreview(null); setOcrResult(null); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'Распознавание...' : 'Фото счёта (распознавание)'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Сфотографируйте квитанцию - данные заполнятся автоматически
                      </p>
                    </div>
                  )}

                  <!-- Результат OCR -->
                  {ocrResult && (
                    <div className={`mt-3 p-3 rounded ${ocrResult.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {ocrResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className={`text-sm font-medium ${ocrResult.success ? 'text-green-700' : 'text-yellow-700'}`}>
                          {ocrResult.success ? 'Данные распознаны' : 'Частичное распознавание'}
                        </span>
                      </div>

                      {ocrResult.data?.allNumbers && ocrResult.data.allNumbers.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Найдены числа: {ocrResult.data.allNumbers.slice(0, 5).join(', ')}
                        </p>
                      )}

                      {!ocrResult.data?.totalConsumption && (
                        <p className="text-xs text-gray-500 mt-1">
                          Введите данные вручную
                        </p>
                      )}
                    </div>
                  )}
                </div>
                */}

                {/* Период */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Месяц</Label>
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
                  <div>
                    <Label className="text-sm">Год</Label>
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
                </div>

                {/* Потребление */}
                <div>
                  <Label className="text-sm">
                    {activeTab === 'gas' && 'Потребление (м³)'}
                    {activeTab === 'water' && 'Потребление (м³)'}
                    {activeTab === 'sewage' && 'Потребление воды (м³)'}
                    {activeTab === 'electric' && 'Потребление (кВт·ч)'}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={totalConsumption}
                    onChange={e => setTotalConsumption(e.target.value)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>

                {/* Тариф */}
                {activeTab === 'electric' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                      <p className="font-medium mb-1">⚡ Ступенчатый тариф:</p>
                      <p className="text-xs">• До 150 кВт·ч: <strong>5.13</strong> ₽/кВт·ч</p>
                      <p className="text-xs">• 150-600 кВт·ч: <strong>5.52</strong> ₽/кВт·ч</p>
                      <p className="text-xs">• Свыше 600 кВт·ч: <strong>9.46</strong> ₽/кВт·ч</p>
                      <p className="text-xs text-gray-500 mt-1">Рассчитывается автоматически</p>
                    </div>
                    <div>
                      <Label className="text-sm">Потери электроэнергии (кВт·ч)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={electricLoss}
                        onChange={e => setElectricLoss(e.target.value)}
                        placeholder="0.00"
                        className="text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Потери от ТСН (воровство, общедомовые нужды)
                      </p>
                    </div>
                  </div>
                ) : activeTab === 'sewage' ? (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium mb-1">💧 Водоотведение:</p>
                    <p className="text-xs">Рассчитывается автоматически по тарифу</p>
                    <p className="text-xs">= сумма холодной и горячей воды</p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm">Тариф (руб)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="text-lg"
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Кнопка расчёта */}
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6"
                  onClick={handleCalculate}
                  disabled={calculating}
                >
                  {calculating ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="w-5 h-5 mr-2" />
                  )}
                  РАССЧИТАТЬ
                </Button>
              </CardContent>
            </Card>

            {/* Результат */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Результат</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {/* Итого */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-600">Потребление:</span>
                        <span className="font-medium">{result.totalConsumption} {activeTab === 'electric' ? 'кВт·ч' : 'м³'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-600">Тариф:</span>
                        <span className="font-medium">
                          {result.tariffBreakdown ? (
                            <span className="text-xs">{result.tariffBreakdown} руб</span>
                          ) : (
                            `${result.price} руб.`
                          )}
                        </span>
                      </div>
                      {activeTab === 'electric' && (
                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                          <span>Средний тариф:</span>
                          <span>{result.price.toFixed(2)} руб/кВт·ч</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>ИТОГО:</span>
                        <span className="text-blue-600">{result.totalAmount.toFixed(2)} руб.</span>
                      </div>
                    </div>

                    {/* Таблица */}
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
                          {result.results.map((r, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium text-sm">
                                <Badge variant="outline" className="text-xs">{r.houseName}</Badge>
                                {r.hasMeter === false && <span className="text-xs text-gray-400 ml-1">(остаток)</span>}
                              </TableCell>
                              <TableCell className="text-right text-sm">{r.consumption.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium text-sm">{r.amount.toFixed(2)} ₽</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleSave} disabled={saving} className="flex-1">
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Сохранить
                      </Button>
                      <Button variant="outline" onClick={handlePrint} className="flex-1">
                        <Printer className="w-4 h-4 mr-2" />
                        Печать
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Введите данные и нажмите "Рассчитать"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs>

        {/* Тарифы */}
        <Card className="mt-4 md:mt-6">
          <CardHeader>
            <CardTitle className="text-base">Тарифы Севастополь 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Газ</span>
                </div>
                <p className="font-bold">{tariffs.find(t => t.serviceType === 'gas')?.price || 0} ₽/м³</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Вода</span>
                </div>
                <p className="font-bold">{tariffs.find(t => t.serviceType === 'water')?.price || 0} ₽/м³</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Waves className="w-4 h-4 text-cyan-500" />
                  <span className="font-medium">Водоотведение</span>
                </div>
                <p className="font-bold">{tariffs.find(t => t.serviceType === 'sewage')?.price || 0} ₽/м³</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Электричество</span>
                </div>
                <p className="text-xs">до 150: {tariffs.find(t => t.serviceType === 'electric_1')?.price || 0} ₽</p>
                <p className="text-xs">150-600: {tariffs.find(t => t.serviceType === 'electric_2')?.price || 0} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function CalculatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CalculatePageContent />
    </Suspense>
  )
}

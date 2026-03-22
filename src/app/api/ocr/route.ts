import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json({ error: 'Изображение не загружено' }, { status: 400 })
    }
    
    // Конвертируем изображение в base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = image.type || 'image/jpeg'
    
    console.log('Starting OCR recognition...')
    
    const result = await Tesseract.recognize(
      `data:${mimeType};base64,${base64}`,
      'rus+eng',
      {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )
    
    const text = result.data.text
    console.log('=== RAW OCR TEXT ===')
    console.log(text)
    console.log('====================')
    
    // Нормализуем текст для лучшего парсинга
    const normalizedText = text
      .replace(/[|]/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
    
    // Извлекаем все числа с контекстом
    const parsed = {
      serviceType: null as string | null,
      totalConsumption: null as number | null,
      price: null as number | null,
      amount: null as number | null,
      month: null as number | null,
      year: null as number | null,
    }
    
    // Определяем тип услуги по ключевым словам
    if (normalizedText.includes('газ') || normalizedText.includes('gas') || 
        normalizedText.includes('газоснабж') || normalizedText.includes('газораспредел')) {
      parsed.serviceType = 'gas'
    } else if (normalizedText.includes('вод') || normalizedText.includes('водоснабж') || 
               normalizedText.includes('водоотвед') || normalizedText.includes('холодн') ||
               normalizedText.includes('горяч') && normalizedText.includes('вод')) {
      parsed.serviceType = 'water'
    } else if (normalizedText.includes('электр') || normalizedText.includes('квт') || 
               normalizedText.includes('энерг') || normalizedText.includes('свет')) {
      parsed.serviceType = 'electric'
    }
    
    // Паттерны для извлечения данных
    const patterns = {
      price: [
        /тариф[:\s]*(\d+[.,]\d+)/i,
        /по\s*тарифу[:\s]*(\d+[.,]\d+)/i,
        /цена[:\s]*(\d+[.,]\d+)/i,
        /стоимость\s*1\s*[мку][:.\s]*(\d+[.,]\d+)/i,
      ],
      consumption: [
        /потребление[:\s]*(\d+[.,]?\d*)/i,
        /объем[:\s]*(\d+[.,]?\d*)/i,
        /объём[:\s]*(\d+[.,]?\d*)/i,
        /расход[:\s]*(\d+[.,]?\d*)/i,
        /кол[- ]?во[:\s]*(\d+[.,]?\d*)/i,
      ],
      amount: [
        /итого[:\s]*(\d+[.,]\d+)/i,
        /к\s*оплате[:\s]*(\d+[.,]\d+)/i,
        /сумма[:\s]*(\d+[.,]\d+)/i,
        /всего[:\s]*(\d+[.,]\d+)/i,
      ]
    }
    
    // Ищем тариф
    for (const pattern of patterns.price) {
      const match = text.match(pattern)
      if (match) {
        parsed.price = parseFloat(match[1].replace(',', '.'))
        console.log('Found price:', parsed.price)
        break
      }
    }
    
    // Ищем потребление
    for (const pattern of patterns.consumption) {
      const match = text.match(pattern)
      if (match) {
        parsed.totalConsumption = parseFloat(match[1].replace(',', '.'))
        console.log('Found consumption:', parsed.totalConsumption)
        break
      }
    }
    
    // Ищем сумму
    for (const pattern of patterns.amount) {
      const match = text.match(pattern)
      if (match) {
        parsed.amount = parseFloat(match[1].replace(',', '.'))
        console.log('Found amount:', parsed.amount)
        break
      }
    }
    
    // Все числа из текста
    const allNumbers = (text.match(/\d+[.,]?\d*/g) || [])
      .map(n => parseFloat(n.replace(',', '.')))
      .filter(n => !isNaN(n) && n > 0)
    
    console.log('All numbers:', allNumbers)
    
    // Если не нашли по паттернам, пробуем угадать
    if (!parsed.price && allNumbers.length > 0) {
      for (const num of allNumbers) {
        if (num >= 5 && num <= 100) {
          parsed.price = num
          break
        }
      }
    }
    
    if (!parsed.totalConsumption && allNumbers.length > 0) {
      for (const num of allNumbers) {
        if (num > 0 && num !== parsed.price && num !== parsed.amount) {
          if (parsed.serviceType !== 'electric' && num < 1000) {
            parsed.totalConsumption = num
            break
          }
          if (parsed.serviceType === 'electric' && num < 10000) {
            parsed.totalConsumption = num
            break
          }
        }
      }
    }
    
    if (!parsed.amount && allNumbers.length > 0) {
      for (const num of allNumbers) {
        if (num > 100 && num !== parsed.totalConsumption) {
          parsed.amount = num
          break
        }
      }
    }
    
    // Ищем месяц и год
    const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 
                        'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
    const monthGenitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                           'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    
    for (let i = 0; i < monthNames.length; i++) {
      if (normalizedText.includes(monthNames[i]) || normalizedText.includes(monthGenitive[i])) {
        parsed.month = i + 1
        break
      }
    }
    
    // Ищем год
    const yearMatch = text.match(/20\d{2}/)
    if (yearMatch) {
      parsed.year = parseInt(yearMatch[0])
    }
    
    // Формат MM.YYYY
    const shortDateMatch = text.match(/(\d{1,2})[.\/](\d{4})/)
    if (shortDateMatch) {
      const first = parseInt(shortDateMatch[1])
      if (first >= 1 && first <= 12) {
        parsed.month = first
        parsed.year = parseInt(shortDateMatch[2])
      }
    }
    
    // Дефолты
    if (!parsed.year) parsed.year = new Date().getFullYear()
    if (!parsed.month) parsed.month = new Date().getMonth() + 1
    
    console.log('=== PARSED RESULT ===')
    console.log(parsed)
    console.log('=====================')
    
    return NextResponse.json({
      success: true,
      data: {
        serviceType: parsed.serviceType,
        totalConsumption: parsed.totalConsumption,
        price: parsed.price,
        amount: parsed.amount,
        period: parsed.month && parsed.year ? { month: parsed.month, year: parsed.year } : null,
        rawText: text.substring(0, 1000),
        allNumbers: allNumbers.slice(0, 10),
      }
    })
    
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Ошибка распознавания',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

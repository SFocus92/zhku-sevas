import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Ступенчатый расчёт электричества
function calculateElectricTiered(consumption: number): { amount: number; breakdown: string } {
  const TIER1_LIMIT = 150
  const TIER2_LIMIT = 600
  const TIER1_PRICE = 5.13
  const TIER2_PRICE = 5.52
  const TIER3_PRICE = 9.46

  let amount = 0
  let remaining = consumption
  let breakdown = ''

  if (remaining > 0) {
    const tier1 = Math.min(remaining, TIER1_LIMIT)
    amount += tier1 * TIER1_PRICE
    breakdown += `${tier1.toFixed(0)} × ${TIER1_PRICE}`
    remaining -= tier1
  }

  if (remaining > 0) {
    const tier2 = Math.min(remaining, TIER2_LIMIT - TIER1_LIMIT)
    amount += tier2 * TIER2_PRICE
    breakdown += ` + ${tier2.toFixed(0)} × ${TIER2_PRICE}`
    remaining -= tier2
  }

  if (remaining > 0) {
    amount += remaining * TIER3_PRICE
    breakdown += ` + ${remaining.toFixed(0)} × ${TIER3_PRICE}`
  }

  return { amount: Math.round(amount * 100) / 100, breakdown }
}

// POST - выполнить расчёт
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { month, year, serviceType, totalConsumption, price, electricLoss } = data

    // Получаем все дома
    const houses = await prisma.house.findMany()

    if (houses.length === 0) {
      return NextResponse.json({ error: 'Нет домов для расчёта' }, { status: 400 })
    }

    // Вычисляем объёмы
    const housesWithVolume = houses.map(h => ({
      ...h,
      volume: h.length * h.width * h.height
    }))

    // Находим основной дом
    const mainHouse = houses.find(h => h.isMain)

    // Расчёт общей суммы
    let totalAmount: number
    let effectivePrice = price
    let tariffBreakdown = ''

    if (serviceType === 'electric') {
      // Электричество с учётом потерь
      const consumptionWithLoss = totalConsumption + (electricLoss || 0)
      const calc = calculateElectricTiered(consumptionWithLoss)
      totalAmount = calc.amount
      tariffBreakdown = calc.breakdown
      effectivePrice = totalAmount / consumptionWithLoss
    } else if (serviceType === 'sewage') {
      // Водоотведение = сумма воды (холодная + горячая)
      // Получаем показания воды за этот период
      const waterReadings = await prisma.meterReading.findMany({
        where: { month, year, meterType: 'water' }
      })
      const waterConsumption = waterReadings.reduce((sum, r) => sum + r.consumption, 0)

      // Получаем тариф на водоотведение
      const sewageTariff = await prisma.tariff.findUnique({
        where: { serviceType: 'sewage' }
      })
      const sewagePrice = sewageTariff?.price || 25.50

      totalAmount = Math.round(waterConsumption * sewagePrice * 100) / 100
      effectivePrice = sewagePrice
      tariffBreakdown = `${waterConsumption.toFixed(2)} м³ × ${sewagePrice} ₽/м³`
    } else {
      totalAmount = totalConsumption * price
    }

    let results: any[] = []

    if (serviceType === 'gas') {
      // === РАСЧЁТ ГАЗА ПО ОБЪЁМУ ===
      // Газ распределяется по объёму ВСЕХ домов, включая основной
      // (отопление работает даже в пустых домах)

      const totalVolume = housesWithVolume.reduce((sum, h) => sum + h.volume, 0)

      if (totalVolume === 0) {
        return NextResponse.json({ error: 'У домов не указаны размеры' }, { status: 400 })
      }

      let runningTotal = 0
      let runningConsumption = 0

      // Сортируем: сначала гостевые, потом основной (основной последний для корректировки)
      const sortedHouses = [...housesWithVolume].sort((a, b) => {
        if (a.isMain) return 1
        if (b.isMain) return -1
        return 0
      })

      for (let i = 0; i < sortedHouses.length; i++) {
        const house = sortedHouses[i]
        const share = house.volume / totalVolume

        let amount: number
        let consumption: number

        if (i === sortedHouses.length - 1) {
          // Последний (основной) получает корректировку
          amount = Math.round((totalAmount - runningTotal) * 100) / 100
          consumption = Math.round((totalConsumption - runningConsumption) * 100) / 100
        } else {
          amount = Math.round(share * totalAmount * 100) / 100
          consumption = Math.round(share * totalConsumption * 100) / 100
          runningTotal += amount
          runningConsumption += consumption
        }

        results.push({
          houseId: house.id,
          houseName: house.name,
          volume: house.volume,
          consumption,
          amount,
          isMain: house.isMain,
        })
      }

    } else if (serviceType === 'water' || serviceType === 'electric' || serviceType === 'sewage') {
      // === РАСЧЁТ ПО СЧЁТЧИКАМ ИЛИ ВОДООТВЕДЕНИЮ ===
      // Учитываются ТОЛЬКО заселённые дома + основной дом (остаток)

      const meterType = serviceType === 'water' || serviceType === 'sewage' ? 'water' : 'electric'

      // Получаем показания домиков
      const readings = await prisma.meterReading.findMany({
        where: { month, year, meterType }
      })

      // Считаем потребление ТОЛЬКО заселённых гостевых домиков
      let guestsTotal = 0
      const consumptions: { house: any, consumption: number }[] = []

      for (const house of housesWithVolume) {
        // Пропускаем основной дом - он платит остаток
        if (house.isMain) continue

        // Пропускаем свободные дома - в них никто не живёт
        if (!house.isOccupied) continue

        const reading = readings.find(r => r.houseId === house.id)
        const consumption = reading?.consumption || 0

        if (consumption > 0) {
          guestsTotal += consumption
          consumptions.push({ house, consumption })
        }
      }

      // Для водоотведения - потребление равно потреблению воды
      let effectiveTotalConsumption = totalConsumption
      if (serviceType === 'sewage') {
        effectiveTotalConsumption = guestsTotal
        // Остаток платит основной дом
        const ownerConsumption = Math.max(0, totalConsumption - guestsTotal)
        if (ownerConsumption > 0 && mainHouse) {
          consumptions.push({
            house: mainHouse,
            consumption: ownerConsumption
          })
        }
      } else {
        // Остаток платит основной дом (для воды и электричества)
        const ownerConsumption = Math.max(0, totalConsumption - guestsTotal)
        if (ownerConsumption > 0 && mainHouse) {
          consumptions.push({
            house: mainHouse,
            consumption: ownerConsumption
          })
        }
      }

      if (consumptions.length === 0) {
        // Если нет заселённых домов - всё платит собственник
        if (mainHouse) {
          consumptions.push({
            house: mainHouse,
            consumption: serviceType === 'sewage' ? totalConsumption : totalConsumption
          })
        } else {
          return NextResponse.json({ error: 'Нет данных для расчёта' }, { status: 400 })
        }
      }

      // Расчёт сумм с распределением по средней цене для электричества
      let runningTotal = 0

      // Сортируем: основной дом последний
      const sortedConsumptions = consumptions.sort((a, b) => {
        if (a.house.isMain) return 1
        if (b.house.isMain) return -1
        return 0
      })

      // Для электричества рассчитываем среднюю цену
      let avgElectricPrice = 0
      if (serviceType === 'electric' && consumptions.length > 0) {
        const totalGuestConsumption = consumptions.reduce((sum, c) => sum + c.consumption, 0)
        if (totalGuestConsumption > 0) {
          avgElectricPrice = totalAmount / totalGuestConsumption
        }
      }

      for (let i = 0; i < sortedConsumptions.length; i++) {
        const { house, consumption } = sortedConsumptions[i]

        let amount: number

        if (serviceType === 'electric') {
          // Распределяем по средней цене между всеми жильцами
          amount = Math.round(consumption * avgElectricPrice * 100) / 100
        } else if (serviceType === 'sewage') {
          const sewageTariff = await prisma.tariff.findUnique({
            where: { serviceType: 'sewage' }
          })
          amount = Math.round(consumption * (sewageTariff?.price || 25.50) * 100) / 100
        } else {
          amount = Math.round(consumption * price * 100) / 100
        }

        // Корректировка для последнего (основного дома)
        if (i === sortedConsumptions.length - 1) {
          const calcAmount = Math.round((totalAmount - runningTotal) * 100) / 100
          amount = calcAmount
        }

        runningTotal += amount

        results.push({
          houseId: house.id,
          houseName: house.name,
          consumption,
          amount,
          hasMeter: !house.isMain,
          isMain: house.isMain,
        })
      }
    }

    return NextResponse.json({
      success: true,
      serviceType,
      month,
      year,
      totalConsumption: serviceType === 'sewage' ? totalConsumption : totalConsumption,
      price: effectivePrice,
      totalAmount,
      tariffBreakdown,
      electricLoss: electricLoss || 0,
      results,
    })

  } catch (error) {
    console.error('Calculate error:', error)
    return NextResponse.json({ error: 'Ошибка расчёта' }, { status: 500 })
  }
}

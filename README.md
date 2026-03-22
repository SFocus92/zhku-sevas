# ЖКУ Севастополь — Система расчёта коммунальных услуг

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2d3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

Система автоматизированного расчёта коммунальных услуг для частного дома с гостевыми домиками. Предназначена для учёта газа, воды, электричества и водоотведения с распределением по домам.

---

## 📋 Оглавление

- [О проекте](#о-проекте)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [База данных](#база-данных)
- [API endpoints](#api-endpoints)
- [Установка и запуск](#установка-и-запуск)
- [Конфигурация](#конфигурация)
- [Функциональные возможности](#функциональные-возможности)
- [Сборка в EXE](#сборка-в-exe)
- [Деплой на Vercel](#деплой-на-vercel)

---

## 🏠 О проекте

**ЖКУ Севастополь** — это веб-приложение для управления коммунальными услугами в частном домовладении с несколькими строениями (основной дом + гостевые домики).

### Основные задачи:
- ✅ Учёт показаний счётчиков (вода, электричество)
- ✅ Расчёт стоимости услуг по тарифам Севастополя
- ✅ Распределение расходов по домам пропорционально объёму/площади
- ✅ Ведение истории счетов и платежей
- ✅ Учёт вызовов ассенизации (выгребная яма)
- ✅ Доступ с любых устройств в локальной сети

---

## 🛠 Технологический стек

### Ядро приложения

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Next.js** | 16.1.3 | React-фреймворк с App Router |
| **React** | 19.0.0 | UI-библиотека |
| **TypeScript** | 5.x | Типизация JavaScript |
| **Node.js** | LTS | Среда выполнения |

### UI компоненты и стилизация

| Библиотека | Назначение |
|------------|------------|
| **Tailwind CSS 4** | Утилитарные CSS-классы |
| **shadcn/ui** | Коллекция UI-компонентов |
| **Radix UI** | Примитивы для доступных компонентов |
| **Lucide React** | Иконки |
| **Framer Motion** | Анимации |
| **Next Themes** | Тёмная/светлая тема |

### Формы и валидация

| Библиотека | Назначение |
|------------|------------|
| **React Hook Form** | Управление формами |
| **Zod** | Валидация схем TypeScript |
| **@hookform/resolvers** | Интеграция Zod с React Hook Form |

### Управление данными

| Библиотека | Назначение |
|------------|------------|
| **Prisma** | ORM для работы с БД |
| **TanStack Query** | Кэширование и синхронизация данных |
| **Zustand** | Глобальное состояние приложения |

### Визуализация данных

| Библиотека | Назначение |
|------------|------------|
| **Recharts** | Графики и диаграммы |
| **TanStack Table** | Таблицы с сортировкой и фильтрацией |
| **DND Kit** | Drag-and-drop функциональность |

### Дополнительные библиотеки

| Библиотека | Назначение |
|------------|------------|
| **NextAuth.js** | Аутентификация |
| **date-fns** | Работа с датами |
| **Sharp** | Обработка изображений |
| **Tesseract.js** | OCR (распознавание текста) |
| **Sonner** | Toast-уведомления |
| **class-variance-authority** | Варианты классов для компонентов |
| **clsx + tailwind-merge** | Утилиты для работы с классами |

---

## 📁 Структура проекта

```
zhku_sevastopol_MAKSIM/
├── 📂 .next/                  # Скомпилированные файлы Next.js
├── 📂 db/                     # SQLite база данных
│   └── database.db
├── 📂 node_modules/           # Зависимости npm
├── 📂 prisma/                 # Prisma схема и миграции
│   ├── schema.prisma          # Модель данных
│   └── dev.db                 # Dev база данных
├── 📂 src/                    # Исходный код приложения
│   ├── 📂 app/                # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── bills/         # Счета
│   │   │   ├── calculate/     # Расчёт услуг
│   │   │   ├── houses/        # Дома
│   │   │   ├── init/          # Инициализация БД
│   │   │   ├── meters/        # Счётчики
│   │   │   ├── ocr/           # OCR распознавание
│   │   │   ├── septic/        # Ассенизация
│   │   │   ├── settings/      # Настройки
│   │   │   ├── stats/         # Статистика
│   │   │   └── tariffs/       # Тарифы
│   │   ├── bills/             # Страница счетов
│   │   ├── calculate/         # Страница расчёта
│   │   ├── houses/            # Страница домов
│   │   ├── meters/            # Страница счётчиков
│   │   ├── septic/            # Страница ассенизации
│   │   ├── settings/          # Страница настроек
│   │   ├── globals.css        # Глобальные стили
│   │   ├── layout.tsx         # Корневой layout
│   │   └── page.tsx           # Главная страница
│   ├── 📂 components/         # React компоненты
│   │   └── ui/                # UI компоненты (shadcn/ui)
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       └── ... (40+ компонентов)
│   ├── 📂 hooks/              # Кастомные React хуки
│   │   ├── use-mobile.ts      # Определение мобильного устройства
│   │   └── use-toast.ts       # Toast уведомления
│   └── 📂 lib/                # Утилиты и конфигурации
│       ├── db.ts              # Prisma клиент
│       └── utils.ts           # Утилита cn() для классов
├── 📂 standalone/             # Production сборка
├── .env                       # Переменные окружения
├── .gitignore                 # Git ignore файл
├── next.config.ts             # Конфигурация Next.js
├── package.json               # Зависимости и скрипты
├── tailwind.config.ts         # Конфигурация Tailwind
├── tsconfig.json              # Конфигурация TypeScript
├── ЗАПУСТИТЬ.bat              # Скрипт запуска (Windows)
└── README.md                  # Документация
```

---

## 🗄 База данных

### Провайдер: SQLite

### Схема данных (Prisma)

#### Основные модели:

**1. House (Дома)**
```prisma
model House {
  id               String   @id @default(cuid())
  name             String   // Название дома
  address          String?
  isMain           Boolean  @default(false)
  length           Float    // Длина в метрах
  width            Float    // Ширина в метрах
  height           Float    // Высота потолков
  hasWaterMeter    Boolean  @default(false)
  hasElectricMeter Boolean  @default(false)
  isOccupied       Boolean  @default(false)
  meterReadings    MeterReading[]
  billItems        BillItem[]
}
```

**2. MeterReading (Показания счётчиков)**
```prisma
model MeterReading {
  id            String   @id @default(cuid())
  houseId       String
  month         Int      // 1-12
  year          Int
  meterType     String   // "water", "electric"
  previousValue Float
  currentValue  Float
  consumption   Float
}
```

**3. Bill (Счета)**
```prisma
model Bill {
  id               String   @id @default(cuid())
  month            Int
  year             Int
  serviceType      String   // "gas", "water", "electric", "sewage"
  totalConsumption Float
  totalAmount      Float
  tariffUsed       Float
  status           String   // "created", "paid", "cancelled"
  items            BillItem[]
}
```

**4. BillItem (Элементы счёта)**
```prisma
model BillItem {
  id          String   @id @default(cuid())
  billId      String
  houseId     String
  volume      Float    // Объём для распределения
  consumption Float
  daysLived   Int
  share       Float    // Доля распределения
  amount      Float
  isPaid      Boolean  @default(false)
}
```

**5. Tariff (Тарифы)**
```prisma
model Tariff {
  id          String   @id @default(cuid())
  name        String
  serviceType String   @unique
  price       Float
  unit        String   // "м³", "кВт·ч"
  limitFrom   Float?
  limitTo     Float?
  isActive    Boolean  @default(true)
}
```

**6. SepticService (Ассенизация)**
```prisma
model SepticService {
  date         DateTime
  cost         Float
  volume       Float?
  notes        String?
  splitBetween String?
}
```

**7. Settings (Настройки)**
```prisma
model Settings {
  ownerName    String
  ownerPhone   String?
  currentMonth Int
  currentYear  Int
}
```

---

## 🔌 API Endpoints

Все API endpoints расположены в `src/app/api/` и используют Next.js App Router.

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/init` | GET | Инициализация БД (тарифы, дома, настройки) |
| `/api/stats` | GET | Получение статистики |
| `/api/houses` | GET, POST | Список домов / Создание дома |
| `/api/houses/[id]` | GET, PUT, DELETE | Дом по ID |
| `/api/meters` | GET, POST | Показания счётчиков / Добавить показания |
| `/api/meters/[id]` | GET, PUT, DELETE | Показания по ID |
| `/api/bills` | GET, POST | Счета / Создать счёт |
| `/api/bills/[id]` | GET, PUT, DELETE | Счёт по ID |
| `/api/bills/[id]/items/[itemId]` | GET, PUT, DELETE | Элемент счёта |
| `/api/tariffs` | GET, POST | Тарифы / Создать тариф |
| `/api/tariffs/[id]` | GET, PUT, DELETE | Тариф по ID |
| `/api/calculate` | POST | Расчёт коммунальных услуг |
| `/api/septic` | GET, POST | Услуги ассенизации |
| `/api/settings` | GET, PUT | Настройки системы |
| `/api/ocr` | POST | OCR распознавание показаний |

---

## 🚀 Установка и запуск

### Требования

- **Node.js** 18+ (рекомендуется 20+)
- **npm** или **bun**
- **Windows 10/11** (для .bat скриптов)

### Быстрый старт

#### 1. Установка зависимостей

```bash
npm install
```

#### 2. Генерация Prisma Client

```bash
npx prisma generate
```

#### 3. Запуск сервера

**Вариант A: Использование скрипта (рекомендуется)**

Запустите файл `ЗАПУСТИТЬ.bat` — он автоматически:
- Остановит старые процессы Node.js
- Проверит зависимости
- Сгенерирует Prisma Client
- Запустит dev-сервер
- Откроет браузер

**Вариант B: Ручной запуск**

```bash
# Development режим
npm run dev

# Production сборка
npm run build
npm start
```

#### 4. Открытие приложения

Приложение доступно по адресу:
- **Локально:** http://localhost:3000
- **В локальной сети:** http://<ВАШ_IP>:3000

---

## ⚙ Конфигурация

### Переменные окружения (.env)

```env
DATABASE_URL="file:D:/NEW_PROGECT/zhku_sevastopol_MAKSIM/db/database.db"
```

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Путь к SQLite БД | `file:./db/database.db` |
| `PORT` | Порт сервера (опционально) | `3000` |
| `HOSTNAME` | Хост сервера (опционально) | `0.0.0.0` |

### Конфигурация Next.js (next.config.ts)

```typescript
const nextConfig = {
  output: "standalone",           // Standalone сборка
  typescript: {
    ignoreBuildErrors: true,      // Игнорировать ошибки TS при сборке
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['*.local', 'localhost', '*.lan', '*'],
    },
  },
  // CORS для доступа из локальной сети
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
};
```

### Скрипты npm (package.json)

| Скрипт | Команда | Описание |
|--------|---------|----------|
| `dev` | `npm run dev` | Запуск dev-сервера (Turbopack) |
| `build` | `npm run build` | Production сборка |
| `start` | `npm start` | Запуск production сервера |
| `lint` | `npm run lint` | Проверка ESLint |
| `db:push` | `npx prisma db push` | Применить схему к БД |
| `db:generate` | `npx prisma generate` | Генерация Prisma Client |
| `db:migrate` | `npx prisma migrate dev` | Создание миграции |
| `db:reset` | `npx prisma migrate reset` | Сброс и миграция БД |

---

## ✨ Функциональные возможности

### 📊 Главная страница
- Статистика по домам (количество, заселённость, объём)
- Быстрый доступ к расчёту услуг
- Последние счета
- Навигация по разделам

### 🏠 Управление домами
- Добавление/редактирование домов
- Указание размеров (длина, ширина, высота)
- Наличие счётчиков (вода, электричество)
- Статус заселённости

### 📈 Показания счётчиков
- Ввод показаний по месяцам
- Автоматический расчёт потребления
- История показаний
- Поддержка типов: вода, электричество

### 🧮 Расчёт услуг

#### Газ
- Распределение по объёму помещений (м³)
- Учёт тарифов с лимитами

#### Вода
- Распределение по счётчикам
- Пропорциональный расчёт

#### Электричество
- Многотарифный учёт (день/ночь, лимиты)
- Распределение по счётчикам

#### Водоотведение
- Расчёт от объёма воды

### 📄 Счета
- Автоматическое создание счетов
- Детализация по домам
- Статусы оплаты
- История счетов

### 🚛 Ассенизация
- Учёт вызовов
- Распределение стоимости
- Примечания

### ⚙ Настройки
- Информация о собственнике
- Текущий расчётный период
- Тарифы Севастополя (обновляемые)

---

## 📱 Доступ с других устройств

Приложение доступно в локальной сети:

1. Узнайте ваш IP-адрес (в консоли при запуске)
2. Откройте браузер на другом устройстве
3. Введите: `http://<ВАШ_IP>:3000`

**Пример:** `http://192.168.0.161:3000`

---

## 📦 Сборка в EXE

### ⚠️ Важное замечание

Next.js 16 невозможно полностью упаковать в один EXE файл из-за динамической компиляции и серверных компонентов. Однако есть рабочие альтернативы!

### ✅ Доступные варианты

| Вариант | Размер | Node.js | Описание |
|---------|--------|---------|----------|
| **Портативная папка** | ~500 МБ | Требуется | Все файлы в одной папке |
| **EXE Лаунчер** | ~10 МБ | Требуется | Один EXE + файлы проекта |

### 🚀 Быстрая сборка (портативная версия)

```bash
BUILD_EXE.bat
# Выберите: 1
```

Или напрямую:
```bash
СОЗДАТЬ_PORTABLE.bat
```

Будет создана папка `portable/` со всем необходимым:
```
portable/
├── ЗАПУСТИТЬ.bat       # Скрипт запуска
├── standalone/         # Production сборка
├── db/                 # База данных
├── prisma/             # Prisma схема
└── .env                # Конфигурация
```

### 📖 Подробная документация

См. полную инструкцию в файле [СБОРКА_EXE.md](СБОРКА_EXE.md)

---

## 🌐 Деплой на Vercel

### ⚠️ Важно

Vercel не поддерживает SQLite. Для деплоя требуется PostgreSQL база данных.

### Быстрый старт

1. **Создайте PostgreSQL базу:**
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) — в панели Vercel
   - [Neon](https://neon.tech) — бесплатно, без ограничений
   - [Supabase](https://supabase.com) — PostgreSQL + дополнительные возможности

2. **Настройте переменные окружения:**
   ```bash
   # Скопируйте .env.example в .env.local
   copy .env.example .env.local

   # Вставьте DATABASE_URL в .env.local
   ```

3. **Примените миграции:**
   ```bash
   npm run db:push
   ```

4. **Задеплойте на Vercel:**
   ```bash
   # Через GitHub (рекомендуется)
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main

   # Затем подключите репозиторий в vercel.com/new
   ```

### 📖 Подробная документация

См. полную инструкцию в файле [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

---

## 📝 Лицензия

Проект создан для личного использования.

---

## 🤝 Поддержка

По вопросам и предложениям обращайтесь к разработчику.

---

**Версия:** 1.0.0
**Дата обновления:** Март 2026
**Разработчик:** ЖКУ Севастополь

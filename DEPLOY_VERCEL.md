# 🚀 Деплой на Vercel

## ⚠️ Важно: Миграция с SQLite на PostgreSQL

Vercel — бессерверная платформа, которая **не поддерживает SQLite**. Для деплоя нужно использовать PostgreSQL.

---

## 📋 Шаг 1: Подготовка базы данных PostgreSQL

### Вариант A: Vercel Postgres (рекомендуется)

1. Откройте [панель Vercel](https://vercel.com/dashboard)
2. Перейдите в **Storage** → **Add New** → **Postgres**
3. Создайте новую базу данных
4. Скопируйте `DATABASE_URL` из панели

### Вариант B: Neon (бесплатно, без ограничений)

1. Зарегистрируйтесь на [https://neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string из раздела **Connection Details**

### Вариант C: Supabase PostgreSQL

1. Создайте проект на [https://supabase.com](https://supabase.com)
2. Перейдите в **Settings** → **Database**
3. Скопируйте **Connection String** (Pooler Mode)

---

## 📋 Шаг 2: Настройка переменных окружения

### Локально (для тестирования PostgreSQL)

1. Скопируйте `.env.example` в `.env.local`:
```bash
copy .env.example .env.local
```

2. Вставьте ваш `DATABASE_URL` в `.env.local`:
```
DATABASE_URL="postgresql://user:password@hostname:5432/dbname?schema=public"
```

### На Vercel

1. Откройте проект в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменную:
   - **Name:** `DATABASE_URL`
   - **Value:** ваш connection string
   - **Environments:** отметьте все (Production, Preview, Development)

---

## 📋 Шаг 3: Миграция схемы базы данных

### Локальная генерация клиента Prisma:

```bash
npm run db:generate
```

### Применение миграции к PostgreSQL:

```bash
npm run db:push
```

Или с созданием миграции:

```bash
npm run db:migrate
```

---

## 📋 Шаг 4: Подготовка к деплою

### 1. Проверьте файлы проекта

Убедитесь, что у вас есть:
- ✅ `vercel.json` — конфигурация для Vercel
- ✅ `.env.example` — шаблон переменных окружения
- ✅ `package.json` — зависимости и скрипты

### 2. Исключите лишнее из Git

Проверьте `.gitignore` — следующие файлы НЕ должны коммититься:
- `.env`
- `.env.local`
- `db/*.db`
- `.next/`
- `node_modules/`

---

## 📋 Шаг 5: Деплой на Vercel

### Способ 1: Через GitHub (рекомендуется)

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИК/zhku-sevastopol.git
   git push -u origin main
   ```

2. **Подключите Vercel:**
   - Зайдите на [vercel.com/new](https://vercel.com/new)
   - Выберите **Import Git Repository**
   - Найдите ваш репозиторий `zhku-sevastopol`
   - Нажмите **Import**

3. **Настройте переменные окружения:**
   - В процессе импорта нажмите **Environment Variables**
   - Добавьте `DATABASE_URL`
   - Нажмите **Deploy**

### Способ 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте
vercel

# Задеплойте в production
vercel --prod
```

---

## 📋 Шаг 6: Проверка после деплоя

1. Откройте ваш сайт на `https://ваш-проект.vercel.app`
2. Проверьте работу API endpoints:
   - `/api/houses`
   - `/api/tariffs`
   - `/api/settings`
3. Проверьте создание/чтение данных из базы

---

## 🔧 Дополнительные команды

```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:push

# Сброс базы (осторожно!)
npm run db:reset

# Сборка проекта
npm run build

# Запуск production сервера
npm run start
```

---

## 🐛 Возможные проблемы

### Ошибка: "PrismaClient is unable to be run"

**Решение:** Убедитесь, что `DATABASE_URL` установлен в переменных окружения Vercel.

### Ошибка: "Table doesn't exist"

**Решение:** Запустите миграцию:
```bash
npm run db:push
```

### Ошибка: "Module not found: @prisma/client"

**Решение:** Перегенерируйте клиента:
```bash
npm run db:generate
```

### Данные не сохраняются после деплоя

**Причина:** Используется SQLite вместо PostgreSQL.

**Решение:** 
1. Подключите PostgreSQL базу
2. Установите `DATABASE_URL` в Vercel
3. Задеплойте заново

---

## 📊 Структура проекта

```
zhku_sevastopol_MAKSIM/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API endpoints
│   │   ├── houses/       # Страница домов
│   │   ├── bills/        # Страница счетов
│   │   ├── calculate/    # Калькулятор
│   │   └── settings/     # Настройки
│   ├── components/       # React компоненты
│   ├── lib/              # Утилиты (db.ts, utils.ts)
│   └── hooks/            # Custom hooks
├── prisma/
│   ├── schema.prisma     # Схема базы данных
│   └── migrations/       # Миграции Prisma
├── public/               # Статические файлы
├── .env.example          # Шаблон переменных
├── vercel.json           # Конфигурация Vercel
├── package.json          # Зависимости
└── next.config.ts        # Конфигурация Next.js
```

---

## 🔗 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma + Next.js Guide](https://www.prisma.io/docs/getting-started/quickstart)
- [Neon Database](https://neon.tech/docs)

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel: **Deployment** → **View Logs**
2. Проверьте переменные окружения в Vercel
3. Убедитесь, что миграции применены к базе

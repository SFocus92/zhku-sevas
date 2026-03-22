# 🚀 ПОДРОБНАЯ ИНСТРУКЦИЯ: Neon + Vercel

## 📋 Шаг 1: Регистрация на Neon

1. Откройте https://neon.tech
2. Нажмите **Sign Up**
3. Выберите **Continue with GitHub** (удобнее) или email
4. Подтвердите вход

---

## 📋 Шаг 2: Создание базы данных

1. После входа нажмите **Create a project**
2. Введите название проекта (например: `zhku-sevastopol`)
3. Нажмите **Create**
4. **⚠️ ВАЖНО:** Скопируйте **Connection String** который покажется сразу!

Выглядит он так:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Если не скопировали — не страшно:**
- В левой панели выберите ваш проект
- Нажмите **Connection Details** (или значок 🔗)
- Скопируйте строку из раздела **Connection string**

---

## 📋 Шаг 3: Настройка локально

### 3.1 Создайте файл `.env.local`

В папке проекта создайте файл `.env.local` с таким содержимым:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**Замените строку на вашу из Neon!**

### 3.2 Примените схему базы данных

Откройте PowerShell в папке проекта и выполните:

```powershell
# Генерация Prisma клиента
npm run db:generate

# Применение схемы к Neon
npm run db:push
```

Или запустите скрипт:
```powershell
.\MIGRATE_TO_POSTGRES.ps1
```

### 3.3 Проверьте локально

```powershell
npm run dev
```

Откройте http://localhost:3000 и проверьте что приложение работает.

---

## 📋 Шаг 4: Заливка на GitHub

### 4.1 Инициализация Git

```powershell
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
```

### 4.2 Создание репозитория на GitHub

1. Откройте https://github.com/new
2. Введите имя: `zhku-sevastopol`
3. Выберите **Private** (рекомендуется) или **Public**
4. Нажмите **Create repository**

### 4.3 Отправка кода

```powershell
# Замените ВАШ_НИК на ваш username GitHub
git remote add origin https://github.com/ВАШ_НИК/zhku-sevastopol.git

# Отправка
git push -u origin main
```

---

## 📋 Шаг 5: Подключение к Vercel

### 5.1 Импорт проекта

1. Откройте https://vercel.com/new
2. В разделе **Import Git Repository** найдите `zhku-sevastopol`
3. Нажмите **Import**

### 5.2 Настройка переменных окружения

**⚠️ ВАЖНЫЙ ЭТАП:**

1. Перед нажатием Deploy, раскройте **Environment Variables**
2. Нажмите **Add New**
3. Заполните:
   - **Name:** `DATABASE_URL`
   - **Value:** ваша строка подключения из Neon
   - **Environment:** отметьте все три (Production, Preview, Development)
4. Нажмите **Save**

### 5.3 Деплой

1. Нажмите **Deploy**
2. Дождитесь завершения (1-2 минуты)
3. Нажмите **Continue to Dashboard**

---

## 📋 Шаг 6: Проверка работы

### 6.1 Откройте сайт

В Dashboard нажмите на домен вида `zhku-sevastopol.vercel.app`

### 6.2 Проверьте API

Откройте в браузере:
- `https://zhku-sevastopol.vercel.app/api/houses`
- `https://zhku-sevastopol.vercel.app/api/tariffs`
- `https://zhku-sevastopol.vercel.app/api/settings`

Должен вернуться JSON с данными.

### 6.3 Проверьте логи

Если что-то не работает:
1. В Vercel Dashboard перейдите в **Deployments**
2. Кликните на последний деплой
3. Нажмите **View Logs**
4. Ищите ошибки

---

## 🔧 Дополнительные настройки

### Свой домен (опционально)

1. В Vercel: **Settings** → **Domains**
2. Добавьте ваш домен
3. Следуйте инструкциям по настройке DNS

### Автоматический деплой

При каждом `git push` в ветку `main` Vercel будет автоматически деплоить изменения.

---

## 🐛 Возможные проблемы

### Ошибка: "PrismaClientInitializationError"

**Причина:** Неправильный DATABASE_URL

**Решение:**
1. Проверьте что скопировали всю строку из Neon
2. Убедитесь что пароль не содержит спецсимволов без экранирования
3. В Neon: Connection Details → скопируйте заново

---

### Ошибка: "Table 'public.houses' doesn't exist"

**Причина:** Схема не применена к базе

**Решение:**
```powershell
npm run db:push
```

---

### Ошибка: "Build failed"

**Причина:** Ошибки TypeScript при сборке

**Решение:**
- В `next.config.ts` уже стоит `ignoreBuildErrors: true`
- Проверьте логи деплоя в Vercel

---

### Пустая база после деплоя

**Причина:** Не добавили DATABASE_URL в переменные Vercel

**Решение:**
1. Vercel Dashboard → Settings → Environment Variables
2. Добавьте `DATABASE_URL`
3. Redeploy: Deployments → ⋮ → Redeploy

---

## 📊 Структура подключения

```
┌─────────────────┐
│   Vercel.com    │
│   (хостинг)     │
└────────┬────────┘
         │
         │ DATABASE_URL
         │
         ▼
┌─────────────────┐
│   Neon.tech     │
│   (PostgreSQL)  │
└─────────────────┘
```

---

## 📞 Контакты поддержки

- **Neon:** https://neon.tech/docs/support
- **Vercel:** https://vercel.com/docs/support
- **Prisma:** https://www.prisma.io/docs/support

---

## ✅ Чек-лист готовности

- [ ] Зарегистрировался на Neon
- [ ] Создал проект и скопировал DATABASE_URL
- [ ] Создал .env.local с DATABASE_URL
- [ ] Запустил `npm run db:push`
- [ ] Проверил локально (`npm run dev`)
- [ ] Залил код на GitHub
- [ ] Импортировал проект в Vercel
- [ ] Добавил DATABASE_URL в Environment Variables
- [ ] Нажал Deploy
- [ ] Проверил сайт и API

---

**Готово! 🎉**

Ваш проект доступен онлайн 24/7!

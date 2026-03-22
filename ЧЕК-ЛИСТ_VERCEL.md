# ✅ ЧЕК-ЛИСТ: Подготовка к деплою на Vercel

## 📋 Что было сделано

- [x] `vercel.json` — конфигурация для Vercel
- [x] `.env.example` — шаблон переменных окружения
- [x] `prisma/schema.prisma` — обновлён на PostgreSQL
- [x] `DEPLOY_VERCEL.md` — полная документация
- [x] `ДЕПЛОЙ_БЫСТРО.md` — краткая шпаргалка
- [x] `MIGRATE_TO_POSTGRES.ps1` — скрипт миграции
- [x] `README.md` — добавлен раздел о деплое
- [x] `.gitignore` — обновлён для исключения .env

---

## 🚀 Порядок действий

### 1. Создать PostgreSQL базу

□ Выбрать провайдер:
  - [ ] Vercel Postgres (проще)
  - [ ] Neon (бесплатно)
  - [ ] Supabase

□ Скопировать `DATABASE_URL`

---

### 2. Настроить локально

□ Скопировать `.env.example` в `.env.local`
□ Вставить `DATABASE_URL` в `.env.local`
□ Запустить `npm run db:push`
□ Проверить работу локально: `npm run dev`

---

### 3. Подготовить Git

□ Проверить, что `.env` не в git: `git status`
□ Проверить, что `db/*.db` не в git
□ Сделать коммит: `git add . && git commit -m "Ready for Vercel"`

---

### 4. Залить на GitHub

□ Создать репозиторий на GitHub
□ Запушить: `git push -u origin main`

---

### 5. Подключить Vercel

□ Зайти на [vercel.com/new](https://vercel.com/new)
□ Импортировать репозиторий
□ Добавить Environment Variable `DATABASE_URL`
□ Нажать Deploy

---

### 6. Проверить

□ Открыть сайт (ссылка будет в Vercel)
□ Проверить API: `/api/houses`, `/api/tariffs`
□ Проверить создание данных

---

## ⚠️ Важно

- **НЕ коммитьте** `.env` с локальным путём к SQLite
- **НЕ коммитьте** файлы базы данных `db/*.db`
- **Сохраните** `DATABASE_URL` в надёжном месте

---

## 📞 Если нужна помощь

1. Проверьте логи в Vercel: Deployments → View Logs
2. Прочитайте [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
3. Используйте шпаргалку [ДЕПЛОЙ_БЫСТРО.md](ДЕПЛОЙ_БЫСТРО.md)

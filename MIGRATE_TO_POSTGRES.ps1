# Скрипт миграции данных из SQLite в PostgreSQL
# Запускать только локально после настройки .env.local с PostgreSQL URL

Write-Host "=== Миграция данных из SQLite в PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Ошибка: Файл .env.local не найден!" -ForegroundColor Red
    Write-Host "Создайте .env.local с DATABASE_URL для PostgreSQL" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Генерация Prisma клиента..." -ForegroundColor Green
npm run db:generate

Write-Host ""
Write-Host "2. Применение схемы к PostgreSQL..." -ForegroundColor Green
npm run db:push

Write-Host ""
Write-Host "=== Миграция завершена! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Теперь можно делать деплой на Vercel" -ForegroundColor Yellow

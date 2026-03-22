@echo off
chcp 65001 >nul
echo ============================================
echo   МИГРАЦИЯ БАЗЫ ДАННЫХ (PostgreSQL)
echo ============================================
echo.

:: Проверка .env.local
if not exist ".env.local" (
    echo [ОШИБКА] Файл .env.local не найден!
    echo.
    echo 1. Скопируйте .env.example в .env.local
    echo 2. Вставьте DATABASE_URL из Neon
    echo.
    pause
    exit /b 1
)

echo [1/3] Генерация Prisma клиента...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Не удалось сгенерировать Prisma клиент
    pause
    exit /b 1
)

echo.
echo [2/3] Применение схемы к PostgreSQL...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Не удалось применить схему
    echo Проверьте DATABASE_URL в .env.local
    pause
    exit /b 1
)

echo.
echo [3/3] Проверка подключения...
echo.
echo ============================================
echo   ГОТОВО! База данных готова к работе
echo ============================================
echo.
echo Теперь можете запустить: npm run dev
echo.
pause

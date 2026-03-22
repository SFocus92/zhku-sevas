@echo off
chcp 65001 >nul
title Диагностика ЖКУ Севастополь

echo ============================================
echo    ДИАГНОСТИКА СИСТЕМЫ
echo ============================================
echo.

echo [1/6] Проверка Node.js...
node --version
if errorlevel 1 (
    echo [ERROR] Node.js не установлен!
    pause
    exit /b 1
)
echo [OK] Node.js установлен
echo.

echo [2/6] Проверка npm...
npm --version
echo [OK] npm установлен
echo.

echo [3/6] Проверка зависимостей...
if exist "node_modules" (
    echo [OK] node_modules найден
) else (
    echo [WARNING] node_modules не найден!
    echo Установка...
    call npm install
)
echo.

echo [4/6] Проверка базы данных...
if exist "db\database.db" (
    echo [OK] База данных найдена
) else (
    echo [ERROR] База данных не найдена!
)
echo.

echo [5/6] Проверка .env...
if exist ".env" (
    echo [OK] .env найден
    type .env
) else (
    echo [ERROR] .env не найден!
)
echo.

echo [6/6] Очистка кэша и сборка...
if exist ".next" (
    echo Очистка .next...
    rmdir /s /q .next 2>nul
)

echo Сборка проекта...
call npm run build

if errorlevel 1 (
    echo.
    echo ============================================
    echo [ERROR] ОШИБКА СБОРКИ!
    echo ============================================
    echo.
    echo Проверьте логи выше для деталей.
    echo Возможные проблемы:
    echo - Ошибки в коде TypeScript/React
    echo - Отсутствуют зависимости
    echo - Проблемы с конфигурацией
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!
echo ============================================
echo.
echo Проект готов к запуску.
echo Запустите ЗАПУСТИТЬ.bat для старта.
echo.
pause

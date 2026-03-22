@echo off
chcp 65001 >nul
title ЖКУ Севастополь - Сервер

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Система учёта
echo ============================================
echo.

REM Получаем локальный IP адрес
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

echo Запуск сервера...
echo.
echo ============================================
echo ДОСТУП К СЕРВЕРУ:
echo ============================================
echo Локально: http://localhost:3000
echo В сети:   http://%LOCAL_IP:3000
echo.
echo Для доступа с других устройств:
echo 1. Откройте браузер на устройстве в той же сети
echo 2. Введите адрес: http://%LOCAL_IP:3000
echo.
echo Для остановки нажмите Ctrl+C
echo ============================================
echo.

cd /d "%~dp0"

REM Запуск сервера на всех интерфейсах (0.0.0.0)
if exist "standalone\server.js" (
    echo [standalone] Запуск из standalone папки...
    node standalone\server.js
) else if exist ".next\standalone\server.js" (
    echo [dev] Запуск из .next\standalone папки...
    node .next\standalone\server.js
) else (
    echo [error] Файл server.js не найден!
    echo Выполните команду: npm run build
    pause
    exit /b 1
)

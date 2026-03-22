@echo off
chcp 65001 >nul 2>&1
chcp 1251 >nul 2>&1
title ЖКУ Севастополь - Сервер

cls
echo.
echo  ========================================================
echo          ЖКУ СЕВАСТОПОЛЬ - Запуск сервера
echo  ========================================================
echo.

:: Create db folder
if not exist "db" mkdir db

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js не найден!
    echo Скачайте с: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js найден

:: Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :got_ip
)
:got_ip
set LOCAL_IP=%LOCAL_IP: =%

echo.
echo  ========================================================
echo   ВЫБОР РЕЖИМА
echo  ========================================================
echo.
echo   1. Development (npm run dev) - для разработки
echo   2. Production (standalone) - для работы
echo   3. Quick Start (сборка + браузер) - рекомендуется
echo   4. Очистить кэш и запустить - полная очистка
echo.
set /p MODE="Выберите режим (1-4, default=3): "
if "%MODE%"=="" set MODE=3

if "%MODE%"=="1" goto DEV_MODE
if "%MODE%"=="2" goto PROD_MODE
if "%MODE%"=="3" goto QUICK_MODE
if "%MODE%"=="4" goto CLEAN_MODE

:DEV_MODE
echo.
echo [INFO] Запуск development сервера...
echo.
if exist "node_modules" goto SKIP_INSTALL
echo Установка зависимостей...
npm install
:SKIP_INSTALL
call npm run dev
goto END

:PROD_MODE
echo.
echo [INFO] Запуск production сервера...
echo.
if exist "standalone\server.js" (
    node standalone\server.js
) else (
    echo [ERROR] standalone/server.js не найден!
    echo Выполните: npm run build
    pause
    exit /b 1
)
goto END

:QUICK_MODE
echo.
echo [INFO] Быстрый запуск (сборка + браузер)...
echo.
if not exist "standalone\server.js" (
    echo [INFO] Сборка проекта...
    call npm run build
)

echo Запуск сервера...
start /B node standalone\server.js

echo Ожидание запуска...
timeout /t 3 /nobreak >nul

start http://localhost:3000

echo.
echo  ========================================================
echo   СЕРВЕР ЗАПУЩЕН!
echo.
echo   Локально:  http://localhost:3000
if defined LOCAL_IP echo   В сети:    http://%LOCAL_IP%:3000
echo.
echo   Подключайтесь с телефона/планшета в той же сети!
echo  ========================================================
echo.
echo Сервер работает в фоновом режиме.
echo Закройте это окно для остановки.
pause
goto END

:CLEAN_MODE
echo.
echo [INFO] Полная очистка кэша...
echo.
if exist ".next" (
    rmdir /s /q .next 2>nul
    echo [OK] Папка .next удалена
)
call npm cache clean --force 2>nul
echo [OK] Кэш npm очищен
echo.
echo [INFO] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] Сборка завершена
echo.
if exist ".next\standalone" (
    if not exist "standalone" mkdir standalone
    xcopy /E /I /Y .next\standalone standalone >nul 2>&1
    echo [OK] Standalone файлы скопированы
)
echo.
echo Запуск сервера...
start /B node standalone\server.js
echo Ожидание запуска...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo  ========================================================
echo   СЕРВЕР ЗАПУЩЕН!
echo.
echo   Локально:  http://localhost:3000
if defined LOCAL_IP echo   В сети:    http://%LOCAL_IP%:3000
echo  ========================================================
echo.
pause
goto END

:END
pause

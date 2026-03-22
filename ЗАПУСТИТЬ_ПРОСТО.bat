@echo off
chcp 1251 >nul
title ЖКУ СЕВАСТОПОЛЬ - Запуск сервера

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Запуск сервера
echo ============================================
echo.

REM === ПРОВЕРКА Node.js ===
echo [1/4] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не найден!
    echo Установите с: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js найден
echo.

REM === ПРОВЕРКА зависимостей ===
echo [2/4] Проверка зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Ошибка установки!
        pause
        exit /b 1
    )
) else (
    echo [OK] Зависимости установлены
)
echo.

REM === ГЕНЕРАЦИЯ Prisma ===
echo [3/4] Генерация Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [WARN] Ошибка генерации Prisma, продолжаем...
)
echo.

REM === ПОЛУЧЕНИЕ IP ===
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

REM === ЗАПУСК СЕРВЕРА ===
echo [4/4] Запуск сервера...
echo.
echo ============================================
echo  СЕРВЕР ЗАПУЩЕН!
echo ============================================
echo.
echo Локально:  http://localhost:3000
echo В сети:    http://%LOCAL_IP%:3000
echo.
echo Для подключения с других устройств:
echo 1. Откройте браузер на другом устройстве
echo 2. Введите: http://%LOCAL_IP%:3000
echo.
echo ============================================
echo.
echo Запуск браузера...

REM === ОТКРЫТИЕ БРАУЗЕРА ===
timeout /t 3 /nobreak >nul

REM Пробуем разные браузеры
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    goto :end_open
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    goto :end_open
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" -inprivate http://localhost:3000
    goto :end_open
)
if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" (
    start "" "%ProgramFiles%\Mozilla Firefox\firefox.exe" -private-window http://localhost:3000
    goto :end_open
)
REM Если браузер не найден - открываем по умолчанию
start http://localhost:3000

:end_open
echo [OK] Браузер открыт
echo.
echo ============================================
echo Сервер работает. Для остановки нажмите Ctrl+C в окне сервера.
echo ============================================
echo.

REM === ЗАПУСК СЕРВЕРА В ФОНЕ (но с выводом логов) ===
start /B node --no-warnings -e "require('next/dist/server/lib/start-server').startServer({dir: process.cwd(), isDev: true, config: {distDir: '.next'}, hostname: '0.0.0.0', port: 3000}).catch(console.error)"

REM Альтернативно - запуск через npm dev с перенаправлением
REM call npm run dev

REM Держим окно открытым
echo.
echo Сервер запущен в фоновом режиме.
echo Для остановки сервера закройте это окно.
echo.
pause >nul

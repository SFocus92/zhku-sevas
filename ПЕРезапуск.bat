@echo off
chcp 1251 >nul
title ЖКУ СЕВАСТОПОЛЬ - Перезапуск с Prisma

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Перезапуск
echo ============================================
echo.

REM === Остановка существующих процессов Node.js ===
echo [1/5] Остановка существующих процессов...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

REM === Генерация Prisma ===
echo [2/5] Генерация Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Ошибка генерации Prisma!
    pause
    exit /b 1
)
echo [OK] Prisma сгенерирован
echo.

REM === Проверка зависимостей ===
echo [3/5] Проверка зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
) else (
    echo [OK] Зависимости установлены
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

echo [4/5] Запуск сервера...
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

REM === ЗАПУСК СЕРВЕРА ===
start /B npm run dev

timeout /t 5 /nobreak >nul

echo [5/5] Открытие браузера...

REM === ОТКРЫТИЕ БРАУЗЕРА ===
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
start http://localhost:3000

:end_open
echo.
echo ============================================
echo Сервер запущен. Для остановки закройте это окно.
echo ============================================
echo.
pause >nul

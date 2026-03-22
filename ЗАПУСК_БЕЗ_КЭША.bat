@echo off
chcp 1251 >nul
title ЖКУ Севастополь - Запуск без кэша

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Запуск без кэша
echo ============================================
echo.

echo [1/6] Очистка кэша Next.js (.next папка)...
if exist ".next" (
    rmdir /s /q .next 2>nul
    echo [OK] Папка .next удалена
) else (
    echo [INFO] Папка .next не найдена
)
echo.

echo [2/6] Очистка кэша npm...
call npm cache clean --force 2>nul
echo [OK] Кэш npm очищен
echo.

echo [3/6] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не найден!
    echo Скачайте с: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js найден
echo.

echo [4/6] Проверка зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
) else (
    echo [OK] Зависимости установлены
)
echo.

echo [5/6] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] Сборка завершена
echo.

echo [6/6] Копирование standalone файлов...
if exist ".next\standalone" (
    echo Копирование основных файлов...
    if not exist "standalone" mkdir standalone
    xcopy /E /I /Y .next\standalone standalone >nul 2>&1
    
    echo Копирование статических файлов (CSS, JS, шрифты)...
    if not exist "standalone\.next\static" mkdir standalone\.next\static
    xcopy /E /I /Y .next\static standalone\.next\static >nul 2>&1
    
    echo [OK] Standalone файлы скопированы
)
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

REM Запуск сервера
if exist "standalone\server.js" (
    start /B node standalone\server.js
) else (
    echo [ERROR] Файл server.js не найден!
    pause
    exit /b 1
)

echo Ожидание запуска сервера...
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo СЕРВЕР ЗАПУЩЕН!
echo ============================================
echo.
echo Локально:  http://localhost:3000
echo В сети:    http://%LOCAL_IP%:3000
echo.
echo Для доступа с телефона/планшета:
echo 1. Устройства должны быть в одной сети
echo 2. Откройте: http://%LOCAL_IP%:3000
echo.
echo ============================================
echo.

REM Определение браузера и открытие в режиме инкогнито
echo Открытие браузера в режиме инкогнито...

REM Проверяем Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    echo [OK] Открыт Google Chrome в режиме инкогнито
    goto :end_open
)

REM Проверяем Chrome (x86)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    echo [OK] Открыт Google Chrome в режиме инкогнито
    goto :end_open
)

REM Проверяем Edge
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" -inprivate http://localhost:3000
    echo [OK] Открыт Microsoft Edge в режиме InPrivate
    goto :end_open
)

REM Проверяем Firefox
if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" (
    start "" "%ProgramFiles%\Mozilla Firefox\firefox.exe" -private-window http://localhost:3000
    echo [OK] Открыт Mozilla Firefox в приватном режиме
    goto :end_open
)

REM Если браузер не найден - открываем по умолчанию
start http://localhost:3000
echo [INFO] Открыт браузер по умолчанию

:end_open
echo.
echo ============================================
echo Сервер работает в фоновом режиме.
echo Для остановки закройте окно сервера.
echo ============================================
echo.
pause

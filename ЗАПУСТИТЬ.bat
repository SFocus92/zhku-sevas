@echo off
chcp 1251 >nul
title ЖКУ СЕВАСТОПОЛЬ - Запуск сервера

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Запуск сервера
echo ============================================
echo.

REM === Остановка существующих процессов Node.js ===
echo [1/6] Остановка существующих процессов...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM nodejs.exe 2>nul
timeout /t 2 /nobreak >nul
echo.

REM === ПРОВЕРКА Node.js ===
echo [2/6] Проверка Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Установите Node.js с официального сайта:
    echo https://nodejs.org/
    echo.
    echo После установки перезапустите этот файл.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js найден: %NODE_VERSION%
echo.

REM === ПРОВЕРКА npm ===
echo [3/6] Проверка npm...
where npm >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] npm не найден!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm найден: v%NPM_VERSION%
echo.

REM === ПРОВЕРКА зависимостей ===
echo [4/6] Проверка зависимостей...
if not exist "node_modules" (
    echo Зависимости не найдены. Установка...
    echo Это может занять несколько минут...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ОШИБКА] Не удалось установить зависимости!
        echo.
        echo Возможные решения:
        echo 1. Проверьте подключение к интернету
        echo 2. Удалите папку node_modules и package-lock.json
        echo 3. Запустите файл от имени администратора
        pause
        exit /b 1
    )
    echo [OK] Зависимости успешно установлены
) else (
    echo [OK] Зависимости уже установлены
)
echo.

REM === ГЕНЕРАЦИЯ Prisma ===
echo [5/6] Генерация Prisma Client...
if exist "prisma\schema.prisma" (
    call npx prisma generate
    if errorlevel 1 (
        echo [ВНИМАНИЕ] Ошибка при генерации Prisma Client
        echo Проверьте файл prisma/schema.prisma
    ) else (
        echo [OK] Prisma Client сгенерирован
    )
) else (
    echo [ВНИМАНИЕ] Файл prisma/schema.prisma не найден
)
echo.

REM === ПОЛУЧЕНИЕ IP-АДРЕСА ===
set LOCAL_IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" /c:"IP-адрес" 2^>nul') do (
    for /f "tokens=1 delims= " %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :ip_found
    )
)
:ip_found

echo ============================================
echo  СЕРВЕР ГОТОВ К ЗАПУСКУ
echo ============================================
echo.
echo Локальный доступ: http://localhost:3000
echo Доступ из сети:   http://%LOCAL_IP%:3000
echo.
echo ============================================
echo.

REM === ЗАПУСК СЕРВЕРА ===
echo [6/6] Запуск сервера...

REM Запускаем сервер в фоновом режиме
start /B cmd /c "npm run dev > server_log.txt 2>&1"

echo Ожидание запуска сервера...
set /a counter=0
:wait_loop
timeout /t 1 /nobreak >nul
set /a counter+=1
if %counter% gtr 10 (
    echo [ВНИМАНИЕ] Сервер запускается дольше обычного...
    goto :check_server
)
netstat -an | find ":3000" | find "LISTENING" >nul
if errorlevel 1 goto :wait_loop

:check_server
echo [OK] Сервер запущен на порту 3000
echo.

REM === ОТКРЫТИЕ БРАУЗЕРА ===
echo Открытие браузера...

REM Пробуем разные браузеры в режиме инкогнито
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    goto :browser_opened
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
    goto :browser_opened
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" -inprivate http://localhost:3000
    goto :browser_opened
)
if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" (
    start "" "%ProgramFiles%\Mozilla Firefox\firefox.exe" -private-window http://localhost:3000
    goto :browser_opened
)

REM Если ни один браузер не найден, открываем стандартный
start http://localhost:3000

:browser_opened
echo.
echo ============================================
echo  СЕРВЕР УСПЕШНО ЗАПУЩЕН!
echo ============================================
echo.
echo Важная информация:
echo - Для остановки сервера закройте это окно
echo - Логи сервера сохраняются в файл server_log.txt
echo - Если сайт не открывается, подождите 5-10 секунд
echo   и обновите страницу в браузере
echo.
echo Проблемы с запуском?
echo 1. Проверьте, что порт 3000 не занят
echo 2. Запустите файл от имени администратора
echo 3. Проверьте наличие файла package.json
echo.
echo ============================================
echo.

:menu
echo Выберите действие:
echo [1] Открыть сайт в браузере
echo [2] Показать логи сервера
echo [3] Перезапустить сервер
echo [4] Выход
echo.

choice /c 1234 /n /m "Ваш выбор: " >nul
if errorlevel 4 exit /b 0
if errorlevel 3 (
    taskkill /F /IM node.exe 2>nul
    taskkill /F /IM nodejs.exe 2>nul
    echo Сервер перезапускается...
    start /B cmd /c "npm run dev > server_log.txt 2>&1"
    timeout /t 3 >nul
    goto :menu
)
if errorlevel 2 (
    if exist server_log.txt (
        type server_log.txt
    ) else (
        echo Лог-файл не найден
    )
    echo.
    pause
    goto :menu
)
if errorlevel 1 (
    start http://localhost:3000
    goto :menu
)
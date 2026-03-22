@echo off
chcp 1251 >nul
title Создание портативной версии

echo ============================================
echo    Создание портативной версии
echo ============================================
echo.

REM === Проверка Node.js ===
echo [1/6] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не найден!
    pause
    exit /b 1
)
echo [OK] Node.js найден
echo.

REM === Сборка проекта ===
echo [2/6] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] Сборка завершена
echo.

REM === Создание папки portable ===
echo [3/6] Создание портативной папки...
if exist "portable" (
    echo Удаление старой версии...
    rmdir /s /q portable
)
mkdir portable
echo [OK] Папка создана
echo.

REM === Копирование standalone ===
echo [4/6] Копирование standalone файлов...
xcopy /E /I /Y standalone portable\standalone >nul
echo [OK] Standalone файлы скопированы
echo.

REM === Копирование базы данных ===
echo [5/6] Копирование базы данных...
xcopy /E /I /Y db portable\db >nul
xcopy /E /I /Y prisma portable\prisma >nul
copy /Y .env portable\.env >nul
copy /Y package.json portable\package.json >nul
echo [OK] Файлы скопированы
echo.

REM === Создание скрипта запуска ===
echo [6/6] Создание скрипта запуска...

(
echo @echo off
echo chcp 1251 ^>nul
echo title ЖКУ СЕВАСТОПОЛЬ
echo.
echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Портативная версия
echo ============================================
echo.
echo Запуск сервера...
echo.
echo.
REM Получение IP
echo for /f "tokens=2 delims=:" %%%%a in ^('ipconfig ^^| findstr /c:"IPv4"^') do ^(
echo     for /f "tokens=1" %%%%b in ^("%%%%a"^') do ^(
echo         set LOCAL_IP=%%%%b
echo         goto :found
echo     ^)
echo ^)
echo :found
echo.
REM Запуск сервера
echo start /B node standalone\server.js
echo.
echo timeout /t 4 /nobreak ^>nul
echo.
echo ============================================
echo  СЕРВЕР ЗАПУЩЕН!
echo ============================================
echo.
echo Локально:  http://localhost:3000
echo В сети:    http://%%LOCAL_IP%%:3000
echo.
echo Для подключения с других устройств:
echo 1. Откройте браузер на другом устройстве
echo 2. Введите: http://%%LOCAL_IP%%:3000
echo.
echo ============================================
echo.
echo Открытие браузера...
echo.
REM Открытие браузера
echo if exist "%%ProgramFiles%%\Google\Chrome\Application\chrome.exe" ^(
echo     start "" "%%ProgramFiles%%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
echo     goto :end_open
echo ^)
echo if exist "%%ProgramFiles^(x86^)%%\Google\Chrome\Application\chrome.exe" ^(
echo     start "" "%%ProgramFiles^(x86^)%%\Google\Chrome\Application\chrome.exe" --incognito http://localhost:3000
echo     goto :end_open
echo ^)
echo if exist "%%ProgramFiles%%\Microsoft\Edge\Application\msedge.exe" ^(
echo     start "" "%%ProgramFiles%%\Microsoft\Edge\Application\msedge.exe" -inprivate http://localhost:3000
echo     goto :end_open
echo ^)
echo start http://localhost:3000
echo.
echo :end_open
echo ============================================
echo Сервер работает. Для остановки закройте это окно.
echo ============================================
echo.
echo pause ^>nul
) > portable\ЗАПУСТИТЬ.bat

echo [OK] Скрипт запуска создан
echo.

REM === Итоги ===
echo ============================================
echo    ПОРТАТИВНАЯ ВЕРСИЯ СОЗДАНА!
echo ============================================
echo.
echo Папка: portable\
echo.
echo Состав:
echo ├─ ЗАПУСТИТЬ.bat        - Скрипт запуска
echo ├─ standalone/          - Production сборка
echo ├─ db/                  - База данных
echo ├─ prisma/              - Prisma схема
echo ├─ .env                 - Конфигурация
echo └─ package.json         - Зависимости
echo.
echo Для запуска:
echo 1. Скопируйте папку portable в нужное место
echo 2. Запустите ЗАПУСТИТЬ.bat
echo.
echo Для работы требуется установленный Node.js!
echo ============================================
echo.

pause

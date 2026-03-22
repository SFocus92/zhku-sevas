@echo off
chcp 1251 >nul
title ЖКУ Севастополь - Сборка лаунчера

echo ============================================
echo    СБОРКА ЛАУНЧЕРА
echo ============================================
echo.

echo [1/3] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не установлен!
    echo Скачайте с https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js установлен
echo.

echo [2/3] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] Сборка завершена
echo.

echo [3/3] Копирование файлов...
xcopy /E /I /Y .next\standalone standalone >nul 2>&1
xcopy /Y db\database.db standalone\db\ >nul 2>&1
echo [OK] Файлы скопированы
echo.

echo Создание лаунчера...

REM Создаём лаунчер
(
echo @echo off
echo chcp 65001 ^>nul
echo title ЖКУ Севастополь
echo.
echo Запуск сервера...
echo.
echo cd /d "%%~dp0"
echo.
echo REM Проверка Node.js
echo node --version ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo [ERROR] Node.js не установлен!
echo     echo Скачайте с https://nodejs.org/
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Запуск сервера
echo start /B node server.js
echo timeout /t 3 /nobreak ^>nul
echo.
echo REM Открытие браузера
echo start http://localhost:3000
echo.
echo ============================================
echo СЕРВЕР ЗАПУЩЕН!
echo ============================================
echo.
echo Локально: http://localhost:3000
echo.
echo Для остановки закройте это окно
echo ============================================
echo.
echo Сервер работает в фоне.
echo Нажмите Ctrl+C для остановки
echo pause
) > standalone\ЗАПУСТИТЬ_ЖКУ.bat

echo.
echo ============================================
echo ? ГОТОВО!
echo ============================================
echo.
echo Лаунчер создан: standalone\ЗАПУСТИТЬ_ЖКУ.bat
echo.
echo Для запуска:
echo 1. Скопируйте папку standalone в нужное место
echo 2. Запустите ЗАПУСТИТЬ_ЖКУ.bat
echo.
echo ============================================
echo.

pause

@echo off
chcp 1251 >nul
title ЖКУ Севастополь

Запуск сервера...

cd /d "%~dp0"

REM Проверка Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не установлен!
    echo Скачайте с https://nodejs.org/
    pause
    exit /b 1
)

REM Запуск сервера
start /B node server.js
timeout /t 3 /nobreak >nul

REM Открытие браузера
start http://localhost:3000

============================================
СЕРВЕР ЗАПУЩЕН!
============================================

Локально: http://localhost:3000

Для остановки закройте это окно
============================================

Сервер работает в фоне.
Нажмите Ctrl+C для остановки
pause

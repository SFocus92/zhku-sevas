@echo off
chcp 1251 >nul
title ЖКУ СЕВАСТОПОЛЬ

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ
echo ============================================
echo.

REM Получение IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)
:found

echo Запуск сервера...
echo.

start /B node standalone\server.js

timeout /t 4 /nobreak >nul

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
echo Открытие браузера...
echo.

REM Открытие браузера
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
start http://localhost:3000

:end_open
echo ============================================
echo Сервер работает. Для остановки закройте это окно.
echo ============================================
echo.
pause >nul

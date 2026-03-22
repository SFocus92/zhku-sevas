@echo off
chcp 1251 >nul
title Сборка EXE лаунчера

echo ============================================
echo    Сборка EXE лаунчера
echo ============================================
echo.

echo [1/4] Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python не найден!
    echo Установите Python 3.8+ с: https://www.python.org/
    echo При установке отметьте "Add Python to PATH"
    pause
    exit /b 1
)
echo [OK] Python найден
python --version
echo.

echo [2/4] Установка PyInstaller...
pip install pyinstaller --quiet
if errorlevel 1 (
    echo [ERROR] Ошибка установки PyInstaller!
    pause
    exit /b 1
)
echo [OK] PyInstaller установлен
echo.

echo [3/4] Сборка EXE...
pyinstaller --onefile ^
    --name "ЖКУ_Севастополь" ^
    --icon=NONE ^
    --console ^
    --add-data ".env;." ^
    --add-data "standalone;standalone" ^
    --add-data "db;db" ^
    --hidden-import=webbrowser ^
    launcher.py

if errorlevel 1 (
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] EXE собран
echo.

echo [4/4] Копирование файлов...
if exist "dist\ЖКУ_Севастополь.exe" (
    copy /Y "dist\ЖКУ_Севастополь.exe" "ЖКУ_Севастополь.exe"
    echo [OK] EXE файл скопирован в корень проекта
) else (
    echo [ERROR] EXE файл не найден!
)
echo.

echo ============================================
echo    СБОРКА ЗАВЕРШЕНА!
echo ============================================
echo.
echo Файлы:
echo - ЖКУ_Севастополь.exe (в корне проекта)
echo - dist\ЖКУ_Севастополь.exe (из PyInstaller)
echo.
echo Для работы приложения рядом с EXE должны быть:
echo - node_modules/
echo - standalone/
echo - db/
echo - .env
echo - prisma/
echo.
echo ИЛИ используйте портативную версию с Node.js
echo ============================================
echo.

pause

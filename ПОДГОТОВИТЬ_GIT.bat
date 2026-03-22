@echo off
chcp 65001 >nul
echo ============================================
echo   ИНИЦИАЛИЗАЦИЯ GIT ДЛЯ VERCEL
echo ============================================
echo.

:: Проверка Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Git не установлен!
    echo Установите с https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Инициализация Git...
git init

echo.
echo [2/5] Добавление файлов...
git add .

echo.
echo [3/5] Создание коммита...
git commit -m "Ready for Vercel deployment"

echo.
echo [4/5] Создание ветки main...
git branch -M main

echo.
echo ============================================
echo   ВАЖНО: Создание репозитория на GitHub
echo ============================================
echo.
echo 1. Откройте https://github.com/new
echo 2. Введите имя: zhku-sevastopol
echo 3. Выберите Private или Public
echo 4. Нажмите Create repository
echo.
echo После создания введите команду:
echo.
echo git remote add origin https://github.com/ВАШ_НИК/zhku-sevastopol.git
echo git push -u origin main
echo.
pause

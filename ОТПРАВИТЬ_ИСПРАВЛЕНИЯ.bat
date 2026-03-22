@echo off
chcp 65001 >nul
echo ============================================
echo   ОТПРАВКА ИСПРАВЛЕНИЙ НА GITHUB
echo ============================================
echo.
echo Исправление: Middleware аутентификации
echo.

git add .
git commit -m "Fix: middleware authentication for Vercel"
git push

echo.
echo ============================================
echo   ГОТОВО!
echo ============================================
echo.
echo Vercel автоматически задеплоит изменения!
echo.
echo Далее:
echo   1. Проверь AUTH_PASSWORD на Vercel
echo   2. Открой сайт в режиме инкогнито
echo   3. Проверь что вход/выход работают
echo.
pause

@echo off
chcp 1251 >nul
title Сборка приложения

echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ - Сборка
echo ============================================
echo.

echo Выберите вариант сборки:
echo.
echo 1. Портативная версия (рекомендуется)
echo    - Папка со всеми файлами
echo    - Требует установленный Node.js
echo    - Быстрый запуск
echo.
echo 2. EXE Лаунчер (через Python)
echo    - Один EXE файл
echo    - Требует Python для сборки
echo    - Node.js должен быть установлен
echo.
echo 3. Выход
echo.
set /p CHOICE="Ваш выбор (1-3, default=1): "

if "%CHOICE%"=="2" goto :BUILD_LAUNCHER
if "%CHOICE%"=="3" goto :EOF

:BUILD_PORTABLE
echo.
echo ============================================
echo  Создание портативной версии
echo ============================================
echo.

REM Проверка Node.js
echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js не найден!
    echo Установите с: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js найден
echo.

REM Сборка
echo [2/5] Сборка проекта...
call npm run build
if errorlevel 1 (
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)
echo [OK] Сборка завершена
echo.

REM Создание portable папки
echo [3/5] Создание портативной папки...
if exist "portable" rmdir /s /q portable
mkdir portable
echo [OK] Папка создана
echo.

REM Копирование
echo [4/5] Копирование файлов...
xcopy /E /I /Y standalone portable\standalone >nul
xcopy /E /I /Y db portable\db >nul
xcopy /E /I /Y prisma portable\prisma >nul
copy /Y .env portable\.env >nul
copy /Y package.json portable\package.json >nul
echo [OK] Файлы скопированы
echo.

REM Скрипт запуска
echo [5/5] Создание скрипта запуска...
call :CREATE_LAUNCHER_SCRIPT
echo [OK] Скрипт создан
echo.

echo ============================================
echo  ГОТОВО!
echo ============================================
echo.
echo Портативная версия: portable\
echo.
echo Для запуска:
echo 1. Скопируйте папку portable куда нужно
echo 2. Запустите ЗАПУСТИТЬ.bat
echo.
echo Требуется: Node.js 18+
echo ============================================
echo.
pause
goto :EOF

:BUILD_LAUNCHER
echo.
echo ============================================
echo  Сборка EXE лаунчера
echo ============================================
echo.

REM Проверка Python
echo [1/3] Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python не найден!
    echo Установите Python 3.8+ с: https://www.python.org/
    echo При установке отметьте "Add Python to PATH"
    pause
    exit /b 1
)
echo [OK] Python найден
echo.

REM Установка PyInstaller
echo [2/3] Установка PyInstaller...
pip install pyinstaller --quiet
if errorlevel 1 (
    echo [ERROR] Ошибка установки!
    pause
    exit /b 1
)
echo [OK] PyInstaller установлен
echo.

REM Сборка
echo [3/3] Сборка EXE...
pyinstaller --onefile ^
    --name "ZhkuSevastopol" ^
    --console ^
    --hidden-import=webbrowser ^
    launcher.py

if errorlevel 1 (
    echo [ERROR] Ошибка сборки!
    pause
    exit /b 1
)

if exist "dist\ZhkuSevastopol.exe" (
    copy /Y "dist\ZhkuSevastopol.exe" "ZhkuSevastopol.exe" >nul
    echo [OK] EXE создан: ZhkuSevastopol.exe
)

echo.
echo ============================================
echo  ГОТОВО!
echo ============================================
echo.
echo EXE файл: ZhkuSevastopol.exe
echo.
echo ВНИМАНИЕ: Для работы требуется Node.js!
echo Лаунчер только управляет запуском.
echo.
echo ============================================
echo.
pause
goto :EOF

:CREATE_LAUNCHER_SCRIPT
(
echo @echo off
echo chcp 1251 ^>nul
echo title ЖКУ СЕВАСТОПОЛЬ
echo.
echo ============================================
echo    ЖКУ СЕВАСТОПОЛЬ
echo ============================================
echo.
echo for /f "tokens=2 delims=:" %%%%a in ^('ipconfig ^^| findstr /c:"IPv4"^') do ^(
echo     for /f "tokens=1" %%%%b in ^("%%%%a"^') do ^(
echo         set LOCAL_IP=%%%%b
echo         goto :found
echo     ^)
echo ^)
echo :found
echo.
echo start /B node standalone\server.js
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
goto :EOF

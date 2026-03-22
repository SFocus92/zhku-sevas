#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ЖКУ Севастополь - Лаунчер
Запускает сервер и открывает браузер
"""

import os
import sys
import subprocess
import socket
import time
import webbrowser
from pathlib import Path

# Получаем путь к директории скрипта
if getattr(sys, 'frozen', False):
    # Запущено из EXE
    SCRIPT_DIR = Path(sys.executable).parent
else:
    # Запущено из исходника
    SCRIPT_DIR = Path(__file__).parent

# Пути
NODE_MODULES = SCRIPT_DIR / "node_modules"
STANDALONE_DIR = SCRIPT_DIR / "standalone"
SERVER_JS = STANDALONE_DIR / "server.js"
DB_DIR = SCRIPT_DIR / "db"
ENV_FILE = SCRIPT_DIR / ".env"

PORT = 3000
HOST = "0.0.0.0"

def get_local_ip():
    """Получает локальный IP адрес"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def check_nodejs():
    """Проверяет наличие Node.js"""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
        return False, None
    except FileNotFoundError:
        return False, None
    except Exception as e:
        return False, str(e)

def install_dependencies():
    """Устанавливает зависимости npm"""
    print("Установка зависимостей...")
    try:
        subprocess.run(
            ["npm", "install"],
            cwd=SCRIPT_DIR,
            check=True
        )
        return True
    except Exception as e:
        print(f"Ошибка установки: {e}")
        return False

def generate_prisma():
    """Генерирует Prisma Client"""
    print("Генерация Prisma Client...")
    try:
        subprocess.run(
            ["npx", "prisma", "generate"],
            cwd=SCRIPT_DIR,
            check=True,
            capture_output=True
        )
        return True
    except Exception as e:
        print(f"Ошибка Prisma: {e}")
        return False

def start_server():
    """Запускает сервер"""
    print(f"Запуск сервера на порту {PORT}...")
    
    # Определяем, какую команду использовать
    if STANDALONE_DIR.exists() and SERVER_JS.exists():
        # Production режим (standalone)
        cmd = ["node", str(SERVER_JS)]
        cwd = STANDALONE_DIR
    else:
        # Development режим
        cmd = ["npm", "run", "dev"]
        cwd = SCRIPT_DIR
    
    # Запускаем сервер в фоне
    process = subprocess.Popen(
        cmd,
        cwd=cwd,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )
    
    return process

def wait_for_server(timeout=30):
    """Ждёт пока сервер запустится"""
    print("Ожидание запуска сервера...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', PORT))
            sock.close()
            
            if result == 0:
                time.sleep(2)  # Даём серверу полностью инициализироваться
                return True
        except:
            pass
        
        time.sleep(1)
    
    return False

def open_browser():
    """Открывает браузер"""
    url = f"http://localhost:{PORT}"
    
    # Пробуем разные браузеры
    browsers = [
        "chrome",
        "msedge", 
        "firefox",
        "default"
    ]
    
    for browser_name in browsers:
        try:
            if browser_name == "default":
                webbrowser.open(url)
            else:
                # Пробуем открыть в конкретном браузере в режиме инкогнито
                if browser_name == "chrome":
                    webbrowser.get("chrome").open_new_tab(url)
                elif browser_name == "msedge":
                    webbrowser.get("edge").open_new_tab(url)
                elif browser_name == "firefox":
                    webbrowser.get("firefox").open_new_tab(url)
            return True
        except:
            continue
    
    return False

def main():
    """Основная функция"""
    print("=" * 50)
    print("   ЖКУ СЕВАСТОПОЛЬ - Лаунчер")
    print("=" * 50)
    print()
    
    # Проверка Node.js
    print("[1/5] Проверка Node.js...")
    has_node, node_version = check_nodejs()
    
    if not has_node:
        print("❌ Node.js не найден!")
        print()
        print("Установите Node.js с: https://nodejs.org/")
        print("Рекомендуется версия LTS (20.x или выше)")
        print()
        input("Нажмите Enter для выхода...")
        sys.exit(1)
    
    print(f"✓ Node.js найден: {node_version}")
    print()
    
    # Проверка зависимостей
    print("[2/5] Проверка зависимостей...")
    if not NODE_MODULES.exists():
        print("Установка зависимостей...")
        if not install_dependencies():
            input("Нажмите Enter для выхода...")
            sys.exit(1)
    else:
        print("✓ Зависимости установлены")
    print()
    
    # Генерация Prisma
    print("[3/5] Генерация Prisma...")
    generate_prisma()
    print()
    
    # Запуск сервера
    print("[4/5] Запуск сервера...")
    server_process = start_server()
    
    # Ожидание запуска
    if not wait_for_server():
        print("❌ Сервер не запустился!")
        server_process.terminate()
        input("Нажмите Enter для выхода...")
        sys.exit(1)
    
    print("✓ Сервер запущен")
    print()
    
    # Открытие браузера
    print("[5/5] Открытие браузера...")
    open_browser()
    print("✓ Браузер открыт")
    print()
    
    # Информация о подключении
    local_ip = get_local_ip()
    
    print("=" * 50)
    print("   СЕРВЕР ЗАПУЩЕН!")
    print("=" * 50)
    print()
    print(f"📍 Локально:  http://localhost:{PORT}")
    print(f"🌐 В сети:    http://{local_ip}:{PORT}")
    print()
    print("Для подключения с других устройств:")
    print("1. Откройте браузер на другом устройстве")
    print(f"2. Введите: http://{local_ip}:{PORT}")
    print()
    print("=" * 50)
    print()
    print("Сервер работает в фоне.")
    print("Для остановки закройте это окно.")
    print()
    
    # Держим процесс запущенным
    try:
        server_process.wait()
    except KeyboardInterrupt:
        print("\nОстановка сервера...")
        server_process.terminate()

if __name__ == "__main__":
    main()

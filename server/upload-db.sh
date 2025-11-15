#!/bin/bash
# Скрипт для загрузки базы данных на сервер

# Укажите свои данные
SERVER_USER="your_user"
SERVER_HOST="your_test_server"
SERVER_PATH="/srv/coingecko/server/.tmp/data.db"
LOCAL_DB_PATH="./.tmp/data.db"

echo "Загрузка базы данных на сервер..."

# Создаем бэкап на сервере перед заменой
echo "Создаю бэкап на сервере..."
ssh ${SERVER_USER}@${SERVER_HOST} "cd /srv/coingecko/server && cp .tmp/data.db .tmp/data.db.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true"

# Загружаем файл
echo "Загружаю файл..."
scp "${LOCAL_DB_PATH}" ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}

echo "Готово!"
echo "Не забудьте перезапустить Strapi на сервере"


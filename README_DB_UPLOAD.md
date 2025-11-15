# Как залить базу данных на тестовый сервер

## Вариант 1: Через SCP (рекомендуется)

### Windows (PowerShell):
```powershell
# 1. Убедитесь, что база данных готова локально
# Путь к локальной базе: server/.tmp/data.db

# 2. Создайте бэкап на сервере (по SSH)
ssh user@test-server "cd /srv/coingecko/server && cp .tmp/data.db .tmp/data.db.backup.$(date +%Y%m%d_%H%M%S)"

# 3. Загрузите файл
scp server/.tmp/data.db user@test-server:/srv/coingecko/server/.tmp/data.db

# 4. Проверьте права доступа на сервере
ssh user@test-server "chmod 664 /srv/coingecko/server/.tmp/data.db"
```

### Windows (через WinSCP):
1. Откройте WinSCP
2. Подключитесь к серверу
3. Перейдите в `/srv/coingecko/server/.tmp/`
4. Перетащите файл `data.db` из локальной папки

## Вариант 2: Через rsync (если установлен)

```bash
rsync -avz -e ssh server/.tmp/data.db user@test-server:/srv/coingecko/server/.tmp/data.db
```

## Вариант 3: Через временную папку на сервере

```bash
# 1. Загрузите файл во временную папку
scp server/.tmp/data.db user@test-server:/tmp/data.db

# 2. Подключитесь по SSH и переместите файл
ssh user@test-server
cd /srv/coingecko/server
cp .tmp/data.db .tmp/data.db.backup  # Создайте бэкап
cp /tmp/data.db .tmp/data.db
chmod 664 .tmp/data.db
rm /tmp/data.db
```

## Важно!

1. **ВСЕГДА создавайте бэкап** перед заменой базы данных
2. **Остановите Strapi** на сервере перед заменой:
   ```bash
   pm2 stop strapi
   # или
   systemctl stop strapi
   ```
3. **Проверьте права доступа** после загрузки:
   ```bash
   chmod 664 /srv/coingecko/server/.tmp/data.db
   ```
4. **Запустите Strapi** после замены:
   ```bash
   pm2 start strapi
   # или
   systemctl start strapi
   ```

## Проверка после загрузки

```bash
# Подключитесь к серверу
ssh user@test-server

# Проверьте размер файла
ls -lh /srv/coingecko/server/.tmp/data.db

# Проверьте структуру базы
cd /srv/coingecko/server
sqlite3 .tmp/data.db "SELECT name FROM sqlite_master WHERE type='table' LIMIT 5;"
```


## Развёртывание проекта samouraiwallet.com на новый сервер

Этот документ описывает текущую конфигурацию боевого сервера и пошагово объясняет, как развернуть идентичное окружение и сайт на новом сервере.

---

## 1. Общий обзор архитектуры

- **ОС**: Ubuntu 24.04.4 LTS (Noble Numbat)
- **Node.js**: v20.20.0
- **npm**: 10.8.2
- **Процесс‑менеджер**: `pm2` (c модулем `pm2-logrotate`)
- **Web‑сервер**: `nginx/1.24.0 (Ubuntu)` + Let’s Encrypt
- **Репозиторий проекта**: `/srv/samouraiwallet.com`

Внутри репозитория:

- `server` — backend на Strapi 4 (SQLite по умолчанию)
- `api` — Node.js/Express API‑шлюз/прокси
- `client` — фронтенд на Next.js 15
- `ecosystem.config.js` — конфиг `pm2` с тремя приложениями:
  - `strapi` — Strapi backend (`/srv/samouraiwallet.com/server`, порт 1337)
  - `api` — вспомогательный API сервер (`/srv/samouraiwallet.com/api`, порт 8000)
  - `frontend` — Next.js фронт (`/srv/samouraiwallet.com/client`, порт 3000)

Все три сервиса запущены через `pm2` в режиме `fork` и слушают только `127.0.0.1`. Внешний доступ организован через `nginx` (reverse‑proxy, HTTPS, базовая HTTP‑аутентификация для фронтенда).

---

## 2. Зависимости и системные компоненты

### 2.1. Базовые пакеты ОС

На новом сервере (Ubuntu 24.04 LTS) необходимо установить:

```bash
sudo apt update
sudo apt install -y \
  git curl build-essential \
  nginx \
  sqlite3 \
  certbot python3-certbot-nginx
```

> **Примечание:** версии могут немного отличаться, важно лишь, чтобы они были совместимы (nginx 1.24+, SQLite 3+, Certbot из репозитория Ubuntu).

### 2.2. Node.js + npm

Рекомендуется установить Node.js 20.x (на боевом сервере используется `v20.20.0`).

Пример установки через NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v   # ожидаемо ~ v20.20.0
npm -v    # ожидаемо ~ 10.x
```

### 2.3. PM2

Установите глобально:

```bash
sudo npm install -g pm2

pm2 -v
```

Рекомендуется сразу включить автозапуск:

```bash
pm2 startup systemd
```

Команда выведет строку вида `sudo env PATH=... pm2 startup systemd -u <user> --hp <home>`. Выполните её под `root`.

После запуска приложений не забудьте:

```bash
pm2 save
```

### 2.4. Дополнительно (опционально)

- Модуль `pm2-logrotate` (уже используется на текущем сервере):

```bash
pm2 install pm2-logrotate
```

---

## 3. Клонирование и структура проекта

На новом сервере:

```bash
sudo mkdir -p /srv
cd /srv
sudo git clone <SSH_OR_HTTPS_URL_РЕПОЗИТОРИЯ> samouraiwallet.com
sudo chown -R $USER:$USER /srv/samouraiwallet.com
cd /srv/samouraiwallet.com
```

Структура (ключевые части):

- `server/` — Strapi 4 приложение (`invest-space-strapi`)
- `api/` — Node.js/Express API (`apis`)
- `client/` — Next.js фронтенд (`invest-space-nextjs`)
- `ecosystem.config.js` — конфиг `pm2`:

```js
// ecosystem.config.js (сокращённо)
module.exports = {
  apps: [
    {
      name: "strapi",
      cwd: "/srv/samouraiwallet.com/server",
      script: "npm",
      args: "run start",
      env: { HOST: "127.0.0.1", PORT: "1337", NODE_ENV: "production", PUBLIC_CLIENT_URL: "https://samouraiwallet.com" }
    },
    {
      name: "api",
      cwd: "/srv/samouraiwallet.com/api",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production", PORT: "8000", HOST: "127.0.0.1" }
    },
    {
      name: "frontend",
      cwd: "/srv/samouraiwallet.com/client",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production", PORT: "3000", HOST: "127.0.0.1" }
    }
  ]
};
```

> **Важно:** путь `cwd` и порты должны совпадать на новом сервере, чтобы конфигурация nginx «попала» в нужные сервисы.

---

## 4. Backend (Strapi) — директория `server`

### 4.1. Зависимости Strapi

```bash
cd /srv/samouraiwallet.com/server
npm install
```

Стек:

- Strapi: `@strapi/strapi@4.25.6`
- БД: `better-sqlite3@8.6.0`

### 4.2. Конфигурация базы данных

Файл `server/config/database.js`:

- Используется клиент по умолчанию `sqlite`, если переменная `DATABASE_CLIENT` не переопределена.
- База лежит в файле (относительно `server/`):

```text
DATABASE_FILENAME = database/data.db
```

Для идентичного развёртывания:

- Создайте (или скопируйте с боевого сервера) файл `server/database/data.db`.
- Убедитесь, что в `.env` Strapi указано:

```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=database/data.db
```

### 4.3. Файл окружения Strapi (`server/.env`)

На боевом сервере присутствует `server/.env` с примерно таким набором ключей (значения **нужно перенести безопасным способом**, но не хранить в этой инструкции):

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=database/data.db
NODE_ENV=production
COINGECKO_API_KEY=...
PUBLIC_URL=https://samouraiwallet.com/strapi
ADMIN_URL=https://samouraiwallet.com/strapi/admin
```

**Как перенести:**

- Вариант 1: скопировать файл по `scp` с боевого сервера:

```bash
scp user@old-server:/srv/coinexplorers.com/server/.env /srv/samouraiwallet.com/server/.env
```

- Вариант 2: перенести значения через менеджер секретов / вручную (важно не коммитить файл в git).

### 4.4. Сборка и запуск Strapi

На новом сервере:

```bash
cd /srv/samouraiwallet.com/server
npm run build     # сборка admin UI
```

Далее запуск через pm2 (из корня репозитория, см. раздел 6):

```bash
cd /srv/samouraiwallet.com
pm2 start ecosystem.config.js --only strapi
```

---

## 5. API‑шлюз — директория `api`

### 5.1. Зависимости

```bash
cd /srv/samouraiwallet.com/api
npm install
```

(используется `express`, `axios`, `dotenv` и др.; сборка не требуется, это просто Node.js‑сервер)

### 5.2. Файл окружения `api/.env`

На боевом сервере присутствует `api/.env` со следующими ключами (значения нужно безопасно перенести):

```env
PORT=8000
STRAPI_BASE_URL=http://127.0.0.1:1337
APP_BASE_URL=http://127.0.0.1
SPEEDY_INDEX_API_KEY=...
STRAPI_TOKEN=...
```

Скопируйте его с боевого сервера или создайте вручную.

### 5.3. Запуск API

```bash
cd /srv/samouraiwallet.com
pm2 start ecosystem.config.js --only api
```

---

## 6. Фронтенд (Next.js) — директория `client`

### 6.1. Зависимости и сборка

```bash
cd /srv/samouraiwallet.com/client
npm install
npm run build
```

Скрипт `start` в `client/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -H 127.0.0.1 -p 3000"
  }
}
```

### 6.2. Файл окружения `client/.env`

На боевом сервере используется `client/.env` приблизительно такого вида:

```env
NEXT_PUBLIC_API_ENDPOINT=https://samouraiwallet.com/strapi
NEXT_PUBLIC_APP_URL=https://samouraiwallet.com
NEXT_PUBLIC_APP_HOST=https://samouraiwallet.com
NEXT_PUBLIC_STRAPI_URL=https://samouraiwallet.com
NEXT_PUBLIC_POSTS_PRIORITY=0.6
NEXT_PUBLIC_REVIEWS_PRIORITY=0.8
```

На новом сервере:

- Скопируйте этот файл с боевого сервера или создайте аналогичный, изменив домен, если он будет другим.
- После изменения `.env` пересоберите фронтенд (`npm run build`).

### 6.3. Запуск фронтенда

Из корня репозитория:

```bash
cd /srv/samouraiwallet.com
pm2 start ecosystem.config.js --only frontend
```

---

## 7. Запуск всех сервисов через PM2

Полный запуск всех трёх приложений:

```bash
cd /srv/samouraiwallet.com
pm2 start ecosystem.config.js

pm2 status   # проверить, что strapi, api, frontend online
pm2 save     # сохранить конфигурацию для автозапуска
```

Убедитесь, что Strapi слушает `127.0.0.1:1337`, API — `127.0.0.1:8000`, фронтенд — `127.0.0.1:3000`.

---

## 8. Nginx и HTTPS

### 8.1. Конфигурация nginx для `samouraiwallet.com`

На боевом сервере используется конфиг `/etc/nginx/sites-available/samouraiwallet.com.conf` со следующей логикой:

- HTTP → HTTPS редирект
- www → non‑www редирект
- HTTPS‑виртуальный хост с:
  - проксированием `/` на Next.js (порт 3000) с базовой аутентификацией;
  - `/strapi/` на Strapi (порт 1337);
  - `/api/` на Node API (порт 8000);
  - пробросом `/sitemap.xml` и `/api/sitemap.xml`.

Пример конфига (адаптируйте при необходимости под свои пути к сертификатам):

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name samouraiwallet.com www.samouraiwallet.com;

    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/_acme-challenge/samouraiwallet.com;
        allow all;
    }

    location / {
        return 301 https://samouraiwallet.com$request_uri;
    }
}

# HTTPS www -> non-www redirect
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.samouraiwallet.com;

    ssl_certificate     /etc/letsencrypt/live/samouraiwallet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/samouraiwallet.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://samouraiwallet.com$request_uri;
}

# HTTPS основной сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name samouraiwallet.com;

    ssl_certificate     /etc/letsencrypt/live/samouraiwallet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/samouraiwallet.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 65M;

    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/_acme-challenge/samouraiwallet.com;
        allow all;
    }

    location = /sitemap.xml {
        return 301 /api/sitemap.xml;
    }

    # Фронтенд с basic auth
    location = /news {
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000;
    }

    location / {
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000;
    }

    # Strapi
    location ^~ /strapi/ {
        proxy_pass http://127.0.0.1:1337/;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        client_max_body_size 65M;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
    }

    # sitemap через фронтенд
    location = /api/sitemap.xml {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000/api/sitemap.xml;
    }

    # Внешний API-шлюз
    location ^~ /api/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:8000/;
        client_max_body_size 65M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 180s;
    }
}
```

### 8.2. Активация конфигурации и сертификатов

1. Создайте файл:

```bash
sudo nano /etc/nginx/sites-available/samouraiwallet.com.conf
```

2. Вставьте/адаптируйте конфиг выше.

3. Создайте симлинк:

```bash
sudo ln -s /etc/nginx/sites-available/samouraiwallet.com.conf /etc/nginx/sites-enabled/samouraiwallet.com.conf
```

4. Настройте сертификаты Let’s Encrypt (если домен новый/пустой конфиг):

```bash
sudo certbot --nginx -d samouraiwallet.com -d www.samouraiwallet.com
```

5. Проверьте конфигурацию и перезапустите nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8.3. Basic Auth для фронтенда

На текущем сервере используется файл паролей `/etc/nginx/.htpasswd-frontend`. Для идентичной настройки:

```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-frontend <username>
sudo systemctl reload nginx
```

---

## 9. Перенос базы данных Strapi (SQLite)

Strapi использует SQLite, файл задаётся переменной `DATABASE_FILENAME` (по умолчанию `database/data.db`).

### 9.1. Копирование БД с боевого сервера

На локальной машине/новом сервере:

```bash
scp user@old-server:/srv/coinexplorers.com/server/database/data.db \
    /srv/samouraiwallet.com/server/database/data.db
```

Установите корректные права:

```bash
cd /srv/samouraiwallet.com/server
chmod 664 database/data.db
```

### 9.2. Рекомендации по безопасности

- Перед копированием на боевом сервере остановите Strapi:

```bash
pm2 stop strapi
```

- Сделайте резервную копию файла БД на обоих серверах (например, с датой в названии).
- После замены БД снова запустите Strapi:

```bash
pm2 start strapi
```

---

## 10. Чек‑лист после развёртывания

- **ОС и пакеты**
  - [ ] Ubuntu 24.04 LTS (или совместимая)
  - [ ] Установлены: `nginx`, `sqlite3`, `git`, `nodejs (20.x)`, `npm (10.x)`, `pm2`, `certbot`
- **Репозиторий**
  - [ ] Код склонирован в `/srv/samouraiwallet.com`
  - [ ] Права на папку настроены
- **Backend / Strapi**
  - [ ] `server/.env` перенесён
  - [ ] `server/database/data.db` перенесена/создана
  - [ ] Выполнены `npm install` и `npm run build`
- **API**
  - [ ] `api/.env` перенесён
  - [ ] Выполнен `npm install`
- **Фронтенд**
  - [ ] `client/.env` перенесён/создан
  - [ ] Выполнены `npm install` и `npm run build`
- **PM2**
  - [ ] `pm2 start ecosystem.config.js`
  - [ ] `pm2 status` показывает `online` для `strapi`, `api`, `frontend`
  - [ ] `pm2 save` выполнен, `pm2 startup` настроен
- **Nginx / HTTPS**
  - [ ] Конфиг `samouraiwallet.com.conf` создан и активирован
  - [ ] Сертификаты Let’s Encrypt выданы
  - [ ] `nginx -t` проходит без ошибок, `systemctl reload nginx` успешен
- **Функциональная проверка**
  - [ ] Главная страница сайта открывается по HTTPS
  - [ ] Доступны `/api/*` и `/strapi/*` (с нужной авторизацией)
  - [ ] Работает админка Strapi

При соблюдении всех шагов выше новый сервер будет полностью соответствовать текущему окружению и конфигурации боевого сервера.


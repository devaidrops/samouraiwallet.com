## Продакшен‑перенос c `samouraiwallet.tw1.su` на `samouraiwallet.com`

Данный документ описывает **пошаговую, проверенную и безопасную** процедуру переноса проекта с тестового домена `samouraiwallet.tw1.su` и его поддоменов на продакшен‑домен `samouraiwallet.com`, с учётом текущего окружения:

- ОС: Linux + `systemd`
- Веб‑сервер: `nginx` (`/etc/nginx`)
- SSL: Let’s Encrypt (`certbot`, каталоги `/etc/letsencrypt`)
- Node/PM2‑процессы: `strapi`, `api`, `frontend` (см. `ecosystem.config.js`)
- Код проекта: `/srv/samouraiwallet.com`

> ВАЖНО: все потенциально опасные действия сопровождаются бэкапами и проверкой (`nginx -t`, `certbot renew --dry-run` и т.п.).  
> Перед изменениями в БД WordPress обязательно делать `mysqldump`. В этом окружении WP‑CLI и `wp-config.php` не обнаружены — шаги по WP описаны как требования к внешнему WP‑серверу.

---

### 1. Бэкапы (ОБЯЗАТЕЛЬНО) в `/root`

1. Создать каталог бэкапов (один раз в начале операции):

   ```bash
   sudo mkdir -p /root/backups-$(date +%F-%H%M%S)
   BACKUP_DIR=/root/backups-$(date +%F-%H%M%S)
   echo "${BACKUP_DIR}"
   ```

2. Скопировать конфиги nginx, сертификаты и код проекта:

   ```bash
   BACKUP_DIR="/root/backups-YYYY-MM-DD-HHMMSS"   # подставить созданный выше

   sudo cp -a /etc/nginx "${BACKUP_DIR}/nginx"
   sudo cp -a /etc/letsencrypt "${BACKUP_DIR}/letsencrypt"
   sudo cp -a /srv/samouraiwallet.com "${BACKUP_DIR}/samouraiwallet.com"
   ```

3. (Если WP живёт на этом же сервере) сделать дамп БД:

   ```bash
   DB_NAME="ВАША_БД_WP"
   DB_USER="ВАШ_USER"
   DB_HOST="localhost"   # или как в wp-config.php

   sudo mysqldump -u"${DB_USER}" -p -h"${DB_HOST}" "${DB_NAME}" \
     > "${BACKUP_DIR}/wp-db-${DB_NAME}-$(date +%F).sql"
   ```

4. Проверить размер и содержимое бэкапа:

   ```bash
   sudo du -sh "${BACKUP_DIR}"
   ls -lh "${BACKUP_DIR}"
   ```

---

### 2. DNS для `samouraiwallet.com` и поддоменов

1. В панели DNS‑провайдера:
   - Создать A/AAAA для:
     - `samouraiwallet.com`
     - `www.samouraiwallet.com`
     - `api.samouraiwallet.com`
     - `autodiscover.samouraiwallet.com`
     - `blog.samouraiwallet.com`
     - `cpanel.samouraiwallet.com`
     - `cpcalendars.samouraiwallet.com`
     - `cpcontacts.samouraiwallet.com`
     - `dev.samouraiwallet.com`
     - `mail.samouraiwallet.com`
     - `soroban.samouraiwallet.com`
     - `webdisk.samouraiwallet.com`
     - `webmail.samouraiwallet.com`
     - `wiki.samouraiwallet.com`
   - Все записи должны указывать на IP этого сервера (аналогично тестовому домену).

2. С сервера проверить, что DNS обновился:

   ```bash
   dig +short samouraiwallet.com
   dig +short www.samouraiwallet.com
   dig +short api.samouraiwallet.com
   # и т.д. по ключевым поддоменам
   ```

---

### 3. Анализ текущего nginx‑конфига тестового домена

Текущий конфиг тестового домена: `/etc/nginx/sites-available/samouraiwallet.tw1.su.conf`

Ключевые моменты:

- Поддомены `.tw1.su`:
  - HTTP: слушается порт 80, ACME‑челлендж (`/.well-known/acme-challenge/`) указывает на `root /var/www/_acme-challenge/samouraiwallet.tw1.su;` и редирект на HTTPS.
  - HTTPS: редиректит на `https://samouraiwallet.tw1.su/$subdomain$request_uri`, с дополнительными правилами для `blog` и `api`.
- Основной домен:
  - HTTP: редирект на `https://samouraiwallet.tw1.su`.
  - `www`: отдельный HTTPS‑сервер с редиректом на non‑www.
  - Основной HTTPS‑сервер:
    - использует сертификат `/etc/letsencrypt/live/samouraiwallet.tw1.su/fullchain.pem`;
    - проксирует:
      - фронтенд (`/` и `/news`) на `http://127.0.0.1:3000`;
      - `^~ /strapi/` на `http://127.0.0.1:1337/`;
      - `= /api` на `http://127.0.0.1:3000/api`;
      - `^~ /api/` на `http://127.0.0.1:8000/`.

Это окружение сохраняется и для продакшена, меняется только доменное имя и SSL‑сертификат.

---

### 4. Подготовка ACME‑каталога и HTTP‑конфига для `samouraiwallet.com`

1. Создать каталог для ACME‑челленджей нового домена:

   ```bash
   sudo mkdir -p /var/www/_acme-challenge/samouraiwallet.com
   sudo ls -ld /var/www/_acme-challenge/samouraiwallet.com
   ```

2. Создать HTTP‑конфиг для боевого домена  
   Файл: `/etc/nginx/sites-available/samouraiwallet.com.conf` (пример уже используется):

   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name
           api.samouraiwallet.com
           autodiscover.samouraiwallet.com
           blog.samouraiwallet.com
           cpanel.samouraiwallet.com
           cpcalendars.samouraiwallet.com
           cpcontacts.samouraiwallet.com
           dev.samouraiwallet.com
           mail.samouraiwallet.com
           soroban.samouraiwallet.com
           webdisk.samouraiwallet.com
           webmail.samouraiwallet.com
           wiki.samouraiwallet.com;

       location ^~ /.well-known/acme-challenge/ {
           default_type "text/plain";
           root /var/www/_acme-challenge/samouraiwallet.com;
           allow all;
       }

       location / {
           return 301 https://$host$request_uri;
       }
   }

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
   ```

3. Включить новый сайт и проверить конфиг:

   ```bash
   sudo ln -sf /etc/nginx/sites-available/samouraiwallet.com.conf \
               /etc/nginx/sites-enabled/samouraiwallet.com.conf

   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

### 5. Получение SSL‑сертификата для `samouraiwallet.com` и поддоменов

1. Убедиться, что HTTP‑конфиг уже активен (`curl -I http://samouraiwallet.com` должен возвращать 301).

2. Вызвать `certbot` с `webroot` (или nginx‑плагином):

   ```bash
   sudo certbot certonly --webroot \
     -w /var/www/_acme-challenge/samouraiwallet.com \
     -d samouraiwallet.com \
     -d www.samouraiwallet.com \
     -d api.samouraiwallet.com \
     -d autodiscover.samouraiwallet.com \
     -d blog.samouraiwallet.com \
     -d cpanel.samouraiwallet.com \
     -d cpcalendars.samouraiwallet.com \
     -d cpcontacts.samouraiwallet.com \
     -d dev.samouraiwallet.com \
     -d mail.samouraiwallet.com \
     -d soroban.samouraiwallet.com \
     -d webdisk.samouraiwallet.com \
     -d webmail.samouraiwallet.com \
     -d wiki.samouraiwallet.com
   ```

   После успешного выполнения появится каталог `/etc/letsencrypt/live/samouraiwallet.com` с `fullchain.pem` и `privkey.pem`.

3. Проверить автопродление:

   ```bash
   sudo certbot renew --dry-run
   ```

---

### 6. HTTPS‑конфиг для `samouraiwallet.com` (аналог тестового)

После получения сертификата добавить/создать HTTPS‑серверы, аналогичные `samouraiwallet.tw1.su`, но с новым доменом и путями к сертификату.  
**На продакшене базовая HTTP‑авторизация (`auth_basic`) для фронтенда отключается** — она использовалась только на тестовом домене.
Пример основного HTTPS‑сервера (в том же `samouraiwallet.com.conf` или отдельном файле‑инклюде):

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name samouraiwallet.com;

    ssl_certificate     /etc/letsencrypt/live/samouraiwallet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/samouraiwallet.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 65M;

    # Поведение идентично тестовому домену: фронтенд, strapi, API
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/_acme-challenge/samouraiwallet.com;
        allow all;
    }

    location = /sitemap.xml {
        return 301 /api/sitemap.xml;
    }

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000;
    }

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

    location = /api/sitemap.xml {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000/api/sitemap.xml;
    }

    location = /api {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://127.0.0.1:3000/api;
    }

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

Также нужен отдельный HTTPS‑сервер для **поддоменов**, чтобы:

- на каждый поддомен был **валидный SSL** (особенно важно, если включён HSTS `includeSubDomains`);
- поведение было детерминированным (не зависело от `default_server`);
- поддомены корректно редиректились на продакшен‑URL.

Пример (редирект `https://<sub>.samouraiwallet.com/...` → `https://samouraiwallet.com/<sub>/...`, с частными правилами для `blog` и `api`):

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name
        api.samouraiwallet.com
        autodiscover.samouraiwallet.com
        blog.samouraiwallet.com
        cpanel.samouraiwallet.com
        cpcalendars.samouraiwallet.com
        cpcontacts.samouraiwallet.com
        dev.samouraiwallet.com
        mail.samouraiwallet.com
        soroban.samouraiwallet.com
        webdisk.samouraiwallet.com
        webmail.samouraiwallet.com
        wiki.samouraiwallet.com;

    ssl_certificate     /etc/letsencrypt/live/samouraiwallet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/samouraiwallet.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    set $blog_page_redirect 0;
    if ($host = "blog.samouraiwallet.com") {
        set $blog_page_redirect 1;
    }
    if ($uri ~ ^/page/(2|3)$) {
        set $blog_page_redirect "${blog_page_redirect}1";
    }
    if ($blog_page_redirect = "11") {
        return 301 https://samouraiwallet.com/blog;
    }

    if ($host ~* ^([^.]+)\.samouraiwallet\.com$) {
        set $subdomain $1;
    }

    set $api_root 0;
    if ($host ~* ^api\.samouraiwallet\.com$) {
        set $api_root 1;
    }
    if ($request_uri = "/") {
        set $api_root "${api_root}1";
    }
    if ($api_root = "11") {
        return 301 https://samouraiwallet.com/api;
    }

    return 301 https://samouraiwallet.com/$subdomain$request_uri;
}
```

После правок:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. Обновление окружения приложений (PM2, `ecosystem.config.js`, `.env`)

1. Проверить текущий `ecosystem.config.js`:

   ```js
   module.exports = {
     apps: [
       {
         name: "strapi",
         cwd: "/srv/samouraiwallet.com/server",
         script: "node",
         args: "node_modules/@strapi/strapi/bin/strapi.js start",
         env: {
           HOST: "127.0.0.1",
           PORT: "1337",
           NODE_ENV: "production",
           PUBLIC_CLIENT_URL: "https://samouraiwallet.tw1.su"
         }
       },
       ...
     ]
   };
   ```

2. Обновить `PUBLIC_CLIENT_URL` на боевой домен:

   ```js
   PUBLIC_CLIENT_URL: "https://samouraiwallet.com"
   ```

3. При необходимости просмотреть и обновить `.env`‑файлы:

   - `/srv/samouraiwallet.com/client/.env`
   - `/srv/samouraiwallet.com/client/.env.production.local`
   - `/srv/samouraiwallet.com/server/.env`
   - `/srv/samouraiwallet.com/api/.env`

   Заменить все вхождения `samouraiwallet.tw1.su` → `samouraiwallet.com`.

4. **Пересобрать Next.js‑клиент** (переменные `NEXT_PUBLIC_*` подставляются при сборке):

   ```bash
   cd /srv/samouraiwallet.com/client
   npm run build
   ```

5. Перезапустить PM2‑процессы:

   ```bash
   cd /srv/samouraiwallet.com
   pm2 reload ecosystem.config.js --update-env
   pm2 restart frontend
   pm2 save
   pm2 ls
   ```

---

### 8. Смена домена в WordPress (ТОЛЬКО через WP‑CLI, на WP‑сервере)

> В этом окружении `wp` и `wp-config.php` не обнаружены, значит WordPress находится либо в другом месте, либо на другом сервере.  
> Ниже — **обязательные шаги**, которые нужно выполнить на том сервере, где стоит WP.

1. Установить/проверить WP‑CLI:

   ```bash
   wp --info
   ```

2. Перейти в корень WP‑установки (где лежит `wp-config.php`):

   ```bash
   cd /path/to/wordpress
   ```

3. Проверить текущие `siteurl` и `home`:

   ```bash
   wp option get siteurl
   wp option get home
   ```

4. Сделать дамп БД (см. раздел 1).

5. Выполнить `search-replace` с dry‑run:

   ```bash
   wp search-replace \
     'https://samouraiwallet.tw1.su' \
     'https://samouraiwallet.com' \
     --all-tables \
     --precise \
     --recurse-objects \
     --skip-columns=guid \
     --dry-run
   ```

6. Применить реальные изменения:

   ```bash
   wp search-replace \
     'https://samouraiwallet.tw1.su' \
     'https://samouraiwallet.com' \
     --all-tables \
     --precise \
     --recurse-objects \
     --skip-columns=guid
   ```

   При необходимости аналогично заменить `http://samouraiwallet.tw1.su` → `https://samouraiwallet.com`.

7. Повторно проверить `siteurl` и `home`:

   ```bash
   wp option get siteurl
   wp option get home
   ```

---

### 9. Проверка нового домена и сервисов

1. Быстрая проверка HTTP/HTTPS с сервера:

   ```bash
   curl -I https://samouraiwallet.com
   curl -I https://www.samouraiwallet.com
   curl -I https://api.samouraiwallet.com
   ```

2. Проверка в браузере:
   - Зайти на `https://samouraiwallet.com`.
   - Проверить отсутствие предупреждений по сертификату.
   - Убедиться, что фронтенд, Strapi‑админка и API работают.

3. Проверка логов:

   ```bash
   sudo tail -n 100 /var/log/nginx/error.log
   sudo tail -n 100 /var/log/nginx/access.log

   pm2 logs --lines 100
   ```

4. Проверить автопродление SSL:

   ```bash
   sudo certbot renew --dry-run
   ```

---

### 10. Включение редиректов с тестового домена на продакшен

> Делать только после того, как убедились, что `samouraiwallet.com` работает корректно во всех сценариях.

1. Для основного тестового домена в `samouraiwallet.tw1.su.conf` можно упростить/добавить серверы:

   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name samouraiwallet.tw1.su www.samouraiwallet.tw1.su;

       location ^~ /.well-known/acme-challenge/ {
           default_type "text/plain";
           root /var/www/_acme-challenge/samouraiwallet.tw1.su;
           allow all;
       }

       location / {
           return 301 https://samouraiwallet.com$request_uri;
       }
   }
   ```

2. Для поддоменов тестового домена можно настроить редирект по аналогии с текущим конфигом, но на новый домен:

   ```nginx
   server {
       listen 443 ssl http2;
       listen [::]:443 ssl http2;
       server_name
           api.samouraiwallet.tw1.su
           autodiscover.samouraiwallet.tw1.su
           blog.samouraiwallet.tw1.su
           cpanel.samouraiwallet.tw1.su
           cpcalendars.samouraiwallet.tw1.su
           cpcontacts.samouraiwallet.tw1.su
           dev.samouraiwallet.tw1.su
           mail.samouraiwallet.tw1.su
           soroban.samouraiwallet.tw1.su
           webdisk.samouraiwallet.tw1.su
           webmail.samouraiwallet.tw1.su
           wiki.samouraiwallet.tw1.su;

       ssl_certificate     /etc/letsencrypt/live/samouraiwallet.tw1.su/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/samouraiwallet.tw1.su/privkey.pem;
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

       if ($host ~* ^([^.]+)\.samouraiwallet\.tw1\.su$) {
           set $subdomain $1;
       }

       return 301 https://$subdomain.samouraiwallet.com$request_uri;
   }
   ```

3. Проверить конфиг и перезагрузить nginx:

   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Убедиться в корректности редиректов:

   ```bash
   curl -I http://samouraiwallet.tw1.su
   curl -I https://samouraiwallet.tw1.su

   curl -I https://api.samouraiwallet.tw1.su
   ```

   Во всех случаях должен быть `301 Moved Permanently` на `https://samouraiwallet.com/...` или соответствующий поддомен.

---

### 11. Контрольный чек‑лист

- [ ] Бэкапы `/etc/nginx`, `/etc/letsencrypt`, кода и БД лежат в `/root/backups-YYYY-MM-DD-*`.
- [ ] DNS для `samouraiwallet.com` и всех нужных поддоменов указывает на правильный сервер.
- [ ] `samouraiwallet.com.conf` настроен, успешный `nginx -t`, nginx перезагружен.
- [ ] Сертификаты Let’s Encrypt для `samouraiwallet.com` и поддоменов выпущены, `certbot renew --dry-run` без ошибок.
- [ ] `PUBLIC_CLIENT_URL` и все `.env` обновлены на `https://samouraiwallet.com`, PM2 перезапущен.
- [ ] В WordPress (на его сервере) домен сменён через WP‑CLI (`search-replace`), `siteurl` и `home` указывают на `https://samouraiwallet.com`.
- [ ] Новый домен и поддомены открываются по HTTPS без ошибок, основной функционал работает.
- [ ] Логи nginx и приложений чисты от критических ошибок.
- [ ] Редиректы с `samouraiwallet.tw1.su` и его поддоменов на новый домен настроены и отдают 301.

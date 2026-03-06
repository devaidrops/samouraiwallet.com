## Анализ текущей настройки сервера и сайта (samouraiwallet.com)

Дата анализа: 2026‑03‑06  
Сервер: Ubuntu 24.04.4 LTS  
Веб‑сервер: nginx/1.24.0  
SSL: certbot 2.9.0 (Let’s Encrypt, ECDSA)  
Runtime приложений: Node.js v20.20.0 + PM2 6.0.14  

> Цель документа: зафиксировать фактическую архитектуру и дать рекомендации, которые **улучшают безопасность/надёжность**, но **не ломают** текущую работоспособность.

---

### 1. Текущая архитектура (как сейчас работает)

#### 1.1. Входной трафик

- Внешние порты открыты:
  - **80/tcp** → nginx
  - **443/tcp** → nginx
  - **22/tcp** → sshd
  - **10050/tcp** → `zabbix_agentd` (слушает на `0.0.0.0`)

Внутренние (loopback) сервисы:

- `127.0.0.1:3000` — Next.js frontend (PM2 `frontend`)
- `127.0.0.1:1337` — Strapi (PM2 `strapi`)
- `127.0.0.1:8000` — API (PM2 `api`)

#### 1.2. Роутинг nginx (prod)

Файл: `/etc/nginx/sites-available/samouraiwallet.com.conf`

- `samouraiwallet.com`:
  - HTTP → 301 на HTTPS
  - HTTPS:
    - `/` и `/news` → proxy на `http://127.0.0.1:3000`
    - `/strapi/` → proxy на `http://127.0.0.1:1337/`
    - `/api` → proxy на `http://127.0.0.1:3000/api` (страница “api” во фронтенде)
    - `/api/` → proxy на `http://127.0.0.1:8000/` (внешний API)
  - **Важно**: базовая авторизация `auth_basic` на продакшене **отключена** (и это правильно для прод‑сайта).

- `www.samouraiwallet.com`:
  - HTTPS → 301 на `https://samouraiwallet.com/...`

- Поддомены (`api.`, `blog.`, `autodiscover.` и др.):
  - HTTP → 301 на HTTPS (на сам поддомен)
  - HTTPS → 301 на `https://samouraiwallet.com/<subdomain>/...`  
    + частные правила для:
    - `blog`: `/page/2` и `/page/3` → `https://samouraiwallet.com/blog`
    - `api`: `/` → `https://samouraiwallet.com/api`

#### 1.3. Редирект с тестового домена

Файл: `/etc/nginx/sites-available/samouraiwallet.tw1.su.conf`

- И основной домен `samouraiwallet.tw1.su`, и `www`, и поддомены `.tw1.su` редиректятся (301) на `samouraiwallet.com` и соответствующие пути.

---

### 2. SSL/сертификаты (prod + поддомены)

#### 2.1. Сертификат `samouraiwallet.com`

certbot сертификат **включает все используемые поддомены** (SAN):

- `samouraiwallet.com`
- `www.samouraiwallet.com`
- `api.samouraiwallet.com`
- `blog.samouraiwallet.com`
- `autodiscover.samouraiwallet.com`
- `cpanel.samouraiwallet.com`
- `cpcalendars.samouraiwallet.com`
- `cpcontacts.samouraiwallet.com`
- `dev.samouraiwallet.com`
- `mail.samouraiwallet.com`
- `soroban.samouraiwallet.com`
- `webdisk.samouraiwallet.com`
- `webmail.samouraiwallet.com`
- `wiki.samouraiwallet.com`

Файл renewal‑конфига: `/etc/letsencrypt/renewal/samouraiwallet.com.conf`  
authenticator: `webroot`  
webroot: `/var/www/_acme-challenge/samouraiwallet.com`

#### 2.2. Автопродление

На сервере включён `certbot.timer` (дважды в сутки). Dry‑run проходит.

---

### 3. PM2 / процессы приложений

PM2 процессы:

- `frontend` (Next.js): cwd `/srv/samouraiwallet.com/client`, `npm run start`
- `strapi`: cwd `/srv/samouraiwallet.com/server`, запуск Strapi start
- `api`: cwd `/srv/samouraiwallet.com/api`, `npm run start`

Файл оркестрации: `/srv/samouraiwallet.com/ecosystem.config.js`

**Замечание**: процессы PM2 работают под пользователем `root`. Это функционально, но не best‑practice по безопасности.

---

### 4. Что видно по логам (до очистки)

Архив логов сохранён в `/root/logs-archive-2026-03-06-092856/`.

#### 4.1. nginx error.log (критичные события)

- Массовые попытки brute‑force базовой авторизации на тестовом домене (`.tw1.su`) — ошибки вида:
  - `user "...": password mismatch` / `user "..." was not found in "/etc/nginx/.htpasswd-frontend"`
  Это ожидаемо для публичного тестового домена и подтверждает необходимость:
  - либо скрывать тестовые окружения за VPN/allowlist,
  - либо ставить rate‑limit/fail2ban.

- Во время переключения домена были ошибки:
  - `connect() failed (111: Connection refused) while connecting to upstream` для `127.0.0.1:3000` и `127.0.0.1:1337`
  Это типично при перезапусках/пересборке (окно, когда upstream не поднят).

- Были таймауты при подключении к Strapi:
  - `upstream timed out (110: Connection timed out) while connecting to upstream ... /strapi/api/...`
  Похоже на кратковременное “подвисание” Strapi/нагрузку/блокировку event‑loop/IO.

#### 4.2. PM2 frontend error.log

Встречаются ошибки `ECONNRESET` при запросах к Strapi во время деплоя/перезапусков. Это согласуется с nginx‑ошибками выше.

---

### 5. Рекомендации (безопасные улучшения, без поломки)

Ниже рекомендации разделены по приоритету и риску.

#### P0 (сделать в первую очередь: безопасность/стабильность)

- **Ограничить доступ к `zabbix_agentd` (порт 10050)**:
  - сейчас слушает на `0.0.0.0:10050`;
  - при отсутствии строгой фильтрации на уровне сети/фаервола это лишняя поверхность атаки.
  - Варианты:
    - bind только на нужный интерфейс (например, приватный);
    - или закрыть порт фаерволом, разрешив только IP мониторинга.

- **Включить фаервол** (UFW сейчас `inactive`) и зафиксировать минимально нужные правила:
  - allow: `22/tcp`, `80/tcp`, `443/tcp`;
  - allow (условно): `10050/tcp` только с IP мониторинга;
  - deny everything else.
  Это почти всегда “безопасная” операция, если выполнить с сохранением SSH‑доступа.

- **Убрать старые протоколы TLS в nginx**:  
  В `/etc/nginx/nginx.conf` сейчас:
  - `ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;`
  Рекомендация:
  - оставить `TLSv1.2 TLSv1.3`.
  Риск минимальный (сломаются только очень старые клиенты).

#### P1 (улучшения надёжности/операционки)

- **Перевести PM2 с root на отдельного системного пользователя** (например, `samourai`):
  - снижает impact при компрометации Node‑приложения;
  - упрощает права на файлы/логи.
  Подход:
  - создать пользователя без shell (или с ограниченным);
  - перенести `/root/.pm2` → `/home/samourai/.pm2`;
  - настроить `pm2 startup systemd` для этого пользователя и сохранить `pm2 save`.

- **Добавить “health checks”**:
  - nginx location типа `GET /healthz` (возвращает 200) + проверка Strapi/API по loopback.
  - мониторинг (zabbix/uptime robot) должен смотреть на health endpoint.

- **Усилить устойчивость к кратким падениям Strapi при нагрузке**:
  - увеличить `proxy_connect_timeout`/`proxy_read_timeout` на `/strapi/` (например, до 180–300s), если запросы реально тяжёлые;
  - отдельно оптимизировать Strapi (кэш, индексы/БД — см. ниже).

- **Стратегия бэкапов Strapi SQLite**:
  - сейчас Strapi использует `sqlite` (`DATABASE_FILENAME=database/data.db`).
  - Для продакшена это “работает”, но требует дисциплины:
    - регулярный бэкап файла БД + uploads (если хранятся локально),
    - и проверка восстановления.
  Более “прод” вариант — миграция Strapi на Postgres (но это уже проектное изменение).

#### P2 (качество/безопасность кода и конфигов)

- **Секреты в `.env`**:
  - В `server/.env` и `api/.env` присутствуют ключи/токены.
  - Рекомендация: хранить секреты вне репозитория:
    - либо через systemd `EnvironmentFile` с правами `600`,
    - либо через секрет‑хранилище (Vault/SSM/Ansible Vault).

- **Убрать “if” в nginx там, где можно заменить на `map`**:
  - сейчас редиректы сделаны через `if` в server‑контексте; это допустимо для `return`, но лучше оформить через `map`, чтобы избежать edge‑кейсов в будущем.
  - Не критично, но улучшает сопровождаемость.

- **Nginx hardening (мягкий, без ломания)**:
  - включить `server_tokens off;`
  - добавить разумные security headers на уровне nginx (если не задаются приложением)
  - убедиться, что gzip настроен на нужные типы (сейчас включён, но список типов закомментирован).

---

### 6. Команды для регулярной проверки (runbook)

- Статусы:
  - `systemctl status nginx`
  - `pm2 ls`
  - `certbot certificates`
  - `systemctl list-timers | grep certbot` (если нужен точный тайминг)

- Проверка трафика:
  - `curl -I https://samouraiwallet.com`
  - `curl -I https://samouraiwallet.com/strapi/`
  - `curl -I https://samouraiwallet.com/api/`

- Порты:
  - `ss -tulpen`

---

### 7. Итог

Конфигурация в целом корректная: домен/поддомены обслуживаются nginx, SSL покрывает весь набор поддоменов, редиректы с тестового домена настроены.

Основные улучшения “без риска”:

1) включить фаервол и ограничить `10050/tcp`  
2) отключить TLSv1/TLSv1.1 в nginx  
3) перевести PM2/Node на отдельного пользователя  
4) добавить health‑checks и мониторинг  
5) наладить регулярные бэкапы SQLite + uploads (или план миграции на Postgres)


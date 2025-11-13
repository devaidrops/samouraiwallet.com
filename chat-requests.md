## Переписка по задаче CoinPriceWidget / CoinGecko

1. **Стартовое задание** — добавить публичный GET `/api/price` в Strapi, интегрировать CoinGecko, сделать виджет на фронтенде с конвертером, подготовить инструкции по правам и проверкам.
2. **Исследование проекта** — просмотр структуры `server/src/api`, `client/src/components`, `post` schema. Уточнение: backend Strapi v4 в `server`, фронтенд Next.js в `client`.
3. **Создание API /price**  
   - `routes/price.js`: публичный GET `/price` → `price.fetch` (позже `price.index`).  
   - `controllers/price.js`: валидация `coinId`, вызов сервиса, обработка ошибок.  
   - `services/price.js`: запрос к CoinGecko без API-ключа (изначально), кэш 5 минут.
4. **Фронтенд виджет v1** — `client/src/components/CoinPriceWidget.js` (React Hook), подключение в `BlogPostPage`, модель `PostModel` дополнили `coinGeckoId`.
5. **Проблемы сборки** — Next.js жаловался на импорт из `api/client/...`, создали копию `client/src/components/CoinPriceWidget.jsx` и реэкспорт `CoinPriceWidget.js`.
6. **Доп. правки** — фильтр постов без категории, правка `jsconfig.json` (NodeNext), проверка линтера.
7. **Разговор о виджете** — пользователь показал мокап; перерисовали компонент с orange style и кнопкой «Поменять».
8. **Ошибка API-key** — CoinGecko требовал `x-cg-demo-api-key`. Изменили Strapi контроллер (на `axios`), добавили зависимость, маршрут `price.index`, инструкцию по `COINGECKO_API_KEY`.
9. **Ошибки 502/ECONNREFUSED** — диагностировали, что Strapi не запущен / API ключ не установлен, просили проверить `.env`, перезапустить Strapi.
10. **Виджет не рендерится** — безопасно извлекли `coinGeckoId` в `BlogPostPage` и на серверном рендере `ExchangeReviewPage`, добавили `console.log`.
11. **Дублирование файлов** — уточнили, что виджет находится и в `api/client`, и в `client/src`.
12. **Проблема с относительным API endpoint** — исправляли `resolveApiBase`, добавляли логи, выяснили, что `NEXT_PUBLIC_API_ENDPOINT` должен быть абсолютным `http://127.0.0.1:1337`.
13. **Создание архива** — собрали `price-widget-changes.zip` с ключевыми файлами.
14. **Обсуждение деплоя** — советы по git-потоку, `npm install`, настройке `.env`.
15. **Файл с запросами** — записали кратко в `chat-requests.txt`, затем расширили историю здесь.

Дополнительные темы:  
- Вопрос по работе с русским языком.  
- Объяснение, почему виджет показывал «Ошибка» (незапущенный Strapi / отсутствующий ключ).  
- Согласование того, какие файлы изменены и что некоторые автоматически тронуты Strapi/Next.  
- Рекомендация удалить `api/client/components/CoinPriceWidget.jsx`, если больше не нужен.
# CoinGecko Price Widget – Chat Tasks Summary

## Backend (Strapi)
- Create public GET `/api/price` endpoint calling CoinGecko `/simple/price` with `x-cg-demo-api-key`.
- Validate query `coinId`, return `{ coinId, usd }`, handle 400 (missing id) and 502 (upstream failure).
- Add route pointing to `price.index`, ensure unauthenticated access.
- Configure `COINGECKO_API_KEY` in `.env`, restart Strapi, grant Public permission.
- Verify endpoint with `coinId=bitcoin` / `bitcoin-diamond`; add `axios` dependency.

## Frontend (Next.js)
- Build `CoinPriceWidget` with USD ↔ coin converter, stylistic update per mock.
- Normalize API base URL (`NEXT_PUBLIC_API_ENDPOINT` fallback), log fetch errors.
- Safely derive `coinGeckoId` from Strapi data (`attributes`, `data.attributes`), pass to widget.
- Update `BlogPostPage` and dynamic post page to render widget conditionally.
- Filter posts lacking category/slug on index page; expose widget module for imports.

## Collaboration Notes
- Clarified Strapi/Next.js setup, caching considerations, environment variables.
- Identified and resolved issues: module parsing, API key missing, incorrect endpoint base, duplicate component copies.
- Packaged modified files (`price-widget-changes.zip`) for deployment; outlined git-based deployment steps.
- Confirmed final state: endpoint returns price, widget renders correctly with absolute API base.


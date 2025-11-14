# Скрипты для управления Review Rating Categories

## Проблема

При создании нового Review в админ-панели Strapi поле "Оценки (summary)" может содержать пустые labels (названия оценок). Это происходит потому, что при создании Review система автоматически берет категории из таблицы `review-rating-category` и создает на их основе оценки.

## Решение

### Вариант 1: Ручное создание через админ-панель (рекомендуется)

1. Откройте админ-панель Strapi
2. Перейдите в **Content Manager -> Review Rating Category**
3. Создайте новые категории с нужными labels, например:
   - Проходимость прогнозов
   - Стоимость подписки
   - Статистика
   - Коэффициенты
   - Отзывы игроков в сети
4. **Обязательно опубликуйте каждую категорию** (кнопка "Publish")

### Вариант 2: Автоматическое создание через скрипт (если нет категорий)

⚠️ **Этот вариант нужен только если категорий еще нет в базе!**

1. Перейдите в директорию `server`:
   ```bash
   cd server
   ```

2. Проверьте текущее состояние:
   ```bash
   node scripts/check-rating-categories.js
   ```

3. Если категорий нет - создайте базовые:
   ```bash
   node scripts/seed-rating-categories.js
   ```

✅ **У вас категории уже созданы**, поэтому этот скрипт больше не нужен!

### Исправление существующих Reviews

Если у вас уже есть Reviews с пустыми labels, запустите скрипт автоматического исправления:

```bash
cd server
node scripts/fix-existing-reviews.js
```

Этот скрипт:
- Найдет все Reviews с пустыми или отсутствующими оценками
- Автоматически создаст оценки на основе категорий из Review Rating Category
- Если нет общего рейтинга - сгенерирует от 1.2 до 2.9
- Распределит оценки summary вокруг общего рейтинга с отклонением ±0.5

## Как это работает

### Автоматическое заполнение при создании Review

В файле `server/src/api/review/content-types/review/lifecycles.js` есть хук `beforeCreate`, который выполняется перед созданием нового Review:

```javascript
// Генерируем общий рейтинг от 1.2 до 2.9
if (!event.params.data.rating) {
  event.params.data.rating = +(Math.random() * (2.9 - 1.2) + 1.2).toFixed(1);
}

if (!event.params.data?.summary?.length) {
  const summaryCategories = await strapi
    .query("api::review-rating-category.review-rating-category")
    .findMany();
  if (summaryCategories?.length > 0) {
    const baseRating = event.params.data.rating;
    const variance = 0.5; // Максимальное отклонение от базового рейтинга

    const result = await strapi.query("review.summary-rating").createMany({
      data: summaryCategories.map((category) => {
        // Генерируем рейтинг с небольшим отклонением от общего
        const offset = (Math.random() * 2 - 1) * variance; // от -0.5 до +0.5
        const categoryRating = Math.max(0.5, Math.min(5, baseRating + offset));
        return {
          title: category.label,  // <-- Берется label из review-rating-category
          rating: +categoryRating.toFixed(1),
        };
      }),
    });
    event.params.data.summary = result.ids.map((id) => ({
      id,
      __pivot: { field: "summary", component_type: "review.summary-rating" },
    }));
  }
}
```

Это означает, что:
- При создании нового Review генерируется **общий рейтинг от 1.2 до 2.9**
- Система ищет все **опубликованные** записи в `review-rating-category`
- Для каждой найденной категории создается запись в `summary` с:
  - `title` = `category.label`
  - `rating` = общий рейтинг ± случайное отклонение (±0.5)
- Если категорий нет или они не опубликованы → `title` будет пустым

### Пример распределения рейтингов

Если общий рейтинг = **2.3**, то оценки будут примерно:
- Проходимость прогнозов: **2.5** (2.3 + 0.2)
- Стоимость подписки: **1.9** (2.3 - 0.4)
- Статистика: **2.6** (2.3 + 0.3)
- Коэффициенты: **2.1** (2.3 - 0.2)
- Отзывы игроков в сети: **2.4** (2.3 + 0.1)

Для демонстрации запустите:
```bash
node scripts/test-rating-distribution.js
```

### Для существующих Reviews

Если у вас уже есть Reviews с пустыми labels в оценках, вам нужно:
1. Создать категории (через админ-панель или скрипт)
2. Вручную отредактировать существующие Reviews в админ-панели
3. Заполнить labels в поле "Оценки (summary)"

## Структура данных

### Review Rating Category
```json
{
  "label": "Проходимость прогнозов",
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

### Summary Rating (компонент Review)
```json
{
  "title": "Проходимость прогнозов",
  "rating": 4.5
}
```

## Важные замечания

1. **Категории должны быть опубликованы** - убедитесь, что у каждой категории заполнено поле `publishedAt`
2. **Автозаполнение работает только для новых Reviews** - существующие Reviews нужно редактировать вручную
3. **Labels берутся из `review-rating-category.label`** - именно это поле отображается в списке оценок

## Дополнительная информация

- Schema Review Rating Category: `server/src/api/review-rating-category/content-types/review-rating-category/schema.json`
- Schema Review: `server/src/api/review/content-types/review/schema.json`
- Lifecycles Review: `server/src/api/review/content-types/review/lifecycles.js`
- Компонент Summary Rating: `server/src/components/review/summary-rating.json`


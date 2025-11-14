/**
 * Скрипт для создания базовых Review Rating Categories
 *
 * Запуск: node scripts/seed-rating-categories.js
 *
 * Общий рейтинг генерируется от 1.2 до 2.9
 * Оценки в summary распределяются вокруг общего рейтинга с отклонением ±0.5
 */

const Strapi = require('@strapi/strapi');

// Категории для обзоров
const DEFAULT_CATEGORIES = [
  'Проходимость прогнозов',
  'Стоимость подписки',
  'Статистика',
  'Коэффициенты',
  'Отзывы игроков в сети'
];

async function main() {
  try {
    console.log('Запуск Strapi...');
    const strapi = await Strapi().load();

    console.log('\n--- Создание Review Rating Categories ---\n');

    // Проверяем существующие категории
    const existingCategories = await strapi.query('api::review-rating-category.review-rating-category').findMany();

    if (existingCategories && existingCategories.length > 0) {
      console.log(`⚠ Найдено ${existingCategories.length} существующих категорий:`);
      existingCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.label} (опубликовано: ${cat.publishedAt ? 'Да' : 'Нет'})`);
      });
      console.log('\nХотите продолжить создание новых категорий? (y/n)');
      console.log('Для автоматического создания раскомментируйте код ниже.');
    }

    // Создаем категории
    const createdCategories = [];

    for (const label of DEFAULT_CATEGORIES) {
      // Проверяем, существует ли уже такая категория
      const existing = existingCategories.find(cat => cat.label === label);

      if (existing) {
        console.log(`  ⊘ Категория "${label}" уже существует (ID: ${existing.id})`);

        // Если не опубликована - публикуем
        if (!existing.publishedAt) {
          await strapi.query('api::review-rating-category.review-rating-category').update({
            where: { id: existing.id },
            data: {
              publishedAt: new Date()
            }
          });
          console.log(`    ✓ Опубликована`);
        }

        createdCategories.push(existing);
      } else {
        // Создаем новую категорию
        const newCategory = await strapi.query('api::review-rating-category.review-rating-category').create({
          data: {
            label: label,
            publishedAt: new Date()
          }
        });
        console.log(`  ✓ Создана категория "${label}" (ID: ${newCategory.id})`);
        createdCategories.push(newCategory);
      }
    }

    console.log(`\n✓ Всего категорий: ${createdCategories.length}`);

    console.log('\n--- Завершено ---\n');
    console.log('Теперь при создании нового Review оценки будут автоматически заполняться.');
    console.log('Для существующих Reviews нужно добавить оценки вручную в админ-панели.');

    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

main();


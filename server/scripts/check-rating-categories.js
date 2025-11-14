/**
 * Скрипт для проверки наличия Review Rating Categories
 *
 * Запуск: node scripts/check-rating-categories.js
 */

const Strapi = require('@strapi/strapi');

async function main() {
  try {
    console.log('Запуск Strapi...');
    const strapi = await Strapi().load();

    console.log('\n--- Проверка Review Rating Categories ---\n');

    // Получаем все категории рейтингов
    const categories = await strapi.query('api::review-rating-category.review-rating-category').findMany({
      where: {
        publishedAt: {
          $notNull: true
        }
      }
    });

    if (categories && categories.length > 0) {
      console.log(`✓ Найдено ${categories.length} категорий рейтингов:`);
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.label} (ID: ${cat.id})`);
      });
    } else {
      console.log('✗ Категории рейтингов не найдены!');
      console.log('\nДля решения проблемы:');
      console.log('1. Откройте админ-панель Strapi');
      console.log('2. Перейдите в Content Manager -> Review Rating Category');
      console.log('3. Создайте новые категории с labels, например:');
      console.log('   - Безопасность');
      console.log('   - Комиссии');
      console.log('   - Интерфейс');
      console.log('   - Поддержка');
      console.log('   - Ликвидность');
      console.log('4. Обязательно опубликуйте каждую категорию (кнопка Publish)');
    }

    console.log('\n--- Проверка существующих Reviews ---\n');

    // Получаем несколько reviews для проверки
    const reviews = await strapi.query('api::review.review').findMany({
      limit: 3,
      populate: {
        summary: true
      }
    });

    if (reviews && reviews.length > 0) {
      console.log(`Найдено ${reviews.length} обзоров (показаны первые 3):`);
      reviews.forEach((review, index) => {
        console.log(`\n  ${index + 1}. ${review.title || 'Без названия'} (ID: ${review.id})`);
        if (review.summary && review.summary.length > 0) {
          console.log(`     Оценки (${review.summary.length}):`);
          review.summary.forEach((s, i) => {
            console.log(`       ${i + 1}. ${s.title || '(пусто)'}: ${s.rating}/5`);
          });
        } else {
          console.log('     ✗ Оценки отсутствуют');
        }
      });
    } else {
      console.log('Reviews не найдены');
    }

    console.log('\n--- Завершено ---\n');

    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

main();


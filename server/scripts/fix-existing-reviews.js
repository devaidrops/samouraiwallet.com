/**
 * Скрипт для исправления существующих Reviews с пустыми labels в summary
 *
 * Этот скрипт:
 * 1. Находит все Reviews с пустыми или отсутствующими summary
 * 2. Создает summary на основе Review Rating Categories
 * 3. Если нет общего рейтинга - генерирует от 1.2 до 2.9
 * 4. Распределяет оценки summary вокруг общего рейтинга с отклонением ±0.5
 *
 * Запуск: node scripts/fix-existing-reviews.js
 */

const Strapi = require('@strapi/strapi');

async function main() {
  try {
    console.log('Запуск Strapi...');
    const strapi = await Strapi().load();

    console.log('\n--- Исправление существующих Reviews ---\n');

    // Получаем все категории рейтингов
    const summaryCategories = await strapi
      .query('api::review-rating-category.review-rating-category')
      .findMany({
        where: {
          publishedAt: {
            $notNull: true
          }
        }
      });

    if (!summaryCategories || summaryCategories.length === 0) {
      console.log('✗ Категории рейтингов не найдены!');
      console.log('Сначала создайте категории с помощью:');
      console.log('  node scripts/seed-rating-categories.js');
      await strapi.destroy();
      process.exit(1);
    }

    console.log(`✓ Найдено ${summaryCategories.length} категорий рейтингов:`);
    summaryCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.label}`);
    });

    // Получаем все Reviews
    const reviews = await strapi.query('api::review.review').findMany({
      populate: {
        summary: true
      }
    });

    if (!reviews || reviews.length === 0) {
      console.log('\n✓ Reviews не найдены');
      await strapi.destroy();
      process.exit(0);
    }

    console.log(`\nНайдено ${reviews.length} обзоров`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const review of reviews) {
      const needsUpdate = !review.summary || review.summary.length === 0 ||
                         review.summary.some(s => !s.title || s.title.trim() === '');

      if (needsUpdate) {
        console.log(`\n📝 Обновление: "${review.title || 'Без названия'}" (ID: ${review.id})`);

        // Удаляем старые пустые summary (если есть)
        if (review.summary && review.summary.length > 0) {
          console.log(`  ⊘ Удаление ${review.summary.length} пустых оценок...`);
        }

        // Генерируем или используем существующий общий рейтинг
        let overallRating = review.rating;
        if (!overallRating || overallRating === 0) {
          overallRating = +(Math.random() * (2.9 - 1.2) + 1.2).toFixed(1);
          console.log(`  📊 Установлен общий рейтинг: ${overallRating}/5`);
        } else {
          console.log(`  📊 Текущий общий рейтинг: ${overallRating}/5`);
        }

        // Создаем новые summary на основе категорий с распределением вокруг общего рейтинга
        const variance = 0.5; // Максимальное отклонение от базового рейтинга
        const newSummaryData = summaryCategories.map((category) => {
          // Генерируем рейтинг с небольшим отклонением от общего
          const offset = (Math.random() * 2 - 1) * variance; // от -0.5 до +0.5
          const categoryRating = Math.max(0.5, Math.min(5, overallRating + offset));
          return {
            title: category.label,
            rating: +categoryRating.toFixed(1),
          };
        });

        // Обновляем review
        const updateData = {
          summary: newSummaryData
        };

        // Если не было рейтинга - добавляем
        if (!review.rating || review.rating === 0) {
          updateData.rating = overallRating;
        }

        await strapi.query('api::review.review').update({
          where: { id: review.id },
          data: updateData,
          populate: {
            summary: true
          }
        });

        console.log(`  ✓ Добавлено ${newSummaryData.length} оценок:`);
        newSummaryData.forEach((s, i) => {
          console.log(`    ${i + 1}. ${s.title}: ${s.rating}/5`);
        });

        updatedCount++;
      } else {
        console.log(`\n✓ Пропущено: "${review.title || 'Без названия'}" (ID: ${review.id}) - уже заполнено`);
        skippedCount++;
      }
    }

    console.log('\n--- Результаты ---\n');
    console.log(`✓ Обновлено: ${updatedCount}`);
    console.log(`⊘ Пропущено: ${skippedCount}`);
    console.log(`📊 Всего: ${reviews.length}`);

    console.log('\n--- Завершено ---\n');

    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

main();


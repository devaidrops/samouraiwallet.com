/**
 * Тестовый скрипт для демонстрации распределения рейтингов
 *
 * Показывает как будут распределяться оценки для разных значений общего рейтинга
 *
 * Запуск: node scripts/test-rating-distribution.js
 */

// Функция генерации оценок на основе общего рейтинга
function generateSummaryRatings(overallRating, categoryNames) {
  const variance = 0.5; // Максимальное отклонение от базового рейтинга

  return categoryNames.map((name) => {
    // Генерируем рейтинг с небольшим отклонением от общего
    const offset = (Math.random() * 2 - 1) * variance; // от -0.5 до +0.5
    const categoryRating = Math.max(0.5, Math.min(5, overallRating + offset));
    return {
      name: name,
      rating: +categoryRating.toFixed(1),
    };
  });
}

const categories = [
  'Проходимость прогнозов',
  'Стоимость подписки',
  'Статистика',
  'Коэффициенты',
  'Отзывы игроков в сети'
];

console.log('='.repeat(70));
console.log('ДЕМОНСТРАЦИЯ РАСПРЕДЕЛЕНИЯ РЕЙТИНГОВ');
console.log('='.repeat(70));
console.log('\nОбщий рейтинг генерируется от 1.2 до 2.9');
console.log('Оценки распределяются с отклонением ±0.5\n');

// Демонстрация для минимального значения
console.log('┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Пример 1: Минимальный общий рейтинг                             │');
console.log('└─────────────────────────────────────────────────────────────────┘');
const minRating = 1.2;
console.log(`\nОбщий рейтинг: ${minRating}/5`);
console.log('Оценки:');
generateSummaryRatings(minRating, categories).forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name.padEnd(35)} ${item.rating}/5`);
});

// Демонстрация для среднего значения
console.log('\n┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Пример 2: Средний общий рейтинг                                 │');
console.log('└─────────────────────────────────────────────────────────────────┘');
const avgRating = 2.0;
console.log(`\nОбщий рейтинг: ${avgRating}/5`);
console.log('Оценки:');
generateSummaryRatings(avgRating, categories).forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name.padEnd(35)} ${item.rating}/5`);
});

// Демонстрация для максимального значения
console.log('\n┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Пример 3: Максимальный общий рейтинг                            │');
console.log('└─────────────────────────────────────────────────────────────────┘');
const maxRating = 2.9;
console.log(`\nОбщий рейтинг: ${maxRating}/5`);
console.log('Оценки:');
generateSummaryRatings(maxRating, categories).forEach((item, i) => {
  console.log(`  ${i + 1}. ${item.name.padEnd(35)} ${item.rating}/5`);
});

// Демонстрация статистики
console.log('\n┌─────────────────────────────────────────────────────────────────┐');
console.log('│ Статистика (100 генераций)                                      │');
console.log('└─────────────────────────────────────────────────────────────────┘');

const stats = {
  overallRatings: [],
  categoryRatings: {}
};

// Генерируем 100 примеров
for (let i = 0; i < 100; i++) {
  const overall = +(Math.random() * (2.9 - 1.2) + 1.2).toFixed(1);
  stats.overallRatings.push(overall);

  const summaries = generateSummaryRatings(overall, categories);
  summaries.forEach(item => {
    if (!stats.categoryRatings[item.name]) {
      stats.categoryRatings[item.name] = [];
    }
    stats.categoryRatings[item.name].push(item.rating);
  });
}

// Вычисляем статистику
const avgOverall = (stats.overallRatings.reduce((a, b) => a + b, 0) / stats.overallRatings.length).toFixed(2);
const minOverall = Math.min(...stats.overallRatings).toFixed(1);
const maxOverall = Math.max(...stats.overallRatings).toFixed(1);

console.log(`\nОбщий рейтинг:`);
console.log(`  Средний: ${avgOverall}/5`);
console.log(`  Минимум: ${minOverall}/5`);
console.log(`  Максимум: ${maxOverall}/5`);

console.log(`\nОценки по категориям (средние значения):`);
Object.keys(stats.categoryRatings).forEach((name, i) => {
  const ratings = stats.categoryRatings[name];
  const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
  const min = Math.min(...ratings).toFixed(1);
  const max = Math.max(...ratings).toFixed(1);
  console.log(`  ${i + 1}. ${name.padEnd(35)} ${avg}/5 (${min}-${max})`);
});

console.log('\n' + '='.repeat(70));
console.log('Все рейтинги распределяются естественным образом вокруг общего значения');
console.log('='.repeat(70) + '\n');


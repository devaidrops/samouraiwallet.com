/**
 * Генерирует URL для поста в зависимости от наличия ticker
 * @param {Object} post - объект поста
 * @param {string} post.slug - slug поста
 * @param {string} post.ticker - ticker поста (необязательное поле)
 * @param {Object} post.post_category - категория поста
 * @param {string} post.post_category.slug - slug категории
 * @returns {string} - URL поста
 */
export function getPostUrl(post) {
  if (!post?.post_category?.slug || !post?.slug) {
    return '#';
  }

  // Если у поста есть ticker, ВСЕГДА используем категорию "calculator"
  // независимо от реальной категории поста
  if (post.ticker) {
    return `/calculator/${post.ticker}/${post.slug}`;
  }

  // Если ticker отсутствует, используем реальную категорию поста
  return `/${post.post_category.slug}/${post.slug}`;
}


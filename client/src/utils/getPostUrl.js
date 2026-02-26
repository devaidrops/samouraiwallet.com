/**
 * Генерирует URL для поста
 * - Если slug содержит "/" (например "coins/bitcoin-sv") — URL без категории: /slug
 * - Если slug простой (например "bitcoin-sv") — URL с категорией: /category_slug/slug
 */
export function getPostUrl(post) {
  if (!post?.slug) {
    return '#';
  }
  if (post.slug.includes('/')) {
    return `/${post.slug}`;
  }
  if (!post?.post_category?.slug) {
    return '#';
  }
  return `/${post.post_category.slug}/${post.slug}`;
}


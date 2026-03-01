/**
 * Generates URL for a post
 * - If slug contains "/" (e.g. "coins/bitcoin-sv") — URL without category: /slug
 * - If slug is simple (e.g. "bitcoin-sv") — URL with category: /category_slug/slug
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


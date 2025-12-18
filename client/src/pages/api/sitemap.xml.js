export default async function handler(req, res) {
  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  const SITE_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://cryptoteh.ru";

  const POSTS_PRIORITY = process.env.NEXT_PUBLIC_POSTS_PRIORITY || 0.6;
  const REVIEWS_PRIORITY = process.env.NEXT_PUBLIC_REVIEWS_PRIORITY || 0.8;

  const fetchAllFromStrapi = async (url, hasOriginalFilter) => {
    let allData = [];
    let page = 1;
    const pageSize = 100;
    let totalItems = 0;

    while (true) {
      const response = await fetch(
        `${url}${hasOriginalFilter ? "&" : "?"}pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data from Strapi: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      const data = result?.data || [];
      const metaTotal = result?.meta?.pagination?.total;

      allData = allData.concat(data);

      if (typeof metaTotal === "number") {
        totalItems = metaTotal;
      }

      if (data.length < pageSize) break;
      if (totalItems && allData.length >= totalItems) break;

      page++;
    }

    return allData;
  };

  try {
    const posts = await fetchAllFromStrapi(
      `${STRAPI_URL}/api/posts?filters[post_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
      true
    );

    const reviews = await fetchAllFromStrapi(
      `${STRAPI_URL}/api/reviews?filters[review_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
      true
    );

    let text =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const post of posts) {
      const catSlug = post?.attributes?.post_category?.data?.attributes?.slug;
      const slug = post?.attributes?.slug;
      if (!catSlug || !slug) continue;

      const lastmod = (post.attributes.publishedAt || new Date().toISOString()).toString().split("T")[0];

      text += `\t<url>\n`;
      text += `\t\t<priority>${POSTS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${SITE_URL}/${catSlug}/${slug}/</loc>\n`;
      text += `\t\t<lastmod>${lastmod}</lastmod>\n`;
      text += `\t</url>\n`;
    }

    for (const review of reviews) {
      const catSlug = review?.attributes?.review_category?.data?.attributes?.slug;
      const slug = review?.attributes?.slug;
      if (!catSlug || !slug) continue;

      const lastmod = (review.attributes.publishedAt || new Date().toISOString()).toString().split("T")[0];

      text += `\t<url>\n`;
      text += `\t\t<priority>${REVIEWS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${SITE_URL}/${catSlug}/${slug}/</loc>\n`;
      text += `\t\t<lastmod>${lastmod}</lastmod>\n`;
      text += `\t</url>\n`;
    }

    text += `</urlset>`;

    res.status(200);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.end(text);
  } catch (e) {
    console.error("Sitemap generation error:", e);
    res.status(500);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Sitemap generation error");
  }
}

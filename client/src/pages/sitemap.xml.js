export async function getServerSideProps({ res }) {

  const STRAPI_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://coinexplorers.com";
  const POSTS_PRIORITY = process.env.NEXT_PUBLIC_POSTS_PRIORITY || 0.6;
  const REVIEWS_PRIORITY = process.env.NEXT_PUBLIC_REVIEWS_PRIORITY || 0.8;
  const PAGES_PRIORITY = process.env.NEXT_PUBLIC_PAGES_PRIORITY || 0.5;

  const fetchAllFromStrapi = async (url, hasOriginalFilter) => {
    let allData = [];
    let page = 1;
    const pageSize = 100;
    let totalItems = 0;

    do {
      const response = await fetch(
        `${url}${
          hasOriginalFilter ? "&" : "?"
        }pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch data from Strapi: ${response.statusText}`
        );
      }

      const result = await response.json();

      const data = Array.isArray(result.data) ? result.data : [];
      const total = result?.meta?.pagination?.total;

      if (data.length > 0) {
        allData = [...allData, ...data];
      }
      if (typeof total === "number") {
        totalItems = total;
      }

      if (data.length < pageSize) break;
      if (totalItems > 0 && allData.length >= totalItems) break;

      page++;
    } while (allData.length < totalItems);

    return allData;
  };

  try {
    const [posts, reviews, pagesResult] = await Promise.all([
      fetchAllFromStrapi(
        `${STRAPI_URL}/api/posts?filters[post_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
        true
      ),
      fetchAllFromStrapi(
        `${STRAPI_URL}/api/reviews?filters[review_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
        true
      ),
      fetchAllFromStrapi(`${STRAPI_URL}/api/pages?populate=*&sort[publishedAt]=desc`, false).catch((err) => {
        console.warn("Sitemap: pages fetch failed, omitting pages:", err?.message || err);
        return [];
      }),
    ]);
    const pages = pagesResult || [];

    let text = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    posts.forEach((post) => {
      const cat = post.attributes.post_category?.data?.attributes;
      if (!cat?.slug || !post.attributes.slug) return;
      text += `\t<url>\n`;
      text += `\t\t<priority>${POSTS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${SITE_URL}/${cat.slug}/${post.attributes.slug}/</loc>\n`;
      text += `\t\t<lastmod>${
        (
          post.attributes.publishedAt?.toString() ?? new Date().toISOString()
        ).split("T")[0]
      }</lastmod>\n`;
      text += `\t</url>\n`;
    });

    reviews.forEach((review) => {
      const cat = review.attributes.review_category?.data?.attributes;
      if (!cat?.slug || !review.attributes.slug) return;
      text += `\t<url>\n`;
      text += `\t\t<priority>${REVIEWS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${SITE_URL}/${cat.slug}/${review.attributes.slug}/</loc>\n`;
      text += `\t\t<lastmod>${
        (
          review.attributes.publishedAt?.toString() ?? new Date().toISOString()
        ).split("T")[0]
      }</lastmod>\n`;
      text += `\t</url>\n`;
    });

    pages.forEach((page) => {
      const slug = page.attributes?.slug;
      if (!slug) return;
      text += `\t<url>\n`;
      text += `\t\t<priority>${PAGES_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${SITE_URL}/${slug}/</loc>\n`;
      text += `\t\t<lastmod>${
        (
          page.attributes.publishedAt?.toString() ?? new Date().toISOString()
        ).split("T")[0]
      }</lastmod>\n`;
      text += `\t</url>\n`;
    });

    text += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(text);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error("Sitemap Generation Error:", error?.message || error);
    if (res && !res.writableEnded) {
      res.status(500);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`Sitemap error: ${error?.message || "Unknown error"}`);
    }
    return { props: {} };
  }
}

export default function SitemapXML() {
  return null;
}

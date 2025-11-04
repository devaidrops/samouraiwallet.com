export async function getServerSideProps({ res }) {

    const API_BASE = "http://127.0.0.1:1337";
  const NEXT_PUBLIC_STRAPI_URL =
    API_BASE;
   const NEXT_PUBLIC_STRAPI_URL_S = process.env.NEXT_PUBLIC_APP_URL
  const NEXT_PUBLIC_BASE_URL = API_BASE;
  const NEXT_PUBLIC_POSTS_PRIORITY =
    process.env.NEXT_PUBLIC_POSTS_PRIORITY || 0.6;
  const NEXT_PUBLIC_REVIEWS_PRIORITY =
    process.env.NEXT_PUBLIC_REVIEWS_PRIORITY || 0.8;

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

      if (result.data) {
        allData = [...allData, ...result.data];
        totalItems = result.meta.pagination.total;
      } else {
        break;
      }

      page++;
    } while (allData.length < totalItems);

    return allData;
  };

  try {
    const posts = await fetchAllFromStrapi(
      `${NEXT_PUBLIC_STRAPI_URL}/api/posts?filters[post_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
      true
    );

    const reviews = await fetchAllFromStrapi(
      `${NEXT_PUBLIC_STRAPI_URL}/api/reviews?filters[review_category][$notNull]=true&populate=*&sort[publishedAt]=asc`,
      true
    );

    let text = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    posts.forEach((post) => {
      text += `\t<url>\n`;
      text += `\t\t<priority>${NEXT_PUBLIC_POSTS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${NEXT_PUBLIC_BASE_URL}/${post.attributes.post_category.data.attributes.slug}/${post.attributes.slug}/</loc>\n`;
      text += `\t\t<lastmod>${
        (
          post.attributes.publishedAt?.toString() ?? new Date().toISOString()
        ).split("T")[0]
      }</lastmod>\n`;
      text += `\t</url>\n`;
    });

    reviews.forEach((review) => {
      text += `\t<url>\n`;
      text += `\t\t<priority>${NEXT_PUBLIC_REVIEWS_PRIORITY}</priority>\n`;
      text += `\t\t<loc>${NEXT_PUBLIC_STRAPI_URL_S}/${review.attributes.review_category.data.attributes.slug}/${review.attributes.slug}/</loc>\n`;
      text += `\t\t<lastmod>${
        (
          review.attributes.publishedAt?.toString() ?? new Date().toISOString()
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
    console.error("Sitemap Generation Error:", error);
    return { props: {} };
  }
}

export default function SitemapXML() {
  return null;
}

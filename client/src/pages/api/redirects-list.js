/**
 * Возвращает список редиректов из Strapi для использования в middleware.
 * Вызывается только с того же origin (Next.js server).
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  const apiUrl =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "http://127.0.0.1:1337";
  try {
    const response = await fetch(
      `${apiUrl}/api/redirects?pagination[pageSize]=1000`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) {
      return res.status(response.status).json({ data: [] });
    }
    const data = await response.json();
    const list = Array.isArray(data.data) ? data.data : [];
    const items = list.map((r) => ({
      from: (r.attributes?.from ?? "").trim().replace(/^(?!\/)/, "/"),
      to: (r.attributes?.to ?? "").trim(),
    }));
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({ data: items });
  } catch (e) {
    return res.status(500).json({ data: [] });
  }
}
